/* =========================================================
   People 렌더링 스크립트
   ---------------------------------------------------------
   ※ 구성원을 추가·수정할 때 이 파일은 건드릴 필요가 없습니다.
      내용은 people-data.js 에서만 관리하세요 (admin.html 권장).
   ========================================================= */

(function () {
    "use strict";

    function groups() {
        return (typeof PEOPLE_GROUPS !== "undefined" && Array.isArray(PEOPLE_GROUPS)) ? PEOPLE_GROUPS : [];
    }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    /* 카드에 표시할 항목과 순서 */
    var FIELDS = [
        { key: "degree",    label: "Degree" },
        { key: "current",   label: "Current" },
        { key: "email",     label: "Email" },
        { key: "interests", label: "Research Interests" },
        { key: "homepage",  label: "Homepage", link: true }
    ];

    function memberHTML(m) {
        var rows = "";

        if (m.role) {
            rows += '<p class="role">' + esc(m.role) + "</p>";
        }

        FIELDS.forEach(function (f) {
            var v = m[f.key];
            if (!v) return; // 비어 있는 항목은 아예 그리지 않는다

            var value = f.link
                ? '<a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer">' +
                      esc(String(v).replace(/^https?:\/\//, "")) + "</a>"
                : esc(v);

            rows += "<p><strong>" + esc(f.label) + "</strong>" + value + "</p>";
        });

        return '' +
            '<div class="member-card">' +
                '<div class="member-info">' +
                    "<h4>" + esc(m.name) + "</h4>" +
                    rows +
                "</div>" +
            "</div>";
    }

    function groupHTML(g) {
        var members = Array.isArray(g.members) ? g.members : [];
        return '' +
            '<div class="member-group">' +
                '<h3 class="group-title">' + esc(g.title) + "</h3>" +
                '<div class="member-grid">' + members.map(memberHTML).join("") + "</div>" +
            "</div>";
    }

    window.renderPeople = function (elementId) {
        var box = document.getElementById(elementId);
        if (!box) return;

        var list = groups().filter(function (g) {
            return g && g.title; // 이름 없는 그룹은 건너뜀
        });

        if (list.length === 0) {
            box.innerHTML = '<p class="news-empty">등록된 구성원이 없습니다.</p>';
            return;
        }

        /* 그룹 사이에만 구분선을 넣는다 */
        box.innerHTML = list.map(groupHTML).join('<hr class="group-divider">');
    };
})();
