import LocateButton from './LocateButton';
import LayerControlsButton from './LayerControlsButton';
import QuickCaptureButton from './QuickCaptureButton';
import { ErrorAlert } from './MapFeedback';

interface MapControlsContainerProps {
  error: string | null;
  onLocationUpdate: (coordinates: [number, number]) => void;
  onErrorUpdate: (error: string | null) => void;
  showApiariesButton?: boolean;
  showNestsButton?: boolean;
  onQuickHornetCapture?: () => void;
  canAddHornet?: boolean;
}

export default function MapControlsContainer({ 
  error, 
  onLocationUpdate, 
  onErrorUpdate, 
  showApiariesButton = false, 
  showNestsButton = false,
  onQuickHornetCapture,
  canAddHornet = false
}: MapControlsContainerProps) {
  return (
    <>
      <div className="map-controls-container">
        <LocateButton 
          onLocationUpdate={onLocationUpdate} 
          onErrorUpdate={onErrorUpdate} 
        />
        <LayerControlsButton 
          showApiariesButton={showApiariesButton}
          showNestsButton={showNestsButton}
        />
        {onQuickHornetCapture && (
          <QuickCaptureButton 
            onQuickCapture={onQuickHornetCapture} 
            canAddHornet={canAddHornet} 
          />
        )}
      </div>
      <ErrorAlert error={error} onClose={() => onErrorUpdate(null)} />
    </>
  );
}
