import * as fs from 'fs';

import { Face } from './Face';
import { Model } from './Model';
import { Point3 } from './Point3';
import { Volume } from './Volume';

export class Loader {
  loadBinarySTL(filepath: string): Promise<Model> {
    const instream = fs.createReadStream(filepath);

    const model = new Model();
    model.volumes.push(new Volume());
    const vol = model.volumes[0];

    return new Promise((fulfill) => {
      let buffer = Buffer.alloc(0);
      let triangleCount = 0;
      let trianglesTransformed = 0;

      function process() {
        if (triangleCount === 0 && buffer.length >= 84) {
          triangleCount = buffer.readUInt32LE(80);
          buffer = buffer.slice(84);
        }
        while (triangleCount > 0 && buffer.length >= 50) {
          // read normal data
          buffer.readFloatLE(0);
          buffer.readFloatLE(4);
          buffer.readFloatLE(8);

          // read vertices data
          const v0 = new Point3(
            buffer.readFloatLE(12),
            buffer.readFloatLE(16),
            buffer.readFloatLE(20)
          );
          const v1 = new Point3(
            buffer.readFloatLE(24),
            buffer.readFloatLE(28),
            buffer.readFloatLE(32)
          );
          const v2 = new Point3(
            buffer.readFloatLE(36),
            buffer.readFloatLE(40),
            buffer.readFloatLE(44)
          );

          vol.addFace(new Face(v0, v1, v2));

          buffer = buffer.slice(50);

          trianglesTransformed++;
          if (trianglesTransformed === triangleCount) {
            console.log('triangles transformed', trianglesTransformed);
            // end
          }
        }
      }

      instream.on('data', function (chunk: Buffer) {
        buffer = Buffer.concat([buffer, chunk]);
        process();
      });
      instream.on('end', function () {
        process();
        fulfill(model);
      });
    });
  }
}
