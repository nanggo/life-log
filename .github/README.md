# GitHub Actions Workflows

This directory contains automated workflows for maintaining the quality and SEO health of the blog.

## 📋 Available Workflows

### 1. SEO Validation (`seo-validation.yml`)

**Purpose**: Validates SEO implementation when content or SEO-related code changes

**Triggers**:

- Push to `main` or `develop` branches (only for content/SEO files)
- Pull requests to `main` or `develop` branches (only for content/SEO files)
- Manual workflow dispatch

**Monitored Paths**:

- `posts/**` - Blog post content
- `about/**` - About page content
- `src/routes/**` - Route changes affecting SEO
- `src/lib/**` - Library changes affecting meta tags
- `src/app.html` - App template changes
- `static/robots.txt` - SEO configuration files
- `scripts/seo-validation.js` - SEO validation script updates

**Features**:

- ✅ Content-driven validation (only runs when needed)
- 📊 Automatic PR comments with validation results
- 📁 Report artifacts uploaded for 30 days
- ❌ Workflow fails if SEO issues are found
- 🎯 Smart path filtering (only SEO-relevant changes)

### 2. Post-Deployment SEO Check (`seo-post-deployment.yml`)

**Purpose**: Validates SEO health after successful deployments

**Triggers**:

- Deployment status events (when deployments succeed)
- Manual workflow dispatch (for production health checks)

**Features**:

- 🚀 Post-deployment validation (ensures live site SEO health)
- 🐛 Auto-creates GitHub issues when problems are detected
- ✅ Auto-closes issues when problems are resolved
- 📈 Extended artifact retention (60 days)
- 🔔 Smart issue management (updates existing issues)

**Issue Labels**: `seo`, `post-deployment`, `bug`

## 🛠 How It Works

### Content-Driven SEO Validation

**When you write a post or update content:**

1. **Automatic Trigger**: Workflow runs only when content/SEO files change
2. **Build & Validate**: Project builds and SEO script analyzes HTML
3. **PR Feedback**: Get immediate feedback on PR with validation results
4. **Fail Fast**: Prevents merging if SEO issues are detected

### Post-Deployment Health Check

**After successful deployments:**

1. **Auto-Trigger**: Runs automatically after Vercel deployments
2. **Live Validation**: Validates the actual deployed site
3. **Issue Management**: Creates/updates GitHub issues for problems
4. **Auto-Resolution**: Closes issues when problems are fixed

### Monitored SEO Elements

- **Meta Tag Duplicates**: Detects conflicting meta tags
- **Canonical URLs**: Validates proper canonical link setup
- **Content Quality**: Checks title/description lengths
- **SEO Files**: Validates `robots.txt` and `sitemap.xml`
- **Structural Elements**: Ensures required tags are present

### Smart Issue Management

Post-deployment workflow intelligently manages GitHub issues:

- **Creates** new issues when SEO problems are detected in production
- **Updates** existing issues with new deployment results
- **Closes** issues automatically when problems are resolved
- **Prevents spam** by updating instead of creating duplicates

## 📊 Understanding Results

### Exit Codes

- `0`: All SEO validations passed
- `1`: SEO validation failed (has errors)

### Severity Levels

- **Error** ❌: Must be fixed (causes workflow failure)
- **Warning** ⚠️: Should be fixed (doesn't cause failure)

### Common Issues

1. **Duplicate Meta Tags**: Multiple SEO plugins/implementations
2. **Short Descriptions**: Meta descriptions under 120 characters
3. **Missing Images**: No og:image or twitter:image tags
4. **Invalid Canonical**: Malformed or incorrect canonical URLs

## 🔧 Local Development

Run SEO validation locally before pushing:

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run SEO validation
pnpm seo:validate
```

## 🎯 Best Practices

### For Contributors

1. **Always run** `pnpm seo:validate` before pushing
2. **Check PR comments** for SEO validation results
3. **Fix issues** identified by the validation
4. **Use semantic commits** for SEO-related changes

### For Maintainers

1. **Monitor post-deployment issues** created when SEO problems are detected
2. **Review artifacts** for detailed analysis when needed
3. **Update validation rules** in `scripts/seo-validation.js` as needed
4. **Run manual health checks** using workflow dispatch when needed

## 📁 File Structure

```
.github/
├── README.md                         # This documentation
└── workflows/
    ├── seo-validation.yml            # Content-driven validation
    └── seo-post-deployment.yml       # Post-deployment checks
```

## 🚀 Benefits

- **Content-Focused**: Only runs when content or SEO files change
- **Early Detection**: Catch SEO issues in PRs before merge
- **Production Monitoring**: Validates live site after deployments
- **Team Awareness**: PR comments keep everyone informed
- **Smart Automation**: No unnecessary scheduled runs or noise

## 🔍 Troubleshooting

### Workflow Fails to Run

- Check if workflows are enabled in repository settings
- Verify required permissions (Actions, Issues, Pull Requests)
- Ensure `pnpm` is available in the runner environment

### SEO Validation False Positives

- Review validation rules in `scripts/seo-validation.js`
- Check if new pages need to be added to test configuration
- Verify build output structure hasn't changed

### Missing PR Comments

- Check repository permissions for GitHub Actions
- Verify the action has permission to comment on PRs
- Look for script errors in the workflow logs

---

_Last updated: January 2025_
