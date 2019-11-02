const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const schema = require('./graphql/schema');
const getContext = require('./graphql/lib/getContext');
// const corsOptions = require('../config/corsOptions');
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};

// Setup Route Bindings
module.exports = new ApolloServer({
  cors: cors(corsOptions),
  schema, // this tells graphql about data and how our graph should look
  context: getContext(),
});
