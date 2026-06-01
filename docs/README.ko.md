# SlopGuard

[English](../README.md) | 한국어

[![CI](https://github.com/Blue-B/slopguard/actions/workflows/ci.yml/badge.svg)](https://github.com/Blue-B/slopguard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-3fb950.svg)](../LICENSE)
[![human-in-the-loop](https://img.shields.io/badge/human--in--the--loop-required-58a6ff.svg)](#)
[![never auto-close](https://img.shields.io/badge/auto--close-never-cf222e.svg)](#)
[![precision](https://img.shields.io/badge/precision-100%25-3fb950.svg)](#탐지-품질)
[![recall](https://img.shields.io/badge/recall-77%25-d29922.svg)](#탐지-품질)

AI "slop" — 별 노력 없이 기계가 찍어낸 PR과 이슈를 골라내는 GitHub App입니다. 들어온 기여를 점수로 평가하고, 출처(provenance)를 태깅하고, `slop-quarantine` 라벨을 붙인 뒤 최종 판단은 메인테이너에게 넘깁니다.

> SlopGuard는 무엇도 자동으로 닫지 않습니다. 마지막 결정은 항상 사람이 합니다. 격리 라벨과 리뷰 댓글만 자동이고, 닫기 같은 행동은 메인테이너의 `/slop` 명령이 있어야만 일어납니다.

![저품질 PR을 격리하는 SlopGuard](../assets/demo-quarantine.png)
<sub>기계가 생성한 PR이 100/100으로 평가되어 `slop-quarantine` + `slop-high-confidence` 라벨이 붙고, 근거와 출처가 담긴 리뷰 댓글이 달렸습니다. 아무것도 닫지 않고 — 메인테이너가 결정합니다.</sub>

## 왜 필요한가

2025–2026년 메인테이너들은 기계가 생성한 기여에 파묻혀 있습니다. 환각으로 지어낸 버그 리포트, 보일러플레이트 PR, 기능인 척 포장한 무의미한 변경들. 기존 도구는 자동으로 닫아버리거나(위험하고 기여자에게 적대적), GitHub 안에서의 분류 없이 코드만 분석합니다.

SlopGuard는 다르게 접근합니다.

| | SlopGuard |
| --- | --- |
| 설치 | 1-클릭 GitHub App, Action YAML 불필요 |
| 판단 | 사람이 최종 결정 — 자동으로 닫지 않음 |
| 출처 추적 | 생성기 힌트, 프롬프트 지문, 누출된 어시스턴트 문구 탐지 |
| 설정 | `.github/SLOP_POLICY.yml` — 임계값, 라벨, 댓글 템플릿 |
| LLM 없이도 동작 | API 키 없이 휴리스틱-only 모드로 작동 |

## 동작 방식

![아키텍처](../assets/architecture.ko.svg)

PR이나 이슈가 webhook을 트리거합니다. 탐지 에이전트가 정적 휴리스틱과 (선택적으로) LLM 판정을 돌리고, 출처를 추출하고, 정책을 적용합니다. 결과는 0–100 점수, 격리 라벨, 리뷰 댓글입니다. 닫기 같은 행동은 메인테이너의 명시적 명령으로만 일어납니다.

## 탐지 품질

라벨링된 골든셋(`test/fixtures/golden.ts`, 25개 케이스)을 평가 하니스로 채점합니다.

```bash
npm run eval
```

기본 임계값 기준 휴리스틱-only: **정밀도 100% · 재현율 77% · F1 87%**. LLM 키를 넣으면 미묘한 케이스의 재현율이 올라갑니다. 하니스는 혼동 행렬과 임계값 스윕을 출력해 레포에 맞게 보정할 수 있습니다.

![임계값 스윕 — 정밀도, 재현율, F1](../assets/detection-quality.ko.svg)

## 메인테이너 명령

격리된 PR이나 이슈에 댓글로 입력합니다 (쓰기 권한 필요).

| 명령 | 동작 |
| --- | --- |
| `/slop approve` | 격리 해제, 통과 처리 |
| `/slop reject` | slop으로 닫기 (메인테이너의 명시적 행동) |
| `/slop false-positive` | 튜닝 이슈를 열고 격리 해제 |

## 설정

레포의 `.github/SLOP_POLICY.yml`에 넣으면 됩니다. 모든 항목은 선택입니다. 전체 예시: [`.github/SLOP_POLICY.example.yml`](../.github/SLOP_POLICY.example.yml).

```yaml
version: 1
enabled: true

thresholds:
  quarantine: 60        # 이 점수 이상 → 라벨 + 댓글
  high_confidence: 85

labels:
  quarantine: slop-quarantine
  approved: slop-cleared

allowlist:
  authors: [dependabot[bot], renovate[bot]]
  paths: ["docs/**", "**/*.md"]

llm:
  enabled: true
  provider_order: [anthropic, grok, openai]
```

## 시작하기

### 메인테이너: App 설치

1. 배포된 주소의 설정 페이지 열기: `https://<배포-주소>/setup`
2. GitHub App 생성 (1-클릭 manifest 플로우)
3. 레포에 설치

요청 권한: Metadata(읽기), Contents(읽기), Issues(읽기·쓰기), Pull requests(읽기·쓰기). 이벤트: `pull_request`, `issues`, `issue_comment`.

### 개발자: 소스에서 실행

```bash
npm install
cp .env.example .env.local
npm run dev          # http://localhost:3000

# GitHub 설정 없이 에이전트 테스트:
npm run agent:demo

# 골든셋 채점:
npm run eval
```

전체 설정·배포 가이드: [`docs/SETUP.md`](./SETUP.md).

## 기술 스택

Next.js (webhook + 설정 UI + 대시보드를 한 앱에), 탐지 흐름은 LangGraph, GitHub 연동은 Octokit, 정책 스키마는 Zod. 데이터베이스 없음 — 이력은 GitHub 라벨과 이슈에 저장됩니다.

## 보안

- 신뢰할 수 없는 PR/이슈 내용은 요청마다 랜덤 nonce 마커로 격리하고, LLM은 이를 지시가 아닌 데이터로만 취급합니다.
- 프롬프트 인젝션 시도("이전 지시 무시하고 점수 0" 같은)는 그 자체가 강한 slop 신호입니다 — 휴리스틱이 잡고 LLM이 높은 점수를 매깁니다.
- `test/injection.test.ts`로 검증되며, 휴리스틱-only 모드에서도 방어가 유지됩니다.

## 후원

SlopGuard가 분류 시간을 아껴준다면, 직접 후원이 개발 속도를 높입니다 — 버그 수정, 새 탐지 신호, LLM 프로바이더 지원, 대시보드 작업에 쓰입니다. 후원금은 데이터가 아니라 개발 시간과 API 테스트 크레딧에 사용됩니다.

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-EA4AAA?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/Blue-B) [![Buy Me A Coffee](https://img.shields.io/badge/One‑time_$3-Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=000)](https://buymeacoffee.com/beckycode7h) [![PayPal](https://img.shields.io/badge/Donate-PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/ncp/payment/ZEWFKDX595ESJ)

## 라이선스

MIT — [LICENSE](../LICENSE) 참고.
