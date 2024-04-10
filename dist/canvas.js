var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { hexToRgb } from "./utils.js";
var ActionType;
(function (ActionType) {
    ActionType[ActionType["Line"] = 0] = "Line";
    ActionType[ActionType["Shape"] = 1] = "Shape";
    ActionType[ActionType["Text"] = 2] = "Text";
    ActionType[ActionType["Clear"] = 3] = "Clear";
})(ActionType || (ActionType = {}));
// * copy action is the same as grabbing just do not remove grabbed action from actions
var CanvasApp = /** @class */ (function () {
    function CanvasApp(canvas) {
        var _this = this;
        this._isDrawingLine = false;
        this._isDrawingShape = false;
        this._isDrawingText = false;
        this._grabbedObject = null;
        this._isGrabbing = false;
        this._options = {};
        this._isDrawing = false;
        this._actions = [];
        this._clickX = [];
        this._clickY = [];
        this._clickDrag = [];
        this.init = function (options) {
            _this._canvas.width = _this._canvas.clientWidth;
            _this._canvas.height = _this._canvas.clientHeight;
            _this._ctx.clearRect(0, 0, _this._canvas.width, _this._canvas.height);
            // this._drawLineAt(
            //   {
            //     x: [
            //       257, 257, 257, 257, 257, 257, 257, 258, 258, 259, 261, 262, 263, 266,
            //       267, 270, 271, 274, 275, 276, 277, 277, 278, 278, 279, 280, 280, 281,
            //       281, 281, 282,
            //     ],
            //     y: [
            //       178, 178, 180, 183, 190, 195, 203, 212, 219, 231, 238, 248, 255, 268,
            //       282, 291, 299, 308, 316, 325, 332, 338, 343, 345, 348, 350, 353, 353,
            //       354, 355, 355,
            //     ],
            //     type: 0,
            //     options: {
            //       lineWidth: 10,
            //       strokeStyle: "#ed0c0c",
            //     },
            //   },
            //   200,
            //   30
            // );
            _this._ctxOptions(options);
        };
        this.setGrab = function (isGrabbing) {
            _this._isGrabbing = isGrabbing;
            _this._isDrawingLine = false;
            if (isGrabbing)
                _this._registerUserEvents();
            else
                _this._unregisterUserEvents();
        };
        this.setDrawLine = function (isDrawLine) {
            _this._isDrawingLine = isDrawLine;
            _this._isGrabbing = false;
            if (isDrawLine)
                _this._registerUserEvents();
            else
                _this._unregisterUserEvents();
        };
        this.clear = function () {
            _this._ctx.clearRect(0, 0, _this._canvas.width, _this._canvas.height);
            _this._clickX = [];
            _this._clickY = [];
            _this._clickDrag = [];
        };
        this.export = function () {
            // const dataUrl = this._canvas.toDataURL();
            var data = {
                actions: _this._actions,
                width: _this._canvas.width,
                height: _this._canvas.height,
            };
            var string = JSON.stringify(data);
            // create a blob object representing the data as a JSON string
            var file = new Blob([string], {
                type: "application/json",
            });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(file);
            link.download = "canvas.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        this._ctxOptions = function (options) {
            var _a, _b, _c, _d, _e;
            _this._options = __assign(__assign({}, _this._options), options);
            _this._ctx.lineCap = ((_a = _this._options) === null || _a === void 0 ? void 0 : _a.lineCap) || "round";
            _this._ctx.lineJoin = ((_b = _this._options) === null || _b === void 0 ? void 0 : _b.lineJoin) || "bevel";
            _this._ctx.lineWidth = ((_c = _this._options) === null || _c === void 0 ? void 0 : _c.lineWidth) || 1;
            _this._ctx.strokeStyle = ((_d = _this._options) === null || _d === void 0 ? void 0 : _d.strokeStyle) || "black";
            _this._ctx.font = ((_e = _this._options) === null || _e === void 0 ? void 0 : _e.font) || "16px Arial";
        };
        this.setOptions = function (options) {
            _this._options = __assign(__assign({}, _this._options), options);
            _this._ctxOptions();
        };
        this._addClick = function (x, y, dragging) {
            _this._clickX.push(x);
            _this._clickY.push(y);
            _this._clickDrag.push(dragging);
        };
        this._pressEventHandler = function (e) {
            var target = e.target;
            var mouseX = 0;
            var mouseY = 0;
            if (e instanceof MouseEvent) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
            }
            else if (e instanceof TouchEvent) {
                mouseX = e.touches[0].clientX - target.offsetLeft;
                mouseY = e.touches[0].clientY - target.offsetTop;
            }
            if (_this._isDrawingLine) {
                _this._addClick(mouseX, mouseY, false);
                _this._draw();
            }
            if (_this._isGrabbing) {
                _this._grab(mouseX, mouseY);
            }
        };
        this._moveEventHandler = function (e) {
            var target = e.target;
            var mouseX = 0;
            var mouseY = 0;
            if (e instanceof MouseEvent) {
                mouseX = e.offsetX;
                mouseY = e.offsetY;
            }
            else if (e instanceof TouchEvent) {
                mouseX = e.touches[0].clientX - target.offsetLeft;
                mouseY = e.touches[0].clientY - target.offsetTop;
            }
            if (_this._isDrawing) {
                _this._addClick(mouseX, mouseY, true);
                if (_this._isDrawingLine)
                    _this._draw();
            }
            if (_this._isGrabbing && _this._grabbedObject) {
                _this._drawAt(_this._grabbedObject, mouseX, mouseY);
                if (_this._actions.length)
                    _this._redraw();
            }
        };
        this._isActive = function () { return _this._isDrawing; };
        // a function handles canvas state on done drawing
        this._userActionDone = function () {
            if (!_this._isActive())
                return;
            _this._isDrawing = false;
            if (_this._isDrawingLine) {
                _this._actions.push({
                    x: _this._clickX,
                    y: _this._clickY,
                    type: ActionType.Line,
                    options: _this._options,
                });
            }
            _this._clickX = [];
            _this._clickY = [];
        };
        this._cancelEventHandler = function () {
            if (!_this._isActive())
                return;
            _this._userActionDone();
        };
        this._releaseEventHandler = function () {
            _this._userActionDone();
            if (_this._isGrabbing && _this._grabbedObject) {
                // this._actions.push(this._grabbedObject);
                _this._grabbedObject = null;
            }
        };
        this._registerUserEvents = function () {
            var pressEvents = ["mousedown", "touchstart"];
            var moveEvents = ["mousemove", "touchmove"];
            var releaseEvents = ["mouseup", "touchend"];
            var cancelEvents = ["mouseout", "touchcancel"];
            pressEvents.forEach(function (event) {
                return _this._canvas.addEventListener(event, _this._pressEventHandler, {
                    passive: true,
                });
            });
            moveEvents.forEach(function (event) {
                return _this._canvas.addEventListener(event, _this._moveEventHandler, {
                    passive: true,
                });
            });
            releaseEvents.forEach(function (event) {
                return document.addEventListener(event, _this._releaseEventHandler);
            });
            cancelEvents.forEach(function (event) {
                return _this._canvas.addEventListener(event, _this._cancelEventHandler);
            });
        };
        this._unregisterUserEvents = function () {
            var pressEvents = ["mousedown", "touchstart"];
            var moveEvents = ["mousemove", "touchmove"];
            var releaseEvents = ["mouseup", "touchend"];
            var cancelEvents = ["mouseout", "touchcancel"];
            pressEvents.forEach(function (event) {
                return _this._canvas.removeEventListener(event, _this._pressEventHandler);
            });
            moveEvents.forEach(function (event) {
                return _this._canvas.removeEventListener(event, _this._moveEventHandler);
            });
            releaseEvents.forEach(function (event) {
                return _this._canvas.removeEventListener(event, _this._releaseEventHandler);
            });
            cancelEvents.forEach(function (event) {
                return _this._canvas.removeEventListener(event, _this._cancelEventHandler);
            });
        };
        this.undo = function () {
            if (_this._actions.length === 0)
                return;
            // remove the last action from the array
            _this._actions.pop();
            _this.clear();
            // redraw the canvas with the remaining actions
            _this._redraw();
        };
        this.hasActions = function () {
            return _this._actions.length > 0;
        };
        this._redraw = function () {
            for (var _i = 0, _a = _this._actions; _i < _a.length; _i++) {
                var action = _a[_i];
                _this._ctx.beginPath();
                _this._ctx.moveTo(action.x[0], action.y[0]);
                for (var i = 1; i < action.x.length; ++i) {
                    _this._ctx.lineTo(action.x[i], action.y[i]);
                    _this._ctx.stroke();
                    _this._ctx.strokeStyle = action.options.strokeStyle || "black";
                    _this._ctx.lineWidth = action.options.lineWidth || 1;
                }
            }
        };
        this._grab = function (mouseX, mouseY) {
            // find the closest object to the mouse
            var closestObject = _this._findClosestObject(mouseX, mouseY);
            _this._grabbedObject = closestObject;
        };
        this._findClosestObject = function (x, y) {
            if (_this._actions.length === 0)
                return null;
            var closestObject = null;
            // get pixel under cursor
            var pixel = _this._ctx.getImageData(x, y, 1, 1).data;
            // create rgb color for that pixel
            var pixelAsRGB = "rgb(".concat(pixel[0], ", ").concat(pixel[1], ", ").concat(pixel[2], ")");
            var foundActions = [];
            var closestX = 0;
            var minDiff = 0;
            for (var _i = 0, _a = _this._actions; _i < _a.length; _i++) {
                var action = _a[_i];
                closestX = action.x[0];
                minDiff = Math.abs(closestX - x);
                var convertedColor = hexToRgb(action.options.strokeStyle);
                var colorAsRGB = "rgb(".concat(convertedColor === null || convertedColor === void 0 ? void 0 : convertedColor.r, ", ").concat(convertedColor === null || convertedColor === void 0 ? void 0 : convertedColor.g, ", ").concat(convertedColor === null || convertedColor === void 0 ? void 0 : convertedColor.b, ")");
                if (colorAsRGB === pixelAsRGB) {
                    foundActions.push(action);
                }
            }
            if (foundActions.length === 1) {
                closestObject = foundActions[0];
                return closestObject;
            }
            for (var _b = 0, foundActions_1 = foundActions; _b < foundActions_1.length; _b++) {
                var foundAction = foundActions_1[_b];
                var currentDiff = Math.abs(foundAction.x[0] - x);
                if (currentDiff < minDiff) {
                    closestObject = foundAction;
                    minDiff = currentDiff;
                }
            }
            return closestObject;
        };
        this._draw = function () {
            _this._isDrawing = true;
            for (var i = 0; i < _this._clickX.length; ++i) {
                _this._ctx.beginPath();
                if (_this._clickDrag[i] && i) {
                    _this._ctx.moveTo(_this._clickX[i - 1], _this._clickY[i - 1]);
                }
                else {
                    _this._ctx.moveTo(_this._clickX[i] - 1, _this._clickY[i]);
                }
                _this._ctx.lineTo(_this._clickX[i], _this._clickY[i]);
                _this._ctx.stroke();
            }
            _this._ctx.closePath();
        };
        this._drawRect = function (rect, fill) {
            _this._ctx.fillStyle = fill || "red";
            _this._ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        };
        this._drawCircle = function (circle, fill) {
            _this._ctx.fillStyle = fill || "red";
            _this._ctx.beginPath();
            _this._ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            _this._ctx.closePath();
            _this._ctx.fill();
        };
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d", { willReadFrequently: true });
    }
    CanvasApp.prototype._drawAt = function (lineData, newX, nexY) {
        // clear canvas on every draw
        this.clear();
        if (lineData.x.length === 0 ||
            lineData.y.length === 0 ||
            lineData.x.length !== lineData.y.length) {
            console.error("Invalid line data");
            return;
        }
        // Calculate the offset based on the new starting point and the original starting point
        var xOffset = newX - lineData.x[0];
        var yOffset = nexY - lineData.y[0];
        // Create new arrays for the translated x and y coordinates
        var translatedX = lineData.x.map(function (x) { return x + xOffset; });
        console.log("🚀 ~ _drawAt ~ translatedX:", translatedX);
        var translatedY = lineData.y.map(function (y) { return y + yOffset; });
        console.log("🚀 ~ _drawAt ~ translatedY:", translatedY);
        // Begin the path for the line
        this._ctx.beginPath();
        this._ctx.lineWidth = lineData.options.lineWidth || 3;
        this._ctx.strokeStyle = lineData.options.strokeStyle || "black";
        // Move to the new starting point
        this._ctx.moveTo(lineData.x[0] + xOffset, lineData.y[0] + yOffset);
        // Draw the line through each point, applying the offset
        for (var i = 1; i < lineData.x.length; i++) {
            this._ctx.lineTo(lineData.x[i] + xOffset, lineData.y[i] + yOffset);
        }
        // Stroke the path
        this._ctx.stroke();
        this._ctx.closePath();
    };
    return CanvasApp;
}());
export default CanvasApp;
