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
    var interval = setInterval(function () {
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
    }, 2000);
})();
