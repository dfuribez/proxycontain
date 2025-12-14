export const RADIO_BUTTON = (color) => {
  return `<div>
    <input type="radio" id="burp-${color}" name="color" value="${color}" ${color === "red" ? "checked" : ""}>
    <label for="burp-${color}">
      <span style="background-color: ${color}">
        <img src="../res/check-icn.svg" alt="Checked Icon" />
      </span>
    </label>
  </div>`;
};

export const COLORS_MAP = {
  red: "red",
  orange: "orange",
  yellow: "yellow",
  lightgreen: "green",
  lightblue: "blue",
  pink: "pink",
  magenta: "purple", // *
  cyan: "turquoise", // *
  lightgray: "toolbar", // *
};
