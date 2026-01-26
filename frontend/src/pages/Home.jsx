import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, TrendingUp, CheckCircle, Users, Clock, MapPin, Tag, ArrowRight } from 'lucide-react';
import { itemsService } from '../services/items';
import { getRelativeTime, formatStatus, getStatusColor } from '../utils/formatters';
import Loading from '../components/common/Loading';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    itemsReturned: 0,
    successRate: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent items
      const itemsResponse = await itemsService.searchItems({ limit: 8, sort: 'recent' });
      setRecentItems(itemsResponse.items || []);

      // Fetch stats (these would come from a stats API endpoint)
      setStats({
        totalItems: 1234,
        itemsReturned: 892,
        successRate: 72,
        activeUsers: 3456,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const ItemCard = ({ item }) => (
    <Link
      to={`/items/${item.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
    >
      <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-5xl">📦</div>
        )}
        <div className={`absolute top-3 right-3 ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
          {item.type.toUpperCase()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Tag size={14} />
            <span>{item.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{getRelativeTime(item.createdAt)}</span>
          </div>
        </div>
        <div className="mt-3">
          <span className={`${getStatusColor(item.status)} text-xs`}>
            {formatStatus(item.status)}
          </span>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Lost & Found Tracking System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              AI-Powered Item Recovery for Campus Community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                <Search size={24} />
                <span>Search Items</span>
              </Link>
              <Link
                to="/submit"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-400 transition-colors text-lg"
              >
                <Plus size={24} />
                <span>Report Item</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-3">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalItems.toLocaleString()}
              </div>
              <div className="text-gray-600">Items Registered</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-3">
                <CheckCircle className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.itemsReturned.toLocaleString()}
              </div>
              <div className="text-gray-600">Items Returned</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-full mb-3">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.successRate}%
              </div>
              <div className="text-gray-600">Success Rate</div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-600 rounded-full mb-3">
                <Users className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {stats.activeUsers.toLocaleString()}
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Recent Items</h2>
          <Link
            to="/search"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>View All</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {recentItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No items found yet. Be the first to report!</p>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Plus className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                1. Report Item
              </h3>
              <p className="text-gray-600">
                Submit details about your lost or found item with photos and location
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Search className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                2. AI Matching
              </h3>
              <p className="text-gray-600">
                Our AI automatically finds potential matches and notifies you
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <CheckCircle className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                3. Claim & Recover
              </h3>
              <p className="text-gray-600">
                Verify ownership and arrange pickup to get your item back
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lost Something? We Can Help!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have successfully recovered their items
          </p>
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            <Plus size={24} />
            <span>Report Your Item Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;