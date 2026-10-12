import { ListGroup } from 'react-bootstrap';
import { HelpTip } from '../common';
import { BottomSheet } from '../ui';

/** What became of the trap's contents after the reading */
export type EmptyingAnswer = 'emptied' | 'partly' | 'left';

interface EmptiedQuestionSheetProps {
  show: boolean;
  /** Back to the reading, as if nothing was chosen */
  onHide: () => void;
  onAnswer: (answer: EmptyingAnswer) => void;
  /** Offer "partly emptied": not when the trap held nothing to leave */
  canPartly: boolean;
}

/**
 * Asked when the reading of a trap that accumulates is saved: was it emptied?
 * A question rather than a field of the form, so it cannot be skipped: the
 * answer sets what the next reading counts from.
 */
export default function EmptiedQuestionSheet({ show, onHide, onAnswer, canPartly }: EmptiedQuestionSheetProps) {
  const choices: { key: EmptyingAnswer; icon: string; label: string; detail: string }[] = [
    { key: 'emptied', icon: 'arrow-counterclockwise', label: 'Vidé', detail: 'Compteurs remis à zéro' },
    ...(canPartly
      ? [{ key: 'partly' as const, icon: 'layers-half', label: 'Vidé en partie', detail: 'Compter ce qui reste' }]
      : []),
    { key: 'left', icon: 'stack', label: 'Laissé en place', detail: 'Compteurs conservés' },
  ];

  return (
    <BottomSheet
      show={show}
      onHide={onHide}
      title={(
        <span className="d-inline-flex align-items-center">
          Le piège a-t-il été vidé ?
          <HelpTip id="emptied-help" doc="traps#journal" title="Piège vidé ou laissé en place">
            Les nouvelles prises sont déduites de ce que le piège contenait au relevé précédent.
            Un piège laissé en place garde ses insectes : ils ne sont pas comptés une seconde fois
            au relevé suivant. S'il n'a pas pu être vidé entièrement, choisissez « Vidé en partie »
            et comptez ce qui reste : une estimation vaut mieux que « Vidé » (le reste serait compté
            deux fois) ou « Laissé en place » (les prises suivantes seraient perdues).
          </HelpTip>
        </span>
      )}
    >
      <ListGroup variant="flush">
        {choices.map((choice) => (
          <ListGroup.Item
            key={choice.key}
            action
            onClick={() => onAnswer(choice.key)}
            className="d-flex align-items-center gap-3 px-1 py-2"
          >
            <i className={`bi bi-${choice.icon} fs-5 flex-shrink-0`} aria-hidden="true" />
            <span className="min-w-0">
              <span className="d-block">{choice.label}</span>
              <span className="d-block small text-muted text-truncate">{choice.detail}</span>
            </span>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </BottomSheet>
  );
}
