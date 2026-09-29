# Mihomo configuration for Sub-Store

## Files

- template.yaml: groups, rules, and rule providers. Edit this for routing changes.
- sub-store.js: small runtime adapter that loads the template, preserves source nodes,
  applies private overrides, and enables the AWS REALITY compatibility flag.

Select a collection as the source of a Sub-Store mihomo configuration file.
Apply private YAML overrides first, then the remote JavaScript operation.
Pass the template URL through the script URL fragment:
sub-store.js#template=https%3A%2F%2Fraw.githubusercontent.com%2Fz228%2Fmihomo-config%2Fmain%2Ftemplate.yaml

Pin both URLs to tested commit hashes for reproducible deployments.
A main-branch URL follows future changes (subject to Sub-Store caching).

Private YAML lives in a separate private Git repository and is copied into
Sub-Store during deployment. Updating that repository alone does not deploy it.
No GitHub credentials are stored in Sub-Store.

Native include-all and filter options populate groups from the selected source.
AWS-EKS includes every node. Private overrides can supply rules and testUrls
inside x-private-overrides; the runtime adapter removes this input-only field.

The generated Sub-Store file URL, not the script URL, belongs in Clash.
The generated configuration contains credentials and must remain private.

## Design reference

https://github.com/zrj866/mihomo informed the native group inclusion approach.
Its personal node references, DNS/TUN settings, and rule lists were not copied.

## Rule sets

rules/ai.yaml maintains local AI domain and process rules. Existing AI providers remain enabled.
YouTube, Microsoft, and TelegramALL rule sets are referenced from zrj866/mihomo at commit 4a0c54921fa44c3dd4391a3c9314f20e64971d81.
Microsoft domestic exceptions retain priority; the Microsoft selector defaults to DIRECT.
