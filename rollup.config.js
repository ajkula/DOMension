import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
  input: 'index.js',
  external: ['three', 'gsap'],
  output: [
    {
      file: 'dist/domension.js',
      format: 'umd',
      name: 'DOMension',
      globals: {
        'three': 'THREE',
        'gsap': 'gsap'
      },
      sourcemap: true
    },
    {
      file: 'dist/domension.min.js',
      format: 'umd',
      name: 'DOMension',
      globals: {
        'three': 'THREE',
        'gsap': 'gsap'
      },
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    copy({
      targets: [
        { src: 'README.md', dest: 'dist' },
        { src: 'demo.html', dest: 'dist' },
      ]
    })
  ]
};