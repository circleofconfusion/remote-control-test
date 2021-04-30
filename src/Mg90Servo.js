const i2cBus = require('i2c-bus');
const { Pca9685Driver } = require('pca9685');

// PCA9685 options
const pwmOptions = {
  i2c: i2cBus.openSync(1),
  address: 0x40,
  frequency: 50,
  debug: false
};

// startup connection to Pca9685 board
const pwm = new Pca9685Driver(pwmOptions, (err) => {
  if (err) {
    console.error("Error initializing PCA9685!");
    process.exit(-1);
  }
});

function mapAxisToPwm(axisVal, min, mid, max) {

  if (axisVal >= 0) {
    return mid + (max - mid) * axisVal;
  } else {
    return mid + (mid - min) * axisVal;
  }
}

class Mg90Servo {
  channel;
  min = 500;
  mid = 1500;
  max = 2500;

  constructor(channel) {
    if (+channel === NaN || +channel < 0) throw Error('Channel required!');

    this.channel = channel;
  }

  setSweep(axisVal) {
    const mappedValue = mapAxisToPwm(axisVal, this.min, this.mid, this.max);
    pwm.setPulseLength(this.channel, mappedValue);
  }
} 

module.exports = Mg90Servo;
