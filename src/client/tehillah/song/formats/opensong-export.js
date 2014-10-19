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

var createSongDoc = function () {
    var parser = new DOMParser();
    return parser.parseFromString("<song></song>", "text/xml");
};

var completeWith = function (str, size, char) {
    var addChars = size - str.length;
    if (addChars <= 0) {
        return str;
    }
    var extra = [];
    for (var i = 0; i < addChars; i++) {
        extra[i] = char;
    }
    return str + extra.join("");
};

var stringifyLyrics = function (lyrics) {
    var res = [];
    lyrics.forEach(function (curVerse, index) {
        if (index > 0) {
            res.push(""); // empty line
        }
        res.push("[V" + index + "]");
        curVerse.lines.forEach(function (line) {
            var chords = "";
            var lyrics = "";
            var lyricsWordFinished = true;
            line.forEach(function (item) {
                var curChord = item.chord ? item.chord + " " : "";
                var curLyrics = item.lyrics || "";
                if (curLyrics) {
                    lyricsWordFinished = /\s$/.test(curLyrics);
                }
                var size = Math.max(curChord.length, curLyrics.length);
                chords += completeWith(curChord, size, " ");
                lyrics += completeWith(curLyrics, size, lyricsWordFinished ? " " : "_");
            });
            chords = chords.replace(/\s+$/, "");
            lyrics = lyrics.replace(/_*\s*$/, "");
            if (chords) {
                res.push("." + chords);
            }
            if (lyrics) {
                res.push(" " + lyrics);
            }
        });
    });
    return res.join("\n");
};

var appendField = function (doc, name, content) {
    var element = doc.createElement(name);
    doc.documentElement.appendChild(element);
    element.appendChild(doc.createTextNode(content || ""));
};

var stringifySong = function (song) {
    var doc = createSongDoc();
    appendField(doc, "title", song.title);
    appendField(doc, "author", song.author);
    appendField(doc, "copyright", song.copyright);
    appendField(doc, "lyrics", stringifyLyrics(song.lyrics));
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + doc.documentElement.outerHTML;
};

module.exports = {
    stringifyLyrics : stringifyLyrics,
    stringifySong : stringifySong
};