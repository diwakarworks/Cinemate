import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import Image from "../image/letterboxd.png";

const Navbar = () => {
    const [id,setId] = useState(); 
    const [userId, setUserId] = useState(null);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query) {
            navigate(`/search?query=${query}`);
            setQuery('');
            setIsOpen(false);
        }
    };

    const handleClose = () => {
        setQuery('');
        setIsOpen(false);
    };

    return (
        <nav className="bg-stone-800 p-4 flex items-center justify-around">
            <h1 className=" text-white ml-4 font-mono -mt-2 text-3xl">
                <img className="absolute mt-3 -ml-10" src={Image} alt="Cinemate" width="50" height="10" />
               <p onClick={()=> navigate('/')} className="ml-4 cursor-pointer"> Cinemate </p>
            </h1>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-white mr-8">
                    <FaSearch size={24} />
                </button>
                {isOpen && (
                    <form onSubmit={handleSearch} className="absolute -mt-11  bg-white p-2 rounded-full shadow-lg flex items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="p-2 border rounded-full"
                        />
                        <button type="button" onClick={handleSearch} className="  bg-white text-gray-400 p-2 rounded-r">
                            <FaSearch />
                        </button>
                        <button type="button" onClick={handleClose} className="bg-white text-gray-400 p-2 rounded-full ml-2">
                            <FaTimes />
                        </button>
                    </form>
                )}
            </div>
            <Link to="/" className="text-gray-400 text-lg ml-20 font-bold">FILMS</Link>
            <Link to="/reviews" className="text-gray-400 text-lg font-bold">REVIEWS</Link>
            <Link to="/movies" className="text-gray-400 text-lg font-bold">LISTS</Link>
            <Link className="text-gray-400 text-lg font-bold" to="/watchlist">WATCHLIST</Link>
            <Link className="text-gray-400 text-lg font-bold" to="/stats">STATS</Link>
            <Link className="text-gray-400 text-lg font-bold" to="/profile">PROFILE</Link>
            <Link className="text-gray-400 text-lg  font-bold" to="/advanced-search"> SEARCH</Link>
            <Link className="text-gray-400 text-lg  font-bold" to="/login"> LOGIN</Link>
            <Link className="text-gray-400 text-lg  font-bold" to="/popular"> PEOPLE</Link>
            <Link className="text-gray-400 text-lg font-bold" to="/studios">STUDIOS</Link>
            {userId && (
                <>
                    <Link className="text-gray-400 text-lg  font-bold" to={`/diary/${userId}`}> DIARY </Link>
                    <Link className="text-gray-400 text-lg  font-bold" to={`profile/${userId}`}> LISTS</Link>
                </>
            )}
            
        </nav>
    );
};

export default Navbar;
