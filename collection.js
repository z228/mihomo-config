// Normalize collection node names before producing the final configuration.
function operator(proxies) {
  const used = new Set();
  const result = [];
  for (const proxy of proxies) {
    const source = proxy._subName;
    if (!source) throw new Error("Missing subscription source for node: " + proxy.name);
    const prefix = "[" + source + "] ";
    let name = String(proxy.name).trim();
    if (name.startsWith(prefix)) name = name.slice(prefix.length).trimStart();
    if (name.startsWith("移动流量推荐")) continue;
    const base = prefix + name;
    let unique = base;
    let index = 2;
    while (used.has(unique)) unique = base + " (" + index++ + ")";
    used.add(unique);
    proxy.name = unique;
    result.push(proxy);
  }
  return result;
}
