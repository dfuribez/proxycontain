import * as constants from "../utils/constants.js";
import * as template from "../utils/templates.js";
import * as utils from "../utils/utils.js";

async function generateUI() {
  var radioButtonsHTML = "";

  for (const color in constants.COLORS_MAP) {
    radioButtonsHTML += template.RADIO_BUTTON(color);
  }

  document.getElementById("color-picker").innerHTML = radioButtonsHTML;

  var containers = await browser.contextualIdentities.query({});

  var storedHeaders = await browser.storage.local.get("headers");

  var headersTable = document.getElementById("headers-table");
  headersTable.textContent = "";

  Object.keys(storedHeaders.headers || {}).forEach((key) => {
    const header = storedHeaders.headers[key];
    headersTable.appendChild(
      template.HEADER_TEMPLATE(
        header.name,
        header.value,
        key,
        header.container,
        containers,
      ),
    );
  });

  var headerStatus = await browser.storage.local.get("header-status");
  headerStatus = headerStatus["header-status"] ?? true;

  document.getElementById("headers").open = headerStatus;
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

async function addHeader() {
  var headerName = document.getElementById("header-name").value;
  var headerValue = document.getElementById("header-value").value;

  var storedHeaders = await browser.storage.local.get("headers");

  const id = Date.now() + Math.random().toString(36).slice(2, 7);

  var headers = storedHeaders.headers || {};

  headers[id] = {
    name: headerName,
    value: headerValue,
    container: "all-containers",
  };
  await browser.storage.local.set({ headers: headers });

  document.getElementById("header-name").value = "";
  document.getElementById("header-value").value = "";

  await popup();
}

async function setClickable() {
  const [currentTab] = await browser.tabs.query({ active: true });

  document.getElementById("headers").ontoggle = async () => {
    await browser.storage.local.set({
      "header-status": document.getElementById("headers").open,
    });
  };

  document.getElementById("enable-inputs").onclick = async () => {
    browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        document.querySelectorAll(":disabled").forEach((element) => {
          element.disabled = false;
        });
      },
    });
  };

  document.getElementById("allow-pasting").onclick = async (e) => {
    if (e.target.checked) {
      browser.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => {
          ["paste", "copy", "cut", "contextmenu", "keydown"].forEach((type) => {
            document.addEventListener(
              type,
              function (e) {
                e.stopImmediatePropagation();
                return true;
              },
              true,
            );
          });
        },
      });
    }
    saveSettings();
  };

  const { headers } = await browser.storage.local.get("headers");

  for (const del of document.getElementsByClassName("delete-header")) {
    const headerId = del.id.slice(2);
    del.onclick = async () => {
      delete headers[headerId];
      await browser.storage.local.set({ headers: headers });
      await popup();
    };
  }

  for (const option of document.getElementsByClassName("option-header")) {
    const headerId = option.id.slice(3);
    option.onchange = async (element) => {
      headers[headerId].container = element.target.value;
      await browser.storage.local.set({ headers: headers });
    };
  }

  for (const open of document.getElementsByClassName("open-container")) {
    open.onclick = () => {
      browser.tabs.create({
        active: true,
        cookieStoreId: open.id.substring(2),
      });
    };
  }

  for (const sbutton of document.getElementsByClassName("delete-button")) {
    const cookieStoreId = sbutton.title;
    sbutton.onclick = () => {
      browser.contextualIdentities.remove(cookieStoreId).then(() => {
        document.getElementById(cookieStoreId).remove();
        browser.storage.local.remove(cookieStoreId);
      });
    };
  }

  for (const select of document.getElementsByClassName("select-proxy")) {
    select.onclick = async (element) => {
      const proxy = element.target.value;
      const cookie = element.target.parentNode.id.slice(3);
      await browser.storage.local.set({ [cookie]: proxy });
    };
  }

  document.getElementById("current-tab-remove-local").onclick = async () => {
    await getStorageElements();
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: async () => {
        localStorage.clear();
      },
    });
    getStorageElements();
  };

  document.getElementById("current-tab-remove-session").onclick = async () => {
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
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
    await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        sessionStorage.clear();
        localStorage.clear();
      },
    });
    await removeCookies();
    getStorageElements();
  };

  document.getElementById("current-tab-reload").onclick = async () => {
    await browser.tabs.reload(currentTab.id, { bypassCache: true });
    getStorageElements();
  };

  document.getElementById("open-settings").onclick = () => {
    browser.runtime.openOptionsPage();
  };

  document.getElementById("bypass-telemetry").onclick = saveSettings;
  document.getElementById("bypass-custom").onclick = saveSettings;
  document.getElementById("bypass-options").onclick = saveSettings;
  document.getElementById("allow-select").onclick = saveSettings;
  document.getElementById("add-new-container-button").onclick = addNewContainer;
  document.getElementById("search").onkeyup = filterContainers;
  document.getElementById("add-header").onclick = addHeader;
}

