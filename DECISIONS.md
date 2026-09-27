# PlanetPulse Decisions

## Decision 1 — The Nudge

Choice: Warn + encourage, never block.

When a user exceeds their weekly target, PlanetPulse shows a visible warning instead of stopping them from continuing. The app keeps logging enabled because a carbon-tracking product works best when it captures real behavior without shame or friction. The warning explains the overage and directs the user to the biggest contributor category without creating a punitive experience.

Alternatives considered:

- Block activity logging entirely: this would make the tool feel punitive and increase the risk that users stop logging honestly.
- Silent warning without context: this would be less useful and would not help the user understand the cause of the overage.

Tradeoff:

- Users keep full control over their log entries while still receiving clear feedback.
- The experience stays encouraging and informative rather than restrictive.

Actual implementation:

- The dashboard shows the current weekly total and target amount.
- When the total exceeds the user target, it surfaces a warning and a “View contributors” action that scrolls to the category breakdown.
- Logging remains enabled after the overage so the full week remains accurate.

## Decision 2 — Absurd Input

Choice: Warn + require confirmation, but allow user override.

PlanetPulse specifically checks for unusually large values rather than silently rejecting them. A value like 5,000 km is not automatically invalid, because it could reflect a long trip, a high-use event, or a legitimate data point. Silent rejection would feel arbitrary, and silent correction would quietly change the user’s record.

Why this matters:

- People can genuinely log large life events or unusual travel patterns.
- A trusted carbon app should never silently alter the user’s entry.
- The purpose is to catch mistakes without taking away human judgment.

Actual implementation:

- The app validates empty values, zero, negative values, and non-numeric entries immediately.
- For suspiciously large values, it shows an unusual-input warning and offers the user a choice to edit the entry or log it anyway.
- This preserves the user’s intent while still protecting against accidental mistakes.

## Decision 3 — The Week

Choice: Monday 00:00 to Sunday 23:59 in the user’s local timezone.

PlanetPulse anchors the weekly model to Monday through Sunday in the current local date context. This matches how people naturally think about a week and keeps the dashboard easy to understand. The displayed date range is always shown so users know exactly which week they are viewing.

Why this was chosen:

- Monday–Sunday provides a predictable rhythm for target resets and weekly comparisons.
- It keeps the app aligned with real calendar behavior rather than an abstract rolling window.
- Previous activities remain visible in History, but only entries that fall within the active local week are counted toward the current weekly total and target.

Actual implementation:

- The app calculates the current week range using the local date and the Monday offset logic.
- The weekly total, target progress, and 7-day summary all use that local week window.
- Historical entries remain available without being accidentally counted in the current week.
