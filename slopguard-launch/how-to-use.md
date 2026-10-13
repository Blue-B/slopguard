# SlopGuard 사용법 요약 (홍보글·온보딩·README용)

전체 문서는 https://slopguard.app/docs 에 있습니다. 이건 글에 붙이거나 신규 사용자에게 바로 보낼 수 있는 짧은 버전입니다.

---

## 한 줄 설명
들어오는 PR과 이슈가 저품질 AI 슬롭인지 0에서 100점으로 채점하고, 의심스러우면 `slop-quarantine` 라벨과 근거 코멘트를 답니다. 자동으로 닫지 않습니다. 최종 결정은 사람이 합니다.

## 3단계로 시작 (설정 파일 필요 없음)
1. https://slopguard.app/setup 에서 GitHub App을 레포나 조직에 설치합니다. Action YAML도, 서버도 필요 없습니다. 공개 레포는 무료입니다.
2. 1분 안에 새 PR과 이슈를 채점하기 시작합니다. 임계값 아래면 조용하고, 이상이면 `slop-quarantine` 라벨과 이유가 담긴 리뷰 코멘트를 답니다.
3. 메인테이너가 코멘트로 결정합니다. 모든 파괴적 동작은 사람이 명령할 때만 일어납니다.

## 슬래시 명령 (메인테이너가 코멘트에 입력)
- `/slop approve` — 격리 해제, 정상 기여로 표시 (`slop-cleared`)
- `/slop reject` — 본인이 직접 닫음 (AI 슬롭으로 판단)
- `/slop false-positive` (또는 `/slop fp`) — 오탐 신고, 격리 해제 + 튜닝 이슈 생성

## 동작 방식 한눈에
- 구조 신호(diff 모양, 커밋 메타데이터, PR/이슈 텍스트 패턴)와 LLM 판정을 섞어 점수화합니다.
- 점수가 임계값(`quarantine`, 기본 50) 이상이면 라벨 + 코멘트. `high_confidence`(기본 85) 이상이면 더 강하게 표현. 그래도 절대 자동으로 닫지 않습니다.
- 슬롭 기록을 자체 DB에 저장하지 않습니다. 대시보드는 GitHub에서 실시간으로 읽어옵니다.

## 선택: `.github/SLOP_POLICY.yml`로 조정
모든 필드는 선택입니다. 예시:
```yaml
version: 1
enabled: true
scan: { pull_requests: true, issues: true }
thresholds:
  quarantine: 50        # 이 점수 이상이면 라벨 + 코멘트
  high_confidence: 85
allowlist:
  authors: [dependabot[bot], renovate[bot]]
  paths: ["docs/**", "**/*.md"]
notify:
  slack_webhook: https://hooks.slack.com/services/...   # 격리 시 알림
share_intel: true       # 익명 네트워크 인텔리전스 기여/수신 (끄려면 false)
```

## 요금
모든 기능이 무료입니다. 유료 플랜이나 결제는 없습니다.
