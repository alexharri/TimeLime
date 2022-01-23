import { Vec2 } from "~/core/utils/math/Vec2";
import { YBounds } from "~/types/commonTypes";

export interface GraphEditorEphState {
  readonly yBounds?: YBounds;
  readonly keyframeShift?: Vec2;
}

interface Options {
  onChange: (state: GraphEditorEphState) => void;
}

export class GraphEditorEphStateManager {
  private _yBounds?: YBounds;
  private _keyframeShift?: Vec2;
  private onChangeCallback: Options["onChange"];

  constructor(options: Options) {
    this.onChangeCallback = options.onChange;
  }

  public reset() {
    this.yBounds = undefined;
    this.keyframeShift = undefined;
  }

  get yBounds() {
    return this._yBounds;
  }

  set yBounds(value: YBounds | undefined) {
    console.log("set yb", value);
    this._yBounds = value;
    this.onChange();
  }

  get keyframeShift() {
    return this._keyframeShift;
  }

  set keyframeShift(value: Vec2 | undefined) {
    this._keyframeShift = value;
    this.onChange();
  }

  private onChange() {
    this.onChangeCallback({
      yBounds: this.yBounds,
      keyframeShift: this.keyframeShift,
    });
  }
}
