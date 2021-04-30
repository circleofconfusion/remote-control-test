const express = require('express');
const app = express();
require('express-ws')(app);
const i2cBus = require('i2c-bus');
const { Pca9685Driver } = require('pca9685');

// PCA9685 options
const pwmOptions = {
  i2c: i2cBus.openSync(1),
  address: 0x40,
  frequency: 50,
  debug: false
};

const pwm = new Pca9685Driver(pwmOptions, (err) => {
  if (err) {
    console.error("Error initializing PCA9685!");
    process.exit(-1);
  }
});

const port = 3000;

app.use(express.static(`${__dirname}/ui`));

app.ws('/control-status', ws => {
  ws.on('message', setServoPositions);
});

app.listen(3000, () => {
  console.log(`listening on port ${port}`);
});

function setServoPositions(stringifiedData) {
  const { leftX, leftY, rightX, rightY } = JSON.parse(stringifiedData);

  
  pwm.setPulseLength(0, mapAxisToPwm(leftX));
  pwm.setPulseLength(1, mapAxisToPwm(leftY));
  pwm.setPulseLength(2, mapAxisToPwm(rightX));
  pwm.setPulseLength(3, mapAxisToPwm(rightY));
}

function mapAxisToPwm(axisVal) {
  const pwmMin = 500;
  const pwmMid = 1400;
  const pwmMax = 2500;

  if (axisVal >= 0) {
    return pwmMid + (pwmMax - pwmMid) * axisVal;
  } else {
    return pwmMid + (pwmMid - pwmMin) * axisVal;
  }
}
