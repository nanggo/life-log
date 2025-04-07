<script>
  /**
   * 이미지 URL
   * @type {string}
   */
  export let src = ''

  /**
   * 이미지 대체 텍스트
   * @type {string}
   */
  export let alt = ''

  /**
   * 이미지 너비
   * @type {number|string}
   */
  export let width = 'auto'

  /**
   * 이미지 높이
   * @type {number|string}
   */
  export let height = 'auto'

  /**
   * 이미지 로딩 방식
   * @type {'lazy'|'eager'}
   */
  export let loading = 'lazy'

  /**
   * 이미지 디코딩 방식
   * @type {'async'|'sync'|'auto'}
   */
  export let decoding = 'async'

  /**
   * CSS 클래스
   * @type {string}
   */
  export let className = ''

  /**
   * 지연 로딩 시 블러 효과 사용 여부
   * @type {boolean}
   */
  export let useBlur = false
</script>

<div class={`image-wrapper ${useBlur ? 'with-blur' : ''} ${className}`}>
  <img
    {src}
    {alt}
    {width}
    {height}
    {loading}
    {decoding}
    fetchpriority={loading === 'eager' ? 'high' : 'auto'}
  />
</div>

<style>
  .image-wrapper {
    position: relative;
    overflow: hidden;
  }

  .with-blur img {
    transition: filter 0.3s ease-out;
  }

  .with-blur img:not([loaded]) {
    filter: blur(10px);
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
</style>
