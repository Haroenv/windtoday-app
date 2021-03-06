'use strict'

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const PurifyCSSPlugin = require('purifycss-webpack')
const OfflinePlugin = require('offline-plugin')
const webpack = require('webpack')
const glob = require('glob')
const path = require('path')

const config = JSON.parse(JSON.stringify(require('config')))
const pkg = require('./package.json')

const { DefinePlugin, HashedModuleIdsPlugin } = webpack

const {
  OccurrenceOrderPlugin,
  AggressiveMergingPlugin,
  CommonsChunkPlugin,
  UglifyJsPlugin,
  ModuleConcatenationPlugin } = webpack.optimize

module.exports = {
  devtool: 'source-map',
  entry: [
    './src/app/index.js'
  ],
  output: {
    path: path.resolve('src/www'),
    filename: 'assets/js/bundle.js'
  },
  resolve: {
    extensions: ['.scss', '.css', '.js'],
    modules: ['node_modules']
  },
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules\/(?!(autotrack|dom-utils))/,
      use: ['babel-loader']
    }, {
      test: /\.(css|scss)$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [{
          loader: 'css-loader',
          options: {
            minimize: true,
            sourceMap: true,
            importLoaders: 2
          }
        }, {
          loader: 'postcss-loader',
          options: {
            parser: 'postcss-scss',
            sourceMap: true
          }
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            data: '@import "index.scss";',
            includePaths: ['node_modules', 'node_modules/@material/*', 'src/app']
              .map(modulePath => glob.sync(path.resolve(modulePath)))
              .reduce((acc, paths) => acc.concat(paths), [])
          }
        }]
      })
    }]
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'APP_VERSION': JSON.stringify(pkg.version),
      'ALGOLIA': JSON.stringify(config.algolia)
    }),
    new ModuleConcatenationPlugin(),
    new HashedModuleIdsPlugin(),
    new OccurrenceOrderPlugin(),
    new AggressiveMergingPlugin(),
    new ExtractTextPlugin({
      allChunks: true,
      filename: 'assets/css/bundle.css'
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/
    }),
    new PurifyCSSPlugin({
      paths: [
        'src/app/**/*.js',
        'src/app/SearchCurrentFilters/style.scss',
        'index.ejs'
      ].reduce((acc, pattern) => acc.concat(glob.sync(pattern, { nodir: true })), []),
      purifyOptions: {
        info: true,
        rejected: true,
        whitelist: [
          '*rheostat*',
          '*rc-checkbox*'
        ]
      }
    }),
    new UglifyJsPlugin({
      sourceMap: true,
      minimize: true,
      compress: { warnings: false },
      comments: false
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.(js|html)$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      filename: 'assets/js/vendor.bundle.js',
      minChunks: Infinity
    }),
    new CommonsChunkPlugin({
      async: true,
      children: true,
      minChunks: 4
    }),
    new OfflinePlugin({
      safeToUseOptionalCaches: true,
      AppCache: {
        FALLBACK: { '/': '/' }
      },
      caches: {
        main: [
          'index.html',
          ':rest:'
        ],
        additional: [
          'assets/js/vendor.bundle.js',
          'assets/css/bundle.css'
        ],
        optional: [
          ':externals:'
        ]
      },
      externals: [
        'https://static.hotjar.com/c/hotjar-342795.js?sv=5',
        'https://fonts.googleapis.com/css?family=Ubuntu:300',
        'https://www.google-analytics.com/analytics.js',
        'https://cdn.headwayapp.co/widget.js'
      ].concat(
        glob.sync('src/www/assets/img/**/*.*', {
          nodir: true
        }).map(file => file.replace('src/www/', ''))
      )
    }),
    new HtmlWebpackPlugin(Object.assign({}, config.meta, {
      template: path.resolve('index.ejs'),
      alwaysWriteToDisk: true,
      inject: false,
      hash: true,
      minify: {
        collapseWhitespace: true,
        decodeEntities: true,
        html5: true,
        processConditionalComments: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        removeTagWhitespace: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    })),
    new PreloadWebpackPlugin(),
    new HtmlWebpackHarddiskPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      generateStatsFile: true,
      logLevel: 'error'
    })
  ]
}
