import * as template from "../utils/templates.js";
import * as utils from "../utils/utils.js";

async function generateUI() {
  var radioButtonsHTML = "";

  for (const color in template.COLORS_MAP) {
    radioButtonsHTML += template.RADIO_BUTTON(color);
  }

  document.getElementById("color-picker").innerHTML = radioButtonsHTML;
}

async function setClickable() {
  document.getElementById("add-new-container-button").onclick = addNewContainer;
}

async function addNewContainer() {
  const containerName = utils.sanitize(
    document.getElementById("new-container-text").value,
  );
  const color = document.querySelector('input[name="color"]:checked').value;
  const containerColor = template.COLORS_MAP[color];

  browser.contextualIdentities
    .create({
      name: containerName,
      color: containerColor,
      icon: utils.getContainerIcon(),
    })
    .then(async (_) => {
      await browser.storage.local.set({ [_.cookieStoreId]: "proxy1" });
      document.getElementById("containers").innerHTML +=
        template.CONTAINER_TEMPLATE(
          containerName,
          containerColor,
          _.cookieStoreId,
          "proxy1",
        );

      await setClickable();
      browser.tabs.create({
        active: true,
        cookieStoreId: _.cookieStoreId,
      });

      document.getElementById("new-container-text").value = "";
    });
}

async function popup() {
  await generateUI();
  await setClickable();
}

popup();
