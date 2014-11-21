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

var v = require("../generic/validation");

var baseNote = "[A-G](#|##|b|bb)?";
var chordForm = "([0-9a-z/]*)";
var bass = "(\\/" + baseNote + ")?";

var chordPattern = exports.chordPattern = "^" + baseNote + chordForm + bass + "$";
var chordRegExp = exports.chordRegExp = new RegExp(chordPattern);
exports.chord = v.regExp(chordRegExp);

var chordNoBassPattern = exports.chordNoBassPattern = "^" + baseNote + chordForm + "$";
var chordNoBassRegExp = exports.chordNoBassRegExp = new RegExp(chordNoBassPattern);
exports.chordNoBass = v.regExp(chordNoBassRegExp);
