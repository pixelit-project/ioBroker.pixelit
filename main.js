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

        this.subscribeStates('message');

        this.RequestAndWriteData();
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
                'text': {
                    'textString': state.val,
                    'bigFont': false, // [true | false]
                    'scrollText': false, // [ true | false | 'auto']
                    'scrollTextDelay': 20, // [1 - 9999],                    
                    'centerText': true, // [true | false],
                    'position': {
                        'x': 8,
                        'y': 1
                    },
                    'color': {
                        'r': 255, // [0 - 255]
                        'g': 255, // [0 - 255]
                        'b': 255 // [0 - 255]   
                    }
                }
            }, {
                timeout: 300
            }).then(function (response) {
                this.setStateAsync(id, {
                    ack: true
                });
            })
            .catch(function (error) {
                this.setStateAsync(id, {
                    ack: false
                });
            });
    }

    async RequestAndWriteData() {
        let adapterOnline = true;

        await axios.get('http://' + pixelItAddress + '/api/matrixinfo', {
                timeout: 300
            }).then(function (response) {
                this.SetDataPoints(response.data);
            })
            .catch(function (error) {
                adapterOnline = false;
            });



        await axios.get('http://' + pixelItAddress + '/api/dhtsensor', {
                timeout: 300
            }).then(function (response) {
                this.SetDataPoints(response.data);
            })
            .catch(function (error) {
                adapterOnline = false;
            });



        await axios.get('http://' + pixelItAddress + '/api/luxsensor', {
                timeout: 300
            }).then(function (response) {
                this.SetDataPoints(response.data);
            })
            .catch(function (error) {
                adapterOnline = false;
            });

        this.SetDataPoints({
            adapterOnline: adapterOnline
        });

        clearTimeout(requestTimout);
        requestTimout = setTimeout(this.RequestAndWriteData, timerInterval);
    }

    async SetDataPoints(msgObj) {
        for (let _key in msgObj) {
            let _dataPoint = infoDataPoints.find(x => x.msgObjName === _key);

            if (!_dataPoint) {
                _dataPoint = sensorDataPoints.find(x => x.msgObjName === _key);
            }

            if (!_dataPoint) {
                _dataPoint = rootDataPoints.find(x => x.msgObjName === _key);
            }

            if (_dataPoint) {
                this.setStateAsync(_dataPoint.pointName, {
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