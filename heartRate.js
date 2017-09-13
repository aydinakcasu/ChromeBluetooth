
var heartRate_Characteristic = null;

function heartRate_connect() {

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
            heartRate_Characteristic = characteristic;
            return characteristic;
        })
        .then(characteristic => {   // Start notification
            return heartRate_Characteristic.startNotifications()
                .then(_ => {
                    heartRate_Characteristic.addEventListener(
                        'characteristicvaluechanged',
                        hearRate_read);
                });
        })
        .catch(error => {   // Handle Errors
            log('Error! ' + error);
        });
}

function hearRate_read(event) {
    let value = event.target.value;

    var bpm = value.getUint8(1);
    setHeartRateValue(bpm);

    log(bpm.toString().padStart(3) + '|' + '-'.repeat(bpm-40) + '>');
}

function heartRate_disconnect() {
    if (heartRate_Characteristic) {
        heartRate_Characteristic.stopNotifications()
            .then(_ => {
                heartRate_Characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    hearRate_read);
            })
            .catch(error => {
                log('Error! ' + error);
            });
    }
}
