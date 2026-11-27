// Event-driven features using Node's built-in EventEmitter.
// Routes and sockets emit events; listeners here react (logging, notifications).
const EventEmitter = require("events");

class AppEvents extends EventEmitter {}
const appEvents = new AppEvents();

appEvents.on("user:registered", (user) => {
  console.log(`[event] New user registered: ${user.username} (${user.email})`);
});

appEvents.on("user:login", (user) => {
  console.log(`[event] User logged in: ${user.username}`);
});

appEvents.on("note:created", (note) => {
  console.log(`[event] Note created: "${note.title}" by ${note.owner}`);
});

appEvents.on("note:updated", (note) => {
  console.log(`[event] Note updated: "${note.title}"`);
});

appEvents.on("note:deleted", (note) => {
  console.log(`[event] Note deleted: "${note.title}"`);
});

appEvents.on("chat:message", ({ room, username, text }) => {
  console.log(`[${room}] ${username}: ${text}`);
});

module.exports = appEvents;
