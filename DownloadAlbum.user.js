// ==UserScript==
// @name        Bandcamp Download Album
// @namespace   https://bandcamp.com
// @match       https://bandcamp.com/download*
// @description Downloads the item from the download page. Refreshes if there is an error.
// @author      Ryan Bluth, Xerus2000, Kélian Steffe, Cook I.T!
// @version     1.2.1
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
                var options = document.getElementsByTagName("option");

              	for(var option of options) {
                  if(option.textContent.split(" - ")[0] == format) {
                    option.selected = true;
                    option.parentNode.dispatchEvent(new Event('change'));
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

                var titleLabel = document.getElementsByClassName('download-format-tmp')[0].children[4];
                if (titleLabel.href !== undefined && titleLabel.href.length > 0) {
                    const downloadWindow = window.open(titleLabel.href);
                    clearTimeout(interval);
                  
                    if (closeAfterDownload) {
                      	// Wait for the download window to close itself before closing the album page
                      	setTimeout(function(){
                        		var downloadInterval = setInterval(function () {
                            	try {
                                	// downloadWindow should throw an error either way since it become a DeadObject once closed
                                	if(downloadWindow.closed) {
                                  	throw new Error('Download window is closed');
                                  }
                              } catch(e) {
                              		clearTimeout(downloadInterval);
                                	close();
                              }
                            }, 1000);
                        }, 1000);
                    }
                }
            }
        }, 1000);
    }, 1000);
})();
