
require('dotenv').config();

require('express-async-errors'); // takes care of async errors
const express = require('express');
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');
const searchRoutes = require('./routes/search');

const app = express();

connection();
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/login', authRoutes);
app.use('/songs', songRoutes);
app.use('/playlists', playlistRoutes);
app.use('/', searchRoutes);

const port = process.env.PORT || 8082;

app.listen(port, console.log(`Listening on port ${port}`));