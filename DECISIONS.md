# PlanetPulse Decisions

## Decision 1 — The Nudge

Choice: Warn + encourage, never block.

When a user exceeds their weekly target, PlanetPulse shows a visible warning message instead of stopping them from continuing. The app keeps logging enabled because a carbon-tracking tool is more valuable when it records real behavior than when it prevents users from entering data. The warning explains the overage and nudges the user to review the largest contribution category without shaming or penalizing them.

Alternatives considered:

- Block activity logging entirely: this would make the app feel punitive and could cause users to avoid using it when they need the most honest data.
- Silent warning without explanation: this would be less actionable and less useful for behavior change.

Tradeoff:

- The product stays encouraging and honest, even when a user is above target.
- The dashboard remains informative rather than restrictive.

Impact on user experience:

- Logging is never blocked, and the target status remains motivating rather than discouraging.
- Users can continue to build a trustworthy record of their week while receiving guidance on where to adjust behavior.

## Decision 2 — Absurd Input

Choice: Warn + require confirmation, but allow user override.

PlanetPulse implements a threshold-based unusual-input check to catch values that are likely mistakes without assuming they are impossible. For example, a 5,000 km car trip may be unusual but can still be a real-world input. The app therefore does not silently reject or silently change the value. Instead, it shows a message that says the value looks unusually high and presents the user with the choice to edit it or log it anyway.

Why this matters:

- A silent rejection would make the product feel arbitrary and could hide real-world behavior.
- A silent correction would alter the recorded data without user intent.
- A real user might legitimately log a long trip or a high consumption event, and the system should never assume otherwise.

This is balanced with normal validation: empty values, negative values, zero, NaN, and infinite values are still rejected immediately. The unusual-input flow only applies to values that are possible but suspiciously large.

## Decision 3 — The Week

Choice: Monday 00:00 to Sunday 23:59 in the user’s local timezone.

PlanetPulse defines the active week dynamically using the local system date, anchored to Monday at 00:00 and Sunday at 23:59. This keeps the weekly model predictable and easy to understand. The date range is always displayed clearly in the dashboard so users can tell exactly which week they are looking at.

Why this was chosen:

- Monday–Sunday is a familiar and consistent weekly rhythm.
- It makes the mental model simple: weekly targets reset on Monday and continue through Sunday.
- Historical activities remain in the full activity log, but only those in the current local week contribute to the current weekly total and target progress.

This means old activities remain accessible in History without being accidentally counted in the current week. The app uses the local timezone instead of a hardcoded date range, which keeps the behavior aligned with the user’s actual calendar.
