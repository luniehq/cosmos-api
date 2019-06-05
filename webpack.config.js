const config = {
  devtool: "cheap-source-map",
  entry: ['./src/cosmos-ledger.ts'],
  output: {
    path: __dirname + '/lib',
    filename: 'cosmos-ledger.js',
    library: 'cosmos-ledger',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
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
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
}
module.exports = config;