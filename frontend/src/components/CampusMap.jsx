import React, { useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

const CampusMap = ({ zones = [], selectedZone, onZoneSelect }) => {
    const [hoveredZone, setHoveredZone] = useState(null);

    const handleZoneClick = (zone) => {
        if (onZoneSelect) {
            onZoneSelect({
                id: zone._id,
                name: zone.zoneName,
                coordinates: zone.geoBoundary?.coordinates?.[0]?.[0] || [0, 0],
            });
        }
    };

    // Show empty state when no zones exist
    if (!zones || zones.length === 0) {
        return (
            <div className="bg-slate-800 rounded-2xl p-8">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-amber-500/10 rounded-full">
                        <AlertTriangle size={32} className="text-amber-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-1">No Zones Created Yet</h4>
                        <p className="text-slate-400 text-sm max-w-xs">
                            Campus zones have not been configured. Please wait for an administrator to create zones before reporting items.
                        </p>
                    </div>
                    <div className="px-4 py-2 bg-slate-700/50 rounded-lg">
                        <p className="text-slate-500 text-xs">
                            Contact admin to set up campus zones
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-2xl p-4">
            {/* Map Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {zones.slice(0, 9).map((zone) => {
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

            {/* More zones indicator */}
            {zones.length > 9 && (
                <p className="text-slate-500 text-xs text-center mb-3">
                    +{zones.length - 9} more zones available
                </p>
            )}

            {/* Selected Zone Info */}
            {selectedZone && (
                <div className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                    <MapPin size={18} className="text-primary-400" />
                    <div>
                        <p className="text-white text-sm font-medium">Selected Location</p>
                        <p className="text-slate-400 text-xs">
                            {zones.find(z => z._id === selectedZone)?.zoneName || 'Unknown Zone'}
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