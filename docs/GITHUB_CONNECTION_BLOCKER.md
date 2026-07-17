# GitHub publication blocker

The project was built and verified locally, but the connected GitHub tool reported no installed GitHub App accounts and returned HTTP 403 for both repository-content and issue writes.

## Required connection

Grant the ChatGPT/OpenAI GitHub app access to the `footeprint-prog/fortworth_weekly` repository with repository contents and issues write access. After the repository is connected, the prepared project can be published directly.

## Manual publication fallback

From the project folder:

```bash
git init
git branch -M main
git add .
git commit -m "Launch Fort Worth housing dashboard"
git remote add origin https://github.com/footeprint-prog/fortworth_weekly.git
git push -u origin main
```

Then open repository **Settings → Pages** and select **GitHub Actions** as the deployment source if required. The included workflow runs all checks and deploys the site.
