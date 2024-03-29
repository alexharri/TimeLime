/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-misused-new */

import { InputVec2, SomeMouseEvent } from "timelime/types";
import { getDistance, lerp, rotateVec2CCW } from "./math";

const resolveVec2 = (data: InputVec2): Vec2 => {
  if (data instanceof Vec2) {
    return data;
  }

  if (Array.isArray(data)) {
    return new Vec2(data[0], data[1]);
  }

  if (typeof (data as any).left === "number") {
    return new Vec2((data as any).left, (data as any).top);
  }

  return new Vec2((data as any).x, (data as any).y);
};

export class Vec2 {
  public static new(vec: InputVec2): Vec2;
  public static new(x: number, y: number): Vec2;
  public static new(vecOrX: number | InputVec2, y?: number) {
    if (vecOrX instanceof Vec2) {
      return vecOrX;
    }

    if (Array.isArray(vecOrX)) {
      return new Vec2(vecOrX[0], vecOrX[1]);
    }

    if (typeof vecOrX === "number") {
      return new Vec2(vecOrX, y!);
    }

    if (typeof (vecOrX as any).left === "number") {
      return new Vec2((vecOrX as any).left, (vecOrX as any).top);
    }

    return new Vec2((vecOrX as any).x, (vecOrX as any).y);
  }

  public static fromEvent(e: SomeMouseEvent): Vec2 {
    return new Vec2(e.clientX, e.clientY);
  }
  public static ORIGIN = Vec2.new(0, 0);

  private _x: number;
  private _y: number;
  public atOrigin: boolean;

  constructor(vec: { x: number; y: number });
  constructor(x: number, y: number);
  constructor(vecOrX: number | { x: number; y: number }, y?: number) {
    if (typeof vecOrX === "number") {
      this._x = vecOrX;
      this._y = y!;
    } else {
      this._x = vecOrX.x;
      this._y = vecOrX.y;
    }
    this.atOrigin = this.x === 0 && this.y === 0;
    this.apply = this.apply.bind(this);
  }

  set x(value: number) {
    this._x = value;
    this.atOrigin = this.x === 0 && this.y === 0;
  }
  get x() {
    return this._x;
  }
  set y(value: number) {
    this._y = value;
    this.atOrigin = this.x === 0 && this.y === 0;
  }
  get y() {
    return this._y;
  }

  public add(vec: InputVec2): Vec2 {
    const v = resolveVec2(vec);
    if (v.atOrigin) {
      return this;
    }

    return new Vec2(this.x + v.x, this.y + v.y);
  }

  public addX(x: number): Vec2 {
    return new Vec2(this.x + x, this.y);
  }

  public addY(y: number): Vec2 {
    return new Vec2(this.x, this.y + y);
  }

  public addXY(x: number, y: number): Vec2 {
    return new Vec2(this.x + x, this.y + y);
  }

  public sub(vec: Vec2): Vec2 {
    const v = resolveVec2(vec);
    if (v.atOrigin) {
      return this;
    }

    return new Vec2(this.x - v.x, this.y - v.y);
  }

  public subX(x: number): Vec2 {
    return new Vec2(this.x - x, this.y);
  }

  public subY(y: number): Vec2 {
    return new Vec2(this.x, this.y - y);
  }

  public subXY(x: number, y: number): Vec2 {
    return new Vec2(this.x - x, this.y - y);
  }

  public scale(scale: number, anchor: InputVec2 = Vec2.ORIGIN): Vec2 {
    if (scale === 1) {
      return this;
    }

    const a = resolveVec2(anchor);
    return new Vec2(a.x + (this.x - a.x) * scale, a.y + (this.y - a.y) * scale);
  }

  public scaleX(scale: number, anchor: InputVec2 = Vec2.ORIGIN): Vec2 {
    if (scale === 1) {
      return this;
    }

    const a = resolveVec2(anchor);
    return new Vec2(a.x + (this.x - a.x) * scale, this.y);
  }

  public scaleY(scale: number, anchor: InputVec2 = Vec2.ORIGIN): Vec2 {
    if (scale === 1) {
      return this;
    }

    const a = resolveVec2(anchor);
    return new Vec2(this.x, a.y + (this.y - a.y) * scale);
  }

  public scaleXY(scaleX: number, scaleY: number, anchor: InputVec2 = Vec2.ORIGIN): Vec2 {
    if (scaleX === 1 && scaleY === 1) {
      return this;
    }

    const a = resolveVec2(anchor);
    return new Vec2(a.x + (this.x - a.x) * scaleX, a.y + (this.y - a.y) * scaleY);
  }

  public rotate(rad: number, anchor: InputVec2 = Vec2.new(0, 0)): Vec2 {
    const a = resolveVec2(anchor);
    return rotateVec2CCW(this, rad, a) as Vec2;
  }

  public copy(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  /**
   * Linear interpolation.
   *
   * A `t` value of `0` is this vector, 1 is `vec`
   */
  public lerp(vec: InputVec2, t: number): Vec2 {
    const v = resolveVec2(vec);
    return new Vec2(lerp(this.x, v.x, t), lerp(this.y, v.y, t));
  }

  public round(): Vec2 {
    return Vec2.new(Math.round(this.x), Math.round(this.y));
  }

  public floor(): Vec2 {
    return Vec2.new(Math.floor(this.x), Math.floor(this.y));
  }

  public apply(fn: (vec: Vec2) => InputVec2): Vec2 {
    return resolveVec2(fn(this));
  }

  public length(): number {
    return getDistance(Vec2.ORIGIN, this);
  }

  public eq(vec: InputVec2): boolean {
    const v = resolveVec2(vec);
    return v.x === this.x && v.y === this.y;
  }

  public toJSON() {
    return {
      x: this.x,
      y: this.y,
      __objectType: "vec2",
    };
  }
}
