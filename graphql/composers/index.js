const keystone = require('keystone');
const { composeWithMongoose } = require('graphql-compose-mongoose');

/**
* Mongoose Models
*/
const Post = keystone.list('Post').model;
const PostCategory = keystone.list('PostCategory').model;
const Enquiry = keystone.list('Enquiry').model;

const PostTC = composeWithMongoose(Post);
const PostCategoryTC = composeWithMongoose(PostCategory);
const EnquiryTC = composeWithMongoose(Enquiry);

/**
* Exports
*/
module.exports = {
  PostTC,
  PostCategoryTC,
  EnquiryTC,
};
