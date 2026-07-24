# Analytics Decision Hub Methodology

This module provides explainable, rule-based support for Fantasy Premier League decisions.

## Principles

- Deterministic only: no predictive model and no guaranteed outcomes.
- Transparent formulas: each score can be explained from visible inputs.
- No automatic actions: suggestions do not execute transfers or captain changes.
- Canonical data only: player, fixture, and team repositories are the only data sources.

## Data Inputs

- Player metrics: form, price, ownership, points per game, total points, minutes.
- Fixture context: official fixture difficulty values per home/away fixture.
- Manager context (optional): connected entry picks and bank value for personalization.

## Score Families

### Form Score

- Based on normalized FPL form (0-10).

### Value Score

- Computed as total points divided by normalized price in millions.
- Example: 180 points at 7.5m gives 24.0 value score.

### Differential Score

- Rewards performance combined with lower ownership.
- Applies minimum minutes threshold to avoid noisy small-sample outputs.

### Fixture Score

- Uses fixture difficulty (FDR 1-5) mapped to a 0-10 scale where higher is easier.

### Overall Score

- Weighted blend of value, form, fixture, and differential components.
- Designed for broad ranking, not direct transfer automation.

### Captain Score

- Weighted blend of form, fixture quality, and reliability (minutes floor).

### Transfer Target Score

- Weighted blend of form, value, and fixture score.
- Applies minimum minutes threshold and optional manager budget context.

## Personalized Insights

When a manager entry is connected, the hub adds:

- Captain matrix limited to squad players.
- Transfer watchlist excluding owned players.
- Team risk flags (low minutes, hard fixtures, availability issues).

## Pre-Season Behavior

When season data is sparse, the UI explicitly warns that form and points can be limited.
The methodology remains available and still surfaces price, role, ownership, and fixture context.
