(function(){  
  var content;
  var iframe;
  var appPreloader;
  var utils;

  init();

  function init(){
    attachEvents();
  }

  function destroy(){
    content.parentNode.removeChild(content);
    content = undefined;
  }

  function create(token, bgUtils){
    utils = bgUtils;

    var contentUrl = utils.iframeContentUrl;
    var domain = utils.domain;
    var domainApi = utils.domainApi;
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

    content = document.createElement('div');
    content.className = 'sce-content';

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
        setStyles(appPreloader, {display: 'none' });
        setStyles(iframe, {display: 'block' });

        chrome.runtime.sendMessage({ type: 'set-badge', value: e.data.length });
      }else if(e.data.type === 'SCE_AJAX_ERROR' && e.data.location === 'CHROME_EXTENSION'){
        utils.redirectToLogin();
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
          create(request.token, request.utils);
        }
      }
    });
  }

})();