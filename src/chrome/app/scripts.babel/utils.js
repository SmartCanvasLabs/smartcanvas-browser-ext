var Utils = (function () {
  
  function Utils() {
    this.domain = 'http://ciandt.d.scanvas.me';
    this.iframeContentUrl = 'http://storage.googleapis.com/static.smartcanvas.com/embed/dev/smartcanvas-embed.html';
    // this.iframeContentUrl = 'http://localhost:8899/smartcanvas-embed.html';
  }

  Utils.prototype.redirectToLogin = function () {
    var newURL = this.domain + '/?reason=401&redirectFrom='+encodeURIComponent(this.domain + '/chrome-extension');
    chrome.tabs.create({ url: newURL });
  };

  Utils.prototype.createPromiseHttpRequest = function(opts) {
    opts = opts || {};
    opts.method = opts.method || 'GET';

    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest();
      req.open(opts.method, encodeURI(opts.url), true);
      req.withCredentials = true;
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