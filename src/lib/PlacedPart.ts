import { Part } from './Part';
import { Model } from './stl/Model';

export class PlacedPart {
  part: Part | null = null;
  x = 0;
  y = 0;
  rotation = 0;

  createModel(): Model {
    if (this.part === null || this.part.model === null) {
      throw new Error('model has not been initialized on the part');
    }

    const model = this.part.model
      .center()
      .rotateZ(this.part.deltaR * this.rotation);

    return model.translate(this.getCenterX(), this.getCenterY());
  }

  getCenterX() {
    const bmp = this.getBmp();
    if (this.part === null || bmp === null) return 0;
    return this.x + this.part.precision * bmp.centerX;
  }

  getCenterY() {
    const bmp = this.getBmp();
    if (this.part === null || bmp === null) return 0;
    return this.y + this.part.precision * bmp.centerY;
  }

  getName() {
    return this.part?.getFilepath() ?? '';
  }

  getSurface() {
    return this.part?.getSurface() ?? 0;
  }

  setPart(part: Part) {
    this.part = part;
  }

  setOffset(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setRotation(r: number) {
    this.rotation = r;
  }

  getPart() {
    return this.part;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getRotation() {
    return this.rotation;
  }

  getBmp() {
    return this.part?.getBmp(this.rotation) ?? null;
  }

  getGX() {
    const bmp = this.getBmp();
    if (bmp === null || this.part === null) return 0;
    return (bmp.sX / bmp.pixels) * this.part.precision;
  }

  getGY() {
    const bmp = this.getBmp();
    if (bmp === null || this.part === null) return 0;
    return (bmp.sY / bmp.pixels) * this.part.precision;
  }
}
