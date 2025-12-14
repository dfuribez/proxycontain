import * as constants from "./constants.js";

export function sanitize(unsafe) {
  const temp = document.createElement("div");
  temp.textContent = unsafe;

  return temp.innerHTML;
}

export function getContainerIcon() {
  return constants.CONTEXTUAL_ICONS[
    Math.floor(Math.random() * constants.CONTEXTUAL_ICONS.length)
  ];
}

export async function firefox2UIColor(color) {
  for (const ccolor in constants.COLORS_MAP) {
    if (constants.COLORS_MAP[ccolor] == color) {
      return ccolor;
    }
  }
}
