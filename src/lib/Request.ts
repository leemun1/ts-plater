import * as fs from 'fs';
import * as readline from 'readline';

import { Part } from './Part';
import { Placer } from './Placer';
import { Solution } from './Solution';

export enum PLATE_MODE {
  RECTANGLE,
  CIRCLE,
}

export enum REQUEST_SORT_MODE {
  SINGLE,
  MULTIPLE,
}

export enum PLACER_SORT_MODE {
  SURFACE_DEC,
  SURFACE_INC,
  SHUFFLE,
}

export enum PLACER_GRAVITY {
  YX,
  XY,
  EQ,
}

export class Request {
  plateMode = PLATE_MODE.RECTANGLE;
  sortMode = REQUEST_SORT_MODE.SINGLE;
  plateWidth = 150000;
  plateHeight = 150000;
  plateDiameter = 150000;
  randomIterations = 3;
  mode = 'STL';
  precision = 500;
  delta = 1000;
  deltaR = Math.PI / 2;
  spacing = 1500;
  pattern = 'plate_';
  cancel = false;
  hasError = false;
  solution: Solution | null = null;
  numThreads = 1;
  platesInfo = false;
  plates = 0;
  parts: {
    [key: string]: Part;
  } = {};
  quantities: {
    [key: string]: number;
  } = {};
  placers: Placer[] = [];

  setPlateSize(w: number, h: number) {
    this.plateWidth = w * 1000;
    this.plateHeight = h * 1000;
  }

  async addPart(filepath: string, quantity: number, orientation: string) {
    if (!this.cancel && !this.hasError) {
      if (filepath != '' && quantity != 0) {
        console.log('loading', filepath, quantity, orientation);
        this.parts[filepath] = new Part();
        const loaded = await this.parts[filepath].load(
          filepath,
          this.precision,
          this.deltaR,
          this.spacing,
          orientation,
          this.plateWidth,
          this.plateHeight
        );
        this.quantities[filepath] = quantity;

        if (loaded === 0) {
          console.log('part is too big for plate');
          this.hasError = true;
        }
      }
    }
  }

  async readParts(filepath: string) {
    this.parts = {};
    this.quantities = {};
    this.hasError = false;

    const input = fs.createReadStream(filepath);

    return new Promise((resolve, reject) => {
      const lineReader = readline.createInterface({ input });
      input.on('end', () => {
        console.log('end!');
        resolve(true);
      });
      input.on('error', (err) => {
        console.error('error!');
        reject(err);
      });

      lineReader.on('line', async (line) => {
        const args = line.split(' ');
        console.log('args:', args);

        const modelFilepath = args[0];
        const quantity = +args[1];
        const orientation = args[2];
        await this.addPart(modelFilepath, quantity, orientation);
      });
    });
  }

  process() {
    if (this.solution) {
      // reset solution
      this.solution = null;
    }

    if (!this.cancel) {
      if (this.hasError) {
        console.log('cannot process');
      } else {
        console.log('start processing');
        if (this.plateMode == PLATE_MODE.RECTANGLE) {
          console.log('Plate size', this.plateWidth, this.plateHeight);
        } else {
          console.log('Plate size (diameter)', this.plateDiameter);
        }

        let lastSort;
        if (this.sortMode == REQUEST_SORT_MODE.SINGLE) {
          lastSort = PLACER_SORT_MODE.SURFACE_DEC;
        } else {
          lastSort = PLACER_SORT_MODE.SHUFFLE + this.randomIterations;
        }
        for (let sortMode = 0; sortMode <= lastSort; sortMode++) {
          for (let rotateOffset = 0; rotateOffset < 2; rotateOffset++) {
            for (
              let rotateDirection = 0;
              rotateDirection < 2;
              rotateDirection++
            ) {
              for (let gravity = 0; gravity < PLACER_GRAVITY.EQ; gravity++) {
                const placer = new Placer(this);
                placer.sortParts(sortMode);
                placer.setGravityMode(gravity);
                placer.setRotateDirection(rotateDirection);
                placer.setRotateOffset(rotateOffset);
                this.placers.push(placer);
              }
            }
          }
        }

        let stop = false;
        const workers = new Set<Placer>();

        while (this.placers.length || workers.size) {
          while (this.placers.length && workers.size < this.numThreads) {
            const placer = this.placers.pop();

            if (!stop && !this.cancel && placer) {
              workers.add(placer);
              placer.place();
            }
          }

          const toDelete: Placer[] = [];
          workers.forEach((placer) => {
            if (placer.solution) {
              const solutionTmp = placer.solution;

              // found a better solution
              if (
                !this.solution ||
                solutionTmp.score() < this.solution.score()
              ) {
                console.log('Found solution', solutionTmp);
                this.solution = solutionTmp;
              }

              if (this.solution.countPlates() == 1) {
                stop = true;
              }

              toDelete.push(placer);
            }
          });

          for (const placer of toDelete) {
            workers.delete(placer);
          }
        }

        if (!this.cancel) {
          this.plates = this.solution!.countPlates();
          console.log('Solution:');
          console.log('- Plates:', this.plates);
          console.log('- Score:', this.solution!.score());
        }
      }
    }

    if (this.solution) {
      for (let i = 0; i < this.solution!.countPlates(); i++) {
        const plate = this.solution!.getPlate(i);
        if (plate) {
          for (const placedPart of plate.parts) {
            const part = placedPart.getPart();
            if (placedPart && part) {
              console.log('part name', placedPart.getName());
              console.log('- center x', placedPart.getCenterX() / 1000);
              console.log('- center y', placedPart.getCenterY() / 1000);
              console.log(
                (placedPart.getRotation() * part.deltaR * 180) / Math.PI
              );
            }
          }
        }
      }
    }
  }
}
