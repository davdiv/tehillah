var getXMLTagContent = function (doc, selector) {
	var element = doc.querySelector(selector);
	return element ? element.textContent : "";
};

module.exports = function (text) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(text, "text/xml");
	return {
		title: getXMLTagContent(doc, "title"),
		author: getXMLTagContent(doc, "author"),
		copyright: getXMLTagContent(doc, "copyright"),
		lyrics: getXMLTagContent(doc, "lyrics")
	};
};
