import { Bitmap } from './Bitmap';
import { Loader } from './stl/Loader';
import { Model } from './stl/Model';

export class Part {
  filepath = '';
  bmp: (Bitmap | null)[] = [];
  model: Model | null = null;
  numBitmaps = 0;
  precision = 0;
  deltaR = 0;
  surface = 0;

  async load(
    filepath: string,
    precision: number,
    deltaR: number,
    spacing: number,
    orientation: string,
    plateWidth: number,
    plateHeight: number
  ) {
    this.precision = precision;
    this.filepath = filepath;
    this.deltaR = deltaR;
    this.numBitmaps = Math.ceil((Math.PI * 2) / this.deltaR);

    const loader = new Loader();
    const loadedModel = await loader.loadBinarySTL(filepath);
    this.model = loadedModel.putFaceOnPlate(orientation);
    this.bmp = Array(this.numBitmaps)
      .fill(0)
      .map(() => new Bitmap(0, 0));
    this.bmp[0] = this.model.pixelize(this.precision, spacing);
    this.surface = 0;

    // TODO: remove if unnecessary
    // const minP = model.min();
    // const maxP = model.max();
    // const width = maxP.x - minP.x + 2 * spacing;
    // const height = maxP.y - minP.y + 2 * spacing;
    let correct = 0;

    for (let k = 0; k < this.numBitmaps; k++) {
      if (k > 0) {
        const rotated = Bitmap.rotate(this.bmp[0], k * this.deltaR);
        this.bmp[k] = Bitmap.trim(rotated);
      }
    }

    for (let k = 0; k < this.numBitmaps; k++) {
      const currentBmp = this.bmp[k];
      if (currentBmp === null) continue;

      // Will this fit on the plate ?
      if (
        currentBmp.width * this.precision < plateWidth &&
        currentBmp.height * this.precision < plateHeight
      ) {
        this.surface += currentBmp.width * currentBmp.height;
        correct++;
      } else {
        this.bmp[k] = null;
      }
    }

    if (correct > 0) {
      this.surface /= correct;
    }
    return correct;
  }

  getSurface() {
    return this.surface;
  }

  getFilepath() {
    return this.filepath;
  }

  getBmp(index: number) {
    return this.bmp[index];
  }

  getDensity(index: number) {
    const bmp = this.getBmp(index);
    if (bmp === null) return 0;

    return (bmp.pixels / bmp.width) * bmp.height;
  }
}
