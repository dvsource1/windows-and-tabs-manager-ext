import * as _ from "lodash";
import "./style.css";

const getAllMonitors = async () => {
  const monitors = await chrome.system.display.getInfo();
  console.log(monitors);
  return monitors;
};
const getAllWindows = async () => {
  const windows = await chrome.windows.getAll({ populate: true });
  console.log(windows);
  return windows;
};

const actions = [
  {
    id: "getAllMonitors",
    name: "getAllMonitors",
    callback: getAllMonitors,
  },
  {
    id: "getAllWindows",
    name: "getAllWindows",
    callback: getAllWindows,
  },
];

const container = document.getElementById("app");

_.forEach(actions, (action) => {
  const button = document.createElement("button");
  button.append(document.createTextNode(action.name));
  button.setAttribute("id", action.id);
  button.addEventListener("click", action.callback);
  container.append(button);
});
