import CanvasApp from "./canvas.js";
var canvas = document.getElementById("canvas");
// canvas actions
var drawLine = document.getElementById("draw-line");
var undo = document.getElementById("undo");
var clear = document.getElementById("clear");
var xport = document.getElementById("export");
// canvas controls
var lineWidth = document.getElementById("width");
var color = document.getElementById("color");
var canvasApp = new CanvasApp(canvas);
canvasApp.init({ lineWidth: +lineWidth.value, strokeStyle: color.value });
console.log("🚀 ~ color.value:", color.value);
clear.addEventListener("click", canvasApp.clear);
undo.addEventListener("click", canvasApp.undo);
xport.addEventListener("click", canvasApp.export);
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
    canvasApp.setDrawLine(toggle);
});
lineWidth.addEventListener("input", function () {
    canvasApp.setOptions({ lineWidth: +lineWidth.value });
});
color.addEventListener("input", function () {
    canvasApp.setOptions({ strokeStyle: color.value });
});
