# Mihomo configuration for Sub-Store

A public routing script for Sub-Store's mihomo configuration file type.
Node credentials, subscription URLs, and private work domains are not stored here.

## Setup

1. Create a mihomo configuration file in Sub-Store.
2. Select your collection as the source.
3. Add a remote Script Operator pointing to the raw URL of sub-store.js.
4. Copy the generated Sub-Store file URL into your client.

The script URL is for Sub-Store, not a client subscription URL.
Use a commit-pinned raw URL for reproducible deployments.

## Behavior

Native include-all and filter settings populate regional and service groups.
AWS-EKS includes all nodes. REALITY properties are preserved and
support-x25519mlkem768 is enabled for nodes whose names begin with [aws-.

An optional preceding local Script Operator can set x-private-overrides on
the input configuration, with rules (an array of high-priority rules) and
testUrls (a map of group names to test URLs). Keep private overrides on the server.
The generated subscription contains credentials; keep its URL private.

## Validation

The script has been checked with synthetic nodes and private overrides.
Validate real generated output using the client's Mihomo version before deployment.

## Design reference

Native group inclusion and external rule providers were reviewed against
https://github.com/zrj866/mihomo. Personal node names, Telegram region rules,
DNS/TUN settings, and the AI rule list from that repository were not imported.
This script is derived from the existing deployment.

## Script URL

https://raw.githubusercontent.com/z228/mihomo-config/main/sub-store.js
