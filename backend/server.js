const cors = require('cors');
const express = require('express');
const connectDB  = require('./config/db');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/ReviewRoutes');
const movieRoutes = require('./routes/movieRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const listRoutes = require('./routes/listsRoutes');
const searchRoutes = require('./routes/searchRoutes');
 
dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth',authRoutes);
app.use('/api/user',userRoutes);
app.use('/api/review',reviewRoutes);
app.use('/api/movies',movieRoutes);
app.use('/api/diary',diaryRoutes);
app.use('/api/ranking',rankingRoutes);
app.use('/api/lists',listRoutes);
app.use('/api/search',searchRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));