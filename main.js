'use strict';

const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws');
const adapterName = require('./package.json').name.split('.').pop();
const infoDataPoints = require('./lib/infoDataPoints').infoDataPoints;
const sensorDataPoints = require('./lib/sensorDataPoints').sensorDataPoints;

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

        // Create Info DataPoints
        infoDataPoints.forEach(x => {
            await adapter.setObjectNotExistsAsync(x.pointName, x.point);
        });

        // Create Sensor DataPoints
        sensorDataPoints.forEach(x => {
            await adapter.setObjectNotExistsAsync(x.pointName, x.point);
        });



        WebSocketConnect(_pixelItAddress, _adapter);
    }

    onUnload(callback) {
        try {
            clearTimeout(wsTimeout);
            callback();
        } catch (ex) {
            callback();
        }
    }
}

function WebSocketConnect(pixelItAddress, adapter) {
    wsClient = new WebSocket('ws://' + pixelItAddress + ':81/dash');

    wsClient.on('open', function() {
        WsHeartBeat();
    });

    wsClient.on('message', function(data) {
        WsHeartBeat();
        let msgObj = JSON.parse(data);

        Object.keys(msgObj).forEach(x => {

            let _dataPoint = infoDataPoints.find(x => x.msgObjName === x);

            if (!_dataPoint) {
                _dataPoint = sensorDataPoints.find(x => x.msgObjName === x);
            }

            if (!_dataPoint) {
                adapter.setStateAsync(_dataPoint.pointName, {
                    val: msgObj[x],
                    ack: true
                });
            }
        });
    });

    wsClient.on('close', function() {
        setTimeout(function() {
            WebSocketConnect();
        }, 1000);
    });

    wsClient.on('error', function() {
        wsClient.close();
    });
}

function WsHeartBeat() {
    clearTimeout(wsTimeout);
    wsTimeout = setTimeout(function() {
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

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}