var srControllers = angular.module('srControllers', [
  'srServices',  
  'srDirectives',
  'simpleModel',
  'userModel',
  'angulartics',
  'angulartics.google.analytics']);

// controls the user search part
srControllers.controller('UsersCtrl', [
  '$scope',
  'Users', 
  'UserProfile',
  '$location',
  '$analytics',
   function($scope, Users, UserProfile, $location, $analytics){
    $scope.Users = Users;
    $scope.UP = UserProfile;
    $scope.noId = false;

    // $scope.url = 'http://localhost:5000/api/tags';
    // $scope.tagAutocompleteSelected = [];
    // $scope.tagAutocompleteModel = {};

    $scope.selectUser = function(user) {
      $scope.Users.selected = user;
      $scope.goToUser();
    }

    $scope.propName = function(prop, value){
     for(var i in prop) {
         if (prop[i] == value){
              return i;
         }
     }
     return false;
    }

    $scope.goToUser = function() {
      //$scope.UP.fetchUserInfo($scope.Users.selected); 
      $analytics.eventTrack('search', {  category: 'selected_id', label: $scope.Users.selected.user_id });
      $location.path('/recommender').search({'user_id':$scope.Users.selected.user_id, 'type':'user_id'});
    }

    $scope.submitSearchTag = function(tags_list) {
      search = {'type':'tags'};
      for(var i= 0; i<tags_list.length; i++) {
        k = tags_list[i].name;
        v = tags_list[i].value;
        search[k]=v;
        }
       //$scope.UP.fetchUserInfo($scope.Users.selected); 
       $analytics.eventTrack('search', {  category: 'tags', label: tags_list.join(',') });
      $location.path('/recommender').search(search);
    }
    
}]); 

// control the user interaction after we know who is he
// var UserProfileCtrl = srControllers.controller('UserProfileCtrl', [
//   'Users',
//   'UserProfile',
//   '$scope', 
//   '$routeParams',
//   '$location',
//   function(Users, UserProfile, $scope, $routeParams, $location){
//     $scope.UP = UserProfile;
//     $scope.Users = Users;

//     // load user info
//     $scope.loadUser = function (user_id) {
//       // give priority to what is in the URL
//       if (user_id) {
//         if( $scope.Users.selected && 
//             $scope.Users.selected.user_id == user_id ) {
//           $scope.UP.fetchUserInfo($scope.Users.selected);
//         } else {
//           $scope.UP.fetchAllUserInfoById(user_id);  
//         };
//       }
//     };

//     // check what kind of param came in
//     if( typeof($routeParams.type)==='undefined') {
//       $location.url('/selectUser');  
//     }else if($routeParams.type == 'user_id') {
//       $scope.loadUser($routeParams.user_id);
//     } else if ($routeParams.type == 'tags') {
//       alert('searchbytags');
//     } else {
//       // param invalid
//       // $location.url('/selectUser');
//       RecomModelCtrl.selectModel('Simple Model');
//     };
    
  
// }]);

// UserProfileCtrl.readData = function($q,$routeParams,UserProfile) {
//     var a = $routeParams;
//     var defer = $q.defer();
//     UserProfile.fetchUserInfo($routeParams.id);
//     defer.resolve();
//     return defer.promise;
//   }

// recommended posts
srControllers.controller('RecomModelCtrl', [
  'Users',
  'UserProfile',
  '$scope', 
  '$routeParams',
  '$location', 
  'SrvLoadingManager',
  '$analytics',
  'SrvModel',
  function(Users, UserProfile, $scope, $routeParams, $location, SrvLoadingManager, $analytics, SrvModel){
  // data from other services
  $scope.load = SrvLoadingManager; 
  $scope.UP = UserProfile;
  $scope.Users = Users;
  $scope.models = SrvModel;

  // load user info
  $scope.loadUser = function (user_id) {
    // give priority to what is in the URL
    if (user_id) {
      if( $scope.Users.selected && 
          $scope.Users.selected.user_id == user_id ) {
        $scope.UP.fetchUserInfo($scope.Users.selected)
        .then(function(data){ 
          
        });
      } else {
        $scope.UP.fetchAllUserInfoById(user_id)
        .then(function(data){ 
         
        });
      };
    }
  };

  // // model choose properties
  // var modelsList = {};
  // $scope.currModel = '';
  // $scope.registerModel = function(name, prop) {
  //   modelsList[name] = prop;
  // }
  // $scope.getModelsList = function() {
  //   return modelsList;
  // }
  // $scope.getModelIcon= function(modelName) {
  //   return modelsList[modelName].icon;
  // }
  // $scope.selectModel = function(modelName) {
  //   $analytics.eventTrack('Recommender', {category: 'model', label: modelName});
  //   if ($scope.currModel != '') {
  //     $scope.currModel.selected = false;
  //   }
  //   $scope.currModel = modelsList[modelName];  
  //   $scope.currModel.selected = true;
  // }

  // use user model
  // $scope.$watch($scope.UP.loaded, function() {
  //     if ($scope.UP.loaded) {
  //       alert($scope.UP.loaded);  
  //       // $scope.models.selectModel('User Model'); 
  //      }
  // });

  var init = function() {    
    // check what kind of param came in
    if( typeof($routeParams.type)==='undefined') {
      $location.url('/selectUser');  
    }else if($routeParams.type == 'user_id') {
      $scope.loadUser($routeParams.user_id);     
    } else if ($routeParams.type == 'tags') {
      // fill a tag structure and put in the user profile
      tags = [];
      for(var key in $routeParams){
        if( ($routeParams.hasOwnProperty(key)) && (key != 'type')) {
          tags.push({'name': key, 'count':parseFloat($routeParams[key]*100)})
        }
      }
      // add the tags to the user profile
      $scope.UP.tags = tags;
      $scope.UP.loaded = true;
      $scope.models.selectModel('User Model');
    } else {
      // param invalid
      $location.url('/selectUser');
    }
  }
  
  $scope.$on('$routeChangeSuccess', function () {
    init();
  });
}]);

srControllers.controller('ProjectCtrl', ['$http', function(){
    
}]);

srControllers.controller('ContactCtrl', [
  '$http', 
  '$scope',
  'ApiConfig', 
  'SrvAlertsManager',
  function($http, $scope, ApiConfig, SrvAlertsManager){
  var api = ApiConfig;

  var init = function() {
    $scope.reset();
    //$scope.getCSRToken();
  } ;

  $scope.reset = function() {
    $scope.name='';
    $scope.email='';
    $scope.message='';
    $scope.sent = false;
  } ;   

  $scope.submitForm = function(isValid) {

    // function to submit the form after all validation has occurred
    if (isValid) {
      $http.post(api.urlContact(), 
        { name: $scope.name, email: $scope.email, message:$scope.message})
      .then( 
        function(data, textStatus, xhr) {
        /*optional stuff to do after success */
          $scope.reset();
          $scope.sent = true;
        }, function (data, textStatus, xhr) {
          SrvAlertsManager.setErrorMsg('Could not send your message. Please try again later.')
        });
    }
  };

  init();

}]);

srControllers.controller('LoginCtrl', ['$http', function(){
    
}]);