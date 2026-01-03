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

export const CONTAINER_TEMPLATE = (
  name,
  color,
  image,
  cookieStoreId,
  proxy,
) => {
  var tr = document.createElement("tr");
  var tdImage = document.createElement("td");
  var tdColor = document.createElement("td");

  tr.id = cookieStoreId;

  var img = document.createElement("img");
  img.src = image;

  tdImage.classList.add("container-image");
  tdImage.classList.add("open-container");
  tdImage.id = "i-" + cookieStoreId;
  tdImage.appendChild(img);

  var colorDiv = document.createElement("div");

  colorDiv.classList.add("div-color");
  colorDiv.classList.add("open-container");
  colorDiv.id = "d-" + cookieStoreId;
  colorDiv.style = "background-color: " + color;

  tdColor.appendChild(colorDiv);

  var thName = document.createElement("th");
  var nameDiv = document.createElement("div");

  nameDiv.classList.add("container");
  nameDiv.classList.add("open-container");
  nameDiv.id = "b-" + cookieStoreId;
  nameDiv.textContent = name;

  thName.appendChild(nameDiv);

  var thButton = document.createElement("th");
  var deleteButton = document.createElement("input");

  deleteButton.classList.add("delete-button");
  deleteButton.type = "button";
  deleteButton.title = cookieStoreId;
  deleteButton.value = "Delete";

  thButton.appendChild(deleteButton);

  var thSelect = document.createElement("th");
  var select = document.createElement("select");

  select.id = "px-" + cookieStoreId;
  select.classList.add("select-proxy");

  ["Proxy 1", "Proxy 2", "No Proxy"].forEach((e) => {
    var option = document.createElement("option");
    option.textContent = e;
    option.value = e;
    option.selected = proxy == e;
    select.appendChild(option);
  });

  thSelect.appendChild(select);

  tr.appendChild(tdImage);
  tr.appendChild(tdColor);
  tr.appendChild(thName);
  tr.appendChild(thButton);
  tr.appendChild(thSelect);

  return tr;
};

export const HEADER_TEMPLATE = (name, value, headerId, container, tabs) => {
  var tr = document.createElement("tr");
  var thName = document.createElement("th");
  var tdValue = document.createElement("td");

  var deleteButton = document.createElement("input");
  var thButton = document.createElement("th");
  deleteButton.value = "Delete";
  deleteButton.classList.add("delete-header");
  deleteButton.type = "button";
  deleteButton.id = "d-" + headerId;

  thButton.appendChild(deleteButton);

  var select = document.createElement("select");
  var thSelect = document.createElement("th");

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

  thSelect.append(select);

  thName.textContent = name;
  tdValue.textContent = value;

  tr.appendChild(thName);
  tr.appendChild(tdValue);
  tr.appendChild(thButton);
  tr.appendChild(thSelect);

  return tr;
};
