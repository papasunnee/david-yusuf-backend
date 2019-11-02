const apolloServer = require('../apolloServer');

const apiPath = '/graphql';

const corsOptions = {
  origin: '*',
  credentials: true,
};

// Setup Route Bindings
module.exports = (app) => {
  // Views
  app.get('/admin', (req, res) => {
    res.redirect('/keystone');
  });
  app.get('/', (req, res) => {
    res.redirect('/keystone');
  });
  apolloServer.applyMiddleware({ app, path: apiPath, cors: corsOptions });
};
