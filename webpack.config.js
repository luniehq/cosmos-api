const config = {
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
  }
}
module.exports = config;