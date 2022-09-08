const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const json5 = require('json5');

module.exports = {
  mode: 'production', // @TODO: 'development' won't work!
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',  //relative to root of the application
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/activateMockFirebolt.js" },
      ],
    }),
    new HtmlWebpackPlugin({
        hash: true,
        title: 'Conduit',
        myPageHeader: 'Welcome to the Conduit App',
        template: './src/index.html'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(json5|json)$/i,
        type: 'json',
        parser: {
          parse: json5.parse,
        },
      },
    ],
  },
};
