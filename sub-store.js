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
// Preserve the current direct TechnoVM node in the ordinary groups.
const directNames = config.proxies
  .filter(proxy => proxy.name.startsWith("[xz] "))
  .map(proxy => proxy.name);
if (!directNames.length) {
  throw new Error("TechnoVM nodes are missing");
}
for (const group of config["proxy-groups"]) {
  if (group.name === "yyssrr") continue;
  group.proxies = group["include-all"]
    ? [...new Set((group.proxies || []).filter(name => !directNames.includes(name)))]
    : [...new Set([...(group.proxies || []), ...directNames])];
  if (group.filter && directNames.some(name => !new RegExp(group.filter).test(name))) {
    group.filter = "(?:" + group.filter + ")|^\\[xz\\] ";
  }
}
$content = ProxyUtils.yaml.safeDump(config);
