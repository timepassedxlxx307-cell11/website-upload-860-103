(function() {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function() {
      document.body.classList.toggle("nav-open");
    });
    all("a", nav).forEach(function(link) {
      link.addEventListener("click", function() {
        document.body.classList.remove("nav-open");
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = all("[data-hero-slide]", carousel);
    var dots = all("[data-hero-dot]", carousel);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearchAndFilters() {
    var scopes = [];
    all("[data-filter-scope]").forEach(function(scope) {
      scopes.push(scope.parentElement || document);
    });
    if (!scopes.length && document.querySelector("[data-search-input]")) {
      scopes.push(document);
    }

    scopes.forEach(function(scope) {
      var input = scope.querySelector("[data-search-input]") || document.querySelector("[data-search-input]");
      var cards = all("[data-search-card]", scope);
      var buttons = all("[data-filter-value]", scope);
      var activeFilter = "all";

      function apply() {
        var keyword = normalize(input ? input.value : "");
        cards.forEach(function(card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var genre = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
          var matchedText = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedFilter = activeFilter === "all" || genre.indexOf(normalize(activeFilter)) !== -1;
          card.classList.toggle("is-filtered-out", !(matchedText && matchedFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function(button) {
        button.addEventListener("click", function() {
          activeFilter = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function(item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });
    });
  }

  window.initMoviePlayer = function(videoId, coverId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var startButton = document.getElementById(buttonId);
    var loaded = false;

    if (!video || !cover || !sourceUrl) {
      return;
    }

    function bindSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function play() {
      bindSource();
      cover.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {
          video.controls = true;
        });
      }
    }

    cover.addEventListener("click", play);
    if (startButton) {
      startButton.addEventListener("click", function(event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function() {
      if (!loaded) {
        play();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function() {
    setupMobileNav();
    setupHero();
    setupSearchAndFilters();
  });
})();
