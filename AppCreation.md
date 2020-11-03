# App creation

For the purpose of demonstration I started with the vanilla JS ToDo example from the taste MVC website.
This involved copying the `todomvc/examples/vanillajs/` directory to `app` in this repository

npm install -g http-server

Now we can run `http-server app` and browse to http://localhost:8080 to run it

Then I added in a very simple and probably buggy authentication dialog and persistence, to be able to demonstrate the Firebase permissions.

## Firebase integration

- See: https://firebase.google.com/docs/web/setup
- Use the CDN method

## Firebase Authentication Integration

- See: https://firebase.google.com/docs/auth/web/firebaseui
-

## Security Notes

- this is a quick mocked up app, the purpose is to demonstrate firebase database permissions
- a real app would have significant additional function including structural design paying attention to security
- as always the rule 'validate in the backend should be adhered to, because anyone could manipulate the Javascript code on the front end and avoid any mitigations we attempted to add there, anyway!

