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
                name: 'Message',
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