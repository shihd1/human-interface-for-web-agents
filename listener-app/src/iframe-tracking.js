// iframe-tracking.js

// Track clicks
document.addEventListener("click", (event) => {
  const target = event.target;
  const interaction = {
    type: "click",
    x: event.clientX,
    y: event.clientY,
    element: target.tagName,
    elementText: target.innerText || target.alt || "N/A",
  };
  parent.postMessage({ type: "interaction", payload: interaction }, "*");
});

// Track hover and hover duration
let hoverStartTime;
document.addEventListener("mouseover", (event) => {
  hoverStartTime = Date.now();
  const target = event.target;
  const interaction = {
    type: "hover",
    element: target.tagName,
    elementText: target.innerText || target.alt || "N/A",
  };
  parent.postMessage({ type: "interaction", payload: interaction }, "*");
});
document.addEventListener("mouseout", (event) => {
  const hoverDuration = Date.now() - hoverStartTime;
  const interaction = {
    type: "hover-end",
    duration: hoverDuration,
  };
  parent.postMessage({ type: "interaction", payload: interaction }, "*");
});

// Track scrolling
document.addEventListener("scroll", () => {
  const interaction = {
    type: "scroll",
    scrollTop: document.documentElement.scrollTop,
    scrollLeft: document.documentElement.scrollLeft,
  };
  parent.postMessage({ type: "interaction", payload: interaction }, "*");
});
