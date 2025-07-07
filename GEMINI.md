# Gemini Project Configuration

This file helps Gemini understand the project's structure, conventions, and commands to provide more accurate and efficient assistance.

## Project Overview

This is a personal blog built with SvelteKit and styled with Tailwind CSS. Blog posts are written in Markdown (`.md`) and processed using `mdsvex`.

## Tech Stack

- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **Content**: Markdown with `mdsvex`
- **Package Manager**: pnpm (inferred from `pnpm-lock.yaml`)

## Important Commands

Here are some of the most common commands for this project:

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production.
- **`npm run lint`**: Lints the code using ESLint and Prettier.
- **`npm run format`**: Formats the code using Prettier.
- **`npm run post`**: Creates a new blog post from a template.

## File Structure

- **`/posts`**: Contains all the Markdown files for blog posts.
- **`/src/lib`**: Contains shared library components, utilities, and data.
- **`/src/routes`**: Contains the SvelteKit routes for the application.
- **`/scripts/create-post.js`**: The script used by the `npm run post` command to generate new posts.

## Conventions

- Use `pnpm` for package management.
- Follow the existing code style and formatting.
- Prefer functional programming paradigms where applicable.
- Committing and pushing code should only be done upon request.
