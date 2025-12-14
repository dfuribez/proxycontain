import * as template from "../utils/templates.js";

async function generateUI() {
  var radioButtonsHTML = "";

  for (const color in template.COLORS_MAP) {
    radioButtonsHTML += template.RADIO_BUTTON(color);
  }

  document.getElementById("color-picker").innerHTML = radioButtonsHTML;
}

async function popup() {
  await generateUI();
}

popup();
