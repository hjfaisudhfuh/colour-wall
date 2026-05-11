Audit The Colour Wall for conversion blockers from TikTok-mobile traffic.
Do NOT code. Output a ranked list, not a wall of text.

## Scope of inspection

- `components/Hero.tsx`
- `components/Grid.tsx`, `WallLaunchBanner.tsx`, `WallProgress.tsx`,
  `JumpToSquare.tsx`, `WallStats.tsx`, `MonoTag.tsx`
- `components/ClaimDialog.tsx`, `BatchClaimDialog.tsx`, `WallToolbar.tsx`,
  `BatchCartBar.tsx`
- `app/success/page.tsx`, `SuccessActions.tsx`, `SuccessSquareCard.tsx`,
  `SuccessPoll.tsx`
- `app/page.tsx` for landing composition
- `components/TikTokHook.tsx`, `MakeYourMark.tsx`, `LatestMarks.tsx`,
  `WhyOneDollar.tsx`

## Lens for each finding (rank by impact-to-effort)

1. **Time-to-understand on landing** — TikTok visitors decide in <5 s on mobile
2. **Time-from-CTA-to-grid** — scroll friction from "Pick your square" to actual cells
3. **Modal friction** — fields, microcopy, trust signals, layout
4. **Payment redirect feedback** — clarity of Stripe handoff
5. **Success page share intent** — proof of purchase, share button prominence,
   "do this next" copy, screenshot-bait quality
6. **Mobile-specific issues** — tap targets, iOS safe-area, fold position,
   sticky bars

## For each finding state

- Files to edit
- Minimal change required (be specific — don't say "improve copy")
- Risk level (very low / low / medium / high)
- Payment / webhook touch verdict (must be NO; if YES, push back hard)

## Output structure

1. **Top 5 blockers** ranked by impact-to-effort
2. **Quick wins subset** — items where each change is <10 lines and zero
   payment/webhook touch. Recommended order to ship.
3. **Bigger bets subset** — defer until quick wins shipped. Note dependencies.
4. **Counter-recommendations** — things that *look* like blockers but I'd
   advise keeping as-is (e.g., poetic italic kicker that breaks rhythm but
   lifts into TikTok captions). Explain why.

End with: "Approve which of these to plan in Stage 2?" Don't code.
