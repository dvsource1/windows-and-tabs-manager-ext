import * as _ from "lodash";

export const view_windows = async (
  parent: HTMLDivElement,
  monitersWithWindows
) => {
  const c = document.createElement("canvas");
  c.setAttribute("style", "border:1px solid #d3d3d3;");

  let maxWidth = 0;
  let maxHeight = 0;
  const monitorBounds = [];
  const ctx = c.getContext("2d");
  ctx.font = "20px Georgia";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (!_.isEmpty(monitersWithWindows)) {
    _.forEach(monitersWithWindows, (moniter) => {
      monitorBounds.push({ ...moniter.bounds, windows: moniter.windows });
      if (maxWidth < moniter.bounds.left + moniter.bounds.width) {
        maxWidth = moniter.bounds.left + moniter.bounds.width;
      }
      if (maxHeight < moniter.bounds.top + moniter.bounds.height) {
        maxHeight = moniter.bounds.top + moniter.bounds.height;
      }
    });
  }
  c.setAttribute("width", `${maxWidth / 10}`);
  c.setAttribute("height", `${maxHeight / 10}`);
  c.setAttribute("style", "border:1px solid #d3d3d3;");
  _.forEach(monitorBounds, (monitorBound) => {
    const { left, top, width, height, windows } = monitorBound;
    ctx.rect(left / 10, top / 10, width / 10, height / 10);
    _.forEach(windows, (window, i) => {
      ctx.fillText(
        `id: ${window.id}, n_tabs: ${window.tabs?.length}`,
        left / 10 + 2,
        (top + height) / 10 - i * 10 - 2
      );
    });
  });

  ctx.stroke();
  parent.append(c);
};
