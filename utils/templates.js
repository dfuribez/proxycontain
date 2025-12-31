export const RADIO_BUTTON = (color) => {
  return `<div class="item">
    <input type="radio" id="burp-${color}" name="color" value="${color}" ${color === "red" ? "checked" : ""}>
    <label for="burp-${color}">
      <span style="background-color: ${color}">
        <img src="../res/check-icn.svg" alt="Checked Icon" />
      </span>
    </label>
  </div>`;
};

/**
 * Generates a container template string for a UI element.
 *
 * The template returned by this function includes the
 * container name, its color representation, the associated
 * cookie store identifier, and optional parameter values.
 *
 * @constant
 * @param {string} name - The name of the container.
 * @param {string} color - The CSS-compatible color value for the container.
 * @param {string} cookieStoreId - The cookie store identifier associated with this container.
 * @param {string} proxy - It can be "proxy1", "proxy2", "no-proxy"
 * @returns {string} A fully formatted UI container template.
 *
 * @example
 * // Create a container for "Main" with red color
 * const html = CONTAINER_TEMPLATE("Main", "#ff0000", "proxy1");
 */
export const CONTAINER_TEMPLATE = (
  name,
  color,
  image,
  cookieStoreId,
  proxy,
) => {
  var proxy1;
  var proxy2;
  var noProxy = "selected";

  if (proxy == "proxy1") {
    proxy1 = "selected";
    proxy2 = "";
    noProxy = "";
  }

  if (proxy == "proxy2") {
    proxy1 = "";
    proxy2 = "selected";
    noProxy = "";
  }

  return `
  <tr id="${cookieStoreId}">
    <th class="container-image open-container" id="i-${cookieStoreId}"><img src="${image}"></th>
    <th>
      <div class="div-color open-container" id="d-${cookieStoreId}" style="background-color: ${color}"></div>
    </th>
    <th><div class="container open-container" id="b-${cookieStoreId}" alt="${cookieStoreId}">${name}</div></th>
    <th>
      <input type="button" value="Delete" class="delete-button" title="${cookieStoreId}">
    </th>

    <th>
      <select name="proxies" id="px-${cookieStoreId}" class="select-proxy">
        <option value="proxy1" ${proxy1}>Proxy 1</option>
        <option value="proxy2" ${proxy2}>Proxy 2</option>
        <option value="no-proxy" ${noProxy}>No proxy</option>
      </select>
    </th>
  </tr>
    `;
};

export const HEADER_TEMPLATE = (name, value, headerId, tabs) => {
  var drop = `<select name="proxies" id="sn-${headerId}" class="option-header">
    <option value="all">all</option>`;

  tabs.forEach((tab) => {
    drop += `<option value="${tab.name}" >${tab.name}</option>`;
  });

  return `
  <tr>
    <th>${name}</th>
    <td>${value}</td>
    <td><input type="button" value="delete" id="d-${headerId} class="delete-header"">
    <td>
      ${drop}
      </select>
    </td>
  </tr>
    `;
};
