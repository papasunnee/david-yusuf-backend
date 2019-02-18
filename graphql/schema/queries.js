const {
  PostTC,
} = require('../composers');

// Add fields and resolvers to rootQuery
module.exports = {
  posts: PostTC.getResolver('pagination'),
  currentTime: {
    type: 'Date',
    resolve: () => new Date().toISOString(),
  },
};
