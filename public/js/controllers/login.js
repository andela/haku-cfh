angular.module('mean.system')
    .controller('LoginController', ['$scope', '$http', '$window', '$location', 'Global', function ($scope, $http, $window, $location, Global) {
        "use strict";

        $scope.global = Global;

        $scope.user = {};

        $scope.login = function() {
            $http({
                url: '/api/auth/login',
                method: 'POST',
                data: $scope.user
            }).then(function(response) {
                if (response.data.token !== undefined) {
                    localStorage.token = response.data.token;
                }
                $location.path('/#!/app');
            }, function(error) {
                $location.path('/#!/signin');
            });
        };
    }]);