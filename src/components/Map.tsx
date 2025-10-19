'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerConfig, addLayer, removeLayer, createPopupContent } from '../lib/mapUtils';
import { useMultipleLayerData } from '../lib/dataLoader';

interface MapProps {
  layerConfigs: LayerConfig[];
  visibleLayers: Set<string>;
}

export default function Map({ layerConfigs, visibleLayers }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Load all layer data
  const { queries, isLoading, isError } = useMultipleLayerData(layerConfigs, mapLoaded);

  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-layer',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [85.3, 27.7], // Kathmandu coordinates
        zoom: 10,
        attributionControl: {
          compact: false
        }
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle layer data and visibility
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    layerConfigs.forEach((layerConfig, index) => {
      const query = queries[index];
      const isVisible = visibleLayers.has(layerConfig.id);

      if (query.data && !query.isLoading && !query.isError) {
        if (isVisible) {
          // Add or update layer
          addLayer(map.current!, layerConfig, query.data);
        } else {
          // Remove layer if not visible
          removeLayer(map.current!, layerConfig);
        }
      } else if (!isVisible) {
        // Remove layer if not visible or data not available
        removeLayer(map.current!, layerConfig);
      }
    });
  }, [layerConfigs, queries, visibleLayers, mapLoaded]);

  // Add click handlers for popups
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const layerId = feature.layer.id;
        
        // Find the layer config for this feature
        const layerConfig = layerConfigs.find(config => 
          layerId === `${config.id}-layer`
        );
        
        if (layerConfig) {
          // Close existing popup
          if (popupRef.current) {
            popupRef.current.remove();
          }
          
          // Create new popup
          popupRef.current = new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(createPopupContent(feature, layerConfig))
            .addTo(map.current!);
        }
      }
    };

    // Add click handler to all visible layers
    layerConfigs.forEach((layerConfig) => {
      const layerId = `${layerConfig.id}-layer`;
      if (map.current!.getLayer(layerId)) {
        map.current!.on('click', layerId, handleClick);
        
        // Change cursor on hover
        map.current!.on('mouseenter', layerId, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current!.on('mouseleave', layerId, () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });
      }
    });

    return () => {
      // Clean up event listeners
      if (map.current) {
        layerConfigs.forEach((layerConfig) => {
          const layerId = `${layerConfig.id}-layer`;
          map.current!.off('click', layerId, handleClick);
          // Note: mouseenter/mouseleave cleanup is handled automatically by MapLibre
        });
      }
    };
  }, [layerConfigs, visibleLayers, mapLoaded]);

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg shadow-lg" />
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">Loading layers...</span>
          </div>
        </div>
      )}
      {isError && (
        <div className="absolute top-4 left-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg shadow-lg">
          <span className="text-sm">Error loading some layers</span>
        </div>
      )}
    </div>
  );
}
