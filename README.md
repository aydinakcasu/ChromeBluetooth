![Screenshot](https://user-images.githubusercontent.com/2898451/30746603-4753d20a-9f78-11e7-93fd-b8b903b98ca5.png)

# ChromeBluetooth
 Demo to show how to use Chrome to connect to a heart rate monitor, as well as a Bluetooth smart bulb.  The ultimate goal creates a "Stress Display" that uses the heart rate value, to display a "traffic light" stress meter.  This consists of various shades of green, yellow or red depending on the heart rate value.
![Screenshot](https://user-images.githubusercontent.com/2898451/30746795-03799460-9f79-11e7-94e7-aa966bcbc0f1.png)


## This will demonstrate how to use Chromes' bluetooth capabilities to:
- Read battery status
- Read heart rate information
- Hacking into a smart bulb (Sharper Image LED Bulb Bluetooth Speaker - SBT5007)

## Runs on Chrome browsers on:
- Mac
- PC
- Smartphones
  * Android
  * IPhone (Not working currently)
  * Windows (Not tested)

## Requirements:
- Chrome version 56+

## To try it out! (Live Demo):
- https://aydinakcasu.github.io/ChromeBluetooth/
![Screenshot](https://user-images.githubusercontent.com/2898451/30746090-8ea0e276-9f76-11e7-93ea-6d896c6c52aa.png)

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
  ![Screenshot](https://user-images.githubusercontent.com/2898451/30747106-2fb89a84-9f7a-11e7-8cd4-b86e86ca3709.png)
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

## Other Hardware for Bluetooth:
- Micro:bit
- Raspberry PI
- BB-8 (Star Wars)
- Drone (Parrot Mini Drone Rolling Spider)
- Thermometers

## Images:
- Title
![Screenshot](https://user-images.githubusercontent.com/2898451/30746603-4753d20a-9f78-11e7-93fd-b8b903b98ca5.png)
- Screenshot:
![Screenshot](https://user-images.githubusercontent.com/2898451/30746090-8ea0e276-9f76-11e7-93ea-6d896c6c52aa.png)
- On Desktop
![Screenshot](https://user-images.githubusercontent.com/2898451/30746214-0536a9a2-9f77-11e7-88c5-1cb686c37d4e.png)
- On Android
![Screenshot](https://user-images.githubusercontent.com/2898451/30746283-4acbc43e-9f77-11e7-8236-ad5611041d71.png)
- Show stress
![Screenshot](https://user-images.githubusercontent.com/2898451/30746663-817ae6e4-9f78-11e7-9d1f-8a9cc9387d1b.png)
- Hacking Overview
![Screenshot](https://user-images.githubusercontent.com/2898451/30746714-b359a358-9f78-11e7-95f3-a22c9b3e225d.png)
- Test Bulb:
![Screenshot](https://user-images.githubusercontent.com/2898451/30746765-e64fb914-9f78-11e7-95e9-be9a553f8e42.png)
- Stress Display
![Screenshot](https://user-images.githubusercontent.com/2898451/30746795-03799460-9f79-11e7-94e7-aa966bcbc0f1.png)
- Bulb
![Screenshot](https://user-images.githubusercontent.com/2898451/30747106-2fb89a84-9f7a-11e7-8cd4-b86e86ca3709.png)
