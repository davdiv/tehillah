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

var chordValidation = require("./chord");
var language = require("./language").language;
var nonEmptyString = [ v.string, v.minLength(1) ];

var channelTypes = {
    "lyrics" : {
        channel : v.object({
            id : nonEmptyString,
            type : nonEmptyString,
            verses : v.optional([ v.integer, v.minValue(1) ]),
            language : v.optional(language)
        }),
        content : nonEmptyString
    },
    "chords" : {
        channel : v.object({
            id : nonEmptyString,
            type : nonEmptyString
        }),
        content : chordValidation.chord
    }
};

var channelValidator = function (channel) {
    var channelType = channelTypes[channel.type];
    if (!channelType) {
        throw v.validationFailure("channelType", null, [ "type" ]);
    }
    return channelType.channel(channel);
};

var contentValidator = function (value) {
    var channelContentConfig = Object.create(null);
    var unusedChannels = {};
    var contentIds = Object.create(null);
    var registerChannel = function (curChannelId, channelValidator, channelIndex) {
        if (channelContentConfig[curChannelId]) {
            throw v.validationFailure("duplicateId", null, [ "channels", channelIndex, "id" ]);
        }
        unusedChannels[channelIndex] = true;
        channelContentConfig[curChannelId] = [ v.optional(channelValidator), function (value) {
            if (value != null) {
                delete unusedChannels[channelIndex];
                return value;
            }
        } ];
    };

    value.channels.forEach(function (channel, index) {
        var channelId = channel.id;
        var validator = channelTypes[channel.type].content;
        registerChannel(channelId, validator, index);
        if (channel.verses != null) {
            for (var i = 1; i <= channel.verses; i++) {
                registerChannel(channelId + "-" + i, validator, index);
            }
        }
    });
    var itemValidator = v.inPath("content", [ v.array(v.object({
        id : nonEmptyString.concat([ function (value) {
            if (contentIds[value]) {
                throw v.validationFailure("duplicateId");
            }
            contentIds[value] = true;
            return value;
        } ]),
        lines : [ v.array([ v.array(v.object(channelContentConfig)), v.minLength(1) ]), v.minLength(1) ]
    })), v.minLength(1) ]);
    value.content = itemValidator(value.content);

    Object.keys(unusedChannels).forEach(function (channelIndex) {
        throw v.validationFailure("unusedChannel", null, [ "channels", channelIndex ]);
    });
    return value;
};

module.exports = v.validator([ v.object({
    titles : [ v.array(v.object({
        title : nonEmptyString,
        language : v.optional(language)
    })), v.minLength(1) ],
    authors : [ v.defaultValue([]), v.array(v.object({
        name : nonEmptyString,
        roles : v.optional(v.array(v.enumValue([ "author", "composer", "arranger", "translator" ]))),
        languages : v.optional(v.array(language))
    })) ],
    copyright : [ v.defaultValue(""), v.string ],
    tags : [ v.defaultValue([]), v.array(v.string) ],
    songbooks : [ v.defaultValue({}), v.map(v.string) ],
    keys : v.optional(v.array(chordValidation.chordNoBass)),
    channels : [ v.array(channelValidator), v.minLength(1) ],
    content : []
}), contentValidator ]);
