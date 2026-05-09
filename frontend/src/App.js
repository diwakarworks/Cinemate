import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Movie from './components/Movie';
import SearchResults from './pages/SearchResults';
import MovieReviews from './pages/MovieReviews';
import MoviesCard from './components/MoviesCard';
import MovieDetails from './pages/MovieDetails';
import ShowDetails from './pages/ShowDetails';
import Watchlist from './components/Watchlist';
import Stats from './components/Stats';
import Profile from './pages/Profile';
import AdvancedSearch from './components/AdvancedSearch';
import Login from './pages/LoginPage';
import Review from './components/Review';
import Diary from "./pages/Diary";
import DiaryEntry from './pages/DiaryEntry';
import UserReviews from './pages/UserReviews';
import ShowCard from './components/ShowCard';
import DirectorDetails from './pages/DirectorDetails';
import ReviewPage from './pages/ReviewPage';
import TVReview from './pages/TVReview';
import ShowCreatorDetails from './pages/ShowCreatorDetails';
import RankedFilmography from './pages/RankedFilmography';
import ListsPage from './pages/Lists';
import CreateListPage from './pages/CreateList';
import ListViewPage from './pages/ListView';
import ListPosters from './pages/ListPosters';
import PersonDetails from './pages/PersonDetails';
import WatchedPage from './pages/WatchedPage';
import AddDiaryEntry from "./pages/AddDiaryEntry";
import NotFoundTitle from './pages/NotFound';
import PopularPeople from './pages/PopularPage';
import Keywords from './pages/Keywords';
import KeywordsShows from "./pages/KeywordsShows";
import MovieGallery from './components/Gallery';
import SeriesGallery from './components/SeriesGallery';
import CompanyExplorer from './components/companyExplorer';
import StudiosPage from "./pages/StudioPages";
import MovieListWithOTT from './pages/MovieslistwithOTT';
import GenrePage from './pages/Genrepage';
import TVSeasons from './pages/TVSeason';
import SeasonDetails from './pages/SeasonDetails';
import TVProviders from './pages/TVProviders';
import MovieProvidersAndProduction from './pages/MovieProvidersAndProduction';
import NetworkShows from './pages/NetworkShow';
import UpcomingMovies from './pages/Upcoming';
import Collection from './pages/Collection';
import PersonImages from './pages/PersonImages';
import AISearch from './pages/AISearch';




const App = () => {
  const [currentUserId, setCurrentUserId] = useState();
  const location = useLocation();
  const showNavbar = location.pathname !== '/login';

  return (
    <div className='bg-gray-900'>
      {showNavbar && <Navbar userId={currentUserId} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movie />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/reviews" element={<MovieReviews />} />
        <Route path="/review/:reviewId" element={<ReviewPage />} />
        <Route path="/cards" element={<MoviesCard />} />
        <Route path="/shows" element={<ShowCard />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/show/:id" element={<ShowDetails />} />
        <Route path="/show-creator/:creatorId" element={<ShowCreatorDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/tv/:id/review/:reviewId" element={<TVReview />} />
        <Route path="/director/:id" element={<DirectorDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/advanced-search" element={<AdvancedSearch />} />
        <Route path="/login" element={<Login />} />
        <Route path="/diary/:userId" element={<Diary />} />
        <Route path="/diary/:userId/entries" element={<Review />} />
        <Route path="/diary/:userId/entries/:entryId" element={<DiaryEntry />} />
        <Route path="/userreviews" element={<UserReviews />} />
        <Route path="/ranked/:userId/:directorId" element={<RankedFilmography />} />
        <Route path="/user/:userId" element={<ListsPage />} />
        <Route path="/user/:userId/lists/create" element={<CreateListPage />} />
        <Route path="/user/:userId/lists/:listId" element={<CreateListPage />} />
        <Route path="profile/:userId" element={<ListViewPage />} />
        <Route path="/user/:userId/lists/:listId/posters" element={<ListPosters />} />
        <Route path="/person/:id" element={<PersonDetails />} />
        <Route path="/diary/:userId/watched" element={<WatchedPage />} />
        <Route path="/adddiaryentry" element={<AddDiaryEntry />} />
        <Route path="/popular" element={<PopularPeople />} />
        <Route path="/keyword/:tagdata/movie" element={<Keywords />} />
        <Route path="/keyword/:tagdata/tv" element={<KeywordsShows />} />
        <Route path="/movie/:id/gallery" element={<MovieGallery />} />
        <Route path="/series/:id/gallery" element={<SeriesGallery />} />
        <Route path="/company/:id" element={<CompanyExplorer/>} />
        <Route path="/studios" element={<StudiosPage />} />
        <Route path="/ott" element={<MovieListWithOTT />} />
        <Route path="/genre/:genreIdName/:type" element={<GenrePage />} />
        <Route path="/tv/:id/seasons" element={<TVSeasons />} />
        <Route path="/tv/:id/season/:seasonNumber" element={<SeasonDetails />} />
        <Route path = "/tv/providers" element={<TVProviders />} />
        <Route path="/movie/:id/providers" element={<MovieProvidersAndProduction />} />
        <Route path="/network/:id" element={<NetworkShows />} />
        <Route path="upcoming" element={<UpcomingMovies />} />
        <Route path="*" element={<NotFoundTitle />} />
        <Route path="/collection/:id" element={<Collection/>} />
        <Route path='/ai/search' element={<AISearch />} />
        <Route path='/person/:id/images' element={<PersonImages />} />
      </Routes>
    </div>
  );
};


const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
