import { EventEmitter } from "events";

class RealtimeHub extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
    this.clients = new Set();
  }

  addClient(res, user) {
    const client = { res, user };
    this.clients.add(client);
    res.on("close", () => this.clients.delete(client));
    this.send(client, { type: "connected", at: new Date().toISOString() });
  }

  send(client, payload) {
    client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  broadcast(event) {
    const payload = { ...event, at: new Date().toISOString() };
    for (const client of this.clients) {
      const role = client.user?.role;
      if (event.audience === "staff" && !["STAFF", "ADMIN"].includes(role)) continue;
      if (event.audience === "user" && client.user?.sub !== event.userId) continue;
      this.send(client, payload);
    }
    this.emit("event", payload);
  }
}

export const realtime = new RealtimeHub();
