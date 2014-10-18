var createSongDoc = function () {
	var parser = new DOMParser();
	return 	parser.parseFromString("<song></song>", "text/xml");
};

var stringifyLyrics = function (lyrics) {
	var res = [];
	lyrics.forEach(function (curVerse) {
		res.push("["+(curVerse.header || " ")+"]");
		curVerse.lines.forEach(function (line) {
			var lyrics = line.lyrics.join("");
			res.push(" "+lyrics);
		});
	});
	return res.join("\n");
};

var appendField = function (doc, name, content) {
	var element = doc.createElement(name);
	doc.documentElement.appendChild(element);
	element.appendChild(doc.createTextNode(content || ""));
};

var stringifySong = function(song) {
	var doc = createSongDoc();
	appendField(doc, "title", song.title);
	appendField(doc, "author", song.author);
	appendField(doc, "copyright", song.copyright);
	appendField(doc, "lyrics", stringifyLyrics(song.lyrics));
	return '<?xml version="1.0" encoding="UTF-8"?>\n' + doc.documentElement.outerHTML;
};

module.exports = {
	stringifyLyrics: stringifyLyrics,
	stringifySong: stringifySong
};