const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const schema = require('./graphql/schema');
const getContext = require('./graphql/lib/getContext');
// const corsOptions = require('../config/corsOptions');

// Setup Route Bindings
module.exports = new ApolloServer({
  cors,
  schema, // this tells graphql about data and how our graph should look
  context: getContext(),
});
