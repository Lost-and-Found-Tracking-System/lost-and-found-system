import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const CampusMap = ({ zones = [], selectedZone, onZoneSelect }) => {
    const [hoveredZone, setHoveredZone] = useState(null);

    // Default zones if none provided (for backward compatibility)
    const defaultZones = [
        { _id: 'zone-1', zoneName: 'Main Building', coordinates: [76.9, 10.9] },
        { _id: 'zone-2', zoneName: 'Library', coordinates: [76.91, 10.91] },
        { _id: 'zone-3', zoneName: 'Cafeteria', coordinates: [76.89, 10.89] },
        { _id: 'zone-4', zoneName: 'Sports Complex', coordinates: [76.92, 10.88] },
        { _id: 'zone-5', zoneName: 'Hostel Block', coordinates: [76.88, 10.92] },
    ];

    const displayZones = zones.length > 0 ? zones : defaultZones;

    const handleZoneClick = (zone) => {
        if (onZoneSelect) {
            onZoneSelect({
                id: zone._id,
                name: zone.zoneName,
                coordinates: zone.geoBoundary?.coordinates?.[0]?.[0] || [0, 0],
            });
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl p-4">
            {/* Map Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {displayZones.slice(0, 9).map((zone, index) => {
                    const isSelected = selectedZone === zone._id;
                    const isHovered = hoveredZone === zone._id;

                    return (
                        <button
                            key={zone._id}
                            type="button"
                            onClick={() => handleZoneClick(zone)}
                            onMouseEnter={() => setHoveredZone(zone._id)}
                            onMouseLeave={() => setHoveredZone(null)}
                            className={`
                                relative aspect-square rounded-xl transition-all duration-200
                                flex flex-col items-center justify-center gap-2 p-3
                                ${isSelected 
                                    ? 'bg-primary-500 text-white ring-2 ring-primary-400 ring-offset-2 ring-offset-slate-800' 
                                    : isHovered
                                        ? 'bg-slate-700 text-white'
                                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                }
                            `}
                        >
                            <MapPin size={24} className={isSelected ? 'text-white' : 'text-primary-400'} />
                            <span className="text-xs font-medium text-center leading-tight">
                                {zone.zoneName}
                            </span>
                            
                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Selected Zone Info */}
            {selectedZone && (
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                    <MapPin size={18} className="text-primary-400" />
                    <div>
                        <p className="text-white text-sm font-medium">Selected Location</p>
                        <p className="text-slate-400 text-xs">
                            {displayZones.find(z => z._id === selectedZone)?.zoneName || 'Unknown Zone'}
                        </p>
                    </div>
                </div>
            )}

            {/* Help Text */}
            {!selectedZone && (
                <p className="text-slate-500 text-xs text-center">
                    Click on a zone to select the location
                </p>
            )}
        </div>
    );
};

export default CampusMap;