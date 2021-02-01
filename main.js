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
const axiosConfigToPixelIt = {
    timeout: 3000,
    headers: {
        'User-Agent': 'ioBroker_PixelIt'
    }
};
// Init BMPCache
const bmpCache = [];

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

        this.setState('info.connection', false, true);

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

    async onUnload(callback) {
        try {
            clearTimeout(requestTimout);     
            adapter.setState('info.connection', false, true);   
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

        let data;

        if (id === adapter.namespace + '.message') {
            data = await CreateSimpleMessage(state.val);
        } else if (id === adapter.namespace + '.ext_message') {

            data = JSON.parse(state.val);

            if (data.bitmap && data.bitmap.data) {
                // If only a BMP Id is passed, the BMP Array must be retrieved via API
                if (typeof data.bitmap.data === 'number') {
                    data.bitmap.data = JSON.parse(await GetBMPArray(data.bitmap.data));
                }
            }
        }

        this.log.debug(`data ${JSON.stringify(data)}`);

        try {
            await axios.post('http://' + pixelItAddress + '/api/screen', data, axiosConfigToPixelIt);

            adapter.setStateAsync(id, {
                ack: true
            });

        } catch (err) {}
    }
}

async function CreateSimpleMessage(input) {

    let inputArray = input.split(';');
    // 1 = text, 2 = text + text color, 3 = text + text color + image
    let countElements = inputArray.length;

    //adapter.log.debug(`countElements ${countElements}`);

    let data;

    if (countElements === 1) {
        data = await GetTextJson(inputArray[0]);
    }
    if (countElements >= 2) {
        data = await GetTextJson(inputArray[0], inputArray[1]);
    }
    if (countElements >= 3) {
        let webBmp = await GetBMPArray(inputArray[2]);

        data += `,"bitmapAnimation": {
                    "data": [${webBmp}],
                    "animationDelay": 200,  
                    "rubberbanding": false, 
                    "limitLoops": 0
                }`;
    }
    data = '{' + data + '}';
    return JSON.parse(data);
}

async function CreateFolderAndDataPoints() {
    // Create DataPoints Folders
    for (let key in dataPointsFolders) {
        await adapter.setObjectNotExistsAsync(dataPointsFolders[key].pointName, dataPointsFolders[key].point);
    };

    // Create Root DataPoints       
    for (let key in rootDataPoints) {
        await adapter.setObjectNotExistsAsync(rootDataPoints[key].pointName, rootDataPoints[key].point);
    };

    // Create Info DataPoints   
    for (let key in infoDataPoints) {
        await adapter.setObjectNotExistsAsync(infoDataPoints[key].pointName, infoDataPoints[key].point);
    };

    // Create Sensor DataPoints       
    for (let key in sensorDataPoints) {
        await adapter.setObjectNotExistsAsync(sensorDataPoints[key].pointName, sensorDataPoints[key].point);
    };
}

async function RequestAndWriteData() {
    let adapterOnline = true;

    try {
        const responses = await axios.all([
            // Get MatrixInfo
            axios.get('http://' + pixelItAddress + '/api/matrixinfo', axiosConfigToPixelIt),
            // Get DHTSensor
            axios.get('http://' + pixelItAddress + '/api/dhtsensor', axiosConfigToPixelIt),
            // Get LuxSensor
            axios.get('http://' + pixelItAddress + '/api/luxsensor', axiosConfigToPixelIt)
        ]);

        // Set DataPoints
        for (var key in responses) {
            SetDataPoints(responses[key].data);
        }        
    } catch (err) {
        adapterOnline = false;
    }

    // Set Alive DataPoint
    this.setState('info.connection', adapterOnline, true);

    clearTimeout(requestTimout);
    requestTimout = setTimeout(RequestAndWriteData, timerInterval);
}

async function SetDataPoints(msgObj) {
    for (let key in msgObj) {
        let dataPoint = infoDataPoints.find(x => x.msgObjName === key);

        if (!dataPoint) {
            dataPoint = sensorDataPoints.find(x => x.msgObjName === key);
        }

        if (!dataPoint) {
            dataPoint = rootDataPoints.find(x => x.msgObjName === key);
        }

        if (dataPoint) {
            adapter.setStateAsync(dataPoint.pointName, {
                val: msgObj[key],
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