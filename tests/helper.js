const keystone = require('keystone');
const mongoose = require('mongoose');

// const * as loaders = require('../src/loader');
const createRows = require('./createRows');

const { ObjectId } = mongoose.Types;

const mongooseOptions = {
  autoIndex: false,
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 1000,
  connectTimeoutMS: 10000,
};

mongoose.Promise = Promise;

// Just in case want to debug something
// mongoose.set('debug', true);

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
// jest does this automatically for you if no NODE_ENV is set

async function connectMongoose() {
  try {
    keystone.set('mongoose', mongoose);
    await keystone.mongoose.connect(global.__MONGO_URI__, {
      ...mongooseOptions,
      // dbName: global.__MONGO_DB_NAME__,
      useMongoClient: true,
    });
  } catch (e) {
    console.log(e);
    return (e);
  }
}

async function clearDatabase() {
  await keystone.mongoose.connection.db.dropDatabase();
}

async function disconnectMongoose() {
  // await keystone.mongoose.connection.close();
  await keystone.mongoose.disconnect();
  keystone.mongoose.connections.forEach((connection) => {
    const modelNames = Object.keys(connection.models);

    modelNames.forEach((modelName) => {
      delete connection.models[modelName];
    });

    const collectionNames = Object.keys(connection.collections);
    collectionNames.forEach((collectionName) => {
      delete connection.collections[collectionName];
    });
  });

  const modelSchemaNames = Object.keys(keystone.mongoose.modelSchemas);
  modelSchemaNames.forEach((modelSchemaName) => {
    delete keystone.mongoose.modelSchemas[modelSchemaName];
  });
}

async function clearDbAndRestartCounters() {
  await clearDatabase();
  createRows.restartCounters();
}

// @TODO Make those two functions a separated npm package.
function sanitizeValue(value, field, keysToFreeze) {
  // If this current field is specified on the `keysToFreeze` array, we simply redefine it
  // so it stays the same on the snapshot
  if (field && keysToFreeze.indexOf(field) !== -1) {
    return `FROZEN-${field.toUpperCase()}`;
  }

  // Check if value is boolean
  if (typeof value === 'boolean') {
    return value;
  }

  // If value is falsy, return `EMPTY` value so it's easier to debug
  if (!value && value !== 0) {
    return 'EMPTY';
  }

  // Check if it's not an array and can be transformed into a string
  if (!Array.isArray(value) && typeof value.toString === 'function') {
    // Remove any non-alphanumeric character from value
    const cleanValue = value.toString().replace(/[^a-z0-9]/gi, '');

    // Check if it's a valid `ObjectId`, if so, replace it with a static value
    if (ObjectId.isValid(cleanValue) && value.toString().indexOf(cleanValue) !== -1) {
      return value.toString().replace(cleanValue, 'ObjectId');
    }
  }

  // if it's an array, sanitize the field
  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, null, keysToFreeze));
  }

  // If it's an object, we call sanitizeTestObject function again to handle nested fields
  if (typeof value === 'object') {
    // eslint-disable-next-line no-use-before-define
    return sanitizeTestObject(value, keysToFreeze);
  }

  return value;
}

/**
 * Sanitize a test object removing the mentions of a `ObjectId` from Mongoose and also
 *  stringifying any other object into a valid, "snapshotable", representation.
 */
function sanitizeTestObject(payload, keysToFreeze, ignore) {
  return Object.keys(payload).reduce((sanitizedObj, field) => {
    if (ignore.indexOf(field) !== -1) {
      return sanitizedObj;
    }

    const value = payload[field];
    const sanitizedValue = sanitizeValue(value, field, keysToFreeze);

    return {
      ...sanitizedObj,
      [field]: sanitizedValue,
    };
  }, {});
}

module.exports = {
  createRows,
  connectMongoose,
  clearDatabase,
  disconnectMongoose,
  clearDbAndRestartCounters,
  // getContext,
  // sanitizeTestObject,
  keystone,
};
