<script>
  import { onMount } from 'svelte'

  /**
   * SEO 스키마 데이터
   * @type {Object}
   */
  export let schema = null

  // 스키마 데이터를 문자열로 변환
  let schemaString = ''

  onMount(() => {
    if (schema) {
      schemaString = JSON.stringify(schema)

      // DOM에 스키마 데이터 추가
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.textContent = schemaString
      document.head.appendChild(script)

      return () => {
        // 컴포넌트 언마운트 시 스크립트 제거
        if (script && script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }
  })
</script>

{#if schema && typeof window !== 'undefined'}
  <!-- SEO 스키마 데이터가 onMount에서 삽입됩니다 -->
{/if}
