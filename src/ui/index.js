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
  sendControlStatus(axes);
}

function mapAxes(rawAxes) {
  const mappedAxes = {
    leftX: rawAxes[0],
    leftY: -rawAxes[1],
    rightX: rawAxes[3],
    rightY: -rawAxes[4],
  }

  Object.entries(mappedAxes).forEach(([k,v]) => {
    if (v < 0.1 && v > -0.1) {
      mappedAxes[k] = 0;
    }
  });

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
