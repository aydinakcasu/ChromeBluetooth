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

function minDisplay(val) {
    document.getElementById('minStressDisplay').value = val;
}

function maxDisplay(val) {
    document.getElementById('maxStressDisplay').value = val;
}

function setColorValue(r,g,b)
{
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    document.getElementById('color-value').style.backgroundColor = rgbToHex(r,g,b);
}
