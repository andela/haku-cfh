angular.module('mean.system')
    .controller('RegisterController', ['$scope', '$http', '$location', 'Global', 'AvatarService', function ($scope, $http, $location, Global, AvatarService) {
        "use strict";
        $scope.global = Global;
        $scope.avatars = [];
        AvatarService.getAvatars()
            .then(function (data) {
                $scope.avatars = data;
            });

        $scope.user = {};

        $scope.createUser = function() {
            $http({
                url: '/api/auth/signup',
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