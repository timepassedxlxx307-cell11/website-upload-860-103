(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterAreas = Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]'));
  filterAreas.forEach(function (area) {
    var section = area.closest('.section-shell') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
    var input = area.querySelector('[data-search-input]');
    var filters = Array.prototype.slice.call(area.querySelectorAll('[data-filter]'));
    var empty = section.querySelector('[data-empty-state]');

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var ok = !query || text.indexOf(query) !== -1;

        filters.forEach(function (select) {
          var key = select.getAttribute('data-filter');
          var value = select.value;
          if (value && card.getAttribute('data-' + key) !== value) {
            ok = false;
          }
        });

        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    filters.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  });
})();

function initMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hlsInstance = null;
  var ready = false;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function attachStream() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }

    video.src = streamUrl;
    ready = true;
  }

  function playMovie() {
    attachStream();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  overlay.addEventListener('click', playMovie);
  video.addEventListener('click', function () {
    if (video.paused) {
      playMovie();
    }
  });
  video.addEventListener('ended', function () {
    if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
      hlsInstance.stopLoad();
    }
  });
}
