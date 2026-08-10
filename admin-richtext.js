/* =========================================================
   글쓰기 영역 (워드처럼 쓰는 본문 편집기)
   ---------------------------------------------------------
   글쓴이는 HTML 을 볼 일이 없습니다.
   화면에 보이는 대로 쓰면, 저장할 때 이 파일이
   홈페이지가 쓰는 깔끔한 HTML 로 바꿔 줍니다.

   바꿔 주는 태그는 아래 몇 가지뿐입니다.
     문단        <p>
     소제목      <h3>
     굵게/기울임 <strong> <em>
     목록        <ul> <ol> <li>
     링크        <a>          (항상 새 창으로 열리게)
     사진        <img>
     줄바꿈      <br>
   그 밖의 것(글꼴·색·표·워드에서 딸려온 서식 등)은 모두 걷어냅니다.
   ========================================================= */

window.RichText = (function () {
    "use strict";

    /* 남길 인라인 태그 (왼쪽에 오는 태그를 오른쪽으로 통일) */
    var INLINE = { B: "strong", STRONG: "strong", I: "em", EM: "em", CODE: "code" };

    /* 통째로 버릴 태그 */
    var DROP = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1, LINK: 1, META: 1, NOSCRIPT: 1 };

    /* 문단처럼 다뤄야 하는 태그 */
    var BLOCKISH = { P: 1, DIV: 1, SECTION: 1, ARTICLE: 1, BLOCKQUOTE: 1, PRE: 1, FIGURE: 1, FIGCAPTION: 1, TD: 1, TH: 1, TR: 1, TABLE: 1, TBODY: 1 };

    function escText(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function escAttr(s) {
        return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /* 줄바꿈·연속 공백·&nbsp; 를 보통 공백 하나로 */
    function normSpace(s) {
        return String(s).replace(/\u00a0/g, " ").replace(/[\t\r\n ]+/g, " ");
    }

    function pad(depth) {
        var s = "";
        for (var i = 0; i < depth; i++) s += "    ";
        return s;
    }

    function imgTag(el) {
        var src = el.getAttribute("src") || "";
        if (!src) return "";
        return '<img src="' + escAttr(src) + '" alt="' + escAttr(el.getAttribute("alt") || "") + '">';
    }

    /* ---- 노드 하나를 (자기 태그까지 포함해서) 문자열로 ---- */
    function inlineNode(c) {
        if (c.nodeType === 3) return escText(normSpace(c.nodeValue));   // 글자
        if (c.nodeType !== 1) return "";                                // 주석 등은 버림

        var tag = c.tagName;
        if (DROP[tag]) return "";

        if (tag === "BR") return "<br>";
        if (tag === "IMG") return imgTag(c);

        if (tag === "A") {
            var href = (c.getAttribute("href") || "").trim();
            var inner = inline(c);
            if (href && hasContent(inner)) {
                return '<a href="' + escAttr(href) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>";
            }
            return inner;                                               // 주소 없는 링크는 글자만 남김
        }

        if (INLINE[tag]) {
            var t = INLINE[tag];
            var body = inline(c);
            return hasContent(body) ? "<" + t + ">" + body + "</" + t + ">" : "";
        }

        return inline(c);                                               // span, font 등은 벗겨냄
    }

    /* ---- 한 덩어리 안의 글자·굵게·링크 등을 문자열로 ---- */
    function inline(node) {
        var out = "";
        var kids = node.childNodes;
        for (var i = 0; i < kids.length; i++) out += inlineNode(kids[i]);
        return out;
    }

    /* 내용이 실제로 있는지 (태그만 있고 비어 있으면 false) */
    function hasContent(html) {
        if (/<img\s/.test(html)) return true;
        return !!String(html)
            .replace(/<br\s*\/?>/gi, "")
            .replace(/<[^>]*>/g, "")
            .replace(/[\s\u00a0]/g, "");
    }

    function isBlockish(el) {
        var tag = el.tagName;
        return BLOCKISH[tag] || tag === "UL" || tag === "OL" || tag === "IMG" || /^H[1-6]$/.test(tag);
    }

    function hasBlockChild(el) {
        for (var i = 0; i < el.children.length; i++) {
            if (isBlockish(el.children[i])) return true;
        }
        return false;
    }

    function listItem(li, depth) {
        var text = "";
        var nested = [];

        for (var i = 0; i < li.childNodes.length; i++) {
            var c = li.childNodes[i];
            if (c.nodeType === 1 && (c.tagName === "UL" || c.tagName === "OL")) {
                nested.push(list(c, depth + 1));
            } else if (c.nodeType === 3) {
                text += escText(normSpace(c.nodeValue));
            } else if (c.nodeType === 1) {
                text += inlineNode(c);
            }
        }

        text = text.trim();
        if (!hasContent(text) && nested.length === 0) return "";

        var line = pad(depth) + "<li>" + text;
        if (nested.length) line += "\n" + nested.join("\n") + "\n" + pad(depth);
        return line + "</li>";
    }

    function list(el, depth) {
        var tag = el.tagName === "OL" ? "ol" : "ul";
        var items = [];

        for (var i = 0; i < el.children.length; i++) {
            if (el.children[i].tagName !== "LI") continue;
            var s = listItem(el.children[i], depth + 1);
            if (s) items.push(s);
        }
        if (!items.length) return "";

        return pad(depth) + "<" + tag + ">\n" + items.join("\n") + "\n" + pad(depth) + "</" + tag + ">";
    }

    function blocks(root, depth) {
        var out = [];
        var buf = "";

        function flush() {
            var t = buf.replace(/^(?:\s|<br>)+/, "").replace(/(?:\s|<br>)+$/, "");
            if (hasContent(t)) out.push(pad(depth) + "<p>" + t + "</p>");
            buf = "";
        }

        var kids = root.childNodes;
        for (var i = 0; i < kids.length; i++) {
            var c = kids[i];

            if (c.nodeType === 3) { buf += escText(normSpace(c.nodeValue)); continue; }
            if (c.nodeType !== 1) continue;

            var tag = c.tagName;
            if (DROP[tag]) continue;

            if (tag === "IMG") {
                flush();
                var im = imgTag(c);
                if (im) out.push(pad(depth) + im);
                continue;
            }

            if (tag === "UL" || tag === "OL") {
                flush();
                var l = list(c, depth);
                if (l) out.push(l);
                continue;
            }

            if (/^H[1-6]$/.test(tag)) {                  // 소제목은 h3 하나로 통일
                flush();
                var h = inline(c).trim();
                if (hasContent(h)) out.push(pad(depth) + "<h3>" + h + "</h3>");
                continue;
            }

            if (BLOCKISH[tag]) {
                flush();
                if (hasBlockChild(c)) {
                    var sub = blocks(c, depth);          // 문단 안에 또 문단이 있는 경우
                    if (sub) out.push(sub);
                } else {
                    var p = inline(c).replace(/^(?:\s|<br>)+/, "").replace(/(?:\s|<br>)+$/, "");
                    if (hasContent(p)) out.push(pad(depth) + "<p>" + p + "</p>");
                }
                continue;
            }

            buf += inlineNode(c);                        // 인라인 요소는 문단으로 모음
        }

        flush();
        return out.join("\n");
    }

    /* ---- 바깥에서 쓰는 것 ---- */

    /* 편집 영역(또는 HTML 문자열)을 홈페이지용 HTML 로 정리 */
    function clean(input) {
        var host;

        if (typeof input === "string") {
            /* DOMParser 로 읽으면 이미지가 실제로 불러와지지 않아 안전하다 */
            var doc = new DOMParser().parseFromString("<body>" + input + "</body>", "text/html");
            host = doc.body;
        } else {
            host = input;
        }
        return blocks(host, 0);
    }

    /* 저장돼 있던 HTML 을 편집 영역에 올리기 */
    function load(el, html) {
        el.innerHTML = clean(html || "") || "<p><br></p>";
        syncEmpty(el);
    }

    function syncEmpty(el) {
        var empty = !hasContent(el.innerHTML);
        el.setAttribute("data-empty", empty ? "true" : "false");
    }

    function exec(cmd, value) {
        try { document.execCommand(cmd, false, value === undefined ? null : value); }
        catch (e) { /* 지원하지 않는 브라우저는 무시 */ }
    }

    /* 편집 영역 안에 남은 style·class 같은 군더더기를 실시간으로 걷어낸다.
       (크롬은 붙여넣기·서식 적용 때 span style 을 임의로 붙인다) */
    var KEEP = { A: ["href"], IMG: ["src", "alt"] };

    function scrub(el) {
        var nodes = el.querySelectorAll("*");
        for (var i = 0; i < nodes.length; i++) {
            var n = nodes[i];
            var keep = KEEP[n.tagName] || [];
            for (var j = n.attributes.length - 1; j >= 0; j--) {
                var name = n.attributes[j].name;
                if (keep.indexOf(name) < 0) n.removeAttribute(name);
            }
        }
    }

    /* 커서 자리에 넣기 */
    function insertHtml(el, html) {
        el.focus();
        exec("insertHTML", html);
        scrub(el);
        syncEmpty(el);
    }

    /* 편집 영역 준비 */
    function attach(el, opts) {
        opts = opts || {};

        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");

        /* 엔터를 치면 <div> 가 아니라 <p> 가 생기도록 */
        exec("defaultParagraphSeparator", "p");
        /* 굵게·기울임을 style 이 아니라 태그로 만들도록 */
        exec("styleWithCSS", false);

        function changed() {
            scrub(el);
            syncEmpty(el);
            if (opts.onChange) opts.onChange();
        }

        el.addEventListener("input", changed);

        /* 붙여넣기: 워드·웹에서 딸려오는 서식을 걷어내고 넣는다 */
        el.addEventListener("paste", function (e) {
            var dt = e.clipboardData;
            if (!dt) return;

            /* 사진을 복사해서 붙여넣은 경우 */
            var file = null;
            var items = dt.items || [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].kind === "file" && /^image\//.test(items[i].type)) {
                    file = items[i].getAsFile();
                    break;
                }
            }
            if (!file && dt.files) {
                for (var j = 0; j < dt.files.length; j++) {
                    if (/^image\//.test(dt.files[j].type)) { file = dt.files[j]; break; }
                }
            }
            if (file) {
                e.preventDefault();
                if (opts.onImage) opts.onImage(file);
                return;
            }

            e.preventDefault();

            var html = dt.getData("text/html");
            var text = dt.getData("text/plain");
            var cleaned;

            if (html) {
                cleaned = clean(html);
            } else {
                cleaned = String(text || "").split(/\n\s*\n/).map(function (b) {
                    var t = b.trim();
                    return t ? "<p>" + escText(t).replace(/\n/g, "<br>") + "</p>" : "";
                }).filter(Boolean).join("\n");
            }

            if (cleaned) insertHtml(el, cleaned);
            changed();
        });

        /* 사진을 끌어다 놓기 */
        ["dragenter", "dragover"].forEach(function (t) {
            el.addEventListener(t, function (e) {
                if (!e.dataTransfer || !e.dataTransfer.types) return;
                if (Array.prototype.indexOf.call(e.dataTransfer.types, "Files") < 0) return;
                e.preventDefault();
                el.classList.add("drag");
            });
        });
        ["dragleave", "drop"].forEach(function (t) {
            el.addEventListener(t, function () { el.classList.remove("drag"); });
        });
        el.addEventListener("drop", function (e) {
            var files = e.dataTransfer && e.dataTransfer.files;
            if (!files || !files.length) return;
            for (var i = 0; i < files.length; i++) {
                if (/^image\//.test(files[i].type)) {
                    e.preventDefault();
                    if (opts.onImage) opts.onImage(files[i]);
                    return;
                }
            }
        });

        syncEmpty(el);
    }

    return {
        clean: clean,
        load: load,
        attach: attach,
        exec: exec,
        insertHtml: insertHtml,
        syncEmpty: syncEmpty,
        hasContent: hasContent
    };
})();
