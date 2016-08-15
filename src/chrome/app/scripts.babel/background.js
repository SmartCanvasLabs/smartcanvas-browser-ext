(function() {
  var omni;
  var utils;

  var backgroundScript = {
    init: function(){
      this.getTenantAndStartUtils();
      this.events();
    },

    getTenantAndStartUtils: function(callback){
      chrome.cookies.getAll({
        domain: 'd.scanvas.me',
        name: 'tenant'
      }, function(cookies){
        var tenant = cookies[0].value;

        utils = new Utils({
          domain: 'http://' + tenant + '.d.scanvas.me',
          domainLogin: 'http://d.smartcanvas.com',
          domainApi: 'https://sc-core-dev.appspot.com',
          iframeContentUrl: 'https://storage.googleapis.com/static.smartcanvas.com/embed/dev/smartcanvas-embed.html'
        })

        omni = new Omni(utils.searchUrl);

        if(!tenant){
          utils.redirectToLogin();
        }

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
        url: utils.officialCardsApi,
        success: function(data){
          var json = JSON.parse(data.response);

          utils.redirectToChromeExtensionPage();
          that.setBadge(json.meta.count);
        }
      });
    },

    updateBadgeNumber: function(){
      var that = this;

      that.makeAjax({
        url: utils.officialCardsApi,
        success: function(data){
          var json = JSON.parse(data.response);
          that.setBadge(json.meta.count);
        }
      });
    },

    openDialogMessage: function(){
      var that = this;

      that.getTenantAndStartUtils(function(){
        that.getEnvironmentCookiePromise()
          .then(function(token){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
              chrome.tabs.sendMessage(tabs[0].id, { 
                type: 'open-dialog', 
                token: token, 
                utils: utils 
              });
            });
          }, function(){
            utils.redirectToLogin();
          });        
      });
    },

    setBadge: function(num){
      chrome.browserAction.setBadgeText({
        'text': String(num)
      });
    },

    getEnvironmentCookiePromise: function(){
      return new Promise(function(resolve, reject) {        
        chrome.cookies.getAll({
          url: utils.domain,
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
          utils.createPromiseHttpRequest({
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
          utils.redirectToLogin();
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
        }
      });

    }

  };

  backgroundScript.init();

})();