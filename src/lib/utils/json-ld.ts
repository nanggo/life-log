const JSON_LD_ESCAPE_REGEX = /</g

export function toJsonLdString(value: unknown): string {
  const json = typeof value === 'string' ? value : JSON.stringify(value)
  if (!json) return ''

  // Prevent `</script>` from prematurely terminating the tag when embedded in HTML.
  return json.replace(JSON_LD_ESCAPE_REGEX, '\\u003c')
}

export function jsonLdScript(value: unknown): string {
  return `<script type="application/ld+json">${toJsonLdString(value)}</script>`
}
