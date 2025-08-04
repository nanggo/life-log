# Gemini Code Assist Style Guide

# Life Log - SvelteKit Blog Project

## Review Philosophy

**Learning-Focused Approach**: Provide educational feedback that explains the "why" behind suggestions, not just the "what" to fix. Focus on helping the developer understand concepts and improve systematically.

**Iterative Improvement**: Prioritize high-impact suggestions over minor style issues. Break feedback into manageable chunks that can be implemented and learned from progressively.

**Context-Aware**: Consider the specific needs of this SvelteKit blog project, including performance optimization, SEO, accessibility, and maintainability.

## Priority Framework

### CRITICAL Priority (🚨)

- Security vulnerabilities (XSS, injection attacks)
- Performance bottlenecks affecting user experience
- Accessibility violations preventing users from accessing content
- Code that could cause runtime errors or crashes

### HIGH Priority (⚠️)

- Maintainability issues that will cause technical debt
- Missing error handling for external dependencies
- Performance improvements with measurable impact
- TypeScript violations that reduce code safety

### MEDIUM Priority (💡)

- Code organization and architectural improvements
- Missing documentation for complex logic
- Optimization opportunities for better developer experience
- Consistency with established patterns

### LOW Priority (✨)

- Minor style inconsistencies
- Variable naming improvements
- Comment formatting
- Optional refactoring suggestions

## Technology Stack Standards

### SvelteKit & Svelte

- **Components**: Use `<script lang="ts">` for all components
- **Reactivity**: Prefer reactive statements (`$:`) over imperative updates
- **Stores**: Use stores for state that needs to be shared across components
- **Performance**: Implement virtual scrolling for large lists (>15 items)
- **SSR**: Ensure all components work with server-side rendering
- **File Structure**: Follow SvelteKit conventions for routes and components

### TypeScript

- **Strict Mode**: Maintain strict TypeScript configuration
- **Type Safety**: Avoid `any` type; use proper type definitions
- **Interfaces**: Define interfaces for complex data structures
- **Generics**: Use generics for reusable components and utilities
- **Error Handling**: Implement proper error types and handling

### Performance Optimization

- **Virtual Scrolling**: Use VirtualList component for large datasets
- **Image Optimization**: Implement lazy loading and responsive images
- **Bundle Size**: Monitor and optimize JavaScript bundle sizes
- **Core Web Vitals**: Maintain good LCP, FID, and CLS scores
- **Caching**: Implement appropriate caching strategies

### Security Standards

- **XSS Prevention**: Sanitize all user inputs and dynamic content
- **Content Security Policy**: Maintain strict CSP headers
- **Input Validation**: Validate all external data sources
- **Dependency Security**: Keep dependencies updated and secure
- **Data Exposure**: Never expose sensitive information in client code

### Accessibility (WCAG 2.1 AA)

- **Semantic HTML**: Use proper HTML elements for their intended purpose
- **ARIA Labels**: Provide appropriate ARIA attributes for interactive elements
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus Management**: Implement proper focus management for dynamic content
- **Color Contrast**: Maintain minimum 4.5:1 contrast ratio for normal text
- **Touch Targets**: Ensure minimum 44px touch target size for mobile

### CSS & Styling (Tailwind CSS)

- **Utility-First**: Use Tailwind utilities over custom CSS when possible
- **Responsive Design**: Implement mobile-first responsive design
- **Dark Mode**: Support both light and dark themes
- **Performance**: Minimize custom CSS and leverage Tailwind's optimization
- **Consistency**: Use design tokens for consistent spacing and colors

### Testing Standards

- **Unit Tests**: Write tests for utility functions and complex logic
- **Component Tests**: Test component behavior and user interactions
- **Integration Tests**: Test complete user workflows
- **Coverage**: Maintain reasonable test coverage for critical paths
- **E2E Tests**: Implement end-to-end tests for key user journeys

## Code Organization

### File Structure

```
src/
├── lib/
│   ├── components/     # Reusable components
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript definitions
│   └── data/          # Data processing logic
├── routes/            # SvelteKit routes
└── app.html           # HTML template
```

### Component Guidelines

- **Single Responsibility**: Each component should have one clear purpose
- **Props Interface**: Define clear TypeScript interfaces for component props
- **Event Handling**: Use Svelte's event system appropriately
- **Composition**: Prefer composition over inheritance
- **Documentation**: Document complex components with clear examples

### Error Handling

- **Graceful Degradation**: Ensure the app works even when features fail
- **User Feedback**: Provide clear error messages to users
- **Logging**: Implement appropriate error logging for debugging
- **Recovery**: Provide ways for users to recover from errors
- **Validation**: Validate inputs at component boundaries

## Review Guidelines for Gemini

### Educational Feedback

- **Explain the Why**: Always explain why a change is recommended
- **Provide Examples**: Include code examples when suggesting improvements
- **Link to Resources**: Reference documentation or best practices when relevant
- **Progressive Difficulty**: Start with fundamental issues before advanced optimizations

### Constructive Communication

- **Positive Tone**: Frame feedback constructively and encouragingly
- **Specific Suggestions**: Provide concrete, actionable recommendations
- **Context Awareness**: Consider the developer's skill level and project goals
- **Recognition**: Acknowledge good practices and improvements made

### Review Process

1. **Initial Assessment**: Provide a high-level overview of the changes
2. **Priority Categorization**: Group feedback by priority level
3. **Detailed Analysis**: Focus on 8-10 most important issues per review
4. **Implementation Guidance**: Suggest order of implementation
5. **Follow-up**: Recognize improvements in subsequent reviews

## Project-Specific Considerations

### Blog Functionality

- **SEO Optimization**: Ensure proper meta tags and structured data
- **Reading Experience**: Optimize typography and content layout
- **Content Management**: Support for markdown processing and metadata
- **Performance**: Fast page loads and smooth navigation
- **Social Sharing**: Proper Open Graph and Twitter Card implementation

### Content Processing

- **Markdown Parsing**: Proper handling of MDSvex content
- **Image Optimization**: Responsive images with proper lazy loading
- **Code Highlighting**: Syntax highlighting for code blocks
- **Table of Contents**: Automatic generation from headings
- **Tag System**: Efficient tag-based content organization

### Analytics & Monitoring

- **Vercel Analytics**: Proper implementation and privacy compliance
- **Performance Monitoring**: Track Core Web Vitals and user experience
- **Error Tracking**: Monitor and handle runtime errors appropriately
- **User Experience**: Measure and improve user engagement metrics

## Final Notes

This style guide should evolve with the project. When reviewing code, focus on helping the developer build better software while learning sustainable development practices. Prioritize suggestions that have the greatest positive impact on code quality, user experience, and maintainability.
