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

Checked on 2026-06-05.

- Google Search Console: `https://blog.nanggo.net/` is verified. Google reported automatic ownership verification via domain name provider.
- Google Search Console sitemap: `/sitemap.xml` is submitted successfully, with 67 discovered pages.
- Naver Search Advisor: `https://blog.nanggo.net` is registered.
- Naver Search Advisor site status: SSL certificate, HTTPS redirect, and sitemap are normal/registered.
- Bing Webmaster Tools: `blog.nanggo.net` is registered.
- Bing Webmaster Tools sitemap: `https://blog.nanggo.net/sitemap.xml` is submitted successfully, with 67 discovered URLs.

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
