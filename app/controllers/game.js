const mongoose = require('mongoose');

const Game = mongoose.model('Game');

exports.saveGame = (req, res) => {
  const game = new Game();
  game.gameID = req.params.gameId;
  game.rounds = req.body.gameRound;
  game.owner = req.body.gameOwner;
  game.winner = req.body.gameWinner;
  game.players = req.body.gamePlayers;
  game.ended = req.body.gameEnded;
  game.endTime = req.body.gameStartTime;
  game.save((error, gameDetails) => {
    if (error) {
      res.status(400)
        .json(error);
    }
    res.status(201)
      .json(gameDetails);
  });
};
