var j = document.createElement('script');
j.src = chrome.extension.getURL('scripts/libs/jquery-1.12.3.min.js');
(document.head || document.documentElement).appendChild(j);

var g = document.createElement('script');
g.src = chrome.extension.getURL('scripts/libs/gmail.js');
(document.head || document.documentElement).appendChild(g);

var s = document.createElement('script');
s.src = chrome.extension.getURL('scripts/gmail-content-main.js');
(document.head || document.documentElement).appendChild(s);