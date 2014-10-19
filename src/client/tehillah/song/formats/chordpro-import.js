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
var chordRegExp = /\[([A-Za-z0-9#\/]+)\]/;

exports.detect = function () {
    return true;
};

exports.parse = function (content) {
    var song = {
        lyrics : []
    };
    content = content.replace(/\r\n/g, "\n");
    var lines = content.split("\n");
    var lastVerse = null;
    for (var i = 0, l = lines.length; i < l; i++) {
        var curLine = lines[i];
        var firstChar = curLine.charAt(0);
        if (firstChar == "{" && curLine.charAt(curLine.length - 1) == "}") {
            // directive
            var match = /^\{([_a-z]+)(?:[:\s](.*))?\}$/.exec(curLine);
            var directiveName = match[1];
            if (directiveName == "title" || directiveName == "t") {
                song.title = match[2].trim();
            }
            if (directiveName == "subtitle" || directiveName == "st") {
                // the subtitle is typically the author
                song.author = match[2].trim();
            }
        } else if (firstChar == "#") {
            // this is a comment, to be ignored
        } else if (!firstChar) {
            // empty line
            lastVerse = null;
        } else {
            // text/chords
            // each part (except perhaps the first one) starts with a chord:
            var items = [];
            var lastItem = null;
            var match = chordRegExp.exec(curLine);
            while (match) {
                if (match.index > 0) {
                    if (!lastItem) {
                        lastItem = {};
                        items.push(lastItem);
                    }
                    lastItem.lyrics = curLine.substr(0, match.index);
                }
                lastItem = {
                    chord : match[1]
                };
                items.push(lastItem);
                curLine = curLine.substr(match.index + match[0].length);
                match = chordRegExp.exec(curLine);
            }
            if (curLine.length) {
                if (!lastItem) {
                    lastItem = {};
                    items.push(lastItem);
                }
                lastItem.lyrics = curLine;
            }
            if (!lastVerse) {
                lastVerse = {
                    lines : []
                };
                song.lyrics.push(lastVerse);
            }
            lastVerse.lines.push(items);
        }
    }
    return song;
};
