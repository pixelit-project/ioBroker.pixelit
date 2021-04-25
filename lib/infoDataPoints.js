const InfoDataPoints = [

    {
        pointName: 'info.ip',
        msgObjName: 'ipAddress',
        point: {
            type: 'state',
            common: {
                name: 'IP-Address',
                type: 'string',
                role: 'info.ip',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.version',
        msgObjName: 'pixelitVersion',
        point: {
            type: 'state',
            common: {
                name: 'Version',
                type: 'string',
                role: 'text',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.sketchsize',
        msgObjName: 'sketchSize',
        point: {
            type: 'state',
            common: {
                name: 'Sketch Size',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.freesketchspace',
        msgObjName: 'freeSketchSpace',
        point: {
            type: 'state',
            common: {
                name: 'Free Sketch Space',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.wifirssi',
        msgObjName: 'wifiRSSI',
        point: {
            type: 'state',
            common: {
                name: 'Wifi RSSI',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.wifiquality',
        msgObjName: 'wifiQuality',
        point: {
            type: 'state',
            common: {
                name: 'Wifi Quality',
                type: 'number',
                role: 'vaule',
                unit: '%',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.freeheap',
        msgObjName: 'freeHeap',
        point: {
            type: 'state',
            common: {
                name: 'Free Heap',
                type: 'number',
                role: 'value',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.chipid',
        msgObjName: 'chipID',
        point: {
            type: 'state',
            common: {
                name: 'Chip ID',
                type: 'string',
                role: 'text',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'info.cpufreq',
        msgObjName: 'cpuFreqMHz',
        point: {
            type: 'state',
            common: {
                name: 'CPU-Freq',
                type: 'number',
                role: 'value',
                unit: 'MHz',
                read: true,
                write: false,
            },
            native: {},
        }
    },
];

module.exports.infoDataPoints = InfoDataPoints;