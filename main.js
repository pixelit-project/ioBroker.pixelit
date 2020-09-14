'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios');
const adapterName = require('./package.json').name.split('.').pop();
const infoDataPoints = require('./lib/infoDataPoints').infoDataPoints;
const sensorDataPoints = require('./lib/sensorDataPoints').sensorDataPoints;
const rootDataPoints = require('./lib/rootDataPoints').rootDataPoints;

let adapter;
let pixelItAddress;
let timerInterval;
let requestTimout;

class PixelIt extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: adapterName,
        });

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));

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
        this.subscribeStates('message');
    }

    onUnload(callback) {
        try {
            clearTimeout(requestTimout);
            callback();
        } catch (ex) {
            callback();
        }
    }

    onStateChange(id, state) {
        this.log.debug(`stateID ${id} changed: ${state.val} (ack = ${state.ack})`);

        axios.post('http://' + pixelItAddress + '/api/screen', {
                // Test Data!!!!
                bitmapAnimation: {
                    data: [
                        [0, 0, 63384, 65535, 63384, 63384, 0, 0, 0, 65535, 65535, 65535, 63384, 65535, 65535, 0, 0, 63384, 65062, 65507, 65535, 44000, 0, 0, 0, 0, 65062, 65507, 62816, 44000, 55291, 55291, 0, 0, 65062, 65379, 62816, 44000, 0, 61438, 0, 0, 62816, 65252, 62816, 37696, 0, 65535, 0, 0, 54432, 60960, 54432, 37696, 55291, 0, 0, 0, 61438, 61438, 55291, 55291, 0, 0]
                    ],
                    animationDelay: 20, // Millisekunden
                    // [Optional]
                    rubberbanding: false, // [true | false]
                    // [Optional]
                    limitLoops: 0 // < 0 = No Limit >
                },
                text: {
                    textString: state.val,
                    bigFont: false, // [true | false]
                    scrollText: 'auto', // [ true | false | 'auto']
                    scrollTextDelay: 50, // [1 - 9999],                    
                    centerText: false, // [true | false],
                    position: {
                        x: 8,
                        y: 1
                    },
                    color: {
                        r: 255, // [0 - 255]
                        g: 255, // [0 - 255]
                        b: 255 // [0 - 255]   
                    }
                }
            }, {
                timeout: 1000
            }).then(function (response) {
                // adapter.setStateAsync(id, {
                //     ack: true
                // });
            })
            .catch(function (error) {
                // adapter.setStateAsync(id, {
                //     ack: false
                // });
            });
    }
}

async function RequestAndWriteData() {
    let adapterOnline = true;

    await axios.get('http://' + pixelItAddress + '/api/matrixinfo', {
            timeout: 1000
        }).then(function (response) {
            SetDataPoints(response.data);
        })
        .catch(function (error) {
            adapterOnline = false;
        });



    await axios.get('http://' + pixelItAddress + '/api/dhtsensor', {
            timeout: 1000
        }).then(function (response) {
            SetDataPoints(response.data);
        })
        .catch(function (error) {
            adapterOnline = false;
        });



    await axios.get('http://' + pixelItAddress + '/api/luxsensor', {
            timeout: 1000
        }).then(function (response) {
            SetDataPoints(response.data);
        })
        .catch(function (error) {
            adapterOnline = false;
        });

    SetDataPoints({
        adapterOnline: adapterOnline
    });

    clearTimeout(requestTimout);
    requestTimout = setTimeout(RequestAndWriteData, timerInterval);
}

function SetDataPoints(msgObj) {
    for (let _key in msgObj) {
        let _dataPoint = infoDataPoints.find(x => x.msgObjName === _key);

        if (!_dataPoint) {
            _dataPoint = sensorDataPoints.find(x => x.msgObjName === _key);
        }

        if (!_dataPoint) {
            _dataPoint = rootDataPoints.find(x => x.msgObjName === _key);
        }

        if (_dataPoint) {
            adapter.setStateAsync(_dataPoint.pointName, {
                val: msgObj[_key],
                ack: true
            });
        }
    }
}

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}