(function(window){
  var contentUrl = 'http://storage.googleapis.com/static.smartcanvas.com/embed/1.31+6dda392/smartcanvas-embed.html';
  var domain = 'http://ciandt.d.scanvas.me';
  var domainApi = 'http://sc-core-dev.appspot.com';
  var language = 'en';
  var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJmYWtlci5zbWFydGNhbnZhcy5jb20iLCJ0bnQiOiJjaWFuZHQiLCJzdWIiOiJsdWNhc3BAY2lhbmR0LmNvbSIsImV4cCI6MTQ3MzM0OTQwNSwiaWF0IjoxNDcwNzU3NDA1LCJqdGkiOiJlZDU3N2YwZC0xZmNhLTQ2YjctYjU3NS04YmYwODljMzQyNjgifQ.fGB7_g5pvAvqEzPnOOtxEeFhfpI1evTfcpfHrXPg5rA';
  var preloader = document.getElementById('appPreloader');
  var content;

  function init(config){
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
        window.close();
      }else if(e.data.type === 'SCE_LENGTH'){
        
        setStyles(content, { display: 'block' });
        setStyles(preloader, { display: 'none' });

        chrome.browserAction.setBadgeText({
          'text': String(e.data.length)
        })
      }
    });
  }

  init();

})(window);
