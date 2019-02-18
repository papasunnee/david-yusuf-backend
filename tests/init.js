process.env.NODE_ENV = process.env.NODE_ENV || 'test';
require('dotenv').load();

const keystone = require('keystone');
// const chai = require('chai');

keystone.init({
  name: 'Keystonejs-graphql-compose-boilerplate',
  's3 config': {},
});


keystone.import('../models');

// chai.should();

const MongodbMemoryServer = require('mongodb-memory-server');

let mongod;
before(async () => {
  mongod = new MongodbMemoryServer.default({
    binary: {
      version: 'latest',
    },
  });
  global.__MONGO_URI__ = await mongod.getConnectionString();
  global.__MONGO_DB_NAME__ = await mongod.getDbName();
  global.__COUNTERS__ = {
    posts: 0,
    postCategories: 0,
  };
});

after(async () => {
  await mongod.stop();
})
