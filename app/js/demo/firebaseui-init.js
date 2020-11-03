/* global fui */
(function (window) {
  'use strict';

  console.log('Initialising firebaseui...');

  window.fui = new firebaseui.auth.AuthUI(firebase.auth());
})(window);
