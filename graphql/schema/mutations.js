const {
  EnquiryTC,
} = require('../composers');

// Add fields and resolvers to rootQuery
module.exports = {
  createEnquiry: EnquiryTC.getResolver('createOne'),
};
