"use strict";
(() => {
  // src/insight/stock-characters.js
  var UID = 0;
  var RATIO = 400 / 440;
  var ART = {
    bull: '<svg xmlns="http://www.w3.org/2000/svg" data-char="bull" viewBox="0 0 400 440" __SIZE__ role="img" aria-label="\uD314\uC9F1 \uB080 \uD669\uC18C \uCE90\uB9AD\uD130"><defs><filter id="fzbull__UID__" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="turbulence" baseFrequency="0.18 0.22" numOctaves="3" seed="8" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap></filter><filter id="wbbull__UID__" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="4" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="7"></feDisplacementMap></filter></defs><ellipse cx="200" cy="428" rx="122" ry="9" fill="#DDD5BC"></ellipse><g filter="url(#wbbull__UID__)"><path d="M136,120 C100,112 66,86 56,34 C94,46 128,76 140,102 C142,110 141,116 136,120 Z" fill="#EDCA82"></path><path d="M264,120 C300,112 334,86 344,34 C306,46 272,76 260,102 C258,110 259,116 264,120 Z" fill="#EDCA82"></path></g><g filter="url(#fzbull__UID__)" fill="#FB4148"><ellipse cx="200" cy="170" rx="128" ry="106"></ellipse><ellipse cx="200" cy="298" rx="118" ry="100"></ellipse><ellipse cx="92" cy="320" rx="34" ry="50" transform="rotate(10 92 320)"></ellipse><ellipse cx="308" cy="320" rx="34" ry="50" transform="rotate(-10 308 320)"></ellipse><rect x="148" y="372" width="46" height="42" rx="17"></rect><rect x="206" y="372" width="46" height="42" rx="17"></rect></g><g filter="url(#wbbull__UID__)"><circle cx="200" cy="288" r="14" fill="none" stroke="#F5B23E" stroke-width="7"></circle><ellipse cx="200" cy="250" rx="52" ry="32" fill="#C9273C"></ellipse><ellipse cx="176" cy="246" rx="9" ry="12" fill="#111111" transform="rotate(-10 176 246)"></ellipse><ellipse cx="224" cy="246" rx="9" ry="12" fill="#111111" transform="rotate(10 224 246)"></ellipse><rect x="142" y="398" width="56" height="24" rx="11" fill="#35242E"></rect><rect x="202" y="398" width="56" height="24" rx="11" fill="#35242E"></rect><path d="__BROWL__" fill="none" stroke="#111111" stroke-width="11" stroke-linecap="round"></path><path d="__BROWR__" fill="none" stroke="#111111" stroke-width="11" stroke-linecap="round"></path><rect x="140" y="164" width="32" height="46" rx="15" fill="#111111"></rect><rect x="228" y="164" width="32" height="46" rx="15" fill="#111111"></rect><path d="__MOUTH__" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path><path d="M102,326 C152,312 206,314 232,324" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path><path d="M298,346 C252,330 196,334 168,344" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path><path d="M232,324 C242,329 242,338 234,342" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path><path d="M168,344 C159,348 158,356 166,359" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path></g><g data-part="doodles" filter="url(#wbbull__UID__)" fill="none" stroke="__DOODLECOLOR__" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M36,148 L66,148 L66,112 L96,112 L96,76 L110,76"></path><path d="M100,66 L114,74 L104,88"></path><path d="M118,34 L118,54 M108,44 L128,44"></path><path d="M338,96 L338,110 M331,110 L345,110 L345,140 L331,140 Z M338,140 L338,152"></path><path d="M362,120 L362,132 M356,132 L368,132 L368,156 L356,156 Z M362,156 L362,166"></path><path d="M352,44 L356,56 L368,60 L356,64 L352,76 L348,64 L336,60 L348,56 Z"></path><path d="M36,206 L39,215 L48,218 L39,221 L36,230 L33,221 L24,218 L33,215 Z"></path><circle cx="44" cy="394" r="15"></circle><path d="M36,394 L52,394"></path><circle cx="76" cy="414" r="11"></circle><path d="M70,414 L82,414"></path></g></svg>',
    bear: '<svg xmlns="http://www.w3.org/2000/svg" data-char="bear" viewBox="0 0 400 440" __SIZE__ role="img" aria-label="\uAC71\uC815\uD558\uB294 \uACF0 \uCE90\uB9AD\uD130"><defs><filter id="fzbear__UID__" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="turbulence" baseFrequency="0.18 0.22" numOctaves="3" seed="3" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap></filter><filter id="wbbear__UID__" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="7"></feDisplacementMap></filter></defs><ellipse cx="200" cy="424" rx="118" ry="9" fill="#DDD5BC"></ellipse><g filter="url(#fzbear__UID__)" fill="#4B7FE3"><circle cx="118" cy="84" r="36"></circle><circle cx="282" cy="84" r="36"></circle><ellipse cx="200" cy="172" rx="122" ry="102"></ellipse><ellipse cx="200" cy="296" rx="112" ry="96"></ellipse><ellipse cx="98" cy="288" rx="28" ry="58" transform="rotate(12 98 288)"></ellipse><ellipse cx="302" cy="288" rx="28" ry="58" transform="rotate(-12 302 288)"></ellipse><rect x="150" y="368" width="44" height="40" rx="16"></rect><rect x="206" y="368" width="44" height="40" rx="16"></rect></g><g filter="url(#wbbear__UID__)"><circle cx="118" cy="86" r="15" fill="#2B4C8F"></circle><circle cx="282" cy="86" r="15" fill="#2B4C8F"></circle><ellipse cx="200" cy="248" rx="50" ry="33" fill="#8FB3F2"></ellipse><ellipse cx="200" cy="238" rx="12" ry="9" fill="#111111"></ellipse><path d="M200,247 L200,258" stroke="#111111" stroke-width="5" stroke-linecap="round"></path><path d="M184,268 Q200,258 216,268" fill="none" stroke="#111111" stroke-width="7" stroke-linecap="round"></path><path d="M130,156 C150,150 170,142 186,138" fill="none" stroke="#111111" stroke-width="10" stroke-linecap="round"></path><path d="M270,156 C250,150 230,142 214,138" fill="none" stroke="#111111" stroke-width="10" stroke-linecap="round"></path><rect x="146" y="164" width="28" height="40" rx="13" fill="#111111"></rect><rect x="226" y="164" width="28" height="40" rx="13" fill="#111111"></rect><path d="M106,216 L124,212 M104,226 L122,222" stroke="#2B4C8F" stroke-width="5" stroke-linecap="round"></path><path d="M294,216 L276,212 M296,226 L278,222" stroke="#2B4C8F" stroke-width="5" stroke-linecap="round"></path><path d="M112,330 C120,338 132,338 140,332" fill="none" stroke="#111111" stroke-width="7" stroke-linecap="round"></path><path d="M288,330 C280,338 268,338 260,332" fill="none" stroke="#111111" stroke-width="7" stroke-linecap="round"></path><rect x="144" y="394" width="54" height="22" rx="10" fill="#1E3560"></rect><rect x="202" y="394" width="54" height="22" rx="10" fill="#1E3560"></rect></g><g data-part="doodles" filter="url(#wbbear__UID__)" fill="none" stroke="__DOODLECOLOR__" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M34,84 C30,64 52,58 62,64 C66,46 96,46 98,64 C114,62 118,84 104,88 L40,88 Z"></path><path d="M52,100 L46,114 M78,100 L72,114"></path><path d="M320,50 L364,94 M364,94 L344,90 M364,94 L360,74"></path><path d="M340,300 L340,314 M333,314 L347,314 L347,344 L333,344 Z M340,344 L340,356"></path><path d="M364,326 L364,338 M358,338 L370,338 L370,360 L358,360 Z M364,360 L364,368"></path><path d="M38,250 L58,250"></path><path d="M42,320 L45,329 L54,332 L45,335 L42,344 L39,335 L30,332 L39,329 Z"></path></g></svg>',
    owl: '<svg xmlns="http://www.w3.org/2000/svg" data-char="owl" viewBox="0 0 400 440" __SIZE__ role="img" aria-label="\uBD84\uC11D\uD558\uB294 \uBD80\uC5C9\uC774 \uCE90\uB9AD\uD130"><defs><filter id="fzowl__UID__" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="turbulence" baseFrequency="0.18 0.22" numOctaves="3" seed="11" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap></filter><filter id="wbowl__UID__" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="6" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="7"></feDisplacementMap></filter></defs><ellipse cx="200" cy="424" rx="120" ry="9" fill="#DDD5BC"></ellipse><g filter="url(#fzowl__UID__)" fill="#F2A93B"><path d="M118,132 L100,36 L180,84 Z"></path><path d="M282,132 L300,36 L220,84 Z"></path><ellipse cx="200" cy="245" rx="135" ry="158"></ellipse><ellipse cx="72" cy="262" rx="26" ry="62" transform="rotate(16 72 262)"></ellipse><ellipse cx="328" cy="262" rx="26" ry="62" transform="rotate(-16 328 262)"></ellipse></g><g filter="url(#wbowl__UID__)"><ellipse cx="200" cy="312" rx="78" ry="80" fill="#F7EFDB"></ellipse><path d="M172,298 L200,284 L228,298" fill="none" stroke="#CE7F1D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M172,326 L200,312 L228,326" fill="none" stroke="#CE7F1D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M176,354 L200,342 L224,354" fill="none" stroke="#CE7F1D" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="150" cy="172" r="38" fill="#FFFFFF"></circle><circle cx="250" cy="172" r="38" fill="#FFFFFF"></circle><path d="M188,166 Q200,158 212,166" fill="none" stroke="#16233F" stroke-width="6" stroke-linecap="round"></path><circle cx="152" cy="176" r="12" fill="#111111"></circle><circle cx="248" cy="176" r="12" fill="#111111"></circle><circle cx="148" cy="171" r="4" fill="#FFFFFF"></circle><circle cx="244" cy="171" r="4" fill="#FFFFFF"></circle><path d="M118,122 Q146,112 172,120" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path><path d="M282,122 Q254,112 228,120" fill="none" stroke="#111111" stroke-width="8" stroke-linecap="round"></path><path d="M200,208 L180,222 Q200,244 220,222 Z" fill="#D9661E"></path><rect x="156" y="398" width="36" height="20" rx="9" fill="#D9661E"></rect><rect x="208" y="398" width="36" height="20" rx="9" fill="#D9661E"></rect></g><g data-part="doodles" filter="url(#wbowl__UID__)" fill="none" stroke="__DOODLECOLOR__" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="58" cy="78" r="17"></circle><path d="M58,48 L58,36 M32,64 L22,56 M84,64 L94,56 M50,100 L66,100 M52,108 L64,108"></path><path d="M28,340 C48,318 58,352 82,326"></path><circle cx="86" cy="324" r="5" fill="__DOODLECOLOR__"></circle><path d="M346,60 L350,72 L362,76 L350,80 L346,92 L342,80 L330,76 L342,72 Z"></path><circle cx="348" cy="262" r="22" stroke-width="6"></circle><path d="M362,278 L382,300" stroke-width="8"></path></g></svg>'
  };
  var HEAD_VB = { bull: "52 16 296 296", bear: "60 30 280 280", owl: "55 58 290 272" };
  var FACE = {
    calm: { "bl": "M124,146 C144,136 170,144 188,160", "br": "M276,146 C256,136 230,144 212,160", "m": "" },
    excited: { "bl": "M126,134 C146,120 168,120 186,132", "br": "M274,134 C254,120 232,120 214,132", "m": "M182,262 Q200,276 218,262" }
  };
  function svg(name, opts) {
    opts = opts || {};
    var s = ART[name];
    if (!s) throw new Error("unknown character: " + name + " (bull | bear | owl)");
    var u = "_sc" + ++UID;
    s = s.split("__UID__").join(u);
    var face = FACE[opts.mood] || FACE.calm;
    s = s.split("__BROWL__").join(face.bl).split("__BROWR__").join(face.br).split("__MOUTH__").join(face.m);
    if (opts.doodles === false || opts.variant === "head") {
      var di = s.indexOf('<g data-part="doodles"');
      if (di >= 0) {
        var de = s.indexOf("</g>", di) + 4;
        s = s.slice(0, di) + s.slice(de);
      }
    } else {
      s = s.split("__DOODLECOLOR__").join(opts.doodleColor || "#24304A");
    }
    var size = opts.size || 200, w, h;
    if (opts.variant === "head") {
      s = s.replace(/viewBox="[^"]*"/, 'viewBox="' + HEAD_VB[name] + '"');
      w = size;
      h = size;
    } else {
      h = size;
      w = Math.round(size * RATIO);
    }
    s = s.replace("__SIZE__", 'width="' + w + '" height="' + h + '"');
    return s;
  }

  // src/sidepanel/sidepanel.ts
  var FN = "https://xpjtgmckrazfbyghkeve.supabase.co/functions/v1/prices";
  var APP_URL_DEFAULT = "https://hold-web.vercel.app";
  var SUPA = "https://xpjtgmckrazfbyghkeve.supabase.co";
  var ANON = "sb_publishable_YjEDQ3l-0wf3SM23JMTRqQ_R8_eqs9i";
  var SEED_CASH = 1e7;
  var tabId = null;
  var symbol = null;
  var symbolLabel = "";
  var quote = null;
  var levels = [];
  var closesG = [];
  var $ = (id) => document.getElementById(id);
  function detectSymbol(url, title) {
    try {
      const u = new URL(url);
      const h = u.hostname;
      let m;
      if (h.endsWith("finance.naver.com")) {
        m = u.search.match(/code=(\d{6})/);
        if (m) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] };
      }
      if (h.endsWith("m.stock.naver.com") || h.endsWith("stock.naver.com")) {
        m = u.pathname.match(/\/(?:domestic|worldstock)\/(?:stock|index)\/([A-Za-z0-9.]{1,12})/);
        if (m) {
          const raw = m[1].toUpperCase();
          const code = raw.replace(/\.[OKN]$/, "");
          return { code, label: title.split(/[:|-]/)[0].trim() || code };
        }
      }
      if (h.endsWith("tradingview.com")) {
        m = (u.search + " " + u.pathname).match(/symbol=(?:[A-Z]+(?:%3A|:))?([A-Z0-9.]{1,10})/) || u.pathname.match(/symbols\/(?:KRX-)?([A-Z0-9.]{1,10})/);
        if (m) return { code: m[1].toUpperCase(), label: m[1].toUpperCase() };
      }
      if (h.endsWith("tossinvest.com")) {
        m = u.pathname.match(/stocks\/A?(\d{6})(?:[/?#]|$)/);
        if (m) return { code: m[1], label: title.split(/[:|·-]/)[0].trim() || m[1] };
        m = u.pathname.match(/stocks\/([A-Z]{1,6})(?:[/?#]|$)/);
        if (m) return { code: m[1], label: m[1] };
      }
      if (h.endsWith("google.com")) {
        m = u.pathname.match(/\/finance\/quote\/([A-Z0-9.]{1,10}):[A-Z]{2,10}/);
        if (m) return { code: m[1], label: m[1] };
      }
      if (h.endsWith("finance.yahoo.com")) {
        m = u.pathname.match(/\/quote\/([A-Za-z0-9.\-]{1,12})(?:[/?#]|$)/);
        if (m) {
          const raw = m[1].toUpperCase();
          const kr = raw.match(/^(\d{6})\.(?:KS|KQ)$/);
          const code = kr ? kr[1] : raw.replace(/\..*$/, "");
          return { code, label: code };
        }
      }
      if (h.endsWith("finance.daum.net")) {
        m = u.pathname.match(/\/quotes\/A(\d{6})/);
        if (m) return { code: m[1], label: title.split(/[|·:\-–]/)[0].trim() || m[1] };
      }
      m = u.search.match(/[?&](?:code|symbol|ticker|stock_?code|shcode)=A?(\d{6})(?:\D|$)/i);
      if (m) return { code: m[1], label: title.split(/[|·:\-–]/)[0].trim() || m[1] };
      m = u.pathname.match(/\/A(\d{6})(?:[/?#.]|$)/);
      if (m) return { code: m[1], label: title.split(/[|·:\-–]/)[0].trim() || m[1] };
      if (!h.endsWith("stockersclub.com")) {
        m = url.match(/[^0-9a-fA-F](\d{6})(?:[^0-9a-fA-F]|$)/);
        if (m) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] };
      }
    } catch {
    }
    return null;
  }
  async function detectFromPage(tid) {
    try {
      const [res] = await chrome.scripting.executeScript({
        target: { tabId: tid },
        func: () => {
          try {
            for (const el of Array.from(document.querySelectorAll("[data-symbol],[data-ticker],[data-code]")).slice(0, 20)) {
              const v = (el.getAttribute("data-symbol") || el.getAttribute("data-ticker") || el.getAttribute("data-code") || "").toUpperCase().replace(/^[A-Z]+:/, "");
              let m = v.match(/^A?(\d{6})$/);
              if (m) return { code: m[1], label: m[1] };
              m = v.match(/^([A-Z]{1,6})$/);
              if (m) return { code: m[1], label: m[1] };
            }
          } catch {
          }
          const texts = [document.title];
          const og = document.querySelector('meta[property="og:title"]');
          if (og?.content) texts.push(og.content);
          for (const sel of ["h1", "h2", '[class*="symbol" i]', '[class*="ticker" i]']) {
            const el = document.querySelector(sel);
            if (el?.textContent) texts.push(el.textContent.slice(0, 200));
          }
          texts.push((document.body?.innerText || "").slice(0, 3e3));
          const NOT_TICKER = /* @__PURE__ */ new Set(["ETF", "ETN", "ADR", "IPO", "USA", "KOSPI", "KOSDAQ", "KRX", "NYSE", "AMEX", "PER", "ROE", "EPS", "PBR", "VI", "AI"]);
          for (const s of texts) {
            if (!s) continue;
            let m = s.match(/\((\d{6})\)/) || s.match(/(?:^|[^0-9])(\d{6})(?:[^0-9]|$)/);
            if (m) return { code: m[1], label: s.split(/[:|(\-]/)[0].trim().slice(0, 20) || m[1] };
            m = s.match(/(?:NASDAQ|NYSE|AMEX|NAS)\s*[::]\s*([A-Z0-9.]{1,6})\b/i);
            if (m && !NOT_TICKER.has(m[1].toUpperCase())) return { code: m[1].toUpperCase(), label: m[1].toUpperCase() };
            m = s.match(/\$([A-Z]{1,6})\b/) || s.match(/\b([A-Z]{2,6})\s*\$\s?\d/) || s.match(/^\s*([A-Z]{2,6})\s*[:\-]/);
            if (m && !NOT_TICKER.has(m[1])) return { code: m[1], label: m[1] };
          }
          for (const s of texts.slice(0, 6)) {
            const m = s?.match(/\(([A-Z]{1,6})\)/);
            if (m && !NOT_TICKER.has(m[1])) return { code: m[1], label: s.split(/[:|(\-]/)[0].trim().slice(0, 20) || m[1] };
          }
          return null;
        }
      });
      return res?.result ?? null;
    } catch {
      return null;
    }
  }
  function swingLevels(closes, current) {
    const piv = [];
    for (let i = 2; i < closes.length - 2; i++) {
      const c = closes[i];
      const hi = c >= closes[i - 1] && c >= closes[i - 2] && c >= closes[i + 1] && c >= closes[i + 2];
      const lo = c <= closes[i - 1] && c <= closes[i - 2] && c <= closes[i + 1] && c <= closes[i + 2];
      if (hi || lo) piv.push(c);
    }
    const clusters = [];
    for (const p of piv.sort((a, b) => a - b)) {
      const last = clusters[clusters.length - 1];
      if (last && Math.abs(p - last.sum / last.n) / (last.sum / last.n) < 0.01) {
        last.sum += p;
        last.n++;
      } else {
        clusters.push({ sum: p, n: 1 });
      }
    }
    const pts = clusters.map((c) => ({ price: c.sum / c.n, touches: c.n }));
    const sup = pts.filter((p) => p.price < current).sort((a, b) => b.price - a.price).slice(0, 2);
    const res = pts.filter((p) => p.price > current).sort((a, b) => a.price - b.price).slice(0, 2);
    return [
      ...sup.map((p) => ({ ...p, kind: "support" })),
      ...res.map((p) => ({ ...p, kind: "resistance" }))
    ];
  }
  var fmt = (n, currency = "KRW") => currency === "KRW" ? `${Math.round(n).toLocaleString("ko-KR")}\uC6D0` : `$${(Math.round(n * 100) / 100).toLocaleString("en-US")}`;
  async function loadSymbol(code, label) {
    symbol = code;
    symbolLabel = label;
    $("symEmpty").style.display = "none";
    $("symInfo").style.display = "block";
    $("symName").textContent = label;
    $("symCode").textContent = code;
    $("symPrice").textContent = "\u2026";
    $("symPrice").classList.add("loading");
    $("symChange").textContent = "";
    try {
      const getQuote = () => fetch(`${FN}/quotes?symbols=${encodeURIComponent(code)}`).then((r) => r.json()).then((j) => j?.quotes?.[code] ?? null).catch(() => null);
      const [q0, kRes] = await Promise.all([
        getQuote(),
        fetch(`${FN}/klines?symbol=${encodeURIComponent(code)}&limit=90`).then((r) => r.json())
      ]);
      quote = q0;
      const closes = (kRes?.candles ?? []).map((c) => c.close).filter((v) => v > 0);
      closesG = closes;
      const kisName = typeof kRes?.name === "string" ? kRes.name.trim() : "";
      if (kisName && symbol === code) {
        symbolLabel = kisName;
        $("symName").textContent = kisName;
      }
      if (!quote) {
        await new Promise((r) => setTimeout(r, 1500));
        quote = await getQuote();
      }
      let basis = "\uC815\uADDC\uC7A5 \uAE30\uC900 \xB7 \uC2DC\uAC04\uC678 \uBBF8\uBC18\uC601";
      if (!quote && closes.length >= 2) {
        const last = closes[closes.length - 1];
        const prev = closes[closes.length - 2];
        quote = {
          price: last,
          changePercent: prev > 0 ? (last - prev) / prev * 100 : null,
          previousClose: prev,
          currency: /^\d{6}$/.test(code) ? "KRW" : "USD"
        };
        basis = "\uCD5C\uADFC \uC885\uAC00 \uAE30\uC900";
      }
      $("symBasis").textContent = basis;
      $("symPrice").classList.remove("loading");
      if (quote) {
        $("symPrice").textContent = fmt(quote.price, quote.currency);
        const ch = quote.changePercent;
        if (ch != null) {
          const up = ch >= 0;
          $("symChange").textContent = `${up ? "+" : ""}${ch.toFixed(2)}%`;
          $("symChange").style.color = up ? "#E36A5C" : "#7FA8E8";
        }
        $("rrEntry").value = String(rrRound(quote.price));
        if (!$("rrStopPct").value) $("rrStopPct").value = "3";
        if (!$("rrTargetPct").value) $("rrTargetPct").value = "12";
        rrLast.stop = "pct";
        rrLast.target = "pct";
        rrSync("entry");
      } else {
        $("symPrice").textContent = "\uC2DC\uC138 \uC5C6\uC74C";
        $("symPrice").classList.remove("loading");
      }
      levels = quote && closes.length >= 10 ? swingLevels(closes, quote.price) : [];
      renderLevels();
      renderTrend();
      renderFacts();
      renderTrade();
      void loadNews();
    } catch {
      $("symPrice").textContent = "\uC5F0\uACB0 \uC2E4\uD328";
      $("symPrice").classList.remove("loading");
    }
  }
  function smaAt(a, n, back = 0) {
    const end = a.length - back;
    if (end - n < 0) return null;
    const s = a.slice(end - n, end);
    return s.reduce((x, y) => x + y, 0) / n;
  }
  function trendLine(closes, n, slopeBack) {
    const last = closes[closes.length - 1];
    const now = smaAt(closes, n);
    const before = smaAt(closes, n, slopeBack);
    if (now == null || before == null) return null;
    const above = last > now;
    const rising = now > before;
    const falling = now < before;
    const dir = above && rising ? "\uC0C1\uC2B9" : !above && falling ? "\uD558\uB77D" : "\uD6A1\uBCF4";
    return {
      dir,
      text: `\uC885\uAC00\uAC00 ${n}\uC77C\uC120 ${above ? "\uC704" : "\uC544\uB798"} \xB7 ${n}\uC77C\uC120 ${rising ? "\uC6B0\uC0C1\uD5A5" : falling ? "\uC6B0\uD558\uD5A5" : "\uC218\uD3C9"}`
    };
  }
  var DIR_COLOR = { \uC0C1\uC2B9: "#E36A5C", \uD558\uB77D: "#7FA8E8", \uD6A1\uBCF4: "#99A1B3" };
  var DIR_BG = {
    \uC0C1\uC2B9: "rgba(227,106,92,0.14)",
    \uD558\uB77D: "rgba(127,168,232,0.14)",
    \uD6A1\uBCF4: "rgba(153,161,179,0.12)"
  };
  function renderTrend() {
    const card = $("trendCard");
    const s = trendLine(closesG, 20, 5);
    const l = trendLine(closesG, 60, 10);
    if (!s && !l) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";
    const mk = (label, t) => t ? `<span style="display:inline-block;width:58px;color:#7A8296">${label}</span><span class="chip" style="background:${DIR_BG[t.dir]};color:${DIR_COLOR[t.dir]}">${t.dir}</span><span style="color:#99A1B3;margin-left:7px;font-size:11.5px">${t.text}</span>` : `<span style="display:inline-block;width:58px;color:#7A8296">${label}</span><span style="color:#5A6170">\uB370\uC774\uD130 \uBD80\uC871</span>`;
    $("trendShort").innerHTML = mk("\uB2E8\uAE30 20\uC77C", s);
    $("trendLong").innerHTML = mk("\uC7A5\uAE30 60\uC77C", l);
  }
  function renderFacts() {
    const list = $("factList");
    list.innerHTML = "";
    if (!quote || closesG.length < 20) return;
    $("newsCard").style.display = "block";
    const cur = quote.currency;
    const last = quote.price;
    const hi = Math.max(...closesG);
    const lo = Math.min(...closesG);
    const diffs = [];
    for (let i = closesG.length - 20; i < closesG.length; i++) {
      if (i <= 0) continue;
      diffs.push(Math.abs((closesG[i] - closesG[i - 1]) / closesG[i - 1]) * 100);
    }
    const avgVol = diffs.length ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
    const facts = [];
    const ch = quote.changePercent;
    if (ch != null && avgVol > 0 && Math.abs(ch) > avgVol * 2) {
      facts.push(`\uC624\uB298 \uBCC0\uB3D9(${ch >= 0 ? "+" : ""}${ch.toFixed(1)}%)\uC774 \uD3C9\uC18C \uD558\uB8E8 \uD3C9\uADE0(\xB1${avgVol.toFixed(1)}%)\uBCF4\uB2E4 \uCEE4\uC694`);
    }
    facts.push(`\uCD5C\uADFC 90\uC77C \uACE0\uC810(${fmt(hi, cur)}) \uB300\uBE44 ${((last - hi) / hi * 100).toFixed(1)}% \xB7 \uC800\uC810(${fmt(lo, cur)}) \uB300\uBE44 +${((last - lo) / lo * 100).toFixed(1)}%`);
    if (avgVol > 0) facts.push(`\uCD5C\uADFC 20\uC77C \uD558\uB8E8 \uD3C9\uADE0 \uBCC0\uB3D9 \xB1${avgVol.toFixed(1)}%`);
    for (const f of facts) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:7px;font-size:11.5px;line-height:1.55;color:#D6DAE3;padding:3.5px 0";
      row.innerHTML = `<span style="flex:0 0 auto;width:5px;height:5px;border-radius:99px;background:#F5B23E;margin-top:6px"></span><span>${f}</span>`;
      list.appendChild(row);
    }
  }
  function timeAgo(pub) {
    const t = new Date(pub).getTime();
    if (!Number.isFinite(t)) return "";
    const m = Math.max(0, Math.round((Date.now() - t) / 6e4));
    if (m < 60) return `${m}\uBD84 \uC804`;
    if (m < 1440) return `${Math.round(m / 60)}\uC2DC\uAC04 \uC804`;
    return `${Math.round(m / 1440)}\uC77C \uC804`;
  }
  async function loadNews() {
    const list = $("newsList");
    list.innerHTML = "";
    const q = (symbolLabel && !/^\d{6}$/.test(symbolLabel) ? symbolLabel : symbol) ?? "";
    if (!q) return;
    try {
      const res = await fetch(`${FN}/news?q=${encodeURIComponent(q + " \uC8FC\uAC00")}`).then((r) => r.json());
      const items = res?.items ?? [];
      if (!items.length) return;
      $("newsCard").style.display = "block";
      for (const it of items.slice(0, 4)) {
        const a = document.createElement("a");
        a.href = it.link;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.className = "newsRow";
        const meta = [it.source, timeAgo(it.pub)].filter(Boolean).join(" \xB7 ");
        a.innerHTML = `${it.title}${meta ? `<span style="display:block;margin-top:3px;font-size:10px;color:#5A6170">${meta}</span>` : ""}`;
        list.appendChild(a);
      }
    } catch {
    }
  }
  function renderLevels() {
    const card = $("levelCard");
    const list = $("levelList");
    if (!levels.length || !quote) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";
    list.innerHTML = "";
    const sorted = [...levels].sort((a, b) => b.price - a.price);
    let currentDrawn = false;
    for (const l of sorted) {
      if (!currentDrawn && l.price < quote.price) {
        list.appendChild(currentPriceRow());
        currentDrawn = true;
      }
      const sup = l.kind === "support";
      const color = sup ? "#57C7A4" : "#FF6B77";
      const distPct = (l.price - quote.price) / quote.price * 100;
      const row = document.createElement("div");
      row.className = "row";
      row.style.padding = "5px 0";
      row.innerHTML = `<span style="width:6px;height:6px;border-radius:99px;background:${color};flex:0 0 auto"></span><span style="color:${color};font-weight:700;font-size:11.5px;flex:0 0 26px">${sup ? "\uC9C0\uC9C0" : "\uC800\uD56D"}</span><span class="mono" style="font-weight:600">${fmt(l.price, quote.currency)}</span><span class="mono" style="font-size:10.5px;color:#7A8296">${distPct >= 0 ? "+" : ""}${distPct.toFixed(1)}%</span><span style="flex:1"></span><span class="chip" style="font-size:9.5px">${l.touches}\uBC88 \uD130\uCE58</span>`;
      list.appendChild(row);
    }
    if (!currentDrawn) list.appendChild(currentPriceRow());
  }
  function currentPriceRow() {
    const row = document.createElement("div");
    row.className = "row";
    row.style.cssText = "padding:3px 0;gap:7px";
    row.innerHTML = `<span style="flex:1;height:1px;background:rgba(245,178,62,0.4)"></span><span class="mono" style="font-size:10px;color:#F5B23E">\uD604\uC7AC ${quote ? fmt(quote.price, quote.currency) : ""}</span><span style="flex:1;height:1px;background:rgba(245,178,62,0.4)"></span>`;
    return row;
  }
  var rrRound = (n) => quote?.currency === "USD" ? Math.round(n * 100) / 100 : Math.round(n);
  var rrLast = { stop: "pct", target: "pct" };
  function rrSync(changed) {
    if (changed === "stopPrice") rrLast.stop = "price";
    else if (changed === "stopPct") rrLast.stop = "pct";
    else if (changed === "targetPrice") rrLast.target = "price";
    else if (changed === "targetPct") rrLast.target = "pct";
    const e = Number($("rrEntry").value);
    if (e > 0) {
      if (rrLast.stop === "pct") {
        const pct = Number($("rrStopPct").value);
        if (pct > 0) $("rrStop").value = String(rrRound(e * (1 - pct / 100)));
      } else {
        const s = Number($("rrStop").value);
        if (s > 0) $("rrStopPct").value = String(Math.round((e - s) / e * 1e3) / 10);
      }
      if (rrLast.target === "pct") {
        const pct = Number($("rrTargetPct").value);
        if (pct > 0) $("rrTarget").value = String(rrRound(e * (1 + pct / 100)));
      } else {
        const t = Number($("rrTarget").value);
        if (t > 0) $("rrTargetPct").value = String(Math.round((t - e) / e * 1e3) / 10);
      }
    }
    calcRR();
    renderTrade();
  }
  function calcRR() {
    const e = Number($("rrEntry").value);
    const s = Number($("rrStop").value);
    const t = Number($("rrTarget").value);
    const out = $("rrOut");
    const note = $("rrNote");
    const bar = $("rrBar");
    if (!(e > 0 && s > 0 && t > 0)) {
      out.textContent = "\uC190\uC775\uBE44 \u2014";
      out.style.color = "#F2F4F8";
      note.textContent = "";
      bar.style.display = "none";
      return;
    }
    const reward = (t - e) / e * 100;
    const risk = (e - s) / e * 100;
    if (risk <= 0 || reward <= 0) {
      out.textContent = "\uC190\uC775\uBE44 \u2014";
      note.textContent = "\uC0C1\uC2B9 \uACC4\uD68D \uAE30\uC900: \uC190\uC808\uAC00 < \uC9C4\uC785\uAC00 < \uBAA9\uD45C\uAC00";
      bar.style.display = "none";
      return;
    }
    const rr = reward / risk;
    out.textContent = `\uC190\uC775\uBE44 1 : ${(Math.round(rr * 10) / 10).toFixed(1)}`;
    out.style.color = rr < 1 ? "#FF6B77" : "#F2F4F8";
    bar.style.display = "flex";
    $("rrBarRisk").style.flex = String(risk);
    $("rrBarReward").style.flex = String(reward);
    note.textContent = rr < 1 ? `\uC783\uC744 \uD3ED(\u2212${risk.toFixed(1)}%)\uC774 \uBC8C \uD3ED(+${reward.toFixed(1)}%)\uBCF4\uB2E4 \uCEE4\uC694` : `\uBC8C \uD3ED +${reward.toFixed(1)}% vs \uC783\uC744 \uD3ED \u2212${risk.toFixed(1)}%`;
  }
  var sess = null;
  var cash = null;
  var positions = [];
  var posQuotes = {};
  async function loadSess() {
    try {
      const o = await chrome.storage.local.get("holdSess");
      sess = o.holdSess ?? null;
    } catch {
      sess = null;
    }
  }
  function saveSess() {
    if (sess) void chrome.storage.local.set({ holdSess: sess });
    else void chrome.storage.local.remove("holdSess");
  }
  async function ensureFresh() {
    if (!sess) return false;
    if (sess.exp - 6e4 > Date.now()) return true;
    try {
      const r = await fetch(`${SUPA}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: ANON, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: sess.refresh })
      });
      const j = await r.json();
      if (!r.ok || !j.access_token) throw new Error("refresh failed");
      sess = {
        access: j.access_token,
        refresh: j.refresh_token ?? sess.refresh,
        exp: Date.now() + (Number(j.expires_in) || 3600) * 1e3,
        email: j.user?.email ?? sess.email,
        uid: j.user?.id ?? sess.uid
      };
      saveSess();
      return true;
    } catch {
      sess = null;
      saveSess();
      renderAuth();
      return false;
    }
  }
  async function rest(path, init = {}) {
    if (!await ensureFresh() || !sess) return null;
    try {
      return await fetch(`${SUPA}/rest/v1${path}`, {
        ...init,
        headers: {
          apikey: ANON,
          Authorization: `Bearer ${sess.access}`,
          "Content-Type": "application/json",
          ...init.headers ?? {}
        }
      });
    } catch {
      return null;
    }
  }
  async function login(email, pw) {
    try {
      const r = await fetch(`${SUPA}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: ANON, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.access_token) {
        const msg = String(j.error_description || j.msg || "");
        if (/confirm/i.test(msg)) return "\uC774\uBA54\uC77C \uC778\uC99D\uC774 \uC548 \uB410\uC5B4 \u2014 \uBA54\uC77C\uD568\uC744 \uD655\uC778\uD574\uC918";
        return "\uB85C\uADF8\uC778 \uC2E4\uD328 \u2014 \uC774\uBA54\uC77C/\uBE44\uBC00\uBC88\uD638\uB97C \uD655\uC778\uD574\uC918";
      }
      sess = {
        access: j.access_token,
        refresh: j.refresh_token,
        exp: Date.now() + (Number(j.expires_in) || 3600) * 1e3,
        email: j.user?.email ?? email,
        uid: j.user?.id ?? ""
      };
      saveSess();
      return null;
    } catch {
      return "\uC5F0\uACB0 \uC2E4\uD328 \u2014 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC918";
    }
  }
  async function loadAccount() {
    if (!sess) return;
    cash = null;
    positions = [];
    const a = await rest(`/paper_accounts?user_id=eq.${sess.uid}&select=cash`);
    if (a?.ok) {
      const rows = await a.json();
      if (rows.length) {
        cash = Number(rows[0].cash);
      } else {
        const c = await rest("/paper_accounts", {
          method: "POST",
          body: JSON.stringify({ user_id: sess.uid, cash: SEED_CASH })
        });
        if (c && (c.ok || c.status === 409)) cash = SEED_CASH;
      }
    }
    const p = await rest(
      `/plans?user_id=eq.${sess.uid}&status=eq.active&dismissed_at=is.null&select=id,symbol,symbol_name,entry_price,quantity&order=created_at.asc`
    );
    if (p?.ok) {
      const rows = await p.json();
      positions = rows.map((r) => ({
        id: r.id,
        symbol: r.symbol,
        name: r.symbol_name || r.symbol,
        entry: Number(r.entry_price) || 0,
        qty: Number(r.quantity) || 0
      }));
    }
    renderAuth();
    const syms = [...new Set(positions.map((p2) => p2.symbol))].slice(0, 10);
    if (syms.length) {
      try {
        const j = await fetch(`${FN}/quotes?symbols=${encodeURIComponent(syms.join(","))}`).then((r) => r.json());
        posQuotes = {};
        for (const s of syms) {
          const q = j?.quotes?.[s];
          if (q?.price > 0) posQuotes[s] = Number(q.price);
        }
        renderAuth();
      } catch {
      }
    }
  }
  function persistCash() {
    if (sess && cash != null) {
      void rest(`/paper_accounts?user_id=eq.${sess.uid}`, {
        method: "PATCH",
        body: JSON.stringify({ cash, updated_at: (/* @__PURE__ */ new Date()).toISOString() })
      });
    }
  }
  function tnote(msg, ok = true) {
    const el = $("tradeMsg");
    el.style.display = "block";
    el.textContent = msg;
    el.style.color = ok ? "#57C7A4" : "#FF6B77";
    setTimeout(() => el.style.display = "none", 5e3);
  }
  var curOf = (code) => /^\d{6}$/.test(code) ? "KRW" : "USD";
  async function paperBuy() {
    if (!sess || !quote || !symbol) return;
    const qty = Math.max(1, Math.floor(Number($("tQty").value) || 0));
    const price = quote.price;
    const cost = qty * price;
    if (cash != null && cost > cash) {
      tnote(`\uBAA8\uC758 \uD604\uAE08\uC774 \uBD80\uC871\uD574 \u2014 \uD544\uC694 ${fmt(cost, quote.currency)}, \uBCF4\uC720 ${fmt(cash, quote.currency)}`, false);
      return;
    }
    const stopPct = Math.abs(Number($("rrStopPct").value)) || 3;
    const takePct = Math.abs(Number($("rrTargetPct").value)) || 12;
    const reason = $("tReason").value.trim() || "\uC0AC\uC774\uB4DC\uD328\uB110\uC5D0\uC11C \uAE30\uB85D";
    const r = await rest("/plans", {
      method: "POST",
      body: JSON.stringify({
        user_id: sess.uid,
        symbol,
        symbol_name: symbolLabel || symbol,
        entry_price: price,
        quantity: qty,
        stop_pct: stopPct,
        take_pct: takePct,
        horizon_days: 30,
        reason,
        origin_stop_pct: stopPct,
        origin_take_pct: takePct,
        origin_horizon_days: 30
      })
    });
    if (!r?.ok) {
      tnote("\uBAA8\uC758 \uB9E4\uC218 \uC2E4\uD328 \u2014 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC918", false);
      return;
    }
    if (cash != null) {
      cash -= cost;
      persistCash();
    }
    $("tReason").value = "";
    tnote(`${symbolLabel || symbol} ${qty}\uC8FC \uBAA8\uC758 \uB9E4\uC218 \xB7 ${fmt(cost, quote.currency)} \u2014 \uC571 \uC120\uBC18\uC5D0 \uC0C8 \uC54C\uC774 \uC62C\uB77C\uAC14\uC5B4`);
    void loadAccount();
  }
  async function paperSell(p) {
    if (!sess) return;
    let priceNow = p.symbol === symbol && quote ? quote.price : 0;
    if (!priceNow) {
      try {
        const j = await fetch(`${FN}/quotes?symbols=${encodeURIComponent(p.symbol)}`).then((r2) => r2.json());
        priceNow = Number(j?.quotes?.[p.symbol]?.price) || p.entry;
      } catch {
        priceNow = p.entry;
      }
    }
    const proceeds = p.qty * priceNow;
    const r = await rest(`/plans?id=eq.${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "sold_early", ended_at: (/* @__PURE__ */ new Date()).toISOString() })
    });
    if (!r?.ok) {
      tnote("\uBAA8\uC758 \uB9E4\uB3C4 \uC2E4\uD328 \u2014 \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC918", false);
      return;
    }
    if (cash != null) {
      cash += proceeds;
      persistCash();
    }
    tnote(`${p.name} ${p.qty}\uC8FC \uBAA8\uC758 \uB9E4\uB3C4 \u2014 ${fmt(proceeds, curOf(p.symbol))} \uD68C\uC218`);
    void loadAccount();
  }
  function renderAuth() {
    const signedIn = !!sess;
    $("authOut").style.display = signedIn ? "none" : "block";
    $("authIn").style.display = signedIn ? "block" : "none";
    if (!signedIn) return;
    $("authWho").textContent = sess.email;
    $("cashOut").textContent = cash != null ? fmt(cash, "KRW") : "\u2026";
    renderTrade();
    const list = $("posList");
    list.innerHTML = "";
    if (positions.length) {
      const head = document.createElement("div");
      head.className = "row";
      head.innerHTML = `<span class="faint">\uD488\uACE0 \uC788\uB294 \uC54C ${positions.length}\uAC1C</span>`;
      head.style.cssText = "margin-top:2px;padding-bottom:2px;border-bottom:1px solid rgba(255,255,255,0.07)";
      list.appendChild(head);
    }
    for (const p of positions.slice(0, 8)) {
      const cur = posQuotes[p.symbol];
      const pnl = cur && p.entry > 0 ? (cur - p.entry) / p.entry * 100 : null;
      const row = document.createElement("div");
      row.className = "row";
      row.style.cssText = "margin-top:7px";
      const name = document.createElement("span");
      name.textContent = p.name;
      name.style.cssText = `font-size:12px;font-weight:700;max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;${p.symbol === symbol ? "color:#57C7A4" : ""}`;
      const info = document.createElement("span");
      info.className = "mono dim";
      info.style.fontSize = "10.5px";
      info.textContent = `${p.qty}\uC8FC @ ${fmt(p.entry, curOf(p.symbol))}`;
      const sp = document.createElement("span");
      sp.style.flex = "1";
      const btn = document.createElement("button");
      btn.className = "ghost mini";
      btn.textContent = "\uBAA8\uC758 \uB9E4\uB3C4";
      btn.addEventListener("click", () => void paperSell(p));
      row.append(name, info, sp);
      if (pnl != null) {
        const chip = document.createElement("span");
        chip.className = "mono num";
        const up = pnl >= 0;
        chip.style.cssText = `font-size:10.5px;font-weight:700;border-radius:999px;padding:2px 7px;color:${up ? "#E36A5C" : "#7FA8E8"};background:${up ? "rgba(227,106,92,0.13)" : "rgba(127,168,232,0.13)"}`;
        chip.textContent = `${up ? "+" : ""}${pnl.toFixed(1)}%`;
        row.append(chip);
      }
      row.append(btn);
      list.appendChild(row);
    }
    if (positions.length > 8) {
      const more = document.createElement("div");
      more.className = "faint";
      more.style.marginTop = "7px";
      more.textContent = `\uC678 ${positions.length - 8}\uAC1C\uB294 HOLD \uC571\uC5D0\uC11C`;
      list.appendChild(more);
    }
  }
  function renderTrade() {
    if (!sess) return;
    const box = $("tradeBox");
    const on = !!(quote && symbol);
    box.style.display = on ? "block" : "none";
    if (!on) return;
    const qty = Math.max(1, Math.floor(Number($("tQty").value) || 0));
    $("tCost").textContent = `${symbolLabel || symbol} \xB7 ${fmt(qty * quote.price, quote.currency)}`;
  }
  async function tvNativeDraw(lines) {
    if (tabId == null) return 0;
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        world: "MAIN",
        func: (lines2) => {
          const asChart = (v) => {
            if (!v || typeof v !== "object" && typeof v !== "function") return null;
            try {
              const o = v;
              if (typeof o.activeChart === "function") {
                const c = o.activeChart();
                if (c && typeof c.createShape === "function") return c;
              }
              if (typeof o.createShape === "function" && typeof o.removeEntity === "function") {
                return o;
              }
            } catch {
            }
            return null;
          };
          const findChart = (w) => {
            for (const k of ["tradingViewApi", "tvWidget", "widget", "chartWidget", "TradingViewApi"]) {
              try {
                const c = asChart(w[k]);
                if (c) return c;
              } catch {
              }
            }
            let names = [];
            try {
              names = Object.getOwnPropertyNames(w);
            } catch {
            }
            for (const k of names) {
              if (k.startsWith("on") || k.startsWith("webkit")) continue;
              let v;
              try {
                v = w[k];
              } catch {
                continue;
              }
              const c = asChart(v);
              if (c) return c;
            }
            return null;
          };
          const wins = [window];
          try {
            for (const f of Array.from(document.querySelectorAll("iframe"))) {
              try {
                const cw = f.contentWindow;
                if (cw && cw.document) wins.push(cw);
              } catch {
              }
            }
          } catch {
          }
          for (const w of wins) {
            const chart = findChart(w);
            if (!chart) continue;
            const ids = [];
            let n = 0;
            for (const l of lines2) {
              try {
                const id = chart.createShape(
                  { time: Math.floor(Date.now() / 1e3), price: l.price },
                  {
                    shape: "horizontal_line",
                    disableSave: true,
                    text: l.title,
                    overrides: {
                      linecolor: l.color,
                      linewidth: 2,
                      linestyle: l.dashed ? 2 : 0,
                      showLabel: true,
                      text: l.title,
                      textcolor: l.color,
                      horzLabelsAlign: "right",
                      fontsize: 11
                    }
                  }
                );
                if (id != null) {
                  ids.push(id);
                  n++;
                }
              } catch {
              }
            }
            if (n > 0) {
              const store = w;
              store.__HOLD_TV_IDS = (store.__HOLD_TV_IDS ?? []).concat(ids);
              return n;
            }
          }
          return 0;
        },
        args: [lines]
      });
      return results.reduce((sum, r) => sum + (Number(r?.result) || 0), 0);
    } catch {
      return 0;
    }
  }
  async function tvNativeClear() {
    if (tabId == null) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId, allFrames: true },
        world: "MAIN",
        func: () => {
          const asChart = (v) => {
            if (!v || typeof v !== "object" && typeof v !== "function") return null;
            try {
              const o = v;
              if (typeof o.activeChart === "function") {
                const c = o.activeChart();
                if (c && typeof c.removeEntity === "function") return c;
              }
              if (typeof o.removeEntity === "function") return o;
            } catch {
            }
            return null;
          };
          const findChart = (w) => {
            for (const k of ["tradingViewApi", "tvWidget", "widget", "chartWidget", "TradingViewApi"]) {
              try {
                const c = asChart(w[k]);
                if (c) return c;
              } catch {
              }
            }
            let names = [];
            try {
              names = Object.getOwnPropertyNames(w);
            } catch {
            }
            for (const k of names) {
              if (k.startsWith("on") || k.startsWith("webkit")) continue;
              let v;
              try {
                v = w[k];
              } catch {
                continue;
              }
              const c = asChart(v);
              if (c) return c;
            }
            return null;
          };
          const wins = [window];
          try {
            for (const f of Array.from(document.querySelectorAll("iframe"))) {
              try {
                const cw = f.contentWindow;
                if (cw && cw.document) wins.push(cw);
              } catch {
              }
            }
          } catch {
          }
          for (const w of wins) {
            const store = w;
            const ids = store.__HOLD_TV_IDS ?? [];
            if (!ids.length) continue;
            const chart = findChart(w);
            if (chart) {
              for (const id of ids) {
                try {
                  chart.removeEntity(id);
                } catch {
                }
              }
            }
            store.__HOLD_TV_IDS = [];
          }
        }
      });
    } catch {
    }
  }
  async function ensureContent() {
    if (tabId == null) return false;
    try {
      await chrome.tabs.sendMessage(tabId, { type: "HOLD_PING" });
      return true;
    } catch {
      try {
        await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
        return true;
      } catch {
        alert("\uC774 \uD398\uC774\uC9C0\uC5D0\uB294 \uADF8\uB9B4 \uC218 \uC5C6\uC5B4\uC694 (\uD06C\uB86C \uB0B4\uBD80 \uD398\uC774\uC9C0 \uB4F1). \uC8FC\uC2DD \uC0AC\uC774\uD2B8 \uD0ED\uC5D0\uC11C \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC918.");
        return false;
      }
    }
  }
  async function send(msg) {
    if (!await ensureContent() || tabId == null) return;
    try {
      await chrome.tabs.sendMessage(tabId, msg);
    } catch {
    }
  }
  function cleanLabel(raw, title, code) {
    const strip = (s) => s.replace(/[+\-]?\d[\d,]*(?:\.\d+)?\s*(?:원|%)/g, " ").replace(/[₩$][\d,.]+/g, " ").replace(/\s{2,}/g, " ").trim();
    const bad = (s) => !s || s.length > 20 || /[%₩$]|\d\s*원|\d[,.]\d|^[\d\s.,+\-]+$/.test(s);
    for (const cand of [raw.trim(), strip(raw)]) if (!bad(cand)) return cand;
    for (const seg of title.split(/[|·:–—-]/)) {
      for (const cand of [seg.trim(), strip(seg)]) if (!bad(cand)) return cand;
    }
    return code;
  }
  var pollTimer;
  var pollLeft = 0;
  async function syncTab(fromPoll = false) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) return;
    if (!fromPoll) {
      clearTimeout(pollTimer);
      pollLeft = 8;
    }
    tabId = tab.id;
    let found = detectSymbol(tab.url, tab.title ?? "");
    if (!found && /^https?:/.test(tab.url)) {
      found = await detectFromPage(tab.id);
    }
    if (found) found.label = cleanLabel(found.label, tab.title ?? "", found.code);
    if (found && found.code !== symbol) {
      clearTimeout(pollTimer);
      await loadSymbol(found.code, found.label);
      return;
    }
    if (!found && !symbol) {
      $("symEmpty").style.display = "block";
      $("symInfo").style.display = "none";
      if (pollLeft-- > 0) {
        pollTimer = window.setTimeout(() => void syncTab(true), 1300);
      }
    }
  }
  $("reDetect").addEventListener("click", () => {
    symbol = null;
    void syncTab();
  });
  $("symGo").addEventListener("click", () => {
    const v = $("symInput").value.trim().toUpperCase();
    if (v) void loadSymbol(v, v);
  });
  $("symInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("symGo").click();
  });
  $("drawLevels").addEventListener("click", () => {
    if (!quote || !levels.length) return;
    void (async () => {
      const native = await tvNativeDraw(
        levels.map((l) => ({
          price: Math.round(l.price * 100) / 100,
          title: `${l.kind === "support" ? "\uC9C0\uC9C0" : "\uC800\uD56D"} ${fmt(l.price, quote.currency)} \xB7 ${l.touches}\uBC88 \uD130\uCE58`,
          color: l.kind === "support" ? "#57C7A4" : "#FF6B77",
          dashed: true
        }))
      );
      if (native > 0) {
        $("levelHint").textContent = "\uCC28\uD2B8 \uC790\uCCB4\uC5D0 \uADF8\uB838\uC5B4\uC694 \u2014 \uC90C/\uC2A4\uD06C\uB864\uC744 \uB530\uB77C\uAC00\uC694 \xB7 [\uC9C0\uC6B0\uAE30]\uB85C \uC81C\uAC70";
        return;
      }
      $("levelHint").textContent = "\uCD95 \uB208\uAE08\uC744 \uC790\uB3D9 \uC778\uC2DD\uD574\uC694 \xB7 \uC548 \uB418\uBA74 \uD654\uBA74 \uBCF4\uC815 2\uBC88";
      void send({
        type: "HOLD_DRAW_LEVELS",
        currentPrice: quote.price,
        levels: levels.map((l) => ({
          price: Math.round(l.price * 100) / 100,
          kind: l.kind,
          label: `${l.kind === "support" ? "\uC9C0\uC9C0" : "\uC800\uD56D"} ${fmt(l.price, quote.currency)} \xB7 ${l.touches}\uBC88 \uD130\uCE58`
        }))
      });
    })();
  });
  $("rrDraw").addEventListener("click", () => {
    const e = Number($("rrEntry").value);
    const s = Number($("rrStop").value);
    const t = Number($("rrTarget").value);
    if (!(e > 0 && s > 0 && t > 0) || !quote) return;
    void (async () => {
      const native = await tvNativeDraw([
        { price: e, title: `\uC9C4\uC785 ${fmt(e, quote.currency)}`, color: "#F2F4F8", dashed: false },
        { price: s, title: `\uC190\uC808 ${fmt(s, quote.currency)}`, color: "#FF6B77", dashed: true },
        { price: t, title: `\uBAA9\uD45C ${fmt(t, quote.currency)}`, color: "#57C7A4", dashed: true }
      ]);
      if (native > 0) return;
      void send({
        type: "HOLD_DRAW_LEVELS",
        currentPrice: quote.price,
        levels: [
          { price: e, kind: "entry", label: `\uC9C4\uC785 ${fmt(e, quote.currency)}` },
          { price: s, kind: "stop", label: `\uC190\uC808 ${fmt(s, quote.currency)}` },
          { price: t, kind: "target", label: `\uBAA9\uD45C ${fmt(t, quote.currency)}` }
        ]
      });
    })();
  });
  $("modeH").addEventListener("click", () => void send({ type: "HOLD_SET_MODE", mode: "hline" }));
  $("modeT").addEventListener("click", () => void send({ type: "HOLD_SET_MODE", mode: "trend" }));
  $("clearAll").addEventListener("click", () => {
    void tvNativeClear();
    void send({ type: "HOLD_CLEAR" });
  });
  var RR_WIRING = [
    ["rrEntry", "entry"],
    ["rrStop", "stopPrice"],
    ["rrStopPct", "stopPct"],
    ["rrTarget", "targetPrice"],
    ["rrTargetPct", "targetPct"]
  ];
  for (const [id, kind] of RR_WIRING) {
    $(id).addEventListener("input", () => rrSync(kind));
  }
  function bindStep(minusId, plusId, inputId, delta, min, after) {
    const el = $(inputId);
    const nudge = (d) => {
      const v = Math.max(min, Math.round(((Number(el.value) || 0) + d) * 10) / 10);
      el.value = String(v);
      after();
    };
    $(minusId).addEventListener("click", () => nudge(-delta));
    $(plusId).addEventListener("click", () => nudge(delta));
  }
  bindStep("rrStopMinus", "rrStopPlus", "rrStopPct", 0.5, 0.5, () => rrSync("stopPct"));
  bindStep("rrTargetMinus", "rrTargetPlus", "rrTargetPct", 0.5, 0.5, () => rrSync("targetPct"));
  bindStep("tQtyMinus", "tQtyPlus", "tQty", 1, 1, renderTrade);
  $("authLogin").addEventListener("click", () => {
    void (async () => {
      const email = $("authEmail").value.trim();
      const pw = $("authPw").value;
      if (!email || !pw) return;
      $("authMsg").textContent = "\uB85C\uADF8\uC778 \uC911\u2026";
      const err = await login(email, pw);
      if (err) {
        $("authMsg").textContent = err;
        return;
      }
      $("authPw").value = "";
      renderAuth();
      void loadAccount();
    })();
  });
  $("authPw").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("authLogin").click();
  });
  $("authLogout").addEventListener("click", () => {
    sess = null;
    cash = null;
    positions = [];
    saveSess();
    renderAuth();
  });
  $("tBuy").addEventListener("click", () => void paperBuy());
  $("tQty").addEventListener("input", renderTrade);
  var appUrl = APP_URL_DEFAULT;
  var appLinkEl = $("appLink");
  function updateAppLink() {
    if (appUrl) appLinkEl.href = appUrl;
    else appLinkEl.removeAttribute("href");
  }
  appLinkEl.addEventListener("click", (e) => {
    if (!appUrl) {
      e.preventDefault();
      $("appSet").style.display = "flex";
      $("appUrlIn").focus();
    }
  });
  $("appUrlSave").addEventListener("click", () => {
    let v = $("appUrlIn").value.trim();
    if (!v) return;
    if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
    try {
      new URL(v);
    } catch {
      return;
    }
    appUrl = v;
    void chrome.storage.local.set({ appUrl });
    $("appSet").style.display = "none";
    updateAppLink();
    void chrome.tabs.create({ url: appUrl });
  });
  $("appUrlIn").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("appUrlSave").click();
  });
  void chrome.storage.local.get("appUrl").then((o) => {
    if (typeof o.appUrl === "string" && o.appUrl && o.appUrl !== "https://hold.vercel.app") appUrl = o.appUrl;
    updateAppLink();
  });
  updateAppLink();
  try {
    $("owlSlot").innerHTML = svg("owl", { variant: "head", size: 30 });
  } catch {
  }
  void loadSess().then(() => {
    renderAuth();
    if (sess) void loadAccount();
  });
  chrome.tabs.onActivated.addListener(() => void syncTab());
  chrome.tabs.onUpdated.addListener((_id, info) => {
    if (info.status === "complete" || info.url) void syncTab();
  });
  void syncTab();
})();
