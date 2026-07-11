# Search Console setup

This project is the personal blog served from `https://blog.nanggo.net`.

## Current SEO endpoints

- Canonical domain: `https://blog.nanggo.net`
- Robots: `https://blog.nanggo.net/robots.txt`
- Sitemap: `https://blog.nanggo.net/sitemap.xml`
- RSS: `https://blog.nanggo.net/rss.xml`

`static/robots.txt` already advertises the sitemap:

```txt
Sitemap: https://blog.nanggo.net/sitemap.xml
```

## Ownership verification

Verification tokens are public by design. Do not treat them as secrets.

## Current console state

Checked on 2026-07-10.

- Google Search Console: `https://blog.nanggo.net/` is verified. Google reported automatic ownership verification via domain name provider.
- Google Search Console sitemap: `/sitemap.xml` was re-submitted. The console processed the current live sitemap successfully and reported 72 discovered pages (the UI displayed 2026-07-11 as the submitted/read date).
- Google Search Console URL inspection: `/`, `/post/solid-principles-frontend-guide`, and `/post/tmux-remote-dev-guide` were added to the priority crawl queue. A request does not guarantee indexing.
- Naver Search Advisor: `https://blog.nanggo.net` is registered.
- Naver Search Advisor site status: SSL certificate, HTTPS redirect, and sitemap are normal/registered.
- Naver Search Advisor RSS: `https://blog.nanggo.net/rss.xml` is ready to submit, but the console CAPTCHA still requires completion.
- Bing Webmaster Tools: `blog.nanggo.net` is registered.
- Bing Webmaster Tools sitemap: `https://blog.nanggo.net/sitemap.xml` was re-submitted on 2026-07-10 and accepted for processing. The previous crawl reported 67 discovered URLs.

### Naver Search Advisor

Use the existing HTML meta tag verification.

The current token is rendered from `src/app.html`:

```html
<meta name="naver-site-verification" content="770124667ed0f9d43f7c238ff280159c23a1e320" />
```

Recommended console steps:

1. Register `https://blog.nanggo.net`.
2. Choose HTML tag verification if the site is not already verified.
3. Verify ownership.
4. Submit `https://blog.nanggo.net/sitemap.xml`.
5. Use URL inspection for important posts after publishing.

### Bing Webmaster Tools

The site is already registered in Bing Webmaster Tools. No verification file is currently needed.

Prefer XML file verification if the site ever needs to be re-verified.

Recommended implementation:

1. Register `https://blog.nanggo.net`.
2. Choose XML file authentication.
3. Download the provided `BingSiteAuth.xml`.
4. Place the exact file at `static/BingSiteAuth.xml`.
5. Deploy.
6. Confirm `https://blog.nanggo.net/BingSiteAuth.xml` returns the file.
7. Verify ownership in Bing.
8. Submit `https://blog.nanggo.net/sitemap.xml`.

After deployment, submit changed production URLs through IndexNow. The key file must first return HTTP 200 from its public URL:

```sh
curl -I https://blog.nanggo.net/99ba3bef6ddab64714b3cd5c8780a9da931533d650477c637f41183eb8aa746f.txt
pnpm indexnow:submit -- --key-file static/99ba3bef6ddab64714b3cd5c8780a9da931533d650477c637f41183eb8aa746f.txt \
  / \
  /post/solid-principles-frontend-guide \
  /post/tmux-remote-dev-guide
```

Only submit URLs that are new, updated, or removed. Use `--dry-run` before the real request when changing the URL list.

Do not create a placeholder `BingSiteAuth.xml`; Bing requires the exact file content issued by the console.

### Google Search Console

The site is already verified in Google Search Console. Google reported automatic ownership verification via domain name provider.

For a new URL-prefix property, prefer HTML file verification if automatic verification is not available.

Recommended implementation:

1. Add a URL-prefix property for `https://blog.nanggo.net`.
2. Choose HTML file verification.
3. Download the provided `google*.html` file.
4. Place the exact file at `static/google*.html`.
5. Deploy.
6. Confirm `https://blog.nanggo.net/google*.html` returns the file.
7. Verify ownership in Google Search Console.
8. Submit `https://blog.nanggo.net/sitemap.xml`.

If the goal is to manage all `nanggo.net` subdomains together, use a Google Domain property instead. Domain properties require DNS TXT verification in Cloudflare and cover subdomains such as `blog.nanggo.net` and `pick.nanggo.net`.

## After deployment

Check these URLs before pressing Verify in each console:

```txt
https://blog.nanggo.net/
https://blog.nanggo.net/robots.txt
https://blog.nanggo.net/sitemap.xml
https://blog.nanggo.net/rss.xml
```

For file-based verification, also check the exact verification file URL.

The generated sitemap intentionally excludes `noindex` singleton-tag archives. After deployment, expect the sitemap URL count to differ from the total number of prerendered HTML pages.
