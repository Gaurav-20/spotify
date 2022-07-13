const router = require('express').Router();
const { User, validate } = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validObjectId = require('../middleware/validObjectId');

// Create user
router.post('/', async (req, res) => {
  
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }
  
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(403).send({ message: "User with given email already exists!" });
  }

  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  let newUser = await new User({
    ...req.body,
    password: hashPassword // we don't store the real password in database
  }).save();
  // we don't want to send password to client side
  // the following line doesn't affect database values
  newUser.password = undefined;
  newUser.__v = undefined;

  res.status(200).send({ data: newUser, message: "Account created successfully!" });
});

// Route to get all users
router.get('/', admin, async (req, res) => {
  const users = await User.find().select('-password -__v'); // we don't want to send the password and __v (created by mongo)
  res.status(200).send({ data: users });
});

// Route to get user by id
router.get('/:id', [validObjectId, auth], async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -__v');
  res.status(200).send({ data: user });
});

// Route to update user by id
router.put('/:id', [validObjectId, auth], async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id, // select by id
    { $set: req.body }, // set contents as per what is obtained in req body
    { new: true } // return new updated user
  ).select('-password -__v');
  res.status(200).send({ data: user });
});

// Route to delete user by id
router.delete(':id', [validObjectId, admin], async (req, res) => {
  await User.findByIdAndDelete(req.param.id);
  res.status(200).send({ message: "Successfully deleted user!" });
});

module.exports = router;