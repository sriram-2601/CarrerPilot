let idCounter = 1;

function generateId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}${idCounter++}`;
}

function clone(obj) {
  if (obj === undefined || obj === null) return obj;
  return structuredClone(obj);
}

function normalizeId(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object' && val.toString) return val.toString();
  return String(val);
}

function matchCriterion(docVal, filterVal) {
  if (filterVal === undefined) return true;

  // Handle Mongo ID comparison
  if (
    typeof docVal === 'string' &&
    (typeof filterVal === 'string' || (filterVal && typeof filterVal === 'object' && filterVal.toString))
  ) {
    if (normalizeId(docVal) === normalizeId(filterVal)) return true;
  }

  // Handle operator objects: $in, $ne, $regex
  if (filterVal !== null && typeof filterVal === 'object' && !Array.isArray(filterVal)) {
    if (Array.isArray(filterVal.$in)) {
      return filterVal.$in.some(item => normalizeId(item) === normalizeId(docVal));
    }
    if (filterVal.$ne !== undefined) {
      return normalizeId(docVal) !== normalizeId(filterVal.$ne);
    }
    if (filterVal.$regex !== undefined) {
      const reg = new RegExp(filterVal.$regex, filterVal.$options || 'i');
      return reg.test(String(docVal || ''));
    }
  }

  // Handle array doc values (e.g. skills)
  if (Array.isArray(docVal) && !Array.isArray(filterVal)) {
    return docVal.includes(filterVal);
  }

  return normalizeId(docVal) === normalizeId(filterVal);
}

function matchesFilter(doc, filter = {}) {
  for (const [key, value] of Object.entries(filter)) {
    // Nested field support (e.g. 'preferences.location')
    if (key.includes('.')) {
      const parts = key.split('.');
      let curr = doc;
      for (const part of parts) {
        curr = curr ? curr[part] : undefined;
      }
      if (!matchCriterion(curr, value)) return false;
    } else {
      if (!matchCriterion(doc[key], value)) return false;
    }
  }
  return true;
}

class MemoryStore {
  constructor() {
    this.collections = {
      User: [],
      Profile: [],
      Internship: [],
      Match: [],
      ResumeVersion: [],
      ResumeHistory: [],
      Application: [],
      Notification: []
    };
  }

  getCollection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    return this.collections[name];
  }

  withId(item) {
    const now = new Date().toISOString();
    return {
      ...clone(item),
      _id: item._id ? normalizeId(item._id) : generateId(),
      createdAt: item.createdAt || now,
      updatedAt: now
    };
  }

  async getAll(modelName, filter = {}, sort = null) {
    const col = this.getCollection(modelName);
    let results = col.filter(doc => matchesFilter(doc, filter)).map(clone);

    if (sort) {
      results.sort((a, b) => {
        for (const [key, dir] of Object.entries(sort)) {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return dir === -1 ? 1 : -1;
          if (valA > valB) return dir === -1 ? -1 : 1;
        }
        return 0;
      });
    }

    return results;
  }

  async getById(modelName, id) {
    if (!id) return null;
    const strId = normalizeId(id);
    const col = this.getCollection(modelName);
    const item = col.find(doc => normalizeId(doc._id) === strId);
    return item ? clone(item) : null;
  }

  async getOne(modelName, filter = {}) {
    const col = this.getCollection(modelName);
    const item = col.find(doc => matchesFilter(doc, filter));
    return item ? clone(item) : null;
  }

  async create(modelName, data) {
    const col = this.getCollection(modelName);
    const stamped = this.withId(data);
    col.push(stamped);
    return clone(stamped);
  }

  async updateById(modelName, id, updateData) {
    const strId = normalizeId(id);
    const col = this.getCollection(modelName);
    const idx = col.findIndex(doc => normalizeId(doc._id) === strId);
    if (idx === -1) return null;

    const existing = col[idx];
    const updated = {
      ...existing,
      ...clone(updateData),
      _id: existing._id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    col[idx] = updated;
    return clone(updated);
  }

  async upsert(modelName, filter, createData, updateData) {
    const existing = await this.getOne(modelName, filter);
    if (existing) {
      return this.updateById(modelName, existing._id, updateData || createData);
    }
    return this.create(modelName, { ...filter, ...createData });
  }

  async deleteById(modelName, id) {
    const strId = normalizeId(id);
    const col = this.getCollection(modelName);
    const idx = col.findIndex(doc => normalizeId(doc._id) === strId);
    if (idx === -1) return false;
    col.splice(idx, 1);
    return true;
  }

  async deleteWhere(modelName, filter = {}) {
    const col = this.getCollection(modelName);
    const originalLength = col.length;
    this.collections[modelName] = col.filter(doc => !matchesFilter(doc, filter));
    return originalLength - this.collections[modelName].length;
  }

  clearAll() {
    for (const key of Object.keys(this.collections)) {
      this.collections[key] = [];
    }
  }
}

export const memoryStore = new MemoryStore();
