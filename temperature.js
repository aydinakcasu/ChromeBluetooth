
var temperature_Characteristic = null;

function temperature_connect() {

    let serviceUuid = "health_thermometer";
    let characteristicUuid = "temperature_measurement";

    navigator.bluetooth.requestDevice
        ({
            filters: [{ services: [serviceUuid] }]
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        .then(service => { return service.getCharacteristic(characteristicUuid); })
        .then(characteristic => {
            temperature_Characteristic = characteristic;
            return characteristic;
        })
        .then(characteristic => {
            return temperature_Characteristic.startNotifications()
                .then(_ => {
                    temperature_Characteristic.addEventListener(
                        'characteristicvaluechanged',
                        temperature_read);
                });
        })
        .catch(error => {
            log('Error! ' + error);
        });
}

function temperature_read(event) {
    let value = event.target.value;
    // Not working.
    var bpm = value.getFloat32(1, /*littleEndian=*/true);
    log(bpm);
    //log(bpm.toString().padStart(3) + '|' + '-'.repeat(bpm) + '>');
}

function temperature_disconnect() {
    if (temperature_Characteristic) {
        temperature_Characteristic.stopNotifications()
            .then(_ => {
                temperature_Characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    hearRate_read);
            })
            .catch(error => {
                log('Error! ' + error);
            });
    }
}
