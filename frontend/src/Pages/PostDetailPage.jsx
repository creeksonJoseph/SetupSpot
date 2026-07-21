import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Plus,
  ShoppingBag,
  X,
  Loader2,
  Save,
} from "lucide-react";

// --- MOCK API RESPONSE STRUCTURE (Based on resources.py serialization) ---
// We simulate fetching this data, where 'x' and 'y' are the percentage coordinates.
const MOCK_API_DATA = {
  id: 1,
  name: "Minimal Developer Setup",
  image_url:
    "https://placehold.co/1200x675/0a0a0a/999999?text=Developer+Desk+Setup",
  author: "alex_codes", // Mocked author for display purposes
  total_price: 659.97,
  items: [
    {
      id: 101,
      name: "Dell UltraSharp U2721DE Monitor",
      price: 499.99,
      link: "https://amazon.com/dell-monitor",
      description:
        "27-inch QHD USB-C Hub Monitor. Perfect for coding and design work.",
      item_image_url: "https://placehold.co/100x100/1e293b/f1f5f9?text=Monitor",
      x: 38.0, // Positional data from Setup.annotations
      y: 25.0,
      is_favorited: true, // Mock property
    },
    {
      id: 102,
      name: "Logitech MX Keys Keyboard",
      price: 99.99,
      link: "https://amazon.com/mx-keys",
      description:
        "High-end wireless keyboard with great tactile feedback for prolonged use.",
      item_image_url:
        "https://placehold.co/100x100/1e293b/f1f5f9?text=Keyboard",
      x: 48.0,
      y: 65.0,
      is_favorited: false,
    },
    {
      id: 103,
      name: "Logitech MX Master 3S Mouse",
      price: 59.99,
      link: "https://amazon.com/mx-master",
      description:
        "Ergonomic mouse with ultra-fast MagSpeed scrolling. Essential for productivity.",
      item_image_url: "https://placehold.co/100x100/1e293b/f1f5f9?text=Mouse",
      x: 65.0,
      y: 60.0,
      is_favorited: true,
    },
  ],
};

// --- COMPONENT PLACEHOLDERS (To replace external imports) ---



