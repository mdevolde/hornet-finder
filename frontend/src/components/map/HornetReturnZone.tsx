import { Polygon, Marker } from "react-leaflet";
import { DivIcon } from "leaflet";
import * as L from "leaflet";
import { Hornet } from '../../store/store';
import { 
  HORNET_RETURN_ZONE_ANGLE_DEG, 
  HORNET_RETURN_ZONE_MAX_DISTANCE_KM,
  HORNET_RETURN_ZONE_ABSOLUTE_MAX_DISTANCE_M,
  HORNET_FLIGHT_SPEED_M_PER_MIN
} from '../../utils/constants';

interface HornetReturnZoneProps {
  hornet: Hornet;
  lengthKm?: number;
  angleDeg?: number;
  onClick?: (hornet: Hornet) => void;
  showReturnZone?: boolean; // Prop pour contrôler l'affichage de la zone de retour
  onShowInfo?: (hornet: Hornet, lat?: number, lng?: number) => void; // Prop pour afficher les informations détaillées avec position cliquée
}

// Calculer la distance estimée du nid basée sur la durée
function calculateNestDistance(duration?: number): number {
  if (!duration || duration <= 0) {
    return HORNET_RETURN_ZONE_MAX_DISTANCE_KM; // Distance max par défaut: 2km
  }
  
  // Calcul basé sur la vitesse du frelon
  const distanceInMeters = Math.round((duration / 60) * HORNET_FLIGHT_SPEED_M_PER_MIN);
  const finalDistance = Math.min(distanceInMeters, HORNET_RETURN_ZONE_ABSOLUTE_MAX_DISTANCE_M);
  
  // Convertir en kilomètres
  return finalDistance / 1000;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Créer une icône personnalisée pour le frelon
function createHornetIcon(): DivIcon {
  return new DivIcon({
    html: '<div style="font-size: 20px; text-align: center; line-height: 1;">🐝</div>',
    className: 'hornet-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function computeTriangle(
  lat: number,
  lng: number,
  direction: number,
  lengthKm = HORNET_RETURN_ZONE_MAX_DISTANCE_KM,
  angleDeg = HORNET_RETURN_ZONE_ANGLE_DEG
): [number, number][] {
  const R = 6371;
  const dirRad = deg2rad(direction);
  const d = lengthKm / R;
  const lat1 = deg2rad(lat);
  const lng1 = deg2rad(lng);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(dirRad)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(dirRad) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

  const halfAngle = angleDeg / 2;
  const leftDir = deg2rad(direction - halfAngle);
  const rightDir = deg2rad(direction + halfAngle);

  const latLeft = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(leftDir)
  );
  const lngLeft =
    lng1 +
    Math.atan2(
      Math.sin(leftDir) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(latLeft)
    );

  const latRight = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(rightDir)
  );
  const lngRight =
    lng1 +
    Math.atan2(
      Math.sin(rightDir) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(latRight)
    );

  return [
    [lat * 1, lng * 1],
    [latLeft * (180 / Math.PI), lngLeft * (180 / Math.PI)],
    [lat2 * (180 / Math.PI), lng2 * (180 / Math.PI)],
    [latRight * (180 / Math.PI), lngRight * (180 / Math.PI)],
    [lat * 1, lng * 1],
  ];
}

export default function HornetReturnZone({ 
  hornet,
  lengthKm, 
  angleDeg = HORNET_RETURN_ZONE_ANGLE_DEG,
  onClick,
  showReturnZone = true, // Par défaut, afficher la zone de retour
  onShowInfo
}: HornetReturnZoneProps) {
  // Calculer la longueur du cône basée sur la durée si elle n'est pas fournie explicitement
  const calculatedLength = lengthKm ?? calculateNestDistance(hornet.duration);
  
  // Déterminer si la longueur est basée sur une durée réelle ou par défaut
  const isBasedOnDuration = Boolean(hornet.duration && hornet.duration > 0);
  
  const trianglePositions = computeTriangle(
    hornet.latitude, 
    hornet.longitude, 
    hornet.direction, 
    calculatedLength, 
    angleDeg
  );

  const handleClick = () => {
    if (onClick) {
      onClick(hornet);
    }
  };

  const handleReturnZoneClick = (event: L.LeafletMouseEvent) => {
    if (onShowInfo) {
      // Capturer la position exacte du clic
      const clickPosition = event.latlng;
      onShowInfo(hornet, clickPosition.lat, clickPosition.lng);
    } else if (onClick) {
      onClick(hornet);
    }
  };

  return (
    <>
      {showReturnZone && (
        <Polygon
          positions={trianglePositions}
          pathOptions={{
            color: "red",
            fillColor: "red",
            fillOpacity: isBasedOnDuration ? 0.3 : 0.2,
            weight: isBasedOnDuration ? 3 : 2,
            dashArray: isBasedOnDuration ? undefined : "5, 5", // Ligne pointillée pour les estimations par défaut
          }}
          eventHandlers={{
            click: handleReturnZoneClick,
          }}
        />
      )}
      
      <Marker
        position={[hornet.latitude, hornet.longitude]}
        icon={createHornetIcon()}
        eventHandlers={{
          click: handleClick,
        }}
      />
    </>
  );
}
