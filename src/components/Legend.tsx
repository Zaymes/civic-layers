'use client';

import { LayerConfig } from '../lib/mapUtils';

interface LegendProps {
  layerConfigs: LayerConfig[];
  visibleLayers: Set<string>;
}

export default function Legend({ layerConfigs, visibleLayers }: LegendProps) {
  const visibleConfigs = layerConfigs.filter(config => visibleLayers.has(config.id));

  if (visibleConfigs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-lg text-gray-900 mb-3">Legend</h3>
      <div className="space-y-3">
        {visibleConfigs.map((config) => (
          <div key={config.id} className="flex items-center space-x-3">
            {/* Color indicator */}
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: config.color }}
            />
            
            {/* Layer name */}
            <span className="text-sm text-gray-700 font-medium">
              {config.name}
            </span>
          </div>
        ))}
      </div>
      
      {/* Additional legend information */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Click on features for detailed information</p>
          <p>• Use controls to zoom and navigate</p>
          <p>• Toggle layers using the controls panel</p>
        </div>
      </div>
    </div>
  );
}
