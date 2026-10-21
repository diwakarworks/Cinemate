require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/ReviewRoutes');
const movieRoutes = require('./routes/movieRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const listRoutes = require('./routes/listsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const peopleRoutes = require('./routes/peopleRoutes');
const naturalSearchRoutes = require('./routes/naturalSearchRoutes');
const ragRoutes = require('./routes/ragRoutes');
const normalChatRoutes = require("./routes/normalChatRoutes");
 

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
app.use('/api/people',peopleRoutes);
app.use('/api/search/natural',naturalSearchRoutes);
app.use('/api/rag', ragRoutes);
app.use("/api/chat", normalChatRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
