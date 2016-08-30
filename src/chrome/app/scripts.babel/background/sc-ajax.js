var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.AJAX = (function(scUtils) {
  return {

    makeAjax: function(obj){
      var that = this;

      return new Promise(function(resolve, reject){
        that.xhrPromise({
          url: obj.url,
          method: obj.method,
          data: obj.data,
          token: scUtils.ENV.token
        })
          .then(function(data){
            resolve(data);
          }, function(e){
            reject(e);
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
    }


  };

})(SMARTCANVAS.UTILS);