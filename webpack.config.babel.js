import webpack from 'webpack';
import {resolve, join} from 'path';
import MultiEntryPlugin from 'webpack/lib/MultiEntryPlugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import {getEntries, getChunkFiles, clear, getEntryResource} from './build/utils';

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

const webpackConfig = {
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
          {
            loader: './build/loader/wxs-loader',
            options: { isDebug: PROD }
          },
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
          createFileLoader('wxss'),
          {
            loader: 'sass-loader',
            options: {
              includePaths: [resolve('src', 'styles'), src],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          createFileLoader('wxss'),
          {
            loader: 'less-loader',
            options: {
              includePaths: [resolve('src', 'styles'), src],
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
          {
            loader: './build/loader/json-loader',
            options: { isDebug: PROD }
          }
        ],
      },
    ],
  },
  resolve: {
    modules: [src, 'node_modules'],
    extensions: ['.js', '.json'],
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({maxChunks: 2}),
    new MultiEntryPlugin(src, [
      ...getChunkFiles(src, '**/*.wxs'),
      ...getChunkFiles(src, '**/*.wxml'),
      ...getChunkFiles(src, '**/*.json'),
      ...getChunkFiles(src, "**/*.+(wxss|scss|sass|less)"),
    ], 'vent'),
    new webpack.DefinePlugin({}),
  ],
  optimization: {
    minimizer: [
      // minify style
      new OptimizeCSSAssetsPlugin({
        assetNameRegExp: /\.(scss|wxss|sass|less)$/,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {discardComments: {removeAll: true}},
        canPrint: true
      }),
    ],
  },
  devtool: PROD ? false : 'nosources-source-map', // source map for js
  performance: {
    hints: 'warning',
    assetFilter: assetFilename => assetFilename.endsWith('.js')
  },
  target: 'node',
  mode: process.env.mode,
};

PROD ? webpackConfig.plugins.push(
    new TerserPlugin({
      exclude: /node_modules/,
      minify: (file, sourceMap) => {
        // https://github.com/mishoo/UglifyJS2#minify-options
        return require('uglify-js').minify(file, {
          compress: {
            drop_console: true
          },
        });
      },
    })
) : null;


export default webpackConfig;
