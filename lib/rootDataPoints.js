const RootDataPoints = [ 
    {
        pointName: 'message',
        msgObjName: 'message',
        point: {
            type: 'state',
            common: {
                name: 'Simple Message',
                type: 'string',
                role: 'value',
                read: true,
                write: true,
            },
            native: {},
        }
    },

    {
        pointName: 'ext_message',
        msgObjName: 'ext_message',
        point: {
            type: 'state',
            common: {
                name: 'Extended Message',
                type: 'string',
                role: 'json',
                read: true,
                write: true,
            },
            native: {},
        }
    },

    {
        pointName: 'brightness',
        msgObjName: 'brightness',
        point: {
            type: 'state',
            common: {
                name: 'Brightness',
                type: 'number',
                min: 0,
                max: 100,
                unit: '%',
                role: 'value',
                read: true,
                write: true,
            },
            native: {},
        }
    },

    {
        pointName: 'brightness_255',
        msgObjName: 'brightness_255',
        point: {
            type: 'state',
            common: {
                name: 'Brightness',
                type: 'number',
                min: 0,
                max: 255,
                role: 'value',
                read: true,
                write: true,
            },
            native: {},
        }
    },

    {
        pointName: 'show_clock',
        msgObjName: 'show_clock',
        point: {
            type: 'state',
            common: {
                name: 'Show Clock',
                type: 'boolean',
                role: 'button',
                read: true,
                write: true,
            },
            native: {},
        }
    },
];

module.exports.rootDataPoints = RootDataPoints;