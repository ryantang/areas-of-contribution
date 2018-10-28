# form-updater
A Google Apps Script webapp that can update an existing Google Form to match a configured set of Skills / Areas of Contribution

## Development
 
### Initial setup
- [Enable Apps Script API](https://script.google.com/home/usersettings)

- Set up local dev environment
  ```
  npm -v  # must be >= 4.7.4
  npm i @google/clasp -g  # see https://github.com/google/clasp
  clasp login
  ```

### Regular flow

```
clasp push
clasp deploy
```

- [View logs here](https://console.cloud.google.com/logs/viewer?project=project-id-8564863710677727141&resource=app_script_function)

- [Google Apps Script docs on **Collaboration**](https://developers.google.com/apps-script/guides/collaborating)
