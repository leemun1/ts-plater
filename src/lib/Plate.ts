import { Bitmap } from './Bitmap';
import { PlacedPart } from './PlacedPart';
import { Model } from './stl/Model';

enum PLATE_MODE {
  RECTANGLE,
  CIRCLE,
}

export class Plate {
  width: number;
  height: number;
  diameter: number;
  mode: number;
  precision: number;
  bmp: Bitmap;
  parts: PlacedPart[] = [];

  constructor(
    width: number,
    height: number,
    diameter: number,
    mode: number,
    precision: number
  ) {
    this.width = width;
    this.height = height;
    this.diameter = diameter;
    this.mode = mode;
    this.precision = precision;

    if (mode == PLATE_MODE.CIRCLE) {
      this.width = height = diameter;
    }

    this.bmp = new Bitmap(width / precision, height / precision);

    if (mode == PLATE_MODE.CIRCLE) {
      for (let x = 0; x < this.bmp.width; x++) {
        for (let y = 0; y < this.bmp.height; y++) {
          const dx = (x - this.bmp.centerX) * precision;
          const dy = (y - this.bmp.centerY) * precision;

          if (Math.sqrt(dx * dx + dy * dy) > diameter / 2) {
            this.bmp.setPoint(x, y, 2);
          }
        }
      }
    }
  }

  createModel() {
    const model = new Model();

    for (const part of this.parts) {
      model.merge(part.createModel());
    }

    return model.center();
  }

  canPlace(placedPart: PlacedPart) {
    const partBmp = placedPart.getBmp();
    if (partBmp === null) return false;

    const x = placedPart.getX();
    const y = placedPart.getY();

    if (
      x + partBmp.width * this.precision > this.width ||
      y + partBmp.height * this.precision > this.height
    ) {
      return false;
    }

    return !partBmp.overlaps(this.bmp, x / this.precision, y / this.precision);
  }

  place(placedPart: PlacedPart) {
    const bmp = placedPart.getBmp();
    if (bmp === null) {
      throw new Error('cannot place a part with empty bitmap');
    }

    this.parts.push(placedPart);
    this.bmp.write(
      bmp,
      placedPart.getX() / this.precision,
      placedPart.getY() / this.precision
    );
  }

  countParts() {
    return this.parts.length;
  }
}
