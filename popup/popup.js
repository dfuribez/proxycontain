import * as constants from "../utils/constants.js";
import * as template from "../utils/templates.js";
import * as utils from "../utils/utils.js";

async function generateUI() {
  var radioButtonsHTML = "";

  for (const color in constants.COLORS_MAP) {
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
  const containerColor = constants.COLORS_MAP[color];

  browser.contextualIdentities
    .create({
      name: containerName,
      color: containerColor,
      icon: utils.getContainerIcon(),
    })
    .then(async (_) => {
      await browser.storage.local.set({ [_.cookieStoreId]: "proxy1" });
      await displayAllContainers(await browser.storage.local.get(null));
      await setClickable();

      browser.tabs.create({
        active: true,
        cookieStoreId: _.cookieStoreId,
      });

      document.getElementById("new-container-text").value = "";
    });
}

async function displayAllContainers(settings) {
  var containers = await browser.contextualIdentities.query({});

  containers.sort((a, b) => a.name.localeCompare(b.name));

  var containersHTML = "";

  for (const container of containers) {
    var cookieStoreId = container.cookieStoreId;
    var color = await utils.firefox2UIColor(container.color);

    try {
      var selectedProxy = settings[cookieStoreId];
    } catch (e) {
      var selectedProxy = "no-proxy";
    }

    console.log(cookieStoreId + " " + selectedProxy);

    containersHTML += template.CONTAINER_TEMPLATE(
      utils.sanitize(container.name),
      color,
      cookieStoreId,
      selectedProxy,
    );
  }

  document.getElementById("containers").innerHTML = containersHTML;
}

async function loadSettings() {
  var settings = await browser.storage.local.get(null);

  var p1 = `Proxy 1: ${settings["proxy1-host"]}:${settings["proxy1-port"]}`;
  var p2 = `Proxy 2: ${settings["proxy2-host"]}:${settings["proxy2-port"]}`;

  document.getElementById("proxy1-settings").innerHTML = utils.sanitize(p1);
  document.getElementById("proxy2-settings").innerHTML = utils.sanitize(p2);

  document.getElementById("bypass-telemetry").checked =
    settings["bypass-telemetry"];
  document.getElementById("bypass-custom").checked = settings["bypass-others"];
  document.getElementById("bypass-options").checked =
    settings["bypass-options"];

  displayAllContainers(settings);
}

async function popup() {
  await generateUI();
  await loadSettings();
  await setClickable();
}

popup();
