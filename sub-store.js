// Load the public template; credentials remain in the selected source.
const templateUrl = $arguments.template;
if (!templateUrl) throw new Error("Missing template URL argument");
const response = await $substore.http.get({ url: templateUrl });
const config = ProxyUtils.yaml.safeLoad(response.body);


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
const overrides = incoming["x-private-overrides"] || {};
if (overrides.rules) config.rules = [...overrides.rules, ...config.rules];
for (const group of config["proxy-groups"]) {
  if (overrides.testUrls?.[group.name]) group.url = overrides.testUrls[group.name];
}
$content = ProxyUtils.yaml.safeDump(config);
