import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function VolleyballPlayRecorder() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddPlayer = () => {
    const newPlayer = {
      id: Date.now(),
      name: 'New Player',
      number: '0',
      color: '#ff0000'
    };
    setPlayers([...players, newPlayer]);
  };

  const handleEditPlayer = (player) => {
    setSelectedPlayer(player);
    setIsDrawerOpen(true);
  };

  const handleUpdatePlayer = (field, value) => {
    if (!selectedPlayer) return;

    // For number field, enforce max 3 characters
    if (field === 'number' && value.length > 3) return;

    const updatedPlayers = players.map(p =>
      p.id === selectedPlayer.id ? { ...p, [field]: value } : p
    );
    setPlayers(updatedPlayers);
    setSelectedPlayer({ ...selectedPlayer, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        onClick={handleAddPlayer}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add Player
      </button>

      <div className="mt-4 grid grid-cols-4 gap-4">
        {players.map(player => (
          <div
            key={player.id}
            onClick={() => handleEditPlayer(player)}
            className="cursor-pointer"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: player.color }}
            >
              {player.number}
            </div>
            <div className="text-center mt-2">{player.name}</div>
          </div>
        ))}
      </div>

      {/* Side Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedPlayer && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Edit Player</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={selectedPlayer.name}
                  onChange={(e) => handleUpdatePlayer('name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number
                </label>
                <input
                  type="text"
                  value={selectedPlayer.number}
                  onChange={(e) => handleUpdatePlayer('number', e.target.value)}
                  maxLength={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <HexColorPicker
                  color={selectedPlayer.color}
                  onChange={(color) => handleUpdatePlayer('color', color)}
                />
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}