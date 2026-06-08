import { H as Hls } from "./hls-dru42stk.js";

export function bootPlayer(source) {
    var holder = document.querySelector('[data-video-box]');
    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');
    var hls = null;
    var ready = false;
    var requested = false;

    if (!video || !source) {
        return;
    }

    function tryPlay() {
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    function attach() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (requested) {
                    tryPlay();
                }
            });
        } else {
            video.src = source;
        }
    }

    function play() {
        requested = true;
        attach();
        if (holder) {
            holder.classList.add('is-playing');
        }
        tryPlay();
    }

    if (button) {
        button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        if (holder) {
            holder.classList.add('is-playing');
        }
    });
    video.addEventListener('ended', function () {
        if (holder) {
            holder.classList.remove('is-playing');
        }
    });
}
