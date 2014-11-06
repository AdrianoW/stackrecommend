var rsDirectives = angular.module('srDirectives', ['srServices', 'ui.bootstrap',
  'angulartics',
  'angulartics.google.analytics'])
.directive('srnavBar', ['SrvLocation', function(SrvLocation) {
    function LocationCtrl( $scope, SrvLocation ) {
        $scope.loc = SrvLocation;
    }
    return {
        restrict: 'E',
        templateUrl:'partials/menu.html',
        controller: LocationCtrl
    }
}])
.directive('srfooter', ['SrvLocation',function(SrvLocation) {
    function LocationCtrl( $scope, SrvLocation ) {
        $scope.loc = SrvLocation;
    }
    return {
        restrict: 'E',
        templateUrl:'partials/footer.html',
        controller: LocationCtrl
    }
}])
.directive('userSelection', function() {
    return {
        restrict: 'E',
        templateUrl:'partials/userSelection.html',
        scope: {
            Users: '=users',
            selectUser: '&?'
        }
    }
})
.directive('srAlerts', ['SrvAlertsManager', function(SrvAlertsManager) {
    function AlertsCtrl( $scope, SrvAlertsManager ) {
        $scope.alerts = SrvAlertsManager.alerts;
    }
    return {
        restrict: 'E',
        templateUrl: 'partials/alerts.html',
        controller: AlertsCtrl
    }
}])
.directive('postElement', ['$analytics', '$window', function() {
    function PostElemCtrl($scope, $analytics, $window) {
      $scope.openPost = function(post, index) {
        // send the metrics to ga and open a new window
        $analytics.eventTrack('Recommender', {  category: 'question_id', label: post.question_id });
        $analytics.eventTrack('Recommender', {  category: 'post_pos', label: index });
        $window.open(post.link);
      }
    }
    return {
        restrict: 'E',
        templateUrl: 'partials/postElement.html',
        controller: PostElemCtrl
    }
}])
.directive('srLoading', ['SrvLoadingManager', function(SrvLoadingManager) {
    function LoadingCtrl( $scope, SrvLoadingManager ) {
        $scope.load = SrvLoadingManager;
    }
    return {
        restrict: 'E',
        templateUrl: 'partials/loading.html',
        controller: LoadingCtrl
    }
}])
.directive('srTagsSearch', [ 'SrvAlertsManager','ApiConfig', function() {
    function TagSearchCrtl($scope, $http, SrvAlertsManager, ApiConfig) {
      $scope.selected = [];
      // Any function returning a promise object can be used to load values asynchronously
      $scope.getLocation = function(val) {
        return $http.get(ApiConfig.urlQueryTags(val)
          // , {
          // params: {
          //   query: val
          // }}
        ).then(function(response){
          return response.data.data;
        }, function(response) {
            if(response.data !="") {
              SrvAlertsManager.addAlert(response.data);
            } else {
              SrvAlertsManager.addAlert('Unable to connect to server.');
            }
            return [];
        });
      };

      $scope.hasTags = function() {
        return $scope.selected.length===0;
      };

      recalculateTagValues = function() {
          // will divide the value based on the number of tags
          len = $scope.selected.length;

          if (len==0){
            return;
          }

          for(var i=0; i<len-1; i++) {
            $scope.selected[i].value = 1/(Math.pow(2,i+1));
          }
          $scope.selected[len-1].value = 1/(Math.pow(2,len-1));
       }

       // will be called when clicked on the list
       $scope.onSelect = function ($item, $model, $label) {
        $scope.asyncSelected = '';
        $scope.selected.push({'name':$item, 'value':0});
        recalculateTagValues();
        };

        // remove tags from the vector
        $scope.removeTag = function(tag) {
          $scope.selected.remove(tag);
          recalculateTagValues();
        }
    }
    return {
        restrict: 'E',
        templateUrl: 'partials/tagSearch.html',
        controller: TagSearchCrtl,
        submitSearchTag: '&?'
    }
}])
;
