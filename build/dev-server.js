var path = require('path')
var express = require('express')
var webpack = require('webpack')
var portfinder = require('portfinder')

module.exports = (webpackConfig) => {
    var port = process.env.PORT || 8080;
    var app = express()
    var compiler = webpack(webpackConfig, (err, stats) => {
        if (err) return console.log(err);
        let jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) return console.error(jsonStats.errors[0]);
        if (jsonStats.warnings.length > 0) return console.error(jsonStats.warnings[0]);
    });

    // serve pure static assets
    var staticPath = path.posix.join('/')
    app.use(staticPath, express.static('./static'))

    /*eslint no-console: off, no-unused-vars: off*/
    module.exports = new Promise((resolve, reject) => {
        portfinder.basePort = port
        portfinder.getPortPromise().then(newPort => {
            if (port !== newPort) {
                console.log(`${port}端口被占用，开启新端口${newPort}`)
            }
            var server = app.listen(newPort, 'localhost', () => {
                console.log(`mpvue已经启动，监听端口${newPort}`)
            })
            // for 小程序的文件保存机制
            require('webpack-dev-middleware-hard-disk')(compiler, {
                publicPath: webpackConfig.output.publicPath,
                quiet: true
            })

            resolve({
                ready: () => {},
                close: () => {
                    server.close()
                }
            })
        }).catch(error => {
            console.log('没有找到空闲端口，请打开任务管理器杀死进程端口再试', error)
        });
    });
};
