(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
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
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        play();
    }

    function initLocalFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
            var input = scope.querySelector("[data-local-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            if (!input || !cards.length) {
                return;
            }
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag-chip">' + escapeHTML(tag) + '</span>';
        }).join("");
        return '<a class="movie-card" href="' + escapeHTML(movie.url) + '">' +
            '<span class="poster-wrap"><img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy"><span class="poster-mask"><span class="play-icon">▶</span></span></span>' +
            '<span class="movie-card-body"><strong class="movie-title">' + escapeHTML(movie.title) + '</strong>' +
            '<span class="movie-desc">' + escapeHTML(movie.oneLine) + '</span>' +
            '<span class="movie-meta"><em>' + escapeHTML(movie.type) + '</em><em>' + escapeHTML(movie.year) + '</em><em>' + escapeHTML(movie.region) + '</em></span>' +
            '<span class="tag-row">' + tags + '</span></span></a>';
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.SITE_MOVIES) {
            return;
        }
        var form = page.querySelector("[data-search-form]");
        var input = page.querySelector("[data-search-input]");
        var region = page.querySelector("[data-search-region]");
        var type = page.querySelector("[data-search-type]");
        var results = page.querySelector("[data-search-results]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var regionValue = region.value;
            var typeValue = type.value;
            var filtered = window.SITE_MOVIES.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.category, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var regionMatch = !regionValue || movie.region === regionValue;
                var typeMatch = !typeValue || movie.type === typeValue;
                return keywordMatch && regionMatch && typeMatch;
            }).slice(0, 80);
            results.innerHTML = filtered.map(movieCard).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        input.addEventListener("input", render);
        region.addEventListener("change", render);
        type.addEventListener("change", render);
        render();
    }

    function initBackTop() {
        Array.prototype.slice.call(document.querySelectorAll("[data-back-top]")).forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initLocalFilters();
        initSearchPage();
        initBackTop();
    });

    window.initMoviePlayer = function (videoId, layerId, buttonId, source) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var button = document.getElementById(buttonId);
        var started = false;
        var hls;
        if (!video || !layer || !source) {
            return;
        }

        function attach() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function start() {
            attach();
            layer.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    layer.classList.remove("is-hidden");
                });
            }
        }

        layer.addEventListener("click", start);
        if (button) {
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
