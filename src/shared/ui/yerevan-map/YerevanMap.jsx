import { useCallback, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
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
 * Keeps the map aligned when its container size changes (e.g. CSS grid sibling height, tabs).
 * @param {{ centerLat: number; centerLng: number; zoom: number; layoutKey?: string | number }} props
 */
const MapResizeAndRecenter = ({ centerLat, centerLng, zoom, layoutKey }) => {
  const map = useMap();

  const syncView = useCallback(() => {
    map.invalidateSize({ animate: false });
    map.setView([centerLat, centerLng], zoom, { animate: false });
  }, [map, centerLat, centerLng, zoom]);

  useEffect(() => {
    const el = map.getContainer();
    if (!el || typeof ResizeObserver === "undefined") {
      const t = window.setTimeout(syncView, 0);
      return () => window.clearTimeout(t);
    }

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncView);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [map, syncView, layoutKey]);

  return null;
};

/**
 * Thin react-leaflet wrapper centered on Yerevan by default.
 *
 * @param {{
 *   center: { lat: number; lng: number; zoom?: number };
 *   zoom?: number;
 *   markers?: { id: string; lat: number; lng: number; title?: string }[];
 *   ariaLabel?: string;
 *   layoutKey?: string | number;
 * }} props
 */
const YerevanMap = ({ center, zoom, markers = [], ariaLabel, layoutKey }) => {
  const safeCenter = center && typeof center.lat === "number" && typeof center.lng === "number"
    ? [center.lat, center.lng]
    : [40.1792, 44.4991];
  const safeZoom = typeof zoom === "number" ? zoom : center?.zoom ?? 11;
  const centerLat = safeCenter[0];
  const centerLng = safeCenter[1];

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
        <MapResizeAndRecenter
          centerLat={centerLat}
          centerLng={centerLng}
          zoom={safeZoom}
          layoutKey={layoutKey}
        />
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
