const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const Dotenv = require('dotenv-webpack')

const ROOT = path.resolve(__dirname, '.')
const srcPath = `${ROOT}/client`
const outputPath = `${ROOT}/client/dist`

const production = process.env.NODE_ENV === 'production'

const config = {
  mode: process.env.NODE_ENV || 'development',
  stats: {
    assets: true,
    warnings: true,
    children: false,
    depth: false,
    entrypoints: false,
    errors: true,
    errorDetails: true,
    hash: false,
  },
  entry: ['@babel/polyfill', `${srcPath}/index.js`],
  output: {
    path: outputPath,
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  context: srcPath,
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      components: `${srcPath}/components`,
      assets: `${srcPath}/assets`,
      lib: `${srcPath}/lib`,
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|otf|webp)(\?.*)?$/,
        loader: 'file-loader',
        query: {
          name: 'assets/[name].[ext]'
        }
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        query: {
          name: 'assets/[name].[ext]'
        }
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Woo Stats',
      inject: true,
      template: `${srcPath}/index.ejs`,
      favicon: `${srcPath}/assets/favicon.ico`,
      minify: {
        removeComments: production,
        collapseWhitespace: production,
        removeRedundantAttributes: production,
        useShortDoctype: production,
        removeEmptyAttributes: production,
        removeStyleLinkTypeAttributes: production,
        keepClosingSlash: production,
        minifyJS: production,
        minifyCSS: production,
        minifyURLs: production,
      },
      meta: {
        description: 'Unofficial community stats site for the Woo Network',
      },
      cache: false,
    }),
    new MiniCssExtractPlugin({
      filename: production ? '[name].[hash].css' : '[name].css',
      chunkFilename: production ? '[id].[hash].css' :'[id].css',
    }),
    new CleanWebpackPlugin(),
    new Dotenv(),
  ],
}

if (production) {
  config.plugins.push(
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|css)$/,
      threshold: 10240,
      minRatio: 0.7,
    })
  )
}

module.exports = config
