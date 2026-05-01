import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Thin react-leaflet wrapper centered on Yerevan by default.
 *
 * @param {{
 *   center: { lat: number; lng: number; zoom?: number };
 *   zoom?: number;
 *   markers?: { id: string; lat: number; lng: number; title?: string }[];
 *   ariaLabel?: string;
 * }} props
 */
const YerevanMap = ({ center, zoom, markers = [], ariaLabel }) => {
  const safeCenter = center && typeof center.lat === "number" && typeof center.lng === "number"
    ? [center.lat, center.lng]
    : [40.1792, 44.4991];
  const safeZoom = typeof zoom === "number" ? zoom : center?.zoom ?? 11;

  return (
    <div
      className="h-full w-full min-h-[320px]"
      role="region"
      aria-label={ariaLabel}
    >
      <MapContainer
        center={safeCenter}
        zoom={safeZoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution={OSM_ATTRIBUTION}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]}>
            {marker.title ? <Popup>{marker.title}</Popup> : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default YerevanMap;
