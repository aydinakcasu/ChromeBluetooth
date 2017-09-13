function battery_connect() {

    let serviceUuid = "battery_service";
    let characteristicUuid = "battery_level"

    navigator.bluetooth.requestDevice
        ({
            filters: [{ services: [serviceUuid] }]
            , optionalServices: [serviceUuid]
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        .then(service => { return service.getCharacteristic(characteristicUuid); })
        .then(characteristic => { return characteristic.readValue(); })
        .then(value => {
            var percentage = value.getUint8(0);
            setBatteryPercentage(percentage);
            log('Battery percentage is ' + percentage);
        })
        .catch(error => {
            log('Error! ' + error);
        });
}
