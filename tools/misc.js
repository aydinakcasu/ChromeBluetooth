function buf2hex(arrayBuffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(arrayBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

function dumpBytes(dataView) {
    var s = dataView.byteLength + ': 0x';
    for (var i = 0; i < dataView.byteLength; i++) {
        var b = dataView.buffer[i];
        s += ('0' + (b & 0xFF).toString(16)).slice(-2);
    }
    return s;
}

function log(x) {
    var textarea = document.getElementById('results');
    textarea.scrollTop = textarea.scrollHeight;
    textarea.value += x + "\n";
    //console.log(x); 
}

function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}


function setBatteryPercentage(value) {
    document.getElementById('battery_value').value = value;
}

function minDisplay(val) {
    document.getElementById('minStressDisplay').value = val;
    var lut = colorLUT(document.getElementById('valueStressDisplay').value);
    setColorValue(lut.r, lut.g, lut.b);
}

function maxDisplay(val) {
    document.getElementById('maxStressDisplay').value = val;
    var lut = colorLUT(document.getElementById('valueStressDisplay').value);
    setColorValue(lut.r, lut.g, lut.b);
}
function valueDisplay(val) {
    document.getElementById('valueStressDisplay').value = val;
    var lut = colorLUT(val);
    setColorValue(lut.r, lut.g, lut.b);
}

function setColorValue(r, g, b) {
    function componentToHex(c) {
        var hex = parseInt(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    document.getElementById('rgb_value').value =
        '('
        + '0x' + componentToHex(r) + ','
        + '0x' + componentToHex(g) + ','
        + '0x' + componentToHex(b)
        + ')';
    document.getElementById('color-value').style.backgroundColor = rgbToHex(r, g, b);
}

function setHeartRateValue(bpm) {
    document.getElementById('heartRate_value').value = bpm;
    document.getElementById('valueStressDisplay').value = bpm;
    document.getElementById('valueStress').value = bpm;
}

function colorLUT(bpm) {
    var minAbs = 40;
    var maxAbs = 160;
    var minStress = parseInt(document.getElementById("minStress").value);
    var maxStress = parseInt(document.getElementById("maxStress").value);
    var lut =  // determine a color based on the bpm value
        (bpm < minStress) ?
            { r: 0x00, g: 0xef * (bpm - minAbs) / (minStress - minAbs) + 0x10, b: 0x00 } : // green
            (bpm > maxStress) ?
                { r: 0x9f * (bpm - maxStress) / (maxAbs - maxStress) + 0x60, g: 0x00, b: 0x00 } :  // red
                {
                    r: 0x9f * (bpm - minStress) / (maxStress - minStress) + 0x60,
                    g: 0x9f * (bpm - minStress) / (maxStress - minStress) + 0x60,
                    b: 0x00
                }; // yellow
    return lut;
}
