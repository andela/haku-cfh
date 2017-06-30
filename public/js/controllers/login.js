angular.module('mean.system')
    .controller('LoginController', ['$scope', '$http', '$location', 'Global', function ($scope, $http, $location, Global) {
        "use strict";

        $scope.global = Global;

        $scope.user = {};

        $scope.login = function() {
            $http({
                url: '/api/auth/login',
                method: 'POST',
                data: $scope.user
            }).then(function(response) {
                localStorage.token = response.data.token;
                $location.path('/#!/app');
            }, function(error) {
                alert(error.data);
            });
        };
    }]);