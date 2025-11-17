"use strict";
// src/services/cache.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.abacRuleCache = exports.userCache = void 0;
class SimpleCache {
    constructor() {
        this.store = new Map();
    }
    set(key, value, ttlMs) {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return undefined;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    delete(key) {
        this.store.delete(key);
    }
}
exports.userCache = new SimpleCache();
exports.abacRuleCache = new SimpleCache();
