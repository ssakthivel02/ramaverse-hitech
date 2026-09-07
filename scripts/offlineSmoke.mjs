const targets = await (await fetch("http://127.0.0.1:9222/json")).json();
const target = targets.find((entry) => entry.type === "page" && entry.url.includes("3000-il89xcgpax44f3tjqvhgg-e8b3a1e4.us1.manus.computer/ask"));
if (!target) throw new Error("Current local Ask RamaVerse browser target was not found.");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolve(message.result);
  }
});
const command = (method, params = {}) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });

try {
  await command("Network.enable");
  await command("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  await command("Page.reload", { ignoreCache: false });
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const result = await command("Runtime.evaluate", { expression: "({ title: document.title, hasRoot: Boolean(document.getElementById('root')), hasAsk: document.body.innerText.includes('Ask RamaVerse'), hasOfflineShell: document.body.innerText.includes('RamaVerse') })", returnByValue: true });
  console.log(JSON.stringify({ offlineReload: result.result.value }, null, 2));
} finally {
  await command("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  socket.close();
}
