var Utils = (function () {
  
  function Utils() {
    this.domain = 'http://ciandt.d.scanvas.me';
    this.domainLogin = 'http://d.smartcanvas.com';
    this.domainApi = 'https://sc-core-dev.appspot.com';
    this.officialCardsApi = this.domainApi + '/embedded/search/v1/cards/official';
    this.searchUrl = this.domain + '/s/';
    this.iframeContentUrl = 'https://storage.googleapis.com/static.smartcanvas.com/embed/dev/smartcanvas-embed.html'; 
    // this.iframeContentUrl = 'http://localhost:8899/smartcanvas-embed.html';
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