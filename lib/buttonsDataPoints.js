const ButtonsDataPoints = [

    {
        pointName: 'buttons.left_button',
        msgObjName: 'leftButton',
        point: {
            type: 'state',
            common: {
                name: 'Button state',
                type: 'boolean',
                role: 'value.state',
                unit: '',
                read: true,
                write: false,
            },
            native: {},
        }
    },
    {
        pointName: 'buttons.middle_button',
        msgObjName: 'middleButton',
        point: {
            type: 'state',
            common: {
                name: 'Button state',
                type: 'boolean',
                role: 'value.state',
                unit: '',
                read: true,
                write: false,
            },
            native: {},
        }
    },
    {
        pointName: 'buttons.right_button',
        msgObjName: 'rightButton',
        point: {
            type: 'state',
            common: {
                name: 'Button state',
                type: 'boolean',
                role: 'value.state',
                unit: '',
                read: true,
                write: false,
            },
            native: {},
        }
    },


];

module.exports.buttonsDataPoints = ButtonsDataPoints;