## How to update the base template

If you want to update the base template this is the process (unfortunately Mailchimp makes it a bit tricky):

- Update the file `functions/create-issue/templates/newsletter.njk` and apply the desired changes
- Run the tests with `node_modules/.bin/vitest run functions/create-issue/ -u` (from the root of the project)
- Now the file `functions/create-issue/__tests__/__snapshots__/template.html` is up to date. Copy its code.
- In Mailchimp edit the saved template and paste the code
- Check that the preview renders as expected and save
