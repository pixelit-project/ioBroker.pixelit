'use strict';

const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws');
const adapterName = require('./package.json').name.split('.').pop();

let wsClient;
let wsTimeout;


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
        let _adapter = this;

        // Get Config
        const _pixelItAddress = this.config.address;

        // Check Server address
        if (!_pixelItAddress || _pixelItAddress === '') {
            this.log.warn('PixelIt address is not a valid, please check your settings!')
            return;
        }

        await CreateInfoDataPoints(this);
        await CreateSensorDataPoints(this);

        WebSocketConnect(_pixelItAddress, _adapter);
    }

    onUnload(callback) {
        try {
            callback();
        } catch (ex) {
            callback();
        }
    }
}

function WebSocketConnect(pixelItAddress, adapter) {
    wsClient = new WebSocket('ws://' + pixelItAddress + ':81/dash');

    wsClient.on('open', function open() {
        WsHeartBeat();
    });

    wsClient.on('message', function incoming(data) {
        let msgObj = JSON.parse(data);
        WsHeartBeat();
        SetInfoDataPoints(adapter, msgObj);
        SetSensorDataPoints(adapter, msgObj);
    });

    wsClient.on('close', function (e) {
        setTimeout(function () {
            WebSocketConnect();
        }, 1000);
    });

    wsClient.on('error', function (err) {
        wsClient.close();
    });
}

function WsHeartBeat() {
    clearTimeout(wsClient);
    wsTimeout = setTimeout(function () {
        wsClient.close();
    }, 10000);
}

function SetSensorDataPoints(adapter, msgObj) {
    if (msgObj.lux) {
        adapter.setStateAsync('sensor.luminance', {
            val: msgObj.lux,
            ack: true
        });
    }

    if (msgObj.humidity) {
        adapter.setStateAsync('sensor.humidity', {
            val: msgObj.humidity,
            ack: true
        });
    }

    if (msgObj.temperature) {
        adapter.setStateAsync('sensor.temperature', {
            val: msgObj.temperature,
            ack: true
        });
    }
}

function SetInfoDataPoints(adapter, msgObj) {
    if (msgObj.ipAddress) {
        adapter.setStateAsync('info.ip', {
            val: msgObj.ipAddress,
            ack: true
        });
    }

    if (msgObj.pixelitVersion) {
        adapter.setStateAsync('info.version', {
            val: msgObj.pixelitVersion,
            ack: true
        });
    }

    if (msgObj.sketchSize) {
        adapter.setStateAsync('info.sketchsize', {
            val: msgObj.sketchSize,
            ack: true
        });
    }


    if (msgObj.freeSketchSpace) {
        adapter.setStateAsync('info.freesketchspace', {
            val: msgObj.freeSketchSpace,
            ack: true
        });
    }

    if (msgObj.wifiRSSI) {
        adapter.setStateAsync('info.wifirssi', {
            val: msgObj.wifiRSSI,
            ack: true
        });
    }

    if (msgObj.wifiQuality) {
        adapter.setStateAsync('info.wifiquality', {
            val: msgObj.wifiQuality,
            ack: true
        });
    }

    if (msgObj.wifiSSID) {
        adapter.setStateAsync('info.wifissid', {
            val: msgObj.wifiSSID,
            ack: true
        });
    }

    if (msgObj.freeHeap) {
        adapter.setStateAsync('info.freeheap', {
            val: msgObj.freeHeap,
            ack: true
        });
    }

    if (msgObj.cpuFreqMHz) {
        adapter.setStateAsync('info.cpufreq', {
            val: msgObj.cpuFreqMHz,
            ack: true
        });
    }

    if (msgObj.chipID) {
        adapter.setStateAsync('info.chipid', {
            val: msgObj.chipID,
            ack: true
        });
    }
}

async function CreateInfoDataPoints(adapter) {

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
            type: 'number',
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
            type: 'number',
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
            type: 'number',
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
            type: 'number',
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
            name: 'CPU-Freq',
            type: 'number',
            role: '',
            unit: 'MHz',
            read: true,
            write: false,
        },
        native: {},
    });
}

async function CreateSensorDataPoints(adapter) {

    await adapter.setObjectNotExistsAsync('sensor.luminance', {
        type: 'state',
        common: {
            name: 'Luminance (Lux)',
            type: 'number',
            role: 'value.brightness',
            unit: 'lux',
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('sensor.humidity', {
        type: 'state',
        common: {
            name: 'Humidity',
            type: 'number',
            role: 'value.humidity',
            unit: '%',
            min: 0,
            max: 100,
            read: true,
            write: false,
        },
        native: {},
    });

    await adapter.setObjectNotExistsAsync('sensor.temperature', {
        type: 'state',
        common: {
            name: 'Temperature (°C)',
            type: 'number',
            role: 'value.temperature',
            unit: '°C',
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