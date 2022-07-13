const router = require('express').Router();
const { Playlist, validate } = require('../models/playlist');
const { Song } = require('../models/song');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const validObjectId = require('../middleware/validObjectId');
const joi = require('joi');

// Route to create a playlist
router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const user = await User.findById(req.user._id);
  const playlist = await Playlist({ 
    ...req.body,
    user: user._id
  }).save();
  user.playlists.push(playlist._id);
  await user.save();

  res.status(201).send({ data: playlist });
});

// Edit playlist by id
router.put('/edit/:id', [validObjectId, auth], async (req, res) => {
  const schema = joi.object({
    name: joi.string().required(),
    desc: joi.string().allow(''),
    image: joi.string().allow('')
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    return res.status(404).send({ message: "Playlist not found!" });
  }

  const user = await User.findById(req.user._id);
  if (!user._id.equals(playlist.user)) {
    return res.status(403).send({ message: "User don't have access to edit playlist" });
  }

  playlist.name = req.body.name;
  playlist.desc = req.body.desc;
  playlist.image = req.body.image;
  await playlist.save();

  res.status(200).send({ message: "Updated successfully!" });
});

// Route to add song to playlist
router.put('/addSong', auth, async (req, res) => {
  const schema = joi.object({
    playlistId: joi.string().required(),
    songId: joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const user = await User.findById(req.user._id);
  const playlist = await Playlist.findById(req.body.playlistId);
  if (!user._id.equals(playlist.user)) {
    return res.status(403).send({ message: "User don't have access to add to playlist" });
  }

  if (playlist.songs.indexOf(req.body.songId) === -1) {
    playlist.songs.push(req.body.songId);
  }
  await playlist.save();
  res.status(200).send({ data: playlist, message: "Added to playlist!" });

});

// Route to remove song from playlist
router.put('removeSong', auth, async (req, res) => {
  const schema = joi.object({
    playlistId: joi.string().required(),
    songId: joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const user = await User.findById(req.user._id);
  const playlist = await Playlist.findById(req.body.playlistId);
  if (!user._id.equals(playlist.user)) {
    return res.status(403).send({ message: "User don't have access to remove from playlist" });
  }

  const index = playlist.songs.indexOF(req.body.songId);
  playlist.songs.splice(index, 1);
  await playlist.save();
  res.status(200).send({ data: playlist, message: "Removed from playlist" });
});

// Route for user favourite playlists
router.get('/favourite', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  const playlists = await Playlist.find({ _id: user.playlists });
  res.status(200).send({ data: playlists });
});

// Route for getting random playlist
router.get('/random', auth, async (req, res) => {
  const playlists = await Playlist.aggregate([{ $sample: { size: 10 } }]);
  res.status(200).send({ data: playlists });
});

// Route to get playlist by id and songs
router.get('/:id', [validObjectId, auth], async (req, res) => {
  const playlist = await Playlist.findById(req.params.id);
  if (!playlist) {
    return res.status(404).send({ message: "Playlist not found" });
  }

  const songs = await Song.find({ _id: playlist.songs });
  res.status(200).send({ data: { playlist, songs } });
});

// Route to get all playlists
router.get('/', auth, async (req, res) => {
  const playlists = await Playlist.find();
  res.status(200).send({ data: playlists });
});

// Route to delete playlist by id
router.delete('/:id', [validObjectId, auth], async (req, res) => {
  const user = await User.findById(req.user._id);
  const playlist = await Playlist.findById(req.params.id);

  if (!user._id.equals(playlist.user)) {
    return res.status(403).send({ message: "User don't have access to delete the playlist" });
  }

  const index = user.playlists.indexOf(req.params.id);
  user.playlists.splice(index, 1);
  await user.save();
  await playlist.remove();
  res.status(200).send({ message: "Removed from library" });
});

module.exports = router;