import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'index.js',
 // external: ['three', 'gsap'],
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
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false
          }
        ]
      ]
    }),
    copy({
      targets: [
        { src: 'README.md', dest: 'dist' },
        { src: 'demo.html', dest: 'dist' },
      ]
    })
  ]
};
