import * as _ from "lodash";

export const map_monitorsAndWindows = (monitors, windows) => {
  if (!_.isEmpty(monitors)) {
    _.forEach(monitors, (monitor) => {
      const { left, top, width, height } = monitor.bounds;
      _.set(monitor, "windows", []);
      _.forEach(windows, (window) => {
        const { left: x, top: y } = window;
        if (left <= x && x < left + width && top <= y && y < top + height) {
          _.get(monitor, "windows").push(monitor);
        }
      });
    });
  }

  return monitors;
};
