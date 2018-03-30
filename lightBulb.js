
var lightBulb_Device = null;
var lightBulb_Characteristic = null;


function lightBulb_connect() {   // Connect
    let serviceUuid = '00007777-0000-1000-8000-00805f9b34fb';
    let characteristicUuid = '00008877-0000-1000-8000-00805f9b34fb';

    navigator.bluetooth.requestDevice
        ({
            acceptAllDevices: true,
            optionalServices: [serviceUuid]
        })
        .then(device => {
            lightBulb_Device = device;
            return device.gatt.connect();
        })
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
    return Uint8Array.from(data);
}

function lightBulb_traffic(characteristic) {   // Set a traffic light pattern
    characteristic = characteristic || lightBulb_Characteristic;

    lightBulb_green(); sleep(2000);
    lightBulb_yellow(); sleep(1000);
    lightBulb_red(); sleep(1000);
}

function lightBulb_common(r, g, b) {
    setColorValue(r, g, b);
    if (!lightBulb_Characteristic) return;
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
function lightBulb_black() {             // Black
    lightBulb_common(0x00, 0x00, 0x00); // Black
}

function lightBulb_countdown() {
    var a = new Date();
    var length = 2000; // 2 min
    var length = 4000; // 8 min
    for (var i = length; i > 0; i -= 100) {
        lightBulb_green();
        sleep(i);
        lightBulb_black();
        sleep(i);
        lightBulb_yellow();
        sleep(i);
        lightBulb_black();
        sleep(i);
        lightBulb_red();
        sleep(i);
        lightBulb_black();
        sleep(i);
    }

    lightBulb_blue();
    var b = new Date();
    console.log(a.toString() + ', ' + b.toString())
}

function lightBulb_disconnect() {   // Disconnect
    lightBulb_black();
    if (lightBulb_Device.gatt.connected) {
        lightBulb_Device.gatt.disconnect();
    }
}

function initButtons() {
    var msg = document.getElementById('lightBulbColorKey');
    document.body.addEventListener('keydown', function (e) {
        msg.textContent = 'keydown:' + e.keyCode;
        switch (e.keyCode) {
            case 49: // 1
                //case 27: // Escape
                lightBulb_red();
                break;
            case 81: // Q
                //case 9:  // Tab
                lightBulb_green();
                break;
            case 65: // 1
                //case 20: // Caps
                lightBulb_blue();
                break;

            case 90: // Z
                //case 16: // Shift
                lightBulb_black();
                break;

            case 50: // 2
                lightBulb_green();
                break;
            case 87: // W
                lightBulb_yellow();
                break;
            case 83: // S
                lightBulb_red();
                break;
            case 88: // X
                lightBulb_black();
                break;

            case 51: // 3
                //lightBulb_traffic();
                break;
            case 52: // 4
                lightBulb_black();
                break;
            case 54: // 6
                playToggleAudio();
                break;

            default:
                break;
        }
    });
}
