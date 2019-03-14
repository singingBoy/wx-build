import webpack from 'webpack';
import {resolve, join} from 'path';
import {getFiles, getEntries} from './build/utils';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');
const jsFiles = getFiles('**/*.js', src);
console.log(getEntries(jsFiles, src));

export default {
  entry: getEntries(jsFiles, src),
  // entry: {
  //   app: join(src, 'app.js'),
  // },
  output: {
    path: dist,
    filename: '[name].js'
  },
  mode: process.env.mode,
  target: 'node',
  module: {
    rules: [{
      test: /\.js$/i,
      use: [
        'babel-loader',
        // 'eslint-loader'
      ],
      exclude: /node_modules/
    }],
  },
  resolve: {
    modules: [src, 'node_modules'],
    extensions: ['.js', '.json'],
  },
  plugins: [
    new webpack.DefinePlugin({}),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 1}),
  ],
  optimization: {
    minimize: false,
  },
  devtool: 'nosources-source-map', // source map for js
  performance: {
    hints: 'warning',
    assetFilter: assetFilename => assetFilename.endsWith('.js')
  }
}