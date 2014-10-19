/*
    Tehillah: Web-based application to manage and display worship songs.
    https://github.com/davdiv/tehillah
    Copyright (C) 2014 DivDE <divde@free.fr>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
var getXMLTagContent = function (doc, selector) {
    var element = doc.querySelector(selector);
    return element ? element.textContent : "";
};

var parseLyrics = exports.parseLyrics = function (lyrics) {
    var result = [];
    var curVerse = null;
    var addVerse = function (header) {
        curVerse = {
            lines : []
        };
        result.push(curVerse);
    };
    var checkCurVerse = function () {
        if (!curVerse) {
            addVerse();
        }
    };
    lyrics = lyrics.replace(/\r\n/g, "\n");
    var lines = lyrics.split("\n");
    for (var i = 0, l = lines.length; i < l; i++) {
        var curLine = lines[i];
        var firstChar = curLine.charAt(0);
        if (firstChar == "[") {
            addVerse(curLine.substr(1).replace(/\]\s*$/, "").trim());
        } else if (firstChar == ".") {
            // chords + lyrics
            var items = [];
            var lastItem = null;
            var chordsLine = curLine.substr(1);
            var lyricsLine = "";
            if (i + 1 < l && (curLine = lines[i + 1]).charAt(0) == " ") {
                lyricsLine = curLine.substr(1).replace(/\|\|\s*$/, "");
                i++;
            }
            var lastChordSize = 0;
            var match = /\S+/.exec(chordsLine);
            while (match) {
                var takeInLyricsLine = lastChordSize + match.index;
                if (takeInLyricsLine > 0 && lyricsLine) {
                    if (!lastItem) {
                        lastItem = {};
                        items.push(lastItem);
                    }
                    lastItem.lyrics = lyricsLine.substr(0, takeInLyricsLine).replace(/_/g, "");
                    lyricsLine = lyricsLine.substr(takeInLyricsLine);
                }
                lastItem = {
                    chord : match[0]
                };
                items.push(lastItem);
                lastChordSize = match[0].length;
                chordsLine = chordsLine.substr(match.index + lastChordSize);
                match = /\S+/.exec(chordsLine);
            }
            if (lyricsLine) {
                if (!lastItem) {
                    lastItem = {};
                    items.push(lastItem);
                }
                lastItem.lyrics = lyricsLine;
            }
            if (lastItem) {
                checkCurVerse();
                curVerse.lines.push(items);
            }
        } else if (firstChar == " ") {
            // lyrics
            var line = curLine.substr(1).replace(/_/g, "").replace(/\|\|\s*$/, "");
            if (line) {
                checkCurVerse();
                curVerse.lines.push([ {
                    lyrics : line
                } ]);
            }
        }
    }
    return result;
};

exports.parse = function (text) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(text, "text/xml");
    return {
        title : getXMLTagContent(doc, "title"),
        author : getXMLTagContent(doc, "author"),
        copyright : getXMLTagContent(doc, "copyright"),
        lyrics : parseLyrics(getXMLTagContent(doc, "lyrics"))
    };
};

exports.detect = function (fileContent) {
    return /^\</.test(fileContent);
};
