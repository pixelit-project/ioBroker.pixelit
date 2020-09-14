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
        for (let _key in infoDataPoints) {
            await this.setObjectNotExistsAsync(infoDataPoints[_key].pointName, infoDataPoints[_key].point);
        };

        // Create Sensor DataPoints       
        for (let _key in sensorDataPoints) {
            await this.setObjectNotExistsAsync(sensorDataPoints[_key].pointName, sensorDataPoints[_key].point);
        };

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

    wsClient.on('open', function () {
        WsHeartBeat();
    });

    wsClient.on('message', function (data) {
        WsHeartBeat();
        let msgObj = JSON.parse(data);

        for (let _key in msgObj) {
            let _dataPoint = infoDataPoints.find(x => x.msgObjName === _key);

            if (!_dataPoint) {
                _dataPoint = sensorDataPoints.find(x => x.msgObjName === _key);
            }

            if (_dataPoint) {
                adapter.setStateAsync(_dataPoint.pointName, {
                    val: msgObj[_key],
                    ack: true
                });
            }
        };
    });

    wsClient.on('close', function () {
        setTimeout(function () {
            WebSocketConnect();
        }, 1000);
    });

    wsClient.on('error', function () {
        wsClient.close();
    });
}

function WsHeartBeat() {
    clearTimeout(wsTimeout);
    wsTimeout = setTimeout(function () {
        wsClient.close();
    }, 10000);
}

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}