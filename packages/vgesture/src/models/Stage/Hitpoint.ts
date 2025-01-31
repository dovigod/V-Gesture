import type { Color } from "../../types";

export class HitPoint {
  ctx: CanvasRenderingContext2D;
  point: { x: number, y: number };
  r: number;
  g: number;
  b: number;
  lifespan: number;
  size: number;

  constructor(ctx: CanvasRenderingContext2D, point: { x: number, y: number }, color: Color, size: number) {
    this.ctx = ctx
    this.r = parseInt(color.slice(1, 3), 16);
    this.g = parseInt(color.slice(3, 5), 16);
    this.b = parseInt(color.slice(5, 7), 16);
    this.point = point
    this.lifespan = 1;
    this.size = size;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.point.x, this.point.y, this.size, 0, 2 * Math.PI);
    this.ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b} , ${this.lifespan})`;
    this.ctx.fill();
    this.ctx.closePath()
  }

  update() {
    this.lifespan -= 0.01
  }
}