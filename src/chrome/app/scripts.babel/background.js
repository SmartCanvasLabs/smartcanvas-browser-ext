var FIREBASE;
var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.APP = (function(scApi, scUtils, scState, scFirebase) {

  return {

    init: function(){
      var that = this;

      chrome.runtime.onInstalled.addListener(function(){
        that.startChromeExtension()
          .then(function(){
            scUtils.redirectToChromeExtensionPage();
          }, function(){
            scUtils.redirectToLogin();
          });
      });

      chrome.browserAction.onClicked.addListener(function(){
        that.open();
      });

      chrome.runtime.onMessage.addListener(function(request) {
        if(request.type === 'open-chrome-extension-event'){
          that.open();
        }else if(request.type === 'set-badge'){
          scUtils.setBadge(request.value);
        }else if(request.type === 'extension-bg-redirect-to-login'){
          scUtils.redirectToLogin();
        }else if(request.type === 'decrement-badge-number'){
          scUtils.decrementBadgeNumber();
        }
      });

    },

    startChromeExtension: function(){
      var that = this;

      return new Promise(function(resolve, reject){

        scUtils.startVARS()
          .then(function(){
            scApi.getUser()
              .then(function(user){
                that.startOmni();
                that.updateBadgeAndSeeUpdates();
                scFirebase.startFirebase(user, function(){
                  that.updateBadgeAndSeeUpdates();
                });
                resolve();
              }, function(){
                reject();
              });
          }, function(){
            reject();
          });

      });

      
    },

    updateBadgeAndSeeUpdates: function(){
      var that = this;
      var newBadgeText;

      scApi.getCards()
        .then(function(cards){
          cards = that.filterCards(cards);
          newBadgeText = String(cards.length);

          scUtils.getBadge(function(num){
            if(num !== newBadgeText){
              scUtils.sendMessageToContent({ 
                type: 'show-see-updates'
              });
              scUtils.setBadge(newBadgeText);
            }
          });

        });
    },

    filterCards: function(cards){
      var cardsFiltered = [];
      var card;

      if(cards && cards.length) {
        for(var i = 0; i < cards.length; i++){
          card = cards[i];

          if(!card.interactionsState.viewed){
            cardsFiltered.push(card);
          }
        }
      }

      return cardsFiltered;
    },

    checkIfExtensionMustRestart: function(){
      var that = this;

      return new Promise(function(resolve, reject){
        
        if( scState.isExtensionStateOK() ){
          resolve();
        }else{
          scUtils.startVARS()
            .then(function(){
              scState.setExtensionState('OK');

              scApi.getUser()
                .then(function(user){
                  scFirebase.authFirebase(user.firebase.token);
                });

              resolve();
            }, function(){
              reject();
            });
        }
      });
    },

    open: function(){
      var that = this;

      that.checkIfExtensionMustRestart()
        .then(function(){
          scUtils.sendMessageToContent({ 
            type: 'open-dialog', 
            token: scUtils.ENV.token, 
            environment: scUtils.ENV
          })
            .then(function(response){
              if(!response){
                scUtils.dynamicallyInjectContentScript()
                  .then(function(){
                    scUtils.sendMessageToContent({ 
                      type: 'open-dialog', 
                      token: scUtils.ENV.token, 
                      environment: scUtils.ENV
                    });
                  });
              }
            });
        });

    },

    startOmni: function(){
      //Refernce: https://github.com/ProLoser/Github-Omnibox
      chrome.omnibox.onInputEntered.addListener(function(text) {
        if(text){
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.update(tabs[0].id, {
              url: scUtils.ENV.searchUrl + text
            });
          });
        }
      });
    }

  };

})(SMARTCANVAS.API, SMARTCANVAS.UTILS, SMARTCANVAS.STATE, SMARTCANVAS.FIREBASE);

SMARTCANVAS.APP.init();