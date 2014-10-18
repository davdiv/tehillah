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

var parseLyrics = function (lyrics) {
	var result = [];
	var curVerse = null;
	var addVerse = function (header) {
		curVerse = {
			header: header,
			lines: []
		};
		result.push(curVerse);
	};
	var checkCurVerse = function () {
		if (!curVerse) {
			addVerse();
		}
	};
	lyrics = lyrics.replace(/\r\n/g,"\n");
	var lines = lyrics.split("\n");
	for (var i = 0, l = lines.length; i < l; i++) {
		var curLine = lines[i];
		var firstChar = curLine.charAt(0);
		if (firstChar == "[") {
			addVerse(curLine.slice(1).replace(/\]\s*$/, "").trim());
		} else if (firstChar == ".") {
			// chords: not currently supported
			// checkCurVerse();
		} else if (/^[ 1-9]$/.test(firstChar)) {
			// lyrics
			var line = curLine.slice(1).replace(/\|\|\s*$/,"").trim();
			if (line) {
				checkCurVerse();
				curVerse.lines.push({
					lyrics: [line]
				});
			}
		}
	}
	return result;
};

var parseFile = function (text) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(text, "text/xml");
	return {
		title: getXMLTagContent(doc, "title"),
		author: getXMLTagContent(doc, "author"),
		copyright: getXMLTagContent(doc, "copyright"),
		lyrics: parseLyrics(getXMLTagContent(doc, "lyrics"))
	};
};

module.exports = {
	parseLyrics: parseLyrics,
	parseFile: parseFile
};