/* =========================================================
   관리 화면 (admin.html)
   ---------------------------------------------------------
   - News         : 글 목록 / 수정 페이지로 이동 / 삭제
                    (글 쓰기·수정은 admin-write.html, admin-edit.html)
   - People       : 구성원 추가·수정·삭제·순서변경·그룹이동
   - Publications : 논문 추가·수정·삭제·순서변경, 학술지 색 지정
   ========================================================= */

(function () {
    "use strict";

    var A = window.Admin;

    var data = null;               // { news, people, publications }
    var editingMember = null;      // { gi, mi }  (mi === -1 이면 새로 추가)
    var editingPub = null;         // 논문 배열 인덱스 (-1 이면 새로 추가)

    var MEMBER_FIELDS = [
        { key: "name" }, { key: "role" }, { key: "degree" }, { key: "current" },
        { key: "email" }, { key: "interests" }, { key: "homepage" }
    ];

    /* 학술지 색 고르기 — 자주 쓰는 색을 미리 준비해 둔다 */
    var COLORS = [
        { v: "",        name: "기본 (학술지)", show: "#1a4fb3" },
        { v: "#0a7a3d", name: "초록 (학회)",   show: "#0a7a3d" },
        { v: "#c62828", name: "빨강 (수상)",   show: "#c62828" },
        { v: "#8C002B", name: "크림슨",        show: "#8C002B" },
        { v: "#6b3fa0", name: "보라",          show: "#6b3fa0" },
        { v: "#5a6570", name: "회색",          show: "#5a6570" }
    ];

    var DEFAULT_PUB_COLOR = "#1a4fb3";

    function $(id) { return document.getElementById(id); }
    function esc(v) { return A.esc(v); }
    function status(html) { $("status").innerHTML = html; }

    /* 바뀐 내용을 저장한다.
       scope 를 넘기면 그쪽 파일만 쓴다 — 다른 창의 편집을 덮어쓰지 않도록. */
    function persist(msg, scope) {
        return A.save(data, scope, msg).then(function (how) {
            status(savedMessage(how) + " " + (msg || ""));
            renderDraftBanner();
        }).catch(function (e) {
            status('<span style="color:#ffb4ae;">저장 실패: ' + esc(e.message || e) + "</span>");
            alert("저장하지 못했습니다.\n\n" + (e.message || e) +
                  "\n\n내용은 브라우저에 임시 보관했습니다. 다시 [지금 반영]을 눌러 보세요.");
            renderDraftBanner();
        });
    }

    function savedMessage(how) {
        if (how === "github") return "<b>GitHub 에 올렸습니다.</b> 1~2분 뒤 홈페이지에 반영됩니다.";
        if (how === "file") return "<b>폴더의 파일에 저장했습니다.</b>";
        return "<b>브라우저에 임시 저장했습니다.</b> [연결 설정]에서 GitHub 를 연결하거나, 아래에서 파일을 내려받아 덮어쓰세요.";
    }

    /* ===================== News 목록 ===================== */

    function renderNews() {
        var box = $("news-list");
        var list = A.sortNews(data.news);

        if (list.length === 0) {
            box.innerHTML = '<div class="empty">아직 등록된 글이 없습니다.<br><br>' +
                            '<a class="btn btn-main" href="admin-write.html">+ 새 글 쓰기</a></div>';
            return;
        }

        box.innerHTML = list.map(function (n) {
            return '' +
                '<div class="row">' +
                    '<div class="grow">' +
                        '<div class="t">' + esc(n.title || "(제목 없음)") + "</div>" +
                        '<div class="s">' + esc(A.fmtDate(n.date)) + " · " + esc(n.id) +
                            (n.image ? " · 사진 있음" : "") + "</div>" +
                    "</div>" +
                    '<div class="acts">' +
                        '<a class="btn btn-sm" href="news-post.html?id=' + encodeURIComponent(n.id) + '" target="_blank">보기</a>' +
                        '<a class="btn btn-sm btn-main" href="admin-edit.html?id=' + encodeURIComponent(n.id) + '">수정</a>' +
                        '<button class="btn btn-sm btn-danger" data-del="' + esc(n.id) + '">삭제</button>' +
                    "</div>" +
                "</div>";
        }).join("");

        box.querySelectorAll("[data-del]").forEach(function (b) {
            b.onclick = function () { deleteNews(b.getAttribute("data-del")); };
        });
    }

    function deleteNews(id) {
        var i = data.news.findIndex(function (n) { return String(n.id) === String(id); });
        if (i < 0) return;

        var n = data.news[i];
        if (!confirm('"' + (n.title || n.id) + '" 글을 삭제할까요?\n\n되돌릴 수 없습니다.')) return;

        data.news.splice(i, 1);
        renderNews();
        persist("글을 삭제했습니다.", "news");
    }

    /* ===================== Publications ===================== */

    function pubYear(p) { return String(p.year || "").trim() || "연도 미상"; }

    /* 화면에 보이는 순서 = 파일에 저장되는 순서 가 되도록 미리 정렬해 둔다 */
    function sortPubs() {
        data.publications = data.publications
            .map(function (p, i) { return { p: p, i: i }; })
            .sort(function (a, b) {
                var ya = parseInt(a.p.year, 10), yb = parseInt(b.p.year, 10);
                if (isNaN(ya) && isNaN(yb)) return a.i - b.i;
                if (isNaN(ya)) return 1;
                if (isNaN(yb)) return -1;
                if (yb !== ya) return yb - ya;
                return a.i - b.i;
            })
            .map(function (w) { return w.p; });
    }

    function renderPubs() {
        var box = $("pub-list");
        var list = data.publications;

        if (list.length === 0) {
            box.innerHTML = '<div class="empty">등록된 논문이 없습니다.</div>';
            return;
        }

        var html = "";
        var lastYear = null;

        list.forEach(function (p, i) {
            var y = pubYear(p);
            if (y !== lastYear) {
                if (lastYear !== null) html += "</div></div>";
                var count = list.filter(function (o) { return pubYear(o) === y; }).length;
                html += '<div class="group">' +
                            '<div class="group-head"><span class="gname">' + esc(y) + "</span>" +
                                '<span class="s">' + count + "편</span></div>" +
                        '<div class="group-body">';
                lastYear = y;
            }

            var color = String(p.color || "").trim() || DEFAULT_PUB_COLOR;
            html += '' +
                '<div class="row' + (editingPub === i ? " sel" : "") + '">' +
                    '<div class="grow">' +
                        '<div class="t">' + esc(p.title || "(제목 없음)") + "</div>" +
                        '<div class="s"><span style="color:' + esc(color) + ";" +
                            (p.bold ? "font-weight:700;" : "") + '">' + esc(p.venue || "(학술지 없음)") + "</span></div>" +
                    "</div>" +
                    '<div class="acts">' +
                        '<button class="btn btn-sm" data-pup="' + i + '" title="위로">↑</button>' +
                        '<button class="btn btn-sm" data-pdn="' + i + '" title="아래로">↓</button>' +
                        '<button class="btn btn-sm" data-pedit="' + i + '">수정</button>' +
                        '<button class="btn btn-sm btn-danger" data-pdel="' + i + '">삭제</button>' +
                    "</div>" +
                "</div>";
        });

        if (lastYear !== null) html += "</div></div>";
        box.innerHTML = html;

        function on(attr, fn) {
            box.querySelectorAll("[" + attr + "]").forEach(function (b) {
                b.onclick = function () { fn(Number(b.getAttribute(attr))); };
            });
        }
        on("data-pedit", openPub);
        on("data-pdel", deletePub);
        on("data-pup", function (i) { movePub(i, -1); });
        on("data-pdn", function (i) { movePub(i, 1); });
    }

    /* 같은 연도 안에서만 자리를 바꾼다 (연도가 바뀌면 어차피 정렬로 되돌아가므로) */
    function movePub(i, d) {
        var t = i + d;
        var list = data.publications;
        if (t < 0 || t >= list.length) return;

        if (pubYear(list[i]) !== pubYear(list[t])) {
            alert("연도가 다른 논문과는 자리를 바꿀 수 없습니다.\n\n연도를 바꾸려면 [수정]에서 연도 값을 고쳐 주세요.");
            return;
        }

        var tmp = list[i]; list[i] = list[t]; list[t] = tmp;
        if (editingPub === i) editingPub = t;
        renderPubs();
        persist("순서를 바꿨습니다.", "publications");
    }

    function deletePub(i) {
        var p = data.publications[i];
        if (!confirm('"' + (p.title || "제목 없음") + '"\n\n이 논문을 목록에서 지울까요?')) return;
        data.publications.splice(i, 1);
        if (editingPub === i) closePub();
        else if (editingPub > i) editingPub--;
        renderPubs();
        persist("논문을 삭제했습니다.", "publications");
    }

    function renderColorChoices(selected) {
        $("p-colors").innerHTML = COLORS.map(function (c) {
            return '<button type="button" class="swatch' + (c.v === selected ? " on" : "") + '" ' +
                   'data-color="' + esc(c.v) + '" title="' + esc(c.name) + '">' +
                   '<span style="background:' + c.show + '"></span>' + esc(c.name) + "</button>";
        }).join("");

        $("p-colors").querySelectorAll("[data-color]").forEach(function (b) {
            b.onclick = function () {
                $("p-color").value = b.getAttribute("data-color");
                renderColorChoices(b.getAttribute("data-color"));
                previewPub();
            };
        });
    }

    function previewPub() {
        var color = $("p-color").value.trim() || DEFAULT_PUB_COLOR;
        $("p-preview").innerHTML =
            '<span class="pv-t">' + esc($("p-title").value || "논문 제목") + "</span>" +
            '<span class="pv-v" style="color:' + esc(color) + ";" +
                ($("p-bold").checked ? "font-weight:700;" : "") + '">' +
                esc($("p-venue").value || "학술지 이름") + "</span>";
    }

    function openPub(i) {
        editingPub = i;
        var p = (i >= 0) ? data.publications[i] : { year: String(new Date().getFullYear()), bold: false };

        $("pub-form").classList.remove("hide");
        $("pub-form-title").textContent = (i >= 0) ? "논문 수정" : "논문 추가";

        $("p-year").value = p.year || "";
        $("p-title").value = p.title || "";
        $("p-venue").value = p.venue || "";
        $("p-color").value = p.color || "";
        $("p-bold").checked = !!p.bold;
        $("p-link").value = p.link || "";

        renderColorChoices(p.color || "");
        previewPub();
        renderPubs();
        $("p-year").focus();
    }

    function closePub() {
        editingPub = null;
        $("pub-form").classList.add("hide");
        renderPubs();
    }

    function savePub() {
        if (editingPub === null) return;

        var year = $("p-year").value.trim();
        var title = $("p-title").value.trim();

        if (!/^\d{4}$/.test(year)) { alert("연도를 네 자리 숫자로 입력해 주세요. (예: 2026)"); $("p-year").focus(); return; }
        if (!title) { alert("논문 제목을 입력해 주세요."); $("p-title").focus(); return; }

        var color = $("p-color").value.trim();
        if (color && !/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(color)) {
            alert("색은 # 으로 시작하는 색상 코드로 입력해 주세요. (예: #0a7a3d)\n\n지금 값: " + color);
            $("p-color").focus();
            return;
        }

        var link = $("p-link").value.trim();
        if (link && !/^https?:\/\//i.test(link)) {
            if (!confirm("주소가 http:// 또는 https:// 로 시작하지 않습니다.\n\n" + link +
                         "\n\n이대로 두면 링크가 잘못 연결됩니다. 그래도 저장할까요?")) {
                $("p-link").focus();
                return;
            }
        }

        var item = {
            year: year,
            title: title,
            venue: $("p-venue").value.trim(),
            color: color,
            bold: $("p-bold").checked,
            link: link
        };

        if (editingPub >= 0) data.publications[editingPub] = item;
        else data.publications.push(item);

        sortPubs();
        editingPub = data.publications.indexOf(item);
        renderPubs();
        persist("논문 정보를 저장했습니다.", "publications");
    }

    /* ===================== People ===================== */

    function renderPeople() {
        var box = $("people-list");

        if (data.people.length === 0) {
            box.innerHTML = '<div class="empty">그룹이 없습니다. [+ 그룹 추가]를 눌러 시작하세요.</div>';
            return;
        }

        box.innerHTML = data.people.map(function (g, gi) {
            var members = g.members || [];

            var rows = members.length === 0
                ? '<div class="empty">이 그룹에는 아직 아무도 없습니다.</div>'
                : members.map(function (m, mi) {
                    var sub = [m.role, m.degree, m.current, m.email].filter(Boolean).join(" · ");
                    var sel = editingMember && editingMember.gi === gi && editingMember.mi === mi;
                    return '' +
                        '<div class="row' + (sel ? " sel" : "") + '">' +
                            '<div class="grow">' +
                                '<div class="t">' + esc(m.name || "(이름 없음)") + "</div>" +
                                (sub ? '<div class="s">' + esc(sub) + "</div>" : "") +
                            "</div>" +
                            '<div class="acts">' +
                                '<button class="btn btn-sm" data-mup="' + gi + "," + mi + '" title="위로">↑</button>' +
                                '<button class="btn btn-sm" data-mdn="' + gi + "," + mi + '" title="아래로">↓</button>' +
                                '<button class="btn btn-sm" data-medit="' + gi + "," + mi + '">수정</button>' +
                                '<button class="btn btn-sm btn-danger" data-mdel="' + gi + "," + mi + '">삭제</button>' +
                            "</div>" +
                        "</div>";
                }).join("");

            return '' +
                '<div class="group">' +
                    '<div class="group-head">' +
                        '<span class="gname">' + esc(g.title) + "</span>" +
                        '<button class="btn btn-sm" data-gup="' + gi + '" title="그룹 위로">↑</button>' +
                        '<button class="btn btn-sm" data-gdn="' + gi + '" title="그룹 아래로">↓</button>' +
                        '<button class="btn btn-sm" data-gren="' + gi + '">이름변경</button>' +
                        '<button class="btn btn-sm btn-danger" data-gdel="' + gi + '">그룹삭제</button>' +
                    "</div>" +
                    '<div class="group-body">' + rows +
                        '<button class="btn btn-sm" data-madd="' + gi + '" style="align-self:flex-start;margin-top:4px;">+ 구성원 추가</button>' +
                    "</div>" +
                "</div>";
        }).join("");

        function on(attr, fn) {
            box.querySelectorAll("[" + attr + "]").forEach(function (b) {
                b.onclick = function () {
                    var p = b.getAttribute(attr).split(",").map(Number);
                    fn(p[0], p[1]);
                };
            });
        }

        on("data-medit", openMember);
        on("data-madd",  function (gi) { openMember(gi, -1); });
        on("data-mdel",  deleteMember);
        on("data-mup",   function (gi, mi) { moveMember(gi, mi, -1); });
        on("data-mdn",   function (gi, mi) { moveMember(gi, mi, 1); });
        on("data-gup",   function (gi) { moveGroup(gi, -1); });
        on("data-gdn",   function (gi) { moveGroup(gi, 1); });
        on("data-gren",  renameGroup);
        on("data-gdel",  deleteGroup);
    }

    function moveMember(gi, mi, d) {
        var arr = data.people[gi].members;
        var t = mi + d;
        if (t < 0 || t >= arr.length) return;
        var tmp = arr[mi]; arr[mi] = arr[t]; arr[t] = tmp;
        if (editingMember && editingMember.gi === gi && editingMember.mi === mi) editingMember.mi = t;
        renderPeople();
        persist("순서를 바꿨습니다.", "people");
    }

    function deleteMember(gi, mi) {
        var m = data.people[gi].members[mi];
        if (!confirm('"' + (m.name || "이름 없음") + '" 님을 목록에서 지울까요?')) return;
        data.people[gi].members.splice(mi, 1);
        if (editingMember && editingMember.gi === gi && editingMember.mi === mi) closeMember();
        renderPeople();
        persist("구성원을 삭제했습니다.", "people");
    }

    function moveGroup(gi, d) {
        var t = gi + d;
        if (t < 0 || t >= data.people.length) return;
        var tmp = data.people[gi]; data.people[gi] = data.people[t]; data.people[t] = tmp;
        closeMember();
        renderPeople();
        persist("그룹 순서를 바꿨습니다.", "people");
    }

    function renameGroup(gi) {
        var v = prompt("그룹 이름", data.people[gi].title);
        if (v === null) return;
        v = v.trim();
        if (!v) { alert("그룹 이름은 비울 수 없습니다."); return; }
        data.people[gi].title = v;
        renderPeople();
        persist("그룹 이름을 바꿨습니다.", "people");
    }

    function deleteGroup(gi) {
        var g = data.people[gi];
        var n = (g.members || []).length;
        if (!confirm('"' + g.title + '" 그룹을 삭제할까요?' + (n ? "\n\n안에 있는 " + n + "명도 함께 사라집니다." : ""))) return;
        data.people.splice(gi, 1);
        closeMember();
        renderPeople();
        persist("그룹을 삭제했습니다.", "people");
    }

    function addGroup() {
        var v = prompt("새 그룹 이름을 입력하세요.", "");
        if (v === null) return;
        v = v.trim();
        if (!v) return;
        data.people.push({ title: v, members: [] });
        renderPeople();
        persist("그룹을 추가했습니다.", "people");
    }

    function openMember(gi, mi) {
        editingMember = { gi: gi, mi: mi };
        var m = (mi >= 0) ? data.people[gi].members[mi] : {};

        $("member-form").classList.remove("hide");
        $("member-form-title").textContent = (mi >= 0) ? "구성원 수정" : "구성원 추가";

        $("m-group").innerHTML = data.people.map(function (g, i) {
            return '<option value="' + i + '"' + (i === gi ? " selected" : "") + ">" + esc(g.title) + "</option>";
        }).join("");

        MEMBER_FIELDS.forEach(function (f) { $("m-" + f.key).value = m[f.key] || ""; });

        renderPeople();
        $("m-name").focus();
    }

    function closeMember() {
        editingMember = null;
        $("member-form").classList.add("hide");
        renderPeople();
    }

    function saveMember() {
        if (!editingMember) return;

        var name = $("m-name").value.trim();
        if (!name) { alert("이름을 입력해 주세요."); $("m-name").focus(); return; }

        var home = $("m-homepage").value.trim();
        if (home && !/^https?:\/\//i.test(home)) {
            if (!confirm("Homepage 주소가 http:// 또는 https:// 로 시작하지 않습니다.\n\n" + home +
                         "\n\n이대로 두면 링크가 홈페이지 안쪽 경로로 잘못 연결됩니다. 그래도 저장할까요?")) {
                $("m-homepage").focus();
                return;
            }
        }

        var m = {};
        MEMBER_FIELDS.forEach(function (f) { m[f.key] = $("m-" + f.key).value.trim(); });

        var from = editingMember.gi;
        var to = Number($("m-group").value);
        var mi = editingMember.mi;

        if (mi >= 0) {
            if (to === from) {
                data.people[from].members[mi] = m;
            } else {
                data.people[from].members.splice(mi, 1);
                data.people[to].members.push(m);
                editingMember = { gi: to, mi: data.people[to].members.length - 1 };
            }
        } else {
            data.people[to].members.push(m);
            editingMember = { gi: to, mi: data.people[to].members.length - 1 };
        }

        renderPeople();
        persist("구성원 정보를 저장했습니다.", "people");
    }

    /* ===================== 배너 / 탭 ===================== */

    function renderDraftBanner() {
        $("draft-banner").classList.toggle("hide", !A.hasDraft());
    }

    var TABS = ["news", "people", "pub"];

    function switchTab(which) {
        if (TABS.indexOf(which) < 0) which = "news";
        TABS.forEach(function (t) {
            $("tab-" + t).classList.toggle("on", t === which);
            $("panel-" + t).classList.toggle("on", t === which);
        });
        try { localStorage.setItem("dlmath-admin-tab", which); } catch (e) {}
    }

    function flash() {
        var p = new URLSearchParams(location.search);
        if (p.get("published")) status("<b>GitHub 에 올렸습니다.</b> 1~2분 뒤 홈페이지에 반영됩니다.");
        else if (p.get("saved")) status("<b>폴더의 파일에 저장했습니다.</b>");
        else if (p.get("deleted")) status("<b>글을 삭제했습니다.</b>");
        else if (p.get("draft")) status(savedMessage("draft"));
    }

    /* ===================== 시작 ===================== */

    function init() {
        A.renderTopBar("manage");
        status("불러오는 중…");

        A.init().then(function () { return A.load(); }).then(function (d) {
            data = d;
            if (!Array.isArray(data.publications)) data.publications = [];

            /* 사람 항목에 빠진 칸을 빈 값으로 채워 둔다 */
            data.people.forEach(function (g) {
                g.members = (g.members || []).map(function (m) {
                    var o = {};
                    A.MEMBER_KEYS.forEach(function (k) { o[k] = m[k] || ""; });
                    return o;
                });
            });

            sortPubs();

            TABS.forEach(function (t) { $("tab-" + t).onclick = function () { switchTab(t); }; });

            $("btn-add-group").onclick = addGroup;
            $("btn-save-member").onclick = saveMember;
            $("btn-cancel-member").onclick = closeMember;

            $("btn-add-pub").onclick = function () { openPub(-1); };
            $("btn-save-pub").onclick = savePub;
            $("btn-cancel-pub").onclick = closePub;
            ["p-title", "p-venue", "p-color"].forEach(function (id) {
                $(id).addEventListener("input", previewPub);
            });
            $("p-bold").addEventListener("change", previewPub);

            $("btn-dl-news").onclick = function () {
                A.download("news-data.js", A.buildNewsFile(data.news));
                status("<b>news-data.js</b> 를 내려받았습니다. 홈페이지 폴더에 덮어쓰세요.");
            };
            $("btn-dl-people").onclick = function () {
                A.download("people-data.js", A.buildPeopleFile(data.people));
                status("<b>people-data.js</b> 를 내려받았습니다. 홈페이지 폴더에 덮어쓰세요.");
            };
            $("btn-dl-pub").onclick = function () {
                A.download("publications-data.js", A.buildPublicationsFile(data.publications));
                status("<b>publications-data.js</b> 를 내려받았습니다. 홈페이지 폴더에 덮어쓰세요.");
            };

            $("btn-draft-drop").onclick = function () {
                if (!confirm("임시 저장본을 버리고 원래 내용으로 되돌릴까요?\n\n저장하지 않은 편집 내용이 사라집니다.")) return;
                A.clearDraft();
                location.href = "admin.html";
            };
            $("btn-draft-save").onclick = function () { persist("", "both"); };

            var saved = "news";
            try { saved = localStorage.getItem("dlmath-admin-tab") || "news"; } catch (e) {}
            switchTab(saved);

            renderNews();
            renderPeople();
            renderPubs();
            renderDraftBanner();

            status("");
            flash();

            if (data.loadError) {
                status('<span style="color:#ffb4ae;">GitHub 에서 내용을 불러오지 못해 이 컴퓨터의 파일을 보여주고 있습니다. ' +
                       "이 상태로 저장하면 저장소 내용을 덮어쓸 수 있으니, 먼저 연결을 확인해 주세요.</span>");
                alert("GitHub 에서 내용을 불러오지 못했습니다.\n\n" + data.loadError);
            } else if (!$("status").innerHTML) {
                status("News <b>" + data.news.length + "</b>개 · 구성원 <b>" +
                       data.people.reduce(function (a, g) { return a + g.members.length; }, 0) + "</b>명 · 논문 <b>" +
                       data.publications.length + "</b>편 · " + esc(A.targetLabel()));
            }
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();
