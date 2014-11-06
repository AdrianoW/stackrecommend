var srServices = angular.module('srServices', [
  'angulartics',
  'angulartics.google.analytics']);

// api configuration params
srServices.factory('ApiConfig', function () {
  var Api = {}; 
  // url parts
  var appKey = "dfasdsadsads";
  var baseUrl = "http://api.stackexchange.com/2.2/";
  var siteUrl = "&site=stackoverflow";
  var api_users = "users";
  var api_advanced = "search/advanced";
  var order_reputation = "?order=desc&sort=reputation";
  var order_popular = "?order=desc&sort=popular";
  var order_activity = "?order=desc&sort=activity";
  var order_creation = "?order=desc&sort=creation";
  var byParam = "&inname=";
  var urlPrefix = baseUrl;
  var urlSuffix = siteUrl+appKey;
  var tagged = "&tagged=";
  var view_num = "&views=";
  // var urlSuffixRep = order_reputation + siteUrl;
  // var urlSuffixPop = order_popular + siteUrl;
  // var urlSuffixAct= order_activity + siteUrl;
  var tags = "tags";
  var questions = "questions";
  var top_questions = "top-questions";
  var top_answers = "top-answers";
  var answers = "answers";
  var comments = "comments"
  var baseRecommender = "http://apistack.wmayer.com.br/api/";
  //var baseRecommender = "http://localhost:5000/api/";
  var userRecommender = "userRecommender";
  var contact = "contact";
  var tags_list = "tags?query=";

  // api urls
  Api.urlUsersByName = function(userSearchString){
    return urlPrefix + api_users + order_reputation + byParam + encodeURIComponent(userSearchString) + urlSuffix;
  };
  Api.urlUserById = function(user_id){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) + order_reputation + urlSuffix;
  };
  Api.urlUserTags = function(user_id){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) +'/'+tags + order_popular + urlSuffix;
  };
  Api.urlUserQuestions = function(user_id){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) +'/'+questions + order_activity + urlSuffix;
  };
  Api.urlUserQuestionsByTag = function(user_id, tag){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) + '/' + tags + '/'+ encodeURIComponent(tag) + '/'+top_questions + order_activity + urlSuffix;
  };
  Api.urlUserAnswersByTag = function(user_id, tag){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) + '/' + tags + '/'+ encodeURIComponent(tag) + '/'+top_answers + order_activity + urlSuffix;
  };
  Api.urlUserAnswers = function(user_id){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) +'/'+answers + order_activity + urlSuffix;
  };
  Api.urlUserComments = function(user_id){
    return urlPrefix + api_users +'/'+ encodeURIComponent(user_id) +'/'+comments + order_creation + urlSuffix;
  };
  Api.urlPostsMostViewsTags = function(tag, numView){
    return urlPrefix + api_advanced + order_activity + tagged + encodeURIComponent(tag) + view_num + numView + urlSuffix;
  };
  Api.urlUserRecommender = function() {
    return baseRecommender + userRecommender;
  };
  Api.urlContact = function() {
    return baseRecommender + contact;
  };
  Api.urlQuestions = function(questions_list) {
    return urlPrefix + questions +'/'+ encodeURIComponent(questions_list)  + order_activity + urlSuffix;
  };
  Api.urlQueryTags = function(query) {
    return baseRecommender + tags_list + query;
  }

  return Api;
});

// data for searching the right user
srServices.factory('Users',[
  '$http', 
  'ApiConfig',
  'SrvAlertsManager',
  '$analytics',
  function($http, ApiConfig, SrvAlertsManager, $analytics){
  var Users = {};
  Users.items = {};
  Users.selected = 0;
  Users.userSearchString = '';
  Users.SrvAlertsManager = SrvAlertsManager;

  var api = ApiConfig;

  // get info from users from stackoverflow
  Users.fetchClients = function (userSearchString) {
      // create the url param
      if(/^\d+$/.test(userSearchString)) {
        //url = api.urlPrefix + api.api_users +'/'+ userSearchString + api.urlSuffixRep + api.appKey
        url = api.urlUserById(userSearchString);
        $analytics.eventTrack('Search', {category: 'user_id', label: userSearchString});
      }
      else {
        //url =  api.urlPrefix + api.api_users + api.urlSuffixRep + api.byParam + userSearchString + api.appKey
        url = api.urlUsersByName(userSearchString);
        $analytics.eventTrack('Search', {category: 'user_name', label: userSearchString});
      }

      // do the real call
      $http.get(url)
          .success(function(data, status, headers, config){
            // if there is a client, save it. Else, return the problem to the user
            if (data.items.length>=1) {
              Users.items = data.items;
              Users.SrvAlertsManager.clearAlerts();  
            } else {
              Users.SrvAlertsManager.addAlert('No user found with the parameters passed. Please verify and try it again.');
            }
            
          })
          .error(function(data, status, headers, config){
            // something went wrong
            if (data!="") {
              // Users.SrvAlertsManager.setError(data);
              Users.SrvAlertsManager.addAlert(data.error_message);
            } else {
              Users.SrvAlertsManager.addAlert('Unable to connect to server.');
            }
            
          });
  };

    return Users;
}]);


