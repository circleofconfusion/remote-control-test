const express = require('express');
const app = express();
require('express-ws')(app);
const port = 3000;
const Mg90Servo = require('./Mg90Servo');
const Throttle = require('./Throttle');

// Define the servos
const rudder = new Mg90Servo(0);
const throttle = new Throttle(1);
const aileron = new Mg90Servo(2);
const elevator = new Mg90Servo(3);

// Set servos to middle position
rudder.setSweep(0);
throttle.setSpeed(0);
aileron.setSweep(0);
elevator.setSweep(0);

// Setup static web UI
app.use(express.static(`${__dirname}/ui`));

// Websocket channel to receive control status updates
app.ws('/control-status', ws => {
  ws.on('message', setServoPositions);
  ws.on('close', setFailsafe);
});

// Setup web server
app.listen(3000, () => {
  console.log(`listening on port ${port}`);
});

function setServoPositions(stringifiedData) {
  const { leftX, leftY, rightX, rightY } = JSON.parse(stringifiedData);
  
  rudder.setSweep(leftX);
  throttle.setSpeed(leftY);
  aileron.setSweep(rightX);
  elevator.setSweep(rightY);
}

function setFailsafe() {
  throttle.setSpeed(0);
}

