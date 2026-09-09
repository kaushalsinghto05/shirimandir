import React, { useState } from 'react';
import { Heart, BadgeCheck, MapPin } from 'lucide-react';
import { SANATAN_WALL_POSTS } from '../data/mockData';

const FILTERS = ["All", "Photos", "Experiences", "Temple Reviews"];

export default function SanatanWallSection({ onShareExperience }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [likedPosts, setLikedPosts] = useState(new Set());

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const filteredPosts = SANATAN_WALL_POSTS?.filter(post => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Photos") return !!post.image;
    if (activeFilter === "Experiences") return post.type === "experience";
    if (activeFilter === "Temple Reviews") return post.type === "review";
    return true;
  }) || [];

  return (
    <section className="py-16 lg:py-24 bg-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display text-charcoal-900 mb-4 animate-fade-in-up">
            Sanatan Wall — Community of Devotees
          </h2>
          <p className="text-charcoal-700 font-sans max-w-2xl mx-auto">
            Read inspiring experiences, see beautiful darshan photos, and connect with devotees from across the world.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full font-sans transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-copper-400 text-white shadow-warm'
                  : 'bg-ivory-100 text-charcoal-700 hover:bg-copper-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="break-inside-avoid bg-ivory-100 rounded-2xl shadow-warm mb-6 p-5 hover:-translate-y-0.5 hover:shadow-warm-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=C17F59&color=fff`}
                  alt={post.author?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-sans font-medium text-charcoal-900 truncate">
                      {post.author?.name}
                    </h3>
                    {post.author?.verified && (
                      <BadgeCheck className="w-4 h-4 text-sage-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center text-xs text-charcoal-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {post.author?.city}
                  </div>
                </div>
              </div>

              {post.templeName && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-copper-100 text-copper-600 rounded-full text-xs font-medium font-sans">
                    {post.templeName}
                  </span>
                </div>
              )}

              <p className="text-charcoal-700 font-sans text-sm mb-4 leading-relaxed">
                {post.content}
              </p>

              {post.image && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img
                    src={post.image}
                    alt="Devotee experience"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-ivory-200">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1.5 text-sm font-sans transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-copper-400/50 rounded-lg p-1"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      likedPosts.has(post.id) ? 'fill-vermilion-500 text-vermilion-500' : 'text-charcoal-500'
                    }`}
                  />
                  <span className={likedPosts.has(post.id) ? 'text-vermilion-500' : 'text-charcoal-500'}>
                    {(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                  </span>
                </button>
                <span className="text-xs text-charcoal-500 font-sans">
                  {post.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onShareExperience}
            className="px-8 py-3 rounded-xl font-sans font-medium text-copper-500 border-2 border-copper-400 hover:bg-copper-400 hover:text-white transition-all duration-300 shadow-warm hover:-translate-y-0.5 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2"
          >
            Share Your Experience
          </button>
        </div>
      </div>
    </section>
  );
}
