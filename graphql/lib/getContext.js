const keystone = require('keystone');

const Post = keystone.list('Post').model;
const PostCategory = keystone.list('PostCategory').model;


module.exports = () => {
  const context = {
    models: {
      Post,
      PostCategory,
    },
  };

  return context;
};
