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
            SetDataPoints({
                adapterOnline: false
            });
            callback();
        } catch (ex) {
            callback();
        }
    }

    async onStateChange(id, state) {
        this.log.debug(`stateID ${id} changed: ${state.val} (ack = ${state.ack})`);

        if (!state || state.ack) {
            return;
        }

        let inputArray = state.val.split(';');

        // 1 = text, 2 = text + text color, 3 = text + text color + image
        let _countElements = inputArray.length;

        this.log.debug(`_countElements ${_countElements}`);

        let _data;

        if (_countElements === 1) {
            _data = await Text(inputArray[0]);
        }
        if (_countElements >= 2) {
            _data = await Text(inputArray[0], inputArray[1]);
        }
        if (_countElements >= 3) {
            _data += await BMP(inputArray[2]);
        }

        this.log.debug(`_data ${_data}`);

        try {
            await axios.post('http://' + pixelItAddress + '/api/screen', JSON.parse('{' + _data + '}'), {
                timeout: 1000
            });

            adapter.setStateAsync(id, {
                ack: true
            });

        } catch (err) {}
    }
}

async function RequestAndWriteData() {
    let adapterOnline = true;
    try {
        let _matrixinfo = await axios.get('http://' + pixelItAddress + '/api/matrixinfo', {
            timeout: 1000
        });

        let _dhtsensor = await axios.get('http://' + pixelItAddress + '/api/dhtsensor', {
            timeout: 1000
        });

        let _luxsensor = await axios.get('http://' + pixelItAddress + '/api/luxsensor', {
            timeout: 1000
        });

        SetDataPoints(_matrixinfo.data);
        SetDataPoints(_dhtsensor.data);
        SetDataPoints(_luxsensor.data);
    } catch (err) {
        adapterOnline = false;
    }

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

async function Text(text, rgb) {
    if (rgb) {
        rgb = rgb.split(',');
    } else {
        rgb = [255, 255, 255];
    }

    return `"text": { 
        "textString": "${text}", 
        "bigFont": false,
        "scrollText": "auto", 
        "scrollTextDelay": 50,                   
        "centerText": false, 
        "position": {
            "x": 8,
            "y": 1
        },
        "color": {
            "r": ${rgb[0]}, 
            "g": ${rgb[1]},
            "b": ${rgb[2]} 
        }
    }`;
}

async function BMP(id) {
    let webBmp = '[64512,0,0,0,0,0,0,64512,0,64512,0,0,0,0,64512,0,0,0,64512,0,0,64512,0,0,0,0,0,64512,64512,0,0,0,0,0,0,64512,64512,0,0,0,0,0,64512,0,0,64512,0,0,0,64512,0,0,0,0,64512,0,64512,0,0,0,0,0,0,64512]';

    await axios.get('https://pixelit.bastelbunker.de/API/GetBMPByID/' + id, {
            timeout: 1000,
            headers: {
                'User-Agent': 'ioBroker_PixelIt'
            }
        }).then(function (response) {
            if (response.data && response.data.id && response.data.id != 0) {
                webBmp = response.data.rgB565Array;
            }
        })
        .catch(function (error) {});

    return `,"bitmapAnimation": {
        "data": [${webBmp}],
        "animationDelay": 200,  
        "rubberbanding": false, 
        "limitLoops": 0
    }`;
}

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}