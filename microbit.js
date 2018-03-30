//https://makecode.microbit.org/_TVDUghHuMEMV
// NEED LightBlue App.
// https://ladvien.com/bluetooth-low-energy-javascript/
// https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html


var microbit_Characteristic = null;

var microbit_buttons = {
    name: "buttons",
    service: {
        name: "buttons",
        uuid: "e95d9882-251d-470a-a062-fa1922dfa9a8"
    },
    characteristics: [{
            name: "readButtonA",
            uuid: "e95dda90-251d-470a-a062-fa1922dfa9a8",
            read: function (value) {
                var button = value.getUint8(0);
                document.getElementById('microbit_valueA').value = button;
                log(button);
            }
        },
        {
            name: "readButtonB",
            uuid: "e95dda91-251d-470a-a062-fa1922dfa9a8",
            read: function (value) {
                var button = value.getUint8(0);
                document.getElementById('microbit_valueB').value = button;
                log(button);
            }
        }
    ]
};

function readDataViewDump(data) {
    var ret = "";
    for (var i = 0; i < data.byteLength; i++) {
        ret += data.getUint8(i).toString(16) + ", ";
    }
    return ret;
}

var microbit_accelerometer = {
    name: "accelerometer",
    service: {
        name: "accelerometer",
        uuid: "e95d0753-251d-470a-a062-fa1922dfa9a8"
    },
    characteristics: [{
            name: "accelerometerData",
            uuid: "e95dca4b-251d-470a-a062-fa1922dfa9a8",
            read: function (value) {
                readDataViewDump(value);
                var endian = true;
                var x = document.getElementById('microbit_valueAccX').value = value.getInt16(0, endian)/1000;
                var y = document.getElementById('microbit_valueAccY').value = value.getInt16(2, endian)/1000;
                var z = document.getElementById('microbit_valueAccZ').value = value.getInt16(4, endian)/1000;
                var g = document.getElementById('microbit_valueAccG').value = (x ** 2 + y ** 2 + z ** 2)
                    .toLocaleString();
                log(g);
            }
        }
        // ,
        // {
        //     name: "accelerometerPeriod",
        //     uuid: "e95dfb24-251d-470a-a062-fa1922dfa9a8",
        //     read: function (value) {
        //         readDataViewDump(value);
        //         var button = value.getUint8(0);
        //         document.getElementById('microbit_valueB').value = button;
        //     }
        // }
    ]
};

function processBluetoothServer(server, serviceData) {
    server.getPrimaryService(serviceData.service.uuid)
        .then(service => {
            for (var i = 0; i < serviceData.characteristics.length; i++) {
                var characteristicData = serviceData.characteristics[i];
                (function (characteristicData) {
                    service.getCharacteristic(characteristicData.uuid)
                        .then(characteristic => {
                            return characteristic.startNotifications()
                                .then(_ => {
                                    characteristic.addEventListener(
                                        'characteristicvaluechanged',
                                        function (event) {
                                            let value = event.target.value;
                                            characteristicData.read(value);
                                        }
                                    );
                                });
                        });
                })(characteristicData);
            }
        })
}

function microbit_connect() {
    var serviceData = microbit_buttons;
    //var serviceData =  microbit_accelerometer;

    var serviceUuid = serviceData.service.uuid;

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
            processBluetoothServer(server, serviceData);
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