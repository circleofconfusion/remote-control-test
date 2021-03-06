const { pwm, mapAxisToPwm } = require('./Pca9685');

class Mg90Servo {
  channel;
  min = 550;
  mid = 1500;
  max = 2450;

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
