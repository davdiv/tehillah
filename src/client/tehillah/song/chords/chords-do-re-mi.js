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

var chordsCD = [ "C", "D", "E", "F", "G", "A", "B" ];
var chordsDoRe = [ "Do", "Ré", "Mi", "Fa", "Sol", "La", "Si" ];

module.exports = function (chord) {
    return chord.replace(/(^|\/)([A-G])/g, function (match, begin, note) {
        var index = chordsCD.indexOf(note);
        return begin + chordsDoRe[index];
    });
};
