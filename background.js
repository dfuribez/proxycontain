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

async function isDomainBlacklisted(url, blacklist) {
  const currentDomain = new URL(url).hostname;
  return blacklist.includes(currentDomain);
}

async function setproxy(requestDetails) {
  if (requestDetails.cookieStoreId === "firefox-default") {
    return { type: "direct" };
  }

  var settings = await browser.storage.local.get(null);

  const telemetryList = settings["telemetry-list"] || [];
  const customList = settings["custom-list"] || [];

  if (settings["bypass-options"] && requestDetails.method === "OPTIONS") {
    console.log("bypassing OPTIONS: " + requestDetails.url);
    return { type: "direct" };
  }

  if (settings["bypass-telemetry"]) {
    if (await isDomainBlacklisted(requestDetails.url, telemetryList)) {
      console.log("bypassing: " + url);
      return { type: "direct" };
    }
  }

  if (settings["bypass-custom"]) {
    if (await isDomainBlacklisted(requestDetails.url, customList)) {
      console.log("bypassing: " + url);
      return { type: "direct" };
    }
  }

  switch (settings[requestDetails.cookieStoreId] || "Proxy 1") {
    case "Proxy 1":
      return {
        type: "http",
        host: settings["proxy1-host"],
        port: settings["proxy1-port"],
      };
    case "Proxy 2":
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
  var container = await browser.contextualIdentities.get(cookieStoreId);

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

  Object.keys(settings.headers || {}).forEach((key) => {
    const header = settings.headers[key];

    if (
      header.container == container.name ||
      header.container == "all-containers"
    ) {
      _.requestHeaders.push({ name: header.name, value: header.value });
    }
  });

  return { requestHeaders: _.requestHeaders };
}

browser.proxy.onRequest.addListener(setproxy, { urls: ["<all_urls>"] });
browser.webRequest.onBeforeSendHeaders.addListener(
  addHeaders,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"],
);
