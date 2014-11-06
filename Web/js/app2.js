angular.module('ui.bootstrap.demo', ['ui.bootstrap']);
angular.module('ui.bootstrap.demo').controller('TypeaheadCtrl', function($scope, $http) {

  $scope.selected = [];
  // Any function returning a promise object can be used to load values asynchronously
  $scope.getLocation = function(val) {
    return $http.get('http://localhost:5000/api/tags', {
      params: {
        query: val
      }
    }).then(function(response){
      return response.data.data;
    });
  };

   recalculateTagValues = function() {
      // will divide the value based on the number of tags
      len = $scope.selected.length;
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

  $scope.noID = false;
});




// // the entrance of our app
// var myApp = angular.module('stackRecommend', []);

// // test, delete me
// myApp.factory('Data', function () {
//   return { message: "I'm data from a service" };
// });

// // api configuration params
// myApp.factory('ApiConfig', function () {
//   var Api = {}; 
//   // url parts
//   var appKey = "&key=XuUgyTQEsGuu1avMOxxnRw((";
//   var baseUrl = "http://api.stackexchange.com/2.2/";
//   var siteUrl = "&site=stackoverflow";
//   var api_users = "users";
//   var api_advanced = "search/advanced";
//   var order_reputation = "?order=desc&sort=reputation";
//   var order_popular = "?order=desc&sort=popular";
//   var order_activity = "?order=desc&sort=activity";
//   var order_creation = "?order=desc&sort=creation";
//   var byParam = "&inname=";
//   var urlPrefix = baseUrl;
//   var urlSuffix = siteUrl+appKey;
//   var tagged = "&tagged=";
//   var view_num = "&views=";
//   // var urlSuffixRep = order_reputation + siteUrl;
//   // var urlSuffixPop = order_popular + siteUrl;
//   // var urlSuffixAct= order_activity + siteUrl;
//   var tags = "tags";
//   var questions = "questions";
//   var answers = "answers";
//   var comments = "comments"

//   // api urls
//   Api.urlUsersByName = function(userSearchString){
//     return urlPrefix + api_users + order_reputation + byParam + userSearchString + urlSuffix;
//   };
//   Api.urlUserById = function(user_id){
//     return urlPrefix + api_users +'/'+ user_id + order_reputation + urlSuffix;
//   };
//   Api.urlUserTags = function(user_id){
//     return urlPrefix + api_users +'/'+ user_id +'/'+tags + order_popular + urlSuffix;
//   };
//   Api.urlUserQuestions = function(user_id){
//     return urlPrefix + api_users +'/'+ user_id +'/'+questions + order_activity + urlSuffix;
//   };
//   Api.urlUserAnswers = function(user_id){
//     return urlPrefix + api_users +'/'+ user_id +'/'+answers + order_activity + urlSuffix;
//   };
//   Api.urlUserComments = function(user_id){
//     return urlPrefix + api_users +'/'+ user_id +'/'+comments + order_creation + urlSuffix;
//   };
//   Api.urlPostsMostViewsTags = function(tag, numView){
//     return urlPrefix + api_advanced + order_activity + tagged + tag + view_num + numView + urlSuffix;
//   };

//   return Api;
// });

// // data for searching the right user
// myApp.factory('Users',['$http', 'ApiConfig',  function($http, ApiConfig){
// 	var Users = {};
// 	Users.items = {};
//   Users.selected = 0;
//   Users.userSearchString = 'adriano almeida';
//   Users.err = {};
//   Users.err_msg = '';

//   var api = ApiConfig;

//   // get info from users from stackoverflo
//   Users.fetchClients = function (userSearchString) {
//       // create the url param
//       if(/^\d+$/.test(userSearchString)) {
//         //url = api.urlPrefix + api.api_users +'/'+ userSearchString + api.urlSuffixRep + api.appKey
//         url = api.urlUserById(userSearchString);
//       }
//       else {
//         //url =  api.urlPrefix + api.api_users + api.urlSuffixRep + api.byParam + userSearchString + api.appKey
//         url = api.urlUsersByName(userSearchString);
//       }

//       // do the real call
//       $http.get(url)
//           .success(function(data, status, headers, config){
//             // save only the client list
//             Users.items = data.items;
//           })
//           .error(function(data, status, headers, config){
//             // something went wrong
//             Users.err = data;
//             Users.err_msg = data.error_message;
//           });
//   };

// 	return Users;
// }]);

// // data about the user 
// myApp.factory('UserProfile', ['$http', 'ApiConfig', function($http, ApiConfig){
//   var UP = {};
//   //UP.posts = {};
//   UP.tags = {};
//   UP.questions = {};
//   UP.answers = {};
//   UP.comments = {};
//   UP.err = {};
//   UP.err_msg = '';

//   var api = ApiConfig;

//   UP.fetchUserInfo = function(user) {
//     // save user info
//     UP.user_info = user;

//     // get tags info
//     $http.get(api.urlUserTags(user.user_id))
//         .success(function(data, status, headers, config){
//           // save only the client list
//           UP.tags = data.items;
//         })
//         .error(function(data, status, headers, config){
//           // something went wrong
//           UP.err = data;
//           UP.err_msg = data.error_message;
//         });

//     // get questions info
//     $http.get(api.urlUserQuestions(user.user_id))
//         .success(function(data, status, headers, config){
//           // save only the client list
//           UP.questions = data.items;
//         })
//         .error(function(data, status, headers, config){
//           // something went wrong
//           UP.err = data;
//           UP.err_msg = data.error_message;
//         });

//     // get answers info
//     $http.get(api.urlUserAnswers(user.user_id))
//         .success(function(data, status, headers, config){
//           // save only the client list
//           UP.answers = data.items;
//         })
//         .error(function(data, status, headers, config){
//           // something went wrong
//           UP.err = data;
//           UP.err_msg = data.error_message;
//         });

//     // get comments info
//     $http.get(api.urlUserComments(user.user_id))
//         .success(function(data, status, headers, config){
//           // save only the client list
//           UP.comments = data.items;
//         })
//         .error(function(data, status, headers, config){
//           // something went wrong
//           UP.err = data;
//           UP.err_msg = data.error_message;
//         });
//   }

//   return UP;
// }])

// myApp.factory('Posts', ['$http', 'ApiConfig', function($http, ApiConfig){
//   var Posts = {};

//   // api stuff
//   var api = ApiConfig;

//   // posts data
//   Posts.postsSimpleRecom = [];
//   Posts.postsUserRecom = [];
//   Posts.postsContenRecom = [];

//   Posts.fetchSimpleRecom = function(tags){
//     // for each of the top 5 tags of the user
//     for (var i=0; i<tags.slice(0,5).length; i++) {
//       // get comments info
//       $http.get(api.urlPostsMostViewsTags(tags[i].name, 100000))
//           .success(function(data, status, headers, config){
//             // save the posts in a single vector to mix them later
//             for (var q=0; q<data.items.slice(0,5).length; q++) {
//               Posts.postsSimpleRecom.push(data.items[q]);  
//             }
//           })
//           .error(function(data, status, headers, config){
//             // something went wrong
//             Posts.err = data;
//             Posts.err_msg = data.error_message;
//           });
//     }
//   };

//   return Posts;
// }])

// // controls the user search part
// myApp.controller('UsersCtrl', ['$scope','Users', 'UserProfile', function($scope, Users, UserProfile){
// 	$scope.Users = Users;
//   $scope.UP = UserProfile;

//   $scope.selectUser = function(user) {
//     $scope.Users.selected = user;
//   }

//   $scope.propName = function(prop, value){
//    for(var i in prop) {
//        if (prop[i] == value){
//             return i;
//        }
//    }
//    return false;
//   }

//   $scope.fetchUserInfo = function() {
//     $scope.UP.fetchUserInfo($scope.Users.selected); 
//   }

// }]); 

// // control the user interaction after we know who is he
// myApp.controller('UserProfileCtrl', ['Users','UserProfile','$scope', 
//                   function(Users, UserProfile, $scope){
//   $scope.UP = UserProfile;
//   $scope.Users = Users;
  
// }]);

// // recommended posts
// myApp.controller('RecommendPostsCtrl', ['$scope', 'Users', 'UserProfile','Posts',
//                   function($scope, Users, UserProfile, Posts){
//   // data from other services
//   $scope.Users = Users;
//   $scope.UP = UserProfile;
//   $scope.Posts = Posts;

//   // get a simple recommendation
//   $scope.getRecommendPosts = function(){
//     $scope.Posts.fetchSimpleRecom($scope.UP.tags);
//   };
  
// }]);

// // control the post list - test, delete me
// myApp.controller('PostsCtrl', ['$scope','Data','Users', 'UserProfile', 
//   function($scope, Data, Users, UserProfile){
// 	$scope.data = Data;
//   $scope.users = Users;
//   $scope.UP = UserProfile;
// }]); 


// // test. delete me
// var users = {
//   "items": [
//     {
//       "badge_counts": {
//         "bronze": 9,
//         "silver": 2,
//         "gold": 0
//       },
//       "account_id": 2115513,
//       "is_employee": false,
//       "last_access_date": 1410911740,
//       "reputation_change_year": 63,
//       "reputation_change_quarter": 46,
//       "reputation_change_month": 14,
//       "reputation_change_week": 0,
//       "reputation_change_day": 0,
//       "reputation": 128,
//       "creation_date": 1354728790,
//       "user_type": "registered",
//       "user_id": 1879940,
//       "accept_rate": 89,
//       "link": "http://stackoverflow.com/users/1879940/adriano-almeida",
//       "display_name": "Adriano Almeida",
//       "profile_image": "https://www.gravatar.com/avatar/a7f1687599d1c712aec1c91a8c883d37?s=128&d=identicon&r=PG"
//     },
//     {
//       "badge_counts": {
//         "bronze": 2,
//         "silver": 0,
//         "gold": 0
//       },
//       "account_id": 1962775,
//       "is_employee": false,
//       "last_modified_date": 1397580645,
//       "last_access_date": 1409226596,
//       "reputation_change_year": 5,
//       "reputation_change_quarter": 5,
//       "reputation_change_month": 0,
//       "reputation_change_week": 0,
//       "reputation_change_day": 0,
//       "reputation": 6,
//       "creation_date": 1350854753,
//       "user_type": "registered",
//       "user_id": 1763821,
//       "website_url": "",
//       "link": "http://stackoverflow.com/users/1763821/adriano-almeida",
//       "display_name": "Adriano Almeida",
//       "profile_image": "https://www.gravatar.com/avatar/4d17b8e3b4127c6114515d387460068c?s=128&d=identicon&r=PG"
//     }
//   ],
//   "has_more": false,
//   "quota_max": 10000,
//   "quota_remaining": 9988
// }