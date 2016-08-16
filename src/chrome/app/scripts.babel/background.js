(function() {
  var omni;

  var backgroundScript = {
    init: function(){
      this.getTenantAndStartENV();
      this.events(); 
    },

    getTenantAndStartENV: function(callback){
      var that = this;

      chrome.cookies.getAll({
        domain: ENVIRONMENT._domain,
        name: 'tenant'
      }, function(cookies){
        var tenant = cookies[0] && cookies[0].value;

        ENVIRONMENT.domain = ENVIRONMENT._domainProtocol + tenant + '.' +  ENVIRONMENT._domain;
        ENVIRONMENT.domainApi = ENVIRONMENT._domainProtocol + tenant + '.' +  ENVIRONMENT._domainApi;
        ENVIRONMENT.searchUrl = ENVIRONMENT.domain + ENVIRONMENT._searchPath;
        ENVIRONMENT.officialCardsApi = ENVIRONMENT.domainApi + ENVIRONMENT._officialCardsApiPath;

        omni = new Omni(ENVIRONMENT.searchUrl);

        if(callback){
          callback();
        }
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

    redirectToLoginIfNotlogged: function(){
      var that = this;

      that.makeAjax({
        url: ENVIRONMENT.officialCardsApi,
        success: function(data){
          var json = JSON.parse(data.response);

          that.redirectToChromeExtensionPage();
          that.setBadge(json.meta.count);
        }
      });
    },

    redirectToChromeExtensionPage: function(){
      chrome.tabs.create({ url: ENVIRONMENT.domain + '/f/chrome-extension' });
    },

    redirectToLogin: function() {
      var newURL = ENVIRONMENT.domainLogin + '/?reason=401&redirectFrom='+encodeURIComponent(ENVIRONMENT.domain + '/f/chrome-extension') + '#!/signin';
      chrome.tabs.create({ url: newURL });
    },

    updateBadgeNumber: function(){
      var that = this;

      that.makeAjax({
        url: ENVIRONMENT.officialCardsApi,
        success: function(data){
          var json = JSON.parse(data.response);
          that.setBadge(json.meta.count);
        }
      });
    },

    openDialogMessage: function(){
      var that = this;

      that.getTenantAndStartENV(function(){
        that.getEnvironmentCookiePromise()
          .then(function(token){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
              chrome.tabs.sendMessage(tabs[0].id, { 
                type: 'open-dialog', 
                token: token, 
                environment: ENVIRONMENT
              });
            });
          }, function(){
            that.redirectToLogin();
          });        
      });
    },

    setBadge: function(num){
      chrome.browserAction.setBadgeText({
        'text': num ? String(num) : false
      });

      chrome.browserAction.setBadgeBackgroundColor({
        'color': '#43a047'
      });
    },

    getEnvironmentCookiePromise: function(){
      return new Promise(function(resolve, reject) {        
        chrome.cookies.getAll({
          url: ENVIRONMENT.domain,
          name: 'acctk'
        }, function(cookies){
          if(cookies[0]){
            resolve(cookies[0].value);
          }else{
            reject();
          }
        });
      });
    },

    makeAjax: function(obj){
      var that = this;

      that.getEnvironmentCookiePromise()
        .then(function(token){
          that.createPromiseHttpRequest({
            url: obj.url,
            method: obj.method,
            data: obj.data,
            token: token
          })
          .then(function(data){
            if(obj.success){
              obj.success(data);
            }
          }, function(e){
            if(obj.error){
              obj.error(e);
            }
          });
        }, function(){
          that.redirectToLogin();
        });
    },

    createPromiseHttpRequest: function(opts) {
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

    events: function(){
      var that = this;

      //Refernce: https://github.com/ProLoser/Github-Omnibox
      chrome.omnibox.onInputEntered.addListener(function(text) {
        console.log('[smartcanvas.onInputEntered]: ', text);
        if (text) omni.decide(text);
      });
    
      chrome.runtime.onInstalled.addListener(function(details){
        console.log('[smartcanvas.onInstalled]');
        console.log('previousVersion: ', details.previousVersion);
        that.redirectToLoginIfNotlogged();
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