(function(){

  var utils = new Utils();
  
  var contentUrl = utils.iframeContentUrl;
  var domain = utils.domain;
  var domainApi = utils.domainApi;
  var language = 'en';

  var content;

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.type == 'open-dialog'){
      if(content){
        destroy();
      }else{
        create(request.token);
      }
    }
  });

  init();

  function init(){
    attachEvents();
  }

  function destroy(){
    content.parentNode.removeChild(content);
    content = undefined;
  }

  function create(token){
    var styles = {
      width: '370px',
      height: '400px',
      position: 'fixed',
      top: '15px', 
      right: '15px',
      backgroundColor: '#f9f9f9',
      border: 'none',
      borderRadius: '3px',
      zIndex: '9100',
      boxShadow: '0 10px 32px 0 rgba(0, 0, 0, 0.36), 0 16px 16px 0 rgba(0, 0, 0, 0.04)'
    };

    content = document.createElement('iframe');
    content.src = contentUrl + '?domain=' + domain + '&token=' + token + '&language=' + language + '&domainApi=' + domainApi;

    setStyles(content, styles);

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
      if(e.data.type === 'SCE_CLOSE'){
        destroy();
      }else if(e.data.type === 'SCE_LENGTH'){
        chrome.runtime.sendMessage({ type: 'set-badge', value: e.data.length });
      }else if(e.data.type === 'SCE_AJAX_ERROR'){
        utils.redirectToLogin();
      }
    });

    document.addEventListener('open-chrome-extension', function(){
      chrome.runtime.sendMessage({ type: 'open-chrome-extension-event' });
    }, false);
  }

})();