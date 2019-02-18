/* eslint-disable func-names */
const keystone = require('keystone');
const expertise = require('../data/expertise');

const { Types } = keystone.Field;

/**
 * Enquiry Model
 * ==========
 */
const Enquiry = new keystone.List('Enquiry', {
  track: { createdAt: true },
  nocreate: true,
  noedit: true,
});

Enquiry.add({
  name: {
    type: Types.Text, index: true, required: true, initial: true,
  },
  phone: {
    type: Types.Text, index: true, required: true, initial: true,
  },
  email: {
    type: Types.Email, initial: true, required: true, index: true,
  },
}, 'Interests', {
  ...expertise.map(item => ({
    [item.key]: {
      type: Types.Boolean,
      required: true,
      initial: true,
      default: false,
      index: true,
      label: item.title,
    },
  })).reduce((a, b) => Object.assign(a, b), {}),
});

Enquiry.schema.pre('save', function (next) {
  this.wasNew = this.isNew;
  next();
});

Enquiry.schema.post('save', function () {
  if (this.wasNew) {
    try {
      this.sendNotificationEmail();
      this.sendConfirmationEmail();
    } catch (e) {
      console.log(e);
    }
  }
});

Enquiry.schema.methods.stringifyInterests = function () {
  const enquiry = this;
  return expertise.map(item => (enquiry[item.key] ? item.title : '')).filter(String);
};

Enquiry.schema.methods.sendNotificationEmail = function () {
  const enquiry = this;

  return new Promise(((resolve, reject) => {
    console.log('sending enquiry notification email');

    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.log('Unable to send email - no mailgun credentials provided');
      reject(new Error('could not find mailgun credentials'));
    }

    const brand = keystone.get('brand');

    keystone.list('Admin').model.find({ recieveGuestEnquiries: true }).exec((e, admins) => {
      if (e) {
        reject(e);
      }
      if (admins) {
        new keystone.Email({
          templateName: 'guest-enquiry-notification',
          transport: 'mailgun',
        }).send({
          to: admins,
          from: {
            name: 'David Yusuf Website',
            email: 'admin@davidyusuf.com',
          },
          subject: 'New Enquiry for davidyusuf.com',
          enquiry,
          interests: enquiry.stringifyInterests(),
          brand,
        }, (err) => {
          if (err) {
            console.log(err);
            reject(err);
          }
        });
      }
      resolve();
    });
  }));
};

// guest-enquiry-confirmation
Enquiry.schema.methods.sendConfirmationEmail = function () {
  const enquiry = this;
  return new Promise(((resolve, reject) => {
    console.log('sending enquiry confirmation email');

    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.log('Unable to send email - no mailgun credentials provided');
      reject(new Error('could not find mailgun credentials'));
    }

    const brandDetails = keystone.get('brandDetails');

    new keystone.Email({
      templateName: 'guest-enquiry-confirmation',
      transport: 'mailgun',
    }).send({
      to: [enquiry.email],
      from: {
        name: 'David Yusuf Website',
        email: 'no-reply@davidyusuf.com',
      },
      subject: 'David Yusuf Enquiry',
      enquiry,
      interests: enquiry.stringifyInterests(),
      brandDetails,
    }, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      }
    });
    resolve();
  }));
};

/**
 * Registration
 */
Enquiry.defaultColumns = 'name, phone, email';
Enquiry.register();
