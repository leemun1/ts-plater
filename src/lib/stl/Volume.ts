import { Face } from './Face';
import { Point3 } from './Point3';

export class Volume {
  faces: Face[] = [];

  addFace(f: Face) {
    this.faces.push(f);
  }

  min(): Point3 {
    if (this.faces.length < 1) return new Point3(0, 0, 0);

    let xmin = this.faces[0].v[0].x;
    let ymin = this.faces[0].v[0].y;
    let zmin = this.faces[0].v[0].z;

    for (const face of this.faces) {
      for (let i = 0; i < 3; i++) {
        if (face.v[i].x < xmin) xmin = face.v[i].x;
        if (face.v[i].y < ymin) ymin = face.v[i].y;
        if (face.v[i].z < zmin) zmin = face.v[i].z;
      }
    }
    return new Point3(xmin, ymin, zmin);
  }

  max(): Point3 {
    if (this.faces.length < 1) return new Point3(0, 0, 0);

    let xmax = this.faces[0].v[0].x;
    let ymax = this.faces[0].v[0].y;
    let zmax = this.faces[0].v[0].z;

    for (const face of this.faces) {
      for (let i = 0; i < 3; i++) {
        if (face.v[i].x > xmax) xmax = face.v[i].x;
        if (face.v[i].y > ymax) ymax = face.v[i].y;
        if (face.v[i].z > zmax) zmax = face.v[i].z;
      }
    }
    return new Point3(xmax, ymax, zmax);
  }
}
