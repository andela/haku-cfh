angular.module('mean.system')
.controller('IndexController', ['$scope', '$http', 'Global', '$location', '$window', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $location, $window, socket, game, AvatarService) {
    $scope.global = Global;

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });

    $scope.logout = function () {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        $http.get('/signout');
        $location.path('/');
    };

    $scope.playWithFriends = function() {
      $scope.data = { player_region: $scope.region };
      $http.post('/region', $scope.data)
       .success(function (data) {
         
       });
       $window.location.href = '/play?custom';
      }

      $scope.playAsAGuest = function() {
        $scope.data = { player_region: $scope.region };
        $http.post('/region', $scope.data)
        .success(function (data) {
         
        });
         $window.location.href = '/play';
      }

}]);
