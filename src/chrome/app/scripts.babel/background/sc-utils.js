var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.UTILS = (function(scState) {
  return {

    startVARS: function(){
      var that = this;

      return new Promise(function(resolve, reject){
        
        that.ENV = ENVIRONMENT;
        
        chrome.cookies.getAll({
          domain: that.ENV._domain,
          name: 'tenant'
        }, function(cookies){

          var tenant = cookies[0] && cookies[0].value;

          if(!tenant){
            reject();
          }

          that.ENV.domain = ENVIRONMENT._domainProtocol + tenant + '.' +  ENVIRONMENT._domain;
          that.ENV.domainApi = ENVIRONMENT._domainProtocol + tenant + '.' +  ENVIRONMENT._domainApi;
          that.ENV.searchUrl = that.ENV.domain + ENVIRONMENT._searchPath;
          that.ENV.officialCardsApi = that.ENV.domainApi + ENVIRONMENT._officialCardsApiPath;
          that.ENV.userApi = that.ENV.domainApi + ENVIRONMENT._userApiPath;
              
          chrome.cookies.getAll({
            url: that.ENV.domain,
            name: 'acctk'
          }, function(cookies){
            that.ENV.token = cookies[0] && cookies[0].value;
            resolve(that);
          });

        });

      });

    },

    sendMessageToContent: function(message){
      return new Promise(function(resolve){

        chrome.windows.getCurrent({}, function(currentWindow){
          chrome.windows.update( currentWindow.id , { focused: true }, function(){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
              chrome.tabs.sendMessage(tabs[0].id, message, function(response){
                resolve(response);
              });
            });
          });
        });

      });
    },

    dynamicallyInjectContentScript: function(){
      return new Promise(function(resolve){
        chrome.tabs.executeScript({
          file: 'scripts/contentscript/cs-main.js'
        }, function(){
          chrome.tabs.insertCSS({
            file: 'styles/contentscript.css'
          }, function(){
            resolve();
          });
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

    getBadge: function(callback){
      chrome.browserAction.getBadgeText({}, callback);
    },

    decrementBadgeNumber: function(){
      var that = this;

      that.getBadge(function(num){
        that.setBadge(num - 1);
      });
    },

    redirectToChromeExtensionPage: function(){
      var that = this;

      chrome.tabs.create({ url: that.ENV.domain + '/f/chrome-extension' });
    },

    redirectToLogin: function(){
      var that = this;

      chrome.tabs.create({
        url: that.ENV.domainLogin + '/?reason=401&redirectFrom='+encodeURIComponent(that.ENV.domain + '/f/chrome-extension') + '#!/signin'
      });

      this.setBadge('');
      scState.setExtensionState('MUST_REINSTALL');
    },

  };

})(SMARTCANVAS.STATE);