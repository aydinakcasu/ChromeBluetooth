/*
--------------------------------------------------------------------
Puck.js BLE Interface library
                      Copyright 2016 Gordon Williams (gw@pur3.co.uk)
--------------------------------------------------------------------
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
--------------------------------------------------------------------
This creates a 'Puck' object that can be used from the Web Browser.

Simple usage:

  Puck.write("LED1.set()\n")

Execute expression and return the result:

  Puck.eval("BTN.read()", function(d) {
    alert(d);
  });

Or write and wait for a result - this will return all characters,
including echo and linefeed from the REPL so you may want to send
`echo(0)` and use `console.log` when doing this.

  Puck.write("1+2\n", function(d) {
    alert(d);
  });

Or more advanced usage with control of the connection
 - allows multiple connections

  Puck.connect(function(connection) {
    if (!connection) throw "Error!";
    connection.on('data', function(d) { ... });
    connection.on('close', function() { ... });
    connection.write("1+2\n", function() {
      connection.close();
    });
  });

*/
var Puck = (function() {
  if (typeof navigator == "undefined") return;
  var isBusy;
  var queue = [];

  function checkIfSupported() {
    // Hack for windows
    if (navigator.platform.indexOf("Win")>=0 &&
        (navigator.userAgent.indexOf("Chrome/54")>=0 ||
         navigator.userAgent.indexOf("Chrome/55")>=0 ||
         navigator.userAgent.indexOf("Chrome/56")>=0)
        ) {
      console.warn("Chrome <56 in Windows has navigator.bluetooth but it's not implemented properly");
      if (confirm("Web Bluetooth on Windows is not yet available.\nPlease click Ok to see other options for using Web Bluetooth"))
        window.location = "https://www.espruino.com/Puck.js+Quick+Start";
      return false;
    }
    if (navigator.bluetooth) return true;
    console.warn("No Web Bluetooth on this platform");
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (iOS) {
      if (confirm("To use Web Bluetooth on iOS you'll need the WebBLE App.\nPlease click Ok to go to the App Store and download it."))
        window.location = "https://itunes.apple.com/us/app/webble/id1193531073";
    } else {
      if (confirm("This Web Browser doesn't support Web Bluetooth.\nPlease click Ok to see instructions for enabling it."))
        window.location = "https://www.espruino.com/Puck.js+Quick+Start";
    }
    return false;
  }

  var NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
  var NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
  var NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
  var CHUNKSIZE = 16;

  function log(level, s) {
    console.log(level, s);
  }

  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  function str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  function handleQueue() {
    if (!queue.length) return;
    var q = queue.shift();
    log(3,"Executing "+JSON.stringify(q)+" from queue");
    if (q.type=="eval") puck.eval(q.expr, q.cb);
    else if (q.type=="write") puck.write(q.data, q.callback, q.callbackNewline);
    else log(1,"Unknown queue item "+JSON.stringify(q));
  }

  function connect(callback) {
    if (!checkIfSupported()) return;
    var connection = {
      on : function(evt,cb) { this["on"+evt]=cb; },
      emit : function(evt,data) { if (this["on"+evt]) this["on"+evt](data); },
      isOpen : false,
      isOpening : true,
      txInProgress : false
    };
    var btServer = undefined;
    var btService;
    var connectionDisconnectCallback;
    var txCharacteristic;
    var rxCharacteristic;
    var txDataQueue = [];

    connection.close = function() {
      connection.isOpening = false;
      if (connection.isOpen) {
        connection.isOpen = false;
        connection.emit('close');
      } else {
        if (callback) callback(null);
      }
      if (btServer) {
        btServer.disconnect();
        btServer = undefined;
        txCharacteristic = undefined;
        rxCharacteristic = undefined;
      }
    };

    connection.write = function(data, callback) {
      if (data) txDataQueue.push({data:data,callback:callback});
      if (connection.isOpen && !connection.txInProgress) writeChunk();

      function writeChunk() {
        var chunk;
        if (!txDataQueue.length) return;
        var txItem = txDataQueue[0];
        var sendInfo =  txItem.data;
        if (txItem.data.length <= CHUNKSIZE) {
          chunk = txItem.data;
          txItem.data = undefined;
        } else {
          chunk = txItem.data.substr(0,CHUNKSIZE);
          txItem.data = txItem.data.substr(CHUNKSIZE);
        }
        connection.txInProgress = true;
        log(2, "Sending "+ JSON.stringify(chunk));
        txCharacteristic.writeValue(str2ab(chunk)).then(function() {
          log(3, "Sent: " + sendInfo);
          if (!txItem.data) {
            txDataQueue.shift(); // remove this element
            if (txItem.callback)
              txItem.callback();
          }
          connection.txInProgress = false;
          writeChunk();
        }).catch(function(error) {
         log(1, 'SEND ERROR: ' + error);
         txDataQueue = [];
         connection.close();
        });
      }
    };

    navigator.bluetooth.requestDevice({
        filters:[
          { namePrefix: 'Puck.js' },
          { namePrefix: 'Espruino' },
          { services: [ NORDIC_SERVICE ] }
        ], optionalServices: [ NORDIC_SERVICE ]}).then(function(device) {
      log(1, 'Device Name:       ' + device.name);
      log(1, 'Device ID:         ' + device.id);
      // Was deprecated: Should use getPrimaryServices for this in future
      //log('BT>  Device UUIDs:      ' + device.uuids.join('\n' + ' '.repeat(21)));
      device.addEventListener('gattserverdisconnected', function() {
        log(1, "Disconnected (gattserverdisconnected)");
        connection.close();
      });
      return device.gatt.connect();
    }).then(function(server) {
      log(1, "Connected");
      btServer = server;
      return server.getPrimaryService(NORDIC_SERVICE);
    }).then(function(service) {
      log(2, "Got service");
      btService = service;
      return btService.getCharacteristic(NORDIC_RX);
    }).then(function (characteristic) {
      rxCharacteristic = characteristic;
      log(2, "RX characteristic:"+JSON.stringify(rxCharacteristic));
      rxCharacteristic.addEventListener('characteristicvaluechanged', function(event) {
        var value = event.target.value.buffer; // get arraybuffer
        var str = ab2str(value);
        log(3, "Received "+JSON.stringify(str));
        connection.emit('data', str);
      });
      return rxCharacteristic.startNotifications();
    }).then(function() {
      return btService.getCharacteristic(NORDIC_TX);
    }).then(function (characteristic) {
      txCharacteristic = characteristic;
      log(2, "TX characteristic:"+JSON.stringify(txCharacteristic));
    }).then(function() {
      connection.txInProgress = false;
      connection.isOpen = true;
      connection.isOpening = false;
      isbusy = false;
      queue = [];
      callback(connection);
      connection.emit('open');
      // if we had any writes queued, do them now
      connection.write();
    }).catch(function(error) {
      log(1, 'ERROR: ' + error);
      connection.close();
    });
    return connection;
  };

  // ----------------------------------------------------------
  var connection;
  /* convenience function... Write data, call the callback with data:
       callbackNewline = false => if no new data received for ~0.2 sec
       callbackNewline = true => after a newline */
  function write(data, callback, callbackNewline) {
    if (!checkIfSupported()) return;
    
    if (isBusy) {
      log(3, "Busy - adding Puck.write to queue");
      queue.push({type:"write", data:data, callback:callback, callbackNewline:callbackNewline});
      return;
    }

    var cbTimeout;
    function onWritten() {
      if (callbackNewline) {
        connection.cb = function(d) {
          var newLineIdx = connection.received.indexOf("\n");
          if (newLineIdx>=0) {
            var l = connection.received.substr(0,newLineIdx);
            connection.received = connection.received.substr(newLineIdx+1);
            connection.cb = undefined;
            if (cbTimeout) clearTimeout(cbTimeout);
            cbTimeout = undefined;
            if (callback)
              callback(l);
            isBusy = false;
            handleQueue();
          }
        };
      }
      // wait for any received data if we have a callback...
      var maxTime = 300; // 30 sec - Max time we wait in total, even if getting data
      var dataWaitTime = 3;
      var maxDataTime = dataWaitTime; // 300ms - max time we wait after having received data
      cbTimeout = setTimeout(function timeout() {
        cbTimeout = undefined;
        if (maxTime) maxTime--;
        if (maxDataTime) maxDataTime--;
        if (connection.hadData) maxDataTime=dataWaitTime;
        if (maxDataTime && maxTime) {
          cbTimeout = setTimeout(timeout, 100);
        } else {
          connection.cb = undefined;
          if (callback)
            callback(connection.received);
          isBusy = false;
          handleQueue();
          connection.received = "";
        }
        connection.hadData = false;
      }, 100);
    }

    if (connection && (connection.isOpen || connection.isOpening)) {
      if (!connection.txInProgress) connection.received = "";
      isBusy = true;
      return connection.write(data, onWritten);
    }

    connection = connect(function(puck) {
      if (!puck) {
        connection = undefined;
        if (callback) callback(null);
        return;
      }
      connection.received = "";
      connection.on('data', function(d) {
        connection.received += d;
        connection.hadData = true;
        if (connection.cb)  connection.cb(d);
      });
      connection.on('close', function(d) {
        connection = undefined;
      });
      isBusy = true;
      connection.write(data, onWritten);
    });    
  }

  // ----------------------------------------------------------

  var puck = {
    /// Are we writing debug information? 0 is no, 1 is some, 2 is more, 3 is all.
    debug : 1,
    /// Used internally to write log information - you can replace this with your own function
    log : function(level, s) { if (level <= this.debug) console.log("<BLE> "+s)},
    /** Connect to a new device - this creates a separate
     connection to the one `write` and `eval` use. */
    connect : connect,
    /// Write to Puck.js and call back when the data is written.  Creates a connection if it doesn't exist
    write : write,
    /// Evaluate an expression and call cb with the result. Creates a connection if it doesn't exist
    eval : function(expr, cb) {
      if (!checkIfSupported()) return;
      if (isBusy) {
        log(3, "Busy - adding Puck.eval to queue");
        queue.push({type:"eval", expr:expr, cb:cb});
        return;
      }
      write('\x10Bluetooth.println(JSON.stringify('+expr+'))\n', function(d) {
        try {
          var json = JSON.parse(d);
          cb(json);
        } catch (e) {
          log(1, "Unable to decode "+JSON.stringify(d)+", got "+e.toString());
          cb(null, "Unable to decode "+JSON.stringify(d)+", got "+e.toString());
        }
      }, true);
    },
    /// Write the current time to the Puck
    setTime : function(cb) {
      var d = new Date();
      var cmd = 'setTime('+(d.getTime()/1000)+');';
      // in 1v93 we have timezones too
      cmd += 'if (E.setTimeZone) E.setTimeZone('+d.getTimezoneOffset()/-60+');\n';
      write(cmd, cb);
    },
    /// Did `write` and `eval` manage to create a connection?
    isConnected : function() {
      return connection!==undefined;
    },
    /// get the connection used by `write` and `eval`
    getConnection : function() {
      return connection;
    },
    /// Close the connection used by `write` and `eval`
    close : function() {
      if (connection)
        connection.close();
    }
  };
  return puck;
})();
