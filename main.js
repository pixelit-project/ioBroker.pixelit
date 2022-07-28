'use strict';

const utils = require('@iobroker/adapter-core');
const axios = require('axios');
const WebSocket = require('ws');
const adapterName = require('./package.json').name.split('.').pop();
const dataPointsFolders = require('./lib/dataPointsFolders').dataPointsFolders;
const infoDataPoints = require('./lib/infoDataPoints').infoDataPoints;
const sensorDataPoints = require('./lib/sensorDataPoints').sensorDataPoints;
const rootDataPoints = require('./lib/rootDataPoints').rootDataPoints;
const buttonsDataPoints = require('./lib/buttonsDataPoints').buttonsDataPoints;

let adapter;
let pixelItAddress;
let requestTimout;
let ws;
let ping;
let pingTimeout;
let autoRestartTimeout;
const wsHeartbeatIntervall = 10000;
const restartTimeout = 1000;
const apiURL = 'https://pixelit.bastelbunker.de/API/GetBMPByID/';

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

        // Check Server address
        if (!pixelItAddress || pixelItAddress === '') {
            this.log.warn('PixelIt address is not a valid, please check your settings!')
            return;
        }

        this.setStateChangedAsync('info.connection', false, true);

        // Create Folder and DataPoints
        await createFolderAndDataPoints();

        // Subscribe Message DataPoint
        this.subscribeStates('message');

        // Subscribe Extended Message DataPoint
        this.subscribeStates('ext_message');

        // Subscribe Brightness DataPoint
        this.subscribeStates('brightness');

        // Subscribe Brightness 255 DataPoint
        this.subscribeStates('brightness_255');

        // Subscribe Show Clock Button 
        this.subscribeStates('show_clock');

        // Start Websocket
        this.initWebsocket();
    }

    async onUnload(callback) {
        try {
            clearTimeout(requestTimout);
            this.clearTimeout(ping);
            this.clearTimeout(pingTimeout);
            this.clearTimeout(autoRestartTimeout);
            // Reset adapter connection
            this.setState('info.connection', false, true);
            callback();
        } catch (ex) {
            callback();
        }
    }

    async onStateChange(id, state) {
        this.log.debug(`onStateChange-> id:${id} state:${JSON.stringify(state)}`);

        // Ingore Message with ack=true 
        if (!state || (state.ack == true && !(state.from.startsWith('system.adapter.pixelit') && id.endsWith('.brightness_255')))) {
            this.log.debug(`onStateChange-> ack is true, change does not need to be processed!`);
            return;
        }

        let data;

        if (id.endsWith('.message')) {
            data = await createSimpleMessage(state.val);
        }
        else if (id.endsWith('.ext_message')) {
            try {
                data = JSON.parse(state.val);
                if (data.bitmap && data.bitmap.data) {
                    // If only a BMP Id is passed, the BMP Array must be retrieved via API
                    if (typeof data.bitmap.data == 'number') {
                        data.bitmap.data = (await getBMPArray(data.bitmap.data))[0];
                    }
                } else if (data.bitmapAnimation && data.bitmapAnimation.data) {
                    // If only a BMP Id is passed, the BMP Array must be retrieved via API
                    if (typeof data.bitmapAnimation.data == 'number') {
                        data.bitmapAnimation.data = await getBMPArray(data.bitmapAnimation.data);
                    }
                }
            } catch (err) {
                this.log.warn(`Cannot parse JSON from ext_message... ${state.val}`);
                return;
            }
        }
        else if (id.endsWith('.brightness')) {
            // Create reMap 
            const reMap = createRemap(0, 100, 0, 255);
            this.setStateChangedAsync(`${adapter.namespace}.brightness_255`, reMap(state.val), true);
            data = { brightness: reMap(state.val) };
        }
        else if (id.endsWith('.brightness_255')) {
            // Create reMap 
            const reMap = createRemap(0, 255, 0, 100);
            this.setStateChangedAsync(`${adapter.namespace}.brightness`, reMap(state.val), true);
            data = { brightness: state.val };
        }
        else if (id.endsWith('.show_clock')) {
            data = {
                clock: {
                    show: true,
                    switchAktiv: true,
                    withSeconds: false,
                    switchSec: 5
                }
            };
        }

        this.log.debug(`data ${JSON.stringify(data)}`);

        try {
            await axios.post('http://' + pixelItAddress + '/api/screen', data, axiosConfigToPixelIt);
            this.setStateChangedAsync(id, state.val, true);
        } catch (err) { }
    }

    async initWebsocket() {
        // Set websocket connection
        ws = new WebSocket(`ws://${pixelItAddress}:81`);

        // On error
        ws.on('error', (err) => {
            if (!err.message.includes('ETIMEDOUT') && !err.message.includes('EHOSTUNREACH')) {
                this.log.warn(err);
            }
        });

        // On connect
        ws.on('open', () => {
            this.log.debug('Websocket connectet');
            // Set connection state
            this.setState('info.connection', true, true);
            this.log.info('Connect to PixelIt over websocket.');
            // Send ping to server
            this.sendPingToServer();
            // Start Heartbeat
            this.wsHeartbeat();
        });

        // Incomming messages
        ws.on('message', async (message) => {
            this.log.debug(`Incomming message: ${message}`);
            const obj = JSON.parse(message);
            const objName = Object.keys(obj)[0];
            // No Logs
            if (objName != 'log') {
                setDataPoints(obj[objName]);
            }
        });

        // On Close
        ws.on('close', () => {
            this.setState('info.connection', false, true);
            this.log.debug('Websocket disconnectet');
            clearTimeout(ping);
            clearTimeout(pingTimeout);

            if (ws.readyState === WebSocket.CLOSED) {
                this.autoRestart();
            }
        });

        // Pong from Server
        ws.on('pong', () => {
            this.log.debug('Receive pong from server');
            this.wsHeartbeat();
        });
    }

    async sendPingToServer() {
        this.log.debug('Send ping to server');
        ws.ping('iobroker.pixelit');
        ping = setTimeout(() => {
            this.sendPingToServer();
        }, wsHeartbeatIntervall);
    }

    async wsHeartbeat() {
        clearTimeout(pingTimeout);
        pingTimeout = setTimeout(() => {
            this.log.debug('Websocked connection timed out');
            ws.terminate();
        }, wsHeartbeatIntervall + 1000);
    }

    async autoRestart() {
        this.log.debug(`Reconnect attempt in ${restartTimeout / 1000} seconds..`);
        autoRestartTimeout = setTimeout(() => {
            this.initWebsocket();
        }, restartTimeout);
    }
}

