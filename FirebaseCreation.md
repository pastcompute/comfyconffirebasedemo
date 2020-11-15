# Firebase project creation instructions

## Notes

- with a real app, we would have an account creation and onboarding flow but we are skipping this today and manually adding some users.

- the Firebase default password complexity is simply 6 characters, a real app would need to enforce a better scheme

- it is possible to script all of this (full Devops capability)

- authentication information is saved in Google cloud

- the APIs take care of hashing the password and securely performing authentication tasks, etc.

- migration is possible in the future, the password hash configuration can be retrieved

## Create a project in the Firebase console

1. Go to https://console.firebase.google.com
2. Select `Create a Project`
3. Enter a project title, e.g. `ComfyCon Bookmark Demo App`.
   - Note this will generate an all lower case identifier from the name
   - Example, `comfycon-bookmark-demo-app`
4. Optionally enable analytics
   - I kept it off for this demo
5. Select `Create a Project` to begin creation
6. Select `Continue` when finished

## Enable password based auth and create a couple of demo users

1. From the menu on the left, select `Authentication`
2. Select `Setup Sign-in method`
3. Choose `Email/Password` from the list
4. Select `Enable`
5. Select `Save`
6. Select `Users`
7. Select `Add user`
8. Enter an email address and password. This can be `hello@example.com` if you choose because we are not writing any code that  uses the email, it is just used as a login identifier.
9. Select `Add user` to commit the new user
10. Repeat the previous two steps and make a couple more test users.

## Create a Realtime Database

The realtime database is one of two database models provided by Firebase. This is a NoSQL database, which provides easy to use realtime synchronisation but relatively basic query functionality and a simple JSON hierarchy.

The other database type is the Cloud Firestore; compare the difference at https://firebase.google.com/docs/database/rtdb-vs-firestore

1. From the menu on the left, select `Realtime Database`
2. Select `Create Database`
3. Start in `test mode`
   - note, `test mode` leaves the database wide open until we write some security rules. Most developers start in `test mode` to simplify getting up and running and then forget to write or refine their security rules...
   - `test mode` is automatically locked out after 30 days if no rules are created
   - the other option is `locked mode` and this prevents all reads or writes from any user until the rules are customised.

At this point the database looks like:
![New empty database](doc/screenshots/new-database.png)

## Linking to the app

Note - see documentation for havascript at "Get Started for the Web" (https://firebase.google.com/docs/web/setup)

1. Select `Project Overview`
2. Select the Web icon i.e. `</>`
3. Set the nickname e.g. `ComfyConBookmarkDemo App`
4. Setup firebase hosting
   - note this will show a chooser, with the identifier of existing app, i.e. `confycon-bookmark-demo-app`
5. Select `Register App`
6. You are then prompted to copy some text into your HTML, however we will do it differently from Angular+Ionic
7. We still need to install the firebase CLI `npm install -g firebase-tools`

### Firebase in Typescript+Angular+Ionic

First, install firebase JS API: `npm install --save firebase`

1. Settings (cog icon next to Project Overview), Project Settings
2. Note the `Web API Key`, `Project ID`
3. Scroll down, choose Firebase SDK Snipper - Config, and copy to your code:

```
const firebaseConfig = {
  apiKey: "AIzaSyAVwnHnHNk3y0hZPJA88_ecBIpgy8tt0hU",
  authDomain: "comfycon-bookmark-demo-app.firebaseapp.com",
  databaseURL: "https://comfycon-bookmark-demo-app.firebaseio.com",
  projectId: "comfycon-bookmark-demo-app",
  storageBucket: "comfycon-bookmark-demo-app.appspot.com",
  messagingSenderId: "839275086164",
  appId: "1:839275086164:web:29854dcb3fd6c1d169c8c1"
};

## Database Rules

Default these days
```
{
  "rules": {
    ".read": "now < 1606829400000",  // 2020-12-2
    ".write": "now < 1606829400000",  // 2020-12-2
  }
}
```

Developers turned it off for testing
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Allow auth only to our data
```
{
  "rules": {
    ".read": false,
    ".write": false,
    "userdata": {
      ".read": "auth != null"
    },
  }
}
```

Guess the label. and allow only user to write itself:
```
{
  "rules": {
    ".read": false,
    ".write": false,
    "userdata": {
      ".read": true,
      "$user_id": {
        ".write": "$user_id == auth.uid"
      }
    },
  }
}
```

Allow individual users to only see & edit themselves
But other users can see a user once the find the uid from other means than scanning the database
(May be needed when sharing things, but a better mechanism is use a different database structure)
```
{
  "rules": {
    ".read": false,
    ".write": false,
    "userdata": {
      "$user_id": {
        ".read": true,
        ".write": "$user_id == auth.uid"
      }
    },
  }
}
```

Allow self totally only
```
{
  "rules": {
    ".read": false,
    ".write": false,
    "userdata": {
      "$user_id": {
        ".read": "auth != null && $user_id == auth.uid"
        ".write": "auth != null && $user_id == auth.uid"
      }
    },
  }
}
```
