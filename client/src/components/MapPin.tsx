import { useMemo, useEffect } from "react";
import { MapContainer, Marker, TileLayer, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin as PinIcon, Navigation, Store } from "lucide-react";
import { toast } from "sonner";

// Boytag's Flagship Branch in Poblacion, Tupi, South Cotabato
export const TUPI_BOYTAGS_COORDS = {
  lat: 6.3333,
  lng: 124.9515,
  name: "Boytag's Lechon Manok & Chicken House",
  address: "National Highway, Poblacion, Tupi, South Cotabato",
};

const customerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -36],
});

// Create custom store SVG icon for Boytag's Flagship in Tupi
const storeIcon = L.divIcon({
  className: "custom-store-pin",
  html: `
    <div style="
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: white;
      width: 38px;
      height: 38px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(194, 65, 12, 0.45);
      border: 2px solid #fff;
      font-weight: bold;
    ">
      🍗
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -18],
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function DragHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  lat = TUPI_BOYTAGS_COORDS.lat,
  lng = TUPI_BOYTAGS_COORDS.lng,
  onChange,
  readOnly,
  showStore = true,
}: {
  lat?: number;
  lng?: number;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  showStore?: boolean;
}) {
  const position = useMemo(() => [lat, lng] as [number, number], [lat, lng]);
  const storePos = useMemo(
    () => [TUPI_BOYTAGS_COORDS.lat, TUPI_BOYTAGS_COORDS.lng] as [number, number],
    [],
  );

  function handleLocateMe() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    toast.info("Pinpointing your current GPS location in Tupi / South Cotabato...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange?.(pos.coords.latitude, pos.coords.longitude);
        toast.success("GPS pinpoint locked onto your location!");
      },
      () => {
        toast.warning("Could not automatically retrieve GPS. Please drag pin manually.");
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-line shadow-inner">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <MapController center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Boytag's Tupi Store Marker */}
        {showStore && (
          <Marker position={storePos} icon={storeIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-ink">🍗 Boytag's Chicken House</p>
                <p className="text-[11px] text-muted">Poblacion, Tupi, South Cotabato</p>
                <p className="text-[10px] text-roast font-semibold mt-1">Main Roasting Pit & Store</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Customer Delivery Pin */}
        <Marker
          position={position}
          icon={customerIcon}
          draggable={!readOnly}
          eventHandlers={{
            dragend: (event) => {
              const marker = event.target as L.Marker;
              const next = marker.getLatLng();
              onChange?.(next.lat, next.lng);
            },
          }}
        >
          <Popup>
            <div className="text-xs p-1">
              <p className="font-bold text-ink">📍 {readOnly ? "Delivery Pinpoint" : "Your Selected Delivery Pin"}</p>
              <p className="text-[11px] text-muted">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
              {!readOnly && (
                <p className="text-[10px] text-roast mt-1 font-medium">Drag anywhere in Tupi & nearby</p>
              )}
            </div>
          </Popup>
        </Marker>

        {!readOnly && onChange ? <DragHandler onChange={onChange} /> : null}
      </MapContainer>

      {/* Locate Me GPS floating button */}
      {!readOnly && onChange && (
        <button
          type="button"
          onClick={handleLocateMe}
          className="absolute right-3 bottom-3 z-[400] flex items-center gap-1.5 rounded-xl border border-line bg-paper/95 px-3 py-2 text-xs font-bold text-ink shadow-lg backdrop-blur-sm transition hover:bg-paper hover:text-roast active:scale-95"
          title="Detect GPS Location"
        >
          <Navigation className="h-3.5 w-3.5 text-roast" />
          <span>Locate Me (GPS)</span>
        </button>
      )}
    </div>
  );
}
