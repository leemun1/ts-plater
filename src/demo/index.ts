import * as path from 'path';

import { Loader } from '../lib/stl/Loader';

// Demo
export const demo = async () => {
  console.log('hello world!');

  const loader = new Loader();
  const filePath = path.resolve('src/assets/teapot.stl');
  const loadedModel = await loader.loadBinarySTL(filePath);

  console.log('loaded', loadedModel);
};
