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
}

async function setClickable() {
  document.getElementById("set-proxy-button").onclick = saveProxy;
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
