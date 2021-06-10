const SensorDataPoints = [

    {
        pointName: 'sensor.luminance',
        msgObjName: 'lux',
        point: {
            type: 'state',
            common: {
                name: 'Luminance',
                type: 'number',
                role: 'value.brightness',
                unit: 'lux',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'sensor.humidity',
        msgObjName: 'humidity',
        point: {
            type: 'state',
            common: {
                name: 'Humidity',
                type: 'number',
                role: 'value.humidity',
                unit: '%',
                min: 0,
                max: 100,
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'sensor.temperature',
        msgObjName: 'temperature',
        point: {
            type: 'state',
            common: {
                name: 'Temperature (°C)',
                type: 'number',
                role: 'value.temperature',
                unit: '°C',
                read: true,
                write: false,
            },
            native: {},
        }
    },

    {
        pointName: 'sensor.pressure',
        msgObjName: 'pressure',
        point: {
            type: 'state',
            common: {
                name: 'Pressure (hPa)',
                type: 'number',
                role: 'value.pressure',
                unit: 'hPa',
                read: true,
                write: false,
            },
            native: {},
        }
    },
];

module.exports.sensorDataPoints = SensorDataPoints;