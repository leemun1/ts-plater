import * as path from 'path';

import { Request } from '../lib/Request';

// Demo
export const demo = async () => {
  console.log('hello world!');

  const request = new Request();
  const filePath = path.resolve('src/demo/conf.txt');

  console.log('--- Start reading parts ---');
  await request.readParts(filePath);
  console.log('--- Done reading parts ---');

  console.log('--- Start processing ---');
  request.process();
  console.log('--- Done processing ---');
};
