type PressEvents = "mousedown" | "touchstart";
type MoveEvents = "mousemove" | "touchmove";
type ReleaseEvents = "mouseup" | "touchend";
type CancelEvents = "mouseout" | "touchcancel";

type CtxOptions = {
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
  lineWidth?: number;
  strokeStyle?: string;
  font?: string;
};

enum ActionType {
  "Line",
  "Shape",
  "Text",
  "Clear",
}

type CanvasAction = { x: number[]; y: number[]; type: ActionType };

class CanvasDrawer {
  private _canvas: HTMLCanvasElement;
  private _isDrawLine = false;
  // private _canvasWidth: number
  // private _canvasHeight: number
  // private _canvasRatio: number
  private _ctx: CanvasRenderingContext2D;
  private _options: CtxOptions = {};
  private _paint: boolean;
  private _actions: CanvasAction[] = [];
  private _clickX: number[] = [];
  private _clickY: number[] = [];
  private _clickDrag: boolean[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d")!;
    this._paint = false;
  }

  public init = () => {
    this._canvas.width = this._canvas.clientWidth;
    this._canvas.height = this._canvas.clientHeight;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // this._ctxOptions(null);
  };

  public setDrawLine = (isDrawLine: boolean) => {
    this._isDrawLine = isDrawLine;

    if (isDrawLine) this._registerUserEvents();
    else this._unregisterUserEvents();
  };

  public clear = () => {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._clickX = [];
    this._clickY = [];
    this._clickDrag = [];
  };

  private _ctxOptions = () => {
    this._ctx.lineCap = this._options?.lineCap || "round";
    this._ctx.lineJoin = this._options?.lineJoin || "bevel";
    this._ctx.lineWidth = this._options?.lineWidth || 1;
    this._ctx.strokeStyle = this._options?.strokeStyle || "black";
    this._ctx.font = this._options?.font || "16px Arial";
  };

  public setOptions = (options: CtxOptions) => {
    this._options = { ...this._options, ...options };
    this._ctxOptions();
  };

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

    if (this._isDrawLine) this._draw();
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

      if (this._isDrawLine) this._draw();
    }
  };

  private _cancelEventHandler = () => {
    this._paint = false;
  };

  private _releaseEventHandler = () => {
    this._paint = false;

    if (this._isDrawLine) {
      this._actions.push({
        x: this._clickX,
        y: this._clickY,
        type: ActionType.Line,
      });
    }

    this._clickX = [];
    this._clickY = [];

    // store action
    // let actionType: ActionType | null = null;

    console.log("🚀 ~ this._isDrawLine:", this._isDrawLine);
    console.log("🚀 ~ this._actions:", this._actions);
    // console.log("🚀 ~ actionType:", actionType);

    // if (actionType === null) return;
  };

  private _registerUserEvents = () => {
    const pressEvents: PressEvents[] = ["mousedown", "touchstart"];
    const moveEvents: MoveEvents[] = ["mousemove", "touchmove"];
    const releaseEvents: ReleaseEvents[] = ["mouseup", "touchend"];
    const cancelEvents: CancelEvents[] = ["mouseout", "touchcancel"];

    pressEvents.forEach(event =>
      this._canvas.addEventListener(event, this._pressEventHandler, {
        passive: true,
      })
    );

    moveEvents.forEach(event =>
      this._canvas.addEventListener(event, this._moveEventHandler, {
        passive: true,
      })
    );

    releaseEvents.forEach(event =>
      this._canvas.addEventListener(event, this._releaseEventHandler)
    );

    cancelEvents.forEach(event =>
      this._canvas.addEventListener(event, this._cancelEventHandler)
    );
  };

  private _unregisterUserEvents = () => {
    const pressEvents: PressEvents[] = ["mousedown", "touchstart"];
    const moveEvents: MoveEvents[] = ["mousemove", "touchmove"];
    const releaseEvents: ReleaseEvents[] = ["mouseup", "touchend"];
    const cancelEvents: CancelEvents[] = ["mouseout", "touchcancel"];

    pressEvents.forEach(event =>
      this._canvas.removeEventListener(event, this._pressEventHandler)
    );

    moveEvents.forEach(event =>
      this._canvas.removeEventListener(event, this._moveEventHandler)
    );

    releaseEvents.forEach(event =>
      this._canvas.removeEventListener(event, this._releaseEventHandler)
    );

    cancelEvents.forEach(event =>
      this._canvas.removeEventListener(event, this._cancelEventHandler)
    );
  };

  public undo = () => {
    const lastAction = this._actions.pop();

    if (!lastAction) return;

    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // this._clickX = lastAction.x;
    // this._clickY = lastAction.y;

    this._draw(true);
  };

  public hasActions = () => {
    return this._actions.length > 0;
  };

  private _draw = (undo = false) => {
    if (undo) {
      for (const action of this._actions) {
        this._ctx.beginPath();
        this._ctx.moveTo(action.x[0], action.y[0]);

        for (let i = 1; i < action.x.length; ++i) {
          this._ctx.lineTo(action.x[i], action.y[i]);
        }

        this._ctx.stroke();
      }
    } else {
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
    }
    this._ctx.closePath();
  };
}

export default CanvasDrawer;