async function createSimpleMessage(input) {

    const inputArray = input.split(';');
    // 1 = text, 2 = text + text color, 3 = text + text color + image
    const countElements = inputArray.length;

    let data;

    if (countElements == 1) {
        data = await getTextJson(inputArray[0]);
    }
    if (countElements >= 2) {
        data = await getTextJson(inputArray[0], inputArray[1]);
    }
    if (countElements == 3) {
        const webBmp = await getBMPArray(inputArray[2]);

        data.bitmapAnimation = {
            data: webBmp,
            animationDelay: 200,
            rubberbanding: false,
            limitLoops: 0
        };
    }

    adapter.log.debug(`createSimpleMessage-> idata:${JSON.stringify(data)}`);
    return data;
}

async function createFolderAndDataPoints() {
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

    // Create Button DataPoints       
    for (let key in buttonsDataPoints) {
        await adapter.setObjectNotExistsAsync(buttonsDataPoints[key].pointName, buttonsDataPoints[key].point);
    };
}

async function setDataPoints(msgObj) {
    for (let key in msgObj) {
        let dataPoint = infoDataPoints.find(x => x.msgObjName === key);

        if (!dataPoint) {
            dataPoint = buttonsDataPoints.find(x => x.msgObjName === key);
        }

        if (!dataPoint) {
            dataPoint = sensorDataPoints.find(x => x.msgObjName === key);
        }

        if (!dataPoint) {
            dataPoint = rootDataPoints.find(x => x.msgObjName === key);
        }

        if (dataPoint) {
            if (['lux', 'wifiRSSI', 'wifiQuality', 'pressure'].indexOf(key) >= 0) {
                if (typeof value == 'number') {
                    msgObj[key] = Math.round(Number(msgObj[key]));
                }
            }
            adapter.setStateChangedAsync(dataPoint.pointName, {
                val: msgObj[key],
                ack: true
            });
        }
    }
}

async function getTextJson(text, rgb) {
    if (rgb) {
        rgb = rgb.split(',');
    } else {
        rgb = [255, 255, 255];
    }

    const data = {
        text: {
            textString: text,
            bigFont: false,
            scrollText: 'auto',
            scrollTextDelay: 50,
            centerText: false,
            position: {
                x: 8,
                y: 1
            },
            color: {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2]
            }
        }
    };

    return data;
}

async function getBMPArray(id) {
    let webBmp = [[64512, 0, 0, 0, 0, 0, 0, 64512, 0, 64512, 0, 0, 0, 0, 64512, 0, 0, 0, 64512, 0, 0, 64512, 0, 0, 0, 0, 0, 64512, 64512, 0, 0, 0, 0, 0, 0, 64512, 64512, 0, 0, 0, 0, 0, 64512, 0, 0, 64512, 0, 0, 0, 64512, 0, 0, 0, 0, 64512, 0, 64512, 0, 0, 0, 0, 0, 0, 64512]];

    // Check if id is cached
    if (bmpCache[id]) {
        adapter.log.debug(`Get BMP ${id} from cache`)
        // Get id from cache
        webBmp = bmpCache[id];
    } else {
        adapter.log.debug(`Get BMP ${id} from API`)

        try {
            // Get id from API
            let response = await axios.get(`${apiURL}${id}`, axiosConfigToPixelIt);

            if (response.data && response.data.id && response.data.id != 0) {
                webBmp = JSON.parse(`[${response.data.rgB565Array}]`);
                // Add id to cache
                bmpCache[id] = webBmp;
            }

        } catch (err) {
            adapter.log.error(err)
        }
    }

    return webBmp;
}

/**
 * Create a function that maps a value to a range
 * @param {Number} inMin Input range minimun value
 * @param {Number} inMax Input range maximun value
 * @param {Number} outMin Output range minimun value
 * @param {Number} outMax Output range maximun value
 * @return {function} A function that converts a value
 */
function createRemap(inMin, inMax, outMin, outMax) {
    return function remaper(x) {
        return Number(((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin).toFixed());
    };
}

if (module.parent) {
    module.exports = (options) => new PixelIt(options);
} else {
    new PixelIt();
}