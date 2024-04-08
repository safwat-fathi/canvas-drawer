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
var CanvasDrawer = /** @class */ (function () {
    function CanvasDrawer(canvas) {
        var _this = this;
        this._isDrawLine = false;
        this._options = {};
        this._actions = [];
        this._clickX = [];
        this._clickY = [];
        this._clickDrag = [];
        this.init = function () {
            _this._canvas.width = _this._canvas.clientWidth;
            _this._canvas.height = _this._canvas.clientHeight;
            _this._ctx.clearRect(0, 0, _this._canvas.width, _this._canvas.height);
            // this._ctxOptions(null);
        };
        this.setDrawLine = function (isDrawLine) {
            _this._isDrawLine = isDrawLine;
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
        this._ctxOptions = function () {
            var _a, _b, _c, _d, _e;
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
            _this._addClick(mouseX, mouseY, false);
            _this._paint = true;
            if (_this._isDrawLine)
                _this._drawLine();
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
            if (_this._paint) {
                _this._addClick(mouseX, mouseY, true);
                if (_this._isDrawLine)
                    _this._drawLine();
            }
        };
        this._cancelEventHandler = function () {
            _this._paint = false;
        };
        this._releaseEventHandler = function () {
            _this._paint = false;
            _this._clickX = [];
            _this._clickY = [];
            // store action
            _this._actions.push({ x: _this._clickX, y: _this._clickY });
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
                return _this._canvas.addEventListener(event, _this._releaseEventHandler);
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
        this._drawLine = function () {
            for (var i = 0; i < _this._clickX.length; ++i) {
                _this._ctx.beginPath();
                if (_this._clickDrag[i] && i) {
                    _this._ctx.moveTo(_this._clickX[i - 1], _this._clickY[i - 1]);
                }
                else {
                    _this._ctx.moveTo(_this._clickX[i] - 1, _this._clickY[i]);
                }
                _this._ctx.lineTo(_this._clickX[i], _this._clickY[i]);
                // this._ctx.lineCap = this._options.lineCap || "round";
                // this._ctx.strokeStyle = this._options.strokeStyle || "black";
                _this._ctx.stroke();
            }
            _this._ctx.closePath();
        };
        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this._paint = false;
    }
    return CanvasDrawer;
}());
export default CanvasDrawer;
