module.exports = {
  root: true,
  env: {
    node: true,
    jquery: true,
  },
  extends: ['plugin:vue/essential', 'plugin:prettier/recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': [
      'off',
      {
        singleQuote: true,
        semi: false,
      },
    ],
    'vue/no-parsing-error': [
      'off',
      {
        'x-invalid-end-tag': false,
      },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  globals: {
    AMap: true,
  },
}
