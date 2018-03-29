
var puck_Characteristic = null;
var puck_Characteristic_TX = null;
var puck_Characteristic_RX = null;

function puck_connect() {

    let serviceUuid = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    let characteristicUuid = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    let characteristicUuid_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
    let characteristicUuid_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
  
    navigator.bluetooth.requestDevice
        ({
            filters: [{ services: [serviceUuid] }],
            optionalServices: [serviceUuid]      
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        .then(service => { return service.getCharacteristic(characteristicUuid_RX); })
        .then(characteristic => {   // Save characteristic
           alert('ccc');  puck_Characteristic = characteristic;
            return characteristic;
        })
        .then(characteristic => {   // Start notification
            return puck_Characteristic.startNotifications()
                .then(_ => {
                    puck_Characteristic.addEventListener(
                        'characteristicvaluechanged',
                        puck_read);
                });
        })
        .catch(error => {   // Handle Errors
            log('Error! ' + error);
        });
}

function puck_read(event) {
    let value = event.target.value;
debugger;
    var bpm = value.getUint8(1);
    setHeartRateValue(bpm);

    log(bpm.toString().padStart(3) + '|' + '-'.repeat(bpm-40) + '>');
}

function puck_disconnect() {
    if (puck_Characteristic) {
        puck_Characteristic.stopNotifications()
            .then(_ => {
                puck_Characteristic.removeEventListener(
                    'characteristicvaluechanged',
                    puck_read);
            })
            .catch(error => {
                log('Error! ' + error);
            });
    }
}
