const path = require('path');
const webpack = require('webpack');

const client = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            }
        ]
    },
    stats: {
        colors: true
    },
    mode: 'development',
    entry: './src/ts/main.ts',
    output: {
        path: path.resolve(__dirname, 'build/client/js'),
        filename: 'main.bundle.js'
    },
    devtool: 'source-map'
}

module.exports = [
    Object.assign({}, client),
];