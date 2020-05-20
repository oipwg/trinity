const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js',
  },
  module: { 
    rules: [
        {
            test: /\.(png|jp(e*)g|svg|gif)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: 'images/[hash]-[name].[ext]',
                    },
                },
            ],
        },
        {
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            },
        },
        {
            test: /\.(sa|sc|c)ss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'],
        },
    ],
},
node: {
    console: true,
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    "child_process": "empty"
  },
  plugins: [
    // new CleanWebpackPlugin(['dist/*']) for < v2 versions of CleanWebpackPlugin
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Trinity Production',
      template: './src/index.html',

    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }, 
    externals: {
    fsevents: "require('fsevents')"
  }
  
};