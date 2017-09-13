# ChromeBluetooth
 Demo to show how to use Chrome to connect to a heart rate monitor, as well as a Bluetooth smart bulb.  The ultimate goal creates a "Stress Display" that uses the heart rate value, to display a "traffic light" stress meter.  This consists of various shades of green, yellow or red depending on the heart rate value.

## This will demonstrate how to use Chromes' bluetooth capabilities to:
- Read battery status
- Read heart rate information
- Hacking into a smart bulb (Sharper Image LED Bulb Bluetooth Speaker - SBT5007)

## Runs on Chrome browsers on:
- Mac
- PC
- Smartphones
  * Android
  * IPhone
  * Windows 

## Requirements:
- Chrome version 56+

## To try it out! (Live Demo):
- https://aydinakcasu.github.io/ChromeBluetooth/

## To use:
- index.html 
  * the main page.
- deviceInfo.js 
  * get device information.
- battery.js 
  * get battery information.
- heartRate.js 
  * get heart rate information.
- temperature.js 
  * get temperature information.
- lightBulb.js 
  * set the colors of the lightbulb.
- stressDisplay.js 
  * base on the heartrate of the heartrate monitor, set the color of the bulb to differenct shades of green, yellow or red.
 
## Tools used:
- Get Bluetooth information using Chrome: 
  * chrome://bluetooth-internals
- Wireshark (to analyze packets) 
  * https://www.wireshark.org/
- Bluetooth Simulator App: 
  * "BLE Peripherals" App, for Android devices

## Where to buy:
- Sharper Image LED Bulb Bluetooth Speaker (SBT5007)
  * Ace Hardware: $22.99
  * Menards: Online ($11)
- Crane Heart Rate Monitor
  * About $15 at Aldi
  * Just about anywhere ($20+)

## Other helpful links:
- “Web Bluetooth (100 Days of Google Dev)
  * https://www.youtube.com/watch?v=I3obFcCw8mk
- Interact with Bluetooth devices on the Web
  * https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web
- Reverse Engineering a Bluetooth Lightbulb
  * https://medium.com/@urish/reverse-engineering-a-bluetooth-lightbulb-56580fcb7546

