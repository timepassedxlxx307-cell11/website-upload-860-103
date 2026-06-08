(function () {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobileMenu.hasAttribute('hidden');
      if (isHidden) {
        mobileMenu.removeAttribute('hidden');
      } else {
        mobileMenu.setAttribute('hidden', '');
      }
      menuButton.setAttribute('aria-expanded', String(isHidden));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function resetHeroTimer() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }
    startHeroTimer();
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide-target')) || 0);
      resetHeroTimer();
    });
  });

  var previousButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      resetHeroTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      resetHeroTimer();
    });
  }

  showSlide(0);
  startHeroTimer();

  var filterInput = document.querySelector('.page-filter-input');
  var yearFilter = document.querySelector('.page-year-filter');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('.filter-grid .movie-card'));

  function applyPageFilter() {
    var text = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    filterCards.forEach(function (card) {
      var cardText = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
      var yearMatched = !year || card.getAttribute('data-year') === year;
      var textMatched = !text || cardText.indexOf(text) !== -1;
      card.classList.toggle('is-filter-hidden', !(yearMatched && textMatched));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyPageFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyPageFilter);
  }

  var searchInput = document.getElementById('search-page-input');
  var searchResults = document.getElementById('search-results');
  var searchTitle = document.getElementById('search-result-title');

  function createSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '    <img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + ' 在线观看" loading="lazy">',
      '    <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-card-title" href="' + movie.href + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</p>',
      '    <p class="movie-card-text">' + escapeHtml(truncateText(movie.oneLine || movie.summary, 94)) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function renderSearch(query) {
    if (!searchResults || !Array.isArray(window.SEARCH_DATA)) {
      return;
    }
    var normalizedQuery = (query || '').trim().toLowerCase();
    var results = window.SEARCH_DATA;
    if (normalizedQuery) {
      results = window.SEARCH_DATA.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.summary].join(' ').toLowerCase();
        return haystack.indexOf(normalizedQuery) !== -1;
      });
    }
    var limited = results.slice(0, 80);
    if (searchTitle) {
      searchTitle.textContent = normalizedQuery ? '搜索结果' : '热播内容';
    }
    searchResults.innerHTML = limited.map(createSearchCard).join('');
  }

  if (searchInput && searchResults) {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    searchInput.value = query;
    renderSearch(query);
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function truncateText(value, length) {
    value = String(value || '');
    if (value.length <= length) {
      return value;
    }
    return value.slice(0, length - 1) + '…';
  }

  var playerDataTag = document.getElementById('movie-player-data');
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('player-overlay');

  if (playerDataTag && video && overlay) {
    var playerData = null;
    var playerReady = false;
    var hlsInstance = null;

    try {
      playerData = JSON.parse(playerDataTag.textContent || '{}');
    } catch (error) {
      playerData = null;
    }

    function attachSource() {
      if (!playerData || !playerData.src || playerReady) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playerData.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(playerData.src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else {
        video.src = playerData.src;
      }
      video.setAttribute('controls', 'controls');
      playerReady = true;
    }

    function playMovie() {
      attachSource();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playMovie);
    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
