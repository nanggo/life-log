const autoprefixer = require('autoprefixer')
const tailwindcss = require('tailwindcss')

module.exports = {
  plugins: [
    tailwindcss(),
    autoprefixer,
    // CSS 최적화를 위한 추가 플러그인들
    ...(process.env.NODE_ENV === 'production'
      ? [
          require('cssnano')({
            preset: [
              'default',
              {
                // 색상 최적화 (hex -> rgb 등)
                colormin: true,
                // 중복된 CSS 규칙 병합
                mergeRules: true,
                // unused @font-face, @keyframes, @counter-style 규칙 제거
                discardUnused: true,
                // CSS 정렬 및 최소화
                normalizeWhitespace: true
              }
            ]
          })
        ]
      : [])
  ]
}
