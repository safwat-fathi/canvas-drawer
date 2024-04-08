var CanvasDrawer = /** @class */ (function () {
    function CanvasDrawer(canvas, clearElement) {
        var _this = this;
        this._clickX = [];
        this._clickY = [];
        this._clickDrag = [];
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
                _this._drawLine();
            }
        };
        this._cancelEventHandler = function () {
            _this._paint = false;
        };
        this._releaseEventHandler = function () {
            // const target = e.target as HTMLCanvasElement;
            _this._paint = false;
            // this._redraw();
        };
        this._clearEventHandler = function () {
            _this._clear();
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
            _this._clearEl.addEventListener("click", _this._clearEventHandler);
        };
        this._canvas = canvas;
        this._rect = canvas.getBoundingClientRect();
        this._ctx = canvas.getContext("2d");
        this._clearEl = clearElement;
        this._paint = false;
        this._ctxOptions();
        this._registerUserEvents();
    }
    CanvasDrawer.prototype._ctxOptions = function () {
        this._ctx.lineCap = "round";
        this._ctx.lineJoin = "bevel";
        this._ctx.lineWidth = 1;
        this._ctx.strokeStyle = "black";
        this._ctx.font = "16px Arial";
    };
    CanvasDrawer.prototype._clear = function () {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        this._clickX = [];
        this._clickY = [];
        this._clickDrag = [];
    };
    CanvasDrawer.prototype._drawLine = function () {
        for (var i = 0; i < this._clickX.length; ++i) {
            this._ctx.beginPath();
            if (this._clickDrag[i] && i) {
                this._ctx.moveTo(this._clickX[i - 1], this._clickY[i - 1]);
            }
            else {
                this._ctx.moveTo(this._clickX[i] - 1, this._clickY[i]);
            }
            this._ctx.lineTo(this._clickX[i], this._clickY[i]);
            this._ctx.stroke();
        }
        this._ctx.closePath();
    };
    return CanvasDrawer;
}());
// class CanvasDrawer {
//   private _canvas: HTMLCanvasElement;
//   private _ctx: CanvasRenderingContext2D;
//   private _isDrawing: boolean = false;
//   private _startX: number = 0;
//   private _startY: number = 0;
//   constructor(canvas: HTMLCanvasElement) {
//     this._canvas = canvas;
//     this._ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
//     this._initEventListeners();
//   }
//   private _initEventListeners() {
//     this._canvas.addEventListener("mousedown", this._onMouseDown);
//     this._canvas.addEventListener("mouseup", this._onMouseUp);
//     this._canvas.addEventListener("mousemove", this._onMouseMove);
//   }
//   private _onMouseDown = (e: MouseEvent) => {
//     this._isDrawing = true;
//     this._startX = e.offsetX;
//     this._startY = e.offsetY;
//   };
//   private _onMouseUp = (e: MouseEvent) => {
//     if (this._isDrawing) {
//       this._isDrawing = false;
//       this._drawLine(this._startX, this._startY, e.offsetX, e.offsetY);
//     }
//   };
//   private _onMouseMove = (e: MouseEvent) => {
//     if (this._isDrawing) {
//       this._drawLine(this._startX, this._startY, e.offsetX, e.offsetY);
//       this._startX = e.offsetX;
//       this._startY = e.offsetY;
//     }
//   };
//   private _drawLine(
//     startX: number,
//     startY: number,
//     endX: number,
//     endY: number
//   ) {
//     this._ctx.beginPath();
//     this._ctx.moveTo(startX, startY);
//     this._ctx.lineTo(endX, endY);
//     this._ctx.stroke(); // Change this to .strokeStyle for specific color
//   }
//   // Optional methods for customization (add stroke style, line width etc.)
//   public setStrokeStyle(style: string) {
//     this._ctx.strokeStyle = style;
//   }
//   public setLineWidth(width: number) {
//     this._ctx.lineWidth = width;
//   }
// }
export default CanvasDrawer;
