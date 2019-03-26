import webpack from 'webpack';
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin';
import {resolve, join} from 'path';
import {getEntries, getChunkFiles} from './build/utils';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');

const createFileLoader = (ext = '[ext]') => {
  return {
    loader: 'file-loader',
    options: {
      name: `[path][name].${ext}`,
      context: src,
    },
  };
};

export default {
  entry: getEntries(src),
  output: {
    path: dist,
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/i,
        use: [
          'babel-loader',
          // 'eslint-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.wxs$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          createFileLoader(),
          'babel-loader',
          // 'eslint-loader',
        ],
      },
      {
        test: /\.wxml$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          createFileLoader(),
        ],
      },
      {
        test: /\.wxss$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          createFileLoader(),
        ],
      },
      {
        type: 'javascript/auto',
        test: /\.json$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          createFileLoader(),
        ],
      },
    ],
  },
  resolve: {
    modules: [src, 'node_modules'],
    extensions: ['.js', '.json'],
  },
  plugins: [
    new MultiEntryPlugin(src, [
        ...getChunkFiles(src, '**/*.wxs'),
        ...getChunkFiles(src, '**/*.wxml'),
        ...getChunkFiles(src, '**/*.json'),
        ...getChunkFiles(src, '**/*.wxss'),
    ], 'vent'),
    new webpack.DefinePlugin({}),
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 2}),
  ],
  optimization: {
    minimize: process.env.mode === 'production',
  },
  devtool: process.env.mode === 'development' ? 'nosources-source-map' : false, // source map for js
  performance: {
    hints: 'warning',
    assetFilter: assetFilename => assetFilename.endsWith('.js')
  },
  target: 'node',
  mode: process.env.mode,
}
