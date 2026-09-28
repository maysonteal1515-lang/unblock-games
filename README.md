# Unblocked Games Portal

A fast, unblocked browser arcade player powered by an iframe-driven JSON catalog.

## Deploying to GitHub Pages (Fixing Blank Screen)

Because React and Vite must be compiled into static HTML/JS before GitHub Pages can serve them, follow either of these methods:

### Recommended: Automatic Deployment with GitHub Actions
This project includes `.github/workflows/deploy.yml`:
1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. GitHub will automatically run the build and publish the live site to your GitHub Pages URL without any blank page issues.

### Alternative: Manual Build
1. Run `npm install` and `npm run build`.
2. The compiled site will be generated in `/dist` with relative paths (`base: './'`).
3. Deploy the contents of the `/dist` folder to your `gh-pages` branch.
