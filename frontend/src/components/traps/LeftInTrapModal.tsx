import { useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import type { Species } from '../../store/store';
import { HelpTip } from '../common';
import { AppModal } from '../ui';
import SpeciesCard from './SpeciesCard';
import { SPECIES_GRID_STYLE } from './speciesGrid';

/** A species counted at the reading, with what the trap held of it */
export interface HeldLine {
  slug: string;
  held: number;
}

interface LeftInTrapModalProps {
  show: boolean;
  /** Back to the emptying question */
  onHide: () => void;
  /** Species the reading found, each at most what was held */
  lines: HeldLine[];
  species: Species[];
  saving: boolean;
  onSave: (left: Record<string, number>) => void;
}

/**
 * Asked when a trap that accumulates could only be partly emptied: what stayed
 * in it, per species found at the reading. Every count starts at zero (taken
 * out), so only what remains is counted, the same way as the reading.
 */
export default function LeftInTrapModal({ show, onHide, lines, species, saving, onSave }: LeftInTrapModalProps) {
  const [left, setLeft] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Back in the reading, a count may have dropped below what was said to stay
    const kept = (line: HeldLine) => Math.min(left[line.slug] ?? 0, line.held);
    if (lines.every((line) => kept(line) === 0)) {
      setError('Rien ne reste : revenez en arrière et choisissez « Vidé ».');
      return;
    }
    setError(null);
    onSave(Object.fromEntries(lines.map((line) => [line.slug, kept(line)])));
  };

  return (
    <AppModal
      show={show}
      onHide={onHide}
      locked
      icon={<i className="bi bi-layers-half" aria-hidden="true" />}
      title={(
        <span className="d-inline-flex align-items-center">
          Ce qui reste
          <HelpTip id="left-help" doc="traps#journal" title="Piège vidé en partie">
            Comptez ce qui est resté dans le piège après l'avoir vidé, une estimation suffit :
            le relevé suivant en déduira les nouvelles prises. L'erreur sur ses prises est celle
            de cette estimation.
          </HelpTip>
        </span>
      )}
      onSubmit={handleSubmit}
      footer={(
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <Spinner animation="border" size="sm" className="me-2" /> : <i className="bi bi-check-lg me-2" aria-hidden="true" />}
          Enregistrer
        </Button>
      )}
    >
      {error && <Alert variant="danger">{error}</Alert>}
      <div style={SPECIES_GRID_STYLE}>
        {lines.map((line) => (
          <div key={line.slug}>
            <SpeciesCard
              species={species.find((item) => item.slug === line.slug)}
              fallbackName={line.slug}
              quantity={Math.min(left[line.slug] ?? 0, line.held)}
              max={line.held}
              onQuantityChange={(quantity) => setLeft((current) => ({ ...current, [line.slug]: quantity }))}
              disabled={saving}
            />
            <div className="small text-center text-muted text-truncate">sur {line.held}</div>
          </div>
        ))}
      </div>
    </AppModal>
  );
}
