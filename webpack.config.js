const path = require('path')

module.exports = {
    entry: './src/App.js',
    output: {
        path: path.join(__dirname, 'public'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
        ],
    },
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'backend/views'),
        port: 5000,
    },
}
