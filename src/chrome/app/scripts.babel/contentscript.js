(function(){  
  var content;
  var iframe;
  var appPreloader;
  var noCardsAvailable;
  var ENVIRONMENT;

  init();

  function init(){
    attachEvents();
  }

  function destroy(){
    content.parentNode.removeChild(content);
    content = undefined;
  }

  function create(token, bgEnvironment){
    ENVIRONMENT = bgEnvironment;

    var contentUrl = ENVIRONMENT.iframeContentUrl;
    var domain = ENVIRONMENT.domain;
    var domainApi = ENVIRONMENT.domainApi;
    var language = 'en';

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

    iframe = document.createElement('iframe');
    iframe.className = 'sce-iframe';
    iframe.src = contentUrl;
    iframe.onload = function(){
      iframe.contentWindow.postMessage({
        type: 'SCE_INIT',
        domain: domain,
        token: token,
        language: language,
        domainApi: domainApi,
        location: 'CHROME_EXTENSION'
      }, '*');
    };

    noCardsAvailable = document.createElement('div');
    noCardsAvailable.className = 'sce-no-cards-available';
    noCardsAvailable.innerHTML =
      '<a class="sce-no-cards-available-close" href=""></a>' +
      '<div class="sce-no-cards-available-image"></div>' +
      '<p class="sce-no-cards-available-message">Yay, you are 100% up to date with all official communications</p>' +
      '<a class="sce-no-cards-available-button" href="http://www.smartcanvas.com" target="_blank">SMARTCANVAS</a>'

    noCardsAvailable.querySelectorAll('.sce-no-cards-available-close')[0].addEventListener('click', function(){
      destroy();
    });

    content = document.createElement('div');
    content.className = 'sce-content';

    content.appendChild(noCardsAvailable);
    content.appendChild(appPreloader);
    content.appendChild(iframe);

    document.body.appendChild(content);
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
      }
    });

    document.addEventListener('open-chrome-extension', function(){
      chrome.runtime.sendMessage({ type: 'open-chrome-extension-event' });
    }, false);

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
      if(request.type == 'open-dialog'){
        if(content){
          destroy();
        }else{
          create(request.token, request.environment);
        }
      }
    });
  }

})();