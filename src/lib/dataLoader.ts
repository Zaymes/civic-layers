import { useQuery } from '@tanstack/react-query';
import { parseCSVtoGeoJSON, GeoJSONFeatureCollection, LayerConfig } from './mapUtils';

/**
 * Fetch and parse CSV data
 * @param path - Path to CSV file
 * @returns Promise resolving to GeoJSON FeatureCollection
 */
async function fetchCSVData(path: string): Promise<GeoJSONFeatureCollection> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV data: ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseCSVtoGeoJSON(csvText);
}

/**
 * Fetch GeoJSON data
 * @param path - Path to GeoJSON file
 * @returns Promise resolving to GeoJSON FeatureCollection
 */
async function fetchGeoJSONData(path: string): Promise<GeoJSONFeatureCollection> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON data: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch layer data based on configuration
 * @param layerConfig - Layer configuration
 * @returns Promise resolving to GeoJSON FeatureCollection
 */
async function fetchLayerData(layerConfig: LayerConfig): Promise<GeoJSONFeatureCollection> {
  if (layerConfig.type === 'csv') {
    return fetchCSVData(layerConfig.path);
  } else if (layerConfig.type === 'geojson') {
    return fetchGeoJSONData(layerConfig.path);
  } else {
    throw new Error(`Unsupported layer type: ${layerConfig.type}`);
  }
}

/**
 * React Query hook for fetching layer data
 * @param layerConfig - Layer configuration
 * @param enabled - Whether the query should be enabled
 * @returns React Query result
 */
export function useLayerData(layerConfig: LayerConfig, enabled: boolean = true) {
  return useQuery({
    queryKey: ['layerData', layerConfig.id],
    queryFn: () => fetchLayerData(layerConfig),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * React Query hook for fetching multiple layers
 * @param layerConfigs - Array of layer configurations
 * @param enabled - Whether the queries should be enabled
 * @returns Object with layer data queries
 */
export function useMultipleLayerData(layerConfigs: LayerConfig[], enabled: boolean = true) {
  // Use individual hooks for each layer
  const floodQuery = useLayerData(layerConfigs[0] || { id: '', name: '', type: 'csv', path: '', color: '' }, enabled && layerConfigs.length > 0);
  const earthquakeQuery = useLayerData(layerConfigs[1] || { id: '', name: '', type: 'geojson', path: '', color: '' }, enabled && layerConfigs.length > 1);
  
  const queries = [floodQuery, earthquakeQuery].filter((_, index) => index < layerConfigs.length);

  return {
    queries,
    isLoading: queries.some(query => query.isLoading),
    isError: queries.some(query => query.isError),
    errors: queries.filter(query => query.isError).map(query => query.error),
  };
}

/**
 * Get layer data with error handling
 * @param query - React Query result
 * @param layerConfig - Layer configuration
 * @returns Layer data or null if not available
 */
export function getLayerData(
  query: ReturnType<typeof useLayerData>
): GeoJSONFeatureCollection | null {
  if (query.isLoading || query.isError || !query.data) {
    return null;
  }
  return query.data;
}
