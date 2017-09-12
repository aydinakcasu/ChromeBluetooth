
var heartRate_Characteristic = null;

function heartRate_start(readEvent) {

    let serviceUuid = "heart_rate";
    let characteristicUuid = "heart_rate_measurement"

    log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice
        ({
            filters: [{ services: [serviceUuid] }]
        })
        .then(device => { return device.gatt.connect(); })
        .then(server => { return server.getPrimaryService(serviceUuid); })
        // .then(service => { return service.getCharacteristic(characteristicUuid); })
        // .then(characteristic => {
        //     heartRate_Characteristic = characteristic;

        //     return heartRate_Characteristic.startNotifications().then(_ => {
        //         heartRate_Characteristic.addEventListener(
        //             'characteristicvaluechanged',
        //             hearRate_read);
        //     });
        // })
        .then(service => {
            chosenHeartRateService = service;
            return Promise.all([
                service.getCharacteristic('body_sensor_location')
                    .then(handleBodySensorLocationCharacteristic),
                service.getCharacteristic('heart_rate_measurement')
                    .then(handleHeartRateMeasurementCharacteristic),
            ])
        })
        .catch(error => {
            log('Argh! ' + error);
        });
}


function hearRate_read(event) {
    let value = event.target.value;

    var bpm = value.getUint8(1);
    log(bpm.toString().padStart(3) + '|' + '-'.repeat(bpm) + '>');
}


function handleBodySensorLocationCharacteristic(characteristic) {
    if (characteristic === null) {
        log("Unknown sensor location.");
        return Promise.resolve();
    }
    return characteristic.readValue()
        .then(sensorLocationData => {
            let sensorLocation = sensorLocationData.getUint8(0);
            var list = ['Other', 'Chest', 'Wrist', 'Finger', 'Hand', 'Ear Lobe', 'Foot'];
            var location = list[sensorLocation];
            log('Sensor Location: ' + location);
        });
}

function handleHeartRateMeasurementCharacteristic(characteristic) {
    return characteristic.startNotifications()
        .then(char => {
            characteristic.addEventListener('characteristicvaluechanged',
                onHeartRateChanged);
        });
}

function onHeartRateChanged(event) {
    let characteristic = event.target;
    log(parseHeartRate(characteristic.value));
}

function parseHeartRate(data) {
    let flags = data.getUint8(0);
    let rate16Bits = flags & 0x1;
    let result = {};
    let index = 1;
    if (rate16Bits) {
        result.heartRate = data.getUint16(index, /*littleEndian=*/true);
        index += 2;
    } else {
        result.heartRate = data.getUint8(index);
        index += 1;
    }
    let contactDetected = flags & 0x2;
    let contactSensorPresent = flags & 0x4;
    if (contactSensorPresent) {
        result.contactDetected = !!contactDetected;
    }
    let energyPresent = flags & 0x8;
    if (energyPresent) {
        result.energyExpended = data.getUint16(index, /*littleEndian=*/true);
        index += 2;
    }
    let rrIntervalPresent = flags & 0x10;
    if (rrIntervalPresent) {
        let rrIntervals = [];
        for (; index + 1 < data.byteLength; index += 2) {
            rrIntervals.push(data.getUint16(index, /*littleEndian=*/true));
        }
        result.rrIntervals = rrIntervals;
    }
    log("heartRate =" + result.heartRate);
    log("contactDetected =" + result.contactDetected);
    log("energyExpended =" + result.energyExpended);
    log("rrIntervals =" + result.rrIntervals);
    return result;
}

function heartRate_stop() {
    if (heartRate_Characteristic) {
        heartRate_Characteristic.stopNotifications()
            .then(_ => {
                log('> Notifications stopped');
                heartRate_Characteristic.removeEventListener('characteristicvaluechanged',
                    hearRate_read);
            })
            .catch(error => {
                log('Argh! ' + error);
            });
    }
}



