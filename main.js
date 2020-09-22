'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios');
const adapterName = require('./package.json').name.split('.').pop();
const dataPointsFolders = require('./lib/dataPointsFolders').dataPointsFolders;
const infoDataPoints = require('./lib/infoDataPoints').infoDataPoints;
const sensorDataPoints = require('./lib/sensorDataPoints').sensorDataPoints;
const rootDataPoints = require('./lib/rootDataPoints').rootDataPoints;

let adapter;
let pixelItAddress;
let timerInterval;
let requestTimout;
// Set axios Timeout 
let axiosConfigToPixelIt = {
    timeout: 3000,
    headers: {
        'User-Agent': 'ioBroker_PixelIt'
    }
};
// Init BMPCache
let bmpCache = new Array();

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
        pixelItAddress = this.config.ip;
        timerInterval = this.config.pollinterval;

        // Check Server address
        if (!pixelItAddress || pixelItAddress === '') {
            this.log.warn('PixelIt address is not a valid, please check your settings!')
            return;
        }

        // Check TimerInterval
        if (!timerInterval || timerInterval === '') {
            this.log.warn('PixelIt polling interval not set, please check your settings!')
            return;
        }

        // Seconds to milliseconds
        timerInterval = timerInterval * 1000;

        // Create Folder and DataPoints
        CreateFolderAndDataPoints();

        // Request Data and write to DataPoints 
        RequestAndWriteData();

        // Subscribe Message DataPoint
        this.subscribeStates('message');

        // Subscribe Extended Message DataPoint
        this.subscribeStates('ext_message');
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

        // Ingore Message with ack=true 
        if (!state || state.ack) {
            return;
        }

        let _data;

        if (id === adapter.namespace + '.message') {
            _data = await CreateSimpleMessage(state.val);
        } else if (id === adapter.namespace + '.ext_message') {

            _data = JSON.parse(state.val);

            if (_data.bitmap && _data.bitmap.data) {
                // If only a BMP Id is passed, the BMP Array must be retrieved via API
                if (typeof _data.bitmap.data === 'number') {
                    _data.bitmap.data = JSON.parse(await GetBMPArray(_data.bitmap.data));
                }
            }
        }

        this.log.debug(`_data ${JSON.stringify(_data)}`);

        try {
            await axios.post('http://' + pixelItAddress + '/api/screen', _data, axiosConfigToPixelIt);

            adapter.setStateAsync(id, {
                ack: true
            });

        } catch (err) {}
    }
}

async function CreateSimpleMessage(input) {

    let inputArray = input.split(';');
    // 1 = text, 2 = text + text color, 3 = text + text color + image
    let _countElements = inputArray.length;

    adapter.log.debug(`_countElements ${_countElements}`);

    let _data;

    if (_countElements === 1) {
        _data = await GetTextJson(inputArray[0]);
    }
    if (_countElements >= 2) {
        _data = await GetTextJson(inputArray[0], inputArray[1]);
    }
    if (_countElements >= 3) {
        let _webBmp = await GetBMPArray(inputArray[2]);

        _data += `,"bitmapAnimation": {
                    "data": [${_webBmp}],
                    "animationDelay": 200,  
                    "rubberbanding": false, 
                    "limitLoops": 0
                }`;
    }
    _data = '{' + _data + '}';
    return JSON.parse(_data);
}

async function CreateFolderAndDataPoints() {
    // Create DataPoints Folders
    for (let _key in dataPointsFolders) {
        await adapter.setObjectNotExistsAsync(dataPointsFolders[_key].pointName, dataPointsFolders[_key].point);
    };

    // Create Root DataPoints       
    for (let _key in rootDataPoints) {
        await adapter.setObjectNotExistsAsync(rootDataPoints[_key].pointName, rootDataPoints[_key].point);
    };

    // Create Info DataPoints   
    for (let _key in infoDataPoints) {
        await adapter.setObjectNotExistsAsync(infoDataPoints[_key].pointName, infoDataPoints[_key].point);
    };

    // Create Sensor DataPoints       
    for (let _key in sensorDataPoints) {
        await adapter.setObjectNotExistsAsync(sensorDataPoints[_key].pointName, sensorDataPoints[_key].point);
    };
}

async function RequestAndWriteData() {
    let _adapterOnline = true;

    try {
        // Get MatrixInfo
        let _matrixinfo = await axios.get('http://' + pixelItAddress + '/api/matrixinfo', axiosConfigToPixelIt);
        // Get DHTSensor
        let _dhtsensor = await axios.get('http://' + pixelItAddress + '/api/dhtsensor', axiosConfigToPixelIt);
        // Get LuxSensor
        let _luxsensor = await axios.get('http://' + pixelItAddress + '/api/luxsensor', axiosConfigToPixelIt);

        // Set DataPoints
        SetDataPoints(_matrixinfo.data);
        SetDataPoints(_dhtsensor.data);
        SetDataPoints(_luxsensor.data);
    } catch (err) {
        _adapterOnline = false;
    }

    // Set Alive DataPoint
    SetDataPoints({
        adapterOnline: _adapterOnline
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

async function GetTextJson(text, rgb) {
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

async function GetBMPArray(id) {
    let webBmp = '[64512,0,0,0,0,0,0,64512,0,64512,0,0,0,0,64512,0,0,0,64512,0,0,64512,0,0,0,0,0,64512,64512,0,0,0,0,0,0,64512,64512,0,0,0,0,0,64512,0,0,64512,0,0,0,64512,0,0,0,0,64512,0,64512,0,0,0,0,0,0,64512]';

    // Check if id is cached
    if (bmpCache[id]) {
        adapter.log.debug(`Get BMP ${id} from cache`)
        // Get id from cache
        webBmp = bmpCache[id];
    } else {
        adapter.log.debug(`Get BMP ${id} from API`)

        try {
            // Get id from API
            let response = await axios.get('https://pixelit.bastelbunker.de/API/GetBMPByID/' + id, axiosConfigToPixelIt);

            if (response.data && response.data.id && response.data.id != 0) {
                webBmp = response.data.rgB565Array;
                // Add id to cache
                bmpCache[id] = webBmp;
            }

        } catch (err) {
            adapter.log.error(err)
        }
    }

    return webBmp;
}

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}