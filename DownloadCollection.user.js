// ==UserScript==
// @name         Bandcamp Download Collection
// @namespace    https://bandcamp.com
// @version      1.2
// @description  Opens the download page for each item in your collection.
// @author       Ryan Bluth, Xerus2000
// @match        https://bandcamp.com/YOUR_USERNAME
// @grant        GM_openInTab
// ==/UserScript==

// Ignore albums with the same title and artist
var ignoreDuplicateTitles = true
// The number of milliseconds spent scrolling down to load all albums
var albumLoadDuration = 10000;

(() => {
    'use strict'

    var allLinks = []

    var mainContainer = document.createElement('div')
    mainContainer.setAttribute("oncontextmenu", "this.style.display = 'none';return false;") // close it via rightclick
    mainContainer.style.width = "100%"
    mainContainer.style.backgroundColor = "#1DA0C3"
    mainContainer.style.position = "fixed"
    mainContainer.style.color = "white"
    mainContainer.style.top = "0"
    mainContainer.style.left = "0"
    mainContainer.style.padding = "20px"
    mainContainer.style.zIndex = "9999999"
    mainContainer.style.maxHeight = "700px"
    mainContainer.style.overflowY = "auto"
    mainContainer.innerHTML = "<div><h4>BANDCAMP GREASY<h4></div>"
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
            window.open(allLinks[i], '_blank')
        }
    }

    var downloadSelectedButton = document.createElement("button")
    downloadSelectedButton.innerText = "Download Selected"
    downloadSelectedButton.style.display = "block"
    downloadSelectedButton.style.marginBottom = "10px"
    downloadSelectedButton.onclick = function() {
        var checkboxes = mainContainer.getElementsByTagName("input")
        for(var i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checked) {
                window.open(checkboxes[i].link, '_blank')
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
        var ok = true
        if (rangeStart < 0 || rangeStart >= allLinks.length) {
            downloadRangeStart.value = null
            ok = false
        }
        if (rangeEnd < 0 ||  rangeEnd >= allLinks.length) {
            downloadRangeEnd.value = null
            ok = false
        }

        if (!ok) {
            return
        }
        for(var i = rangeStart; i <= rangeEnd && i < allLinks.length; i++) {
            window.open(allLinks[i], '_blank')
        }
        downloadNextRangeButton.style.display = "block"
    }

    var downloadNextRangeButton = document.createElement('button')
    downloadNextRangeButton.innerText = 'Download next range'
    downloadNextRangeButton.style.display = "none"
    downloadNextRangeButton.style.marginBottom = "10px"
    downloadNextRangeButton.onclick = () => {
        var rangeStart = parseInt(downloadRangeStart.value)
        var rangeEnd = parseInt(downloadRangeEnd.value)
        var limit = rangeEnd - rangeStart + 1
        downloadRangeStart.value = Math.min(rangeEnd + 1, allLinks.length - 1)
        downloadRangeEnd.value = Math.min(rangeEnd + limit, allLinks.length - 1)
        downloadRangeButton.click()
    }


    downloadControls.appendChild(downloadAllButton)
    downloadControls.appendChild(downloadSelectedButton)
    downloadControls.appendChild(downloadRangeButton)
    downloadControls.appendChild(downloadRangeStart)
    downloadControls.appendChild(downloadRangeEnd)
    downloadControls.appendChild(downloadNextRangeButton)

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
