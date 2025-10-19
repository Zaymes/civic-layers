'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Map from '../components/Map';
import LayerPanel from '../components/LayerPanel';
import { LayerConfig } from '../lib/mapUtils';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export default function Home() {
  const [layerConfigs, setLayerConfigs] = useState<LayerConfig[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load layer configuration
  useEffect(() => {
    const loadLayerConfig = async () => {
      try {
        const response = await fetch('/config/layers.json');
        if (!response.ok) {
          throw new Error('Failed to load layer configuration');
        }
        const configs: LayerConfig[] = await response.json();
        setLayerConfigs(configs);
        
        // Set all layers as visible by default
        setVisibleLayers(new Set(configs.map(config => config.id)));
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading layer configuration:', error);
        setIsLoading(false);
      }
    };

    loadLayerConfig();
  }, []);

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    setVisibleLayers(prev => {
      const newSet = new Set(prev);
      if (visible) {
        newSet.add(layerId);
      } else {
        newSet.delete(layerId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading risk visualization app...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Kathmandu Risk Visualization
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Multi-layer environmental risk assessment for Kathmandu, Nepal
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {layerConfigs.length} datasets available
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
                <Map
                  layerConfigs={layerConfigs}
                  visibleLayers={visibleLayers}
                />
              </div>
            </div>

            {/* Layer Panel */}
            <div className="lg:col-span-1">
              <LayerPanel
                layerConfigs={layerConfigs}
                visibleLayers={visibleLayers}
                onLayerToggle={handleLayerToggle}
              />
            </div>
          </div>

          {/* Info section */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Visualization</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Data Sources</h3>
                <ul className="space-y-1">
                  <li>• Flood risk points from insurance data</li>
                  <li>• Earthquake risk zones from geological surveys</li>
                  <li>• OpenStreetMap base layer</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Features</h3>
                <ul className="space-y-1">
                  <li>• Interactive layer toggling</li>
                  <li>• Click for detailed information</li>
                  <li>• Scalable for additional datasets</li>
                  <li>• Mobile-responsive design</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}
