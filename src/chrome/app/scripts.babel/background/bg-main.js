var SMARTCANVAS = SMARTCANVAS || {};

SMARTCANVAS.APP = (function(scApi, scUtils, scState, scFirebase, scAnalytics) {

  return {

    init: function(){
      var that = this;

      chrome.runtime.onInstalled.addListener(function(){
        
        scAnalytics.start('UA-83209067-1');

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

      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.type === 'open-chrome-extension-event'){
          that.open();
        }else if(request.type === 'set-badge'){
          scUtils.setBadge(request.value);
        }else if(request.type === 'extension-bg-redirect-to-login'){
          scUtils.redirectToLogin();
        }else if(request.type === 'decrement-badge-number'){
          scUtils.decrementBadgeNumber();
        }else if(request.type === 'get-token-and-environment'){
          scUtils.startVARS()
            .then(function(){
              sendResponse({
                token: scUtils.ENV.token, 
                environment: scUtils.ENV
              });
            });

          return true;
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

              scUtils.setBadge(newBadgeText === '0' ? '': newBadgeText);
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
                  if(scFirebase.instance){
                    scFirebase.authFirebase(user.firebase.token);
                  }else{
                    scFirebase.startFirebase(user, function(){
                      that.updateBadgeAndSeeUpdates();
                    });
                  }
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
          scUtils.getBadge(function(badgeNumber){ 
            scUtils.sendMessageToContent({ 
              type: 'open-dialog', 
              token: scUtils.ENV.token, 
              environment: scUtils.ENV,
              badgeNumber: badgeNumber
            })
              .then(function(response){
                if(!response){
                  scUtils.dynamicallyInjectContentScript()
                    .then(function(){
                      scUtils.sendMessageToContent({ 
                        type: 'open-dialog', 
                        token: scUtils.ENV.token, 
                        environment: scUtils.ENV,
                        badgeNumber: badgeNumber
                      });
                    });
                }
              });
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

})(SMARTCANVAS.API, SMARTCANVAS.UTILS, SMARTCANVAS.STATE, SMARTCANVAS.FIREBASE, SMARTCANVAS.ANALYTICS);

SMARTCANVAS.APP.init();