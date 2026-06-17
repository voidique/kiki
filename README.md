# kiki

순수 타자 연습에 집중한 모노크롬 미니멀 타이핑 앱. 한글·영문의 무작위 단어·문장·명언 모드를 지원하며, 타수(CPM/WPM)·정확도·일관성을 측정합니다.

## 개발

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

## 폴더 구조

```
app/
  layout.tsx          # 루트 레이아웃 · 폰트 · 메타데이터 · 테마 스크립트
  page.tsx            # 메인 페이지 (모드·언어 상태)
  globals.css         # 테마 토큰 · 리퀴드 글래스 스타일
  opengraph-image.tsx # OG 이미지
  robots.ts           # robots.txt
  sitemap.ts          # sitemap.xml
  fonts/              # Pretendard 로컬 폰트

components/
  TypingTest.tsx      # 타이핑 입력 · 캐럿 · 채점 (핵심)
  LiveStats.tsx       # 진행 중 실시간 타수/정확도
  Results.tsx         # 완료 후 결과 화면
  ModeTabs.tsx        # 단어/문장/명언 모드 전환
  LanguageToggle.tsx  # 한/영 전환
  Controls.tsx        # 우측 하단 다크모드 · 사운드 볼륨 컨트롤

lib/
  hangul.ts           # 한글 자모 분해 · 타수(CPM) 계산
  stats.ts            # 결과(타수·정확도·일관성) 산출
  storage.ts          # localStorage 저장 (→ 향후 PostgreSQL)
  settings.tsx        # 테마 · 사운드 전역 설정
  sound.ts            # 키보드 사운드 엔진 (Web Audio)
  types.ts            # 공용 타입
  i18n.ts             # 언어 관련 유틸
  site.ts             # 사이트 메타 상수
  content/            # 지문 데이터 (ko/ · en/ 단어·문장·명언)

public/
  sounds/             # 키보드 사운드 (BACKSPACE · ENTER · SPACE · GENERIC_R0~R4)
```
