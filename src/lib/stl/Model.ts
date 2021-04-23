import { Bitmap } from '../Bitmap';
import { QuadTree } from '../QuadTree';
import { Triangle } from '../Triangle';
import { degree2Rad } from '../utils';

import { Point2 } from './Point2';
import { Point3 } from './Point3';
import { Volume } from './Volume';

export class Model {
  tree: QuadTree | null = null;
  volumes: Volume[] = [];
  triangles: Triangle[] = [];

  min() {
    if (this.volumes.length < 1) return new Point3(0, 0, 0);

    const min = this.volumes[0].min();

    let xmin = min.x;
    let ymin = min.y;
    let zmin = min.z;

    for (const v of this.volumes) {
      const p = v.min();
      if (p.x < xmin) xmin = p.x;
      if (p.y < ymin) ymin = p.y;
      if (p.z < zmin) zmin = p.z;
    }
    return new Point3(xmin, ymin, zmin);
  }

  max() {
    if (this.volumes.length < 1) return new Point3(0, 0, 0);

    const max = this.volumes[0].max();

    let xmax = max.x;
    let ymax = max.y;
    let zmax = max.z;

    for (const v of this.volumes) {
      const p = v.max();
      if (p.x > xmax) xmax = p.x;
      if (p.y > ymax) ymax = p.y;
      if (p.z > zmax) zmax = p.z;
    }
    return new Point3(xmax, ymax, zmax);
  }

  contains(x: number, y: number) {
    if (!this.tree) {
      const minP = this.min();
      const maxP = this.max();
      this.tree = new QuadTree(minP.x, minP.y, maxP.x, maxP.y, 6);

      for (let i = 0; i < this.volumes.length; i++) {
        for (let k = 0; k < this.volumes[i].faces.length; k++) {
          const face = this.volumes[i].faces[k];
          const triangle = new Triangle(
            new Point2(face.v[0].x, face.v[0].y),
            new Point2(face.v[1].x, face.v[1].y),
            new Point2(face.v[2].x, face.v[2].y)
          );
          this.triangles.push(triangle);
          this.tree.add(triangle);
        }
      }
    }

    return this.tree.test(x, y);
  }

  pixelize(precision: number, dilatation: number) {
    const minP = this.min();
    const maxP = this.max();
    const xMin = minP.x - dilatation;
    const yMin = minP.y - dilatation;
    const xMax = maxP.x + dilatation;
    const yMax = maxP.y + dilatation;
    const width = Math.floor((xMax - xMin) / precision);
    const height = Math.floor((yMax - yMin) / precision);
    const bitmap = new Bitmap(width, height);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const X = (x + 1) * precision - dilatation + minP.x;
        const Y = (y + 1) * precision - dilatation + minP.y;
        if (X > minP.x && X < maxP.x && Y > minP.y && Y < maxP.y) {
          bitmap.setPoint(x, y, this.contains(X, Y) ? 2 : 0);
        } else {
          bitmap.setPoint(x, y, 0);
        }
      }
    }

    bitmap.dilatation(dilatation / precision);

    return bitmap;
  }

  translate(X: number, Y: number, Z: number) {
    const translated = new Model();
    translated.volumes = this.volumes;

    for (const volume of translated.volumes) {
      for (const face of volume.faces) {
        for (let i = 0; i < 3; i++) {
          face.v[i].x += X;
          face.v[i].y += Y;
          face.v[i].z += Z;
        }
      }
    }

    return translated;
  }

  merge(other: Model) {
    for (const volume of other.volumes) {
      this.volumes.push(volume);
    }
  }

  rotateZ(r: number) {
    const rotated = new Model();
    rotated.volumes = this.volumes;

    for (const volume of rotated.volumes) {
      for (const face of volume.faces) {
        for (let i = 0; i < 3; i++) {
          const x = face.v[i].x;
          const y = face.v[i].y;
          face.v[i].x = Math.cos(r) * x - Math.sin(r) * y;
          face.v[i].y = Math.sin(r) * x + Math.cos(r) * y;
        }
      }
    }

    return rotated;
  }

  rotateY(r: number) {
    const rotated = new Model();
    rotated.volumes = this.volumes;

    for (const volume of rotated.volumes) {
      for (const face of volume.faces) {
        for (let i = 0; i < 3; i++) {
          const x = face.v[i].x;
          const z = face.v[i].z;
          face.v[i].x = Math.cos(r) * x - Math.sin(r) * z;
          face.v[i].z = Math.sin(r) * x + Math.cos(r) * z;
        }
      }
    }

    return rotated;
  }

  rotateX(r: number) {
    const rotated = new Model();
    rotated.volumes = this.volumes;

    for (const volume of rotated.volumes) {
      for (const face of volume.faces) {
        for (let i = 0; i < 3; i++) {
          const y = face.v[i].y;
          const z = face.v[i].z;
          face.v[i].y = Math.cos(r) * y - Math.sin(r) * z;
          face.v[i].z = Math.sin(r) * y + Math.cos(r) * z;
        }
      }
    }

    return rotated;
  }

  center() {
    const minP = this.min();
    const maxP = this.max();

    const X = (minP.x + maxP.x) / 2.0;
    const Y = (minP.y + maxP.y) / 2.0;
    const Z = minP.z;

    return this.translate(-X, -Y, -Z);
  }

  putFaceOnPlate(orientation: string) {
    if (orientation == 'front') return this.rotateX(degree2Rad(90));
    if (orientation == 'top') return this.rotateX(degree2Rad(180));
    if (orientation == 'back') return this.rotateX(degree2Rad(270));
    if (orientation == 'left') return this.rotateY(degree2Rad(90));
    if (orientation == 'right') return this.rotateY(degree2Rad(-90));
    return this;
  }
}
