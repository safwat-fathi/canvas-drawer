import CanvasDrawer from "./canvas.js";
var canvas = document.getElementById("canvas");
var drawLine = document.getElementById("draw-line");
var clear = document.getElementById("clear");
var lineWidth = document.getElementById("width");
var color = document.getElementById("color");
var canvasDrawer = new CanvasDrawer(canvas);
canvasDrawer.init();
clear.addEventListener("click", canvasDrawer.clear);
drawLine.addEventListener("click", function () {
    var toggle = false;
    if (drawLine.getAttribute("data-toggle") === "true") {
        drawLine.setAttribute("data-toggle", "false");
        toggle = false;
    }
    else {
        drawLine.setAttribute("data-toggle", "true");
        toggle = true;
    }
    canvasDrawer.setDrawLine(toggle);
});
lineWidth.addEventListener("input", function () {
    canvasDrawer.setOptions({ lineWidth: +lineWidth.value });
});
color.addEventListener("input", function () {
    canvasDrawer.setOptions({ strokeStyle: color.value });
});
