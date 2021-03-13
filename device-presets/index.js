const fs = require('fs');
let devConfigs = {};

module.exports = {
    // read devices presets from files in this directory
    // !!the file name is used as key for the config object!!
    readPresets: () => {
        fs.readdirSync(__dirname + '/').forEach(function(file) {
            if (file.match(/\.json$/) !== null) {
                const devName = file.replace('.json', '');
                const devConfig = JSON.parse(fs.readFileSync(__dirname + '/' + file));
                devList[devName] = devConfig.name;
                devConfigs[devName] = devConfig.config;
            }
        });
    },

    getConfigs: () => {
        return devConfigs;
    }
};
