const path = require('path');
const webpack = require('webpack');
const Config = require('webpack-chain');
const mpvueTarget = require('mpvue-webpack-target');
const MpvuePlugin = require('webpack-mpvue-asset-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const vueLoaderConfig = require('./build/vue-loader.conf');
const utils = require('./build/utils');

/*eslint no-console: "off", no-unused-vars: "off"*/
module.exports = (api, projectOptions) => {
    const transpileDependencies = projectOptions.transpileDependencies || [];
    const resolve = (...p) => path.resolve(api.getCwd(), ...p);

    // change entry
    api.chainWebpack(config => {
        config.entry('app').clear().add('./src/entry/web.js').end();
        config.module.rule('js').use('string-replace-loader').loader('string-replace-loader').options({
            search: '@platform',
            replace: 'web'
        }).end();
    });

    api.registerCommand('mpvue', args => {
        const appConfig = require(resolve('src/app.json'));
        const pages = [{}, ...appConfig.pages].reduce((prev, next) => ({
            ...prev,
            [next]: resolve(`src/${next}.js`)
        }));

        const mode = process.env.NODE_ENV = args.mode;
        const isProd = mode === 'production';
        const webConfig = api.resolveWebpackConfig();
        const config = new Config();
        const distPath = resolve(`dist/mpvue`);

        // target
        config.target(mpvueTarget).end();

        // output
        config.output.path(distPath).filename('[name].js').publicPath('/').end();

        // devtool
        config.devtool('#source-map').end();

        // resolve
        config.resolve.extensions.add('.js').add('.vue').add('.json').end();
        config.resolve.alias.set('vue$', 'mpvue').set('@', webConfig.resolve.alias['@']).end();
        config.resolve.symlinks(true).end();
        config.resolve.aliasFields.add('mpvue').add('weapp').add('browser').end();
        config.resolve.mainFields.add('browser').add('module').add('main').end();
        config.resolve.symlinks(false).end();

        config.module.rule('vue').test(/\.vue$/).use('mpvue-loader').loader('mpvue-loader').options(vueLoaderConfig).end();
        config.module.rule('js').test(/\.js$/).include.add(resolve('src')).add(resolve('test')).end()
            .use('babel-loader').loader('babel-loader').end();

        // 补充需要编译的模块
        transpileDependencies.map(dep => resolve('node_modules', dep)).forEach(p => config.module.rule('js').include.add(p));

        config.module.rule('js').use('string-replace-loader').loader('string-replace-loader').options({
            search: '@platform',
            replace: 'mpvue'
        }).end();
        config.module.rule('js').use('mpvue-loader').loader('mpvue-loader').options({
            checkMPEntry: true,
            ...vueLoaderConfig
        }).end();

        // plugins
        config.plugin('mpvue').use(MpvuePlugin).end();
        config.plugin('copy-webpack-json').use(CopyWebpackPlugin, [
            [{
                from: '**/*.json',
                to: ''
            }], {
                context: 'src/'
            }
        ]).end();
        config.plugin('copy-webpack-static').use(CopyWebpackPlugin, [
            [{
                from: resolve('src/assets'),
                to: path.resolve(distPath, 'assets'),
                ignore: ['.*']
            }]
        ]).end();
        config.plugin('define').use(webpack.DefinePlugin, [{
            'proccess.env': mode
        }]).end();
        config.plugin('extract').use(ExtractTextPlugin, [{
            filename: '[name].wxss'
        }]).end();
        config.plugin('common-vendor').use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'common/vendor',
            minChunks: (module, count) => {
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf('node_modules') >= 0
                ) || count > 1
            }
        }]);
        config.plugin('common-manifest').use(webpack.optimize.CommonsChunkPlugin, [{
            name: 'common/manifest',
            chunks: ['common/vendor']
        }]);
        config.plugin('optimize').use(OptimizeCSSPlugin, [{
            cssProcessorOptions: {
                safe: true
            }
        }]).end();

        if (isProd) {
            config.delete('devtool').end();
            config.output.chunkFilename('[id].js').end();
            config.plugin('uglify').use(UglifyJsPlugin, [{
                sourceMap: true
            }]).end();
            config.plugin('hashed').use(webpack.HashedModuleIdsPlugin).end();
        }

        let finalConfig = config.toConfig();

        // entry
        finalConfig.entry = {
            app: resolve(`src/entry/mpvue.js`),
            ...pages
        };

        // style loaders
        finalConfig.module.rules = finalConfig.module.rules.concat(utils.styleLoaders({
            sourceMap: false,
            extract: true
        }));

        // console.log(finalConfig)
        // return

        if (isProd) {
            require('./build/build')(finalConfig);
        } else {
            // development mode
            require('./build/dev-server')(finalConfig);
        }
    });
};
