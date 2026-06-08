(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;

  function setSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    activeSlide = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === activeSlide);
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  var localSearch = document.querySelector('[data-card-search]');
  var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  if (localSearch && localCards.length) {
    localSearch.addEventListener('input', function () {
      var query = localSearch.value.trim().toLowerCase();
      localCards.forEach(function (card) {
        var text = card.getAttribute('data-search-text') || '';
        card.style.display = text.toLowerCase().indexOf(query) >= 0 ? '' : 'none';
      });
    });
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var trigger = box.querySelector('[data-play]');

    function loadAndPlay() {
      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      function playVideo() {
        box.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      }

      if (video.getAttribute('data-ready') === '1') {
        playVideo();
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        playVideo();
        return;
      }

      import('./hls-vendor-bbsaiqh1.js')
        .then(function (module) {
          var Hls = module.H;
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._siteHls = hls;
            hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
          } else {
            video.src = stream;
            playVideo();
          }
        })
        .catch(function () {
          video.src = stream;
          playVideo();
        });
    }

    if (trigger) {
      trigger.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
    }
  });

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SITE_MOVIE_INDEX) {
    var keywordInput = document.querySelector('[data-search-keyword]');
    var typeSelect = document.querySelector('[data-search-type]');
    var yearSelect = document.querySelector('[data-search-year]');
    var resultBox = document.querySelector('[data-search-results]');

    function cleanText(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function renderCard(movie) {
      return '' +
        '<article class="movie-card" data-movie-card data-search-text="' + cleanText(movie.title + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.region) + '">' +
          '<a class="movie-cover" href="' + cleanText(movie.url) + '" style="--cover-image: url(\'' + cleanText(movie.cover) + '\');">' +
            '<span class="badge-row">' +
              '<span class="badge">' + cleanText(movie.year) + '</span>' +
              '<span class="badge">' + cleanText(movie.type) + '</span>' +
            '</span>' +
          '</a>' +
          '<div class="movie-body">' +
            '<a class="movie-title" href="' + cleanText(movie.url) + '">' + cleanText(movie.title) + '</a>' +
            '<div class="card-meta">' + cleanText(movie.region) + ' · ' + cleanText(movie.genre) + '</div>' +
            '<p class="movie-summary">' + cleanText(movie.oneLine) + '</p>' +
            '<div class="card-footer">' +
              '<span class="rating">' + cleanText(movie.rating) + '</span>' +
              '<a class="btn btn-light" href="' + cleanText(movie.url) + '">查看详情</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    }

    function doSearch() {
      var keyword = (keywordInput ? keywordInput.value.trim().toLowerCase() : '');
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var matches = window.SITE_MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return (!keyword || haystack.indexOf(keyword) >= 0) && (!type || movie.type === type) && (!year || movie.year === year);
      }).slice(0, 120);
      resultBox.innerHTML = matches.map(renderCard).join('');
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', doSearch);
        control.addEventListener('change', doSearch);
      }
    });
  }
})();
