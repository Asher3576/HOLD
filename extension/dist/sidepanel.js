"use strict";
(() => {
  // src/sidepanel/sidepanel.ts
  var FN = "https://xpjtgmckrazfbyghkeve.supabase.co/functions/v1/prices";
  var APP_URL = "https://hold.vercel.app";
  var tabId = null;
  var symbol = null;
  var quote = null;
  var levels = [];
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
        m = u.pathname.match(/stocks\/([A-Za-z0-9]{1,12})/);
        if (m && /^\d{6}$/.test(m[1])) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] };
      }
      m = url.match(/[^0-9](\d{6})(?:[^0-9]|$)/);
      if (m) return { code: m[1], label: title.split(/[:|-]/)[0].trim() || m[1] };
    } catch {
    }
    return null;
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
    $("symEmpty").style.display = "none";
    $("symInfo").style.display = "block";
    $("symName").textContent = label;
    $("symCode").textContent = code;
    $("symPrice").textContent = "\u2026";
    $("symChange").textContent = "";
    try {
      const [qRes, kRes] = await Promise.all([
        fetch(`${FN}/quotes?symbols=${encodeURIComponent(code)}`).then((r) => r.json()),
        fetch(`${FN}/klines?symbol=${encodeURIComponent(code)}&limit=90`).then((r) => r.json())
      ]);
      quote = qRes?.quotes?.[code] ?? null;
      const closes = (kRes?.candles ?? []).map((c) => c.close).filter((v) => v > 0);
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
    } catch {
      $("symPrice").textContent = "\uC5F0\uACB0 \uC2E4\uD328";
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
        alert("\uC774 \uD398\uC774\uC9C0\uC5D0\uB294 \uADF8\uB9B4 \uC218 \uC5C6\uC5B4\uC694. \uD234\uBC14\uC758 HOLD \uC544\uC774\uCF58\uC744 \uB204\uB978 \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC918.");
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
  async function syncTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) return;
    tabId = tab.id;
    const found = detectSymbol(tab.url, tab.title ?? "");
    if (found && found.code !== symbol) {
      await loadSymbol(found.code, found.label);
    } else if (!found && !symbol) {
      $("symEmpty").style.display = "block";
      $("symInfo").style.display = "none";
    }
  }
  $("symGo").addEventListener("click", () => {
    const v = $("symInput").value.trim().toUpperCase();
    if (v) void loadSymbol(v, v);
  });
  $("symInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("symGo").click();
  });
  $("drawLevels").addEventListener("click", () => {
    if (!quote || !levels.length) return;
    void send({
      type: "HOLD_DRAW_LEVELS",
      currentPrice: quote.price,
      levels: levels.map((l) => ({
        price: Math.round(l.price * 100) / 100,
        kind: l.kind,
        label: `${l.kind === "support" ? "\uC9C0\uC9C0" : "\uC800\uD56D"} ${fmt(l.price, quote.currency)} \xB7 ${l.touches}\uBC88 \uD130\uCE58`
      }))
    });
  });
  $("rrDraw").addEventListener("click", () => {
    const e = Number($("rrEntry").value);
    const s = Number($("rrStop").value);
    const t = Number($("rrTarget").value);
    if (!(e > 0 && s > 0 && t > 0) || !quote) return;
    void send({
      type: "HOLD_DRAW_LEVELS",
      currentPrice: quote.price,
      levels: [
        { price: e, kind: "entry", label: `\uC9C4\uC785 ${fmt(e, quote.currency)}` },
        { price: s, kind: "stop", label: `\uC190\uC808 ${fmt(s, quote.currency)}` },
        { price: t, kind: "target", label: `\uBAA9\uD45C ${fmt(t, quote.currency)}` }
      ]
    });
  });
  $("modeH").addEventListener("click", () => void send({ type: "HOLD_SET_MODE", mode: "hline" }));
  $("modeT").addEventListener("click", () => void send({ type: "HOLD_SET_MODE", mode: "trend" }));
  $("clearAll").addEventListener("click", () => void send({ type: "HOLD_CLEAR" }));
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
