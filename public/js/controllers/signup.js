angular
  .module('mean.system')
  .controller('RegisterController', [
    '$scope',
    '$http',
    '$location',
    'Global',
    'AvatarService',
    ($scope, $http, $location, Global, AvatarService) => {
      $scope.global = Global;
      $scope.avatars = [];
      AvatarService
        .getAvatars()
        .then((data) => {
          $scope.avatars = data;
        });

      $scope.user = {};

      $scope.createUser = () => {
        $scope.errorMsg = '';
        $http({ url: '/api/auth/signup', method: 'POST', data: $scope.user }).then((response) => {
          if (response.data.token !== undefined) {
            localStorage.token = response.data.token;
            localStorage.setItem('user', JSON.stringify(response.data.user));
            $location.path('/app');
          }
        }, (error) => {
          $scope.errorMsg = error.data.message;
        });
      };
    }
  ]);
