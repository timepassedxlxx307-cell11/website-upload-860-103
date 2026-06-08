(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return (text || "").toString().trim().toLowerCase();
  }

  function escapeText(text) {
    return (text || "").toString().replace(/[&<>\"']/g, function(character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  ready(function() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function() {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".site-search").forEach(function(form) {
      form.addEventListener("submit", function(event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
          slide.setAttribute("aria-hidden", slideIndex === active ? "false" : "true");
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(active + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function(dot, index) {
        dot.addEventListener("click", function() {
          show(index);
          start();
        });
      });

      prev && prev.addEventListener("click", function() {
        show(active - 1);
        start();
      });

      next && next.addEventListener("click", function() {
        show(active + 1);
        start();
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-input]").forEach(function(input) {
      var target = document.querySelector(input.getAttribute("data-filter-input"));
      var count = document.querySelector("[data-filter-count]");
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
      function apply() {
        var query = normalize(input.value);
        var visible = 0;
        cards.forEach(function(card) {
          var text = normalize(card.getAttribute("data-keywords") + " " + card.textContent);
          var match = !query || text.indexOf(query) !== -1;
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + " 部影片";
        }
      }
      input.addEventListener("input", apply);
      apply();
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      var input = searchPage.querySelector("input[name='q']");
      var results = searchPage.querySelector("[data-search-results]");
      var title = searchPage.querySelector("[data-search-title]");
      if (input) {
        input.value = query;
      }

      function card(item) {
        var titleText = escapeText(item.title);
        var urlText = escapeText(item.url);
        var coverText = escapeText(item.cover);
        var descriptionText = escapeText(item.description);
        var yearText = escapeText(item.year);
        var regionText = escapeText(item.region);
        var categoryText = escapeText(item.category);
        var durationText = escapeText(item.duration);
        return "<article class=\"movie-card\" data-card>" +
          "<a class=\"movie-poster\" href=\"" + urlText + "\">" +
          "<img src=\"" + coverText + "\" alt=\"" + titleText + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"poster-play\">▶</span>" +
          "<span class=\"poster-duration\">" + durationText + "</span>" +
          "</a>" +
          "<div class=\"movie-card-body\">" +
          "<h2><a href=\"" + urlText + "\">" + titleText + "</a></h2>" +
          "<p class=\"movie-card-desc\">" + descriptionText + "</p>" +
          "<div class=\"movie-meta\"><span>" + yearText + "</span><span>" + regionText + "</span><span>" + categoryText + "</span></div>" +
          "</div>" +
          "</article>";
      }

      function search(value) {
        var q = normalize(value);
        var matched = window.SEARCH_INDEX.filter(function(item) {
          var text = normalize(item.title + " " + item.description + " " + item.summary + " " + item.tags + " " + item.region + " " + item.category + " " + item.year);
          return !q || text.indexOf(q) !== -1;
        }).slice(0, 120);
        if (title) {
          title.textContent = q ? "搜索结果：" + value : "搜索影片";
        }
        if (!results) {
          return;
        }
        if (!matched.length) {
          results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片</div>";
          return;
        }
        results.innerHTML = matched.map(card).join("");
      }

      input && input.addEventListener("input", function() {
        search(input.value);
      });
      search(query);
    }
  });
})();
