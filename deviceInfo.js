function deviceInfo_connect() {

    navigator.bluetooth.requestDevice
        ({
            acceptAllDevices: true
        })
        .then(device => {
            log('---------');
            log('> Name:      ' + device.name);
            log('> Id:        ' + device.id);
            log('> Connected: ' + device.gatt.connected);
        })
        .catch(error => {
            console.log('Error: ' + error);
        });
}