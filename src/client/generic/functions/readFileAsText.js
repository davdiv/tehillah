var Promise = require("noder-js/promise");

module.exports = function (file) {
	return new Promise(function (resolve) {
		var reader = new FileReader();
		reader.onload = function (event) {
			resolve(reader.result);
		};
		reader.readAsText(file);
	});
};
