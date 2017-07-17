angular.module('mean.system')
.controller('GameController', ['$scope', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$dialog','$http', function ($scope, game, $timeout, $location, MakeAWishFactsService, $dialog, $http) {
    $scope.checkedBoxCount = 0;
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.invitedUsers = [];
    $scope.pickedCards = [];
    var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();
    $scope.introJS = introJs();

    $scope.pickCard = function(card) {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            //delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.searchUser = () => {
      const playerName = (game.players[game.playerIndex].username);
      const searchTerm = $scope.searchTerm || ' ';
      const playerData = { name: playerName, searchTerm };
      $http.get(`/api/search/users/${JSON.stringify(playerData)}/`)
      .success((response) => {
        $scope.users = response.filter((player) => {
          return player.name !== playerName;
        });
      });
    };

    $scope.countCheckedBox = () => {
      const userDetails = $scope.users.filter(user => (
        user.selected
      ));
      $scope.checkedBoxCount = userDetails.length;
      if ($scope.checkedBoxCount > 10) {
        const inviteSuccessful = $('#playerRequirement');
        inviteSuccessful.find('.modal-body')
        .text("You can only invite 11 friends, not a country.");
        inviteSuccessful.modal('show');
        }
    };

    $scope.sendMail = () => {
    const userDetails = $scope.users.filter(user => (
    user.selected
  ));
    userDetails.forEach((name) => {
      const details = JSON.stringify(
        { name: name.name,
          email: name.email,
          url: `${encodeURIComponent(window.location.href)}` });
      $http.get(`/api/sendmail/${details}`).then((response) => {
        if(response.data.invited === true){
          $scope.invitedUsers.push(name.email);
        }
      });
    });
    $scope.searchString = '';
    $scope.users = '';
    // Close invitation modal and show mail sent information
      const myModal = $('#users-modal');
      myModal.modal('hide');

      // show successful modal when invitations sent out successfully
      const inviteSuccessful = $('#playerRequirement');
      inviteSuccessful.find('.modal-body')
      .text("Invites sent to users' email");
      inviteSuccessful.modal('show');
  };

    $scope.pointerCursorStyle = function() {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return {'cursor': 'pointer'};
      } else {
        return {};
      }
    };

    $scope.sendPickedCards = function() {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      } else {
        return false;
      }
    };

    $scope.cardIsSecondSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      } else {
        return false;
      }
    };

    $scope.firstAnswer = function($index){
      if($index % 2 === 0 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.secondAnswer = function($index){
      if($index % 2 === 1 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.showFirst = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
    };

    $scope.showSecond = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
    };

    $scope.isCzar = function() {
      return game.czar === game.playerIndex;
    };

    $scope.isPlayer = function($index) {
      return $index === game.playerIndex;
    };

    $scope.isCustomGame = function() {
      return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
    };

    $scope.isPremium = function($index) {
      return game.players[$index].premium;
    };

    $scope.currentCzar = function($index) {
      return $index === game.czar;
    };

    $scope.winningColor = function($index) {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      } else {
        return '#f9f9f9';
      }
    };

    $scope.pickWinning = function(winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function() {
      return game.winningCard !== -1;
    };

    $scope.startGame = function() {
      game.startGame();
    };

    $scope.abandonGame = function() {
      game.leaveGame();
      window.user = null;
      $location.path('/');
    };

    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', function() {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', function() {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }
    });

    $scope.$watch('game.gameID', function() {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({game: game.gameID});
          if(!$scope.modalShown){
            setTimeout(function(){
              var link = document.URL;
              var txt = 'Give the following link to your friends so they can join your game: ';
              $('#lobby-how-to-play').text(txt);
              $('#oh-el').css({'text-align': 'center', 'font-size':'22px', 'background': 'white', 'color': 'black'}).text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });

    /**
     * @description this sets a cookie with a name and expiry date
     * @function
     * @param {number} expires the cookie validity in days
     * @returns {void}
     */
    $scope.setOnboardingCookie = (expires) => {
      const date = new Date();
      date.setTime(date.getTime() + (expires * 24 * 60 * 60 * 1000));
      document.cookie = `onboardinguser=CFH;expires=${date.toUTCString()};path=/`;
    };

    /**
     * @description this gets a cookie using it's name
     * @function
     * @param {string} cookieName the cookie name
     * @returns {void}
     */
    $scope.getCookieByName = (cookieName) => {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i += 1) {
        const name = cookies[i].split('=')[0];
        const value = cookies[i].split('=')[1];
        if (name === cookieName) {
          return value;
        } else if (value === cookieName) {
          return name;
        }
      }
      return '';
    };

    /**
     * @description checks if there is no cookie and onboards the user
     * @function
     * @returns {void}
     */
    $scope.checkCookie = () => {
      const username = $scope.getCookieByName('onboardinguser');
      if (username !== 'CFH') {
        $scope.setOnboardingCookie(365);

        $scope.introJS.setOptions({
          steps: [
            {
              intro: `Welcome to Cards for Humanity, a game for despicable people
                      desprately trying to do good. <br />
                      I'm here to give you a tour and get you up to speed with
                      playing the game. <br />
                      While you're having fun and enjoying the game,
                      please don't forget to make a donation. <br />
                      So if you're ready, click the next button to start the tour`
            },
            {
              element: '#player-count-container',
              intro: `This is the number of current available players and the maximum
                      number of players that can play the game. You need a minimum of 
                      three (3) players to start the game`
            },
            {
              element: '#question-container-outer',
              intro: `When the minimum number of players is reached, a start game button will be shown
                      in this container. Any player can click on the button to start the game. When a
                      game is started, questions will appear here`
            },
            {
              element: '#info-container',
              intro: `Different cards containing answers to the questions will appear here. Select the
                      cards(s) you think best answers the question`,
              position: 'top'
            },
            {
              element: '#inner-timer-container',
              intro: `This countdown timer shows you how much time you have left to pick
                      a card. (both as a player and as a czar)`
            },
            {
              element: '#player-score',
              intro: `This is each player's score. First player to reach 
                      five (5) wins the game.`
            },
            {
              element: '#abandon-game-button',
              intro: `You can leave the game any time by clicking on the abandon
                      game button`
            },
            {
              intro: `Thank you for taking the tour. Please remember to make a donation.
                      All donations go to the Make a Wish foundation`
            },
          ]
        });

        setTimeout(() => {
          $scope.introJS.start();
        }, 500);
      }
    };

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame',$location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame',null,true);
    } else {
      game.joinGame();
    }

}]);
