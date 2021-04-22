type BitmapPixel = 0 | 1 | 2;

export class Bitmap {
  width: number;
  height: number;
  sX: number;
  sY: number;
  pixels: number;
  data: BitmapPixel[];
  centerX: number;
  centerY: number;

  static clone(other: Bitmap) {
    const copy = new Bitmap(other.width, other.height);

    for (let x = 0; x < copy.width; x++) {
      for (let y = 0; y < copy.height; y++) {
        copy.data[copy.bmpPosition(x, y)] = other.data[other.bmpPosition(x, y)];
      }
    }

    return copy;
  }

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.sX = 0;
    this.sY = 0;
    this.pixels = 0;

    this.data = Array(width * height);
    this.centerX = width / 2;
    this.centerY = height / 2;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.data[this.bmpPosition(x, y)] = 0;
      }
    }
  }

  bmpPosition(x: number, y: number): number {
    return this.width * y + x;
  }

  getPoint(x: number, y: number): BitmapPixel {
    if (!this.data || x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return 0;
    } else {
      return this.data[this.bmpPosition(x, y)];
    }
  }

  setPoint(x: number, y: number, value: BitmapPixel) {
    if (
      !(!this.data || x < 0 || y < 0 || x >= this.width || y >= this.height)
    ) {
      this.data[this.bmpPosition(x, y)] = 1;
      if (value) {
        this.sX += x;
        this.sY += y;
        this.pixels++;
      }
    }
  }

  trim(bmp: Bitmap): Bitmap {
    let found = false;
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    for (let x = 0; x < bmp.width; x++) {
      for (let y = 0; y < bmp.height; y++) {
        if (bmp.getPoint(x, y)) {
          if (!found) {
            found = true;
            minX = maxX = x;
            minY = maxY = y;
          } else {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    const deltaX = maxX - minX;
    const deltaY = maxY - minY;
    const trimmed = new Bitmap(deltaX, deltaY);
    trimmed.centerX = bmp.centerX - minX;
    trimmed.centerY = bmp.centerY - minY;
    for (let x = 0; x < deltaX; x++) {
      for (let y = 0; y < deltaY; y++) {
        trimmed.setPoint(x, y, bmp.getPoint(x + minX, y + minY));
      }
    }

    return trimmed;
  }

  rotate(other: Bitmap, r: number): Bitmap {
    const rot = -r;

    const w = other.width;
    const h = other.height;

    const aX = Math.ceil(w * Math.cos(rot) - h * Math.sin(rot));
    const aY = Math.ceil(w * Math.sin(rot) + h * Math.cos(rot));

    const bX = Math.ceil(-h * Math.sin(rot));
    const bY = Math.ceil(h * Math.cos(rot));

    const cX = Math.ceil(w * Math.cos(rot));
    const cY = Math.ceil(w * Math.sin(rot));

    const xMin = Math.min(Math.min(0, aX), Math.min(bX, cX));
    const xMax = Math.max(Math.max(0, aX), Math.max(bX, cX));
    const yMin = Math.min(Math.min(0, aY), Math.min(bY, cY));
    const yMax = Math.max(Math.max(0, aY), Math.max(bY, cY));

    const width = xMax - xMin;
    const height = yMax - yMin;

    const oldCenterX = other.centerX;
    const oldCenterY = other.centerY;
    const centerX = width / 2;
    const centerY = height / 2;

    const rotated = new Bitmap(width, height);
    let curX;
    let curY;
    let nextX;
    let nextY;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        curX = Math.round(x - centerX);
        curY = Math.round(y - centerY);
        nextX = Math.round(
          Math.cos(rot) * curX - Math.sin(rot) * curY + oldCenterX
        );
        nextY = Math.round(
          Math.sin(rot) * curX + Math.cos(rot) * curY + oldCenterY
        );
        rotated.setPoint(x, y, other.getPoint(nextX, nextY));
      }
    }

    return rotated;
  }

  write(other: Bitmap, offx: number, offy: number) {
    for (let x = 0; x < other.width; x++) {
      for (let y = 0; y < other.height; y++) {
        if (other.getPoint(x, y)) {
          this.setPoint(x + offx, y + offy, other.getPoint(x, y));
        }
      }
    }
  }

  overlaps(other: Bitmap, offx: number, offy: number): boolean {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.getPoint(x, y) && other.getPoint(x + offx, y + offy)) {
          return true;
        }
      }
    }
    return false;
  }

  dilatation(iterations: number) {
    for (let i = 0; i < iterations; i++) {
      const old = Bitmap.clone(this);
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          if (!old.getPoint(x, y)) {
            let score = 0;
            for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                if (old.getPoint(x + dx, y + dy)) {
                  score++;
                }
              }
            }
            if (score >= 1) {
              this.setPoint(x, y, 1);
            }
          }
        }
      }
    }
  }
}
