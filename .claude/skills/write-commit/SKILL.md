---
name: write-commit
description: Write a GitHub Desktop-ready commit summary and bulleted description for the currently prepped changes, output in chat for copy and paste. Use on /write-commit.
---

# Write Commit

Draft a commit message for the changes prepped in the current repo. Output it in chat only so it can be pasted into GitHub Desktop.

## Gather changes

- Review the current conversation first: every edit made, file touched, bug fixed, and the reason behind each
- Run `git status` and `git diff --cached` (staged changes)
- If nothing is staged, use working-tree changes: `git diff HEAD` plus untracked files from `git status`. GitHub Desktop doesn't stage checked files until commit time
- Merge both sources into one list:
  - Diff = what's actually in the commit
  - Conversation = intent and context (why, not just what)
  - Include changes in the diff that weren't made in this conversation
  - Drop conversation edits that were reverted or don't appear in the diff
- If no repo or shell is reachable, use the conversation alone

## Rules

- Summary: under 10 words, imperative mood, no trailing period
- Description: brief bullet points, one change per bullet, no filler
- No Claude co-author trailer, no "Generated with Claude", no AI mention of any kind
- Don't commit, push, or write any files

## Output

Reply with exactly two code blocks, nothing else beyond the labels:

**Summary**
```
<summary line>
```

**Description**
```
- <change>
- <change>
```
