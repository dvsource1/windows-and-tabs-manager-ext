export const getDomain = (data) => {
  var a = document.createElement("a");
  a.href = data;
  return a.hostname;
};
