const router = require('express').Router();
const { Song } = require('../models/song');
const { Playlist } = require('../models/playlist');
const auth = require('../middleware/auth');

// Route to get songs as per what is searched
// uses regex for string matching
router.get('/', auth, async (req, res) => {
  const search = req.query.search;
  if (search !== '') {
    const songs = await Song.find({
      name: { $regex: search, $options: "i" }
    }).limit(10);
    const playlists = await Playlist.find({
      name: { $regex: search, $options: "i" }
    }).limit(10);
    res.status(200).send({ data: { songs, playlists } });
  } else {
    res.status(200).send({});
  }
});

module.exports = router;