var simpleModel = angular.module('simpleModel'
, ['srServices']);

var SimpleModelCtrl = simpleModel.controller('SimpleModelCtrl', [
    '$scope',
    'Users', 
    'UserProfile',
    'Posts',
    function($scope, Users, UserProfile, Posts){
        $scope.UP = UserProfile;
        $scope.Posts = Posts;
        $scope.test = 'simple recommendation';

        // get a simple recommendation
        $scope.getRecommendPosts = function(){
            $scope.Posts.fetchSimpleRecom($scope.UP.tags);
        };

        $scope.unescape = function(str) {
            return Encoder.htmlDecode(str);
        }

        $scope.getRecommendPosts();

}]);
