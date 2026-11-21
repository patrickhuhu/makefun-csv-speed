# CSV Reader Speed Entry

[![make.fun bounty](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)
[![Rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/patrickhuhu/makefun-csv-speed/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard)
[![Reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/patrickhuhu/makefun-csv-speed/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

A dependency-free CSV parser for the make.fun CSV reader speed bounty. It uses a fast path for plain records and preserves the reference reader's error reporting for malformed records.

## Run locally

Use Node.js 22.18 or newer. Put the kit's `cases.json` in `input/` and run:

```sh
mkdir -p output
MAKEFUN_INPUT_DIR="$PWD/input" MAKEFUN_OUTPUT_DIR="$PWD/output" node main.ts
```

The program writes `output/answers.json`.
