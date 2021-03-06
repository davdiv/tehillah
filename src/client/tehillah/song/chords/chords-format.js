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

var chordsDoReMi = require("./chords-do-re-mi");
var chordsTranspose = require("./chords-transpose");

module.exports = function (chord, displayChord) {
    var transpose = displayChord.transpose;
    if (transpose) {
        chord = chordsTranspose(chord, transpose.level, transpose.bemol);
    }
    if (displayChord.doReMi) {
        chord = chordsDoReMi(chord);
    }
    return chord;
};
