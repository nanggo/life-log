/**
 * Accessibility utilities and helpers
 */

/**
 * Minimum touch target size (44px) recommended by WCAG
 */
export const MIN_TOUCH_TARGET_SIZE = 44

/**
 * Generates accessibility-compliant button classes
 * @param size - Button size variant
 * @param variant - Button style variant
 * @returns CSS classes with proper touch target sizing
 */
export function generateAccessibleButtonClasses(
  size: 'sm' | 'md' | 'lg' = 'md',
  variant: 'primary' | 'secondary' | 'ghost' = 'primary'
): string {
  // Ensure minimum 44px touch target for accessibility
  const baseTouchClasses = 'min-h-[44px] min-w-[44px] touch-manipulation'
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
  const transitionClasses = 'transition-all duration-200 ease-in-out'

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2.5 text-sm rounded-md',
    lg: 'px-6 py-3 text-base rounded-lg'
  }

  const variantClasses = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800',
    secondary:
      'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
    ghost:
      'text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800'
  }

  return [
    baseTouchClasses,
    focusClasses,
    transitionClasses,
    sizeClasses[size],
    variantClasses[variant],
    'inline-flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed'
  ].join(' ')
}

/**
 * Generates accessible link classes with proper focus management
 * @param variant - Link style variant
 * @returns CSS classes for accessible links
 */
export function generateAccessibleLinkClasses(
  variant: 'default' | 'button' | 'nav' = 'default'
): string {
  const baseFocusClasses =
    'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded-sm'
  const touchClasses = 'touch-manipulation'

  const variantClasses = {
    default: 'text-teal-600 hover:text-teal-700 underline-offset-4 hover:underline',
    button: 'min-h-[44px] min-w-[44px] inline-flex items-center justify-center',
    nav: 'block py-2 px-1 hover:text-teal-600 transition-colors'
  }

  return [baseFocusClasses, touchClasses, variantClasses[variant]].join(' ')
}

/**
 * Creates skip link for keyboard navigation
 * @returns Skip link HTML string
 */
export function createSkipLink(): string {
  return `
    <a 
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded focus:shadow-lg"
    >
      Skip to main content
    </a>
  `
}

/**
 * Validates color contrast ratio (basic check)
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @returns Whether contrast meets WCAG AA standard
 */
export function checkColorContrast(foreground: string, background: string): boolean {
  // Simplified contrast check - in production you'd use a proper library
  // This is a basic implementation for demonstration
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff

    const rsRGB = r / 255
    const gsRGB = g / 255
    const bsRGB = b / 255

    const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
    const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
    const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return ratio >= 4.5
}

/**
 * Generates proper ARIA attributes for interactive elements
 * @param type - Type of interactive element
 * @param state - Current state of the element
 * @returns Object with ARIA attributes
 */
export function generateARIAAttributes(
  type: 'button' | 'link' | 'tab' | 'menuitem',
  state?: {
    expanded?: boolean
    selected?: boolean
    current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
    describedBy?: string
    labelledBy?: string
    label?: string
  }
): Record<string, string | boolean | undefined> {
  const attributes: Record<string, string | boolean | undefined> = {}

  if (state?.expanded !== undefined) {
    attributes['aria-expanded'] = state.expanded
  }

  if (state?.selected !== undefined) {
    attributes['aria-selected'] = state.selected
  }

  if (state?.current !== undefined) {
    attributes['aria-current'] = state.current
  }

  if (state?.describedBy) {
    attributes['aria-describedby'] = state.describedBy
  }

  if (state?.labelledBy) {
    attributes['aria-labelledby'] = state.labelledBy
  }

  if (state?.label) {
    attributes['aria-label'] = state.label
  }

  return attributes
}

/**
 * Checks if element meets touch target size requirements
 * @param element - DOM element to check
 * @returns Whether element meets minimum touch target size
 */
export function validateTouchTargetSize(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE
}

/**
 * Creates a keyboard navigation handler
 * @param onEnter - Function to call on Enter/Space
 * @param onEscape - Function to call on Escape (optional)
 * @returns Keyboard event handler
 */
export function createKeyboardHandler(
  onEnter: () => void,
  onEscape?: () => void
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onEnter()
        break
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break
    }
  }
}

/**
 * Announces content to screen readers
 * @param message - Message to announce
 * @param priority - Announcement priority (assertive or polite)
 */
export function announceToScreenReader(
  message: string,
  priority: 'assertive' | 'polite' = 'polite'
): void {
  if (typeof document === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement)
    }
  }, 1000)
}

/**
 * Mobile-specific touch event handlers
 */
export class TouchInteractionManager {
  private startTime: number = 0
  private startPosition: { x: number; y: number } = { x: 0, y: 0 }

  onTouchStart = (event: TouchEvent): void => {
    this.startTime = Date.now()
    const touch = event.touches[0]
    this.startPosition = { x: touch.clientX, y: touch.clientY }
  }

  onTouchEnd = (event: TouchEvent, onTap: () => void, onLongPress?: () => void): void => {
    const endTime = Date.now()
    const duration = endTime - this.startTime
    const touch = event.changedTouches[0]
    const distance = Math.sqrt(
      Math.pow(touch.clientX - this.startPosition.x, 2) +
        Math.pow(touch.clientY - this.startPosition.y, 2)
    )

    // Prevent if moved too much (likely a scroll)
    if (distance > 10) return

    if (duration > 500 && onLongPress) {
      // Long press
      event.preventDefault()
      onLongPress()
    } else if (duration < 500) {
      // Quick tap
      onTap()
    }
  }
}
