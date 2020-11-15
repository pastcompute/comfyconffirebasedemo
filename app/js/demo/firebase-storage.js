(function (window) {
	'use strict';

  var localStorage = window.localStorage;

	/**
	 * Creates am object that looks like window.localStorage that actually uses Firebase instead.
   *
   * Things to note:
   * - the way TodoMVC is designed it keeps rewriting the _entire_ store!
   * - a real Firebase app would not do that...
   * - purpose of this code is security demonstration, though, so we just put up with that!
   * - firebase is also asynchronous, ...
	 */
	function FirebaseStorage() {

  }

  FirebaseStorage.prototype.getItem = function(key) {
    console.log(`getItem(${key})`);
    return localStorage.getItem(key);
  }

  FirebaseStorage.prototype.setItem = function(key, value) {
    console.log(`setItem(${key}, ${value})`);
    return localStorage.setItem(key, value);
  }

	window.FirebaseStorage = FirebaseStorage;
})(window);
