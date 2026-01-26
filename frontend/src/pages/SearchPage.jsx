import React, { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Tag, Clock, Calendar } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, ITEM_TYPES, SORT_OPTIONS } from '../utils/constants';
import { getRelativeTime, formatStatus, getStatusColor } from '../utils/formatters';
import Loading from '../components/common/Loading';
import { Link } from 'react-router-dom';

const SearchPage = () => {
  const [filters, setFilters] = useState({
    query: '',
    category: '',
    location: '',
    type: '',
    startDate: '',
    endDate: '',
    sort: 'recent',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { items, loading, error, pagination, search } = useSearch();

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    search(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      type: '',
      startDate: '',
      endDate: '',
      sort: 'recent',
    });
    search({});
  };

  const handlePageChange = (page) => {
    search({ ...filters, page });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Items</h1>
        <p className="text-gray-600">Find lost or found items on campus</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="query"
              value={filters.query}
              onChange={handleFilterChange}
              placeholder="Search by keyword, description, or location..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Categories</option>
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Locations</option>
                  {CAMPUS_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  <option value="">All Types</option>
                  <option value={ITEM_TYPES.LOST}>Lost</option>
                  <option value={ITEM_TYPES.FOUND}>Found</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  name="sort"
                  value={filters.sort}
                  onChange={handleFilterChange}
                  className="input-field"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Search size={18} />
            <span>{loading ? 'Searching...' : 'Search'}</span>
          </button>
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2"
          >
            <X size={18} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.category || filters.location || filters.type) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.category && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Category: {filters.category}
              <button
                onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                className="hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Location: {filters.location}
              <button
                onClick={() => setFilters(prev => ({ ...prev, location: '' }))}
                className="hover:text-green-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              Type: {filters.type}
              <button
                onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
                className="hover:text-purple-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="mb-4 text-gray-600">
            Found {pagination.total} item{pagination.total !== 1 ? 's' : ''}
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg ${
                    page === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No items found</p>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      )}
    </div>
  );
};

const ItemCard = ({ item }) => (
  <Link
    to={`/items/${item.id}`}
    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
  >
    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      ) : (
        <div className="text-6xl">📦</div>
      )}
      <div className={`absolute top-3 right-3 ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
        {item.type.toUpperCase()}
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-semibold text-lg text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
        {item.title}
      </h3>
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Tag size={14} className="flex-shrink-0" />
          <span>{item.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="flex-shrink-0" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="flex-shrink-0" />
          <span>{getRelativeTime(item.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`${getStatusColor(item.status)} text-xs`}>
          {formatStatus(item.status)}
        </span>
        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
          View Details →
        </button>
      </div>
    </div>
  </Link>
);

export default SearchPage;