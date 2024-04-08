import CanvasDrawer from "./canvas.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const drawLine = document.getElementById("draw-line") as HTMLButtonElement;
const clear = document.getElementById("clear") as HTMLButtonElement;
const lineWidth = document.getElementById("width") as HTMLInputElement;
const color = document.getElementById("color") as HTMLInputElement;

const canvasDrawer = new CanvasDrawer(canvas);

canvasDrawer.init();

clear.addEventListener("click", canvasDrawer.clear);

drawLine.addEventListener("click", () => {
  let toggle = false;

  if (drawLine.getAttribute("data-toggle") === "true") {
    drawLine.setAttribute("data-toggle", "false");
    toggle = false;
  } else {
    drawLine.setAttribute("data-toggle", "true");
    toggle = true;
  }

  canvasDrawer.setDrawLine(toggle);
});

lineWidth.addEventListener("input", () => {
  canvasDrawer.setOptions({ lineWidth: +lineWidth.value });
});

color.addEventListener("input", () => {
  canvasDrawer.setOptions({ strokeStyle: color.value });
});
