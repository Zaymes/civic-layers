'use client';

import { useState } from 'react';
import { LayerConfig } from '../lib/mapUtils';
import { useMultipleLayerData } from '../lib/dataLoader';
import LayerToggle from './LayerToggle';
import Legend from './Legend';

interface LayerPanelProps {
  layerConfigs: LayerConfig[];
  visibleLayers: Set<string>;
  onLayerToggle: (layerId: string, visible: boolean) => void;
}

export default function LayerPanel({ layerConfigs, visibleLayers, onLayerToggle }: LayerPanelProps) {
  const [activeTab, setActiveTab] = useState<'layers' | 'legend'>('layers');
  const { queries } = useMultipleLayerData(layerConfigs, true);

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'layers'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => setActiveTab('legend')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'legend'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Legend
        </button>
      </div>

      {/* Tab content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'layers' ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Layer Controls</h3>
            {layerConfigs.map((config, index) => {
              const query = queries[index];
              return (
                <LayerToggle
                  key={config.id}
                  layerConfig={config}
                  isVisible={visibleLayers.has(config.id)}
                  onToggle={onLayerToggle}
                  isLoading={query.isLoading}
                  isError={query.isError}
                />
              );
            })}
            
            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p><strong>{visibleLayers.size}</strong> of <strong>{layerConfigs.length}</strong> layers visible</p>
                <p className="text-xs mt-1">
                  {layerConfigs.filter(config => config.type === 'csv').length} CSV datasets, {' '}
                  {layerConfigs.filter(config => config.type === 'geojson').length} GeoJSON datasets
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Legend layerConfigs={layerConfigs} visibleLayers={visibleLayers} />
        )}
      </div>
    </div>
  );
}
