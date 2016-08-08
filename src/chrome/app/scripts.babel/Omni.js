var Omni = (function () {
    Omni.prototype.debug = false;

    Omni.prototype.urls = {
        search: 'https://ciandt.smartcanvas.com/s/'
    };

    Omni.prototype.api = null;

    Omni.prototype.user = null;

    Omni.prototype.caches = null;

    function Omni(authorized) {
        // this.api = new OAuth2('github', {
        //     client_id: '9b3a55174a275a8b56ce',
        //     client_secret: 'aea80effa00cc2b98c1cc590ade40ba05cbeea1e',
        //     api_scope: 'repo'
        // });
        // if (authorized) {
        //     this.authorize();
        // }
        this.clearCache();
    }

    Omni.prototype.redirect = function (url, fullPath) {
        if (!fullPath && url.indexOf('://') == -1) {
            url = this.urls.github + url;
        }
        if (this.debug) {
            alert(url);
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.update(tabs[0].id, { url: url });
            });
        }
    };

    Omni.prototype.suggest = function (text, suggester) {
        var suggestions, defaultSuggestionIndex = Infinity;
        if (this.caches.suggestions[text]) {
            suggestions = this.caches.suggestions[text];
        } else {
            suggestions = StepsManager.suggest(text);
            this.caches.suggestions[text] = suggestions;
        }
        Defer.allDone(suggestions, function (values, startingIndex) {
            if (startingIndex < defaultSuggestionIndex && values[0]) {
                defaultSuggestionIndex = startingIndex;
                chrome.omnibox.setDefaultSuggestion({ description: values[0].description });
                suggester(values.slice(1));
            } else {
                suggester(values);
            }
        });

        if (defaultSuggestionIndex === Infinity) {
            chrome.omnibox.setDefaultSuggestion({description: '<dim>search for %s</dim>'});
        }
    };

    Omni.prototype.decide = function (text, dontTrySuggestions) {
        var _this = this;
        _this.redirect(_this.urls.search + text);
        // var decision = StepsManager.decide(text);
        // Defer.eachDone(decision, function (url) {
        //     if (url === false) return;

        //     if (url === null && text) {
        //         if (!dontTrySuggestions && _this.caches.suggestions[text] && _this.caches.suggestions[text][0]) {
        //             Defer.eachDone(_this.caches.suggestions[text][0], function (suggestion) {
        //                 omni.decide(suggestion.content, true);
        //             });
        //             return; // stop
        //         }
        //         url = omni.urls.search + text;
        //     }
        //     _this.redirect(url);
        // });
    };

    Omni.prototype.authorize = function (callback) {
        var _this = this;
        this.api.authorize(function () {
            _this.reset();
            _this.authorized = true;
            callback && callback();
        });
    };

    Omni.prototype.unauthorize = function () {
        if (this.api) {
            this.api.clearAccessToken();
        }
        this.reset();
        this.authorized = false;
    };

    Omni.prototype.query = function (options, callback) {
        var xhr;
		if (_.isString(options)) {
			options = {
				url: options
			};
		}
		_.defaults(options, {
			params: {},
			method: 'GET'
		});
		_.defaults(options.params, {
			per_page: 1000
		});
        if (this.api && this.api.getAccessToken()) {
            options.params.access_token = this.api.getAccessToken();
        }
		options.params = _.map(options.params, function (value, key) {
	        return key + '=' + value;
	    }).join('&');
		options.url = this.urls.api + options.url + '?' + options.params;

        xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (event) {
            var data, err;
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    data = JSON.parse(xhr.responseText);
                } else {
                    err = xhr;
                }
                callback(err, data);
            }
        };
        xhr.open(options.method.toUpperCase(), options.url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    };

    Omni.prototype.clearCache = function () {
        this.caches = {
            suggestions: {},
        };
    };

    Omni.prototype.reset = function () {
        var _this = this;
        this.clearCache();

		if (!this.api) return;
    };

    return Omni;

})();