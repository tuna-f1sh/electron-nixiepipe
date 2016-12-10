const {ipcRenderer} = require('electron')
const ColorPicker = require('simple-color-picker');
window.$ = window.jQuery = require('jquery');

var colourdivs = document.querySelectorAll('.colour-picker')
var pipeh1 = $('.pipe-h1')
var pipeButtonUp = $('.pipe-up')
var pipeButtonDown = $('.pipe-down')
let colourpickers = []

window.onload = function windowLoad() {

  for (var i = 0; i < colourdivs.length; i++ ) {
    colourpickers[i] = new ColorPicker({
      color: '#FFFFFF',
      el: document.body,
      width: 100,
      height: 75
    });
    colourpickers[i].appendTo(colourdivs[i])
    $(pipeButtonUp[i]).prop('disabled', true);
    $(pipeButtonDown[i]).prop('disabled', true);
  }

}

function connectPress() {
  var button = document.querySelector("#connect")

  ipcRenderer.send('connect-click')
  $("#refresh-connect").addClass('glyphicon-refresh-animate');
  button.disabled = true;
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
    ipcRenderer.send('color-update', i, cp.getRGB())
  });

  $(pipeButtonUp[i]).on('click', function() {up(i) } );
  $(pipeButtonDown[i]).on('click', function() {down(i) } );
  $(pipeButtonUp[i]).prop('disabled', false);
  $(pipeButtonDown[i]).prop('disabled', false);
}


ipcRenderer.on('connected', (event,ver) => {
  var button = document.querySelector("#connect")

  $("#refresh-connect").removeClass('glyphicon-refresh-animate');

  button.style.background = "green";
  $("#connect").text("Connected V: " + ver);

  for (var i = 0; i < colourdivs.length; i++ ) {
    setupPipe(i)
  }

})

ipcRenderer.on('disconnect', (event) => {
  var button = document.querySelector("#connect")
  $("#refresh-connect").removeClass('glyphicon-refresh-animate');

  button.style.background = "gray";
  button.disabled = false;
  $("#connect").text("Connect");
});

ipcRenderer.on('busy', (event) => {
  $("#refresh-connect").addClass('glyphicon-refresh-animate');
})

ipcRenderer.on('free', (event) => {
  $("#refresh-connect").removeClass('glyphicon-refresh-animate');
})
