import Papa from 'papaparse';
import maplibregl from 'maplibre-gl';

// Types for layer configuration
export interface LayerConfig {
  id: string;
  name: string;
  type: 'geojson' | 'csv';
  path: string;
  color: string;
  region?: string;
}

// Types for CSV data
export interface CSVRow {
  Longitude: string;
  Latitude: string;
  LocGroup?: string;
  LocPerilsCovered?: string;
  BuildingTIV?: string;
  [key: string]: string | undefined;
}

// Types for GeoJSON - compatible with MapLibre
export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'Polygon' | 'LineString';
    coordinates: number[] | number[][] | number[][][];
  };
  properties: Record<string, unknown>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Parse CSV data and convert to GeoJSON FeatureCollection
 * @param csvData - Raw CSV string data
 * @returns GeoJSON FeatureCollection with Point features
 */
export function parseCSVtoGeoJSON(csvData: string): GeoJSONFeatureCollection {
  const parsed = Papa.parse<CSVRow>(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const features: GeoJSONFeature[] = [];
  
  parsed.data
    .filter((row) => row.Longitude && row.Latitude)
    .forEach((row) => {
      const lng = parseFloat(row.Longitude);
      const lat = parseFloat(row.Latitude);

      // Skip invalid coordinates
      if (!isNaN(lng) && !isNaN(lat)) {
        features.push({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [lng, lat],
          },
          properties: {
            ...row,
            // Convert numeric strings to numbers for better display
            BuildingTIV: row.BuildingTIV ? parseFloat(row.BuildingTIV) : undefined,
          },
        });
      }
    });

  return {
    type: 'FeatureCollection',
    features,
  };
}

/**
 * Add a layer to the MapLibre map
 * @param map - MapLibre map instance
 * @param layerConfig - Layer configuration
 * @param data - GeoJSON data for the layer
 */
export function addLayer(
  map: maplibregl.Map,
  layerConfig: LayerConfig,
  data: GeoJSONFeatureCollection
): void {
  const sourceId = `${layerConfig.id}-source`;
  const layerId = `${layerConfig.id}-layer`;

  // Add source
  if (map.getSource(sourceId)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map.getSource(sourceId) as maplibregl.GeoJSONSource).setData(data as any);
  } else {
    map.addSource(sourceId, {
      type: 'geojson',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
    });
  }

  // Add layer based on geometry type
  if (data.features.length > 0) {
    const geometryType = data.features[0].geometry.type;

    if (geometryType === 'Point') {
      // Add circle layer for points
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-color': layerConfig.color,
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    } else if (geometryType === 'Polygon') {
      // Add fill layer for polygons
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      map.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': layerConfig.color,
          'fill-opacity': 0.6,
        },
      });
    }
  }
}

/**
 * Remove a layer from the MapLibre map
 * @param map - MapLibre map instance
 * @param layerConfig - Layer configuration
 */
export function removeLayer(map: maplibregl.Map, layerConfig: LayerConfig): void {
  const sourceId = `${layerConfig.id}-source`;
  const layerId = `${layerConfig.id}-layer`;

  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
}

/**
 * Toggle layer visibility
 * @param map - MapLibre map instance
 * @param layerConfig - Layer configuration
 * @param visible - Whether the layer should be visible
 */
export function toggleLayerVisibility(
  map: maplibregl.Map,
  layerConfig: LayerConfig,
  visible: boolean
): void {
  const layerId = `${layerConfig.id}-layer`;
  
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}

/**
 * Create popup content for a feature
 * @param feature - GeoJSON feature (MapLibre or custom)
 * @param layerConfig - Layer configuration
 * @returns HTML string for popup
 */
export function createPopupContent(
  feature: { properties: Record<string, unknown> },
  layerConfig: LayerConfig
): string {
  const props = feature.properties;
  
  if (layerConfig.id === 'flood') {
    return `
      <div class="p-2">
        <h3 class="font-semibold text-lg mb-2">${layerConfig.name}</h3>
        <div class="space-y-1">
          <p><strong>Location Group:</strong> ${props.LocGroup || 'N/A'}</p>
          <p><strong>Peril Type:</strong> ${props.LocPerilsCovered || 'N/A'}</p>
          <p><strong>Building TIV:</strong> $${props.BuildingTIV ? props.BuildingTIV.toLocaleString() : 'N/A'}</p>
        </div>
      </div>
    `;
  } else if (layerConfig.id === 'earthquake') {
    return `
      <div class="p-2">
        <h3 class="font-semibold text-lg mb-2">${layerConfig.name}</h3>
        <div class="space-y-1">
          <p><strong>Damage Level:</strong> ${props.Damage || 'N/A'}</p>
          <p><strong>Source:</strong> ${props.Source || 'N/A'}</p>
        </div>
      </div>
    `;
  }
  
  // Generic popup for other layers
  return `
    <div class="p-2">
      <h3 class="font-semibold text-lg mb-2">${layerConfig.name}</h3>
      <div class="space-y-1">
        ${Object.entries(props)
          .filter(([key]) => !['Longitude', 'Latitude'].includes(key))
          .map(([key, value]) => `<p><strong>${key}:</strong> ${value || 'N/A'}</p>`)
          .join('')}
      </div>
    </div>
  `;
}
