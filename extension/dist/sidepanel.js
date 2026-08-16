"use strict";
(() => {
  // src/sidepanel/sidepanel.ts
  var FN = "https://xpjtgmckrazfbyghkeve.supabase.co/functions/v1/prices";
  var APP_URL = "https://hold.vercel.app";
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
      if (quote) {
        $("symPrice").textContent = fmt(quote.price, quote.currency);
        const ch = quote.changePercent;
        if (ch != null) {
          const up = ch >= 0;
          $("symChange").textContent = `${up ? "+" : ""}${ch.toFixed(2)}%`;
          $("symChange").style.color = up ? "#E36A5C" : "#7FA8E8";
        }
        const entry = $("rrEntry");
        if (!entry.value) entry.value = String(quote.price);
      } else {
        $("symPrice").textContent = "\uC2DC\uC138 \uC5C6\uC74C";
      }
      levels = quote && closes.length >= 10 ? swingLevels(closes, quote.price) : [];
      renderLevels();
      renderTrend();
      renderFacts();
      void loadNews();
    } catch {
      $("symPrice").textContent = "\uC5F0\uACB0 \uC2E4\uD328";
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
  function renderTrend() {
    const card = $("trendCard");
    const s = trendLine(closesG, 20, 5);
    const l = trendLine(closesG, 60, 10);
    if (!s && !l) {
      card.style.display = "none";
      return;
    }
    card.style.display = "block";
    const mk = (label, t) => t ? `<span style="color:#7A8296">${label}</span> <b style="color:${DIR_COLOR[t.dir]}">${t.dir}</b> <span style="color:#99A1B3">\u2014 ${t.text}</span>` : `<span style="color:#7A8296">${label}</span> <span style="color:#5A6170">\uB370\uC774\uD130 \uBD80\uC871</span>`;
    $("trendShort").innerHTML = mk("\uB2E8\uAE30(20\uC77C):", s);
    $("trendLong").innerHTML = mk("\uC7A5\uAE30(60\uC77C):", l);
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
      row.style.cssText = "font-size:11.5px;line-height:1.55;color:#D6DAE3;padding:3px 0";
      row.textContent = "\xB7 " + f;
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
        a.style.cssText = "display:block;padding:7px 0;border-top:1px solid rgba(255,255,255,0.07);color:#D6DAE3;font-size:12px;line-height:1.5;text-decoration:none";
        const meta = [it.source, timeAgo(it.pub)].filter(Boolean).join(" \xB7 ");
        a.innerHTML = `${it.title}${meta ? `<span style="display:block;margin-top:2px;font-size:10px;color:#5A6170">${meta}</span>` : ""}`;
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
    for (const l of [...levels].sort((a, b) => b.price - a.price)) {
      const row = document.createElement("div");
      row.className = "row";
      row.style.padding = "5px 0";
      const name = document.createElement("span");
      name.textContent = l.kind === "support" ? "\uC9C0\uC9C0" : "\uC800\uD56D";
      name.style.color = l.kind === "support" ? "#57C7A4" : "#FF6B77";
      name.style.fontWeight = "700";
      name.style.fontSize = "11.5px";
      const price = document.createElement("span");
      price.className = "mono";
      price.textContent = fmt(l.price, quote.currency);
      const touches = document.createElement("span");
      touches.className = "faint";
      touches.textContent = `${l.touches}\uBC88 \uD130\uCE58`;
      const sp = document.createElement("span");
      sp.style.flex = "1";
      row.append(name, price, sp, touches);
      list.appendChild(row);
    }
  }
  function calcRR() {
    const e = Number($("rrEntry").value);
    const s = Number($("rrStop").value);
    const t = Number($("rrTarget").value);
    const out = $("rrOut");
    const note = $("rrNote");
    if (!(e > 0 && s > 0 && t > 0)) {
      out.textContent = "\uC190\uC775\uBE44 \u2014";
      out.style.color = "#F2F4F8";
      note.textContent = "";
      return;
    }
    const reward = (t - e) / e * 100;
    const risk = (e - s) / e * 100;
    if (risk <= 0 || reward <= 0) {
      out.textContent = "\uC190\uC775\uBE44 \u2014";
      note.textContent = "\uC0C1\uC2B9 \uACC4\uD68D \uAE30\uC900: \uC190\uC808\uAC00 < \uC9C4\uC785\uAC00 < \uBAA9\uD45C\uAC00";
      return;
    }
    const rr = reward / risk;
    out.textContent = `\uC190\uC775\uBE44 1 : ${(Math.round(rr * 10) / 10).toFixed(1)}`;
    out.style.color = rr < 1 ? "#FF6B77" : "#F2F4F8";
    note.textContent = rr < 1 ? `\uC783\uC744 \uD3ED(${risk.toFixed(1)}%)\uC774 \uBC8C \uD3ED(${reward.toFixed(1)}%)\uBCF4\uB2E4 \uCEE4\uC694` : `\uBC8C \uD3ED +${reward.toFixed(1)}% vs \uC783\uC744 \uD3ED \u2212${risk.toFixed(1)}%`;
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
  for (const id of ["rrEntry", "rrStop", "rrTarget"]) {
    $(id).addEventListener("input", calcRR);
  }
  $("appLink").href = APP_URL;
  chrome.tabs.onActivated.addListener(() => void syncTab());
  chrome.tabs.onUpdated.addListener((_id, info) => {
    if (info.status === "complete" || info.url) void syncTab();
  });
  void syncTab();
})();
