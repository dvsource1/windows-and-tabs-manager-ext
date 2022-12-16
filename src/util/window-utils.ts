import * as _ from "lodash";
import { getDisplays } from "../api/system";
import { getAllWindows } from "../api/windows";

export const getAllMonitors = async () => {
  const monitors = await getDisplays();
  return monitors;
};

export const getAllWindowsWithTabs = async () => {
  const windows = await getAllWindows({ populate: true });
  return windows;
};

export const getAllNoneNormalWindows = async () => {
  const windows = await getAllWindows({
    windowTypes: ["panel", "popup", "devtools", "app"],
  });
  return windows;
};

export const mapMonitorsAndWindows = (monitors, windows) => {
  if (!_.isEmpty(monitors)) {
    _.forEach(monitors, (monitor) => {
      const { left, top, width, height } = monitor.bounds;
      _.set(monitor, "windows", []);
      _.forEach(windows, (window) => {
        const { left: x, top: y } = window;
        if (left <= x && x < left + width && top <= y && y < top + height) {
          _.get(monitor, "windows").push(window);
        }
      });
    });
  }

  return monitors;
};
