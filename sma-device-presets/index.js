const fs = require('fs');
var sma_devices = {};

// read all devices presets from files in this directory and export them
// the file name will be used as key for the config object!
fs.readdirSync(__dirname + '/').forEach(function(file) {
    if (file.match(/\.json$/) !== null) {
        const devName = file.replace('.json', '');
        const devConfig = JSON.parse(fs.readFileSync(__dirname + '/' + file));
        sma_devices[devName] = devConfig;
    }
});

module.exports.obj = sma_devices;