import { FastAverageColor } from "fast-average-color";
const fac = new FastAverageColor();

export const getAvarageColor = async (url: string) => {
  return await fac.getColorAsync(url);
};
// const color = await getAvarageColor(tab.favIconUrl);
// console.log(domain, color?.hex);

export const getDomain = (data) => {
  var a = document.createElement("a");
  a.href = data;
  return a.hostname;
};
