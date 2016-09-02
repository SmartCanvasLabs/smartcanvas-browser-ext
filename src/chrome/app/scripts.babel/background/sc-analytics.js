var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.ANALYTICS = (function() {
  return {

    start: function(account){
      var that = this;

      if (!window.ga) {
        (function(){
          window.ga = function() {
            (window.ga.q = window.ga.q || []).push(arguments);
          }, window.ga.l = 1 * new Date();
          var tag = 'script';
          var a = document.createElement(tag);
          var m = document.getElementsByTagName(tag)[0];
          a.async = 1;
          a.src = 'https://www.google-analytics.com/analytics.js';
          m.parentNode.insertBefore(a, m);
        })();

        ga('create', account, 'auto');
        ga('set', 'checkProtocolTask', null);
      }
    },

    installed: function(){
      ga( 'send', 'event', 'lifeCycle', 'installed' );
    },

    getCards: function(time){      
      ga( 'send', 'event', 'ajax', 'getCards', String(new Date()), time );
    },

    opened: function(){
      ga( 'send', 'event', 'userAction', 'opened' );
    },

    closed: function(){
      ga( 'send', 'event', 'userAction', 'closed' );
    },

    noCardsAvailableSmartCanvasLinkClicked: function(){
      ga( 'send', 'event', 'userAction', 'noCardsAvailableSmartCanvasLinkClicked' );
    },

    cardClicked: function(cardId){
      ga( 'send', 'event', 'userAction', 'cardClicked', cardId );
    },

    omniSearch: function(term){      
      ga( 'send', 'event', 'userAction', 'omniSearch', term );
    }

  };

})();