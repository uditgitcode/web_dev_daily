// Simple file-based JSON database (the lab allows "MongoDB / any preferred database").
// Each collection is stored in data/<name>.json and kept in memory for fast reads.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

class Collection {
  constructor(name) {
    this.file = path.join(DATA_DIR, `${name}.json`);
    this.docs = fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file, "utf8")) : [];
  }

  save() {
    fs.writeFileSync(this.file, JSON.stringify(this.docs, null, 2));
  }

  // 24-character hex id, same shape as a MongoDB ObjectId
  static newId() {
    return crypto.randomBytes(12).toString("hex");
  }

  find(filter = {}) {
    return this.docs.filter((doc) => Object.entries(filter).every(([k, v]) => doc[k] === v));
  }

  findOne(filter = {}) {
    return this.find(filter)[0] || null;
  }

  insert(data) {
    const now = new Date().toISOString();
    const doc = { _id: Collection.newId(), ...data, createdAt: now, updatedAt: now };
    this.docs.push(doc);
    this.save();
    return doc;
  }

  update(filter, changes) {
    const doc = this.findOne(filter);
    if (!doc) return null;
    Object.assign(doc, changes, { updatedAt: new Date().toISOString() });
    this.save();
    return doc;
  }

  remove(filter) {
    const doc = this.findOne(filter);
    if (!doc) return null;
    this.docs = this.docs.filter((d) => d !== doc);
    this.save();
    return doc;
  }
}

module.exports = {
  users: new Collection("users"),
  notes: new Collection("notes"),
};
