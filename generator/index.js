module.exports = (api, options) => {
    const pkg = {
        scripts: {
            'mpvue': "vue-cli-service mpvue --mode development",
            'mpvue:build': "vue-cli-service mpvue --mode production"
        },
        dependencies: {
            "vue-router": "^3.0.1",
            "vuex": "^3.0.1"
        },
        devDependencies: {
            "mpvue-webpack-target": "^0.0.1",
            "string-replace-loader": "^2.1.1",
        }
    }
    api.extendPackage(pkg);
    api.render('./template');
};
