/**
 * @type {import('@sveltejs/kit').PageLoad}
 */
export async function load({ data }) {
  // about.md 파일을 동적으로 불러옵니다.
  const component = await import('/about/index.md')

  return {
    aboutData: data.aboutData,
    component: component.default
  }
}
