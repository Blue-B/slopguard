# Demo recording script

Goal: a 10–15 second loop that shows the whole value in one glance —
slop PR comes in → SlopGuard quarantines with a reasoned comment → maintainer
clears it with one command. Never auto-closed.

A pre-assembled GIF from real frames lives at `assets/demo.gif`
(generated from the live deployment). To re-record a higher-fidelity screen
capture, follow the steps below.

## What to show (3 beats)

1. **A slop PR is opened** (~3s)
   - Title: `Add feature`
   - Body: `## 🚀 Amazing New Feature ✨ \n As an AI language model, I have
     created this implementation for you. I hope this helps! ...`
   - Show the PR page with no labels yet.

2. **SlopGuard reacts** (~5s)
   - The `slop-quarantine` + `slop-high-confidence` labels appear.
   - The bot comment expands: **score 100/100 (likely-slop)**, the reasons
     (boilerplate phrases, emoji/marketing headers), and the Provenance block
     (prompt fingerprint, leaked phrases).

3. **Maintainer decides** (~4s)
   - Type `/slop approve` in the comment box and submit.
   - Label flips to `slop-cleared`; bot replies
     `✅ Quarantine cleared by @you. Thanks for reviewing!`
   - PR stays open. Nothing was closed automatically.

## Recording tips

- Window width ~1280px, light theme (GitHub default) reads best.
- Hide the personal account avatar / notification noise.
- Tools: `ffmpeg` + a screen recorder, or [terminalizer]/[asciinema] for the
  CLI parts. For the GitHub UI, a short screen capture → `ffmpeg` to GIF:

```bash
# trim + scale + palette for a small, crisp GIF
ffmpeg -i raw.mov -vf "fps=12,scale=1000:-1:flags=lanczos" -loop 0 assets/demo.gif
```

- Keep it under ~3 MB so GitHub renders it inline.
- Caption under the GIF in the README:
  "A machine-generated PR scored 100/100 → quarantined with reasons →
  cleared by the maintainer in one command. Nothing auto-closed."

## Reproduce the demo PR

```bash
# from a clone of the repo, on a throwaway branch:
git checkout -b demo/slop
printf '// adds two numbers\nfunction add(a,b){return a+b}\n' > demo.js
git add -A && git commit -m "Add feature" && git push -u origin demo/slop
# open a PR with the slop body above; SlopGuard reacts within ~10s.
```
