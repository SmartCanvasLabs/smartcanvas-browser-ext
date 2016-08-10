(function() {
  var omni = new Omni(localStorage.setup === 'true');
  var utils = new Utils();

  var backgroundScript = {
    init: function(){
      this.onInstalledEvent();
      this.omniEvents();
      this.onMessageExternalEvent();
    },

    redirectToLoginIfNotlogged: function(){
      utils.createPromiseHttpRequest({
        url: utils.domain + '/api/auth/v2/user',
      })
      .then(function(){}, function(e){
        utils.redirectToLogin();
      });      
    },

    omniEvents: function(){
      //Refernce: https://github.com/ProLoser/Github-Omnibox
      chrome.omnibox.onInputEntered.addListener(function(text) {
        console.log('[smartcanvas.onInputEntered]: ', text);
        if (text) omni.decide(text);
      });
    },

    onInstalledEvent: function(){
      var that = this;
      chrome.runtime.onInstalled.addListener(function(details){
        console.log('[smartcanvas.onInstalled]');
        console.log('previousVersion: ', details.previousVersion);
        that.redirectToLoginIfNotlogged();
      });
    },

    onMessageExternalEvent: function(){
      chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
        if(request === 'logged'){
          console.log('logged');
        }
      });
    }

  };

  backgroundScript.init();

})();