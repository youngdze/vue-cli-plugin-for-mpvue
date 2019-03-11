module.exports = (api, options) => {
    const pkg = {
        scripts: {
            'mpvue': "vue-cli-service mpvue --mode development",
            'mpvue:build': "vue-cli-service mpvue --mode production"
        },
        dependencies: {
            "vue-router": "^3.0.1",
            "vuex": "^3.0.1"
        }
    }
    api.extendPackage(pkg);
    api.render('./template');
};
