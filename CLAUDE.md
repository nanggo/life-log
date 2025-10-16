# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Run Svelte type checking
- `pnpm check:watch` - Run Svelte type checking in watch mode
- `pnpm lint` - Run Prettier and ESLint checks
- `pnpm format` - Format code with Prettier
- `pnpm post` - Create a new blog post using the template

## Important Development Guidelines

**ALWAYS run these commands before committing changes:**

1. `pnpm build` - Ensure the project builds without errors
2. `pnpm lint` - Check code formatting and linting rules
3. `pnpm check` - Verify TypeScript/Svelte type checking
4. `npx vercel build` - Verify Vercel deployment compatibility

**Build and lint checks are mandatory** - Never commit code that fails these checks. If lint fails, run `pnpm format` first to auto-fix formatting issues, then address any remaining ESLint errors manually.

**Pre-commit checklist:**

- Run lint checks and formatting
- Run type checking
- Verify build succeeds
- Test Vercel CLI deployment compatibility

## SEO Validation

For SEO quality assurance, run the following command locally before major releases or structural changes:

- `pnpm seo:validate` - Run comprehensive SEO validation

**SEO checks are recommended** - Run SEO validation when:

- Adding new pages or routes
- Modifying meta tags or structured data
- Changing site structure or navigation
- Before major releases

The automated SEO validation in CI/CD has been removed to simplify the pipeline. Manual validation ensures quality while avoiding over-automation for a personal blog.

## Architecture

This is a SvelteKit-based blog using:

- **MDSvex** for markdown processing with custom plugins for video support and heading extraction
- **Tailwind CSS** with typography plugin for styling
- **Static site generation** with prerendering enabled
- **File-based routing** following SvelteKit conventions

### Key Structure

- `posts/` - Blog posts in markdown format
- `src/routes/` - SvelteKit routes and pages
- `src/lib/components/` - Reusable Svelte components
- `src/lib/utils/` - Utility functions including slug normalization
- `scripts/create-post.js` - Script for creating new blog posts
- `templates/post.md` - Template for new blog posts

### Content Management

- Blog posts are markdown files in the `posts/` directory
- Posts support frontmatter metadata
- Custom slug handling with normalization functions in `src/lib/utils/posts.js`
- Automatic sitemap and RSS feed generation
- Table of contents generation from headings

### Key Features

- Static site generation with prerendering
- Tag-based post filtering
- Pagination for post listings
- Reading time estimation
- Responsive design with Tailwind CSS
- Vercel Analytics integration
