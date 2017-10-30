
var stressDisplayLightBulb_Device = null;
var stressDisplayLightBulb_Characteristic = null;
var stressDisplayHeartRate_Characteristic = null;

function stressDisplay_lightBulb_connect() {
    let serviceUuid = '00007777-0000-1000-8000-00805f9b34fb';
    let characteristicUuid = '00008877-0000-1000-8000-00805f9b34fb';

    navigator.bluetooth.requestDevice
        ({
            acceptAllDevices: true,
            optionalServices: [serviceUuid]
        })
        .then(device => {
            stressDisplayLightBulb_Device = device;
            return device.gatt.connect();
        })
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
    setHeartRateValue(bpm);

    var lut = colorLUT(bpm);
    setColorValue(lut.r, lut.g, lut.b);

    // log('{'
    //     + '0x' + ('0' + (lut.r & 0xFF).toString(16)).slice(-2) + ', '
    //     + '0x' + ('0' + (lut.g & 0xFF).toString(16)).slice(-2) + ', '
    //     + '0x' + ('0' + (lut.b & 0xFF).toString(16)).slice(-2)
    //     + '}, '
    //     + bpm.toString().padStart(3) + '|' + '-'.repeat(bpm - 40) + '>'
    // );
    log(bpm.toString().padStart(3) + '|' + '-'.repeat(bpm - 40) + '>');

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
    return Uint8Array.from(data);
}

function stressDisplay_disconnect() {   // Disconnect
    setColorValue(0x00, 0x00, 0x00);
    var send = getPayload(0x00, 0x00, 0x00);
    stressDisplayLightBulb_Characteristic.writeValue(send);
    sleep(50);

    if (stressDisplayLightBulb_Device.gatt.connected) {
        stressDisplayLightBulb_Device.gatt.disconnect();
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