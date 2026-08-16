"use strict";
(() => {
  // src/content/index.ts
  var w = window;
  if (!w.__HOLD_CS__) {
    let autoDetectRegion = function() {
      let best = null;
      let bestArea = 0;
      for (const el of Array.from(document.querySelectorAll("canvas, iframe"))) {
        const r = el.getBoundingClientRect();
        if (r.width < 300 || r.height < 180) continue;
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const area = r.width * r.height;
        if (area > bestArea) {
          bestArea = area;
          best = { x: r.left, y: r.top, w: r.width, h: r.height };
        }
      }
      if (best) region = best;
    }, ensureCanvas = function() {
      if (canvas) return canvas;
      canvas = document.createElement("canvas");
      Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: "100vw",
        height: "100vh",
        zIndex: Z,
        pointerEvents: "none",
        cursor: "crosshair"
      });
      document.documentElement.appendChild(canvas);
      resize();
      window.addEventListener("resize", () => {
        resize();
        redraw();
      });
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMode(null);
      });
      return canvas;
    }, resize = function() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
    }, redraw = function() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const R = chartRect();
      if (region && (mode || calibStep)) {
        ctx.strokeStyle = "rgba(245,178,62,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(R.x, R.y, R.w, R.h);
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(R.x, R.y, R.w, R.h);
      ctx.clip();
      for (const d of drawings) {
        if (d.type === "h") {
          line(R.x, d.y, R.x + R.w, d.y, "#F5B23E", 2, []);
        } else if (d.type === "t") {
          line(d.x1, d.y1, d.x2, d.y2, "#F5B23E", 2, []);
        } else {
          const dash = d.kind === "entry" ? [] : [7, 5];
          line(R.x, d.y, R.x + R.w, d.y, COLOR[d.kind], 1.8, dash);
        }
      }
      ctx.restore();
      for (const d of drawings) {
        if (d.type === "level") {
          tag(d.label, R.x + R.w - 8, d.y, COLOR[d.kind], true);
        } else if (d.type === "h") {
          const p = yToPrice(d.y);
          if (p != null) tag(fmt(p), R.x + R.w - 8, d.y, "#F5B23E", true);
        }
      }
      if (drag) {
        if (mode === "region") {
          ctx.strokeStyle = "rgba(245,178,62,0.8)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(Math.min(drag.x1, drag.x2), Math.min(drag.y1, drag.y2), Math.abs(drag.x2 - drag.x1), Math.abs(drag.y2 - drag.y1));
        } else {
          line(drag.x1, drag.y1, drag.x2, drag.y2, "rgba(245,178,62,0.7)", 2, [4, 4]);
        }
      }
    }, line = function(x1, y1, x2, y2, color, width, dash) {
      if (!ctx) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }, tag = function(text, x, y, color, alignRight) {
      if (!ctx) return;
      ctx.font = "600 11px ui-monospace, Menlo, monospace";
      const tw = ctx.measureText(text).width;
      const bx = alignRight ? x - tw - 10 : x;
      ctx.fillStyle = "rgba(11,14,20,0.85)";
      ctx.fillRect(bx, y - 17, tw + 10, 16);
      ctx.fillStyle = color;
      ctx.fillText(text, bx + 5, y - 5);
    }, ensureToolbar = function() {
      if (toolbar) return;
      toolbar = document.createElement("div");
      Object.assign(toolbar.style, {
        position: "fixed",
        top: "12px",
        right: "12px",
        zIndex: String(Number(Z) + 2),
        display: "flex",
        gap: "6px",
        padding: "6px",
        borderRadius: "12px",
        background: "rgba(17,20,28,0.92)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        fontFamily: "-apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif"
      });
      const mk = (label, onClick) => {
        const b = document.createElement("button");
        b.textContent = label;
        Object.assign(b.style, {
          font: "600 11px inherit",
          color: "#F2F4F8",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "8px",
          padding: "6px 9px",
          cursor: "pointer"
        });
        b.addEventListener("click", onClick);
        toolbar.appendChild(b);
        return b;
      };
      mk("\u2500 \uC218\uD3C9\uC120", () => setMode(mode === "hline" ? null : "hline"));
      mk("\u2571 \uCD94\uC138\uC120", () => setMode(mode === "trend" ? null : "trend"));
      mk("\u25A3 \uC601\uC5ED", () => setMode(mode === "region" ? null : "region"));
      mk("\uC9C0\uC6B0\uAE30", () => {
        drawings = [];
        calib = null;
        redraw();
      });
      mk("\u2715", () => {
        setMode(null);
        toolbar?.remove();
        toolbar = null;
      });
      document.documentElement.appendChild(toolbar);
    }, showToast = function(msg, sticky = false) {
      if (!toast) {
        toast = document.createElement("div");
        Object.assign(toast.style, {
          position: "fixed",
          left: "50%",
          top: "16px",
          transform: "translateX(-50%)",
          zIndex: String(Number(Z) + 2),
          background: "rgba(17,20,28,0.94)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#F2F4F8",
          font: "600 12.5px -apple-system,'Apple SD Gothic Neo','Noto Sans KR',sans-serif",
          padding: "10px 16px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          maxWidth: "80vw"
        });
        document.documentElement.appendChild(toast);
      }
      toast.textContent = msg;
      toast.style.display = "block";
      if (!sticky) setTimeout(() => toast && (toast.style.display = "none"), 3200);
    }, setMode = function(m) {
      mode = m;
      if ((m === "hline" || m === "trend") && !region) autoDetectRegion();
      ensureCanvas().style.pointerEvents = m || calibStep ? "auto" : "none";
      ensureToolbar();
      if (m === "hline") showToast("\uC218\uD3C9\uC120 \uBAA8\uB4DC \u2014 \uCC28\uD2B8 \uC704 \uC6D0\uD558\uB294 \uC704\uCE58\uB97C \uD074\uB9AD (ESC \uC885\uB8CC)", true);
      else if (m === "trend") showToast("\uCD94\uC138\uC120 \uBAA8\uB4DC \u2014 \uB4DC\uB798\uADF8\uD574\uC11C \uAE0B\uAE30 (ESC \uC885\uB8CC)", true);
      else if (m === "region") showToast("\uCC28\uD2B8 \uC601\uC5ED \uC9C0\uC815 \u2014 \uCC28\uD2B8\uB97C \uAC10\uC2F8\uAC8C \uB4DC\uB798\uADF8\uD574\uC918", true);
      else if (toast) toast.style.display = "none";
      redraw();
    }, startCalibration = function(currentPrice) {
      calibStep = 1;
      ensureCanvas().style.pointerEvents = "auto";
      showToast(`\u2460 \uCC28\uD2B8\uC5D0\uC11C \uD604\uC7AC\uAC00(${fmt(currentPrice)}) \uC704\uCE58\uB97C \uD074\uB9AD\uD574\uC918`, true);
    }, askSecondPrice = function(y) {
      const box = document.createElement("div");
      Object.assign(box.style, {
        position: "fixed",
        left: "50%",
        top: "52px",
        transform: "translateX(-50%)",
        zIndex: String(Number(Z) + 3),
        background: "rgba(17,20,28,0.96)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        padding: "12px 14px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
        font: "600 12px -apple-system,'Apple SD Gothic Neo',sans-serif",
        color: "#F2F4F8"
      });
      box.append("\uD074\uB9AD\uD55C \uB208\uAE08\uC758 \uAC00\uACA9:");
      const input = document.createElement("input");
      Object.assign(input.style, {
        width: "110px",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        color: "#F2F4F8",
        padding: "7px 9px",
        font: "inherit"
      });
      input.type = "number";
      input.placeholder = "\uC608: 240";
      const ok = document.createElement("button");
      ok.textContent = "\uD655\uC778";
      Object.assign(ok.style, {
        background: "linear-gradient(180deg,#FF5A66,#E93D4C)",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "7px 12px",
        font: "inherit",
        cursor: "pointer"
      });
      const done = () => {
        const p2 = Number(input.value);
        box.remove();
        if (!Number.isFinite(p2) || p2 <= 0 || !calib || p2 === calib.p1) {
          calibStep = 0;
          showToast("\uBCF4\uC815 \uCDE8\uC18C \u2014 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC918");
          return;
        }
        calib.y2 = pendingY2;
        calib.p2 = p2;
        calibStep = 0;
        ensureCanvas().style.pointerEvents = mode ? "auto" : "none";
        if (toast) toast.style.display = "none";
        if (pendingLevels) {
          renderLevels(pendingLevels.levels);
          pendingLevels = null;
        }
      };
      ok.addEventListener("click", done);
      input.addEventListener("keydown", (e) => e.key === "Enter" && done());
      box.append(input, ok);
      document.documentElement.appendChild(box);
      input.focus();
      pendingY2 = y;
    }, priceToY = function(price) {
      if (!calib || calib.p2 === calib.p1) return null;
      return calib.y1 + (price - calib.p1) * (calib.y2 - calib.y1) / (calib.p2 - calib.p1);
    }, yToPrice = function(y) {
      if (!calib || calib.y2 === calib.y1) return null;
      return calib.p1 + (y - calib.y1) * (calib.p2 - calib.p1) / (calib.y2 - calib.y1);
    }, renderLevels = function(levels) {
      drawings = drawings.filter((d) => d.type !== "level");
      const R = chartRect();
      for (const l of levels) {
        const y = priceToY(l.price);
        if (y == null || y < R.y || y > R.y + R.h) continue;
        drawings.push({ type: "level", y, price: l.price, label: l.label, kind: l.kind });
      }
      redraw();
      showToast("\uB808\uBCA8\uC744 \uADF8\uC5C8\uC5B4 \u2014 \uCC28\uD2B8\uB97C \uC6C0\uC9C1\uC600\uB2E4\uBA74 \uB2E4\uC2DC \uADF8\uC5B4\uC918");
    }, fmt = function(n) {
      return n >= 1e3 ? Math.round(n).toLocaleString("ko-KR") : String(Math.round(n * 100) / 100);
    }, onDown = function(e) {
      if (calibStep === 1) {
        calib = { y1: e.clientY, p1: pendingP1, y2: 0, p2: 0 };
        calibStep = 2;
        showToast("\u2461 Y\uCD95 \uB208\uAE08 \uD558\uB098\uB97C \uD074\uB9AD\uD55C \uB4A4, \uADF8 \uAC00\uACA9\uC744 \uC785\uB825\uD574\uC918", true);
        return;
      }
      if (calibStep === 2) {
        askSecondPrice(e.clientY);
        return;
      }
      if (mode === "hline") {
        drawings.push({ type: "h", y: e.clientY });
        redraw();
      } else if (mode === "trend" || mode === "region") {
        drag = { x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY };
      }
    }, onMove = function(e) {
      if (drag) {
        drag.x2 = e.clientX;
        drag.y2 = e.clientY;
        redraw();
      }
    }, onUp = function() {
      if (!drag) return;
      if (mode === "region") {
        const w2 = Math.abs(drag.x2 - drag.x1);
        const h2 = Math.abs(drag.y2 - drag.y1);
        if (w2 > 80 && h2 > 60) {
          region = { x: Math.min(drag.x1, drag.x2), y: Math.min(drag.y1, drag.y2), w: w2, h: h2 };
          showToast("\uCC28\uD2B8 \uC601\uC5ED\uC744 \uC9C0\uC815\uD588\uC5B4 \u2014 \uC774\uC81C \uC120\uC774 \uC774 \uC548\uC5D0\uB9CC \uADF8\uB824\uC838");
        }
        drag = null;
        setMode(null);
        redraw();
        return;
      }
      drawings.push({ type: "t", ...drag });
      drag = null;
      redraw();
    };
    autoDetectRegion2 = autoDetectRegion, ensureCanvas2 = ensureCanvas, resize2 = resize, redraw2 = redraw, line2 = line, tag2 = tag, ensureToolbar2 = ensureToolbar, showToast2 = showToast, setMode2 = setMode, startCalibration2 = startCalibration, askSecondPrice2 = askSecondPrice, priceToY2 = priceToY, yToPrice2 = yToPrice, renderLevels2 = renderLevels, fmt2 = fmt, onDown2 = onDown, onMove2 = onMove, onUp2 = onUp;
    w.__HOLD_CS__ = true;
    const Z = "2147483640";
    const COLOR = {
      support: "#57C7A4",
      resistance: "#FF6B77",
      entry: "#F2F4F8",
      stop: "#FF6B77",
      target: "#57C7A4"
    };
    let canvas = null;
    let ctx = null;
    let toolbar = null;
    let toast = null;
    let mode = null;
    let drawings = [];
    let calib = null;
    let pendingLevels = null;
    let calibStep = 0;
    let drag = null;
    let region = null;
    const chartRect = () => region ?? { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
    let pendingY2 = 0;
    let pendingP1 = 0;
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      ensureCanvas();
      ensureToolbar();
      if (msg?.type === "HOLD_PING") {
        sendResponse({ ok: true });
      } else if (msg?.type === "HOLD_SET_MODE") {
        setMode(msg.mode ?? null);
        sendResponse({ ok: true });
      } else if (msg?.type === "HOLD_CLEAR") {
        drawings = [];
        calib = null;
        redraw();
        sendResponse({ ok: true });
      } else if (msg?.type === "HOLD_DRAW_LEVELS") {
        const { levels, currentPrice } = msg;
        if (!region) autoDetectRegion();
        if (!calib) {
          pendingLevels = { levels, currentPrice };
          pendingP1 = currentPrice;
          startCalibration(currentPrice);
        } else {
          renderLevels(levels);
        }
        sendResponse({ ok: true });
      }
      return void 0;
    });
  }
  var autoDetectRegion2;
  var ensureCanvas2;
  var resize2;
  var redraw2;
  var line2;
  var tag2;
  var ensureToolbar2;
  var showToast2;
  var setMode2;
  var startCalibration2;
  var askSecondPrice2;
  var priceToY2;
  var yToPrice2;
  var renderLevels2;
  var fmt2;
  var onDown2;
  var onMove2;
  var onUp2;
})();
