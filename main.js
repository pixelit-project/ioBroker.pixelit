'use strict';

const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws');
let wsClient;
const adapterName = require('./package.json').name.split('.').pop();

class PixelIt extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        // Get Config
        const _pixelItAddress = this.config.address;

        // Check Server address
        if (!_pixelItAddress || _pixelItAddress === '') {
            this.log.warn('PixelIt address is not a valid, please check your settings!')
            return;
        }

        CreateDataPoints(this);

        wsClient = new WebSocket('ws://' + _pixelItAddress + ':81/dash');
        let _adapter = this;
        wsClient.on('message', function incoming(data) {
            let msgObj = JSON.parse(data);
            if (msgObj.ipAddress !== 'undefined') {
                _adapter.setStateAsync('config.ip', {
                    val: msgObj.ipAddress,
                    ack: true
                });
            }
            console.log(data);
        });
    }

    onUnload(callback) {
        try {
            callback();
        } catch (ex) {
            callback();
        }
    }
}

async function CreateDataPoints(adapter) {

    await adapter.setObjectNotExistsAsync('info.ip', {
        type: 'state',
        common: {
            name: 'IP-Address',
            type: 'string',
            role: 'info.ip',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.version', {
        type: 'state',
        common: {
            name: 'Version',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.sketchsize', {
        type: 'state',
        common: {
            name: 'Sketch Size',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.freesketchspace', {
        type: 'state',
        common: {
            name: 'Free Sketch Space',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.wifirssi', {
        type: 'state',
        common: {
            name: 'Wifi RSSI',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.wifiquality', {
        type: 'state',
        common: {
            name: 'Wifi Quality',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.wifissid', {
        type: 'state',
        common: {
            name: 'Wifi SSID',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.freeheap', {
        type: 'state',
        common: {
            name: 'Free Heap',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.chipid', {
        type: 'state',
        common: {
            name: 'Chip ID',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('info.cpufreq', {
        type: 'state',
        common: {
            name: 'CPU-Freq (MHz)',
            type: 'string',
            role: '',
            read: true,
            write: false,
        },
        native: {},
    });
}


if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}