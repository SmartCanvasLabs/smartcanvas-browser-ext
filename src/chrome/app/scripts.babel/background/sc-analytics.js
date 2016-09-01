var SMARTCANVAS = SMARTCANVAS || {};
var _gaq = _gaq || [];

SMARTCANVAS.ANALYTICS = (function() {
  return {

    start: function(account){
      _gaq.push(['_setAccount', account]);
      _gaq.push(['_trackPageview', '/extension/installed']);

      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = 'https://ssl.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    },

    time: function(){
      var time = Math.floor(Math.random() * 100) + 1;
      _gaq.push(['_trackEvent', 'teste3', String(time) ]);
    }

  };

})();