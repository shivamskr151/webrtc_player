import { useState, useCallback } from 'react';

interface Snapshot {
  id: string;
  data: string;
  timestamp: Date;
  isServerSnapshot?: boolean;
}

interface SnapshotGalleryProps {
  snapshots: Snapshot[];
  onClear: () => void;
  onDownload: (snapshot: Snapshot) => void;
}

const SnapshotGallery = ({ snapshots, onClear, onDownload }: SnapshotGalleryProps) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);

  const formatTimestamp = useCallback((timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  }, []);

  const handleDownload = useCallback((snapshot: Snapshot) => {
    onDownload(snapshot);
  }, [onDownload]);

  const handleImageClick = useCallback((snapshot: Snapshot) => {
    setSelectedSnapshot(snapshot);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedSnapshot(null);
  }, []);

  if (snapshots.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">
          📸 Snapshots
        </h3>
        <div className="text-center text-gray-400 py-8">
          <div className="text-4xl mb-2">📷</div>
          <p>No snapshots taken yet</p>
          <p className="text-sm mt-1">Take a snapshot while the stream is playing</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-200">
            📸 Snapshots ({snapshots.length})
          </h3>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className="relative group bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleImageClick(snapshot)}
            >
              <img
                src={snapshot.data}
                alt={`Snapshot ${snapshot.id}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(snapshot);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2">
                <div className="flex items-center justify-between">
                  <span>{formatTimestamp(snapshot.timestamp)}</span>
                  {snapshot.isServerSnapshot && (
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Server
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full-size view */}
      {selectedSnapshot && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white text-2xl font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200"
            >
              ×
            </button>
            <img
              src={selectedSnapshot.data}
              alt={`Snapshot ${selectedSnapshot.id}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>Captured at: {formatTimestamp(selectedSnapshot.timestamp)}</span>
                  {selectedSnapshot.isServerSnapshot && (
                    <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                      🖥️ Server Snapshot
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDownload(selectedSnapshot)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors duration-200"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SnapshotGallery;
