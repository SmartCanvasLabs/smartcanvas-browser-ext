var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.API = (function(scAjax, scUtils) {
  return {

    getUser: function(){
      var that = this;

      return new Promise(function(resolve, reject){
        scAjax.makeAjax({
          url: scUtils.ENV.userApi
        })
          .then(function(data){
            resolve( JSON.parse(data.response) );
          }, function(e){
            reject(e);
          });
      });
    },

    getCards: function(){
      var that = this;

      return new Promise(function(resolve, reject){
        scAjax.makeAjax({
          url: scUtils.ENV.officialCardsApi
        })
          .then(function(data){
            var json = JSON.parse(data.response);
            var cards = json.data[0] && json.data[0].cards;
            resolve( cards );
          }, function(e){
            reject(e);
          });
      });
    },


  };

})(SMARTCANVAS.AJAX, SMARTCANVAS.UTILS);