const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GameSchema = new Schema({
  gameId: { type: String, required: true, unique: true, dropDups: true },
  gameRound: { type: Number, default: 0 },
  gameOwner: { type: String, required: true },
  gameWinner: { type: String, required: true },
  gamePlayers: { type: Array, default: [] },
  gameEnded: { type: Boolean, default: false },
  gameStartTime: { type: Date, default: Date.now }
});

mongoose.model('Game', GameSchema);
