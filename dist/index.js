import CanvasApp from "./canvas.js";
var canvas = document.getElementById("canvas");
// canvas actions
var drawLine = document.getElementById("draw-line");
var grab = document.getElementById("grab");
var undo = document.getElementById("undo");
var clear = document.getElementById("clear");
var xport = document.getElementById("export");
// canvas controls
var lineWidth = document.getElementById("width");
var color = document.getElementById("color");
var canvasApp = new CanvasApp(canvas);
canvasApp.init({ lineWidth: +lineWidth.value, strokeStyle: color.value });
clear.addEventListener("click", canvasApp.clear);
undo.addEventListener("click", canvasApp.undo);
xport.addEventListener("click", canvasApp.export);
drawLine.addEventListener("click", function () {
    // let toggle = false;
    // if (drawLine.getAttribute("data-toggle") === "true") {
    //   drawLine.setAttribute("data-toggle", "false");
    //   toggle = false;
    // } else {
    //   drawLine.setAttribute("data-toggle", "true");
    //   toggle = true;
    // }
    // canvasApp.setDrawLine(toggle);
    canvasApp.setDrawLine(true);
    // canvasApp.setGrab(false);
});
grab.addEventListener("click", function () {
    canvasApp.setGrab(true);
    // canvasApp.setDrawLine(false);
});
lineWidth.addEventListener("input", function () {
    canvasApp.setOptions({ lineWidth: +lineWidth.value });
});
color.addEventListener("input", function () {
    console.log("🚀 ~ color.addEventListener ~ color.value:", color.value);
    canvasApp.setOptions({ strokeStyle: color.value });
});
