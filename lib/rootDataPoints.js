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
                role: 'value',
                read: true,
                write: true,
            },
            native: {},
        }
    },
];

module.exports.rootDataPoints = RootDataPoints;