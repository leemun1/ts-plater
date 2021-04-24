import * as path from 'path';

import { Request } from '../lib/Request';

// Demo
export const demo = async () => {
  console.log('hello world!');

  const request = new Request();
  const filePath = path.resolve('src/demo/conf.txt');
  await request.readParts(filePath);
  request.process();
};