// Add to Collection Modal
const AddToCollectionModal = ({ isOpen, onClose, item }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
      setSelectedCollection('');
      setNewCollectionName('');
      setShowCreateNew(false);
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5000/collections?user_id=1');
      const data = await response.json();
      setCollections(data);
      if (data.length === 0) {
        setShowCreateNew(true);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const createNewCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName.trim()
        })
      });
      
      if (response.ok) {
        const newCollection = await response.json();
        setCollections([...collections, newCollection]);
        setSelectedCollection(newCollection.id.toString());
        setShowCreateNew(false);
        setNewCollectionName('');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCollection = async () => {
    if (!selectedCollection || !item) return;
    
    setLoading(true);
    try {
      console.log(`Item ${item.id} added to collection ${selectedCollection}`);
      onClose();
    } catch (error) {
      console.error('Error adding to collection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <h3 className="text-white text-lg font-bold">Add to Collection</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          Adding **{item?.name || "Item"}** to a collection.
        </p>
        
        {!showCreateNew ? (
          <>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded border border-gray-600"
            >
              <option value="">Select a collection</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateNew(true)}
              className="w-full py-2 mb-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
            >
              Create New Collection
            </button>
            <button
              onClick={handleAddToCollection}
              disabled={!selectedCollection || loading}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold disabled:bg-gray-600"
            >
              {loading ? 'Adding...' : 'Add to Collection'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded border border-gray-600"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateNew(false)}
                className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={createNewCollection}
                disabled={!newCollectionName.trim() || loading}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold disabled:bg-gray-600"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Item Details Sidebar Component (Simplified)
const ItemDetailsSidebar = ({ isOpen, onClose, item, hoveredItemId }) => {
  const isVisible = isOpen && item;

  // The provided style was based on the dark theme
  const sidebarClasses = `fixed top-0 right-0 w-full md:w-1/2 lg:w-96 h-full p-6 flex flex-col gap-6 overflow-y-auto z-50 transition-transform duration-300 ${
    isVisible ? "translate-x-0" : "translate-x-full"
  } bg-gray-900 border-l border-gray-700 shadow-2xl`;

  if (!item) return null;

  return (
    <div className={sidebarClasses}>
      <div className="flex justify-between items-center">
        <h3 className="text-white text-xl font-bold">Item Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-4">
        <div
          className={`w-full aspect-video bg-gray-700 rounded-xl flex items-center justify-center border-2 ${item.id === hoveredItemId ? "border-red-500" : "border-gray-600"}`}
        >
          <img
            src={item.item_image_url}
            alt={item.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </div>

        <div>
          <h4 className="text-white text-lg font-bold">{item.name}</h4>
          <p className="text-gray-400 text-sm font-light">
            Price: ${item.price}
          </p>
        </div>

        <p className="text-gray-300 text-sm">{item.description}</p>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full cursor-pointer items-center justify-center rounded-lg h-11 px-4 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors gap-2"
        >
          <ShoppingBag size={18} /> Buy on Merchant Site
        </a>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);
  const [selectedItemForCollection, setSelectedItemForCollection] =
    useState(null);

  // State for the core interaction: tracking the hovered item ID
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Fetch data hook
  useEffect(() => {
    const fetchSetup = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:5000/setups/${id}`);
        if (!response.ok) throw new Error('Setup not found');
        const data = await response.json();
        
        // Transform data to match expected format
        const transformedData = {
          id: data.id,
          name: data.name,
          image_url: data.image_url,
          author: data.user?.username || 'Unknown',
          items: data.items || []
        };
        
        setSetup(transformedData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load setup data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSetup();
  }, [id]);

  const handleOpenSidebar = useCallback((item) => {
    setSelectedItemForDetail(item);
    setIsSidebarOpen(true);
  }, []);

  const handleOpenModal = useCallback((item) => {
    setSelectedItemForCollection(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedItemForCollection(null);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedItemForDetail(null);
  }, []);

  const toggleFavorite = async (itemId, isFavorited) => {
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch('http://localhost:5000/favorites', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          setup_id: setup.id
        })
      });

      if (response.ok) {
        // Update local state
        setSetup(prevSetup => ({
          ...prevSetup,
          items: prevSetup.items.map(item => 
            item.id === itemId 
              ? { ...item, is_favorited: !isFavorited }
              : item
          )
        }));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 -m-8">
        <Loader2 size={48} className="animate-spin text-red-500" />
        <p className="ml-4 text-white text-lg">Loading Setup...</p>
      </div>
    );
  }

  if (error || !setup) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 -m-8 text-white flex-col">
        <p className="text-xl mb-2">{error || "Setup not found"}</p>
        <button
          onClick={() => navigate('/explore')}
          className="text-red-500 hover:text-red-400 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- Render Content ---
  const totalItems = setup.items.length;
  const items = setup.items;

  return (
    <div className="flex flex-col h-screen bg-gray-900 -m-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 lg:p-6 sticky top-0 bg-gray-900 z-10">
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <p className="text-white text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            {setup.name}
          </p>
          <p className="text-white/60 text-sm md:text-base font-normal leading-normal">
            By {setup.author}
          </p>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="flex flex-1 flex-col lg:flex-row gap-6 p-4 lg:p-6 relative overflow-hidden">
        {/* Left Side - Image Container */}
        <div className="flex-1 min-h-[50vh] lg:min-h-0">
          <div className="w-full h-full bg-gray-800 rounded-xl border border-gray-700 relative overflow-hidden shadow-2xl">
            <div
              className="w-full h-full bg-center bg-no-repeat bg-cover rounded-xl"
              style={{ backgroundImage: `url("${setup.image_url}")` }}
            >
              {/* Hotspots: Dynamically rendered based on fetched data */}
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`absolute rounded-full border-2 transition-all cursor-pointer group
                                        ${
                                          item.id === hoveredItemId
                                            ? "w-10 h-10 border-red-500 bg-red-500/30 ring-4 ring-red-500/50 scale-125"
                                            : "w-6 h-6 border-red-500/50 bg-gray-900/50 hover:bg-red-500/50"
                                        }`}
                  style={{
                    // Use X and Y percentages for positioning
                    top: `${item.y}%`,
                    left: `${item.x}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onMouseEnter={() => setHoveredItemId(item.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-gray-900">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Items List */}
        <div className="lg:w-1/3 flex flex-col">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-4 sticky top-0">
            Items in this Setup ({totalItems})
          </h2>

          {/* Item List Container */}
          <div className="flex flex-col border border-gray-700 rounded-xl overflow-y-auto flex-1 bg-gray-800 shadow-inner">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`flex flex-col gap-3 px-4 py-3 transition-colors ${
                  item.id === hoveredItemId ? "bg-white/10" : "hover:bg-white/5"
                }`}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-gray-700 aspect-square rounded-lg size-[50px] shrink-0 flex items-center justify-center">
                    <img
                      src={item.item_image_url}
                      alt={item.name}
                      className="size-8 object-contain"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-1">
                    <p className="text-white text-base font-medium leading-normal">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-white/60 text-sm font-normal leading-normal">
                      ${item.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
                  <button
                    onClick={() => handleOpenSidebar(item)}
                    className="flex-1 cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <span className="truncate">View Details</span>
                  </button>

                  <button
                    onClick={() => toggleFavorite(item.id, item.is_favorited)}
                    className="flex cursor-pointer items-center justify-center rounded-lg h-10 bg-white/5 text-white gap-2 text-sm font-bold px-2.5 hover:bg-white/10 transition-colors"
                    title="Favorite"
                  >
                    <Heart
                      size={20}
                      className={
                        item.is_favorited
                          ? "fill-red-400 text-red-400"
                          : "text-white/60"
                      }
                    />
                  </button>

                  <button
                    onClick={() => handleOpenModal(item)}
                    className="flex cursor-pointer items-center justify-center rounded-lg h-10 bg-white/5 text-white gap-2 text-sm font-bold px-2.5 hover:bg-white/10 transition-colors"
                    title="Add to Collection"
                  >
                    <Plus size={20} className="text-white/60" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals and Sidebars (using simplified placeholders) */}
      <AddToCollectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        item={selectedItemForCollection}
      />
      <ItemDetailsSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        item={selectedItemForDetail}
        hoveredItemId={hoveredItemId}
      />
    </div>
  );
};

export default PostDetailPage;
