import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Eye, Trash2 } from 'lucide-react';
import { itemsService } from '../services/items';
import { formatDateShort, formatStatus, getStatusColor } from '../utils/formatters';
import { ITEM_STATUS } from '../utils/constants';
import Loading from '../components/common/Loading';

const MyRequests = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter(item => item.status === statusFilter));
    }
  }, [statusFilter, items]);

  const fetchItems = async () => {
    try {
      const response = await itemsService.getUserItems();
      setItems(response.items || []);
      setFilteredItems(response.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsService.deleteItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
        <Link to="/submit" className="btn-primary">
          Submit New Item
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="all">All Status</option>
            <option value={ITEM_STATUS.PENDING}>Pending</option>
            <option value={ITEM_STATUS.MATCHED}>Matched</option>
            <option value={ITEM_STATUS.CLAIMED}>Claimed</option>
            <option value={ITEM_STATUS.RESOLVED}>Resolved</option>
          </select>
          <span className="text-gray-600">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Items Table */}
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          {error}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{item.location}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDateShort(item.date)}</td>
                    <td className="px-6 py-4">
                      <span className={`${getStatusColor(item.status)} text-xs`}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/items/${item.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-2">No items found</p>
          <p className="text-gray-500 mb-4">You haven't submitted any items yet</p>
          <Link to="/submit" className="btn-primary inline-block">
            Submit Your First Item
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyRequests;