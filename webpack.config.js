const path = require('path');
const autoprefixer = require('autoprefixer');

module.exports = {
    // enntry file
    entry: ['./index.js', './src/style.scss'],
    // 컴파일 + 번들링된 js 파일이 저장될 경로와 이름 지정
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve(__dirname, './index.js'),
                ],
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: { presets: ['es2015'] },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: { name: 'index.css' },
                    },
                    { loader: 'extract-loader' },
                    { loader: 'css-loader' },
                    {
                        loader: 'postcss-loader',
                        options: { plugins: () => [autoprefixer()] },
                    },
                    {
                        loader: 'sass-loader',
                        options: { includePaths: ['./node_modules'] },
                    },
                ],
            },
        ],
    },
    devtool: 'source-map',
    // https://webpack.js.org/concepts/mode/#mode-development
};
