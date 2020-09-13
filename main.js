'use strict';

const utils = require('@iobroker/adapter-core');
const adapterName = require('./package.json').name.split('.').pop();

class Seq extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    onReady() {

        // Get Config
        const _serverUrl = this.config.address;

        // Check Server address
        if (!_serverUrl || _serverUrl === '' || !(_serverUrl.startsWith('http://') && _serverUrl.startsWith('http://'))) {
            this.log.warn('Server address is not a valid, please check your settings!')
            return;
        }
    }

    onUnload(callback) {
        try {
            callback();
        } catch (ex) {
            callback();
        }
    }
}

if (module.parent) {
    module.exports = (options) => new Seq(options);
} else {
    new Seq();
}