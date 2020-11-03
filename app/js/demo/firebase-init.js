(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyAVwnHnHNk3y0hZPJA88_ecBIpgy8tt0hU",
    authDomain: "comfycon-bookmark-demo-app.firebaseapp.com",
    databaseURL: "https://comfycon-bookmark-demo-app.firebaseio.com",
    projectId: "comfycon-bookmark-demo-app",
    storageBucket: "comfycon-bookmark-demo-app.appspot.com",
    messagingSenderId: "839275086164",
    appId: "1:839275086164:web:29854dcb3fd6c1d169c8c1"
  };

  console.log('Initialising firebase...');
  firebase.initializeApp(firebaseConfig);
})();
