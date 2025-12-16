import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";

async function loadSettings() {
  var settings = await browser.storage.local.get(null);

  document.getElementById("proxy1-host").value = settings["proxy1-host"]
    ? settings["proxy1-host"]
    : "";
  document.getElementById("proxy1-port").value = settings["proxy1-port"]
    ? settings["proxy1-port"]
    : 0;

  document.getElementById("proxy2-host").value = settings["proxy2-host"]
    ? settings["proxy2-host"]
    : "";
  document.getElementById("proxy2-port").value = settings["proxy2-port"]
    ? settings["proxy2-port"]
    : 0;

  var customList = settings["custom-list"] ? settings["custom-list"] : [];
  var telemetryList = [];

  if (!settings["telemetry-list"]) {
    await browser.storage.local.set({
      "telemetry-list": constants.TELEMETRY_LIST,
    });
    telemetryList = constants.TELEMETRY_LIST;
  } else {
    telemetryList = settings["telemetry-list"];
  }

  document.getElementById("telemetry-urls").value = telemetryList.join("\n");
  document.getElementById("custom-urls").value = customList.join("\n");

  document.getElementById("telemetry-title").innerText = telemetryList.length;
  document.getElementById("fireproxy").checked = settings["fireproxy"];
}

async function setClickable() {
  document.getElementById("set-proxy-button").onclick = saveProxy;

  document.getElementById("save-settings").onclick = saveSettings;

  document.getElementById("fireproxy").onclick = () => {
    browser.storage.local.set({
      fireproxy: document.getElementById("fireproxy").checked,
    });
  };
}

async function saveSettings() {
  var telemetryUrls = document
    .getElementById("telemetry-urls")
    .value.split(/\r?\n/);
  var customUrls = document.getElementById("custom-urls").value.split(/\r?\n/);

  var sanitizedTelemetry = telemetryUrls.map((url) => utils.sanitize(url));
  var sanitizedCustom = customUrls.map((url) => utils.sanitize(url));

  browser.storage.local.set({
    "telemetry-list": sanitizedTelemetry,
    "custom-list": sanitizedCustom,
  });
}

async function saveProxy() {
  browser.storage.local.set({
    "proxy1-host": utils.sanitize(document.getElementById("proxy1-host").value),
    "proxy1-port": utils.sanitize(document.getElementById("proxy1-port").value),
    "proxy2-host": utils.sanitize(document.getElementById("proxy2-host").value),
    "proxy2-port": utils.sanitize(document.getElementById("proxy2-port").value),
  });
}

async function main() {
  await loadSettings();
  await setClickable();
}

document.addEventListener("DOMContentLoaded", main);
