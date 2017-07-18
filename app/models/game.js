const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  gameId: { type: String, required: true },
  gameRound: { type: Number, default: 0 },
  gameOwner: { type: String, required: true },
  gameWinner: { type: String, required: true },
  gamePlayers: { type: Array, default: [] },
  gameEnded: { type: Boolean, default: false },
  timePlayed: { type: Date, default: new Date().toGMTString() }
});

mongoose.model('Game', GameSchema);