srServices.factory('SrvModel', function($analytics) {
  var model = {};
  model.msg = '';
    
  // model choose properties
  var modelsList = {};
  model.currModel = '';

  model.registerModel = function(name, prop) {
    modelsList[name] = prop;
  }
  model.getModelsList = function() {
    return modelsList;
  }
  model.getModelIcon= function(modelName) {
    return modelsList[modelName].icon;
  }
  model.selectModel = function(modelName) {
    $analytics.eventTrack('Recommender', {category: 'model', label: modelName});
    if (model.currModel != '') {
      model.currModel.selected = false;
    }
    model.currModel = modelsList[modelName];  
    model.currModel.selected = true;
  }

  init = function() {
    // register the models controllers 
    model.registerModel('User Model', 
      {'ctrl':'UserModelCtrl', 'url': 'partials/recomUser.html', 
       'icon':'fa-group', 'name': 'User Model', 'selected': false});
    model.registerModel('Simple Model', 
      {'ctrl':'SimpleModelCtrl', 'url': 'partials/recomSimple.html', 
       'icon':'fa-code', 'name': 'Simple Model', 'selected': false});
    }

  init();

  return model;
})

// data about the user 
srServices.factory('UserProfile', [
  '$http', 
  'ApiConfig', 
  'SrvAlertsManager',
  'SrvLoadingManager',
  'SrvModel',
  function($http, ApiConfig, SrvAlertsManager, SrvLoadingManager,SrvModel){
  var UP = {};
  //UP.posts = {};
  UP.tags = {};
  UP.questions = {};
  UP.answers = {};
  UP.comments = {};
  UP.SrvAlertsManager = SrvAlertsManager;
  UP.user = {}  ;
  UP.loaded = false;
  UP.availableTags = [];
  UP.selectedTags = [];

  var api = ApiConfig;
  var model = SrvModel;

  UP.loadTags = function(query) {
        return $http.get(api.urlQueryTags(query)).then(function(response){
          UP.availableTags = response.data.data;
        }, function(response, status, headers, config){
            if (response.data!="") {
              // UP.SrvAlertsManager.setError(data);
              UP.SrvAlertsManager.addAlert(data.error_message);
            } else {
              UP.SrvAlertsManager.addAlert('Unable to connect to server.');
            }
        });
    };

  UP.fetchAllUserInfoById = function(user_id){
    SrvLoadingManager.loadMsg('Loading user info')
    // user is a number, fetch info
    if (/^\d+$/.test(user_id)) {
      url = api.urlUserById(user_id);
      // do the real call
      return $http.get(url)
          .then(function(data, status, headers, config){
            if (data.data.items.length===1) {
              UP.fetchUserInfo(data.data.items[0]).success(function(){
                model.selectModel('User Model');
                return true;
              })
            } else{
              // UP.SrvAlertsManager.setError(data);
              UP.SrvAlertsManager.addAlert('User id non existant');
              UP.loaded = false;
              return $q.reject('User id non existant'); 
            };

          } , function(response, status, headers, config){
            msg = '';
            if (response.data!="") {
              // UP.SrvAlertsManager.setError(data);
              msg = data.error_message;
            } else {
              msg = 'Unable to connect to server.';
            }
            UP.loaded = false;
            return $q.reject(msg)
          })
          .finally(function(){
            SrvLoadingManager.loadOff();
          });
    } else {
      // things did not work
      UP.SrvAlertsManager.addAlert('User id not valid');
      return $q.reject('User id not valid')
    }
  }

  UP.fetchUserInfo = function(user) {
    
    UP.user = user;

    // get tags info
    return $http.get(api.urlUserTags(UP.user.user_id))
        .success(function(data, status, headers, config){
          // the tags
          UP.tags = data.items;
          
          // check if he has tags
          if ( data.items.length===0 ) {
            UP.SrvAlertsManager.addAlert('User has not tags, unable to use models. Please go back and select some tags on the previous page.');  
            return false;
          }
          model.selectModel('User Model');
          UP.loaded = true;
          return true;
        })
        .error(function(data, status, headers, config){
          msg = "";
          if (data!="") {
            // UP.SrvAlertsManager.setError(data);
            msg= data.error_message;
          } else {
            msg= 'Unable to connect to server.';
          }
          UP.SrvAlertsManager.addAlert(msg);
          UP.loaded = false;
          return $q.reject(msg)
        });

    // // get questions info
    // $http.get(api.urlUserQuestions(UP.user.user_id))
    //     .success(function(data, status, headers, config){
    //       // save the questions
    //       UP.questions = data.items;
    //     })
    //     .error(function(data, status, headers, config){
    //       if (data!="") {
    //         // UP.SrvAlertsManager.setError(data);
    //         UP.SrvAlertsManager.addAlert(data.error_message);
    //       } else {
    //         UP.SrvAlertsManager.addAlert('Unable to connect to server.');
    //       }
    //     });

    // // get answers info
    // $http.get(api.urlUserAnswers(UP.user.user_id))
    //     .success(function(data, status, headers, config){
    //       // save answers
    //       UP.answers = data.items;
    //     })
    //     .error(function(data, status, headers, config){
    //       if (data!="") {
    //         // UP.SrvAlertsManager.setError(data);
    //         UP.SrvAlertsManager.addAlert(data.error_message);
    //       } else {
    //         UP.SrvAlertsManager.addAlert('Unable to connect to server.');
    //       }
    //     });

    // // get comments info
    // $http.get(api.urlUserComments(UP.user.user_id))
    //     .success(function(data, status, headers, config){
    //       // user comments
    //       UP.comments = data.items;
    //     })
    //     .error(function(data, status, headers, config){
    //       if (data!="") {
    //         UP.SrvAlertsManager.setError(data);
    //         UP.SrvAlertsManager.addAlert(data.error_message);
    //       } else {
    //         UP.SrvAlertsManager.addAlert('Unable to connect to server.');
    //       }
    //     });
  }
  return UP;
}])

