import { movies } from "./search-data.js";

var form = document.querySelector('[data-page-search-form]');
var input = document.getElementById('search-input');
var results = document.getElementById('search-results');
var title = document.getElementById('search-title');
var summary = document.getElementById('search-summary');
var params = new URLSearchParams(window.location.search);
var initial = params.get('q') || '';

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char];
    });
}

function card(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span class="tag-pill">' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
        '<a class="movie-cover" href="' + escapeHtml(movie.url) + '">' +
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '<span class="movie-badge">' + escapeHtml(movie.year || movie.type) + '</span>' +
        '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
        '<div class="movie-meta-line">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.genre) + '</div>' +
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
        '<div class="movie-tags">' + tags + '</div>' +
        '</div>' +
        '</article>';
}

function render(query) {
    var q = query.trim().toLowerCase();
    var list = movies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        return !q || text.indexOf(q) !== -1;
    }).slice(0, 160);
    if (title) {
        title.textContent = q ? '“' + query.trim() + '”的搜索结果' : '推荐影片';
    }
    if (summary) {
        summary.textContent = list.length ? '点击影片卡片即可进入详情页播放。' : '没有找到匹配内容，可以更换关键词继续搜索。';
    }
    if (results) {
        results.innerHTML = list.map(card).join('');
    }
}

if (input) {
    input.value = initial;
}

if (form) {
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value : '';
        var url = value.trim() ? 'search.html?q=' + encodeURIComponent(value.trim()) : 'search.html';
        window.history.replaceState(null, '', url);
        render(value);
    });
}

render(initial);
