# NBI Hockey Model Blueprint

## Project Goal

The NBI Hockey Model is a player evaluation system designed to convert raw InStat event data into public-facing category grades.

The model uses three raw datasets for each season:

1. All Situations
2. Power Play
3. Penalty Kill

The model will:

- Parse uploaded Excel files
- Match players across datasets
- Create a derived Base Game dataset
- Calculate category scores
- Apply reliability adjustments
- Convert scores into letter grades
- Output only public-facing grades

Raw InStat data will never be displayed publicly.

---

## Supported Leagues

### Phase 1

- NHL

### Phase 2

- AHL

### Phase 3

- CHL
  - WHL
  - OHL
  - QMJHL

---

## Supported Seasons

Each league will maintain three rolling seasons:

- Current Season
- Last Season
- Two Years Ago

Example:

NHL
├── Current Season
├── Last Season
└── Two Years Ago

---

## Uploaded Files Per Season

Each season requires three uploads:

- All Situations.xlsx
- Power Play.xlsx
- Penalty Kill.xlsx

The upload system must read column names rather than fixed column positions.

Files may have:

- Different row order
- Different player order
- Slightly different column names

The parser must identify columns by name aliases.

---

## Core Data Rules

- Treat all "-" values as 0
- Match players using Player + Date of Birth
- Cap all category scores between 1 and 99
- Round all final scores to nearest 0.5
- No Overall Rating
- No raw InStat data displayed publicly

---

## Player Matching Logic

The model must match players across All Situations, Power Play, and Penalty Kill files.

Primary matching key:

Player + Date of Birth

Secondary fallback keys:

1. Player + Date of Birth + Position
2. Player + Date of Birth + Team
3. Normalized Player Name + Date of Birth
4. Manual review queue

Player names should be normalized before matching:

- Trim extra spaces
- Standardize capitalization
- Remove duplicate spaces
- Account for occasional flipped names, such as “Colton Ross” vs “Ross Colton”

Date of Birth should be treated as the strongest identifier.

If two records cannot be matched confidently, the backend should not guess. It should flag the player for manual review.

---

## Team Resolution Logic

InStat team names are listed by city only.

Most teams can be resolved directly, but New York requires special handling because both the Rangers and Islanders may appear as “New York.”

For New York players:

1. Use Player + Date of Birth + Season
2. Match against NHL.com/API player or roster data for that season
3. Assign the correct team:
   - New York Rangers
   - New York Islanders
4. If no confident match exists, send the player to manual review

The system should avoid maintaining a manual New York mapping file if possible because players change teams over time.

The NHL API should eventually support both backend team resolution and frontend player/team pages.

---

## Dataset Creation Logic

The model uses three uploaded datasets for each season:

1. All Situations
2. Power Play
3. Penalty Kill

These datasets are treated as raw inputs and are never displayed publicly.

---

### Base Game Dataset

The model creates a derived Base Game dataset.

Formula:

Base Game = All Situations - Power Play - Penalty Kill

This subtraction should only be applied to counting statistics.

Examples:

- Goals
- Assists
- Shots
- Entries
- Breakouts
- Passes
- Takeaways
- Puck Battles

All counting statistics should be derived through subtraction.

---

### Percentage Statistics

Percentage statistics must never be directly subtracted.

Instead:

1. Subtract the underlying counts.
2. Recalculate the percentage from the resulting counts.

Example:

Pass Accuracy %

Incorrect:

Base Game Pass Accuracy =
All Situations Pass Accuracy
- PP Pass Accuracy
- PK Pass Accuracy

Correct:

Base Game Accurate Passes =
All Situations Accurate Passes
- PP Accurate Passes
- PK Accurate Passes

Base Game Passes =
All Situations Passes
- PP Passes
- PK Passes

Base Game Pass Accuracy =
Base Game Accurate Passes
/
Base Game Passes

---

### Derived Percentage Metrics

The model should calculate the following derived metrics.

#### Pass Accuracy %

Accurate Passes / Passes

---

#### Puck Battles Won %

Puck Battles Won / Puck Battles

---

#### xGA %

Opponent xG When On Ice
/
(
Team xG When On Ice
+
Opponent xG When On Ice
)

Lower values are better.

---

#### Corsi Against %

Corsi Against
/
(
Corsi For
+
Corsi Against
)

Lower values are better.

---

#### Fenwick Against %

Fenwick Against
/
(
Fenwick For
+
Fenwick Against
)

Lower values are better.

---

#### Controlled Entry %

(
Entries via Pass
+
Entries via Stickhandling
)
/
Entries

Higher values are better.

---

#### Dump-In %

Entries via Dump In
/
Entries

Lower values are better.

---

#### Controlled Breakout %

(
Breakouts via Pass
+
Breakouts via Stickhandling
)
/
Breakouts

Higher values are better.

---

#### Dump-Out %

Breakouts via Dump Out
/
Breakouts

Lower values are better.

---

### Missing Denominators

If a denominator equals zero:

- Do not force the value to 0
- Do not force the value to 100%
- Mark the metric as unavailable

