(function(){  
  var content;
  var isContentVisible;
  var iframe;
  var iframeBadgeNumber;
  var seeUpdates;
  var appPreloader;
  var noCardsAvailable;
  var ENVIRONMENT;
  var TOKEN;

  init();

  function init(){
    attachEvents();
  }

  function attachEvents(){
    var that = this;

    window.addEventListener('message', function(e){
      if(e.data.type === 'SCE_CLOSE' && e.data.location === 'CHROME_EXTENSION'){
        hideContent();
      }else if(e.data.type === 'SCE_LENGTH' && e.data.location === 'CHROME_EXTENSION'){
        if(e.data.length){
          setStyles(appPreloader, {display: 'none' });
          setStyles(iframe, {display: 'block' });
          iframeBadgeNumber = e.data.length;
          chrome.runtime.sendMessage({ type: 'set-badge', value: e.data.length });
        }else{
          setStyles(appPreloader, {display: 'none' });
          setStyles(noCardsAvailable, {display: 'flex' });
          iframeBadgeNumber = '';
        }
      }else if(e.data.type === 'SCE_AJAX_ERROR' && e.data.location === 'CHROME_EXTENSION'){
        hideContent();

        if(!location.hash.match(/signin/g)){
          chrome.runtime.sendMessage({ type: 'extension-bg-redirect-to-login' });  
        }
      }else if(e.data.type === 'SCE_MINI_CARD_CLICKED' && e.data.location === 'CHROME_EXTENSION'){
        // chrome.runtime.sendMessage({ type: 'decrement-badge-number' });
        hideContent();
      }
    });

    document.addEventListener('open-chrome-extension', function(){
      chrome.runtime.sendMessage({ type: 'open-chrome-extension-event' });
    }, false);

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
      if(request.type == 'open-dialog'){
        if(!content){
          create(request.token, request.environment);
        }

        if(isContentVisible){
          hideContent();
          sendResponse('hide-content-executed');
        }else{
          if(iframeBadgeNumber != request.badgeNumber){
            refreshContent();
          }
          showContent();
          
          sendResponse('show-content-executed');
        }
      }else if(request.type == 'show-see-updates'){
        if(isContentVisible){
          showSeeUpdates();
        }else{
          refreshContent();
        }
      }
    });

    window.onload = function(){
      chrome.runtime.sendMessage({ type: 'get-token-and-environment' }, function(response){
        if(!content){
          create(response.token, response.environment);
        }
      });
    };

  }

  function hideContent(){
    setStyles(content, {display: 'none' });
    isContentVisible = false;
  }

  function showContent(){
    setStyles(content, {display: 'block' });
    isContentVisible = true;
  }

  function destroy(){
    var oldContent = document.querySelector('.sce-content');
    if(content){
      content.parentNode.removeChild(content);
      content = undefined;      
    }else if(oldContent){
      oldContent.parentNode.removeChild(oldContent);
    }
  }

  function create(token, bgEnvironment){
    ENVIRONMENT = bgEnvironment;
    TOKEN = token;

    destroy();

    content = document.createElement('div');
    content.className = 'sce-content';

    document.body.appendChild(content);

    createIframe();
    createNoCardsAvailable();
    createSeeUpdates();
    createAppPreloader();
  }

  function showSeeUpdates(){
    setStyles(seeUpdates, {
      display: 'block'
    })
  }

  function destroyIframe(){
    if(iframe){
      iframe.parentNode.removeChild(iframe);
      iframe = undefined;
    }
  }

  function createIframe(){
    destroyIframe();

    var contentUrl = ENVIRONMENT.iframeContentUrl;
    var domain = ENVIRONMENT.domain;
    var domainApi = ENVIRONMENT.domainApi;
    var language = 'en';

    iframe = document.createElement('iframe');
    iframe.className = 'sce-iframe';
    iframe.src = contentUrl;
    iframe.onload = function(){
      iframe.contentWindow.postMessage({
        type: 'SCE_INIT',
        domain: domain,
        token: TOKEN,
        language: language,
        domainApi: domainApi,
        location: 'CHROME_EXTENSION'
      }, '*');
    };

    content.appendChild(iframe);
  }

  function createNoCardsAvailable(){
    noCardsAvailable = document.createElement('div');
    noCardsAvailable.className = 'sce-no-cards-available';
    noCardsAvailable.innerHTML =
      '<a class="sce-no-cards-available-close" href="javascript:void(0);"></a>' +
      '<div class="sce-no-cards-available-image"></div>' +
      '<p class="sce-no-cards-available-message">Yay, you are 100% up to date with all official communications</p>' +
      '<a class="sce-no-cards-available-link" href="http://www.smartcanvas.com" target="_blank">SMARTCANVAS</a>';

    noCardsAvailable.querySelectorAll('.sce-no-cards-available-close')[0].addEventListener('click', function(){
      hideContent();
    });

    noCardsAvailable.querySelectorAll('.sce-no-cards-available-link')[0].addEventListener('click', function(){
      hideContent();
    });

    content.appendChild(noCardsAvailable);
  }

  function createSeeUpdates(){
    seeUpdates = document.createElement('div');
    seeUpdates.className = 'sce-see-updates';
    seeUpdates.innerHTML =
      '<p class="sce-see-updates-text"><span class="sce-see-updates-icon"></span> SEE UPDATES</p>';

    seeUpdates.addEventListener('click', function(){
      refreshContent();
    });

    content.appendChild(seeUpdates);
  }

  function createAppPreloader(){
    appPreloader = document.createElement('div');
    appPreloader.className = 'sce-preloader';
    appPreloader.innerHTML = 
      '<div class="sce-loader-container">' +
        '<div class="sce-loader-wrapper">' +
          '<div class="sce-loader">' +
            '<span class="sce-span01"></span>' +
            '<span class="sce-span02"></span>' +
            '<span class="sce-span03"></span>' +
          '</div>' +
        '</div>' +
      '</div>';

    content.appendChild(appPreloader);
  }

  function refreshContent(){
    setStyles(seeUpdates, {display: 'none' });
    setStyles(noCardsAvailable, {display: 'none' });
    setStyles(appPreloader, {display: 'flex' });
    createIframe();
  }

  function setStyles(obj, styles ){
    for (var style in styles){
      obj.style[style] = styles[style];
    }
  }

})();