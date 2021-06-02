// Add event listener for connecting gamepad
window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
  setGamepadName(e.gamepad.id);
  startMainLoop(e.gamepad.index);
});

// setup websocket
const ws = new WebSocket('ws://192.168.1.111:3000/control-status');

function setGamepadName(name) {
  document.getElementById('gamepad-name').innerHTML = name;
}

let mainLoop;

const leftYExpoSlider = document.getElementById('left-y-expo-slider')
let leftYExpo = +leftYExpoSlider.value;

function startMainLoop(gamepadIndex) {
  mainLoop = setInterval(() => {
    pollGamepad(gamepadIndex);
  }, 50);
}

function pollGamepad(gamepadIndex) {
  const gp = navigator.getGamepads()[gamepadIndex];

  const axes = mapAxes(gp.axes)

  setStickPosition('left', axes.leftX, axes.leftY);
  setStickPosition('right', axes.rightX, axes.rightY);
  drawLeftYValue(axes.leftY);
  sendControlStatus(axes);
}

function mapAxes(rawAxes) {
  const mappedAxes = {
    leftX: rawAxes[0],
    leftY: -rawAxes[1],
    rightX: rawAxes[3],
    rightY: -rawAxes[4],
  }

  // set a "dead zone" of 0.1 around center
  Object.entries(mappedAxes).forEach(([k,v]) => {
    if (v < 0.1 && v > -0.1) {
      mappedAxes[k] = 0;
    }
  });

  // apply expo to leftY
  mappedAxes.leftY = expo(mappedAxes.leftY, leftYExpo);

  return mappedAxes;
}

function setStickPosition(position, x, y) {
  const stickCircle = document.querySelector(`#${position}-stick circle`);
  const cx = 110 + (x * 100);
  const cy = 110 - (y * 100);
  stickCircle.setAttribute('cx', cx);
  stickCircle.setAttribute('cy', cy);
}

function sendControlStatus(axes) {
  ws.send(JSON.stringify(axes));
}

// expo stuff

function expo(input, factor) {
  return ( (1 - factor / 100) * input**3 ) + ( factor / 100 * input );
}

// handle expo changes
leftYExpoSlider.addEventListener('input', evt => {
  leftYExpo = +evt.target.value;
  drawLeftYExpo();
});


function drawLeftYExpo() {
  const ctx = document.getElementById('left-y-expo').getContext('2d');
  ctx.clearRect(0,0,200,200);
  
  // cartesian plane
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  
  ctx.moveTo(100, 0);
  ctx.lineTo(100, 200);
  
  ctx.moveTo(0, 100);
  ctx.lineTo(200, 100);
  ctx.stroke();

  // cartesian plane numbers
  ctx.fillText('0,0', 105, 115);
  ctx.fillText('-1,0', 5, 115);
  ctx.fillText('1,0', 182, 115);
  ctx.fillText('0,-1', 105, 195);
  ctx.fillText('0,1', 105, 15);

  // curve
  ctx.beginPath();
  ctx.moveTo(0, 200);
  for (let input = -1; input < 1; input += .01) {
    ctx.lineTo(input * 100 + 100, 100 - expo(input, leftYExpo) * 100);
  }

  ctx.stroke();
}

function drawLeftYValue(value) {
  const ctx = document.getElementById('left-y-value').getContext('2d');
  ctx.clearRect(0,0,200,200);

  // input/output dot
  ctx.beginPath();
  ctx.arc(value * 100 + 100, 100 - expo(value, leftYExpo) * 100, 5, 0, 2 * Math.PI)
  ctx.fill();
}


// Draw expo curve when page loads
drawLeftYExpo();
