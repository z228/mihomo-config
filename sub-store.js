// Load the public template; credentials remain in the selected source.
const templateUrl = $arguments.template;
if (!templateUrl) throw new Error("Missing template URL argument");
const response = await $substore.http.get({ url: templateUrl });
const config = ProxyUtils.yaml.safeLoad(response.body);
const revisionBase = templateUrl.slice(0, templateUrl.lastIndexOf("/") + 1);
// Fetch independent files concurrently; concatenate in manifest order.
if (config["x-rule-files"]) {
  const sections = await Promise.all(config["x-rule-files"].map(async (path) => {
    const result = await $substore.http.get({ url: revisionBase + path });
    const section = ProxyUtils.yaml.safeLoad(result.body);
    if (!Array.isArray(section?.rules) || !section.rules.every(rule => typeof rule === "string")) {
      throw new Error("Invalid routing rules: " + path);
    }
    return section.rules;
  }));
  config.rules = sections.flat();
  delete config["x-rule-files"];
}
for (const provider of Object.values(config["rule-providers"] || {})) {
  const prefix = "https://raw.githubusercontent.com/z228/mihomo-config/main/";
  if (provider.url?.startsWith(prefix)) {
    provider.url = revisionBase + provider.url.slice(prefix.length);
  }
}


// The selected source supplies nodes; local overrides stay private.
const incoming = typeof $content === "string" ? ProxyUtils.yaml.safeLoad($content) : $content;
if (!Array.isArray(incoming?.proxies) || !incoming.proxies.length) {
  throw new Error("The selected subscription contains no nodes");
}
config.proxies = incoming.proxies;
for (const proxy of config.proxies) {
  if (/^\[aws-/.test(proxy.name) && proxy["reality-opts"]) {
    proxy["reality-opts"]["support-x25519mlkem768"] = true;
  }
}
let overrides = incoming["x-private-overrides"] || {};
if ($arguments.privateUrl) {
  const privateResponse = await $substore.http.get({ url: $arguments.privateUrl });
  const privateConfig = ProxyUtils.yaml.safeLoad(privateResponse.body);
  if (!privateConfig?.["x-private-overrides"]) {
    throw new Error("Private Git source returned invalid overrides");
  }
  overrides = privateConfig["x-private-overrides"];
}
if (overrides.rules) config.rules = [...overrides.rules, ...config.rules];
for (const group of config["proxy-groups"]) {
  if (overrides.testUrls?.[group.name]) group.url = overrides.testUrls[group.name];
}
// Isolate experimental two-hop copies from all existing include-all groups.
const chainEntry = "[akk] 香港--高速实验性节点1--FX 6倍率";
const entry = config.proxies.find(proxy => proxy.name === chainEntry);
if (!entry) throw new Error("AI test entry node is missing: " + chainEntry);
const usFilter = new RegExp(config["proxy-groups"].find(group => group.name === "🇺🇲 美国节点").filter);
const exits = config.proxies.filter(proxy => proxy.name !== chainEntry && usFilter.test(proxy.name));
if (!exits.length) throw new Error("No US exit nodes available for AI test");
const chainNodes = exits.map(proxy => ({
  ...proxy,
  name: "[ai-chain] " + proxy.name,
  "dialer-proxy": chainEntry,
}));
for (const group of config["proxy-groups"]) {
  if (group["include-all"]) {
    group["exclude-filter"] = [group["exclude-filter"], "^\\\\[ai-chain\\\\] "].filter(Boolean).join("|");
  }
}
config.proxies.push(...chainNodes);
config["proxy-groups"].push({
  name: "ai-test",
  type: "url-test",
  proxies: chainNodes.map(proxy => proxy.name),
  url: "https://chatgpt.com/",
  interval: 300,
  tolerance: 50,
});
$content = ProxyUtils.yaml.safeDump(config);
