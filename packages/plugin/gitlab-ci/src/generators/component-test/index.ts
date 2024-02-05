import { convertNxGenerator } from '@nx/devkit';
import generator from './generator';

const schematic = convertNxGenerator(generator);
export default schematic;
