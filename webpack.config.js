const config = {
  entry: ['./src/index.js'],
  output: {
    path: __dirname + '/lib',
    filename: 'cosmos.js'
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