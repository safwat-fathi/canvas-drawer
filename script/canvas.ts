type PressEvents = "mousedown" | "touchstart";
type MoveEvents = "mousemove" | "touchmove";
type ReleaseEvents = "mouseup" | "touchend";
type CancelEvents = "mouseout" | "touchcancel";

class CanvasDrawer {
  private _canvas: HTMLCanvasElement;
  private _rect: DOMRect;
  // private _canvasWidth: number
  // private _canvasHeight: number
  // private _canvasRatio: number
  private _clearEl: HTMLButtonElement;
  private _ctx: CanvasRenderingContext2D;

  private _paint: boolean;
  private _clickX: number[] = [];
  private _clickY: number[] = [];
  private _clickDrag: boolean[] = [];

  constructor(canvas: HTMLCanvasElement, clearElement: HTMLButtonElement) {
    this._canvas = canvas;
    this._rect = canvas.getBoundingClientRect();
    this._ctx = canvas.getContext("2d")!;
    this._clearEl = clearElement;
    this._paint = false;

    this._ctxOptions();
    this._registerUserEvents();
  }

  private _ctxOptions() {
    this._ctx.lineCap = "round";
    this._ctx.lineJoin = "bevel";
    this._ctx.lineWidth = 1;
    this._ctx.strokeStyle = "black";
    this._ctx.font = "16px Arial";
  }

  private _clear() {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._clickX = [];
    this._clickY = [];
    this._clickDrag = [];
  }

  private _addClick = (x: number, y: number, dragging: boolean) => {
    this._clickX.push(x);
    this._clickY.push(y);
    this._clickDrag.push(dragging);
  };

  private _pressEventHandler = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLCanvasElement;

    let mouseX = 0;
    let mouseY = 0;

    if (e instanceof MouseEvent) {
      mouseX = e.offsetX;
      mouseY = e.offsetY;
    } else if (e instanceof TouchEvent) {
      mouseX = e.touches[0].clientX - target.offsetLeft;
      mouseY = e.touches[0].clientY - target.offsetTop;
    }

    this._addClick(mouseX, mouseY, false);

    this._paint = true;

    this._drawLine();
  };

  private _moveEventHandler = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLCanvasElement;

    let mouseX = 0;
    let mouseY = 0;

    if (e instanceof MouseEvent) {
      mouseX = e.offsetX;
      mouseY = e.offsetY;
    } else if (e instanceof TouchEvent) {
      mouseX = e.touches[0].clientX - target.offsetLeft;
      mouseY = e.touches[0].clientY - target.offsetTop;
    }

    if (this._paint) {
      this._addClick(mouseX, mouseY, true);
      this._drawLine();
    }
  };

  private _cancelEventHandler = () => {
    this._paint = false;
  };

  private _releaseEventHandler = () => {
    // const target = e.target as HTMLCanvasElement;

    this._paint = false;
    // this._redraw();
  };

  private _clearEventHandler = () => {
    this._clear();
  };

  private _registerUserEvents = () => {
    const pressEvents: PressEvents[] = ["mousedown", "touchstart"];
    const moveEvents: MoveEvents[] = ["mousemove", "touchmove"];
    const releaseEvents: ReleaseEvents[] = ["mouseup", "touchend"];
    const cancelEvents: CancelEvents[] = ["mouseout", "touchcancel"];

    pressEvents.forEach(event =>
      this._canvas.addEventListener(event, this._pressEventHandler as any, {
        passive: true,
      })
    );

    moveEvents.forEach(event =>
      this._canvas.addEventListener(event, this._moveEventHandler as any, {
        passive: true,
      })
    );

    releaseEvents.forEach(event =>
      this._canvas.addEventListener(event, this._releaseEventHandler)
    );

    cancelEvents.forEach(event =>
      this._canvas.addEventListener(event, this._cancelEventHandler)
    );

    this._clearEl.addEventListener("click", this._clearEventHandler);
  };

  private _drawLine() {
    for (let i = 0; i < this._clickX.length; ++i) {
      this._ctx.beginPath();

      if (this._clickDrag[i] && i) {
        this._ctx.moveTo(this._clickX[i - 1], this._clickY[i - 1]);
      } else {
        this._ctx.moveTo(this._clickX[i] - 1, this._clickY[i]);
      }

      this._ctx.lineTo(this._clickX[i], this._clickY[i]);
      this._ctx.stroke();
    }

    this._ctx.closePath();
  }
}
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
