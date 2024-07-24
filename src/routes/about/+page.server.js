import { error } from '@sveltejs/kit'

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  try {
    // about.md의 메타데이터를 불러오는 로직을 여기에 추가할 수 있습니다.
    // 예를 들어, 파일을 직접 읽어 파싱하는 방식으로 구현할 수 있습니다.
    const aboutData = {
      title: "About NANGGO | NANGGO's LIFELOG",
      lastUpdated: '2024.03.01'
    }

    return {
      aboutData
    }
  } catch (e) {
    throw error(404, 'About page not found')
  }
}
