/* global demo */
(function (window) {
  'use strict';

  var onAuthCallback = function() {};
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  window.demo = window.demo || { };
  window.demo.userDidSignIn = false;

  window.demo.onFirebaseAuth = function(callback) {
    onAuthCallback = callback;
  }

  var uiConfig = {
    signInOptions: [{
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
    }],
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        // return true;
        console.log('signInSuccessWithAuthResult');
        // console.log(authResult);
        return false;
      },
      uiShown: function() {
        // Note, there is _still_ lag after this, between here, and authStateChanged... what is the point of this callback
        console.log('uiShown');
        document.getElementById('loader').style.display = 'none'; // user never sees it anyway because we hide it here and then still lag...
      }
    },
  };

  function authStateChanged(user) {
    if (user) {
      // User is signed in.
      console.log(`Sign in as ${user.email}`);

      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var uid = user.uid;
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;
      user.getIdToken().then(function(accessToken) {
        // console.log(`accessToken=${accessToken}`);
        // document.getElementById('sign-in-status').textContent = 'Signed in';
        // document.getElementById('sign-in').textContent = 'Sign out';
        // document.getElementById('account-details').textContent = JSON.stringify({
        //   displayName: displayName,
        //   email: email,
        //   emailVerified: emailVerified,
        //   phoneNumber: phoneNumber,
        //   photoURL: photoURL,
        //   uid: uid,
        //   accessToken: accessToken,
        //   providerData: providerData
        // }, null, '  ');
        document.getElementById('landing-content').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        document.getElementById('user-title').textContent = email;

        // hackity hack
        window.demo.user = user;
        onAuthCallback(user);
      });
    } else {
      // User is signed out.
      // document.getElementById('sign-in-status').textContent = 'Signed out';
      // document.getElementById('sign-in').textContent = 'Sign in';
      // document.getElementById('account-details').textContent = 'null';
      document.getElementById('user-title').textContent = '';

      if (!window.demo.userDidSignIn) {
        console.log('Was not signed in in this browser session yet');
        ui.start('#firebaseui-auth-container', uiConfig);
        document.getElementById('landing-content').style.display = 'block';
        onAuthCallback(null);
      } else {
        console.log('User sign out completed');
        onAuthCallback(null, true);
      }
      window.demo.user = null;
    }
  }

  function onLoad() {
    $('#btn-sign-up').click(function () { alert('Not yet implemented'); });
    $('#btn-sign-out').click(function () { firebase.auth().signOut(); });

    firebase.auth().onAuthStateChanged(authStateChanged);
    if (ui.isPendingRedirect()) {
      console.error('We should not see this!');
    }
  }
  $( window ).on("load", onLoad);
})(window);
