# Nixie Pipe Electron App

[Nixie Pipe](http://www.nixiepipe.com) GUI controller built on [Electron](http://electron.atom.io/).

![Screenshot](/app/img/screenshot.png)

# Usage

1. Download and run _Nixie Pipe Controller_ app using the link for your system below. **You will also need to install the [FTDI D2XX Drivers for your system here](http://www.ftdichip.com/Drivers/D2XX.htm).**
2. Once loaded, connect a Nixie Pipe _Master_ via USB. If using a clock _Master_, enter serial mode by pressing the left-hand touch button - the clock will change green entering countdown set mode (other _Master_ units will always operate in serial mode). 
3. Press 'Connect' in the left column of the app. Once connected, the firmware version will be shown and the app functions can be used. _If using a Weather Pipe, tick 'Weather Pipe' prior to pressing 'Connect'_.

## Packaged Binaries

* [MacOS x64](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/Nixie.Pipe.Controller-darwin-x64.zip)
* [Linux x64](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/Nixie.Pipe.Controller-linux-x64.zip)
* [Windows x64](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/NPController-win32.zip).

## Run Source

```bash
git clone https://github.com/tuna-f1sh/electron-nixiepipe
cd electron-nixiepipe
npm install
npm install -g electron
electron .
```

The process is quite a bit more complicated on Windows as involves using `node-gyp-pre`. See the 'win32' branch.

# Attribution

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=CFA7TQXNFURLQ)

I many of my projects open source so others can learn as I have but please attribute my creations if you derive use of them in your own work, by following the license terms, linking to www.jbrengineering.co.uk and/or the project page.
