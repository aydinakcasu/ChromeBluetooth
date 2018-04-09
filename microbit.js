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
            var x = document.getElementById('microbit_valueAccX').value = value.getInt16(0, endian) / 1000;
            var y = document.getElementById('microbit_valueAccY').value = value.getInt16(2, endian) / 1000;
            var z = document.getElementById('microbit_valueAccZ').value = value.getInt16(4, endian) / 1000;
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

var microbit_magnetometer = {  // Doesn't seem to work.  Does it need to be calibrated?
    name: "magnetometer",
    service: {
        name: "magnetometer",
        uuid: "e95df2d8-251d-470a-a062-fa1922dfa9a8"
    },
    characteristics: [{
        name: "magnetometerData",
        uuid: "e95dfb11-251d-470a-a062-fa1922dfa9a8",
        read: function (value) {
            alert('aaaa')
            debugger;
            readDataViewDump(value);
            var endian = true;
            var x = document.getElementById('microbit_magnetAccX').value = value.getInt16(0, endian) / 1000;
            var y = document.getElementById('microbit_magnetAccY').value = value.getInt16(2, endian) / 1000;
            var z = document.getElementById('microbit_magnetAccZ').value = value.getInt16(4, endian) / 1000;
            var g = document.getElementById('microbit_magnetAccG').value = (x ** 2 + y ** 2 + z ** 2)
                .toLocaleString();
            log(g);
        }
    }
    ]
};

var microbit_temperature = {  // Doesn't seem to work.  Does it need to be calibrated?
    name: "temperature",
    service: {
        name: "temperature",
        uuid: "E95D6100-251D-470A-A062-FA1922DFA9A8".toLowerCase()
    },
    characteristics: [{
        name: "temperatureData",
        uuid: "E95D9250-251D-470A-A062-FA1922DFA9A8".toLowerCase(),
        read: function (value) {
            var t = value.getUint8(0);
            document.getElementById('microbit_temp').value = t;
        }
    }
    ]
};

function processBluetoothServer(server, serviceData) {
    server.getPrimaryService(serviceData.service.uuid)
        .then(service => {
            //serviceData.service.serviceObject = service;
            for (var i = 0; i < serviceData.characteristics.length; i++) {
                var characteristicData = serviceData.characteristics[i];
                (function (characteristicData) {
                    service.getCharacteristic(characteristicData.uuid)
                        .then(characteristic => {
                            //characteristicData.characteristicObject = characteristic;
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

var serverObject = null;

function processBluetoothList(prefix, list) {
    var serviceUuidList = [];
    for (var i = 0; i < list.length; i++) {
        serviceUuidList.push(list[i].service.uuid);
    }

    navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: prefix }]
        , optionalServices: serviceUuidList
    })
        .then(device => {
            return device.gatt.connect();
        })
        .then(server => {
            serverObject = server;
            for (var i = 0; i < list.length; i++) {
                processBluetoothServer(server, list[i]);
            }
        })
        .catch(error => {
            log('Error! ' + error);
        });
}

function microbit_connect() {
    processBluetoothList
        ("BBC micro:bit"
        , [
            microbit_buttons
            , microbit_accelerometer
            // , microbit_magnetometer
            ,  microbit_temperature
        ]);
}



function microbit_disconnect() {
    serverObject.disconnect();
}