async function saveSettings() {
  browser.storage.local.set({
    "bypass-telemetry": document.getElementById("bypass-telemetry").checked,
    "bypass-custom": document.getElementById("bypass-custom").checked,
    "bypass-options": document.getElementById("bypass-options").checked,
    allowpasting: document.getElementById("allow-pasting").checked,
    allowselect: document.getElementById("allow-select").checked,
  });
}

async function getStorageElements() {
  const [currentTab] = await browser.tabs.query({ active: true });

  try {
    var [local] = await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        return localStorage.length;
      },
    });
  } catch {
    local = { result: "NA" };
  }

  try {
    var [session] = await browser.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        return sessionStorage.length;
      },
    });
  } catch {
    session = { result: "NA" };
  }

  local = local || { result: 0 };
  session = session || { result: 0 };

  const cookies = await browser.cookies.getAll({
    url: currentTab.url,
    storeId: currentTab.cookieStoreId,
  });

  document.getElementById("local-items").innerText = local.result + " items";
  document.getElementById("session-items").innerText =
    session.result + " items";
  document.getElementById("cookies").innerText = cookies.length + " cookies";
}

async function addNewContainer() {
  const containerName = document.getElementById("new-container-text").value;
  const color = document.querySelector('input[name="color"]:checked').value;
  const containerColor = constants.COLORS_MAP[color];

  browser.contextualIdentities
    .create({
      name: containerName,
      color: containerColor,
      icon: utils.getContainerIcon(),
    })
    .then(async (_) => {
      await browser.storage.local.set({ [_.cookieStoreId]: "Proxy 1" });
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

  var containerTable = document.getElementById("containers");
  containerTable.textContent = "";

  for (const container of containers) {
    var cookieStoreId = container.cookieStoreId;
    var color = await utils.firefox2UIColor(container.color);

    try {
      var selectedProxy = settings[cookieStoreId];
    } catch (e) {
      var selectedProxy = "No Proxy";
    }

    containerTable.appendChild(
      template.CONTAINER_TEMPLATE(
        container.name,
        color,
        container.iconUrl,
        cookieStoreId,
        selectedProxy,
      ),
    );
  }
  document.getElementById("total-containers").innerText =
    `Containers (${containers.length})`;
  await setClickable();
}

async function filterContainers() {
  var filter = utils.sanitize(document.getElementById("search").value);
  var settings = await browser.storage.local.get(null);

  displayAllContainers(settings, filter.toLowerCase());
}

async function loadSettings() {
  var settings = await browser.storage.local.get(null);

  var p1 = `${settings["proxy1-host"]}:${settings["proxy1-port"]}`;
  var p2 = `${settings["proxy2-host"]}:${settings["proxy2-port"]}`;

  document.getElementById("proxy1-settings").innerHTML = utils.sanitize(p1);
  document.getElementById("proxy2-settings").innerHTML = utils.sanitize(p2);

  document.getElementById("bypass-telemetry").checked =
    settings["bypass-telemetry"];
  document.getElementById("bypass-custom").checked = settings["bypass-custom"];
  document.getElementById("bypass-options").checked =
    settings["bypass-options"];

  document.getElementById("allow-pasting").checked = settings["allowpasting"];
  document.getElementById("allow-select").checked = settings["allowselect"];

  await displayAllContainers(settings);
  await getStorageElements();
}

async function popup() {
  await generateUI();
  await loadSettings();
  await setClickable();
}

popup();
