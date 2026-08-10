/* =========================================================
   Publications 렌더링 스크립트
   ---------------------------------------------------------
   ※ 논문을 추가·수정할 때 이 파일은 건드릴 필요가 없습니다.
      내용은 publications-data.js 에서만 관리하세요.
      (admin.html 편집기의 [Publications] 탭 권장)
   ========================================================= */

(function () {
    "use strict";

    var DEFAULT_COLOR = "#1a4fb3";   // 학술지 기본 글자색 (파랑)

    function items() {
        return (typeof PUBLICATIONS !== "undefined" && Array.isArray(PUBLICATIONS)) ? PUBLICATIONS : [];
    }

    function esc(v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    /* 주소를 비워두면 제목으로 구글 학술검색을 연다 */
    function linkOf(p) {
        if (p.link) return p.link;
        return "https://scholar.google.com/scholar?q=" +
               encodeURIComponent(String(p.title || "")).replace(/%20/g, "+");
    }

    /* 연도별로 묶기 (연도는 큰 것부터, 같은 연도 안에서는 적어 넣은 순서 그대로) */
    function groupByYear(list) {
        var order = [];
        var map = {};

        list.forEach(function (p) {
            var y = String(p.year || "").trim() || "연도 미상";
            if (!map[y]) { map[y] = []; order.push(y); }
            map[y].push(p);
        });

        order.sort(function (a, b) {
            var na = parseInt(a, 10), nb = parseInt(b, 10);
            if (isNaN(na) && isNaN(nb)) return 0;
            if (isNaN(na)) return 1;      // 연도 미상은 맨 아래
            if (isNaN(nb)) return -1;
            return nb - na;
        });

        return order.map(function (y) { return { year: y, list: map[y] }; });
    }

    function itemHTML(p, no) {
        var color = String(p.color || "").trim() || DEFAULT_COLOR;
        var venue = p.venue
            ? '<span class="pub-venue' + (p.bold ? " strong" : "") + '" style="color:' + esc(color) + '">' +
                  esc(p.venue) + "</span>"
            : "";

        return '' +
            "<li>" +
                '<a class="pub-item" href="' + esc(linkOf(p)) + '" target="_blank" rel="noopener noreferrer">' +
                    '<span class="pub-no">' + no + "</span>" +
                    '<span class="pub-body">' +
                        '<span class="pub-title">' + esc(p.title) + "</span>" +
                        venue +
                    "</span>" +
                "</a>" +
            "</li>";
    }

    window.renderPublications = function (elementId) {
        var box = document.getElementById(elementId);
        if (!box) return;

        var list = items();

        if (list.length === 0) {
            box.innerHTML = '<p class="pub-empty">등록된 논문이 없습니다.</p>';
            return;
        }

        var groups = groupByYear(list);
        var no = list.length;             // 원래 목록처럼 큰 번호부터 매긴다

        var nav = groups.map(function (g) {
            return '<a href="#pub-' + esc(g.year) + '">' + esc(g.year) + "</a>";
        }).join("");

        var sections = groups.map(function (g) {
            var rows = g.list.map(function (p) { return itemHTML(p, no--); }).join("");
            return '' +
                '<section class="pub-year" id="pub-' + esc(g.year) + '">' +
                    '<h3 class="pub-year-title">' +
                        '<span class="y">' + esc(g.year) + "</span>" +
                        '<span class="n">' + g.list.length + "편</span>" +
                    "</h3>" +
                    '<ul class="pub-items">' + rows + "</ul>" +
                "</section>";
        }).join("");

        box.innerHTML = '' +
            '<div class="pub-head">' +
                '<p class="pub-total">모두 <strong>' + list.length + "</strong>편 · " +
                    esc(groups[groups.length - 1].year) + "–" + esc(groups[0].year) + "</p>" +
                '<nav class="pub-years">' + nav + "</nav>" +
            "</div>" +
            sections;
    };
})();
