const fs = require('fs');
let sma_device_list = {};
let sma_device_configs = {};

// read all device presets from files in this directory and export them
// the file name will be used as key for the config object!
function updateDeviceList() {
    fs.readdirSync(__dirname + '/').forEach(function(file) {
        if (file.match(/\.json$/) !== null) {
            const devName = file.replace('.json', '');
            const devConfig = JSON.parse(fs.readFileSync(__dirname + '/' + file));
            sma_device_list[devName] = devConfig.name;
            sma_device_configs[devName] = devConfig.config;
        }
    });
}

function getDeviceConfigs() {
    return sma_device_configs;
}

function getDeviceList() {
    return sma_device_list;
}

// initial call to load configs when node loads
updateDeviceList();

module.exports.getDeviceList = getDeviceList;
module.exports.getDeviceConfigs = getDeviceConfigs;
//export function for future use (e.g. load new configs without restarting the node)
module.exports.updateDeviceList = updateDeviceList;
