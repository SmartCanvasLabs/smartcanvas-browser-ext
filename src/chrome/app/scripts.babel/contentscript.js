(function(){  
  var content;
  var iframe;
  var seeUpdates;
  var appPreloader;
  var noCardsAvailable;
  var ENVIRONMENT;
  var TOKEN;

  init();

  function init(){
    attachEvents();
  }

  function destroy(){
    if(content){
      content.parentNode.removeChild(content);
      content = undefined;      
    }
  }

  function create(token, bgEnvironment){
    ENVIRONMENT = bgEnvironment;
    TOKEN = token;

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

  function destroyIframe(){
    if(iframe){
      iframe.parentNode.removeChild(iframe);
      iframe = undefined;
    }
  }

  function createNoCardsAvailable(){
    noCardsAvailable = document.createElement('div');
    noCardsAvailable.className = 'sce-no-cards-available';
    noCardsAvailable.innerHTML =
      '<a class="sce-no-cards-available-close" href=""></a>' +
      '<div class="sce-no-cards-available-image"></div>' +
      '<p class="sce-no-cards-available-message">Yay, you are 100% up to date with all official communications</p>' +
      '<a class="sce-no-cards-available-button" href="http://www.smartcanvas.com" target="_blank">SMARTCANVAS</a>';

    noCardsAvailable.querySelectorAll('.sce-no-cards-available-close')[0].addEventListener('click', function(){
      destroy();
    });

    noCardsAvailable.querySelectorAll('.sce-no-cards-available-button')[0].addEventListener('click', function(){
      destroy();
    });

    content.appendChild(noCardsAvailable);
  }

  function createSeeUpdates(){
    seeUpdates = document.createElement('div');
    seeUpdates.className = 'sce-see-updates';
    seeUpdates.innerHTML =
      '<p class="sce-see-updates-text"><span class="sce-see-updates-icon"></span> SEE UPDATES</p>';

    seeUpdates.addEventListener('click', function(){
      setStyles(seeUpdates, {display: 'none' });
      setStyles(appPreloader, {display: 'flex' });
      createIframe();
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

  function setStyles(obj, styles ){
    for (var style in styles){
      obj.style[style] = styles[style];
    }
  }

  function attachEvents(){
    var that = this;

    window.addEventListener('message', function(e){
      if(e.data.type === 'SCE_CLOSE' && e.data.location === 'CHROME_EXTENSION'){
        destroy();
      }else if(e.data.type === 'SCE_LENGTH' && e.data.location === 'CHROME_EXTENSION'){
        if(e.data.length){
          setStyles(appPreloader, {display: 'none' });
          setStyles(iframe, {display: 'block' });
          chrome.runtime.sendMessage({ type: 'set-badge', value: e.data.length });
        }else{
          setStyles(appPreloader, {display: 'none' });
          setStyles(noCardsAvailable, {display: 'flex' });
        }
        
      }else if(e.data.type === 'SCE_AJAX_ERROR' && e.data.location === 'CHROME_EXTENSION'){
        chrome.runtime.sendMessage({ type: 'extension-bg-redirect-to-login' });
      }else if(e.data.type === 'SCE_MINI_CARD_CLICKED' && e.data.location === 'CHROME_EXTENSION'){
        chrome.runtime.sendMessage({ type: 'decrement-badge-number' });
        destroy();
      }
    });

    document.addEventListener('open-chrome-extension', function(){
      chrome.runtime.sendMessage({ type: 'open-chrome-extension-event' });
    }, false);

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
      if(request.type == 'open-dialog'){
        if(content){
          destroy();
          sendResponse('destroy-executed');
        }else{
          create(request.token, request.environment);
          sendResponse('create-executed');
        }
      }else if(request.type == 'show-see-updates'){
        showSeeUpdates();
      }
    });
  }

})();