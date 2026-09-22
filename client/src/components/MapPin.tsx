import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Drag({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  lat,
  lng,
  onChange,
  readOnly,
}: {
  lat: number;
  lng: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  const position = useMemo(() => [lat, lng] as [number, number], [lat, lng]);
  return (
    <div className="h-72 overflow-hidden rounded-2xl border border-line">
      <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker
          position={position}
          icon={icon}
          draggable={!readOnly}
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const next = marker.getLatLng();
              onChange?.(next.lat, next.lng);
            },
          }}
        />
        {!readOnly && onChange ? <Drag onChange={onChange} /> : null}
      </MapContainer>
    </div>
  );
}
