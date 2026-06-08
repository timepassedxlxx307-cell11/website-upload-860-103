(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.getElementById("menuToggle");
    var nav = document.getElementById("siteNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.getElementById("heroSlider");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function pause() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        pause();
        show(current - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        pause();
        show(current + 1);
        play();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        pause();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    hero.addEventListener("mouseenter", pause);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function initGlobalSearch() {
    var form = document.querySelector("[data-global-search-form]");
    var input = document.getElementById("globalSearchInput");
    var results = document.getElementById("globalSearchResults");
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!form || !input || !results || !data.length) {
      return;
    }

    function render(query) {
      var value = query.trim().toLowerCase();
      if (!value) {
        results.innerHTML = "";
        results.classList.remove("is-visible");
        return;
      }
      var matches = data.filter(function (movie) {
        return movie.search.indexOf(value) !== -1;
      }).slice(0, 24);
      if (!matches.length) {
        results.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
        results.classList.add("is-visible");
        return;
      }
      results.innerHTML = matches.map(function (movie) {
        return '<a class="search-result-card" href="' + escapeHTML(movie.url) + '">' +
          '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '">' +
          '<span><strong>' + escapeHTML(movie.title) + '</strong>' +
          '<em>' + escapeHTML(movie.type) + ' · ' + escapeHTML(movie.year) + ' · ' + escapeHTML(movie.region) + '</em>' +
          '<small>' + escapeHTML(movie.oneLine) + '</small></span></a>';
      }).join("");
      results.classList.add("is-visible");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  function initCardFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var reset = panel.querySelector("[data-filter-reset]");
      var grid = document.querySelector("[data-filter-grid]");
      var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")) : [];
      var selectedType = "";
      var selectedYear = "";
      if (!grid || !cards.length) {
        return;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var year = card.getAttribute("data-year") || "";
          var ok = true;
          if (query && text.indexOf(query) === -1) {
            ok = false;
          }
          if (selectedType && type !== selectedType) {
            ok = false;
          }
          if (selectedYear && year !== selectedYear) {
            ok = false;
          }
          card.classList.toggle("is-filtered-out", !ok);
        });
      }

      panel.addEventListener("click", function (event) {
        var typeButton = event.target.closest("[data-filter-type]");
        var yearButton = event.target.closest("[data-filter-year]");
        if (typeButton) {
          selectedType = typeButton.getAttribute("data-filter-type") || "";
          panel.querySelectorAll("[data-filter-type]").forEach(function (button) {
            button.classList.toggle("is-active", button === typeButton);
          });
          apply();
        }
        if (yearButton) {
          selectedYear = yearButton.getAttribute("data-filter-year") || "";
          panel.querySelectorAll("[data-filter-year]").forEach(function (button) {
            button.classList.toggle("is-active", button === yearButton);
          });
          apply();
        }
      });
      if (input) {
        input.addEventListener("input", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          selectedType = "";
          selectedYear = "";
          if (input) {
            input.value = "";
          }
          panel.querySelectorAll("[data-filter-type], [data-filter-year]").forEach(function (button) {
            var emptyType = button.hasAttribute("data-filter-type") && !button.getAttribute("data-filter-type");
            var emptyYear = button.hasAttribute("data-filter-year") && !button.getAttribute("data-filter-year");
            button.classList.toggle("is-active", emptyType || emptyYear);
          });
          apply();
        });
      }
    });
  }

  window.initMoviePlayer = function (videoId, buttonId, coverId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var hls = null;
    var attached = false;
    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function start() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }
    if (cover) {
      cover.addEventListener("click", function () {
        start();
      });
    }
    video.addEventListener("play", function () {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initCardFilters();
  });
})();
