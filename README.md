# Nixie Pipe Electron App

[Nixie Pipe](http://www.nixiepipe.com) GUI controller built on [Electron](http://electron.atom.io/).

![Screenshot](/app/img/screenshot.png)

# Usage

1. Download and run _Nixie Pipe Controller_ app using the link for your system below. 
2. Once loaded, connect a Nixie Pipe _Master_ via USB. If using a clock _Master_, enter serial mode by pressing the left-hand touch button - the clock will change green entering countdown set mode (other _Master_ units will always operate in serial mode). 
3. Press 'Connect' in the left column of the app. Once connected, the firmware version will be shown and the app functions can be used. _If using a Weather Pipe, tick 'Weather Pipe' prior to pressing 'Connect'_.

## Packaged Binaries

* [MacOS x64](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/Nixie.Pipe.Controller-darwin-x64.zip)
* [Linux x32](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/Nixie.Pipe.Controller-linux-ia32.zip)
* Windows - Build coming soon.
<!-- * [Windows 64bit](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/Nixie.Pipe.Controller-win32-x64.zip); [_Windows 32bit_](https://github.com/tuna-f1sh/electron-nixiepipe/releases/download/1.1.1/Nixie.Pipe.Controller-win32-ia32.zip)-->

## Run Source

```bash
git clone https://github.com/tuna-f1sh/electron-nixiepipe
cd electron-nixiepipe
npm install
npm install -g electron
electron .
```