srServices.factory('Posts', [
  '$http', 
  'ApiConfig', 
  'SrvAlertsManager',
  'SrvLoadingManager',
  function($http, ApiConfig, SrvAlertsManager, SrvLoadingManager){
  var Posts = {};
  Posts.postsSimpleRecom = [];
  Posts.postsUserRecom = [];
  Posts.postsContenRecom = [];
  
  // control of the simple recommender
  var max_tags = 7;
  min_view = 50000;

  // control of the user recommender 
  var users_list;
  var user_tags;
  var usersAnswers;
  var min_posts = 30;

  // api stuff
  var api = ApiConfig;

  // error service
  Posts.SrvAlertsManager = SrvAlertsManager;

  Posts.fetchSimpleRecom = function(tags){
    Posts.resetPosts();

    // for each of the top max_tags tags of the user
    SrvLoadingManager.loadMsg('Loading posts');
    for (var i=0; i<tags.slice(0,max_tags).length; i++) {
      // get comments info
      SrvLoadingManager.loadMsg('Loading posts for the tag '+ tags[i].name);
      $http.get(api.urlPostsMostViewsTags(tags[i].name, min_view))
          .success(function(data, status, headers, config){
            // save the posts in a single vector to mix them later
            for (var q=0; q<data.items.slice(0,max_tags).length; q++) {
              Posts.postsSimpleRecom.push(data.items[q]);  
            }
            Posts.SrvAlertsManager.clearAlerts();
          })
          .error(function(data, status, headers, config){
            if (data!="") {
              // Posts.SrvAlertsManager.setError(data);
              Posts.SrvAlertsManager.addAlert(data.error_message);
            } else {
              Posts.SrvAlertsManager.addAlert('Unable to connect to server.');
            }
          })
          .finally(function(){
            SrvLoadingManager.loadOff();
          });
    }
  };

  Posts.fetchUsersPosts = function(users, users_tags, first_time, by_answers){
    if(typeof(by_answers)==='undefined') by_answers = true;

    // clean the structures
    if (first_time) {
      Posts.resetPosts();
      users_list = users;
      user_tags = users_tags;
      usersAnswers = [];
    }

    // randomically choose users
    // users_list = users.slice(0,100).join(';');
    var user = users_list[Math.floor(Math.random() * users_list.length)];
    users_list.remove(user);

    // get questions for the first tag
    if(by_answers) {
      Posts.fecthUserQuestionsByTagAnswers(user, user_tags[0] )  
    } else {
      Posts.fecthUserTagQuestions(user, user_tags[0])
    }
    
   // }
  };

  Posts.fecthUserTagQuestions = function(user_id, tag){
      SrvLoadingManager.loadMsg('Loading posts...');
      $http.get(api.urlUserQuestionsByTag(user_id, tag))
        .success(function(data, status, headers, config){
          // save the posts in a single vector to mix them later
          for (var q=0; q<data.items.length; q++) {
            Posts.postsUserRecom.push(data.items[q]);  
          }
          Posts.SrvAlertsManager.clearAlerts();

          // check if there is at least min questions. 
          // if not, call the same function again
          if (Posts.postsUserRecom.length<=min_posts) {
            Posts.fetchUsersPosts(user_id , tag, false);
          } 
        })
        .error(function(data, status, headers, config){
          if (data!="") {
            // Posts.SrvAlertsManager.setError(data);
            Posts.SrvAlertsManager.addAlert(data.error_message);
          } else {
            Posts.SrvAlertsManager.addAlert('Unable to connect to server.');
          }
        })
        .finally(function(){
            SrvLoadingManager.loadOff();
          });
  }

  Posts.fecthUserQuestionsByTagAnswers = function(user_id, tag){
      SrvLoadingManager.loadMsg('Fetching questions...');
      $http.get(api.urlUserAnswersByTag(user_id, tag.name))
        .success(function(data, status, headers, config){
          // save the posts in a single vector to mix them later
          for (var q=0; q<data.items.length; q++) {
            usersAnswers.push(data.items[q].question_id);  
          }
          Posts.SrvAlertsManager.clearAlerts();

          // check if there is at least min questions. 
          // if not, call the same function again
          if (usersAnswers.length<=min_posts) {
            Posts.fetchUsersPosts(user_id , tag, false);
          } else {
            // now that we have enough answers, get questions
            Posts.fetchQuestions(usersAnswers.join(';'));
          }

        })
        .error(function(data, status, headers, config){
          if (data!="") {
            // Posts.SrvAlertsManager.setError(data);
            Posts.SrvAlertsManager.addAlert(data.error_message);
          } else {
            Posts.SrvAlertsManager.addAlert('Unable to connect to server.');
          }
        })
        .finally(function(){
            SrvLoadingManager.loadOff();
          });
  }

  Posts.fetchQuestions = function(questions_id) {
    SrvLoadingManager.loadMsg('Loading questions...');
    $http.get(api.urlQuestions(questions_id))
      .success(function(data, status, headers, config){
        // save the posts in a single vector to mix them later
        for (var q=0; q<data.items.length; q++) {
          Posts.postsUserRecom.push(data.items[q]);  
        }
        Posts.SrvAlertsManager.clearAlerts();
      })
      .error(function(data, status, headers, config){
        if (data!="") {
          // Posts.SrvAlertsManager.setError(data);
          Posts.SrvAlertsManager.addAlert(data.error_message);
        } else {
          Posts.SrvAlertsManager.addAlert('Unable to connect to server.');
        }
      })
      .finally(function(){
            SrvLoadingManager.loadOff();
          });
  }

  Posts.resetPosts = function () {
    Posts.postsSimpleRecom = [];
    Posts.postsUserRecom = [];
    Posts.postsContenRecom = [];
  };

  var init = function() {
    Posts.resetPosts();
  };

  init();

  return Posts;
}])

