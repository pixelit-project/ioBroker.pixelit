'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios');
const adapterName = require('./package.json').name.split('.').pop();
const infoDataPoints = require('./lib/infoDataPoints').infoDataPoints;
const sensorDataPoints = require('./lib/sensorDataPoints').sensorDataPoints;
const rootDataPoints = require('./lib/rootDataPoints').rootDataPoints;

let pixelItAddress;
let timerInterval;
let requestTimout;
let adapter;


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
        adapter = this;

        // Get Config
        pixelItAddress = this.config.address;
        timerInterval = 5000;

        // Check Server address
        if (!pixelItAddress || pixelItAddress === '') {
            this.log.warn('PixelIt address is not a valid, please check your settings!')
            return;
        }

        // Create Root DataPoints       
        for (let _key in rootDataPoints) {
            await this.setObjectNotExistsAsync(rootDataPoints[_key].pointName, rootDataPoints[_key].point);
        };

        // Create Info DataPoints   
        for (let _key in infoDataPoints) {
            await this.setObjectNotExistsAsync(infoDataPoints[_key].pointName, infoDataPoints[_key].point);
        };

        // Create Sensor DataPoints       
        for (let _key in sensorDataPoints) {
            await this.setObjectNotExistsAsync(sensorDataPoints[_key].pointName, sensorDataPoints[_key].point);
        };

        RequestAndWriteData();
    }

    onUnload(callback) {
        try {
            clearTimeout(requestTimout);
            callback();
        } catch (ex) {
            callback();
        }
    }
}

async function RequestAndWriteData() {
    let adapterOnline = true;

    let response = await axios.get('http://' + pixelItAddress + '/api/matrixinfo')
        .catch(function (error) {
            adapterOnline = false;
        });

    await SetDataPoints(adapter, response.data);

    response = await axios.get('http://' + pixelItAddress + '/api/dhtsensor')
        .catch(function (error) {
            adapterOnline = false;
        });

    await SetDataPoints(adapter, response.data);

    response = await axios.get('http://' + pixelItAddress + '/api/luxsensor')
        .catch(function (error) {
            adapterOnline = false;
        });

    await SetDataPoints(adapter, response.data);

    SetDataPoints(adapter, {
        adapterOnline: adapterOnline
    });

    clearTimeout(requestTimout);
    requestTimout = setTimeout(RequestAndWriteData, timerInterval);
}

async function SetDataPoints(adapter, msgObj) {
    for (let _key in msgObj) {
        let _dataPoint = infoDataPoints.find(x => x.msgObjName === _key);

        if (!_dataPoint) {
            _dataPoint = sensorDataPoints.find(x => x.msgObjName === _key);
        }

        if (!_dataPoint) {
            _dataPoint = rootDataPoints.find(x => x.msgObjName === _key);
        }

        if (_dataPoint) {
            let oldState = await adapter.getState(_dataPoint.pointName, (err, state) => {
                return state.val;
            });

            adapter.log.debug(JSON.stringify(oldState));
            if (oldState !== msgObj[_key]) {
                adapter.setStateAsync(_dataPoint.pointName, {
                    val: msgObj[_key],
                    ack: true
                });
            }
        }
    }
}

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}