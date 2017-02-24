const {ipcRenderer} = require('electron')
const ColorPicker = require('simple-color-picker');
window.$ = window.jQuery = require('jquery');

// API tools
var Forecast = require('forecast');
var yahooFinance = require('yahoo-finance');
var os  = require('os-utils');
var NodeGeocoder = require('node-geocoder');
// API keys in .env file
require('dotenv').config()

// setup active GUI stuff
var colourdivs = $('.colour-picker').get().reverse()
var pipeh1 = $('.pipe-h1').get().reverse()
var pipeButtonUp = $('.pipe-up').get().reverse()
var pipeButtonDown = $('.pipe-down').get().reverse()
var pipeFuncButtons = $('.pipe-functions')
let colourpickers = []

var cycleTask = null

// Initialize forcast
var forecast = new Forecast({
  service: 'darksky',
  key: process.env.DARKSKY_API,
  units: 'celcius',
  cache: true,      // Cache API requests
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
    minutes: 60,
    seconds: 0
  }
});

// Geocoder setup for lon/lat from location
var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GOOGLE_API, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

var weatherIcons = {
  "clear-day" : 0,
  "clear-night" : 0,
  "partly-cloudy-day" : 3,
  "partly-cloudy-night" : 0,
  "cloudy:" : 2,
  "rain:" : 1,
  "sleet:" : 4,
  "snow:" : 4, 
  "wind:" : 5,
  "fog" : 7
}

// do all this on window load (script loaded at end anyway but might as well be sure)
window.onload = function windowLoad() {

  for (var i = 0; i < colourdivs.length; i++ ) {
    colourpickers[i] = new ColorPicker({
      color: '#FFFFFF',
      el: document.body,
      width: 100,
      height: 75
    });
    colourpickers[i].appendTo(colourdivs[i])
    // $(pipeButtonUp[i]).prop('disabled', true);
    // $(pipeButtonDown[i]).prop('disabled', true);
  }
  
  // $(".pipe-down").prop('disabled',true);
  dimOn()

}

function dimOff()
{
    document.getElementById("darkLayer").style.display = "none";
}
function dimOn()
{
    document.getElementById("darkLayer").style.display = "";
}

function setPipeh1(number) {
  var digit

  if (!isNaN(number)) {
    for (var i = 0; i < pipeh1.length; i++) {
      digit = Math.floor(number % 10)
      number /= 10
      $(pipeh1[i]).text(digit)
    }
  }
}

function getPipeh1(callback) {
  var digit
  var number = 0

  for (var i = 0; i < pipeh1.length; i++) {
    digit = parseInt($(pipeh1[i]).text(),10);
    number += (digit * Math.pow(10,i))
  }

  callback(number)
}


function connectPress() {
  var button = document.querySelector("#connect")

  ipcRenderer.send('connect-click')
  $("#refresh-connect").addClass('glyphicon-refresh-animate');
  button.disabled = true;
  $('.error-msg').css('display', 'none')

}

function up(i) {
  var number = parseInt($(pipeh1[i]).text(),10);

  if (number < 9) {
    number = number + 1;
  } else {
    number = 0
  }

  $(pipeh1[i]).text(number);
  ipcRenderer.send('number-update', i, number);
}

function down(i) {
  var number = parseInt($(pipeh1[i]).text(),10);

  if (number > 0) {
    number = number - 1;
  } else {
    number = 9
  }

  $(pipeh1[i]).text(number);
  ipcRenderer.send('number-update', i, number);
}

function setupPipe(i) {
  var cp = colourpickers[i]
  var h1 = $(pipeh1[i])

  colourpickers[i].onChange( function() {
    // h1.style.color = cp.getHexString()
    h1.css('color',cp.getHexString())
    ipcRenderer.send('colour-update', i, cp.getRGB())
  });

  $(pipeButtonUp[i]).on('click', function() {up(i) } );
  $(pipeButtonDown[i]).on('click', function() {down(i) } );
  $(pipeButtonUp[i]).prop('disabled', false);
  $(pipeButtonDown[i]).prop('disabled', false);
}