// srServices.factory('SrvError', function(){
//   var error = {};
 
//   error.clearError = function () {
//     error.err_flag = false;
//     error.err_msg = '';
//     error.err = {};
//   }
//   error.clearError();

//   error.setError = function(err) {
//     error.err = err;
//     error.err_flag = true;
//   };

//   error.getError = function() {
//     return error.err;
//   };

//   error.hasError = function() {
//     return error.err_flag;
//   };

//   error.setErrorMsg = function (msg) {
//     error.err_msg = msg;
//     error.err_flag = true;
//   };

//   error.getErrorMsg = function () {
//     return error.err_msg;
//   };

//   return error;
// })

srServices.factory('SrvLocation', [ 
  '$location',
   function($location){
    var loc = {};

    var location = $location;

    loc.isCurrLocation = function(loc) {
      return location.path().match(loc) ;
    };

    loc.getCurrLocation = function() {
      return location.path();
    }

    return loc;
}])

srServices.factory('SrvAlertsManager', function() {
    return {
        alerts: {},
        addAlert: function(message, type) {
            if(typeof(type)==='undefined') type = 'alert-danger';
            this.alerts[type] = this.alerts[type] || [];
            this.alerts[type].push(message);
        },
        clearAlerts: function() {
            for(var x in this.alerts) {
               delete this.alerts[x];
            }
        }
    };
})

srServices.factory('SrvLoadingManager', function() {
    var load = {};
    load.msg = '';
    load.loadMsg = function(message){
      load.msg = message;
    }

    load.loadOff = function(message){
      load.msg = '';
    }
    return load;
    // return {
    //     msg: 'Limpo',
    //     loadMsg: function(message) {
    //         // just change the loading message
    //         this.msg = message;
    //     },
    //     loadOff: function() {
    //         this.msg = 'Limpo';
    //     }
    // };
})

;
