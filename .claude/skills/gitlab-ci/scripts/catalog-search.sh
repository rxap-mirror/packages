#!/usr/bin/env bash
# Query the GitLab CI/CD Catalog via GraphQL.
#
# Usage:
#   scripts/catalog-search.sh [VERIFICATION] [SORT] [LIMIT] [SEARCH]
#
# Arguments (all positional, all optional):
#
#   VERIFICATION (default GITLAB_MAINTAINED):
#     GITLAB_MAINTAINED            created and maintained by GitLab (tanuki badge).
#     GITLAB_PARTNER_MAINTAINED    independently maintained by a GitLab-verified partner.
#     VERIFIED_CREATOR_MAINTAINED  maintained by a user verified by an administrator.
#     UNVERIFIED                   everything else.
#
#   SORT (default USAGE_COUNT_DESC):
#     USAGE_COUNT_DESC, USAGE_COUNT_ASC
#     LATEST_RELEASED_AT_DESC, LATEST_RELEASED_AT_ASC
#     STAR_COUNT_DESC, STAR_COUNT_ASC
#     NAME_ASC, NAME_DESC
#
#   LIMIT (default 20): number of results to return. Non-negative integer.
#
#   SEARCH (default empty): substring match against name and description.
#
# Output: raw GraphQL JSON on stdout. Pipe through jq or another parser to
# extract fields. The agent typically reads: nodes[].name, .fullPath,
# .description, .topics, .last30DayUsageCount, .starCount, .archived, and the
# latest release tag at .versions.nodes[0].name.
#
# Examples:
#   scripts/catalog-search.sh
#   scripts/catalog-search.sh GITLAB_PARTNER_MAINTAINED
#   scripts/catalog-search.sh GITLAB_MAINTAINED STAR_COUNT_DESC 50
#   scripts/catalog-search.sh UNVERIFIED USAGE_COUNT_DESC 20 terraform
#
# No authentication required for public components. Depends only on bash,
# curl, and sed.

set -uo pipefail

VERIFICATION="${1:-GITLAB_MAINTAINED}"
SORT="${2:-USAGE_COUNT_DESC}"
LIMIT="${3:-20}"
SEARCH="${4:-}"

case "$LIMIT" in
  ''|*[!0-9]*)
    echo "ERROR: LIMIT must be a non-negative integer, got: $LIMIT" >&2
    exit 2
    ;;
esac

if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required but not installed." >&2
  exit 2
fi

# The GraphQL query. Single-quoted so $variableName inside refers to GraphQL
# variables, not shell variables.
QUERY='query getCatalogResources($verificationLevel: CiCatalogResourceVerificationLevel, $sortValue: CiCatalogResourceSort, $first: Int, $searchTerm: String) { ciCatalogResources(verificationLevel: $verificationLevel, sort: $sortValue, first: $first, search: $searchTerm) { nodes { name fullPath description topics last30DayUsageCount starCount archived versions(first: 1) { nodes { name } } } pageInfo { hasNextPage } } }'

# Build the variables JSON. Conditionally include searchTerm.
if [ -z "$SEARCH" ]; then
  VARIABLES="{\"first\":$LIMIT,\"verificationLevel\":\"$VERIFICATION\",\"sortValue\":\"$SORT\"}"
else
  # JSON-escape backslashes and double quotes in the search term.
  SAFE_SEARCH=$(printf '%s' "$SEARCH" | sed 's/\\/\\\\/g; s/"/\\"/g')
  VARIABLES="{\"first\":$LIMIT,\"verificationLevel\":\"$VERIFICATION\",\"sortValue\":\"$SORT\",\"searchTerm\":\"$SAFE_SEARCH\"}"
fi

BODY="{\"operationName\":\"getCatalogResources\",\"variables\":$VARIABLES,\"query\":\"$QUERY\"}"

curl --silent --show-error --fail \
  -X POST "https://gitlab.com/api/graphql" \
  -H 'Content-Type: application/json' \
  -d "$BODY"
