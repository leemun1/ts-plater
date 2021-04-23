import { Plate } from './Plate';

export class Solution {
  plateWidth: number;
  plateHeight: number;
  plateDiameter: number;
  plateMode: number;
  precision: number;
  plates: Plate[] = [];

  constructor(
    plateWidth: number,
    plateHeight: number,
    plateDiameter: number,
    plateMode: number,
    precision: number
  ) {
    this.plateWidth = plateWidth;
    this.plateHeight = plateHeight;
    this.plateDiameter = plateDiameter;
    this.plateMode = plateMode;
    this.precision = precision;
  }

  getPlate(index: number) {
    if (index < this.plates.length) {
      return this.plates[index];
    } else {
      return null;
    }
  }

  lastPlate() {
    return this.plates[this.plates.length - 1];
  }

  addPlate() {
    this.plates.push(
      new Plate(
        this.plateWidth,
        this.plateHeight,
        this.plateDiameter,
        this.plateMode,
        this.precision
      )
    );
  }

  countPlates() {
    return this.plates.length;
  }

  score() {
    return this.countPlates() + (1 - 1 / (1 + this.lastPlate().countParts()));
  }
}
