angular
  .module('mean.system')
  .controller('LoginController', [
    '$scope',
    '$http',
    '$window',
    '$location',
    'Global',
    ($scope, $http, $window, $location, Global) => {
      $scope.global = Global;
      $scope.user = {};

      $scope.login = () => {
        $scope.errorMsg = '';
        $http({ url: '/api/auth/login', method: 'POST', data: $scope.user })
          .then((response) => {
            if (response.data.token !== undefined) {
              localStorage.token = response.data.token;
              $location.path('/app');
            }
          }, (error) => {
            $scope.errorMsg = error.data.message;
          });
      };
    }
  ]);
