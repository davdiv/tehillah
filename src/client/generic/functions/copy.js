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

var copy = module.exports = function (src) {
	if (src && typeof src == "object") {
		if (src instanceof Array) {
			return src.map(copy);
		} else {
			var res = {};
			for (var item in src) {
				if (src.hasOwnProperty(item) && !/^\+/.test(item)) {
					res[item] = copy(src[item]);
				}
			}
			return res;
		}
	} else {
		return src;
	}
};