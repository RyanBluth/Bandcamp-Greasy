// ==UserScript==
// @name        Bandcamp download album
// @namespace   https://bandcamp.com
// @match       https://bandcamp.com/download*
// @description Downloads an album from the download page. Refreshing if there is an error
// @version     1.0
// @grant       none
// ==/UserScript==
(function () {
    'use strict';
    
    // Set format here
    var format = "MP3 320";
    
    var selectedFormat = false;

    setTimeout(function(){    
        var interval = setInterval(function () {
            if(!selectedFormat){
                document.getElementsByClassName('item-format button')[0].click();
                var spans = document.getElementsByTagName("span");
        
                for (var i = 0; i < spans.length; i++) {
                  if (spans[i].textContent == format) {
                    spans[i].parentElement.click();
                    selectedFormat = true;
                    break;
                  }
                }
            }else{
                var errorText = document.getElementsByClassName("error-text")[0];
                if (errorText.offsetParent !== null) {
                    location.reload();
                }
                try {
                    var maintenanceLink = document.getElementsByTagName("a")[0];
                    if (a.href.indexOf("bandcampstatus") > 0) {
                        location.reload();
                    }
                } catch (e) { }
                var titleLabel = document.getElementsByClassName('download-title')[0];
                if (titleLabel.children[0].href !== undefined && titleLabel.children[0].href.length > 0) {
                    titleLabel.children[0].click();
                    clearTimeout(interval);
                }
            }
        }, 2000);
    }, 2000);
})();
