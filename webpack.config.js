const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = {
  devtool: "cheap-source-map",
  entry: ['./src/index.js'],
  output: {
    path: __dirname + '/lib',
    filename: 'cosmos.js',
    library: 'cosmos-js',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/,
        query: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          warnings: false,
          parse: {},
          compress: {},
          mangle: false,
          output: null,
          toplevel: false,
          nameCache: null,
          ie8: false,
          keep_fnames: false,
        },
      }),
    ],
  },
}
module.exports = config;