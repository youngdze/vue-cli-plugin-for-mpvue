var utils = require('./utils')

module.exports = {
    loaders: utils.cssLoaders({
        sourceMap: false,
        extract: true
    }),
    transformToRequire: {
        video: 'src',
        source: 'src',
        img: 'src',
        image: 'xlink:href'
    },
    fileExt: {
        template: 'wxml',
        script: 'js',
        style: 'wxss',
        platform: 'wx'
    }
}
