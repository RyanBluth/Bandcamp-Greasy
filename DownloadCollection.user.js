// ==UserScript==
// @name         Bandcamp Download Collection
// @namespace    https://bandcamp.com
// @version      1.3
// @description  Opens the download page for each item in your collection.
// @author       Ryan Bluth, Xerus2000, bb010g
// @match        https://bandcamp.com/YOUR_USERNAME
// @grant        GM_openInTab
// ==/UserScript==

// Ignore albums with the same title and artist
var ignoreDuplicateTitles = true;

(function () {
    'use strict';

    // https://github.com/WebReflection/ustyler v1.0.1 | SPDX-License-Identifier(ISC) | Copyright (c) 2020, Andrea Giammarchi, @WebReflection
    function css(template) {
        const text = typeof template == 'string' ? [template] : [template[0]];
        for (let i = 1, {length} = arguments; i < length; i++)
            text.push(arguments[i], template[i]);
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(text.join('')));
        return document.head.appendChild(style);
    };
    // end(ustyler)

    // SPDX-License-Identifier(0BSD) | Copyright 2018, 2020 bb010g
    var EventHandler = {handleEvent(event) { this['on' + event.type](event); }};
    function createEventHandler(handler) {
        if (!EventHandler.isPrototypeOf(handler)) { handler = Object.create(EventHandler, handler); }
        return handler;
    }
    function addEventHandler(target, handler) {
        for (const type of Object.getOwnPropertyNames(handler)) {
            if (/^on/.test(type)) { target.addEventListener(type.slice(2), handler); }
        }
        target.eventHandler = handler;
    }
    function element(tagName, props = {}, children = [], eventHandler = {}) {
        const el = document.createElement(tagName);
        Object.assign(el, props);
        el.append(...children);
        addEventHandler(el, createEventHandler(eventHandler));
        return el;
    };
    // end

    function newMouseEvent(type, view) { return new MouseEvent(type, {bubbles: true, cancelable: true, view: view}); }

    var style = css`
        #bandcamp-greasy {
            background-color: #1DA0C3;
            position: fixed;
            color: white;
            top: 0;
            left: 0;
            right: 0;
            padding: 20px;
            z-index: 9999999;
            max-height: 75vh;
            box-sizing: border-box;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }
        #bandcamp-greasy a { color: inherit; }
        #bandcamp-greasy li { margin-top: unset; margin-bottom: unset; }
        #bandcamp-greasy > * {
            display: grid;
            grid-template-columns: auto fit-content(30em);
            grid-auto-rows: fit-content(50vh);
        }
        #bandcamp-greasy > * > * { grid-column: 1; overflow-y: auto; }
        #bandcamp-greasy > * > .controls { grid-column: 2; overflow-y: unset; }
        #bandcamp-greasy h2 { text-transform: uppercase; }
        #bandcamp-greasy > .status {
            font-weight: bold;
        }
        #bandcamp-greasy .controls {
            color: black;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            align-content: center;
            justify-content: flex-end;
        }
        #bandcamp-greasy .controls > button, #bandcamp-greasy .controls > input::placeholder {
            text-transform: capitalize;
        }
        #bandcamp-greasy .controls > * {
            display: block;
            margin-bottom: 10px;
        }
        #bandcamp-greasy .album-infos .album-info input[type="checkbox"]:disabled ~ .item {
            text-decoration: line-through;
        }
    `;

    var mainContainer = element('div', {id: 'bandcamp-greasy'}, [
        element('div', {className: 'header'}, [
            element('h2', {innerHTML: `<a style="color: inherit" href="https://github.com/RyanBluth/Bandcamp-Greasy">Bandcamp Greasy</a>`}),
            element('div', {className: 'controls'}, [
                element('button', {className: 'close', textContent: "Close"}, [], {onclick: {value(e) {
                    hideMainContainer();
                }}}),
                element('button', {className: 'retry-pagination', textContent: "Retry pagination"}, [], {onclick: {value(e) {
                    var collectionGrid = window.CollectionGrids.collection;
                    if (collectionGrid.paginating) {
                        return;
                    }
                    if (collectionGrid.error) {
                        collectionGrid.error = false;
                    }
                    collectionGrid.paginate();
                }}}),
            ]),
        ]),
        element('div', {className: 'albums'}, [
            element('span', {className: 'status', textContent: "No albums loaded."}),
            element('div', {className: 'controls'}, [
                element('button', {className: 'clear-scanned-albums', textContent: "Clear scanned albums"}, [], {onclick: {value(e) {
                    var parent = e.target.parentNode;
                    parent.parentNode.querySelector('.album-infos').textContent = '';
                    parent.parentNode.querySelector('.status').textContent = "No albums loaded.";
                }}}),
                element('button', {className: 'scan-albums', textContent: "Scan albums"}, [], {onclick: {value(e) {
                    if (e.target.disabled) { return; }
                    e.target.disabled = true;
                    var albumInfos = e.target.parentNode.parentNode.querySelector('.album-infos');
                    var collectionItems = document.getElementsByClassName('collection-item-container');
                    document.querySelector('#bandcamp-greasy span.status').textContent = "Found the following albums:";
                    for (var i = 0; i < collectionItems.length; i++) {
                        var collectionItem = collectionItems[i];
                        if (collectionItem.getElementsByClassName('redownload-item').length === 0) {
                            continue; // skip non-downloads, i.e. subscriptions
                        }
                        var itemDetails = collectionItem.getElementsByClassName('collection-item-details-container')[0];
                        var itemLink = collectionItem.getElementsByClassName('item-link')[0];
                        var albumTitle = itemDetails.getElementsByClassName('collection-item-title')[0];
                        var albumArtist = itemDetails.getElementsByClassName('collection-item-artist')[0];
                        var downloadLink = collectionItem.getElementsByClassName('redownload-item')[0].children[0];
                        var includeCheckbox = element('input', {type: 'checkbox'});
                        for (var existingItemLink of albumInfos.querySelectorAll('li > label > a.item')) {
                            if (existingItemLink.href === itemLink.href) {
                                includeCheckbox.disabled = true;
                                break;
                            }
                        }
                        albumInfos.appendChild(element('li', {className: 'album-info'}, [
                            element('label', {}, [
                                includeCheckbox,
                                element('a', {className: 'item', href: itemLink.href, target: '_blank'}, [
                                    element('span', {className: 'artist', textContent: albumArtist.innerText.substring(3)}),
                                    ' - ',
                                    element('span', {className: 'album', textContent: albumTitle.innerText}),
                                ]),
                                ' ',
                                element('a', {className: 'download', href: downloadLink.href, target: '_blank'}, ['(download)']),
                            ]),
                        ]));
                    }
                    e.target.disabled = false;
                }}}),
                element('button', {className: 'auto-scan-albums', textContent: "Auto-scan albums"}, [], {onclick: {value(e) {
                    if (e.target.disabled) { return; }
                    e.target.disabled = true;
                    var parent = e.target.parentNode;
                    parent.parentNode.querySelector('.status').textContent = "Loading albums...";
                    document.querySelector('#collection-items .show-more').click();

                    setTimeout(function () {
                        var scrollInterval = setInterval(function () {
                            window.scrollTo(0, window.scrollY + 1000);
                        }, 1);
            
                        var doneInterval = setInterval(function () {
                            var loadMoreContainer = document.getElementsByClassName('expand-container')[0];
                            if (window.getComputedStyle(loadMoreContainer).display === 'none') {
                                showMainContainer();
                                window.clearInterval(scrollInterval);
                                window.clearInterval(doneInterval);
                                e.target.disabled = false;
                                parent.querySelector('.scan-albums').dispatchEvent(newMouseEvent('click', e.view));
                            }
                        }, 2000);
                    }, 1000);
                }}}),
            ]),
            element('ol', {className: 'album-infos', start: 0}),
            element('div', {className: 'controls'}, [
                element('button', {className: 'download-all', textContent: "Download all"}, [], {onclick: {value(e) {
                    for (var link of e.target.parentNode.parentNode.querySelectorAll('.album-infos .album-info input[type="checkbox"]:enabled ~ a.download')) {
                        window.open(link.href, '_blank');
                    }
                }}}),
                element('button', {className: 'download-selected', textContent: "Download selected"}, [], {onclick: {value(e) {
                    for (var link of e.target.parentNode.parentNode.querySelectorAll('.album-infos .album-info input[type="checkbox"]:enabled:checked ~ a.download')) {
                        window.open(link.href, '_blank');
                    }
                }}}),
                element('input', {type: 'text', className: 'download-range range-start', placeholder: "Range start"}),
                element('input', {type: 'text', className: 'download-range range-end', placeholder: "Range end"}),
                element('button', {className: 'download-range', textContent: "Download range"}, [], {onclick: {value(e) {
                    var parent = e.target.parentNode;
                    var albumInfos = parent.parentNode.querySelectorAll('.album-infos > li');
                    var rangeStart = parseInt(parent.querySelector('.download-range.range-start').value);
                    var rangeEnd = parseInt(parent.querySelector('.download-range.range-end').value);
                    for (var i = rangeStart; i <= rangeEnd && i < albumInfos.length; i++) {
                        var link = albumInfos[i].querySelector('input[type="checkbox"]:enabled ~ a.download');
                        if (link != null) { window.open(link.href, '_blank'); }
                    }
                }}}),
            ]),
        ]),
    ]);
    mainContainer.style.display = 'none';
    document.body.appendChild(mainContainer);

    function hideMainContainer() {
        var mainContainer = document.getElementById('bandcamp-greasy');
        if (mainContainer.style.display !== 'none') { mainContainer.style.display = 'none'; }
    }
    function showMainContainer() {
        var mainContainer = document.getElementById('bandcamp-greasy');
        if (mainContainer.style.display === 'none') { mainContainer.style.display = null; }
    }

    setTimeout(function () {
        showMainContainer();
    }, 2000);
})();
