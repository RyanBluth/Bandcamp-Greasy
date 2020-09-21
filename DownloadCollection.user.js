// ==UserScript==
// @name         Bandcamp Download Collection
// @namespace    https://bandcamp.com
// @version      1.2
// @description  Opens the download page for each item in your collection.
// @author       Ryan Bluth, Xerus2000
// @match        https://bandcamp.com/USERNAME
// @grant        GM_openInTab
// ==/UserScript==

// Ignore albums with the same title and artist
var ignoreDuplicateTitles = true;
// The number of milliseconds spent scrolling down to load all albums
var albumLoadDuration = 30000; //30000 ms default - 30 sec default
//If true will make the time it takes to open new links entirely random. If false will use a set interval
const randomInterval = false; 
//Only applicable if randomInterval is false
const intervalBetweenDownload = 10000; //10000 ms default - 10 sec default
//Only applicable if randomInterval is true. The maximum amount of time it will take to download collection.
const maxDownloadTime = 1800000; //1800000 ms default - 30 min default

function timeoutCalculator (n) {
  if (randomInterval) {
    return Math.floor(Math.random() * (maxDownloadTime - 0));
  }
  else {
    return intervalBetweenDownload * n;
  }
};

(() => {
    'use strict'

    var allLinks = []

    var mainContainer = document.createElement('div')
    mainContainer.setAttribute("oncontextmenu", "this.style.display = 'none';return false;") // close it via rightclick
    mainContainer.style.backgroundColor = "#1DA0C3"
    mainContainer.style.position = "fixed"
    mainContainer.style.color = "white"
    mainContainer.style.top = "0"
    mainContainer.style.left = "0"
    mainContainer.style.right = "0"
    mainContainer.style.padding = "20px"
    mainContainer.style.zIndex = "9999999"
    mainContainer.style.maxHeight = "75vh"
    mainContainer.style.boxSizing = "border-box"
    mainContainer.style.overflowY = "auto"
    mainContainer.innerHTML = '<div><h2><a style="color: inherit" href="https://github.com/RyanBluth/Bandcamp-Greasy">BANDCAMP GREASY</a></h2></div>'
    document.body.appendChild(mainContainer)

    var statusSpan = document.createElement('span')
    statusSpan.style.fontWeight = "bold"
    statusSpan.innerText = "Loading albums..."

    var downloadControls = document.createElement("div")
    downloadControls.style.position = "fixed"
    downloadControls.style.padding = "20px"
    downloadControls.style.color = "black"
    downloadControls.style.top = "0"
    downloadControls.style.right = "0"
    downloadControls.style.display = "none"

    var downloadAllButton = document.createElement("button")
    downloadAllButton.innerText = "Download All"
    downloadAllButton.style.display = "block"
    downloadAllButton.style.marginBottom = "10px"
    downloadAllButton.onclick = function() {
        for(var i = 0; i < allLinks.length; i++) {
          const store = allLinks[i];
          setTimeout(()=>{
            window.open(store, '_blank')
          }, timeoutCalculator(i));
        }
    }

    var downloadSelectedButton = document.createElement("button")
    downloadSelectedButton.innerText = "Download Selected"
    downloadSelectedButton.style.display = "block"
    downloadSelectedButton.style.marginBottom = "10px"
    downloadSelectedButton.onclick = function() {
        var checkboxes = mainContainer.getElementsByTagName("input")
        let count = -1;
        for(var i = 0; i < checkboxes.length; i++) {
          if(checkboxes[i].checked) {
            const store = checkboxes[i].link;
            count++;
            setTimeout(() => {
                window.open(store, '_blank')
            }, timeoutCalculator(count));
          }
        }
    }

    var downloadRangeStart = document.createElement("input")
    downloadRangeStart.type = "text"
    downloadRangeStart.style.display = "block"
    downloadRangeStart.style.marginBottom = "10px"
    downloadRangeStart.placeholder = "Range Start"

    var downloadRangeEnd = document.createElement("input")
    downloadRangeEnd.type = "text"
    downloadRangeEnd.style.display = "block"
    downloadRangeEnd.style.marginBottom = "10px"
    downloadRangeEnd.placeholder = "Range End"

    var downloadRangeButton = document.createElement("button")
    downloadRangeButton.innerText = "Download Range"
    downloadRangeButton.style.display = "block"
    downloadRangeButton.style.marginBottom = "10px"
    downloadRangeButton.onclick = () => {
        var rangeStart = parseInt(downloadRangeStart.value)
        var rangeEnd = parseInt(downloadRangeEnd.value)
        let count = -1;
        for(var i = rangeStart; i <= rangeEnd && i < allLinks.length; i++) {
            const store = allLinks[i];
            count++;
            setTimeout(() => {
                window.open(store, '_blank')
            }, timeoutCalculator(count));
        }
    }

    downloadControls.appendChild(downloadAllButton)
    downloadControls.appendChild(downloadSelectedButton)
    downloadControls.appendChild(downloadRangeButton)
    downloadControls.appendChild(downloadRangeStart)
    downloadControls.appendChild(downloadRangeEnd)

    mainContainer.appendChild(downloadControls)
    mainContainer.appendChild(statusSpan)

    var showMoreButton = document.getElementsByClassName('show-more')[0]
    setTimeout(() => {
        showMoreButton.click()
    }, 2000)

    var scrollInterval = setInterval(() => { window.scrollTo(0, window.scrollY + 50) }, 1)

    setTimeout(() => {
        downloadControls.style.display = "block"
        window.clearInterval(scrollInterval)
        var collectionItems = document.getElementsByClassName("collection-item-container")
        var downloadedItems = []
        statusSpan.innerText = "Found the following albums:"
        for (var i = 0; i < collectionItems.length; i++) {
            var collectionItem = collectionItems[i]
            if(collectionItem.getElementsByClassName("redownload-item").length === 0) {
                continue; // skip non-downloads, i.e. subscriptions
            }
            var itemDetails = collectionItem.getElementsByClassName("collection-item-details-container")[0]
            var albumTitle = itemDetails.getElementsByClassName("collection-item-title")[0].innerText
            var albumArtist = itemDetails.getElementsByClassName("collection-item-artist")[0].innerText
            var downloadLink = collectionItem.getElementsByClassName("redownload-item")[0].children[0].href
            var titleArtistKey = albumTitle + albumArtist
            var albumInfoContainer = document.createElement('div')
            var includeCheckbox = document.createElement('input')
            var titleArtistSpan = document.createElement('span')
            includeCheckbox.type = "checkbox"
            includeCheckbox.link = downloadLink
            albumInfoContainer.appendChild(includeCheckbox)
            titleArtistSpan.innerText = allLinks.length + ": " + albumArtist.substring(3) + " - " + albumTitle
            albumInfoContainer.appendChild(titleArtistSpan)
            mainContainer.appendChild(albumInfoContainer)
            if (!ignoreDuplicateTitles || downloadedItems.indexOf(titleArtistKey) < 0) {
                allLinks.push(downloadLink)
            }
            downloadedItems.push(titleArtistKey)
        }
    }, albumLoadDuration)
})()
