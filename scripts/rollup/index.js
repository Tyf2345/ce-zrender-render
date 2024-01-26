import rollupTypescript from '@rollup/plugin-typescript';
import * as pkg from '../../package.json';
import { _dir } from './utils';
export default {
	input: _dir('src/index.ts'),
	output: {
		file: _dir('dist/index.js'),
		format: 'umd',
		name: pkg.name,
		globals: {
			zrender: 'zrender'
		}
	},
	plugins: [rollupTypescript()]
};
