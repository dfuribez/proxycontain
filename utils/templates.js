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

export const HEADER_TEMPLATE = (name, value, headerId, container, tabs) => {
  var tr = document.createElement("tr");
  var thName = document.createElement("th");
  var tdValue = document.createElement("td");
  var deleteButton = document.createElement("input");
  var select = document.createElement("select");

  deleteButton.value = "Delete";
  deleteButton.classList.add("delete-header");
  deleteButton.type = "button";
  deleteButton.id = "d-" + headerId;

  select.id = "sn-" + headerId;
  select.classList.add("option-header");

  var containerNames = tabs.map((obj) => obj.name);

  containerNames.sort((a, b) => a.localeCompare(b));
  containerNames.unshift("all-containers");

  containerNames.forEach((name) => {
    var option = document.createElement("option");
    option.textContent = name;
    option.value = name;
    option.selected = name == container;

    select.appendChild(option);
  });

  thName.textContent = name;
  tdValue.textContent = value;

  tr.appendChild(thName);
  tr.appendChild(tdValue);
  tr.appendChild(deleteButton);
  tr.appendChild(select);

  return tr;
};
