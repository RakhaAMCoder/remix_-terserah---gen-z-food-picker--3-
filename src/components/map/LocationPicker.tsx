
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Crosshair, Check } from 'lucide-react';
import { motion } from 'motion/react';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialLocation?: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
  darkMode?: boolean;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

function LocationMarker({ position, setPosition }: { 
  position: [number, number], 
  setPosition: (pos: [number, number]) => void 
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
    />
  );
}

export default function LocationPicker({ 
  initialLocation = [-7.9666, 112.6326], // Malang default
  onLocationSelect, 
  onClose,
  darkMode = true
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialLocation);
  const [isLocating, setIsLocating] = useState(false);

  const handleCurrentLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Gagal mengambil lokasi. Pastikan GPS aktif.");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={`fixed inset-0 z-[110] flex flex-col ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <header className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? 'border-white/10' : 'border-black/5'}`}>
        <div className="space-y-1">
          <h3 className="font-black text-lg tracking-tighter">Pilih Lokasi</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tap peta atau geser marker</p>
        </div>
        <button onClick={onClose} className="text-gray-500 font-bold uppercase tracking-widest text-xs">Batal</button>
      </header>

      <div className="flex-1 relative">
        <MapContainer 
          center={position} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url={darkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            attribution='&copy; OpenStreetMap'
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapUpdater center={position} />
        </MapContainer>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCurrentLocation}
          disabled={isLocating}
          className={`absolute bottom-24 right-6 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center z-[1000] border ${
            darkMode ? 'bg-black border-white/20 text-[#1A9E5C]' : 'bg-white border-black/10 text-blue-600'
          }`}
        >
          <Crosshair size={24} className={isLocating ? 'animate-spin' : ''} />
        </motion.button>

        <div className={`absolute bottom-0 left-0 right-0 p-6 z-[1000] ${darkMode ? 'bg-gradient-to-t from-black' : 'bg-gradient-to-t from-white'}`}>
          <button
            onClick={() => onLocationSelect(position[0], position[1])}
            className="w-full h-16 bg-[#1A9E5C] rounded-3xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[12px] shadow-[0_0_40px_rgba(26,158,92,0.3)] active:scale-95 transition-all"
          >
            <Check size={20} />
            Gunakan Titik Ini
          </button>
        </div>
      </div>
    </div>
  );
}
