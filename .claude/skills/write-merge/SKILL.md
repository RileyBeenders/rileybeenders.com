---
name: write-merge
description: Write a GitHub-ready pull request title and description, plus a merge commit summary and description, for merging a branch into main. Confirms the source and target branches first. Output in chat for copy and paste. Use on /write-merge.
---

# Write Merge

Draft the text for merging a branch: a PR title and description to paste into GitHub, then a short merge commit message. Output it in chat only.

## Confirm the merge

- Source: the branch named in the arguments, or else the current branch (`git branch --show-current`)
- Target: the branch named in the arguments, or else `main`
- Before drafting anything, ask the user to confirm "Merging `<source>` into `<target>`" (AskUserQuestion), and wait for the answer
- If they correct either branch, use their branches instead
- Stop if the source and target are the same branch, or if the source has no commits that the target lacks

## Gather changes

- Run `git fetch origin <target>` (skip it if that fails) and compare against `origin/<target>`, or the local `<target>` if there is no remote
- `git log --format='=== %s%n%b' <target>..<source>`: every commit and its body
- `git diff --stat <target>...<source>`: every file changed
- Read the diff of anything the commit messages don't explain
- Use the conversation for intent and context too, where it covers this branch
- Flag any file that no commit mentions, or that looks machine-specific or committed by mistake (local config, secrets, build output). Tell the user about it after the output; don't put it in the description

## Rules

- No Claude co-author trailer, no "Generated with Claude Code", no AI mention of any kind, in any block
- PR title: one line, under 15 words. Name the release or branch and its main changes
- PR description: Markdown. A `## Summary` with one `###` group per area of work, a bullet for each change, then `## Testing` covering the tests added or changed. Group by feature, not by commit
- Merge commit summary: under 12 words, imperative, no trailing period, starting with `Merge <branch or release>:`
- Merge commit description: 5 to 10 short bullets, one change per bullet, no filler
- Use American spelling
- Don't merge, commit, push, open a PR, or write any files

## Output

Reply with exactly four code blocks under these labels, plus any flagged files after them:

**PR title**
```
<title>
```

**PR description**
```markdown
## Summary
...
```

**Merge commit summary**
```
<summary line>
```

**Merge commit description**
```
- <change>
- <change>
```
