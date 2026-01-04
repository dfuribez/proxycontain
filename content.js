let allowPasting = false;
let allowSelecting = false;

function allowPaste(e) {
  if (!allowPasting) return;
  e.stopImmediatePropagation();
}

function allowSelect(e) {
  if (!allowSelect) return;
  e.stopImmediatePropagation();
}

["paste", "copy", "cut", "contextmenu", "keydown"].forEach((type) => {
  document.addEventListener(type, allowPaste, true);
});

["selectstart", "mousedown"].forEach((type) => {
  document.addEventListener(type, allowSelect, true);
});

browser.storage.local.get(null).then((settings) => {
  allowPasting = settings.allowpasting;
  allowSelecting = settings.allowselect;

  if (allowSelecting) {
    style = document.createElement("style");
    style.textContent = `
      * {
        user-select: auto !important;
        -webkit-user-select: auto !important;
        -moz-user-select: auto !important;
      }
    `;
    document.documentElement.appendChild(style);
  }
});
