/* =========================================================
   편집기 공통 모듈  (admin*.html 이 모두 사용)
   ---------------------------------------------------------
   저장 방식(연결 방식)이 셋 있습니다.

     github  : GitHub 저장소에 바로 올립니다. 올리면 몇 분 뒤
               실제 홈페이지에 반영됩니다. 가장 편한 방법입니다.
     folder  : 이 컴퓨터의 홈페이지 폴더에 파일을 바로 씁니다.
               (GitHub 에 올리는 건 따로 해야 합니다)
     none    : 브라우저에 임시 보관해 두고, 마지막에 파일을
               내려받아 직접 덮어씁니다.

   어떤 방식이든 화면 사용법은 똑같습니다.
   홈페이지 화면에는 아무 영향을 주지 않습니다.
   ========================================================= */

window.Admin = (function () {
    "use strict";

    var DRAFT_KEY = "dlmath-admin-draft-v1";
    var GH_KEY = "dlmath-admin-github-v1";
    var IDB_NAME = "dlmath-admin";
    var IDB_STORE = "handles";

    var MAX_IMAGE_WIDTH = 1600;
    var KEEP_ORIGINAL_MAX = 600 * 1024;

    var NEWS_PATH = "news-data.js";
    var PEOPLE_PATH = "people-data.js";
    var PUB_PATH = "publications-data.js";

    var dirHandle = null;       // folder 방식일 때의 폴더
    var gh = null;              // { owner, repo, branch, token }
    var listeners = [];

    /* ============ 유틸 ============ */

    function $(id) { return document.getElementById(id); }

    function esc(v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function clone(v) { return JSON.parse(JSON.stringify(v)); }

    /* 자바스크립트 문자열로 안전하게 바꾼다.
       U+2028/U+2029(줄 구분 문자)는 눈에 보이지 않으면서 파일을 깨뜨릴 수 있어 함께 처리한다. */
    function q(v) {
        return JSON.stringify(String(v == null ? "" : v))
            .replace(/\u2028/g, "\\u2028")
            .replace(/\u2029/g, "\\u2029");
    }

    function todayStr() {
        var d = new Date();
        function p(n) { return (n < 10 ? "0" : "") + n; }
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    }

    function fmtDate(v) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || "").trim());
        return m ? m[1] + ". " + m[2] + ". " + m[3] + "." : String(v || "");
    }

    function sortNews(list) {
        return list.map(function (n, i) { return { n: n, i: i }; })
            .sort(function (a, b) {
                var d = String(b.n.date || "").localeCompare(String(a.n.date || ""));
                return d !== 0 ? d : a.i - b.i;
            })
            .map(function (w) { return w.n; });
    }

    /* UTF-8 문자열 <-> base64 (한글이 깨지지 않도록 직접 변환) */
    function toB64(text) {
        var bytes = new TextEncoder().encode(text);
        var bin = "";
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }

    function fromB64(b64) {
        var bin = atob(String(b64 || "").replace(/\s/g, ""));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    }

    function blobToB64(blob) {
        return new Promise(function (resolve, reject) {
            var r = new FileReader();
            r.onload = function () { resolve(String(r.result).split(",")[1] || ""); };
            r.onerror = function () { reject(new Error("사진을 읽지 못했습니다.")); };
            r.readAsDataURL(blob);
        });
    }

    function onChange(fn) { listeners.push(fn); }
    function fire() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }

    /* ============ 저장 방식 ============ */

    function target() {
        if (gh && ghToken) return "github";
        if (dirHandle) return "folder";
        return "none";
    }

    function targetLabel() {
        var t = target();
        if (t === "github") return "GitHub (" + gh.owner + "/" + gh.repo + ")";
        if (t === "folder") return "이 컴퓨터 폴더";
        if (isLocked()) return "GitHub — 암호 잠김";
        return "연결 안 됨";
    }

    /* ============ GitHub ============ */

    /* ---- 토큰 잠금 (암호로 암호화해서 보관) ----
       localStorage 에는 암호화된 값만 들어갑니다. 암호를 모르면 토큰을 꺼낼 수 없습니다.
       암호를 푼 토큰은 이 브라우저 탭이 열려 있는 동안만(sessionStorage) 유지되고,
       브라우저를 닫으면 사라집니다. */

    var ghToken = null;                 // 잠금 해제된 토큰 (메모리에만)
    var SESSION_KEY = "dlmath-admin-token-session";

    function cryptoOK() {
        return !!(window.crypto && window.crypto.subtle && window.TextEncoder);
    }

    function ab2b64(buf) {
        var bytes = new Uint8Array(buf), bin = "";
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        return btoa(bin);
    }

    function b642ab(s) {
        var bin = atob(s), bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }

    function deriveKey(pass, salt) {
        return crypto.subtle
            .importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"])
            .then(function (base) {
                return crypto.subtle.deriveKey(
                    { name: "PBKDF2", salt: salt, iterations: 250000, hash: "SHA-256" },
                    base,
                    { name: "AES-GCM", length: 256 },
                    false,
                    ["encrypt", "decrypt"]
                );
            });
    }

    function encryptToken(token, pass) {
        var salt = crypto.getRandomValues(new Uint8Array(16));
        var iv = crypto.getRandomValues(new Uint8Array(12));

        return deriveKey(pass, salt).then(function (key) {
            return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(token));
        }).then(function (buf) {
            return { salt: ab2b64(salt), iv: ab2b64(iv), data: ab2b64(buf) };
        });
    }

    function decryptToken(enc, pass) {
        return deriveKey(pass, b642ab(enc.salt)).then(function (key) {
            return crypto.subtle.decrypt({ name: "AES-GCM", iv: b642ab(enc.iv) }, key, b642ab(enc.data));
        }).then(function (buf) {
            return new TextDecoder().decode(buf);
        }).catch(function () {
            throw new Error("암호가 맞지 않습니다.");
        });
    }

    function ghLoadSettings() {
        try {
            var raw = localStorage.getItem(GH_KEY);
            gh = raw ? JSON.parse(raw) : null;
        } catch (e) { gh = null; }
        if (!gh) return;

        if (!gh.branch) gh.branch = "main";

        /* 예전 방식(암호 없이 저장)도 계속 동작하게 둔다 */
        if (gh.token) { ghToken = gh.token; return; }

        try { ghToken = sessionStorage.getItem(SESSION_KEY) || null; } catch (e) { ghToken = null; }
    }

    /* 설정 저장. pass 를 주면 토큰을 암호화해서 넣는다. */
    function ghSaveSettings(cfg, pass) {
        var store = { owner: cfg.owner, repo: cfg.repo, branch: cfg.branch };

        var done = function () {
            gh = store;
            ghToken = cfg.token;
            try { sessionStorage.setItem(SESSION_KEY, cfg.token); } catch (e) {}
            try { localStorage.setItem(GH_KEY, JSON.stringify(store)); } catch (e) {}
            fire();
        };

        if (pass && cryptoOK()) {
            return encryptToken(cfg.token, pass).then(function (enc) {
                store.enc = enc;
                done();
            });
        }

        /* 암호를 정하지 않은 경우 — 토큰이 그대로 저장된다 (권장하지 않음) */
        store.token = cfg.token;
        done();
        return Promise.resolve();
    }

    function ghForget() {
        gh = null;
        ghToken = null;
        try { localStorage.removeItem(GH_KEY); } catch (e) {}
        try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
        fire();
    }

    /* 설정은 있는데 토큰이 잠겨 있는 상태인가? */
    function isLocked() {
        return !!(gh && gh.enc && !ghToken);
    }

    function unlock(pass) {
        if (!gh || !gh.enc) return Promise.reject(new Error("잠긴 토큰이 없습니다."));

        return decryptToken(gh.enc, pass).then(function (token) {
            ghToken = token;
            try { sessionStorage.setItem(SESSION_KEY, token); } catch (e) {}
            fire();
            return true;
        });
    }

    /* 지금 탭에서만 다시 잠그기 */
    function lock() {
        ghToken = null;
        try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
        fire();
    }

    /* 실제 요청에 쓰는 설정 (토큰은 메모리에서 붙인다) */
    function ghCfg() {
        if (!gh || !ghToken) return null;
        return { owner: gh.owner, repo: gh.repo, branch: gh.branch, token: ghToken };
    }

    function ghApi(path, options, cfg) {
        var c = cfg || ghCfg();
        options = options || {};

        var headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        };
        if (c && c.token) headers.Authorization = "Bearer " + c.token;
        if (options.body) headers["Content-Type"] = "application/json";

        return fetch("https://api.github.com" + path, {
            method: options.method || "GET",
            headers: headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            cache: "no-store"
        }).then(function (res) {
            return res.text().then(function (text) {
                var json = null;
                try { json = text ? JSON.parse(text) : null; } catch (e) {}

                if (res.ok) return json;

                var msg = (json && json.message) || ("HTTP " + res.status);

                if (res.status === 401) {
                    msg = "토큰이 잘못되었거나 만료되었습니다. [연결 설정]에서 새 토큰을 넣어 주세요.";
                } else if (res.status === 403) {
                    msg = "권한이 없습니다. 토큰에 이 저장소의 Contents: Read and write 권한이 있는지 확인해 주세요.\n(원래 메시지: " + msg + ")";
                } else if (res.status === 404) {
                    msg = "저장소나 파일을 찾을 수 없습니다. 소유자·저장소 이름·브랜치를 확인해 주세요.\n(원래 메시지: " + msg + ")";
                } else if (res.status === 409 || res.status === 422) {
                    msg = "저장소의 파일이 그 사이에 바뀌었습니다. 화면을 새로고침한 뒤 다시 저장해 주세요.\n(원래 메시지: " + msg + ")";
                } else if (res.status === 429 || (res.status === 403 && /rate limit/i.test(msg))) {
                    msg = "GitHub 요청 한도에 걸렸습니다. 잠시(보통 몇 분) 뒤에 다시 시도해 주세요.\n" +
                          "토큰을 연결하면 한도가 훨씬 넉넉해집니다.";
                }

                var err = new Error(msg);
                err.status = res.status;
                throw err;
            });
        }, function () {
            throw new Error(
                "GitHub 에 연결하지 못했습니다.\n\n" +
                "인터넷 연결을 확인해 주세요. 사내망·방화벽 때문일 수도 있습니다."
            );
        });
    }

    function ghRepoPath(p, cfg) {
        var c = cfg || ghCfg();
        return "/repos/" + encodeURIComponent(c.owner) + "/" + encodeURIComponent(c.repo) + "/contents/" +
               p.split("/").map(encodeURIComponent).join("/");
    }

    /* 파일 하나 읽기. 없으면 null */
    function ghGet(path, cfg) {
        var c = cfg || ghCfg();
        return ghApi(ghRepoPath(path, c) + "?ref=" + encodeURIComponent(c.branch), null, c)
            .then(function (j) {
                return { text: fromB64(j.content), sha: j.sha };
            })
            .catch(function (e) {
                if (e.status === 404) return null;
                throw e;
            });
    }

    /* 파일 하나 쓰기 (있으면 덮어쓰기) */
    function ghPut(path, contentB64, message, cfg) {
        var c = cfg || ghCfg();

        return ghApi(ghRepoPath(path, c) + "?ref=" + encodeURIComponent(c.branch), null, c)
            .then(function (j) { return j.sha; })
            .catch(function (e) {
                if (e.status === 404) return null;   // 새 파일
                throw e;
            })
            .then(function (sha) {
                var body = {
                    message: message,
                    content: contentB64,
                    branch: c.branch
                };
                if (sha) body.sha = sha;
                return ghApi(ghRepoPath(path, c), { method: "PUT", body: body }, c);
            });
    }

    /* 연결 확인: 저장소가 보이고 쓰기 권한이 있는지 */
    function ghVerify(cfg) {
        return ghApi("/repos/" + encodeURIComponent(cfg.owner) + "/" + encodeURIComponent(cfg.repo), null, cfg)
            .then(function (repo) {
                if (!repo.permissions || !repo.permissions.push) {
                    throw new Error(
                        "이 저장소에 쓰기 권한이 없습니다.\n\n" +
                        "토큰을 만들 때 Repository access 에서 이 저장소를 고르고,\n" +
                        "Permissions 에서 Contents 를 'Read and write' 로 설정했는지 확인해 주세요."
                    );
                }
                return ghGet(NEWS_PATH, cfg).then(function (f) {
                    if (!f) {
                        throw new Error(
                            "저장소의 " + cfg.branch + " 브랜치에 news-data.js 가 없습니다.\n\n" +
                            "저장소가 아직 예전 버전인 것 같습니다. 먼저 지금 컴퓨터의 홈페이지 폴더 전체를\n" +
                            "GitHub 에 한 번 올린(push) 뒤에 다시 연결해 주세요.\n\n" +
                            "(브랜치 이름이 main 이 아닌지도 확인해 보세요)"
                        );
                    }
                    return repo;
                });
            });
    }

    /* 저장소에서 현재 데이터 읽어오기 */
    function parseDataFile(text, varName) {
        try {
            return new Function(text + "\n; return typeof " + varName + " !== 'undefined' ? " + varName + " : null;")();
        } catch (e) {
            throw new Error(
                varName + " 을(를) 읽지 못했습니다. 저장소의 파일이 손상되었을 수 있습니다.\n\n" + e.message
            );
        }
    }

    function ghLoadData() {
        return Promise.all([ghGet(NEWS_PATH), ghGet(PEOPLE_PATH), ghGet(PUB_PATH)]).then(function (r) {
            if (!r[0] || !r[1]) {
                throw new Error(
                    "저장소에서 news-data.js 또는 people-data.js 를 찾지 못했습니다.\n\n" +
                    "홈페이지 폴더 전체를 GitHub 에 올린 뒤 다시 시도해 주세요."
                );
            }
            return {
                news: parseDataFile(r[0].text, "NEWS_ITEMS") || [],
                people: parseDataFile(r[1].text, "PEOPLE_GROUPS") || [],
                /* publications-data.js 는 없을 수도 있으므로(예전 버전) 빈 목록으로 시작 */
                publications: r[2] ? (parseDataFile(r[2].text, "PUBLICATIONS") || []) : [],
                fromDraft: false,
                source: "github"
            };
        });
    }

    /* ============ IndexedDB (폴더 연결 정보) ============ */

    function idb(fn) {
        return new Promise(function (resolve) {
            var req;
            try { req = indexedDB.open(IDB_NAME, 1); }
            catch (e) { resolve(null); return; }

            req.onupgradeneeded = function () {
                if (!req.result.objectStoreNames.contains(IDB_STORE)) {
                    req.result.createObjectStore(IDB_STORE);
                }
            };
            req.onerror = function () { resolve(null); };
            req.onsuccess = function () {
                try { fn(req.result, resolve); } catch (e) { resolve(null); }
            };
        });
    }

    function idbSet(key, value) {
        return idb(function (db, done) {
            var tx = db.transaction(IDB_STORE, "readwrite");
            tx.objectStore(IDB_STORE).put(value, key);
            tx.oncomplete = function () { done(true); };
            tx.onerror = function () { done(null); };
        });
    }

    function idbGet(key) {
        return idb(function (db, done) {
            var tx = db.transaction(IDB_STORE, "readonly");
            var r = tx.objectStore(IDB_STORE).get(key);
            r.onsuccess = function () { done(r.result || null); };
            r.onerror = function () { done(null); };
        });
    }

    /* ============ 폴더 연결 ============ */

    function fsSupported() { return typeof window.showDirectoryPicker === "function"; }

    function verifyFolder(handle) {
        return handle.getFileHandle(NEWS_PATH)
            .then(function () { return handle.getFileHandle("index.html"); })
            .then(function () { return true; })
            .catch(function () { return false; });
    }

    function connectFolder() {
        if (!fsSupported()) {
            return Promise.reject(new Error(
                "이 브라우저는 폴더 연결을 지원하지 않습니다.\n\nChrome 또는 Edge 를 쓰거나, GitHub 방식을 이용해 주세요."
            ));
        }

        return window.showDirectoryPicker({ mode: "readwrite", id: "dlmath-site" })
            .then(function (handle) {
                return verifyFolder(handle).then(function (ok) {
                    if (!ok) {
                        throw new Error("홈페이지 폴더가 아닌 것 같습니다.\n\nindex.html 과 news-data.js 가 들어 있는 폴더를 골라 주세요.");
                    }
                    dirHandle = handle;
                    return idbSet("dir", handle);
                });
            })
            .then(function () { fire(); return true; });
    }

    function disconnectFolder() {
        dirHandle = null;
        idbSet("dir", null);
        fire();
    }

    function restoreFolder() {
        if (!fsSupported()) return Promise.resolve(false);

        return idbGet("dir").then(function (handle) {
            if (!handle || !handle.queryPermission) return false;
            return handle.queryPermission({ mode: "readwrite" }).then(function (p) {
                if (p === "granted") { dirHandle = handle; fire(); return true; }
                return false;
            });
        }).catch(function () { return false; });
    }

    function reauthorizeFolder() {
        return idbGet("dir").then(function (handle) {
            if (!handle || !handle.requestPermission) return false;
            return handle.requestPermission({ mode: "readwrite" }).then(function (p) {
                if (p === "granted") { dirHandle = handle; fire(); return true; }
                return false;
            });
        }).catch(function () { return false; });
    }

    function resolveDir(path) {
        var parts = path.split("/");
        var name = parts.pop();
        var p = Promise.resolve(dirHandle);
        parts.forEach(function (seg) {
            p = p.then(function (d) { return d.getDirectoryHandle(seg, { create: true }); });
        });
        return p.then(function (d) { return { dir: d, name: name }; });
    }

    function writeFileToFolder(path, contents) {
        if (!dirHandle) return Promise.reject(new Error("폴더가 연결되어 있지 않습니다."));

        return resolveDir(path)
            .then(function (t) { return t.dir.getFileHandle(t.name, { create: true }); })
            .then(function (fh) { return fh.createWritable(); })
            .then(function (w) {
                return Promise.resolve(w.write(contents))
                    .then(function () { return w.close(); })
                    .catch(function (err) {
                        /* 도중에 실패하면 반쪽짜리 파일이 남지 않도록 되돌린다 */
                        try { w.abort(); } catch (e) {}
                        throw err;
                    });
            });
    }

    function download(filename, text) {
        var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 100);
    }

    /* ============ 임시 저장 ============ */

    function readDraft() {
        try {
            var raw = localStorage.getItem(DRAFT_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function writeDraft(data) {
        try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); return true; }
        catch (e) { return false; }
    }

    function clearDraft() {
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    }

    function hasDraft() { return !!readDraft(); }

    /* ============ 데이터 읽기 ============ */

    function fromGlobals() {
        return {
            news: (typeof NEWS_ITEMS !== "undefined") ? clone(NEWS_ITEMS) : [],
            people: (typeof PEOPLE_GROUPS !== "undefined") ? clone(PEOPLE_GROUPS) : [],
            publications: (typeof PUBLICATIONS !== "undefined") ? clone(PUBLICATIONS) : [],
            fromDraft: false,
            source: dirHandle ? "folder" : "local"
        };
    }

    /* 지금 편집해야 할 데이터.
       아직 반영하지 못한 임시 저장본이 있으면 그것이 우선. */
    function load() {
        var draft = readDraft();
        if (draft && draft.news && draft.people) {
            return Promise.resolve({
                news: draft.news,
                people: draft.people,
                publications: draft.publications || [],
                fromDraft: true,
                source: "draft"
            });
        }
        if (target() === "github") {
            return ghLoadData().catch(function (e) {
                /* 저장소를 못 읽으면 최소한 편집기가 열리기는 해야 한다 */
                var d = fromGlobals();
                d.loadError = e.message || String(e);
                return d;
            });
        }
        return Promise.resolve(fromGlobals());
    }

    /* ============ 데이터 파일 본문 만들기 ============ */

    function bodyLiteral(body, indent) {
        var s = String(body || "");

        /* 백틱 문자열 안에서 특별한 뜻을 갖는 글자가 하나라도 있으면
           보기 좋은 형태를 포기하고 안전한 따옴표 문자열로 내보낸다.
           특히 역슬래시(\)는 LaTeX(\alpha, \xi)나 윈도우 경로(C:\...)에서 흔히 나오는데,
           그대로 두면 파일 전체가 문법 오류가 나서 News 가 통째로 사라진다. */
        if (/[`\\]/.test(s) || s.indexOf("${") !== -1) return q(s);

        /* 줄 앞의 들여쓰기는 그대로 두어 목록의 계층이 보이게 한다 */
        var lines = s.replace(/\s+$/, "").split("\n").map(function (l) {
            return l.trim() ? indent + "    " + l.replace(/\s+$/, "") : "";
        });
        return "`\n" + lines.join("\n") + "\n" + indent + "`";
    }

    function buildNewsFile(list) {
        var head =
"/* =========================================================\n" +
"   News 데이터 파일\n" +
"   ---------------------------------------------------------\n" +
"   ※ 이 파일은 편집기(admin.html)가 만들어 낸 파일입니다.\n" +
"      직접 고쳐도 되지만, 편집기를 쓰는 쪽이 안전합니다.\n" +
"\n" +
"   id      : 글 주소. news-post.html?id=<이 값> 으로 연결됩니다.\n" +
"   date    : YYYY-MM-DD. 이 날짜 기준 최신순 정렬.\n" +
"   title   : 제목\n" +
"   summary : 목록에 보이는 요약\n" +
"   image   : 대표 사진 경로. 없으면 \"\"\n" +
"   body    : 본문 (HTML)\n" +
"   ========================================================= */\n\n";

        var items = sortNews(list).map(function (n) {
            return "    {\n" +
                   "        id: " + q(n.id) + ",\n" +
                   "        date: " + q(n.date) + ",\n" +
                   "        title: " + q(n.title) + ",\n" +
                   "        summary: " + q(n.summary) + ",\n" +
                   "        image: " + q(n.image) + ",\n" +
                   "        body: " + bodyLiteral(n.body, "        ") + "\n" +
                   "    }";
        });

        if (!items.length) return head + "const NEWS_ITEMS = [];\n";
        return head + "const NEWS_ITEMS = [\n\n" + items.join(",\n\n") + "\n\n];\n";
    }

    var MEMBER_KEYS = ["name", "role", "degree", "current", "email", "interests", "homepage"];

    function buildPeopleFile(groups) {
        var head =
"/* =========================================================\n" +
"   People 데이터 파일\n" +
"   ---------------------------------------------------------\n" +
"   ※ 이 파일은 편집기(admin.html)가 만들어 낸 파일입니다.\n" +
"\n" +
"   그룹 = { title: \"그룹 이름\", members: [ 사람, ... ] }\n" +
"   사람 = { name, role, degree, current, email, interests, homepage }\n" +
"   비어 있는(\"\") 항목은 화면에 표시되지 않습니다.\n" +
"   ========================================================= */\n\n";

        var out = groups.map(function (g) {
            var members = (g.members || []).map(function (m) {
                return "            {\n" +
                    MEMBER_KEYS.map(function (k) {
                        return "                " + k + ": " + q(m[k]);
                    }).join(",\n") + "\n" +
                    "            }";
            });

            return "    {\n" +
                   "        title: " + q(g.title) + ",\n" +
                   "        members: [" + (members.length ? "\n" + members.join(",\n") + "\n        " : "") + "]\n" +
                   "    }";
        });

        if (!out.length) return head + "const PEOPLE_GROUPS = [];\n";
        return head + "const PEOPLE_GROUPS = [\n\n" + out.join(",\n\n") + "\n\n];\n";
    }

    var PUB_KEYS = ["year", "title", "venue", "color", "link"];

    function buildPublicationsFile(list) {
        var head =
"/* =========================================================\n" +
"   Publications 데이터 파일\n" +
"   ---------------------------------------------------------\n" +
"   ※ 이 파일은 편집기(admin.html)의 [Publications] 탭이\n" +
"      만들어 낸 파일입니다.\n" +
"\n" +
"   year  : 발표 연도. 이 값으로 연도별로 묶입니다.\n" +
"   title : 논문 제목\n" +
"   venue : 학술지 / 학회 이름과 권·호·쪽수\n" +
"   color : 학술지 글자색. \"\" 면 기본색(파랑)\n" +
"   bold  : true 면 학술지 이름을 굵게\n" +
"   link  : 누르면 열리는 주소. 비우면 제목으로 구글 학술검색을 엽니다.\n" +
"   ========================================================= */\n\n";

        /* 연도 내림차순. 같은 연도 안에서는 적어 둔 순서를 지킨다. */
        var sorted = list.map(function (p, i) { return { p: p, i: i }; })
            .sort(function (a, b) {
                var ya = parseInt(a.p.year, 10), yb = parseInt(b.p.year, 10);
                if (isNaN(ya) && isNaN(yb)) return a.i - b.i;
                if (isNaN(ya)) return 1;
                if (isNaN(yb)) return -1;
                if (yb !== ya) return yb - ya;
                return a.i - b.i;
            })
            .map(function (w) { return w.p; });

        var out = sorted.map(function (p) {
            return "    {\n" +
                   "        year: " + q(p.year) + ",\n" +
                   "        title: " + q(p.title) + ",\n" +
                   "        venue: " + q(p.venue) + ",\n" +
                   "        color: " + q(p.color) + ",\n" +
                   "        bold: " + (p.bold ? "true" : "false") + ",\n" +
                   "        link: " + q(p.link) + "\n" +
                   "    }";
        });

        if (!out.length) return head + "const PUBLICATIONS = [];\n";
        return head + "const PUBLICATIONS = [\n\n" + out.join(",\n\n") + "\n\n];\n";
    }

    /* ============ 저장 ============ */

    /* 만들어 낸 파일이 정말로 읽히는지 미리 확인한다.
       여기서 걸리면 홈페이지 파일에는 손도 대지 않는다. */
    function assertUsable(text, varName, what) {
        var v;
        try {
            v = new Function(text + "\n; return typeof " + varName + " !== 'undefined' ? " + varName + " : null;")();
        } catch (e) {
            throw new Error(
                what + " 파일을 만드는 중 문제가 발견되어 저장을 중단했습니다.\n" +
                "홈페이지는 그대로이고, 작성한 내용은 브라우저에 임시 보관했습니다.\n\n" +
                "(원인: " + e.message + ")"
            );
        }
        if (!Array.isArray(v)) {
            throw new Error(what + " 목록을 제대로 만들지 못해 저장을 중단했습니다. 홈페이지는 그대로입니다.");
        }
    }

    /* scope: "news" | "people" | "publications" | "both"
       resolve 값: "github" | "file" | "draft" */
    function save(data, scope, note) {
        scope = scope || "both";

        var snapshot = {
            news: data.news,
            people: data.people,
            publications: data.publications || [],
            savedAt: Date.now()
        };

        /* 아직 반영하지 못한 임시 저장본이 있으면 전부 함께 기록한다.
           한쪽만 쓰고 임시 저장본을 지우면 나머지 편집 내용이 사라진다. */
        if (hasDraft()) scope = "both";

        var jobs = [];
        if (scope === "both" || scope === "news") {
            jobs.push({ path: NEWS_PATH, text: buildNewsFile(data.news), what: "News", v: "NEWS_ITEMS" });
        }
        if (scope === "both" || scope === "people") {
            jobs.push({ path: PEOPLE_PATH, text: buildPeopleFile(data.people), what: "People", v: "PEOPLE_GROUPS" });
        }
        if (scope === "both" || scope === "publications") {
            jobs.push({ path: PUB_PATH, text: buildPublicationsFile(data.publications || []), what: "Publications", v: "PUBLICATIONS" });
        }

        var mode = target();

        if (mode === "none") {
            writeDraft(snapshot);
            return Promise.resolve("draft");
        }

        /* 쓰기 전에 검사 — 문제가 있으면 아무것도 건드리지 않는다 */
        try {
            jobs.forEach(function (j) { assertUsable(j.text, j.v, j.what); });
        } catch (e) {
            writeDraft(snapshot);
            return Promise.reject(e);
        }

        var p = Promise.resolve();

        jobs.forEach(function (j) {
            p = p.then(function () {
                return (mode === "github")
                    ? ghPut(j.path, toB64(j.text), (note || (j.what + " 수정")) + " (편집기)")
                    : writeFileToFolder(j.path, j.text);
            });
        });

        return p.then(function () {
            clearDraft();                      // scope 는 이 시점에 항상 "both" 이거나 임시 저장본이 없다
            return (mode === "github") ? "github" : "file";
        }).catch(function (err) {
            writeDraft(snapshot);
            throw err;
        });
    }

    /* ============ 사진 ============ */

    function safeBase(name) {
        var base = String(name || "image").replace(/\.[^.]+$/, "");
        base = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
        return base || "image";
    }

    /* 같은 초에 여러 장을 넣어도 이름이 겹치지 않도록 뒤에 임의 문자를 붙인다 */
    function stamp() {
        var d = new Date();
        function p(n) { return (n < 10 ? "0" : "") + n; }
        var rnd = Math.random().toString(36).slice(2, 6);
        return String(d.getFullYear()) + p(d.getMonth() + 1) + p(d.getDate()) +
               "-" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + "-" + rnd;
    }

    function shrink(file) {
        return createImageBitmap(file).then(function (bmp) {
            var tooBig = bmp.width > MAX_IMAGE_WIDTH;
            var heavy = file.size > KEEP_ORIGINAL_MAX;

            if (!tooBig && !heavy) {
                if (bmp.close) bmp.close();
                var ext = (/\.([a-z0-9]+)$/i.exec(file.name) || [, "jpg"])[1].toLowerCase();
                return { blob: file, ext: ext === "jpeg" ? "jpg" : ext };
            }

            var scale = tooBig ? (MAX_IMAGE_WIDTH / bmp.width) : 1;
            var w = Math.round(bmp.width * scale);
            var h = Math.round(bmp.height * scale);

            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(bmp, 0, 0, w, h);
            if (bmp.close) bmp.close();

            return new Promise(function (resolve) {
                canvas.toBlob(function (blob) {
                    resolve(blob ? { blob: blob, ext: "jpg" } : { blob: file, ext: "jpg" });
                }, "image/jpeg", 0.85);
            });
        }).catch(function () {
            var ext = (/\.([a-z0-9]+)$/i.exec(file.name) || [, "jpg"])[1].toLowerCase();
            return { blob: file, ext: ext };
        });
    }

    function blobToDataUrl(blob) {
        return new Promise(function (resolve, reject) {
            var r = new FileReader();
            r.onload = function () { resolve(r.result); };
            r.onerror = function () { reject(new Error("사진을 읽지 못했습니다.")); };
            r.readAsDataURL(blob);
        });
    }

    /* 사진 한 장 저장 → 글에 넣을 경로를 돌려준다 */
    function saveImage(file) {
        if (!file || !/^image\//.test(file.type)) {
            return Promise.reject(new Error(
                "사진 파일이 아닙니다" + (file && file.name ? ": " + file.name : "") + ".\n\n" +
                "jpg, png, gif, webp 파일을 넣어 주세요. (아이폰 HEIC 사진은 지원되지 않습니다)"
            ));
        }

        return shrink(file).then(function (r) {
            var name = stamp() + "-" + safeBase(file.name) + "." + r.ext;
            var path = "jpg/news/" + name;
            var mode = target();

            if (mode === "github") {
                return blobToB64(r.blob).then(function (b64) {
                    return ghPut(path, b64, "사진 추가: " + name + " (편집기)");
                }).then(function () {
                    return { path: path, embedded: false, size: r.blob.size };
                });
            }

            if (mode === "folder") {
                return writeFileToFolder(path, r.blob).then(function () {
                    return { path: path, embedded: false, size: r.blob.size };
                });
            }

            return blobToDataUrl(r.blob).then(function (url) {
                return { path: url, embedded: true, size: r.blob.size };
            });
        });
    }

    /* ============ 상단 바 ============ */

    function renderTopBar(active) {
        var host = $("topbar");
        if (!host) return;

        host.innerHTML = '' +
            "<h1>DLmath Lab 편집기</h1>" +
            '<nav class="admin-nav">' +
                '<a href="admin.html" class="' + (active === "manage" ? "on" : "") + '">글·구성원 관리</a>' +
                '<a href="admin-write.html" class="' + (active === "write" ? "on" : "") + '">새 글 쓰기</a>' +
            "</nav>" +
            '<div class="spacer"></div>' +
            '<div class="folder-box" id="folder-box"></div>';

        renderFolderBox();
        onChange(renderFolderBox);

        /* 토큰이 잠겨 있으면 바로 암호를 묻는다 */
        if (isLocked()) setTimeout(openUnlock, 60);
    }

    function renderFolderBox() {
        var box = $("folder-box");
        if (!box) return;

        var t = target();
        var locked = isLocked();

        var cls = locked ? "lock" : (t === "none" ? "" : "ok");
        var txt = locked ? ("GitHub · " + gh.owner + "/" + gh.repo + " — 잠김")
                : t === "github" ? ("GitHub · " + gh.owner + "/" + gh.repo)
                : t === "folder" ? "이 컴퓨터 폴더"
                : "연결 안 됨 — 저장해도 홈페이지에 반영되지 않습니다";

        box.innerHTML =
            '<span class="dot ' + cls + '"></span>' +
            '<span class="ftxt">' + esc(txt) + "</span>" +
            (locked ? '<button class="btn btn-sm btn-main" id="btn-unlock">암호 입력</button>' : "") +
            (t === "github" ? '<button class="btn btn-sm" id="btn-lock" title="이 브라우저에서 다시 잠급니다">잠그기</button>' : "") +
            '<button class="btn btn-sm' + (t === "none" && !locked ? " btn-main" : "") + '" id="btn-conn">연결 설정</button>';

        $("btn-conn").onclick = openSetup;
        if ($("btn-unlock")) $("btn-unlock").onclick = openUnlock;
        if ($("btn-lock")) $("btn-lock").onclick = function () { lock(); };
    }

    /* ============ 잠금 해제 창 ============ */

    function openUnlock() {
        if (document.querySelector(".modal-back.unlock")) return;

        var back = document.createElement("div");
        back.className = "modal-back unlock";
        back.innerHTML = '' +
        '<div class="modal" style="max-width:460px;">' +
            '<div class="modal-head"><h2>토큰 잠금 해제</h2></div>' +
            '<div class="modal-body">' +
                '<p class="desc" style="margin-top:6px;">' +
                    "GitHub 저장소: <b>" + esc(gh.owner + "/" + gh.repo) + "</b><br>" +
                    "연결할 때 정한 암호를 입력하세요. 브라우저를 닫으면 다시 잠깁니다." +
                "</p>" +
                '<div class="field">' +
                    '<input type="password" id="unlock-pass" placeholder="암호" autocomplete="current-password">' +
                    '<p class="desc" id="unlock-msg"></p>' +
                "</div>" +
                '<div class="opt-actions">' +
                    '<button class="btn btn-main" id="unlock-go">잠금 해제</button>' +
                    '<button class="btn" id="unlock-later">나중에</button>' +
                    '<div class="spacer"></div>' +
                    '<button class="btn btn-danger" id="unlock-forget">연결 끊기</button>' +
                "</div>" +
                '<p class="desc" style="margin-top:14px;">' +
                    "암호가 기억나지 않으면 [연결 끊기] 후, GitHub 에서 토큰을 새로 만들어 다시 연결하면 됩니다." +
                "</p>" +
            "</div>" +
        "</div>";

        document.body.appendChild(back);
        $("unlock-pass").focus();

        function close() { back.remove(); }

        function go() {
            var pass = $("unlock-pass").value;
            if (!pass) return;

            $("unlock-msg").textContent = "확인 중…";
            $("unlock-go").disabled = true;

            unlock(pass).then(function () {
                close();
                location.reload();
            }).catch(function (e) {
                $("unlock-msg").innerHTML = '<span style="color:#b3261e;">' + esc(e.message || e) + "</span>";
                $("unlock-go").disabled = false;
                $("unlock-pass").select();
            });
        }

        $("unlock-go").onclick = go;
        $("unlock-pass").addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
        $("unlock-later").onclick = close;
        $("unlock-forget").onclick = function () {
            if (!confirm("GitHub 연결 정보를 지울까요?\n\n다시 쓰려면 토큰을 새로 넣어야 합니다.")) return;
            ghForget();
            close();
            location.reload();
        };
    }

    /* ============ 연결 설정 창 ============ */

    function openSetup() {
        var back = document.createElement("div");
        back.className = "modal-back";
        back.innerHTML = '' +
        '<div class="modal">' +
            '<div class="modal-head">' +
                "<h2>연결 설정</h2>" +
                '<button class="btn btn-sm" id="setup-close">닫기</button>' +
            "</div>" +

            '<div class="modal-body">' +

                '<div class="opt" id="opt-github">' +
                    '<div class="opt-head"><b>GitHub 에 바로 올리기</b><span class="tag">권장</span></div>' +
                    '<p class="desc">저장하면 저장소에 바로 반영되고, 1~2분 뒤 실제 홈페이지에 나타납니다. 어느 컴퓨터에서든 됩니다.</p>' +

                    '<div class="two">' +
                        '<div class="field"><label for="gh-owner">소유자 (사용자/조직)</label>' +
                            '<input type="text" id="gh-owner" placeholder="dlmath-lab"></div>' +
                        '<div class="field"><label for="gh-repo">저장소 이름</label>' +
                            '<input type="text" id="gh-repo" placeholder="dlmath-lab.github.io"></div>' +
                    "</div>" +

                    '<div class="field" style="max-width:220px;"><label for="gh-branch">브랜치</label>' +
                        '<input type="text" id="gh-branch" placeholder="main"></div>' +

                    '<div class="field">' +
                        '<label for="gh-token">액세스 토큰</label>' +
                        '<input type="password" id="gh-token" placeholder="github_pat_… 로 시작하는 값" autocomplete="off">' +
                        '<p class="desc">' +
                            "GitHub → Settings → Developer settings → <b>Fine-grained personal access tokens</b> → Generate new token<br>" +
                            "· Repository access : <b>Only select repositories</b> 에서 이 저장소만 선택<br>" +
                            "· Permissions → Repository permissions → <b>Contents : Read and write</b><br>" +
                            "· 만료일(Expiration)은 짧게 잡는 것을 권합니다" +
                        "</p>" +
                    "</div>" +

                    '<div class="field">' +
                        '<label for="gh-pass">토큰 잠금 암호 <span style="color:var(--ku-crimson);">(꼭 정하세요)</span></label>' +
                        '<input type="password" id="gh-pass" placeholder="이 편집기에서만 쓰는 암호" autocomplete="new-password">' +
                        '<p class="desc">' +
                            "토큰을 이 암호로 <b>암호화해서</b> 보관합니다. 암호를 모르면 저장된 값에서 토큰을 꺼낼 수 없습니다.<br>" +
                            "편집기를 새로 열 때 이 암호를 한 번 입력하면 됩니다. (브라우저를 닫으면 다시 잠깁니다)<br>" +
                            "<b>잊어버리면 복구할 수 없습니다.</b> 그때는 GitHub 에서 토큰을 새로 만들어 다시 연결하면 됩니다." +
                        "</p>" +
                    "</div>" +

                    '<div class="warn">' +
                        "<b>이 편집기 파일은 GitHub 에 올리지 마세요.</b> 컴퓨터에서 파일로 열어도 잘 동작합니다.<br>" +
                        "토큰은 홈페이지에 올라가지 않고 이 브라우저에만 남습니다. " +
                        "공용 컴퓨터에서는 쓰지 마시고, 다 쓴 뒤에는 [연결 끊기]를 누르거나 GitHub 에서 토큰을 삭제하세요." +
                    "</div>" +

                    '<div class="opt-actions">' +
                        '<button class="btn btn-main" id="gh-connect">연결하고 확인</button>' +
                        '<button class="btn btn-danger hide" id="gh-forget">연결 끊기</button>' +
                        '<span class="setup-msg" id="gh-msg"></span>' +
                    "</div>" +
                "</div>" +

                '<div class="opt">' +
                    '<div class="opt-head"><b>이 컴퓨터의 폴더에 저장</b></div>' +
                    '<p class="desc">홈페이지 폴더에 파일을 바로 씁니다. GitHub 에 올리는 건 따로 하셔야 합니다. Chrome·Edge 에서만 됩니다.</p>' +
                    '<div class="opt-actions">' +
                        '<button class="btn" id="fs-connect">폴더 고르기</button>' +
                        '<button class="btn btn-danger hide" id="fs-forget">연결 끊기</button>' +
                        '<span class="setup-msg" id="fs-msg"></span>' +
                    "</div>" +
                "</div>" +

                '<div class="opt">' +
                    '<div class="opt-head"><b>연결하지 않고 쓰기</b></div>' +
                    '<p class="desc">편집 내용을 브라우저에 임시 보관해 두고, 관리 화면에서 데이터 파일을 내려받아 직접 덮어씁니다.</p>' +
                "</div>" +

            "</div>" +
        "</div>";

        document.body.appendChild(back);

        function close() { back.remove(); }
        back.addEventListener("click", function (e) { if (e.target === back) close(); });
        $("setup-close").onclick = close;

        /* 현재 값 채우기 */
        $("gh-owner").value = (gh && gh.owner) || "DLmath-Lab";
        $("gh-repo").value = (gh && gh.repo) || "dlmath-lab.github.io";
        $("gh-branch").value = (gh && gh.branch) || "main";
        $("gh-token").value = "";
        if (gh && gh.token) {
            $("gh-token").placeholder = "저장된 토큰이 있습니다 (바꾸려면 새로 입력)";
            $("gh-forget").classList.remove("hide");
            $("gh-msg").textContent = "연결됨";
        }
        if (dirHandle) {
            $("fs-forget").classList.remove("hide");
            $("fs-msg").textContent = "연결됨";
        }

        $("gh-connect").onclick = function () {
            var cfg = {
                owner: $("gh-owner").value.trim(),
                repo: $("gh-repo").value.trim(),
                branch: $("gh-branch").value.trim() || "main",
                token: $("gh-token").value.trim() || ghToken || ""
            };
            var pass = $("gh-pass").value;

            if (!cfg.owner || !cfg.repo) { $("gh-msg").textContent = "소유자와 저장소 이름을 입력해 주세요."; return; }
            if (!cfg.token) { $("gh-msg").textContent = "토큰을 입력해 주세요."; return; }

            if (!cryptoOK()) {
                alert("이 브라우저에서는 토큰 암호화를 지원하지 않아 토큰이 그대로 저장됩니다.\n\n" +
                      "Chrome 또는 Edge 최신 버전 사용을 권합니다.");
            } else if (!pass) {
                if (!confirm("암호를 정하지 않으면 토큰이 그대로 저장됩니다.\n\n" +
                             "이 컴퓨터를 쓸 수 있는 사람은 토큰을 꺼내 볼 수 있게 됩니다.\n" +
                             "그래도 암호 없이 진행할까요?")) {
                    $("gh-pass").focus();
                    return;
                }
            } else if (pass.length < 4) {
                alert("암호가 너무 짧습니다. 4자 이상으로 정해 주세요.");
                $("gh-pass").focus();
                return;
            }

            $("gh-msg").textContent = "확인 중…";
            $("gh-connect").disabled = true;

            ghVerify(cfg).then(function () {
                return ghSaveSettings(cfg, pass);
            }).then(function () {
                $("gh-msg").textContent = "연결됐습니다.";
                $("gh-token").value = "";
                $("gh-pass").value = "";
                setTimeout(function () { close(); location.reload(); }, 500);
            }).catch(function (e) {
                $("gh-msg").textContent = "";
                alert("연결하지 못했습니다.\n\n" + (e.message || e));
            }).then(function () {
                $("gh-connect").disabled = false;
            });
        };

        $("gh-forget").onclick = function () {
            if (!confirm("GitHub 연결을 끊고 저장된 토큰을 이 브라우저에서 지울까요?")) return;
            ghForget();
            close();
            location.reload();
        };

        $("fs-connect").onclick = function () {
            reauthorizeFolder().then(function (ok) {
                if (ok) { close(); location.reload(); return; }
                return connectFolder().then(function () { close(); location.reload(); })
                    .catch(function (err) {
                        if (err && err.name === "AbortError") return;
                        alert(err.message || String(err));
                    });
            });
        };

        $("fs-forget").onclick = function () {
            disconnectFolder();
            close();
            location.reload();
        };
    }

    /* ============ 시작 ============ */

    /* 페이지가 열릴 때 한 번 호출 */
    function init() {
        ghLoadSettings();
        if (gh) { fire(); return Promise.resolve(true); }
        return restoreFolder();
    }

    /* ============ 공개 ============ */

    return {
        esc: esc, clone: clone, q: q,
        todayStr: todayStr, fmtDate: fmtDate, sortNews: sortNews,

        init: init,
        load: load,
        save: save,
        target: target,
        targetLabel: targetLabel,
        onChange: onChange,
        openSetup: openSetup,
        openUnlock: openUnlock,
        isLocked: isLocked,
        unlock: unlock,
        lock: lock,

        hasDraft: hasDraft,
        clearDraft: clearDraft,

        buildNewsFile: buildNewsFile,
        buildPublicationsFile: buildPublicationsFile,
        buildPeopleFile: buildPeopleFile,
        download: download,

        saveImage: saveImage,
        renderTopBar: renderTopBar,

        MEMBER_KEYS: MEMBER_KEYS
    };
})();
