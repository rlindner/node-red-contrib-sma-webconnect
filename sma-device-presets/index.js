const fs = require('fs');
let devList = {};
let devConfigs = {};

// read all devices presets from files in this directory and export them
// the file name will be used as key for the config object!
function readConfigs(){
    fs.readdirSync(__dirname + '/').forEach(function(file) {
        if (file.match(/\.json$/) !== null) {
            const devName = file.replace('.json', '');
            const devConfig = JSON.parse(fs.readFileSync(__dirname + '/' + file));
            devList[devName] = devConfig.name;
            devConfigs[devName] = devConfig.config;
        }
    });
};

function getList(){
    return devList;
};

function getConfigs(){
    return devConfigs;
};

module.exports.readConfigs = readConfigs;
module.exports.getList = getList;
module.exports.getConfigs = getConfigs;
