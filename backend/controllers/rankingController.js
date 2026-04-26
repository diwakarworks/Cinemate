const UserRanking = require('../models/UserRanking');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const DiaryEntry = require('../models/DiaryEntry');

const TMDB_KEY = process.env.TMDB_API_KEY;




const getUserRanking = asyncHandler(async(req,res) => {

        const {userId,directorId} = req.params;
        if (!userId || !directorId) {
            return res.status(400).json({message: "Invalid Id Credentials"})
        }
        try{
        const ranking = await UserRanking.findOne({userId,directorId})
        if (!ranking){ 
             return res.status(404).json({ message: 'Ranking not found' });
        }
        res.status(200).json({message:"Rankings Found",ranking})
    }
    catch(error){
        console.error(`Error in getUserRanking:${error.message}`)
        res.status(500).json({message: "Internal Server Error"})
    }
})
//  const addUserRanking = asyncHandler(async(req, res) => {
//   const { userId, directorId } = req.params;
//   const {  name, films, bio } = req.body;

//   if (!films || !Array.isArray(films)) {
//     return res.status(400).json({ message: 'Films array is required' });
//   }
//   try{
//   const resp = await axios.get(
//     `https://api.themoviedb.org/3/person/${directorId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${TMDB_KEY}`
//         }
//       }
//   );

//   const name = resp.data?.name;
//   if(!name){
//     return res.status(500).json({message: "Unable to Fetch Director Name"})
//   }

//   const ranking = await UserRanking.findOneAndUpdate(
//     { userId, directorId },
//     { name,films,bio }, 
//     { new: true, upsert: true }
//   );

//   for (const film of films) {
//       await DiaryEntry.updateOne(
//         { user: userId, movieId: film.tmdbId },
//         { $set: { directorId } }
//       );
//     }

//   res.status(200).json({message: "Ranking are:" ,ranking})
// }
// catch (error) {
//     if (error.response) {

//         console.error("TMDB Error Data:", error.response.data);
//         console.error("TMDB Error Status:", error.response.status);
//     }
//     console.error(`Error in addUserRanking: ${error.message}`);
//     res.status(500).json({ message: "Internal Server Error" });
// }
// });

const addUserRanking = asyncHandler(async (req, res) => {
  const { userId, directorId } = req.params;
  const { films, bio } = req.body; 

  if (!films || !Array.isArray(films)) {
    return res.status(400).json({ message: 'Films array is required' });
  }

  try {
    const TMDB_KEY = process.env.TMDB_API_KEY;
    const resp = await axios.get(
      `https://api.themoviedb.org/3/person/${directorId}?api_key=${TMDB_KEY}`
     );

    const directorName = resp.data?.name; 
    if (!directorName) {
      return res.status(500).json({ message: "Unable to Fetch Director Name" });
    }

    const ranking = await UserRanking.findOneAndUpdate(
      { userId, directorId },
      { name: directorName, films, bio }, 
      { new: true, upsert: true }
    );

    for (const film of films) {
      await DiaryEntry.updateOne(
        { user: userId, movieId: film.tmdbId },
        { $set: { directorId } }
      );
    }

    res.status(200).json({ message: "Ranking updated successfully", ranking });

  } catch (error) {
    if (error.response) {
      console.error("TMDB Error Status:", error.response.status);
      console.error("TMDB Error Data:", error.response.data);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = {getUserRanking,addUserRanking}
