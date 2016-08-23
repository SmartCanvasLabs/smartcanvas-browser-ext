var FIREBASE;

(function() {
  var omni;
  

  var backgroundScript = {
    init: function(){
      this.events(); 
    },

    startENVIRONMENT: function(){
      var that = this;

      return new Promise(function(resolve, reject){

        chrome.cookies.getAll({
          domain: ENVIRONMENT._domain,
          name: 'tenant'
        }, function(cookies){
          var tenant = cookies[0] && cookies[0].value;

          if(!tenant){
            reject();
          }

          ENVIRONMENT.domain = ENVIRONMENT._domainProtocol + tenant + '.' +  ENVIRONMENT._domain;
          ENVIRONMENT.domainApi = ENVIRONMENT._domainProtocol + tenant + '.' +  ENVIRONMENT._domainApi;
          ENVIRONMENT.searchUrl = ENVIRONMENT.domain + ENVIRONMENT._searchPath;
          ENVIRONMENT.officialCardsApi = ENVIRONMENT.domainApi + ENVIRONMENT._officialCardsApiPath;
          ENVIRONMENT.userApi = ENVIRONMENT.domainApi + ENVIRONMENT._userApiPath;

          omni = new Omni(ENVIRONMENT.searchUrl);

          resolve(ENVIRONMENT);
        });

      });
    },

    // startContextMenus: function(){
    //   var that = this;

    //   chrome.contextMenus.removeAll();
    //   chrome.contextMenus.create({
    //     title: "Share a link",
    //     contexts: ["page"],
    //     onclick: function(e) {
    //       console.log('context-menu ', e);
    //     }
    //   });
    // },


    userLogin: function(){
      var that = this;

      return new Promise(function(resolve){

        that.startENVIRONMENT()
          .then(function(env){
            
            that.makeAjax({
              url: env.userApi
            })
              .then(function(data){
                var user = JSON.parse(data.response);
                that.startFirebase(user);
                resolve();
              }, function(){
                that.redirectToLogin();
              });

          });

      });

    },

    startFirebase: function(user){
      var that = this;

      FIREBASE = new Firebase(user.firebase.firebaseURL);

      FIREBASE.authWithCustomToken(user.firebase.token, function(error, authData) {
        if (error) {
          console.log('Firebase Authentication Failed', error);
          that.userLogin();
        } else {
          console.log('Firebase Authenticated successfully with payload:', authData);

          FIREBASE.child('users/' + authData.uid + '/foryou-card-stream').on('value', function(v) {
            console.debug('firebase update', 'users/' + authData.uid + '/foryou-card-stream', v);
            that.updateBadgeNumber();
          }, function(e){
            console.debug('firebase on-value error -> redirecting to login: ', e);
            that.userLogin();
          });

        }
      });

    },

    loginIfFirebaseIsNotAuthenticated: function(){
      var that = this;

      if( !(FIREBASE && FIREBASE.getAuth && FIREBASE.getAuth()) ){
        that.userLogin();
      }
    },

    updateBadgeNumber: function(){
      var that = this;

      that.startENVIRONMENT()
        .then(function(env){

          that.makeAjax({
            url: env.officialCardsApi
          })
          .then(function(data){
            var json = JSON.parse(data.response);
            var cards = json.data[0] && json.data[0].cards;
            var cardsFiltered = [];
            var card;

            if (cards && cards.length) {
              for (var i = 0; i < cards.length; i++) {
                card = cards[i];

                if(!card.interactionsState.viewed){
                  cardsFiltered.push(card);
                }
              }
            }

            that.setBadge(cardsFiltered.length);
          }, function(){
            that.redirectToLogin();
          });

        });
    },

    setBadge: function(num){
      chrome.browserAction.setBadgeText({
        'text': num ? String(num) : ''
      });

      chrome.browserAction.setBadgeBackgroundColor({
        'color': '#43a047'
      });
    },

    dynamicallyInjectContentScript: function(callback){
      chrome.tabs.executeScript({
        file: 'scripts/contentscript.js'
      },function(){
        chrome.tabs.insertCSS({
          file: 'styles/contentscript.css'
        }, callback);
      });
    },

    getToken: function(){
      var that = this;
      return new Promise(function(resolve, reject) {        
        
        that.startENVIRONMENT()
          .then(function(env){

            chrome.cookies.getAll({
              url: env.domain,
              name: 'acctk'
            }, function(cookies){
              if(cookies[0]){
                resolve(cookies[0].value);
              }else{
                reject();
              }
            });

          });
        
      });
    },

    makeAjax: function(obj){
      var that = this;

      return new Promise(function(resolve, reject){
        that.getToken()
          .then(function(token){
            that.xhrPromise({
              url: obj.url,
              method: obj.method,
              data: obj.data,
              token: token
            })
            .then(function(data){
              resolve(data);
            }, function(e){
              reject(e);
            });
          }, function(){
            reject();
          });
        });

    },

    xhrPromise: function(opts) {
      opts = opts || {};
      opts.method = opts.method || 'GET';

      return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open(opts.method, encodeURI(opts.url), true);
        req.withCredentials = true;

        if(opts.token){
          req.setRequestHeader('x-access-token', opts.token);  
        }

        req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        
        req.onload = function() {
          if (req.status === 200) {
            resolve(req);
          }
          else{
            reject(req);
          }
        };
        
        req.onerror = function() {
          reject(Error('Network Error'));
        };

        req.send();
      });
    },

    redirectToChromeExtensionPage: function(){
      var that = this;

      that.startENVIRONMENT()
        .then(function(env){
          chrome.tabs.create({ url: env.domain + '/f/chrome-extension' });
        });
    },

    redirectToLogin: function() {
      var that = this;

      that.startENVIRONMENT()
        .then(function(env){
          var newURL = env.domainLogin + '/?reason=401&redirectFrom='+encodeURIComponent(env.domain + '/f/chrome-extension') + '#!/signin';
          chrome.tabs.create({ url: newURL });
          that.setBadge('');
        });
    },

    openDialogMessage: function(){
      var that = this;

      that.loginIfFirebaseIsNotAuthenticated();

      Promise.all([
        that.startENVIRONMENT(),
        that.getToken()
      ])

      .then(function(data){
        var env = data[0];
        var token = data[1];


          
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, { 
            type: 'open-dialog', 
            token: token, 
            environment: env
          },function(response){
            
            if(!response){
              that.dynamicallyInjectContentScript(function(){
                chrome.tabs.sendMessage(tabs[0].id, { 
                  type: 'open-dialog', 
                  token: token, 
                  environment: env
                });
              });
            }

          });
        });

      }, function(){
        that.redirectToLogin();
      });

    },

    events: function(){
      var that = this;

      //Refernce: https://github.com/ProLoser/Github-Omnibox
      chrome.omnibox.onInputEntered.addListener(function(text) {
        console.log('[smartcanvas.onInputEntered]: ', text);
        if (text) omni.decide(text);
      });
    
      chrome.runtime.onInstalled.addListener(function(details){
        that.userLogin()
          .then(function(){
            that.redirectToChromeExtensionPage();
          })
      });

      chrome.browserAction.onClicked.addListener(function(){
        that.openDialogMessage();
      });

      chrome.runtime.onMessage.addListener(function(request) {
        if(request.type === 'open-chrome-extension-event'){
          that.openDialogMessage();
        }else if(request.type === 'set-badge'){
          that.setBadge(request.value);
        }else if(request.type === 'extension-bg-redirect-to-login'){
          that.redirectToLogin();
        }
      });

    }

  };

  backgroundScript.init();

})();