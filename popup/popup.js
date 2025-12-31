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

async function removeCookies() {
  const [currentTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  const url = currentTab.url;

  const cookies = await browser.cookies.getAll({
    url: url,
    storeId: currentTab.cookieStoreId,
  });

  for (const cookie of cookies) {
    await browser.cookies.remove({
      url: url,
      name: cookie.name,
      storeId: currentTab.cookieStoreId,
    });
  }
}

async function setClickable() {
  document.getElementById("add-new-container-button").onclick = addNewContainer;
  document.getElementById("search").onkeyup = filterContainers;

  const openContainers = document.getElementsByClassName("open-container");
  for (let r = 0; r < openContainers.length; r++) {
    const open = openContainers.item(r);
    open.onclick = () => {
      browser.tabs.create({
        active: true,
        cookieStoreId: open.id.substring(2),
      });
    };
  }

  const deleteButtons = document.getElementsByClassName("delete-button");
  for (let i = 0; i < deleteButtons.length; i++) {
    const sbutton = deleteButtons.item(i);
    const cookieStoreId = sbutton.title;

    sbutton.onclick = () => {
      browser.contextualIdentities.remove(cookieStoreId).then(() => {
        document.getElementById(cookieStoreId).remove();
        browser.storage.local.remove(cookieStoreId);
      });
    };
  }

  const selects = document.getElementsByClassName("select-proxy");
  for (let r = 0; r < selects.length; r++) {
    selects.item(r).onclick = async (element) => {
      const proxy = element.target.value;
      const cookie = element.target.parentNode.id.slice(3);
      await browser.storage.local.set({ [cookie]: proxy });
    };
  }

  document.getElementById("current-tab-remove-local").onclick = async () => {
    await getStorageElements();
    const currentTab = await browser.tabs.query({ active: true });
    await browser.scripting.executeScript({
      target: { tabId: currentTab[0].id },
      func: async () => {
        localStorage.clear();
      },
    });
    getStorageElements();
  };

  document.getElementById("current-tab-remove-session").onclick = async () => {
    const currentTab = await browser.tabs.query({ active: true });
    await browser.scripting.executeScript({
      target: { tabId: currentTab[0].id },
      func: () => {
        sessionStorage.clear();
      },
    });
    getStorageElements();
  };

  document.getElementById("current-tab-remove-cookies").onclick = async () => {
    await removeCookies();
    getStorageElements();
  };

  document.getElementById("current-tab-remove-all").onclick = async () => {
    const currentTab = await browser.tabs.query({ active: true });
    await browser.scripting.executeScript({
      target: { tabId: currentTab[0].id },
      func: () => {
        sessionStorage.clear();
        localStorage.clear();
      },
    });
    await removeCookies();
    getStorageElements();
  };

  document.getElementById("current-tab-reload").onclick = async () => {
    const currentTab = await browser.tabs.query({ active: true });
    browser.tabs.reload(currentTab[0].id, { bypassCache: true });
    getStorageElements();
  };

  document.getElementById("open-settings").onclick = () => {
    browser.runtime.openOptionsPage();
  };

  document.getElementById("bypass-telemetry").onclick = saveSettings;
  document.getElementById("bypass-custom").onclick = saveSettings;
  document.getElementById("bypass-options").onclick = saveSettings;
}

async function saveSettings() {
  browser.storage.local.set({
    "bypass-telemetry": document.getElementById("bypass-telemetry").checked,
    "bypass-custom": document.getElementById("bypass-custom").checked,
    "bypass-options": document.getElementById("bypass-options").checked,
  });
}

async function getStorageElements() {
  const [currentTab] = await browser.tabs.query({ active: true });

  var local = await browser.scripting.executeScript({
    target: { tabId: currentTab.id },
    func: () => {
      return localStorage.length;
    },
  });

  var session = await browser.scripting.executeScript({
    target: { tabId: currentTab.id },
    func: () => {
      return sessionStorage.length;
    },
  });

  const cookies = await browser.cookies.getAll({
    url: currentTab.url,
    storeId: currentTab.cookieStoreId,
  });

  document.getElementById("local-items").innerText = local[0].result + " items";
  document.getElementById("session-items").innerText =
    session[0].result + " items";
  document.getElementById("cookies").innerText = cookies.length + " cookies";
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

async function displayAllContainers(settings, filter) {
  var containers = await browser.contextualIdentities.query({});

  if (filter) {
    containers = containers.filter((c) =>
      c.name.toLowerCase().includes(filter),
    );
  }

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

    containersHTML += template.CONTAINER_TEMPLATE(
      utils.sanitize(container.name),
      color,
      container.iconUrl,
      cookieStoreId,
      selectedProxy,
    );
  }

  document.getElementById("containers").innerHTML = containersHTML;
  await setClickable();
}

async function filterContainers() {
  var filter = utils.sanitize(document.getElementById("search").value);
  var settings = await browser.storage.local.get(null);

  displayAllContainers(settings, filter.toLowerCase());
}

async function loadSettings() {
  var settings = await browser.storage.local.get(null);

  var p1 = `Proxy 1: ${settings["proxy1-host"]}:${settings["proxy1-port"]}`;
  var p2 = `Proxy 2: ${settings["proxy2-host"]}:${settings["proxy2-port"]}`;

  document.getElementById("proxy1-settings").innerHTML = utils.sanitize(p1);
  document.getElementById("proxy2-settings").innerHTML = utils.sanitize(p2);

  document.getElementById("bypass-telemetry").checked =
    settings["bypass-telemetry"];
  document.getElementById("bypass-custom").checked = settings["bypass-custom"];
  document.getElementById("bypass-options").checked =
    settings["bypass-options"];

  await displayAllContainers(settings);
  await getStorageElements();
}

async function popup() {
  await generateUI();
  await loadSettings();
  await setClickable();
}

popup();
