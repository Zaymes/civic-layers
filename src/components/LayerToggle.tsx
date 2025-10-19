'use client';

import { Switch } from '@radix-ui/react-switch';
import { LayerConfig } from '../lib/mapUtils';

interface LayerToggleProps {
  layerConfig: LayerConfig;
  isVisible: boolean;
  onToggle: (layerId: string, visible: boolean) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export default function LayerToggle({ 
  layerConfig, 
  isVisible, 
  onToggle, 
  isLoading = false, 
  isError = false 
}: LayerToggleProps) {
  const handleToggle = (checked: boolean) => {
    onToggle(layerConfig.id, checked);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        {/* Color indicator */}
        <div 
          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: layerConfig.color }}
        />
        
        {/* Layer name and status */}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{layerConfig.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className="capitalize">{layerConfig.type}</span>
            {isLoading && (
              <span className="text-blue-600">Loading...</span>
            )}
            {isError && (
              <span className="text-red-600">Error</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Toggle switch */}
      <Switch
        checked={isVisible}
        onCheckedChange={handleToggle}
        disabled={isLoading || isError}
        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span
          className={`${
            isVisible ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </div>
  );
}
