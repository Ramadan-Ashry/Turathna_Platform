import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { TokenContext } from "../../Context/TokenContext";

export default function EngagementSummary() {
  const { token } = useContext(TokenContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [engagementData, setEngagementData] = useState(null);

  useEffect(() => {
    const fetchEngagementSummary = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://ourheritage.runasp.net/api/Statistics/engagement-summary', {
          method: 'GET',
          headers: {
            'Accept': '*/*',
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();
        if (result.isSucceeded) {
          setEngagementData(result.model);
        } else {
          setError(result.message || 'Failed to fetch engagement summary.');
        }
      } catch (err) {
        setError('An error occurred while fetching the engagement summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementSummary();
  }, [token]);

  const chartData = engagementData
    ? [
        { name: 'Article Likes', value: engagementData.averageArticleLikes },
        { name: 'Article Comments', value: engagementData.averageArticleComments },
        { name: 'HandiCraft Favorites', value: engagementData.averageHandiCraftFavorites },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#fefaf4] p-6 md:p-10">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#5e3c23]">Engagement Summary</h2>
        <Link
          to="/dashboard"
          className="bg-[#b08968] text-white px-4 py-2 rounded hover:bg-[#a1724e]"
        >
          Back to Dashboard
        </Link>
      </div>

      {loading && <div className="text-[#5e3c23]">Loading...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      {engagementData && (
        <div className="space-y-8">
          {/* Averages + Chart */}
          <div className="bg-white rounded-xl shadow p-6 border border-[#e0c9b9]">
            <h3 className="text-lg font-semibold text-[#5e3c23] mb-4">Average Engagement Metrics</h3>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              <div className="bg-[#f5eee6] p-4 rounded-lg">
                <h4 className="text-[#6e4c2f]">Article Likes</h4>
                <p className="text-xl font-bold text-[#9c6644]">{engagementData.averageArticleLikes.toFixed(2)}</p>
              </div>
              <div className="bg-[#f5eee6] p-4 rounded-lg">
                <h4 className="text-[#6e4c2f]">Article Comments</h4>
                <p className="text-xl font-bold text-[#52796f]">{engagementData.averageArticleComments.toFixed(2)}</p>
              </div>
              <div className="bg-[#f5eee6] p-4 rounded-lg">
                <h4 className="text-[#6e4c2f]">HandiCraft Favorites</h4>
                <p className="text-xl font-bold text-[#a44a3f]">{engagementData.averageHandiCraftFavorites.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-md font-semibold text-[#5e3c23] mb-4">Engagement Overview</h4>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#b08968" barSize={35} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Details Cards in Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Most Liked Article */}
            <div className="bg-white rounded-xl shadow p-6 border border-[#e0c9b9]">
              <h3 className="text-xl text-center font-semibold text-[#5e3c23] mb-4">Most Liked Article</h3>
              <div className="text-left" >
              <p><strong>Title:</strong> {engagementData.mostLikedArticle.title}</p>
              <p><strong>Likes:</strong> {engagementData.mostLikedArticle.likes.length}</p>
              <p><strong>Date:</strong> {new Date(engagementData.mostLikedArticle.dateCreated).toLocaleDateString()}</p>
              <p><strong>Content:</strong> {engagementData.mostLikedArticle.content.slice(0, 450)}</p>
              </div>
              {engagementData.mostLikedArticle.imageURL?.[0] && (
                <img
                  src={engagementData.mostLikedArticle.imageURL[0].replace(/^"|"$/g, '')}
                  alt={engagementData.mostLikedArticle.title}
                  className="w-full h-48 object-cover rounded mt-12"
                />
              )}
            </div>

            {/* Most Commented Article */}
            <div className="bg-white rounded-xl shadow p-6 border border-[#e0c9b9]">
              <h3 className="text-xl text-center font-semibold text-[#5e3c23] mb-4">Most Commented Article</h3>
              <div className="text-left" >
              <p><strong>Title:</strong> {engagementData.mostCommentedArticle.title}</p>
              <p><strong>Comments:</strong> {engagementData.mostCommentedArticle.comments.length}</p>
              <p><strong>Date:</strong> {new Date(engagementData.mostCommentedArticle.dateCreated).toLocaleDateString()}</p>
              <p><strong>Content:</strong> {engagementData.mostCommentedArticle.content.slice(0, 450)}</p>
              </div>
              {engagementData.mostCommentedArticle.imageURL?.[0] && (
                <img
                  src={engagementData.mostCommentedArticle.imageURL[0].replace(/^"|"$/g, '')}
                  alt={engagementData.mostCommentedArticle.title}
                  className="w-full h-48 object-cover rounded mt-12"
                />
              )}
            </div>

            {/* Most Favorited HandiCraft */}
            <div className="bg-white rounded-xl  shadow p-6 border border-[#e0c9b9] md:col-span-1 ">
              <h3 className="text-xl text-center font-semibold text-[#5e3c23] mb-4">Most Favorited HandiCraft</h3>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 ">
                <div className="text-left">
                  <p><strong>Title:</strong> {engagementData.mostFavoritedHandiCraft.title}</p>
                  <p><strong>Favorites:</strong> {engagementData.mostFavoritedHandiCraft.favorite.length}</p>
                  <p><strong>Price:</strong> ${engagementData.mostFavoritedHandiCraft.price}</p>
                  <p><strong>Date Added:</strong> {new Date(engagementData.mostFavoritedHandiCraft.dateAdded).toLocaleDateString()}</p>
                  <p>{engagementData.mostFavoritedHandiCraft.description.slice(0, 450)}<strong>:Description</strong> </p>
                </div>
                {engagementData.mostFavoritedHandiCraft.imageOrVideo?.[0] && (
                  <img
                    src={engagementData.mostFavoritedHandiCraft.imageOrVideo[0]}
                    alt={engagementData.mostFavoritedHandiCraft.title}
                    className="w-full h-48 object-cover rounded mt-2"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
