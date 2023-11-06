const RootDataPoints = [
    {
        pointName: 'message',
        msgObjName: 'message',
        point: {
            type: 'state',
            common: {
                name: 'Simple Message',
                type: 'string',
                role: 'text',
                read: true,
                write: true,
                def: ''
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
                def: '{}'
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
                role: 'level.dimmer',
                read: true,
                write: true,
            },
            native: {},
        }
    },

    {
        pointName: 'brightness_255',
        msgObjName: 'currentMatrixBrightness',
        point: {
            type: 'state',
            common: {
                name: 'Brightness',
                type: 'number',
                min: 0,
                max: 255,
                role: 'level.dimmer',
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
    {
        pointName: 'sleep_mode',
        msgObjName: 'sleepMode',
        point: {
            type: 'state',
            common: {
                name: 'Sleep Mode',
                type: 'boolean',
                role: 'switch',
                read: true,
                write: true,
            },
            native: {},
        }
    },
];

module.exports.rootDataPoints = RootDataPoints;