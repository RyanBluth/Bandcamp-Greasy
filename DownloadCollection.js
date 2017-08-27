// ==UserScript==
// @name         DownloadCollection
// @namespace    https://bandcamp.com
// @version      1.0
// @description  Opens the download page for each album in your collection
// @author       Ryan Bluth
// @match        https://bandcamp.com/YOUR_USERNAME
// @grant        GM_openInTab
// ==/UserScript==
(function () {
    'use strict';
    var showMoreButton = document.getElementsByClassName('show-more')[0];
    setTimeout(function () {
        showMoreButton.click();
    }, 2000);

    setTimeout(function () {
        var dloadLinks = document.getElementsByClassName('redownload-item');
        for (var i in dloadLinks) {
            try {
                var a = dloadLinks[i].children[0];
                var link = a.href;
                GM_openInTab(link);
            } catch (e) {
            }
        }
    }, 10000);
})();
