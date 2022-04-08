const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.getUserDetails = async function (id) {
  return await User.findById(id, { _id: 1, name: 1, username: 1 }).lean();
};

userSchema.statics.isUsernameTaken = async function (username) {
  let results = await User.find({ username: username }, { _id: 1 }).limit(1).lean();
  return results.length !== 0;
};

userSchema.statics.updateName = async function(userId, name) {
  return User.findByIdAndUpdate(userId, { name: name }, { new : true, useFindAndModify : false });
}

const User = mongoose.model('User', userSchema);

module.exports = User;