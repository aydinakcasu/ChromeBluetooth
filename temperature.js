
var temperature_Characteristic = null;

function temperature_connect() {

    let serviceUuid = "health_thermometer";
    let characteristicUuid = "temperature_measurement";

    navigator.bluetooth.requestDevice
        ({
            filters: [{ services: [serviceUuid] }],
            optionalServices: [serviceUuid]    
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

function readDataView(data) {
    //log( data.getUint8(3).toString(16)+', '+ data.getUint8(4).toString(16));
    //return;
    var ret = "";
    for(var i=0; i<data.byteLength; i++)
    {
        ret += data.getUint8(i).toString(16) + ", ";
    }
        log(ret);
}

function BLESimulatorFix(dv)
{
  var shifted = 0x100*dv.getUint8(4) + dv.getUint8(3);
  shifted = shifted >>> 1;
  dv.setUint8(4, shifted >>> 8);
  dv.setUint8(3, shifted & 0xff);
  return dv;
}

function temperature_read(event) {
    let value = event.target.value;
    value = BLESimulatorFix(value);   // Shouldn't need to do this
    var temp = value.getFloat32(1, /*littleEndian=*/true);
    log(temp);
  
    log(temp.toString().padStart(3) + '|' + '-'.repeat(temp) + '>');
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


/*
Readings from BLE Peripheral Simulator:
I think the byte values are wrong.  Need to shift by one more?
val  Actual   Expect
  0: 14, 84
  1:  0, 7f   80, 3f
00000000 01111111
10000000 00111111
  2:  0, 80   00, 40
  3: 40, 80   40, 40
 50: 48, 84   48  42
01001000 10000100
01001000 01000110

100: 48, 85   c8  42 
01001000 10000101     
11001000 01000010
200: 48, 86   48, 43

0, 0, 0,  0, 7f, 
0, 0, 0, 80, 3f, 
*/