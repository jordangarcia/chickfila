module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: ['eslint:recommended'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    // sourceType: 'module',
  },
//   plugins: ['babel', 'react'],
//   globals: {
//     process: true,
//     require: true,
//   },
  rules: {
    // 'react/prop-types': ['off'],
    'no-unused-vars': ['warn', { args: 'none' }],
    'no-undef': ['error'],
    indent: ['warn', 2],
    'linebreak-style': ['warn', 'unix'],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
  },
}
