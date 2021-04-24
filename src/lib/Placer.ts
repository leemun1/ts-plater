import { PlacedPart } from './PlacedPart';
import { Plate } from './Plate';
import { PLACER_GRAVITY, PLACER_SORT_MODE, Request } from './Request';
import { Solution } from './Solution';

export class Placer {
  solution: Solution | null = null;
  rotateDirection = 0;
  rotateOffset = 0;
  request: Request;
  parts: PlacedPart[] = [];
  xCoef = 0;
  yCoef = 0;
  cache: {
    [key: string]: {
      [key: string]: boolean;
    };
  } = {};

  constructor(request: Request) {
    this.request = request;
    for (const partname in request.quantities) {
      for (let i = 0; i < request.quantities[partname]; i++) {
        const placedPart = new PlacedPart();
        placedPart.setPart(request.parts[partname]);
        this.parts.push(placedPart);
      }
    }

    this.setGravityMode(PLACER_GRAVITY.YX);
  }

  sortParts(sortType: number) {
    switch (sortType) {
      case PLACER_SORT_MODE.SURFACE_INC:
        this.parts.sort((a, b) => {
          const aSurface = a.getSurface();
          const bSurface = b.getSurface();
          if (aSurface > bSurface) return 1;
          if (aSurface < bSurface) return -1;
          return 0;
        });
        break;
      case PLACER_SORT_MODE.SURFACE_DEC:
        this.parts.sort((a, b) => {
          const aSurface = a.getSurface();
          const bSurface = b.getSurface();
          if (aSurface > bSurface) return -1;
          if (aSurface < bSurface) return 1;
          return 0;
        });
        break;
      default:
        // shuffle
        for (let i = this.parts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.parts[i], this.parts[j]] = [this.parts[j], this.parts[i]];
        }
        break;
    }
  }

  getNextPart() {
    return this.parts.pop();
  }

  setRotateDirection(direction: number) {
    this.rotateDirection = direction;
  }

  setRotateOffset(offset: number) {
    this.rotateOffset = offset;
  }

  setGravityMode(gravityMode: number) {
    switch (gravityMode) {
      case PLACER_GRAVITY.YX:
        this.xCoef = 1;
        this.yCoef = 10;
        break;
      case PLACER_GRAVITY.XY:
        this.xCoef = 10;
        this.yCoef = 1;
        break;
      case PLACER_GRAVITY.EQ:
        this.xCoef = 1;
        this.yCoef = 1;
        break;
    }
  }

  placePart(plate: Plate, part: PlacedPart) {
    const cacheName = part.getName();
    const plateUid = plate._uid;
    const plateCache = this.cache[plateUid];
    if (!plateCache || plateCache[cacheName]) {
      let betterX = 0;
      let betterY = 0;
      let betterScore = 0;
      let betterR = 0;
      const rs = Math.ceil((Math.PI * 2) / this.request.deltaR);
      let found = false;

      for (
        let r = this.rotateDirection ? rs - 1 : 0;
        this.rotateDirection ? r >= 0 : r < rs;
        this.rotateDirection ? r-- : r++
      ) {
        const vr = (r + this.rotateOffset) % rs;
        part.setRotation(vr);
        if (part.getBmp()) {
          for (let x = 0; x < plate.width; x += this.request.delta) {
            for (let y = 0; y < plate.height; y += this.request.delta) {
              const gx = part.getGX() + x;
              const gy = part.getGY() + y;
              const score = gy * this.yCoef + gx * this.xCoef;

              if (!found || score < betterScore) {
                part.setOffset(x, y);
                if (plate.canPlace(part)) {
                  found = true;
                  betterX = x;
                  betterY = y;
                  betterScore = score;
                  betterR = vr;
                }
              }
            }
          }
        }
      }
      if (found) {
        part.setRotation(betterR);
        part.setOffset(betterX, betterY);
        plate.place(part);
        return true;
      } else {
        this.cache[plate._uid][cacheName] = true;
        return false;
      }
    } else {
      return false;
    }
  }

  place() {
    const solution = new Solution(
      this.request.plateWidth,
      this.request.plateHeight,
      this.request.plateDiameter,
      this.request.plateMode,
      this.request.precision
    );
    solution.addPlate();

    console.log('Placing...');
    while (this.parts.length) {
      const part = this.getNextPart();
      let placed = false;

      for (let i = 0; i < solution.countPlates() && !placed; i++) {
        const plate = solution.getPlate(i);

        if (plate && part && this.placePart(plate, part)) {
          placed = true;
        } else {
          if (i + 1 === solution.countPlates()) {
            solution.addPlate();
          }
        }
      }
    }

    console.log(`Solution with ${solution.countPlates()} plates`);

    this.solution = solution;
    return solution;
  }
}
