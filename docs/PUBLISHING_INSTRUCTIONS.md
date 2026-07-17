# Publishing instructions

The repository target is `footeprint-prog/fortworth_weekly` on branch `main`.

## Preferred: push the prepared local repository

From the extracted repository package:

```bash
git remote add origin https://github.com/footeprint-prog/fortworth_weekly.git
git push -u origin main
```

Authenticate with GitHub when prompted. The package contains two coherent commits: the inherited handoff baseline and the current product/research improvements.

## Alternative: clone the Git bundle

```bash
git clone FortWorth_Premium_Housing_Locator.bundle fortworth_weekly
cd fortworth_weekly
git remote set-url origin https://github.com/footeprint-prog/fortworth_weekly.git
git push -u origin main
```

## GitHub Pages

After the first push:

1. Open repository **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. The included workflow will run `npm ci`, `npm run check`, build the Vite app, and deploy it.

Expected site URL:

`https://footeprint-prog.github.io/fortworth_weekly/`