Unavailable metrics should be ignored during category calculations.

---

## Scoring Engine

The NBI Hockey Model uses a multi-step normalization process to convert raw InStat statistics into public-facing category scores.

The objective is to compare players against league peers while accounting for differences in scale between statistics.

All category calculations follow the same pipeline.

---

### Step 1: Convert Counting Statistics to Per Game Values

All counting statistics should first be converted to per-game values.

Formula:

Metric Per Game = Metric / Games Played

Examples:

Goals per Game
Shots per Game
Entries per Game
Takeaways per Game
Scoring Chances per Game

Percentage statistics should not be converted because they are already rate statistics.

Examples:

Pass Accuracy %
Puck Battles Won %
Controlled Entry %
xGA %

---

### Step 2: Calculate League Distribution

For each metric:

1. Calculate league mean
2. Calculate league standard deviation

Calculations should be performed within the same:

- Season
- Situation
- Metric

Example:

2025-26 NHL Base Game Goals per Game

Mean = League Average Goals per Game

Standard Deviation = League SD of Goals per Game

---

### Step 3: Calculate Metric Z-Scores

Formula:

Z = (Player Value - League Mean)
    /
    League Standard Deviation

Cap all z-scores:

Minimum = -3.0

Maximum = +3.0

This prevents extreme outliers from dominating category calculations.

---

### Step 4: Convert Metrics into Stat Scores

Positive Metrics

Formula:

Stat Score =
50 + (Z × Metric Weight × 5)

Examples:

Goals
xG
Takeaways
Controlled Entry %

Higher values are better.

---

Negative Metrics

Formula:

Stat Score =
50 - (Z × Metric Weight × 5)

Examples:

Puck Losses
xGA %
Error Leading to Goal
Dump-In %
Dump-Out %

Lower values are better.

---

Stat Score Limits

Every Stat Score is capped:

Minimum = 1

Maximum = 99

---

### Step 5: Create Raw Category Score

Each category is calculated as a weighted average of the Stat Scores belonging to that category.

Formula:

Raw Category Score =
Weighted Average of Stat Scores

Category weights are defined separately in the Category Definitions section.

---

### Step 6: League Normalize Category Scores

After category scores are calculated:

1. Calculate league mean category score
2. Calculate league standard deviation

Formula:

Category Z =
(Player Raw Category Score - League Category Mean)
/
League Category SD

Convert to final category scale:

Final Category Score =
50 + (Category Z × 16.33)

This intentionally maps:

-3 SD ≈ 1

0 SD = 50

+3 SD ≈ 99

Formula:

50 + (3 × 16.33) = 98.99

---

### Step 7: Category Score Limits

Cap all category scores:

Minimum = 1

Maximum = 99

Round to nearest 0.5

Examples:

82.24 → 82.0

82.25 → 82.5

82.74 → 82.5

82.75 → 83.0

---

### Step 8: Reliability Adjustment

The model does not disqualify players for low games played.

Instead:

Small samples are regressed toward league average.

Formula:

Adjusted Category Score =
50
+
(
(Final Category Score - 50)
× GP Reliability
)

---

### GP Reliability Curve

82 GP = 1.00

60 GP = 0.95

40 GP = 0.90

20 GP = 0.80

10 GP = 0.70

5 GP = 0.55

1 GP = 0.40

Use linear interpolation between points.

---

### Step 9: Confidence Labels

Confidence labels are based on GP Reliability.

High Confidence

90%+

Moderate Confidence

75% to 89.9%

Small Sample

Below 75%

These labels may be shown publicly.

Games Played should not be displayed publicly.

---

### Step 10: Letter Grade Conversion

95.0 – 99.0 = A+

90.0 – 94.5 = A

85.0 – 89.5 = A-

80.0 – 84.5 = B+

70.0 – 79.5 = B

60.0 – 69.5 = B-

50.0 – 59.5 = C

40.0 – 49.5 = D

Below 40.0 = F

---

## Category Definitions

The model currently calculates eight public-facing categories:

1. Finishing
2. Playmaking
3. Transition
4. Puck Management
5. Defense
6. Forechecking
7. Power Play
8. Penalty Kill

Each category follows the scoring engine described above.

All weights below refer to the Metric Weight used during Stat Score calculation.

---

## Finishing

Purpose:

Measure a player's ability to generate dangerous shooting opportunities and convert them into goals.

This category is focused on scoring and shot generation, not overall offense.

### Positive Metrics

Goals/GP
Weight: 3.0

xG/GP
Weight: 3.0

Scoring Chances/GP
Weight: 2.5

Shots on Goal/GP
Weight: 2.0

Inner Slot Shots/GP
Weight: 2.0

Outer Slot Shots/GP
Weight: 1.0

### Negative Metrics

Missed Shots/GP
Weight: 0.5

Blocked Shots/GP
Weight: 0.5

## Future Category Tuning

The current version of the model uses identical formulas for:

- Forwards
- Defensemen

Future versions may introduce position-specific weighting systems.

The current version intentionally avoids position adjustments in order to establish a baseline league-wide grading framework.

