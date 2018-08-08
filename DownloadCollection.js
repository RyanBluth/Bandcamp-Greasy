// ==UserScript==
// @name         DownloadCollection
// @namespace    https://bandcamp.com
// @version      1.0
// @description  Opens the download page for each album in your collection
// @author       Ryan Bluth
// @match        https://bandcamp.com/YOUR_USERNAME
// @grant        GM_openInTab
// ==/UserScript==

var rangeStart = 0; // Inclusive - Ex: Most recent album would be 0
var rangeEnd   = Number.MAX_SAFE_INTEGER; // Exclusive - Ex if you have 10 albums and want all of them this value would be 10 since rangeStart is 0 based

(function () {
    'use strict';
    var showMoreButton = document.getElementsByClassName('show-more')[0];
    setTimeout(function () {
        showMoreButton.click();
    }, 2000);

    setInterval(function(){window.scrollTo(0,window.scrollY + 50)}, 1);

    setTimeout(function () {
        var dloadLinks = document.getElementsByClassName('redownload-item');
        for(var i = rangeStart; i < rangeEnd && i < dloadLinks.length; i++){
            try {
                var a = dloadLinks[i].children[0];
                var link = a.href;
                window.open(link, '_blank');
            } catch (e) {/* Ignore */}
        }
    }, 20000);
})();
