const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    name: {
      first: {
        type: String,
        required: true
      },
      last: {
        type: String,
        required: true
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
      match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipcode: {
        type: String,
        required: true,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: /^\d{10}$/,
      get: function(ph) {
        if (!ph) { return ''; }
        return `(${ph.slice(0, 3)}) ${ph.slice(3, 6)}-${ph.slice(6, 10)}`;
      }
    },
  },
  project: {
    description: {
      type: String,
      required: false,
    },
    address: {
      street: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      state: {
        type: String,
        required: false,
      },
      zipcode: {
        type: String,
        required: false,
      },
    },
    plans: [{
      description: {
        type: String,
        required: false,
      },
      consultant: {
        type: String,
        required: false,
      },
      originationDate: {
        type: Date,
        required: false,
      },
      revisionDate: {
        type: Date,
        required: false,
      },
    }],
    estimateDate: {
      type: Date,
      required: false,
    },
    specificationDate: {
      type: Date,
      required: false,
    },
    commencementDate: {
      type: Date,
      required: false,
    },
    approxWorkingDays: {
      type: Number,
      required: false,
    },
    price: {
      type: Number,
      required: false,
    },
    downPayment: {
      isPercentage: {
        type: Boolean,
        required: false,
        default: true,
      },
      percentage: {
        type: Number,
        required: false,
      },
      amount: {
        type: Number,
        required: false,
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false,
  toObject: {getters: true, virtuals: true},
  toJSON: {getters: true, virtuals: true}
});

JobSchema
.virtual('owner.name.full')
.get(function () {
  return this.owner.name.first + ' ' + this.owner.name.last;
});

JobSchema
.virtual('identifier')
.get(function () {
  return this.number + ' - ' + this.owner.name.last;
});

JobSchema
.virtual('owner.address.full')
.get(function () {
  return this.owner.address.street + '\n' +
    this.owner.address.city + ', ' + this.owner.address.state + ' ' + this.owner.address.zipcode;
});

module.exports = mongoose.model('Job', JobSchema);
