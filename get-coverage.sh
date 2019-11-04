#!/usr/bin/env bash

covered=$(find coverage -name coverage-summary.json -exec cat {} + | jq .total.functions.covered | paste -sd+ | bc)
total=$(find coverage -name coverage-summary.json -exec cat {} + | jq .total.functions.total | paste -sd+ | bc)

coverage=$(echo "scale=2; ${covered} / ${total} * 100" | bc -l | sed 's/^\./0./')

echo "Total project code coverage: ${coverage} %"
