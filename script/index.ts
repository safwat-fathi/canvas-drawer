import CanvasApp from "./canvas.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// canvas actions
const drawLine = document.getElementById("draw-line") as HTMLButtonElement;
const undo = document.getElementById("undo") as HTMLButtonElement;
const clear = document.getElementById("clear") as HTMLButtonElement;
const xport = document.getElementById("export") as HTMLButtonElement;
// canvas controls
const lineWidth = document.getElementById("width") as HTMLInputElement;
const color = document.getElementById("color") as HTMLInputElement;

const canvasApp = new CanvasApp(canvas);

canvasApp.init({ lineWidth: +lineWidth.value, strokeStyle: color.value });
console.log("🚀 ~ color.value:", color.value);

clear.addEventListener("click", canvasApp.clear);
undo.addEventListener("click", canvasApp.undo);
xport.addEventListener("click", canvasApp.export);

drawLine.addEventListener("click", () => {
  let toggle = false;

  if (drawLine.getAttribute("data-toggle") === "true") {
    drawLine.setAttribute("data-toggle", "false");
    toggle = false;
  } else {
    drawLine.setAttribute("data-toggle", "true");
    toggle = true;
  }

  canvasApp.setDrawLine(toggle);
});

lineWidth.addEventListener("input", () => {
  canvasApp.setOptions({ lineWidth: +lineWidth.value });
});

color.addEventListener("input", () => {
  canvasApp.setOptions({ strokeStyle: color.value });
});
