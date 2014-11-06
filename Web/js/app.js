// the entrance of our app
var myApp = angular.module('stackRecommend',   [
	'ngRoute',
	'srControllers',
  'srServices',
  'angulartics',
  'angulartics.google.analytics'
]);

// routers/controllers configuration
myApp.config(['$routeProvider',
  function($routeProvider, $analyticsProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/home.html',
        controller: 'UsersCtrl'
      }).
      when('/selectUser', {
        templateUrl: 'partials/users.html',
        controller: 'UsersCtrl'
      }).
      when('/recommender', {
        templateUrl: 'partials/recommender.html',
        controller: 'RecomModelCtrl'
      }).
      // when('/recommend/simple', {
      //   templateUrl: 'partials/recommendSimple.html',
      //   controller: 'RecommendPostsCtrl'
      // }).
      when('/contact', {
        templateUrl: 'partials/contact.html',
        controller: 'ContactCtrl'
      }).
      when('/project', {
        templateUrl: 'partials/project.html',
        controller: 'ProjectCtrl'
      }).
      when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });


  }]);

myApp.factory('IntClearError', ['SrvAlertsManager', function(SrvAlertsManager) {
    // $log.debug('$log is here to show you that this is a regular factory with injection');

    var myInterceptor = {
        request: function(config) {
                // SrvAlertsManager.clearAlerts();
                if(config.url.match('partials')) {
                  SrvAlertsManager.clearAlerts();
                }
                return config;
              }
    };

    return myInterceptor;
}]);

myApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('IntClearError');
}]);