function runCounter() {
  var number = 0
  var id = $("#cycle")

  if (cycleTask === null) {
    pipeFuncButtons.prop('disabled',true);
    id.css('color',"red")
    id.text("stop")
    setPipeh1(number)
    ipcRenderer.send('number-update', -1, number++);
    id.prop('disabled',false);

    cycleTask = setInterval( function() {
      ipcRenderer.send('number-update', -1, number);
      setPipeh1(number)
      if (number < 9999) { 
        number++
      } else { 
        number = 0 
      }
    }, 1000)
  } else {
    clearInterval(cycleTask)
    cycleTask = null
    id.removeAttr('style');
    id.text("Timer")
    pipeFuncButtons.prop('disabled', false);
  }

}

function countDown() {

  getPipeh1( function(number) {
    var id = $("#cdown")

    if (cycleTask === null) {
      pipeFuncButtons.prop('disabled', true);

      id.css('color',"red")
      id.text("stop")
      ipcRenderer.send('number-update', -1, number);
      setPipeh1(number)
      id.prop('disabled', false);

      cycleTask = setInterval( function() {
        if (number > 0) { 
          number-- 
        } else { 
          clearInterval(cycleTask); 
          cycleTask = null
          id.removeAttr('style');
          id.text("Countdown")
          pipeFuncButtons.prop('disabled', false);
        }

        ipcRenderer.send('number-update', -1, number);
        setPipeh1(number)
      }, 1000)
    } else {
      clearInterval(cycleTask)
      cycleTask = null
      id.removeAttr('style');
      id.text("Countdown")
      pipeFuncButtons.prop('disabled', false);
    }
  })
}

function clock() {
  var id = $("#clock")
  
  // first press, start clock
  if (cycleTask === null) {
    pipeFuncButtons.prop('disabled', true);
    id.css('color',"red")
    id.text("stop")

    // set the time on display before starting timer
    var date = new Date();
    var time = date.getHours() * 100
    time += date.getMinutes()
    ipcRenderer.send('number-update', -1, time);
    setPipeh1(time)
    id.prop('disabled', false);

    // update the display using timer every 1s
    cycleTask = setInterval( function() {
      var date = new Date();
      var time = date.getHours() * 100
      time += date.getMinutes()
      ipcRenderer.send('number-update', -1, time);
      setPipeh1(time)
    }, 1000)

  // second press, stop clock
  } else {
    clearInterval(cycleTask)
    cycleTask = null
    id.removeAttr('style');
    id.text("Clock")
    pipeFuncButtons.prop('disabled', false);
  }
}

function stockTicker() {
  var symbol = $('#stock-symbol').val()
  var id = $("#ticker")

  if (cycleTask === null) {
    pipeFuncButtons.prop('disabled', true);

    id.css('color',"red")
    id.text("stop")
    yahooFinance.snapshot({
      symbol: symbol,
      fields: ['l1', 'c1'],
    }, function (err, snapshot) {
      if (snapshot.change > 0) {
        ipcRenderer.send('colour-update', -1, {'r': 0, 'g': 255, 'b': 0} );
      } else {
        ipcRenderer.send('colour-update', -1, {'r': 255, 'g': 0, 'b': 0} ) ;
      }

      ipcRenderer.send('number-update', -1, Math.round(snapshot.lastTradePriceOnly));
      setPipeh1(snapshot.lastTradePriceOnly)
    });

    id.prop('disabled', false);

    cycleTask = setInterval( function() {
      symbol = $('#stock-symbol').val()
      yahooFinance.snapshot({
        symbol: symbol,
        fields: ['l1', 'c1'],
      }, function (err, snapshot) {
        if (snapshot.change > 0) {
          ipcRenderer.send('colour-update', -1, {'r': 0, 'g': 255, 'b': 0} );
        } else {
          ipcRenderer.send('colour-update', -1, {'r': 255, 'g': 0, 'b': 0} ) ;
        }

        ipcRenderer.send('number-update', -1, Math.round(snapshot.lastTradePriceOnly));
        setPipeh1(snapshot.lastTradePriceOnly)
      });
    }, 10000)
  } else {
    clearInterval(cycleTask)
    cycleTask = null
    id.removeAttr('style');
    id.text("Ticker")
    pipeFuncButtons.prop('disabled', false);
  }
}

