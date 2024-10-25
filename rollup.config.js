import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/domension.js',
      format: 'umd',
      name: 'DOMension',
      sourcemap: true
    },
    {
      file: 'dist/domension.min.js',
      format: 'umd',
      name: 'DOMension',
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    resolve()
  ]
};