// Configure CORS -- Remove localhost in final version
const corsOptions = {};
// if (process.env.NODE_ENV == 'production') {
//   const whitelist = [process.env.FRONT_END_URL, 'http://localhost']
//   corsOptions = {
//     origin: function (origin, callback) {
//       if (whitelist.indexOf(origin) !== -1) {
//         callback(null, true)
//       } else {
//         callback(new Error('Not allowed by CORS'))
//       }
//     }
//   }
// }
module.exports = corsOptions;
