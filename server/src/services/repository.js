import { dbState } from '../config/db.js';
import * as models from '../models/index.js';
import { memoryStore } from './memoryStore.js';

function getMongooseModel(modelName) {
  const model = models[modelName];
  if (!model) {
    throw new Error(`Unknown model: ${modelName}`);
  }
  return model;
}

export const repository = {
  async getAll(modelName, filter = {}, sort = null) {
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      let query = Model.find(filter);
      if (sort) query = query.sort(sort);
      return query.lean();
    }
    return memoryStore.getAll(modelName, filter, sort);
  },

  async getById(modelName, id) {
    if (!id) return null;
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      return Model.findById(id).lean();
    }
    return memoryStore.getById(modelName, id);
  },

  async getOne(modelName, filter = {}) {
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      return Model.findOne(filter).lean();
    }
    return memoryStore.getOne(modelName, filter);
  },

  async create(modelName, data) {
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      const created = await Model.create(data);
      return created.toObject();
    }
    return memoryStore.create(modelName, data);
  },

  async updateById(modelName, id, updateData) {
    if (!id) return null;
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      return Model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).lean();
    }
    return memoryStore.updateById(modelName, id, updateData);
  },

  async upsert(modelName, filter, createData, updateData) {
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      const updatePayload = {};
      if (createData) updatePayload.$setOnInsert = createData;
      if (updateData) updatePayload.$set = updateData;
      else if (createData) updatePayload.$set = createData;

      return Model.findOneAndUpdate(
        filter,
        updatePayload,
        { upsert: true, new: true, runValidators: true }
      ).lean();
    }
    return memoryStore.upsert(modelName, filter, createData, updateData);
  },

  async deleteById(modelName, id) {
    if (!id) return false;
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      const res = await Model.findByIdAndDelete(id);
      return Boolean(res);
    }
    return memoryStore.deleteById(modelName, id);
  },

  async deleteWhere(modelName, filter = {}) {
    if (dbState.mode === 'mongo') {
      const Model = getMongooseModel(modelName);
      const res = await Model.deleteMany(filter);
      return res.deletedCount;
    }
    return memoryStore.deleteWhere(modelName, filter);
  }
};
