(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function toggleHidden(element) {
    if (element) {
      element.hidden = !element.hidden;
    }
  }

  function initHeader() {
    var searchToggle = $('[data-search-toggle]');
    var searchPanel = $('[data-search-panel]');
    var menuToggle = $('[data-menu-toggle]');
    var mobileMenu = $('[data-mobile-menu]');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        toggleHidden(searchPanel);
        var input = searchPanel.querySelector('input');
        if (input && !searchPanel.hidden) {
          input.focus();
        }
      });
    }

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function () {
        toggleHidden(mobileMenu);
      });
    }
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var index = 0;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  }

  function collectOptions(cards, key, select) {
    if (!select) {
      return;
    }

    var values = cards.map(function (card) {
      return card.getAttribute(key) || '';
    }).filter(Boolean);

    var unique = Array.from(new Set(values)).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });

    unique.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var cards = $all('[data-card]');
    if (!cards.length) {
      return;
    }

    var searchInput = $('[data-local-search]');
    var typeSelect = $('[data-filter-type]');
    var regionSelect = $('[data-filter-region]');
    var yearSelect = $('[data-filter-year]');

    collectOptions(cards, 'data-type', typeSelect);
    collectOptions(cards, 'data-region', regionSelect);
    collectOptions(cards, 'data-year', yearSelect);

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial && searchInput) {
      searchInput.value = initial;
    }

    function apply() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();

        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          ok = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          ok = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function initPlayer() {
    var video = $('[data-player]');
    var data = $('#player-data');
    if (!video || !data) {
      return;
    }

    var overlay = $('[data-player-overlay]');
    var button = $('[data-player-button]');
    var config;

    try {
      config = JSON.parse(data.textContent || '{}');
    } catch (error) {
      config = {};
    }

    var playSrc = config.src;
    var ready = false;

    function prepare() {
      if (ready || !playSrc) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playSrc;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(playSrc);
        hls.attachMedia(video);
      } else {
        video.src = playSrc;
      }
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.hidden = true;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initHero();
    initFilters();
    initPlayer();
  });
})();
