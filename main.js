/*
//  GPL 3.0 License

//  Copyright (c) 2016 John Whittington www.jbrengineering.co.uk

//  This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http:www.gnu.org/licenses/>.
*/

const {app, BrowserWindow, dialog, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
// const {ipcMain} = require('electron')

const powerSaveBlocker = require('electron').powerSaveBlocker;

// Maintain tick rate even when backgrounded
app.commandLine.appendSwitch('page-visibility');
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
powerSaveBlocker.start('prevent-app-suspension');

const nixie = require('nixiepipe')

let pipes

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 870, 
    height: 660,
    resizable: false,
    maximizable: false,
    fullscreenable: false
  })

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools()
  win.setMenu(null);

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
    if ( (typeof pipes !== "undefined") ) {
      pipes.close( function() {
        pipes = null;
      });
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('connect-click', (event) => {
  if ( (typeof pipes === "undefined") || (pipes === null) ) {
    pipes = new nixie()

    pipes.once("connected", () => {
      pipes.setNumber(0);
      pipes.setColour(0,0,0);
      event.sender.send('connected', pipes.version)
    })

    pipes.once("disconnect", () => {
      event.sender.send("disconnect");
      pipes = null;
    });

    pipes.on("error", (error) => {
      event.sender.send("error", error.message);
      // dialog.showErrorBox("Nixie Pipe error", error)
      console.log(error.message)
      pipes = null;
    });

    pipes.on("busy", () => {
      event.sender.send("busy");
    })

    pipes.on("free", () => {
      event.sender.send("free");
    })
  } else {
    event.sender.send('connected', pipes.version)
  }
})

ipcMain.on('number-update', (event, pipe, number) => {
  // less than zero is for array setting
  if (pipe < 0) {
    pipes.setNumber(number);
  } else {
    pipes.setPipeNumber(pipe, number);
  }

  pipes.show();
})

ipcMain.on('colour-update', (event, pipe, rgb) => {
  // less than zero is for array setting
  if (pipe < 0) {
    pipes.setColour(rgb.r, rgb.g, rgb.b);
  } else {
    pipes.setPipeColour(pipe, rgb.r, rgb.g, rgb.b);
  }

  pipes.show();
})

ipcMain.on('set-units', (event, num_units) => {
  pipes.setNumberUnits(num_units);
})
