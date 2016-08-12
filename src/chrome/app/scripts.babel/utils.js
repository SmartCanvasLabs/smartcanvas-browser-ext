var Utils = (function () {
  
  function Utils(config) {
    this.domain = config.domain;
    this.domainLogin = config.domainLogin;
    this.domainApi = config.domainApi;
    this.iframeContentUrl = config.iframeContentUrl; 
    this.officialCardsApi = this.domainApi + '/embedded/search/v1/cards/official';
    this.searchUrl = this.domain + '/s/';
    
  }

  Utils.prototype.redirectToChromeExtensionPage = function(){
    chrome.tabs.create({ url: this.domain + '/f/chrome-extension' });
  };

  Utils.prototype.redirectToLogin = function () {
    var newURL = this.domainLogin + '/?reason=401&redirectFrom='+encodeURIComponent(this.domain + '/f/chrome-extension') + '#!/signin';
    chrome.tabs.create({ url: newURL });
  };

  Utils.prototype.createPromiseHttpRequest = function(opts) {
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
  };

  return Utils;

})();