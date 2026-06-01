# Launch posts

Copy-paste ready. Replace `https://slopguard.example` with the live URL
(`https://port-next-slopguard-mpuxdx7ydafc56d4.sel3.cloudtype.app` or a custom
domain). Post the demo GIF where the platform allows images.

Tone rules: state facts, no hype, no emoji spam. Lead with the problem
(maintainer burnout), then the one differentiator (human-in-the-loop, never
auto-closes). Reply to comments fast in the first 2 hours.

---

## 1. Hacker News — "Show HN"

**Title** (≤ 80 chars, no trailing period):

```
Show HN: SlopGuard – quarantine AI slop PRs without auto-closing them
```

**Body:**

```
Maintainers are getting buried in AI-generated pull requests and issues:
hallucinated bug reports, boilerplate PRs, trivial churn dressed up as
features. curl and others have written about the burnout publicly.

The existing tools either auto-close contributions (risky, and hostile to
the occasional real contributor who used an LLM to help) or just lint code
without any GitHub-native triage.

SlopGuard takes a different stance: it never closes anything. It scores each
PR/issue 0–100, tags provenance (generator hints, a prompt fingerprint,
leaked assistant phrases), and applies a `slop-quarantine` label with a
review comment. A maintainer then replies `/slop approve`, `/slop reject`,
or `/slop false-positive`. The human is always the last step.

It works without an LLM — there's a heuristics-only mode (regex/rule signals
for boilerplate, emoji-marketing headers, empty bodies, giant unfocused
diffs, and prompt-injection attempts). On a 25-case labeled golden set that's
precision 100% / recall 77%. Adding an LLM key lifts recall on subtle cases.
Everything is configurable via `.github/SLOP_POLICY.yml`.

Stack: Next.js (webhook + setup UI + dashboard), LangGraph for the detection
flow, Octokit. No database — history lives in GitHub labels/issues. MIT,
self-hostable, one-click GitHub App install.

Repo: https://github.com/Blue-B/slopguard
Live: https://slopguard.example

Happy to talk about the heuristics, the prompt-injection handling (the PR
body is untrusted input — it's isolated with per-request nonce markers), or
the false-positive tradeoffs.
```

**First comment (post yourself, adds context):**

```
A few design decisions I'd love feedback on:

- Never auto-closing is deliberate. It keeps the tool off GitHub's
  spam-automation tripwires and respects contributors. The cost is that it
  doesn't save you the final click. Worth it?
- Heuristics-only is the default so it runs at $0. The LLM is opt-in.
- Provenance fingerprints could later detect bot campaigns across repos
  (same prompt, 50 PRs). Not built yet — curious if that's useful.
```

---

## 2. Reddit — r/opensource, r/github (and r/programming if it fits)

**Title:**

```
I built a GitHub App that quarantines AI-slop PRs/issues — but never auto-closes them
```

**Body:**

```
If you maintain anything popular, you've probably seen the wave: AI-generated
PRs and issues that look plausible but waste your time. I wanted triage help
that doesn't go nuclear and auto-close real contributors by mistake.

SlopGuard scores each PR/issue (0–100), tags where it likely came from
(provenance), and adds a `slop-quarantine` label + a comment explaining why.
Then YOU decide with `/slop approve | reject | false-positive`. It never
closes anything on its own.

- One-click GitHub App (no Action YAML)
- Works with zero API keys (heuristics-only: precision 100% / recall 77% on a
  labeled set). Add an LLM key for higher recall.
- Configurable via `.github/SLOP_POLICY.yml`
- MIT, self-hostable, no database

Repo: https://github.com/Blue-B/slopguard

Would love to hear how other maintainers are handling this, and whether the
"never auto-close" stance is the right call.
```

> Reddit etiquette: don't drop and run. Engage in comments. Avoid r/programming
> if karma/age is low — it's strict about self-promo.

---

## 3. dev.to / Hashnode — article

**Title:**

```
AI slop is burning out OSS maintainers. I built a guard that keeps humans in the loop.
```

**Outline (write 600–900 words):**

```
1. The problem — concrete examples (hallucinated security reports, boilerplate
   PRs). Cite curl / Octovere-style AI-PR ratios.
2. Why auto-closing is the wrong fix — ban risk, contributor trust.
3. The approach — score + provenance + quarantine + human command.
4. How detection works — heuristics (with examples) vs the optional LLM judge.
   Show the threshold-sweep chart (assets/detection-quality.svg).
5. Prompt-injection: the PR body is untrusted; how it's isolated.
6. Install in one click + SLOP_POLICY.yml example.
7. It's open source — call for contributors and feedback.
```

Embed: `assets/demo-quarantine.png`, `assets/architecture.svg`,
`assets/detection-quality.svg`.

---

## 4. GeekNews (news.hada.io) — 한국어

**제목:**

```
SlopGuard – AI slop PR/이슈를 자동 격리하되, 절대 자동으로 닫지 않는 GitHub App
```

**본문:**

```
오픈소스 메인테이너들이 AI가 생성한 저품질 기여(환각 버그 리포트, 보일러플레이트
PR, 기능인 척하는 무의미한 변경)에 시달리고 있습니다. 기존 도구는 자동으로 닫아버리거나
(기여자 신뢰를 해치고 GitHub 정책 위험), GitHub 안에서의 분류 없이 코드만 분석합니다.

SlopGuard는 다르게 접근합니다. 무엇도 자동으로 닫지 않습니다.

- 들어온 PR/이슈를 0~100점으로 평가
- 출처(provenance) 태깅: 생성기 힌트, 프롬프트 지문, 누출된 어시스턴트 문구
- slop-quarantine 라벨 + 근거가 담긴 리뷰 댓글
- 메인테이너가 /slop approve | reject | false-positive 로 최종 결정

LLM 없이도 작동합니다(휴리스틱-only: 정밀도 100% / 재현율 77%, 라벨링된 25개
골든셋 기준). LLM 키를 넣으면 재현율이 올라갑니다. .github/SLOP_POLICY.yml로 임계값,
라벨, allowlist를 설정합니다.

기술: Next.js(webhook + 설정 UI + 대시보드), LangGraph, Octokit. DB 없음
— 이력은 GitHub 라벨/이슈에 저장. MIT, 셀프호스팅 가능, 1-클릭 설치.

저장소: https://github.com/Blue-B/slopguard
데모: https://slopguard.example
```

---

## Posting checklist

- [ ] Demo GIF recorded and embedded where possible
- [ ] Live URL replaced everywhere (or custom domain set)
- [ ] Repo has Topics: `github-app`, `ai`, `code-review`, `maintainer-tools`, `nextjs`
- [ ] Post HN on a weekday morning (US Pacific) — be online to reply
- [ ] Cross-post to Reddit + dev.to + GeekNews within the same day
- [ ] Track: stars, installs (GitHub App page), live `/api/health` traffic
