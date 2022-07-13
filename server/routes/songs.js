const router = require('express').Router();
const { User } = require('../models/user');
const { Song, validate } = require('../models/song');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validObjectId = require('../middleware/validObjectId');

// Route to create song
router.post('/', admin, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const song = await Song(req.body).save();
  res.status(200).send({ data: song, message: "Song created successfully!" });
});

// Route to get all songs
router.get('/', async (req, res) => {
  const songs = await Song.find();
  res.status(200).send({ data: songs });
});

// Route to update song
router.put('/:id', [validObjectId, admin], async (req, res) => {
  const song = await Song.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).send({ data: song, message: "Song updated successfully!" });
});

// Route to delete song
router.delete('/:id', [validObjectId, admin], async (res, req) => {
  await Song.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "Song deleted successfully!" });
});

// Like song
router.put('/like/:id', [validObjectId, auth], async (req, res) => {
  let resMessage = '';
  const song = await Song.findById(req.params.id);
  if (!song) {
    return res.status(400).send({ message: "Song does not exist!" });
  }

  const user = await User.findById(req.params.id);
  const index = user.likedSongs.indexOf(song._id);
  if (index === -1) {
    // Like
    user.likedSongs.push(song._id);
    resMessage = "Added to your liked songs";
  } else {
    // Unlike
    user.likedSongs.splice(index, 1);
    resMessage = "Removed from your liked songs";
  }
  res.status(200).send({ message: resMessage });
});

// Route to get all liked songs
router.get('/like', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const songs = await Song.find({ _id: user.likedSongs });
  res.status(200).send({ data: songs  });
});

module.exports = router;