function cpu() {
  var id = $("#cpu")
  var units = $("#units-weather").is(':checked');

  var displayCpu = () => {
    os.cpuUsage(function(v){
        v *= 100;
        // console.log( 'CPU Usage (%): ' + v );
        if (units)
          ipcRenderer.send('number-update',0,8)
        ipcRenderer.send('number-update', -1, v);
        setPipeh1(v)
    });
  }
  
  // first press, start clock
  if (cycleTask === null) {
    pipeFuncButtons.prop('disabled', true);

    // set units so we can display percent symbol if present
    ipcRenderer.send('set-units', units)

    id.css('color',"red")
    id.text("stop")
    id.prop('disabled', false);

    displayCpu()

    // update the display using timer every 1s
    cycleTask = setInterval( function() {
      displayCpu();
    }, 1000)

  // second press, stop clock
  } else {
    ipcRenderer.send('set-units', 0)
    clearInterval(cycleTask)
    cycleTask = null
    id.removeAttr('style');
    id.text("Cpu")
    pipeFuncButtons.prop('disabled', false);
  }
}

function weather() {
  var id = $("#weather")

  var city = $('#lon').val()
  var units = $("#units-weather").is(':checked');

  var lon;
  var lat;

  var displayWeather = () => {
    forecast.get([lat, lon], function(err, weather) {
      if (!err) {
        console.log(weather)
        // display celius
        ipcRenderer.send('number-update', -1, Math.abs(weather.currently.temperature));
        if (units) 
          ipcRenderer.send('number-update', 0, weatherIcons[weather.currently.icon])
        // display negagtive as blue
        if (weather.currently.temperature < 0)
          ipcRenderer.send('colour-update', -1, {'r': 0, 'g': 0, 'b': 255} ) ;
        // show on GUI display
        setPipeh1(Math.abs(weather.currently.temperature))
      }
    });
  }

  
  // first press, start clock
  if (cycleTask === null) {
    pipeFuncButtons.prop('disabled', true);
    id.css('color',"red")
    id.text("stop")
    
    // set units so we can display percent symbol if present
    ipcRenderer.send('set-units', units)

    geocoder.geocode(city, function(err, res) {
      if (err || (typeof res == "undefined")) {
        // $('#lon').style.background = "red";
        id.prop('disabled', false);
      } else {
        // $('#lon').removeAttr('style');
        console.log(res);
        lon = res[0].longitude
        lat = res[0].latitude;

        // enable stop button
        id.css('color',"red")
        id.text("stop")
        id.prop('disabled', false);

        displayWeather();
        
        // update the display using timer every 60s
        cycleTask = setInterval( function() {
          displayWeather();
        }, 60000)
      }
    });

  // second press, stop clock
  } else {
    ipcRenderer.send('set-units', 0)
    clearInterval(cycleTask)
    cycleTask = null
    id.removeAttr('style');
    id.text("Weather")
    pipeFuncButtons.prop('disabled', false);
  }
}


ipcRenderer.on('connected', (event,ver) => {
  var button = document.querySelector("#connect")

  $("#refresh-connect").removeClass('glyphicon-refresh-animate');
  $('.error-msg').css('display', 'none')

  button.style.background = "green";
  $("#connect").text("Connected V: " + ver);

  for (var i = 0; i < colourdivs.length; i++ ) {
    setupPipe(i)
  }

  dimOff()

})

ipcRenderer.on('disconnect', (event) => {

  var button = $("#connect")
  $("#refresh-connect").removeClass('glyphicon-refresh-animate');

  dimOn()

  button.removeAttr('style');
  button.prop('disabled',false);
  button.text("Connect");

  clearInterval(cycleTask)
  cycleTask = null
  pipeFuncButtons.removeAttr('style');
  pipeFuncButtons.text()
  pipeFuncButtons.prop('disabled', false);
});

ipcRenderer.on('busy', (event) => {
  $("#refresh-connect").addClass('glyphicon-refresh-animate');
})

ipcRenderer.on('free', (event) => {
  $("#refresh-connect").removeClass('glyphicon-refresh-animate');
})

ipcRenderer.on('error', (event, err) => {
  var button = $("#connect")
  $("#refresh-connect").removeClass('glyphicon-refresh-animate');

  $('.error-msg').css('display', 'inherit')
  $('#error-msg').text(err)
  console.log(err)

  dimOn()

  button.removeAttr('style');
  button.prop('disabled',false);
  button.text("Connect");
})
