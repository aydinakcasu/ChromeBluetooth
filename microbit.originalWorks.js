//https://makecode.microbit.org/_TVDUghHuMEMV

// https://ladvien.com/bluetooth-low-energy-javascript/

var microbit_Characteristic = null;

var aaa = {
    name: "",
    service: {
        name: "buttons",
        uuid: "e95d9882-251d-470a-a062-fa1922dfa9a8"
    },
    characteristics: [{
            name: "readButtonA",
            uuid: "e95dda90-251d-470a-a062-fa1922dfa9a8",
            read: function () {}
        },
        {
            name: "readButtonB",
            uuid: "e95dda91-251d-470a-a062-fa1922dfa9a8",
            read: function () {}
        }
    ]
};

function microbit_connect() {

    let serviceUuid = "e95d9882-251d-470a-a062-fa1922dfa9a8";
    let characteristicUuid = "e95dda91-251d-470a-a062-fa1922dfa9a8";

    navigator.bluetooth.requestDevice({
            filters: [{
                services: [serviceUuid]
            }],
            optionalServices: [serviceUuid]
        })

        .then(device => {
            return device.gatt.connect();
        })
        .then(server => {
            return server.getPrimaryService(serviceUuid);
        })
        .then(service => {
            service.getCharacteristic("e95dda90-251d-470a-a062-fa1922dfa9a8")
                .then(characteristic => {
                    return characteristic.startNotifications()
                        .then(_ => {
                            characteristic.addEventListener(
                                'characteristicvaluechanged',
                                function (event) {
                                    let value = event.target.value;
                                    var temp = value.getUint8(0);
                                    document.getElementById('microbit_valueA').value = temp;
                                    log(temp);
                                }
                            );
                        });
                });
            service.getCharacteristic("e95dda91-251d-470a-a062-fa1922dfa9a8")
                .then(characteristic => {
                    return characteristic.startNotifications()
                        .then(_ => {
                            characteristic.addEventListener(
                                'characteristicvaluechanged',
                                function (event) {
                                    let value = event.target.value;
                                    var temp = value.getUint8(0);
                                    document.getElementById('microbit_valueB').value = temp;
                                    log(temp);
                                }
                            );
                        });
                });
        })
        .catch(error => {
            log('Error! ' + error);
        });
}


function microbit_disconnect() {
    if (microbit_Characteristic) {
        microbit_Characteristic.stopNotifications()
            .then(_ => {
                microbit_Characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    hearRate_read);
            })
            .catch(error => {
                log('Error! ' + error);
            });
    }
}


/*
Readings from BLE Peripheral Simulator:
I think the byte values are wrong.  Need to shift by one more?
val  Actual   Expect
  0: 14, 84
  1:  0, 7f   80, 3f
00000000 01111111
10000000 00111111
  2:  0, 80   00, 40
  3: 40, 80   40, 40
 50: 48, 84   48  42
01001000 10000100
01001000 01000110

100: 48, 85   c8  42 
01001000 10000101     
11001000 01000010
200: 48, 86   48, 43

0, 0, 0,  0, 7f, 
0, 0, 0, 80, 3f, 
*/