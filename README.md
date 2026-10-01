# Mihomo configuration for Sub-Store

## Files

- template.yaml: groups, rule providers, and an ordered x-rule-files manifest.
- routing/*.yaml: ordered routing sections, merged into the final rules list.
- sub-store.js: small runtime adapter that loads the template, preserves source nodes,
  applies private overrides, and enables the AWS REALITY compatibility flag.

Select a collection as the source of a Sub-Store mihomo configuration file.
Use one remote JavaScript operation; it loads the template and optional private Git overrides.
Pass the template URL through the script URL fragment:
sub-store.js#template=https%3A%2F%2Fraw.githubusercontent.com%2Fz228%2Fmihomo-config%2Fmain%2Ftemplate.yaml

Pin both URLs to tested commit hashes for reproducible deployments.
A main-branch URL follows future changes (subject to Sub-Store caching).

Private YAML lives in a separate private Git repository. The backend privateUrl
service fetches its main branch on request; Sub-Store stores no override copy.
No GitHub credentials are stored in Sub-Store.

Native include-all and filter options populate groups from the selected source.
yyssrr nodes appear only in the yyssrr selector; all other groups exclude them.
Private overrides supply rules inside x-private-overrides. Most group latency checks
use http://www.gstatic.com/generate_204; regional AWS groups use their regional
EC2 API endpoints. Private testUrls are not applied.

The generated Sub-Store file URL, not the script URL, belongs in Clash.
The generated configuration contains credentials and must remain private.

## Design reference

https://github.com/zrj866/mihomo informed the native group inclusion approach.
Its personal node references, DNS/TUN settings, and rule lists were not copied.

## Rule sets

rules/ai.yaml maintains local AI domain and process rules. Existing AI providers remain enabled.
YouTube, Microsoft, and TelegramALL rule sets are referenced from zrj866/mihomo at commit 4a0c54921fa44c3dd4391a3c9314f20e64971d81.
Microsoft domestic exceptions retain priority; the Microsoft selector defaults to DIRECT.

## Single-operation setup

The remote script accepts privateUrl in its URL fragment. When provided, it fetches private YAML itself, so no preceding override operation is required. The private URL must be reachable from the Sub-Store backend. Do not place access tokens in public files.

## Ordered routing files

The runtime fetches routing files concurrently from the same Git revision as the
template, then merges their rules in x-rule-files order. File order and rule order
are significant: media destinations, regional AWS destinations, priority exceptions,
international destinations, remaining services,
direct destinations, then the final MATCH fallback. Private rules are prepended.
A missing or invalid section fails generation instead of silently dropping rules.
The x-rule-files field is removed from the generated configuration.

These files contain full rules including policy names. They differ from rules/ai.yaml
and external rule providers, which remain separate provider payloads.

## Collection node processing

Use collection.js as a remote Script Operator on the combined subscription.
It removes nodes whose original names start with 移动流量推荐, prefixes names with
[_subName], and adds numeric suffixes for remaining duplicate names. Apply it after
other collection node transformations. Subscription credentials remain in Sub-Store.
The full-file subscription statistics source is configured separately; statistics
from one provider must not be presented as aggregate usage across all providers.

## Regional AWS routing

AWS-Singapore and AWS-US probe the EC2 API in ap-southeast-1 and us-east-1,
respectively, and include non-yyssrr source nodes and DIRECT. The unsigned
DescribeRegions request returns HTTP 400 without redirecting to a global website;
health checks accept HTTP responses without requiring a success status. This
measures regional endpoint reachability, not authenticated API access. The general
automatic selection group checks latency every 300 seconds. Regional console, sign-in and API
rules run before general AWS rules; unrecognized/global AWS domains retain the
existing zc-work policy. Private work-domain overrides remain first.

## Direct TechnoVM inclusion

The generator preserves the direct TechnoVM node in ordinary groups, including
regional groups. The yyssrr selector contains only yyssrr nodes. Retired DMIT
nodes and chain groups are not generated.
