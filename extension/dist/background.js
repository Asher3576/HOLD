"use strict";
(() => {
  // src/background.ts
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((e) => console.warn("[HOLD] sidePanel behavior", e));
})();
