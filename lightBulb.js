
var lightBulb_Characteristic = null;

var lightBulb_specs = {  // LightBulb Service and Characteristics
    uuid: 0x00007777,
    service: '00007777-0000-1000-8000-00805f9b34fb',
    characteristic: ['00008877-0000-1000-8000-00805f9b34fb']
};

function lightBulb_connect() {   // Connect
    let serviceUuid = lightBulb_specs.service;
    let characteristicUuid = lightBulb_specs.characteristic[0]

    navigator.bluetooth.requestDevice
        ({
            acceptAllDevices: true,
            optionalServices: [
                lightBulb_specs.uuid,
                lightBulb_specs.service,
            ]
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        .then(service => { return service.getCharacteristic(characteristicUuid); })

        .then(characteristic => {   // Save characteristic
            lightBulb_Characteristic = characteristic;
            return characteristic;
        })
        .then(characteristic => {   // Set colors
            lightBulb_traffic(characteristic);
            return characteristic;
        })
        .catch(error => {   // Handle Errors
            log('Error! ' + error);
        });
}

function getPayload(r, g, b) {   // Create the payload
    var data = [
        0x01, 0xfe, 0x00, 0x00, 0x53, 0x83, 0x10, 0x00,
        g, // Green
        b, // Blue
        r, // Red
        0x00, 0x50, 0x00, 0x00, 0x00
    ];
    return Uint8Array.from(data); Í
}

function lightBulb_traffic(characteristic) {   // Set a traffic light pattern
    characteristic = characteristic || lightBulb_Characteristic;

    var send = getPayload(0x00, 0xff, 0x00);    // Green
    characteristic.writeValue(send);
    sleep(2000);

    var send = getPayload(0xff, 0xff, 0x00);    // Yellow
    characteristic.writeValue(send);
    sleep(500);

    var send = getPayload(0xff, 0x00, 0x00);    // Red
    characteristic.writeValue(send);
    sleep(1000);
}

function lightBulb_common(r, g, b) {
    var send = getPayload(r, g, b);    // Color
    lightBulb_Characteristic.writeValue(send);
    sleep(50);
}

function lightBulb_red() {              // Red
    lightBulb_common(0xff, 0x00, 0x00); // Red
}
function lightBulb_yellow() {           // Yellow
    lightBulb_common(0xff, 0xff, 0x00); // Yellow
}
function lightBulb_green() {            // Green
    lightBulb_common(0x00, 0xff, 0x00); // Green
}
function lightBulb_blue() {             // Blue
    lightBulb_common(0x00, 0x00, 0xff); // Blue
}

function lightBulb_disconnect() {   // Disconnect
    if (lightBulb_Characteristic) {
        lightBulb_Characteristic.stopNotifications()
            .then(_ => { })
            .catch(error => {
                log('Error! ' + error);
            });
    }
}