import React, { useState, useEffect } from "react";
import { FolderOpen, Trash2, ShoppingBag, X, Palette } from "lucide-react";

const Collections = () => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load collections from backend
  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('http://localhost:5000/collections?user_id=1');
      const data = await response.json();
      
      // Transform backend data and add blur property
      const transformedCollections = data.map(collection => ({
        id: collection.id,
        name: collection.name,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop", // Default image
        items: collection.items || [],
        blur: "blur-lg"
      }));
      
      setCollections(transformedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between slightly blur and clear
  const toggleBlur = (collectionId) => {
    setCollections(
      collections.map((col) => {
        if (col.id === collectionId) {
          const currentBlur = col.blur;
          const nextBlur = currentBlur === "blur-lg" ? "blur-none" : "blur-lg";
          return { ...col, blur: nextBlur };
        }
        return col;
      })
    );
  };

  // Remove item from collection
  const removeItem = (collectionId, itemId) => {
    setCollections(
      collections.map((col) =>
        col.id === collectionId
          ? { ...col, items: col.items.filter((item) => item.id !== itemId) }
          : col
      )
    );
  };

  // Delete collection
  const deleteCollection = async (collectionId) => {
    try {
      await fetch(`http://localhost:5000/collections/${collectionId}`, {
        method: 'DELETE'
      });
      setCollections(collections.filter((col) => col.id !== collectionId));
      setSelectedCollection(null);
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-90 p-8">
      <h1 className="text-3xl text-white font-bold mb-8">Your Collections</h1>

      {loading ? (
        <div className="text-white text-center py-8">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="text-white text-center py-8">No collections found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Collection Cards */}
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all"
            onClick={() => setSelectedCollection(collection)}
          >
            <div className="aspect-[4/3] relative">
              {/* Background Image with Blur */}
              <img
                src={collection.image}
                alt={collection.name}
                className={`w-full h-full object-cover ${collection.blur} transition-all duration-300`}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Blur Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBlur(collection.id);
                }}
                className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-white/30"
                title="Toggle blur"
              >
                <Palette size={16} className="text-gray-700" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-xl font-bold text-white">
                  {collection.name}
                </h3>
                <p className="text-gray-200 text-sm flex items-center gap-1">
                  <FolderOpen size={14} />
                  {collection.items.length} items
                </p>
              </div>

              {/* Blur indicator */}
              <div className="absolute top-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {collection.blur === "blur-lg" ? "Slightly Blurry" : "Clear"}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Collection Detail Popup */}
      {selectedCollection && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Clear Collection Image */}
              <div className="md:w-1/2 p-6">
                <img
                  src={selectedCollection.image}
                  alt={selectedCollection.name}
                  className="w-full h-64 object-cover rounded-xl"
                />
                <h2 className="text-2xl font-bold mt-4">
                  {selectedCollection.name}
                </h2>
                <p className="text-gray-600">
                  {selectedCollection.items.length} items
                </p>

                {/* Delete Collection Button */}
                <button
                  onClick={() => deleteCollection(selectedCollection.id)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Collection
                </button>
              </div>

              {/* Right Side - Items List */}
              <div className="md:w-1/2 p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Items</h3>
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="p-2 hover:bg-gray-200 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedCollection.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-white rounded-xl border"
                    >
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-gray-600">${item.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            removeItem(selectedCollection.id, item.id)
                          }
                          className="p-2 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={18} className="text-red-400" />
                        </button>
                        <a
                          href={item.link}
                          className="px-4 py-2 bg-black text-white rounded-full flex items-center gap-2 text-sm hover:bg-gray-800"
                        >
                          <ShoppingBag size={16} />
                          Buy
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
