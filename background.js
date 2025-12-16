const FIREFOX2BURP_COLORS = {
  red: "red",
  orange: "orange",
  yellow: "yellow",
  green: "green",
  blue: "blue",
  pink: "pink",
  purple: "magenta",
  turquoise: "cyan",
  toolbar: "gray",
};

async function checkBlacklist(url, blacklist) {
  for (const black of blacklist) {
    if (url.includes(black)) {
      console.log("bypassing: " + url + " blacklisted: " + black);
      return true;
    }
  }
  return false;
}

async function setproxy(requestDetails) {
  var settings = await browser.storage.local.get(null);

  const telemetryList = settings["telemetry-list"]
    ? settings["telemetry-list"]
    : [];
  const customList = settings["custom-list"] ? settings["custom-list"] : [];

  if (settings["bypass-options"] && requestDetails.method === "OPTIONS") {
    console.log("bypassing OPTIONS: " + requestDetails.url);
    return { type: "direct" };
  }

  if (settings["bypass-telemetry"]) {
    if (await checkBlacklist(requestDetails.url, telemetryList)) {
      return null;
    }
  }

  if (settings["bypass-custom"]) {
    if (await checkBlacklist(requestDetails.url, customList)) {
      return null;
    }
  }

  const cookieStoreId = requestDetails.cookieStoreId;
  const containerProxy = settings[cookieStoreId];

  switch (containerProxy) {
    case "proxy1":
      return {
        type: "http",
        host: settings["proxy1-host"],
        port: settings["proxy1-port"],
      };
    case "proxy2":
      return {
        type: "http",
        host: settings["proxy2-host"],
        port: settings["proxy2-port"],
      };
    default:
      return { type: "direct" };
  }
}

async function addHeaders(_) {
  var settings = await browser.storage.local.get(null);

  var cookieStoreId = _.cookieStoreId;

  if (cookieStoreId == "firefox-default") {
    return { requestHeaders: _.requestHeaders };
  }

  if (settings["fireproxy"]) {
    var { color, name } = await browser.contextualIdentities
      .get(cookieStoreId)
      .then((c) => {
        return { color: c.color, name: c.name };
      });

    const headerValue = `${FIREFOX2BURP_COLORS[color]},${name}`;
    _.requestHeaders.push({ name: "x-fire", value: headerValue });
  }

  return { requestHeaders: _.requestHeaders };
}

browser.proxy.onRequest.addListener(setproxy, { urls: ["<all_urls>"] });
browser.webRequest.onBeforeSendHeaders.addListener(
  addHeaders,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"],
);
