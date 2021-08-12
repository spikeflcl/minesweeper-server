var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var playerSchema = new Schema(
  {
    username: {type: String, required: true, minLength: 3, maxLength: 100},
    password: {type: String, required: true, minLength: 8, maxLength: 150},
    wins: {type: Number, min: 0, default: 0},
    losses: {type: Number, min: 0, default: 0},
    gameTimes: [{type: Number, min: 0}],
    token: {type: String, minLength: 10, maxLength: 100}
  }
);

playerSchema
  .virtual('getAvgTime')
  .get(function () {
    const array = this.gameTimes;
    if (array.length === 0) return '0';

    let sum = 0;
    for ( let i = 0; i < array.length; i++ ) {
      sum += array[i];
    }

    const time = sum / array.length;
    return Math.round(time * 100) / 100;
  });

//Export model
module.exports = mongoose.model('Player', playerSchema);