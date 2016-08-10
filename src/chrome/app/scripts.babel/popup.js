(function(window){
  var utils = new Utils();
  
  var contentUrl = utils.iframeContentUrl;
  var domain = utils.domain;
  var language = 'en';
  
  var preloader = document.getElementById('appPreloader');
  var token;
  var content;
  

  chrome.cookies.getAll({
    url: domain,
    name: 'acctk'
  }, function(a){
    if(a[0]){
      token = a[0].value;
      init();
    }else{
      utils.redirectToLogin();
    }
  });


  function init(){
    createContent();
    attachEvents();
  } 

  function createContent(){
    var styles = {
      width: '370px',
      height: '400px',
      backgroundColor: '#f9f9f9',
      border: 'none',
      display: 'none'
    };

    content = document.createElement('iframe');
    content.src = contentUrl + '?domain=' + domain + '&token=' + token + '&language=' + language + '&domainApi=' + domain;
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
        window.close();
      }else if(e.data.type === 'SCE_LENGTH'){
        
        setStyles(content, { display: 'block' });
        setStyles(preloader, { display: 'none' });

        chrome.browserAction.setBadgeText({
          'text': String(e.data.length)
        });

      }else if(e.data.type === 'SCE_AJAX_ERROR'){
        utils.redirectToLogin();
      }
    });
  }

})(window);
