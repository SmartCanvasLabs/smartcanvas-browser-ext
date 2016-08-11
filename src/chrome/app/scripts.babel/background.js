(function() {
  var omni = new Omni(localStorage.setup === 'true');
  var utils = new Utils();

  var backgroundScript = {
    init: function(){
      this.events();
    },

    redirectToLoginIfNotlogged: function(){
      utils.createPromiseHttpRequest({
        url: utils.domain + '/api/auth/v2/user',
      })
      .then(function(){}, function(e){
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
    }

  };

  backgroundScript.init();

})();