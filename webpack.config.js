var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/main.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            "plugins": [
              ["@babel/transform-react-jsx", {"pragma": "createElement"}]
            ]
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Toy React Testing',
      template: 'src/index.html'
    })
  ],
  mode: 'development',
  optimization: {
    minimize: false
  }
}
