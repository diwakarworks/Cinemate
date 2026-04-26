import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BiArrowBack } from 'react-icons/bi';

const API_URL = 'http://localhost:5002';

const ListView = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!name.trim()) {
            setError('List name is required');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/api/lists/${userId}`, {
                name,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newList = response.data;
            navigate(`/user/${userId}/lists/${newList._id}`);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }   
    };
    const handleHome = () => {
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-stone-900 text-white px-6 py-12">
            <div className="max-w-xl mx-auto">
                <div className="flex items-left">
                    <BiArrowBack className="absolute  w-10 h-10 cursor-pointer  ml-2 text-white hover:text-blue-500" onClick={handleHome} />
                </div>

                <h1 className="text-3xl ml-20 font-bold mb-6"> New  List</h1>
                <hr className="border-gray-700 mt-10 mb-10" />

                <form onSubmit={handleCreate} className="space-y-6 bg-stone-800 p-6 rounded-xl shadow-md">
                    <div>
                        <label className="block text-sm font-medium mb-1">List Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 rounded bg-stone-700 text-black border border-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-2 rounded bg-stone-700 text-black border border-stone-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 mt-10 px-6 py-2 rounded-lg font-semibold transition duration-150"
                        >
                            {loading ? 'Creating...' : 'Create List'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ListView;
