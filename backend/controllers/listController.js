const asyncHandler = require('express-async-handler')
const List = require('../models/List');
const axios = require('axios');

    
const  getUserLists = asyncHandler(async(req,res)=> {
    const {userId} = req.params;
    try{
        const list = await List.find()
        .populate("user", "username profilePic")
        .sort({updatedAt: -1})
        return res.status(200).json(list);
    }
    catch(error){
        console.error(`Error getting user List:${error.message}`)
        return res.status(500).json({message: 'Internal Server Error'})
    }
})


const getListById = asyncHandler(async(req,res)=> {
    const {listId} = req.params;
    try{
        const list = await List.findById(listId)
        if(!list){
            return res.status(404).json({message: "List Id Not Found"})
        }
         return res.status(200).json(list)
    }
     catch(error){
        console.error(`Error getting user List:${error.message}`)
        return res.status(500).json({message: 'Internal Server Error'})
    }
})

const createList = asyncHandler(async(req, res) => {

    try {
        const { name, description} = req.body;
        const {userId} = req.params;
        
        if (!name ) {
            return res.status(400).json({ message: 'Name is required' });
        }


        const newList = new List({
            name,
            description: description || '',
            user:userId,
            movies: []
        });

        const savedList = await newList.save();
        return res.status(201).json(savedList);
    } catch (error) {
        console.error(`Error creating the list :${error.message}`)
        return res.status(500).json({ message: error.message });
    }
});


const updateList = asyncHandler(async (req, res) => {
  const { listId } = req.params;
  const { name, description } = req.body;

  try {
    const updatedList = await List.findByIdAndUpdate(
      listId,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedList) {
      return res.status(404).json({ message: 'List not found' });
    }

    return res.status(200).json(updatedList);
  } catch (err) {
    console.error('Error updating list:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const deleteList = asyncHandler(async(req,res)=> {
    const{listId} = req.params;
    try{
        const list = await List.findByIdAndDelete(listId);
        return res.status(200).json({message: 'List Deleted Successfully',list})
    }
    catch (err) {
    console.error('Error updating list:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
})

const addMovieToList = asyncHandler(async (req, res) => {
    const {listId} = req.params
    try {
        const { tmdbId, title, year, posterPath, position } = req.body;
        
        if (!tmdbId || !title) {
            return res.status(400).json({ message: 'TMDB ID and title are required' });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        
        const existingMovie = list.movies.find(movie => movie.tmdbId === parseInt(tmdbId));
        if (existingMovie) {
            return res.status(400).json({ message: 'Movie already exists in this list' });
        }

         const creditsResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${process.env.TMDB_API_KEY}`
        );

        
        
        const director = creditsResponse.data.crew.find(person => person.job === "Director");
        const directorName = director ? director.name : "";

        

        const movieData = {
            tmdbId: parseInt(tmdbId),
            title,
            year: year || '',
            director: director ? director.name : "",
            posterPath: posterPath || '',
            position: position || list.movies.length + 1
        };
        
        list.movies.push(movieData);
        const updatedList = await list.save();
        return res.status(200).json(updatedList);
    } catch (error) {
        console.error(`Error adding movie to list:${error.message}`)
        res.status(500).json({ message: error.message });
    }
});


const removeMovieFromList = asyncHandler(async (req, res) => {
    const {listId,tmdbId} = req.params;
    try {
        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const movieIndex = list.movies.findIndex(movie => movie.tmdbId === parseInt(tmdbId));
        if (movieIndex === -1) {
            return res.status(404).json({ message: 'Movie not found in list' });
        }

        list.movies.splice(movieIndex, 1);
        

        list.movies.forEach((movie, index) => {
            movie.position = index + 1;
        });

        const updatedList = await list.save();
        return res.status(200).json({message: "Deleted Successfully",updatedList});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateMoviePosition = asyncHandler(async (req, res) => {
    const {listId,tmdbId} = req.params;
    try {
        const { position } = req.body;
        
        if (!position || position < 1) {
            return res.status(400).json({ message: 'Valid position is required' });
        }

        const list = await List.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        const movieIndex = list.movies.findIndex(movie => movie.tmdbId === parseInt(tmdbId));
        if (movieIndex === -1) {
            return res.status(404).json({ message: 'Movie not found in list' });
        }

   
        const [movie] = list.movies.splice(movieIndex, 1);
        
      
        const newIndex = Math.min(position - 1, list.movies.length);
        list.movies.splice(newIndex, 0, movie);
        
   
        list.movies.forEach((movie, index) => {
            movie.position = index + 1;
        });

        const updatedList = await list.save();
        return res.status(200).json(updatedList);
    } catch (error) {
        console.error(`Error:${error.message}`)
        res.status(500).json({ message: error.message });
    }
});

// ✅ paste these ABOVE module.exports

const addSeriesToList = asyncHandler(async (req, res) => {
    const { listId } = req.params;
    try {
        const { tmdbId, title, year, posterPath, position } = req.body;

        if (!tmdbId || !title) {
            return res.status(400).json({ message: 'TMDB ID and title are required' });
        }

        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const existing = list.series.find(s => s.tmdbId === parseInt(tmdbId));
        if (existing) {
            return res.status(400).json({ message: 'Series already exists in this list' });
        }

        const detailRes = await axios.get(
            `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${process.env.TMDB_API_KEY}`
        );

        list.series.push({
            tmdbId: parseInt(tmdbId),
            title,
            year: year || '',
            posterPath: posterPath || '',
            seasons: detailRes.data.number_of_seasons || 0,
            position: position || list.series.length + 1
        });

        const updatedList = await list.save();
        return res.status(200).json(updatedList);
    } catch (error) {
        console.error(`Error adding series to list: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

const removeSeriesFromList = asyncHandler(async (req, res) => {
    const { listId, tmdbId } = req.params;
    try {
        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const index = list.series.findIndex(s => s.tmdbId === parseInt(tmdbId));
        if (index === -1) {
            return res.status(404).json({ message: 'Series not found in list' });
        }

        list.series.splice(index, 1);
        list.series.forEach((s, i) => { s.position = i + 1; });

        const updatedList = await list.save();
        return res.status(200).json({ message: 'Deleted Successfully', updatedList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const updateSeriesPosition = asyncHandler(async (req, res) => {
    const { listId, tmdbId } = req.params;
    try {
        const { position } = req.body;

        if (!position || position < 1) {
            return res.status(400).json({ message: 'Valid position is required' });
        }

        const list = await List.findById(listId);
        if (!list) return res.status(404).json({ message: 'List not found' });

        const index = list.series.findIndex(s => s.tmdbId === parseInt(tmdbId));
        if (index === -1) {
            return res.status(404).json({ message: 'Series not found in list' });
        }

        const [series] = list.series.splice(index, 1);
        const newIndex = Math.min(position - 1, list.series.length);
        list.series.splice(newIndex, 0, series);

        list.series.forEach((s, i) => { s.position = i + 1; });

        const updatedList = await list.save();
        return res.status(200).json(updatedList);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});


module.exports = {getUserLists,getListById,createList,deleteList,updateList,addMovieToList,removeMovieFromList,updateMoviePosition,addSeriesToList,removeSeriesFromList,updateSeriesPosition}