const PLATFORM = process.env.PLATFORM || 'web';

let config = {
    outputDir: 'dist/web'
};

if (PLATFORM === 'mpvue') {
    config.css = {
        loaderOptions: {
            postcss: {
                plugins: {
                    'postcss-mpvue-wxss': {},
                    'px2rpx-loader': {}
                }
            }
        }
    };
}

module.exports = config;
