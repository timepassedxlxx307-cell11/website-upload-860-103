(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && input.value.trim()) {
                form.action = form.getAttribute('action').split('?')[0] + '?q=' + encodeURIComponent(input.value.trim());
            }
        });
    });

    document.querySelectorAll('[data-local-filter]').forEach(function (bar) {
        var keyword = bar.querySelector('[data-filter-keyword]');
        var year = bar.querySelector('[data-filter-year]');
        var type = bar.querySelector('[data-filter-type]');
        var section = bar.closest('section');
        var cards = section ? Array.prototype.slice.call(section.querySelectorAll('[data-card]')) : [];

        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.innerText].join(' ').toLowerCase();
                var okKeyword = !q || text.indexOf(q) !== -1;
                var okYear = !y || card.dataset.year === y;
                var okType = !t || card.dataset.type === t;
                card.hidden = !(okKeyword && okYear && okType);
            });
        }

        [keyword, year, type].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
    });
})();
