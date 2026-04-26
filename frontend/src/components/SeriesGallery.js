import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const SeriesGallery = () => {
  const { id: seriesId } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('backdrops');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [seriesRes, imagesRes, videosRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/tv/${seriesId}/images?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/tv/${seriesId}/videos?language=en-US&api_key=${API_KEY}`)
        ]);

        const [seriesData, imagesData, videosData] = await Promise.all([
          seriesRes.json(),
          imagesRes.json(),
          videosRes.json()
        ]);

        setSeriesDetails(seriesData);
        setImages(imagesData);
        setVideos(videosData.results || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId]);

  const handleImageClick = (image, index) => {
    setSelectedImage({ ...image, index });
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  const navigateImage = (direction) => {
    const currentImages = getCurrentImages();
    const currentIndex = selectedImage.index;
    let newIndex;

    if (direction === 'next') {
      newIndex = currentIndex + 1 >= currentImages.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? currentImages.length - 1 : currentIndex - 1;
    }

    setSelectedImage({ ...currentImages[newIndex], index: newIndex });
  };

  const getCurrentImages = () => {
    switch (activeTab) {
      case 'backdrops':
        return images.backdrops || [];
      case 'posters':
        return images.posters || [];
      case 'logos':
        return images.logos || [];
      default:
        return [];
    }
  };

  const getGridClass = () => {
    switch (activeTab) {
      case 'backdrops':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 'posters':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      case 'logos':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 'videos':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getAspectRatio = () => {
    switch (activeTab) {
      case 'posters':
        return 'aspect-[2/3]';
      case 'logos':
        return 'aspect-[16/9]';
      case 'videos':
        return 'aspect-video';
      default:
        return 'aspect-video';
    }
  };

  const getVideoThumbnail = (video) => {
    if (video.site === 'YouTube') {
      return `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
    }
    return null;
  };

  const getVideoUrl = (video) => {
    if (video.site === 'YouTube') {
      return `https://www.youtube.com/embed/${video.key}?autoplay=1`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading gallery...</div>
      </div>
    );
  }

  const backdrops = images.backdrops || [];
  const posters = images.posters || [];
  const logos = images.logos || [];
  const currentImages = getCurrentImages();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="relative top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/show/${seriesId}`)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('backdrops')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'backdrops'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Backdrops ({backdrops.length})
              </button>
              <button
                onClick={() => setActiveTab('posters')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'posters'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Posters ({posters.length})
              </button>
              <button
                onClick={() => setActiveTab('logos')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'logos'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Logos ({logos.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'videos'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Videos ({videos.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'videos' ? (
          // Videos Grid
          videos.length > 0 ? (
            <div className={`grid gap-4 ${getGridClass()}`}>
              {videos.map((video, index) => (
                <div
                  key={video.id || index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className={`${getAspectRatio()} relative bg-gray-800`}>
                    {getVideoThumbnail(video) ? (
                      <img
                        src={getVideoThumbnail(video)}
                        alt={video.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 000-5H9v5zm0 0H7.5a2.5 2.5 0 000 5H9v-5z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{video.name}</h3>
                      <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                          {video.site}
                        </span>
                        <span>{video.type}</span>
                        {video.size && <span>• {video.size}p</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-2">No videos available</div>
              <p className="text-gray-400">No trailers or videos found for this series</p>
            </div>
          )
        ) : (
          // Images Grid
          currentImages.length > 0 ? (
            <div className={`grid gap-4 ${getGridClass()}`}>
              {currentImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={() => handleImageClick(image, index)}
                >
                  <div className={`${getAspectRatio()} relative ${activeTab === 'logos' ? 'bg-white/10' : ''}`}>
                    <img
                      src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                      alt={`${activeTab} ${index + 1}`}
                      className={`w-full h-full ${activeTab === 'logos' ? 'object-contain p-4' : 'object-cover'} group-hover:scale-105 transition-transform duration-300`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    
                    {/* Image info overlay */}
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-white text-xs bg-black/70 px-2 py-1 rounded">
                        {image.width} × {image.height}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-gray-500 text-xl mb-2">No {activeTab} available</div>
              <p className="text-gray-400">Try switching to another tab</p>
            </div>
          )
        )}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Main Image */}
          <div className={`relative bg-black w-full h-screen flex items-center justify-center p-4 ${activeTab === 'logos' ? 'bg-white/5 rounded-lg' : ''}`}>
            <img
              src={`https://image.tmdb.org/t/p/original${selectedImage.file_path}`}
              alt="Full size view"
              className={`max-w-full max-h-full ${activeTab === 'logos' ? 'object-contain' : 'object-contain'}`}
            />
            
            {/* Image Info */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
              <div className="text-sm">
                {selectedImage.index + 1} of {currentImages.length}
              </div>
              <div className="text-xs text-gray-300">
                {selectedImage.width} × {selectedImage.height} • 
                {selectedImage.vote_average > 0 && ` ★ ${selectedImage.vote_average.toFixed(1)}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full max-w-4xl">
            {getVideoUrl(selectedVideo) ? (
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getVideoUrl(selectedVideo)}
                  title={selectedVideo.name}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="text-white text-xl mb-4">Video not available</div>
                <div className="text-gray-400">This video cannot be played in the embedded player</div>
              </div>
            )}
            
            {/* Video Info */}
            <div className="mt-4 text-white">
              <h2 className="text-xl font-semibold mb-2">{selectedVideo.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                  {selectedVideo.site}
                </span>
                <span>{selectedVideo.type}</span>
                {selectedVideo.size && <span>• {selectedVideo.size}p</span>}
                {selectedVideo.published_at && (
                  <span>• {new Date(selectedVideo.published_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesGallery;
