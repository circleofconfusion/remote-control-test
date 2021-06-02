const express = require('express');
const app = express();
require('express-ws')(app);
const port = 3000;
const Mg90Servo = require('./Mg90Servo');
const Throttle = require('./Throttle');

// Define the servo
const throttle = new Throttle(1);
const servo1 = new Mg90Servo(2);
const servo2 = new Mg90Servo(3);

// Set servos to middle position
throttle.setSpeed(0);
servo1.setSweep(0);
servo2.setSweep(0);

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

/** Updates servos/throttle when message arrives over websocket */
function setServoPositions(stringifiedData) {
  const { leftX, leftY, rightX, rightY } = JSON.parse(stringifiedData);
  
  throttle.setSpeed(leftY);
  servo1.setSweep(rightX);
  servo2.setSweep(rightY);
}

/** If connection is lost, set throttle to 0 so vehicle stops */
function setFailsafe() {
  throttle.setSpeed(0);
}

