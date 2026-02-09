/** @type {import('next').NextConfig} */
module.exports = {
  turbopack: {
    rules: {
      '*.md': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
};
