import webpack from 'webpack';
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {resolve, join} from 'path';
import {getEntries, getChunkFiles} from './build/utils';

const src = resolve(__dirname, 'src');
const dist = resolve(__dirname, 'dist');
const PROD = process.env.mode === 'production';

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
        test: /\.(scss|wxss|sass)$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          // MiniCssExtractPlugin.loader,
          // 'css-loader',
          createFileLoader('wxss'),
          {
            loader: 'sass-loader',
            options: {
              includePaths: [src],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          // MiniCssExtractPlugin.loader,
          // 'css-loader',
          createFileLoader('wxss'),
          {
            loader: 'less-loader',
            options: {
              includePaths: [src],
            },
          },
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
    new MiniCssExtractPlugin({
      filename: "common23.css",
    }),
    // new webpack.optimize.LimitChunkCountPlugin({maxChunks: 2}),
    new MultiEntryPlugin(src, [
      ...getChunkFiles(src, '**/*.wxs'),
      ...getChunkFiles(src, '**/*.wxml'),
      ...getChunkFiles(src, '**/*.json'),
      ...getChunkFiles(src, "**/*.+(wxss|scss|sass|less)"),
    ], 'vent'),
    new webpack.DefinePlugin({}),
  ],
  optimization: {
    minimize: PROD,
    splitChunks: {
      minChunks: 1,
      name: 'common2',
    }
  },
  devtool: PROD ? false : 'nosources-source-map', // source map for js
  performance: {
    hints: 'warning',
    assetFilter: assetFilename => assetFilename.endsWith('.js')
  },
  target: 'node',
  mode: process.env.mode,
}
