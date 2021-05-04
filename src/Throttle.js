const { pwm, mapAxisToPwm } = require('./Pca9685');

class Throttle {
  channel;
  min = 1000;
  mid = 1520;
  max = 2000;

  constructor(channel) {
    if (+channel === NaN || +channel < 0) throw Error('Channel required!');

    this.channel = channel;
  }

  setSpeed(axisVal) {
    const mappedValue = mapAxisToPwm(axisVal, this.min, this.mid, this.max);
    pwm.setPulseLength(this.channel, mappedValue);
  }
}

module.exports = Throttle;
