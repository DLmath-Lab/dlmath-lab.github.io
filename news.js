/* =========================================================
   News 렌더링 스크립트
   ---------------------------------------------------------
   ※ 소식을 추가·수정할 때 이 파일은 건드릴 필요가 없습니다.
      내용은 news-data.js 에서만 관리하세요.

   - renderNewsList(요소id, 개수)  : 목록 그리기 (개수 생략 시 전체)
   - renderNewsPost()              : ?id= 로 지정된 글 하나 그리기
   ========================================================= */

(function () {
    "use strict";

    function items() {
        return (typeof NEWS_ITEMS !== "undefined" && Array.isArray(NEWS_ITEMS)) ? NEWS_ITEMS : [];
    }

    /* 최신순(날짜 내림차순) 정렬. 날짜가 같으면 배열에 적은 순서를 유지 */
    function sorted() {
        return items()
            .map(function (item, i) { return { item: item, i: i }; })
            .sort(function (a, b) {
                var d = String(b.item.date || "").localeCompare(String(a.item.date || ""));
                return d !== 0 ? d : a.i - b.i;
            })
            .map(function (w) { return w.item; });
    }

    /* HTML 특수문자 이스케이프 (제목·요약 등 텍스트 값 전용) */
    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /* "2026-08-08" -> "2026. 08. 08." (형식이 다르면 원본 그대로) */
    function formatDate(value) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
        return m ? m[1] + ". " + m[2] + ". " + m[3] + "." : String(value || "");
    }

    function cardHTML(item) {
        return '' +
            '<a class="news-card" href="news-post.html?id=' + encodeURIComponent(item.id) + '">' +
                '<span class="news-date">' + esc(formatDate(item.date)) + '</span>' +
                '<span class="news-title">' + esc(item.title) + '</span>' +
                (item.summary ? '<p class="news-summary">' + esc(item.summary) + '</p>' : '') +
            '</a>';
    }

    /* ---------- 목록 (index.html, news.html) ---------- */
    window.renderNewsList = function (elementId, limit) {
        var box = document.getElementById(elementId);
        if (!box) return;

        var list = sorted();
        if (typeof limit === "number" && limit > 0) list = list.slice(0, limit);

        if (list.length === 0) {
            box.innerHTML = '<p class="news-empty">등록된 소식이 없습니다.</p>';
            return;
        }
        box.innerHTML = list.map(cardHTML).join("");
    };

    /* ---------- 상세 (news-post.html) ---------- */
    window.renderNewsPost = function () {
        var box = document.getElementById("news-post");
        if (!box) return;

        var id = new URLSearchParams(window.location.search).get("id");
        var post = items().filter(function (n) { return String(n.id) === String(id); })[0];

        if (!post) {
            document.title = "DLmath Lab - News";
            box.innerHTML =
                '<p class="news-empty">요청하신 글을 찾을 수 없습니다.</p>' +
                '<p style="text-align:center;"><a class="news-back" href="news.html">← News 목록으로</a></p>';
            return;
        }

        document.title = "DLmath Lab - " + post.title;

        box.innerHTML = '' +
            '<p class="news-post-date">' + esc(formatDate(post.date)) + '</p>' +
            '<h2>' + esc(post.title) + '</h2>' +
            (post.image ? '<img class="news-post-image" src="' + esc(post.image) + '" alt="' + esc(post.title) + '">' : '') +
            '<div class="news-post-body">' + (post.body || '') + '</div>' +
            '<a class="news-back" href="news.html">← News 목록으로</a>';
    };
})();
