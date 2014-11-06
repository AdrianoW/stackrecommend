var userModel = angular.module('userModel'
, ['srServices']);

var userModel = userModel.controller('UserModelCtrl', [
    '$scope',
    'UserProfile',
    'Posts',
    'ApiConfig',
    '$http',
    'SrvAlertsManager',
    '$rootScope',
    function($scope, UserProfile, Posts, ApiConfig, $http, SrvAlertsManager, $rootScope){
        $scope.UP = UserProfile;
        $scope.Posts = Posts;
        $scope.test = 'User recommendation';
        var api = ApiConfig;
        var user_tags = ''
        // adjust this parameter to change the number of possible tags
        var top_num = 5;

        var createJsonFromTags = function(tags) {
            temp_json = {};
            // iterate over array up until 100 tags
            for(var i=0; i< tags.slice(0,100).length; i++) {
                temp_json[tags[i].name] = tags[i].count;
            }
            return temp_json;
        };

        $scope.getRecommendedUsers = function() {
            // query the recommendation api
            if( (isEmpty($scope.UP.tags) )||
                ($scope.UP.tags.length === 0)) {
                SrvAlertsManager.addAlert('No tags to use this model.');
            } else {
                tags = createJsonFromTags($scope.UP.tags);
                top_tags = $scope.UP.tags.slice(0,top_num);
                return $http.post(api.urlUserRecommender(),tags)
                    .then(function(response, status, headers, config) {
                        $scope.Posts.fetchUsersPosts(response.data.clients_list, top_tags, true)
                    }, function(response, status, headers, config){
                      if (response.data!="") {
                        // srvError.setError(data);
                        SrvAlertsManager.addAlert(response.data.message);
                      } else {
                        SrvAlertsManager.addAlert('Unable to connect to server.');
                        return $q.dismiss
                      }
                    });
            } 
        };

        $scope.getRecommendedUsers();

        $scope.unescape = function(str) {
            return Encoder.htmlDecode(str);
        }

}]);
