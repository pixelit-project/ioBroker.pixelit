const RootDataPoints = [

    {
        pointName: 'alive',
        msgObjName: 'adapterOnline',
        point: {
            type: 'state',
            common: {
                name: 'Alive',
                type: 'boolean',
                role: 'indicator.reachable',
                read: true,
                write: false,
            },
            native: {},
        }
    },

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
                role: 'value',
                read: true,
                write: true,
            },
            native: {},
        }
    },
];

module.exports.rootDataPoints = RootDataPoints;