
var stressDisplayLightBulb_Characteristic = null;
var stressDisplayHeartRate_Characteristic = null;

var stressDisplay_specs = {
    uuid: 0x7777,
    service: '00007777-0000-1000-8000-00805f9b34fb',
    characteristic: ['00008877-0000-1000-8000-00805f9b34fb']
};

function stressDisplay_lightBulb_connect() {
    var serviceUuid = stressDisplay_specs.service;
    var characteristicUuid = stressDisplay_specs.characteristic[0]

    navigator.bluetooth.requestDevice
        ({
            acceptAllDevices: true,
            optionalServices: [
                stressDisplay_specs.uuid,
                // stressDisplay_specs.service,
            ]
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        .then(service => { return service.getCharacteristic(characteristicUuid); })

        .then(characteristic => {   // Save characteristic
            stressDisplayLightBulb_Characteristic = characteristic;
            return characteristic;
        })
        .then(characteristic => {   // Set to blue when starting
            var send = getPayload(0x00, 0x00, 0xff);
            characteristic.writeValue(send);

            return characteristic;
        })
        .catch(error => {   // Handle Errors
            log('Error! ' + error);
        });
}

function stressDisplay_heartRate_connect() {
    let serviceUuid = "heart_rate";
    let characteristicUuid = "heart_rate_measurement"

    navigator.bluetooth.requestDevice
        ({
            filters: [{ services: [serviceUuid] }]
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        .then(service => { return service.getCharacteristic(characteristicUuid); })
        .then(characteristic => {   // Save characteristic
            stressDisplayHeartRate_Characteristic = characteristic;
            return characteristic;
        })
        .then(characteristic => {   // Start notification
            return characteristic.startNotifications()
                .then(_ => {
                    characteristic.addEventListener(
                        'characteristicvaluechanged',
                        stressDisplay_read);
                });
        })
        .catch(error => {   // Handle Errors
            log('Error! ' + error);
        });
}

function stressDisplay_read(event) {
    let value = event.target.value;

    var bpm = value.getUint8(1);
    var minStress = parseInt(document.getElementById("minStress").value);
    var maxStress = parseInt(document.getElementById("maxStress").value);

    var lut =  // determine a color based on the bpm value
        (bpm < minStress) ?
            { r: 0x00, g: 0xef * (bpm - 50) / (minStress - 50) + 0x10, b: 0x00 } : // green
            (bpm > maxStress) ?
                { r: 0xef * (bpm - maxStress) / (100 - maxStress) + 0x10, g: 0x00, b: 0x00 } :  // red
                {
                    r: 0xef * (bpm - minStress) / (maxStress - minStress) + 0x10,
                    g: 0xef * (bpm - minStress) / (maxStress - minStress) + 0x10,
                    b: 0x00
                }; // yellow

    log('{'
        + '0x' + ('0' + (lut.r & 0xFF).toString(16)).slice(-2) + ', '
        + '0x' + ('0' + (lut.g & 0xFF).toString(16)).slice(-2) + ', '
        + '0x' + ('0' + (lut.b & 0xFF).toString(16)).slice(-2)
        + '}, '
        + bpm.toString().padStart(3) + '|' + '-'.repeat(bpm-40) + '>'
    );

    var send = getPayload(lut.r, lut.g, lut.b);
    stressDisplayLightBulb_Characteristic.writeValue(send);
    sleep(50);
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

function stressDisplay_disconnect() {   // Disconnect
    if (stressDisplayLightBulb_Characteristic) {
        stressDisplayLightBulb_Characteristic.stopNotifications()
            .then(_ => { })
            .catch(error => {
                log('Error! ' + error);
            });
    }
    if (stressDisplayHeartRate_Characteristic) {
        stressDisplayHeartRate_Characteristic.stopNotifications()
            .then(_ => {
                stressDisplayHeartRate_Characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    stressDisplay_read);
            })
            .catch(error => {
                log('Error! ' + error);
            });
    }
}