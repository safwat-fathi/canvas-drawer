import { hexToRgb, rgbToHex } from "./utils.js";

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

type CanvasAction = {
  x: number[];
  y: number[];
  type: ActionType;
  options: CtxOptions;
};

type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type Circle = {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  counterclockwise?: boolean | undefined;
};

// * copy action is the same as grabbing just do not remove grabbed action from actions

class CanvasApp {
  private _canvas: HTMLCanvasElement;
  private _isDrawingLine = false;
  private _isDrawingShape = false;
  private _isDrawingText = false;
  private _grabbedObject: CanvasAction | null = null;
  private _isGrabbing = false;
  private _ctx: CanvasRenderingContext2D;
  private _options: CtxOptions = {};
  private _isDrawing = false;
  private _actions: CanvasAction[] = [];
  private _clickX: number[] = [];
  private _clickY: number[] = [];
  private _clickDrag: boolean[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  }

  public init = (options?: CtxOptions) => {
    this._canvas.width = this._canvas.clientWidth;
    this._canvas.height = this._canvas.clientHeight;
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

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

    this._ctxOptions(options);
  };

  public setGrab = (isGrabbing: boolean) => {
    this._isGrabbing = isGrabbing;
    this._isDrawingLine = false;

    if (isGrabbing) this._registerUserEvents();
    else this._unregisterUserEvents();
  };

  public setDrawLine = (isDrawLine: boolean) => {
    this._isDrawingLine = isDrawLine;
    this._isGrabbing = false;

    if (isDrawLine) this._registerUserEvents();
    else this._unregisterUserEvents();
  };

  public clear = () => {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._clickX = [];
    this._clickY = [];
    this._clickDrag = [];
  };

  public export = () => {
    // const dataUrl = this._canvas.toDataURL();
    const data = {
      actions: this._actions,
      width: this._canvas.width,
      height: this._canvas.height,
    };

    const string = JSON.stringify(data);

    // create a blob object representing the data as a JSON string
    const file = new Blob([string], {
      type: "application/json",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "canvas.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  private _ctxOptions = (options?: CtxOptions) => {
    this._options = { ...this._options, ...options };

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

    if (this._isDrawingLine) {
      this._addClick(mouseX, mouseY, false);
      this._draw();
    }

    if (this._isGrabbing) {
      this._grab(mouseX, mouseY);
    }
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

    if (this._isDrawing) {
      this._addClick(mouseX, mouseY, true);

      if (this._isDrawingLine) this._draw();
    }

    if (this._isGrabbing && this._grabbedObject) {
      this._drawAt(this._grabbedObject, mouseX, mouseY);
      if (this._actions.length) this._redraw();
    }
  };

  private _isActive = () => this._isDrawing;

  // a function handles canvas state on done drawing
  private _userActionDone = () => {
    if (!this._isActive()) return;

    this._isDrawing = false;

    if (this._isDrawingLine) {
      this._actions.push({
        x: this._clickX,
        y: this._clickY,
        type: ActionType.Line,
        options: this._options,
      });
    }

    this._clickX = [];
    this._clickY = [];
  };

  private _cancelEventHandler = () => {
    if (!this._isActive()) return;

    this._userActionDone();
  };

  private _releaseEventHandler = () => {
    this._userActionDone();

    if (this._isGrabbing && this._grabbedObject) {
      // this._actions.push(this._grabbedObject);
      this._grabbedObject = null;
    }
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
      document.addEventListener(event, this._releaseEventHandler)
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
    if (this._actions.length === 0) return;

    // remove the last action from the array
    this._actions.pop();

    this.clear();

    // redraw the canvas with the remaining actions
    this._redraw();
  };

  public hasActions = () => {
    return this._actions.length > 0;
  };

  private _redraw = () => {
    for (const action of this._actions) {
      this._ctx.beginPath();
      this._ctx.moveTo(action.x[0], action.y[0]);

      for (let i = 1; i < action.x.length; ++i) {
        this._ctx.lineTo(action.x[i], action.y[i]);
        this._ctx.stroke();
        this._ctx.strokeStyle = action.options.strokeStyle || "black";
        this._ctx.lineWidth = action.options.lineWidth || 1;
      }
    }
  };

  private _grab = (mouseX: number, mouseY: number) => {
    // find the closest object to the mouse
    const closestObject = this._findClosestObject(mouseX, mouseY);

    this._grabbedObject = closestObject;
  };

  private _findClosestObject = (x: number, y: number) => {
    if (this._actions.length === 0) return null;

    let closestObject = null;

    // get pixel under cursor
    const pixel = this._ctx.getImageData(x, y, 1, 1).data;

    // create rgb color for that pixel
    const pixelAsRGB = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    let foundActions = [];
    let closestX = 0;
    let minDiff = 0;

    for (const action of this._actions) {
      closestX = action.x[0];
      minDiff = Math.abs(closestX - x);

      const convertedColor = hexToRgb(action.options.strokeStyle);
      const colorAsRGB = `rgb(${convertedColor?.r}, ${convertedColor?.g}, ${convertedColor?.b})`;

      if (colorAsRGB === pixelAsRGB) {
        foundActions.push(action);
      }
    }

    if (foundActions.length === 1) {
      closestObject = foundActions[0];
      return closestObject;
    }

    for (const foundAction of foundActions) {
      const currentDiff = Math.abs(foundAction.x[0] - x);

      if (currentDiff < minDiff) {
        closestObject = foundAction;
        minDiff = currentDiff;
      }
    }

    return closestObject;
  };

  private _drawAt(lineData: CanvasAction, newX: number, nexY: number) {
    // clear canvas on every draw
    this.clear();

    if (
      lineData.x.length === 0 ||
      lineData.y.length === 0 ||
      lineData.x.length !== lineData.y.length
    ) {
      console.error("Invalid line data");
      return;
    }

    // Calculate the offset based on the new starting point and the original starting point
    const xOffset = newX - lineData.x[0];
    const yOffset = nexY - lineData.y[0];

    // Create new arrays for the translated x and y coordinates
    const translatedX = lineData.x.map(x => x + xOffset);
    console.log("🚀 ~ _drawAt ~ translatedX:", translatedX);
    const translatedY = lineData.y.map(y => y + yOffset);
    console.log("🚀 ~ _drawAt ~ translatedY:", translatedY);

    // Begin the path for the line
    this._ctx.beginPath();
    this._ctx.lineWidth = lineData.options.lineWidth || 3;
    this._ctx.strokeStyle = lineData.options.strokeStyle || "black";

    // Move to the new starting point
    this._ctx.moveTo(lineData.x[0] + xOffset, lineData.y[0] + yOffset);

    // Draw the line through each point, applying the offset
    for (let i = 1; i < lineData.x.length; i++) {
      this._ctx.lineTo(lineData.x[i] + xOffset, lineData.y[i] + yOffset);
    }

    // Stroke the path
    this._ctx.stroke();
    this._ctx.closePath();
  }

  private _draw = () => {
    this._isDrawing = true;

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
  };

  private _drawRect = (
    rect: Rect,
    fill?: string | CanvasGradient | CanvasPattern
  ) => {
    this._ctx.fillStyle = fill || "red";
    this._ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  };

  private _drawCircle = (
    circle: Circle,
    fill?: string | CanvasGradient | CanvasPattern
  ) => {
    this._ctx.fillStyle = fill || "red";
    this._ctx.beginPath();
    this._ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    this._ctx.closePath();
    this._ctx.fill();
  };
}

export default CanvasApp;
