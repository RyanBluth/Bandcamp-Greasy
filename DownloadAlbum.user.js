// ==UserScript==
// @name        Bandcamp Download Album
// @namespace   https://bandcamp.com
// @match       https://bandcamp.com/download*
// @description Downloads the item from the download page. Refreshes if there is an error.
// @author      Ryan Bluth, Xerus2000
// @version     1.1.1
// @grant       none
// ==/UserScript==

(function () {
    'use strict';
    
    // Set preferred download format here
    var format = "MP3 320";
    // Whether the download tab should automatically be closed after the download has been started
    var closeAfterDownload = true;
    
    var selectedFormat = false;
    setTimeout(function () {
        var interval = setInterval(function () {
            if (!selectedFormat) {
                document.getElementsByClassName('item-format button')[0].click();
                var spans = document.getElementsByTagName('span');

                for (var i = 0; i < spans.length; i++) {
                  if (spans[i].textContent == format) {
                    spans[i].parentElement.click();
                    selectedFormat = true;
                    break;
                  }
                }
            } else {
                var errorText = document.getElementsByClassName('error-text')[0];
                if (errorText.offsetParent !== null) {
                    location.reload();
                }

                try {
                    var maintenanceLink = document.getElementsByTagName('a')[0];
                    if (maintenanceLink.href.indexOf("bandcampstatus") > 0) {
                        location.reload();
                    }
                } catch (e) {
                    console.log(e);
                }

                var titleLabel = document.getElementsByClassName('download-title')[0];
                if (titleLabel.children[0].href !== undefined && titleLabel.children[0].href.length > 0) {
                    window.open(titleLabel.children[0].href, "_self");
                    clearTimeout(interval);
                    if (closeAfterDownload) {
                        setTimeout(function() {close()}, 20000);
                    }
                }
            }
        }, 2000);
    }, 2000);
})();
