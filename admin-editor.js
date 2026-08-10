/* =========================================================
   News 글 작성 / 수정 화면
   ---------------------------------------------------------
   admin-write.html (새 글 쓰기) 와
   admin-edit.html  (글 수정) 이 함께 사용합니다.

   본문은 워드처럼 쓰는 방식입니다. 화면에 보이는 모양이 곧
   홈페이지에 올라가는 모양이고, HTML 은 저장할 때
   admin-richtext.js 가 알아서 만들어 줍니다.
   ========================================================= */

(function () {
    "use strict";

    var A = window.Admin;
    var RT = window.RichText;

    var data = null;
    var index = -1;
    var mode = "write";
    var dirty = false;
    var htmlMode = false;

    function $(id) { return document.getElementById(id); }

    /* ===================== 화면 ===================== */

    var FORM_HTML = '' +
    '<div class="actionbar">' +
        '<span class="ab-title" id="ed-title">새 글 쓰기</span>' +
        '<span class="save-note" id="ed-note"></span>' +
        '<div class="spacer"></div>' +
        '<button type="button" class="btn btn-danger hide" id="btn-delete">이 글 삭제</button>' +
        '<button type="button" class="btn" id="btn-cancel">취소</button>' +
        '<button type="button" class="btn btn-main" id="btn-save">저장</button>' +
    "</div>" +

    '<div class="paper">' +

        '<input type="date" id="f-date" class="paper-date">' +

        '<input type="text" id="f-title" class="paper-title" placeholder="제목을 입력하세요">' +

        '<textarea id="f-summary" class="paper-summary" rows="2" ' +
            'placeholder="한두 줄 요약 — 글 목록과 홈 화면에 이 문장이 보입니다"></textarea>' +

        '<div class="dropzone" id="cover-drop">' +
            '<div class="dz-inner" id="cover-empty">' +
                "<b>대표 사진을 여기로 끌어다 놓으세요</b>" +
                "<span>또는 클릭해서 컴퓨터에서 고르기 · 없어도 됩니다</span>" +
            "</div>" +
            '<div class="dz-preview hide" id="cover-preview">' +
                '<img id="cover-img" alt="">' +
                '<div class="dz-meta">' +
                    '<span id="cover-path"></span>' +
                    '<button type="button" class="btn btn-sm" id="cover-change">바꾸기</button>' +
                    '<button type="button" class="btn btn-sm btn-danger" id="cover-clear">빼기</button>' +
                "</div>" +
            "</div>" +
        "</div>" +

        '<div class="rt-toolbar" id="rt-toolbar">' +
            '<button type="button" data-cmd="bold" title="굵게 (Ctrl+B)"><b>가</b></button>' +
            '<button type="button" data-cmd="italic" title="기울임 (Ctrl+I)"><i>가</i></button>' +
            '<span class="sep"></span>' +
            '<button type="button" data-cmd="h3">소제목</button>' +
            '<button type="button" data-cmd="ul">• 목록</button>' +
            '<button type="button" data-cmd="ol">1. 목록</button>' +
            '<span class="sep"></span>' +
            '<button type="button" data-cmd="link">링크</button>' +
            '<button type="button" data-cmd="image">사진</button>' +
            '<span class="sep"></span>' +
            '<button type="button" data-cmd="clear">서식 지우기</button>' +
            '<button type="button" data-cmd="undo" title="되돌리기">↶</button>' +
            '<button type="button" data-cmd="redo" title="다시 실행">↷</button>' +
        "</div>" +

        '<div id="f-body-rich" class="rich pv-html" data-ph="여기에 본문을 쓰세요. 사진은 끌어다 놓거나 붙여넣으면 됩니다."></div>' +

        '<textarea id="f-body" class="hide html-source" rows="20"></textarea>' +

    "</div>" +

    '<details class="adv">' +
        "<summary>고급 설정</summary>" +
        '<div class="adv-body">' +
            '<div class="field">' +
                '<label for="f-id">글 주소 (id)</label>' +
                '<div style="display:flex;gap:8px;max-width:520px;">' +
                    '<input type="text" id="f-id" placeholder="비워두면 제목·날짜로 자동 생성">' +
                    '<button type="button" class="btn" id="btn-make-id" style="flex-shrink:0;">자동</button>' +
                "</div>" +
                '<p class="desc" id="id-desc">영문·숫자·하이픈만. 이 글의 링크 주소가 됩니다.</p>' +
            "</div>" +
            '<div class="field" style="margin-bottom:0;">' +
                "<label>HTML 직접 편집</label>" +
                '<p class="desc" style="margin:0 0 8px;">평소에는 쓸 일이 없습니다. 표처럼 특별한 것을 넣어야 할 때만 사용하세요.</p>' +
                '<button type="button" class="btn" id="btn-html-mode">HTML 로 편집하기</button>' +
            "</div>" +
        "</div>" +
    "</details>" +

    '<input type="file" id="cover-file" accept="image/*" class="hide">' +
    '<input type="file" id="body-file" accept="image/*" class="hide">' +
    '<input type="text" id="f-image" class="hide">';

    /* ===================== 값 넣고 빼기 ===================== */

    function fill(post) {
        $("f-title").value = post.title || "";
        $("f-date").value = post.date || A.todayStr();
        $("f-summary").value = post.summary || "";
        $("f-id").value = post.id || "";
        $("f-image").value = post.image || "";

        RT.load($("f-body-rich"), post.body || "");
        $("f-body").value = RT.clean(post.body || "");

        renderCover();
    }

    function bodyHtml() {
        return htmlMode ? $("f-body").value.trim() : RT.clean($("f-body-rich"));
    }

    function collect() {
        return {
            id: $("f-id").value.trim(),
            date: $("f-date").value.trim(),
            title: $("f-title").value.trim(),
            summary: $("f-summary").value.trim(),
            image: $("f-image").value.trim(),
            body: bodyHtml()
        };
    }

    function touch() { dirty = true; }

    function note(msg) { $("ed-note").textContent = msg || ""; }

    /* ===================== 주소(id) ===================== */

    function makeId(title, date) {
        var d = String(date || "").replace(/-/g, "");
        var slug = String(title || "").toLowerCase()
            .replace(/[^a-z0-9\s-]/g, " ")
            .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
            .replace(/^-|-$/g, "").slice(0, 40);

        var base = slug ? (d ? d + "-" + slug : slug) : ("post-" + (d || "new"));

        var id = base, k = 2;
        while (data.news.some(function (n, i) { return i !== index && n.id === id; })) {
            id = base + "-" + k;
            k++;
        }
        return id;
    }

    /* ===================== 대표 사진 ===================== */

    function renderCover() {
        var v = $("f-image").value.trim();
        var has = !!v;

        $("cover-empty").classList.toggle("hide", has);
        $("cover-preview").classList.toggle("hide", !has);
        $("cover-drop").classList.toggle("filled", has);

        if (has) {
            $("cover-img").src = v;
            $("cover-path").textContent = /^data:/.test(v)
                ? "글 안에 직접 담긴 사진 (폴더 미연결 상태)"
                : v;
        }
    }

    function handleImage(file, into) {
        note("사진 넣는 중…");

        return A.saveImage(file).then(function (r) {
            if (into === "cover") {
                $("f-image").value = r.path;
                renderCover();
            } else {
                RT.insertHtml($("f-body-rich"), '<img src="' + r.path + '" alt="">');
            }
            touch();
            note(r.embedded ? "폴더 미연결 — 사진이 글 안에 직접 담겼습니다" : "");
        }).catch(function (e) {
            note("");
            alert("사진을 넣지 못했습니다.\n\n" + (e.message || e));
        });
    }

    function firstImage(files) {
        for (var i = 0; i < (files ? files.length : 0); i++) {
            if (/^image\//.test(files[i].type)) return files[i];
        }
        return null;
    }

    function wireCoverDrop() {
        var el = $("cover-drop");

        ["dragenter", "dragover"].forEach(function (t) {
            el.addEventListener(t, function (e) { e.preventDefault(); e.stopPropagation(); el.classList.add("drag"); });
        });
        ["dragleave", "drop"].forEach(function (t) {
            el.addEventListener(t, function (e) { e.preventDefault(); e.stopPropagation(); el.classList.remove("drag"); });
        });
        el.addEventListener("drop", function (e) {
            var f = firstImage(e.dataTransfer.files);
            if (f) handleImage(f, "cover");
            else alert("사진 파일을 끌어다 놓아 주세요.");
        });
    }

    /* ===================== 글자 서식 도구 ===================== */

    function currentBlock() {
        try { return String(document.queryCommandValue("formatBlock") || "").toLowerCase(); }
        catch (e) { return ""; }
    }

    function selectionLink() {
        var sel = window.getSelection();
        if (!sel || !sel.anchorNode) return null;
        var n = sel.anchorNode;
        while (n && n !== $("f-body-rich")) {
            if (n.nodeType === 1 && n.tagName === "A") return n;
            n = n.parentNode;
        }
        return null;
    }

    var COMMANDS = {
        bold:  function () { RT.exec("bold"); },
        italic: function () { RT.exec("italic"); },
        h3:    function () { RT.exec("formatBlock", currentBlock() === "h3" ? "p" : "h3"); },
        ul:    function () { RT.exec("insertUnorderedList"); },
        ol:    function () { RT.exec("insertOrderedList"); },
        clear: function () { RT.exec("removeFormat"); RT.exec("unlink"); },
        undo:  function () { RT.exec("undo"); },
        redo:  function () { RT.exec("redo"); },
        image: function () { $("body-file").click(); },

        link: function () {
            var existing = selectionLink();
            if (existing) {
                if (confirm("이 링크를 없앨까요?\n\n" + existing.getAttribute("href"))) RT.exec("unlink");
                return;
            }
            var url = prompt("링크 주소를 입력하세요.", "https://");
            if (!url) return;
            url = url.trim();
            if (!/^(https?:\/\/|mailto:)/i.test(url)) url = "https://" + url.replace(/^\/+/, "");

            var sel = window.getSelection();
            if (sel && sel.isCollapsed) {
                RT.insertHtml($("f-body-rich"), '<a href="' + url + '">' + url + "</a>");
            } else {
                RT.exec("createLink", url);
            }
        }
    };

    function wireToolbar() {
        var bar = $("rt-toolbar");

        /* mousedown 에서 막아야 본문 선택이 풀리지 않는다 */
        bar.addEventListener("mousedown", function (e) {
            if (e.target.closest("button")) e.preventDefault();
        });

        bar.addEventListener("click", function (e) {
            var b = e.target.closest("button[data-cmd]");
            if (!b) return;

            var cmd = b.getAttribute("data-cmd");
            if (cmd !== "image") $("f-body-rich").focus();

            (COMMANDS[cmd] || function () {})();
            RT.syncEmpty($("f-body-rich"));
            touch();
            refreshToolbar();
        });

        document.addEventListener("selectionchange", refreshToolbar);
    }

    function refreshToolbar() {
        if (htmlMode) return;
        var bar = $("rt-toolbar");
        if (!bar) return;

        function set(cmd, on) {
            var b = bar.querySelector('[data-cmd="' + cmd + '"]');
            if (b) b.classList.toggle("on", !!on);
        }
        try {
            set("bold", document.queryCommandState("bold"));
            set("italic", document.queryCommandState("italic"));
            set("ul", document.queryCommandState("insertUnorderedList"));
            set("ol", document.queryCommandState("insertOrderedList"));
        } catch (e) {}
        set("h3", currentBlock() === "h3");
        set("link", !!selectionLink());
    }

    /* ===================== HTML 직접 편집 ===================== */

    function toggleHtmlMode() {
        if (!htmlMode) {
            $("f-body").value = RT.clean($("f-body-rich"));
            htmlMode = true;
        } else {
            RT.load($("f-body-rich"), $("f-body").value);
            htmlMode = false;
        }

        $("f-body-rich").classList.toggle("hide", htmlMode);
        $("f-body").classList.toggle("hide", !htmlMode);
        $("rt-toolbar").classList.toggle("hide", htmlMode);
        $("btn-html-mode").textContent = htmlMode ? "원래 편집기로 돌아가기" : "HTML 로 편집하기";
    }

    /* ===================== 저장 ===================== */

    function validate(post) {
        if (!post.title) { alert("제목을 입력해 주세요."); $("f-title").focus(); return false; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) { alert("날짜를 선택해 주세요."); $("f-date").focus(); return false; }

        if (!post.id) post.id = makeId(post.title, post.date);

        if (!/^[A-Za-z0-9_-]+$/.test(post.id)) {
            alert("글 주소(id)에는 영문·숫자·하이픈(-)·밑줄(_)만 쓸 수 있습니다.\n\n지금 값: " + post.id);
            $("f-id").focus();
            return false;
        }
        if (data.news.some(function (n, i) { return i !== index && n.id === post.id; })) {
            alert("같은 주소(id)를 쓰는 글이 이미 있습니다.\n\n" + post.id);
            $("f-id").focus();
            return false;
        }
        if (!post.body) {
            if (!confirm("본문이 비어 있습니다. 그래도 저장할까요?")) return false;
        }
        return true;
    }

    function leave(where) {
        dirty = false;
        location.href = where;
    }

    function doSave() {
        var post = collect();
        if (!validate(post)) return;

        $("f-id").value = post.id;

        if (index >= 0) data.news[index] = post;
        else data.news.push(post);

        note(A.target() === "github" ? "GitHub 에 올리는 중…" : "저장 중…");

        A.save(data, "news", (index >= 0 ? "News 수정: " : "News 추가: ") + post.title).then(function (how) {
            leave("admin.html?" + (how === "github" ? "published=1" : how === "file" ? "saved=1" : "draft=1"));
        }).catch(function (e) {
            note("");
            alert("저장하지 못했습니다.\n\n" + (e.message || e) +
                  "\n\n작성한 내용은 브라우저에 임시 보관했습니다. 관리 화면에서 다시 시도할 수 있습니다.");
            leave("admin.html?draft=1");
        });
    }

    function doDelete() {
        if (index < 0) return;
        var post = data.news[index];
        if (!confirm('"' + (post.title || post.id) + '" 글을 삭제할까요?\n\n되돌릴 수 없습니다.')) return;

        data.news.splice(index, 1);
        note("저장 중…");

        A.save(data, "news", "News 삭제: " + (post.title || post.id)).then(function () {
            leave("admin.html?deleted=1");
        }).catch(function (e) {
            note("");
            alert("저장하지 못했습니다.\n\n" + (e.message || e));
        });
    }

    /* ===================== 시작 ===================== */

    function bind() {
        RT.attach($("f-body-rich"), {
            onChange: function () { touch(); },
            onImage: function (file) { handleImage(file, "body"); }
        });

        wireToolbar();
        wireCoverDrop();

        ["f-title", "f-date", "f-summary"].forEach(function (id) {
            $(id).addEventListener("input", touch);
        });
        $("f-body").addEventListener("input", touch);

        $("btn-make-id").onclick = function () {
            $("f-id").value = makeId($("f-title").value, $("f-date").value);
            touch();
        };
        $("btn-html-mode").onclick = toggleHtmlMode;

        $("cover-drop").onclick = function (e) {
            if (e.target.closest("button")) return;
            if ($("f-image").value.trim()) return;
            $("cover-file").click();
        };
        $("cover-change").onclick = function (e) { e.stopPropagation(); $("cover-file").click(); };
        $("cover-clear").onclick = function (e) {
            e.stopPropagation();
            $("f-image").value = "";
            touch();
            renderCover();
        };
        $("cover-file").onchange = function () {
            if (this.files[0]) handleImage(this.files[0], "cover");
            this.value = "";
        };
        $("body-file").onchange = function () {
            if (this.files[0]) handleImage(this.files[0], "body");
            this.value = "";
        };

        $("btn-save").onclick = doSave;
        $("btn-delete").onclick = doDelete;
        $("btn-cancel").onclick = function () {
            if (dirty && !confirm("저장하지 않은 내용이 있습니다. 정말 나갈까요?")) return;
            leave("admin.html");
        };

        window.addEventListener("beforeunload", function (e) {
            if (dirty) { e.preventDefault(); e.returnValue = ""; }
        });
    }

    window.initEditor = function (opts) {
        mode = (opts && opts.mode) || "write";

        var root = $("editor-root");
        root.innerHTML = FORM_HTML;

        A.renderTopBar(mode === "write" ? "write" : "manage");

        A.init().then(function () { return A.load(); }).then(function (d) {
            data = d;

            if (d.loadError) {
                alert("GitHub 에서 내용을 불러오지 못했습니다.\n\n" + d.loadError +
                      "\n\n이대로 저장하면 저장소 내용을 덮어쓸 수 있습니다. 먼저 [연결 설정]을 확인해 주세요.");
            }

            if (mode === "edit") {
                var id = new URLSearchParams(location.search).get("id");
                index = data.news.findIndex(function (n) { return String(n.id) === String(id); });

                if (index < 0) {
                    root.innerHTML =
                        '<div class="card"><div class="empty">' +
                        "요청하신 글을 찾을 수 없습니다.<br><br>" +
                        '<a class="btn" href="admin.html">글 목록으로</a>' +
                        "</div></div>";
                    return;
                }

                bind();
                $("ed-title").textContent = "글 수정";
                $("btn-delete").classList.remove("hide");
                $("id-desc").innerHTML =
                    '<span style="color:#b3261e;">이미 올라간 글이라면 주소를 바꾸지 마세요. 기존 링크가 끊어집니다.</span>';
                fill(data.news[index]);
            } else {
                bind();
                fill({ date: A.todayStr() });
                $("f-title").focus();
            }

            refreshToolbar();
        });
    };
})();
