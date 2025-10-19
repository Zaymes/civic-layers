# Civic-Layers

A multi-layer environmental risk visualization application for Kathmandu, Nepal, built with Next.js, TypeScript, and MapLibre GL JS.

## 🗺️ Features

- **Interactive Map**: Built with MapLibre GL JS for smooth rendering and navigation
- **Multi-Layer Support**: Visualize multiple risk datasets simultaneously
- **Layer Toggles**: Show/hide individual layers with intuitive controls
- **Data Sources**: 
  - Flood risk points from insurance data (CSV)
  - Earthquake risk zones from geological surveys (GeoJSON)
- **Interactive Popups**: Click on features for detailed information
- **Responsive Design**: Works on desktop and mobile devices
- **Static Export**: Ready for GitHub Pages deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd civic-layers
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   └── page.tsx              # Main application page
├── components/
│   ├── Map.tsx               # MapLibre GL JS map component
│   ├── LayerPanel.tsx        # Layer controls and legend
│   ├── LayerToggle.tsx       # Individual layer toggle
│   └── Legend.tsx            # Map legend component
├── lib/
│   ├── mapUtils.ts           # Map utilities and CSV parsing
│   └── dataLoader.ts         # React Query data loading
├── config/
│   └── layers.json           # Layer configuration
└── data/                     # Static data files
    ├── flood_data.csv        # Flood risk points
    └── earthquakes.json      # Earthquake risk zones
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run export` - Build and export static files
- `npm run lint` - Run ESLint

## 📊 Data Format

### CSV Data
The application expects CSV files with the following columns:
- `Longitude` - Longitude coordinate
- `Latitude` - Latitude coordinate
- `LocGroup` - Location group identifier
- `LocPerilsCovered` - Type of peril covered
- `BuildingTIV` - Total Insured Value for buildings

### GeoJSON Data
Standard GeoJSON format with properties for:
- `Damage` - Damage level assessment
- `Source` - Data source information

## ⚙️ Configuration

Layer configuration is managed in `src/config/layers.json`:

```json
[
  {
    "id": "flood",
    "name": "Flood Risk Points",
    "type": "csv",
    "path": "/data/flood_data.csv",
    "color": "#0077ff"
  },
  {
    "id": "earthquake",
    "name": "Earthquake Risk Zones",
    "type": "geojson",
    "path": "/data/earthquakes.json",
    "color": "#ff0000"
  }
]
```

## 🌐 Deployment

### GitHub Pages

1. Push your code to the main branch
2. The GitHub Actions workflow will automatically build and deploy to GitHub Pages
3. Your app will be available at `https://yourusername.github.io/civic-layers`

### Manual Static Export

```bash
npm run build
```

The static files will be generated in the `out/` directory.

## 🔧 Adding New Datasets

1. Add your data file to the `public/data/` directory
2. Update `public/config/layers.json` with the new layer configuration
3. The application will automatically load and display the new layer

### Supported Data Types

- **CSV**: Point data with Longitude/Latitude columns
- **GeoJSON**: Any valid GeoJSON FeatureCollection

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. Modify the components to change the appearance.

### Map Styling
MapLibre GL JS supports custom map styles. Update the map style configuration in `src/components/Map.tsx`.

### Colors
Layer colors are defined in the `layers.json` configuration file.

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [MapLibre GL JS](https://maplibre.org/) for the mapping library
- [Next.js](https://nextjs.org/) for the React framework
- [OpenStreetMap](https://www.openstreetmap.org/) for base map tiles
- Data sources: NGA and insurance datasets

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for Kathmandu's risk assessment and visualization needs**