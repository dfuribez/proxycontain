let allowPasting = false;
let allowSelecting = false;

function allowPaste(e) {
  if (!allowPasting) return;
  e.stopImmediatePropagation();
  return true;
}

function allowSelect(e) {
  if (!allowSelecting) return;
  e.stopImmediatePropagation();
  return true;
}

browser.storage.local.get(null).then((settings) => {
  allowPasting = settings.allowpasting;
  allowSelecting = settings.allowselect;

  if (allowPasting) {
    ["paste", "copy", "cut", "contextmenu", "keydown"].forEach((type) => {
      document.addEventListener(type, allowPaste, true);
    });
  }

  if (allowSelecting) {
    ["selectstart", "mousedown"].forEach((type) => {
      document.addEventListener(type, allowSelect, true);
    });

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
