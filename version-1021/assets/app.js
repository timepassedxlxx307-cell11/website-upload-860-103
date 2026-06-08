const Hls = window.Hls;

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => (value || '').toString().trim().toLowerCase();

function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) {
    return;
  }
  toggle.addEventListener('click', () => {
    links.classList.toggle('is-open');
  });
}

function setupHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) {
    return;
  }
  let current = 0;
  let timer = null;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === current);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === current);
    });
  };
  const play = () => {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 5200);
  };
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      show(idx);
      play();
    });
  });
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', play);
  show(0);
  play();
}

function setupFilters() {
  const inputs = Array.from(document.querySelectorAll('[data-filter-input]'));
  const selects = Array.from(document.querySelectorAll('[data-type-filter]'));
  const scopes = Array.from(document.querySelectorAll('.filter-scope'));
  if (!inputs.length || !scopes.length) {
    return;
  }
  const apply = () => {
    const query = normalize(inputs.map((input) => input.value).find(Boolean));
    const selected = normalize(selects.map((select) => select.value).find(Boolean));
    scopes.forEach((scope) => {
      const items = Array.from(scope.querySelectorAll('[data-title]'));
      items.forEach((item) => {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.type,
          item.dataset.genre,
          item.dataset.year,
          item.dataset.region
        ].join(' '));
        const typeText = normalize(item.dataset.type + ' ' + item.dataset.genre);
        const matchQuery = !query || haystack.includes(query);
        const matchType = !selected || typeText.includes(selected);
        item.classList.toggle('is-filter-hidden', !(matchQuery && matchType));
      });
    });
  };
  inputs.forEach((input) => input.addEventListener('input', apply));
  selects.forEach((select) => select.addEventListener('change', apply));
  apply();
}

function attachStream(video) {
  if (!video || video.dataset.ready === 'true') {
    return;
  }
  const source = video.dataset.src;
  if (!source) {
    return;
  }
  video.dataset.ready = 'true';
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }
  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
    video.hlsInstance = hls;
    return;
  }
  video.src = source;
}

function setupPlayers() {
  const videos = Array.from(document.querySelectorAll('video[data-src]'));
  videos.forEach((video) => {
    const overlay = document.querySelector(`[data-video-target="${video.id}"]`);
    const start = () => {
      attachStream(video);
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };
    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
}

ready(() => {
  setupNavigation();
  setupHero();
  setupFilters();
  setupPlayers();
});
