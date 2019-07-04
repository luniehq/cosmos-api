const config = {
  devtool: 'cheap-source-map',
  entry: ['./src/index.js'],
  output: {
    path: __dirname + '/lib',
    filename: 'cosmos.js',
    library: 'cosmos-api',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
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
  }
}
module.exports = config
