var omni = new Omni(localStorage.setup === 'true');

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: '\'Allo'});

//Refernce: https://github.com/ProLoser/Github-Omnibox
chrome.omnibox.onInputEntered.addListener(function (text) {
    console.log('[smartcanvas.onInputEntered]: ', text);
    if (text) omni.decide(text);
});

console.log('\'Allo \'Allo! Event Page for Browser Action');
