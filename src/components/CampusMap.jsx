import React, { useState } from 'react';
import { Map as MapIcon, Info, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const CampusMap = ({ onZoneSelect, selectedZone }) => {
    const zones = [
        { id: 'Z1', name: 'Main Library', coords: 'top-[20%] left-[30%]', color: 'bg-blue-500' },
        { id: 'Z2', name: 'Academic Block 1', coords: 'top-[40%] left-[50%]', color: 'bg-green-500' },
        { id: 'Z3', name: 'Student Center', coords: 'top-[60%] left-[25%]', color: 'bg-orange-500' },
        { id: 'Z4', name: 'Sports Complex', coords: 'top-[75%] left-[60%]', color: 'bg-purple-500' },
        { id: 'Z5', name: 'IT Center', coords: 'top-[25%] left-[70%]', color: 'bg-red-500' },
    ];

    return (
        <div className="relative w-full aspect-video bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Abstract Map Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute w-full h-[1px] bg-slate-700 top-1/4"></div>
                <div className="absolute w-full h-[1px] bg-slate-700 top-1/2"></div>
                <div className="absolute w-full h-[1px] bg-slate-700 top-3/4"></div>
                <div className="absolute h-full w-[1px] bg-slate-700 left-1/4"></div>
                <div className="absolute h-full w-[1px] bg-slate-700 left-1/2"></div>
                <div className="absolute h-full w-[1px] bg-slate-700 left-3/4"></div>
            </div>

            <div className="absolute top-6 left-6 z-10">
                <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800">
                    <MapIcon size={20} className="text-primary-400" />
                    <span className="text-sm font-bold text-white tracking-wide">Interactive Campus Map</span>
                </div>
            </div>

            {zones.map((zone) => (
                <motion.button
                    key={zone.id}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onZoneSelect(zone)}
                    className={`absolute ${zone.coords} -translate-x-1/2 -translate-y-1/2 z-20 group`}
                >
                    <div className={`w-4 h-4 rounded-full ${zone.color} shadow-[0_0_15px_rgba(0,0,0,0.5)] border-2 border-white transition-all ${selectedZone?.id === zone.id ? 'ring-4 ring-white ring-offset-4 ring-offset-slate-950 scale-125' : ''
                        }`}></div>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        <div className="bg-slate-950 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-800 shadow-xl uppercase">
                            {zone.name}
                        </div>
                    </div>
                </motion.button>
            ))}

            <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 space-y-2 max-w-[200px]">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center gap-1">
                        <Info size={10} /> Zone Legend
                    </p>
                    <div className="space-y-1">
                        {zones.map(z => (
                            <div key={z.id} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${z.color}`}></div>
                                <span className="text-[10px] text-slate-300 font-medium">{z.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampusMap;
