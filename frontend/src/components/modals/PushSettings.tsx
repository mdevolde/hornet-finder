import { Alert, Form, Spinner } from 'react-bootstrap';
import { HelpTip } from '../common';
import { FieldRow, IconButton } from '../ui';
import { usePush } from '../../hooks/usePush';

/**
 * Notifications of this device, in the profile dialog: on or off, and a test
 * to check that a message arrives. Hidden when the server has no VAPID keys.
 */
export default function PushSettings() {
  const push = usePush();
  if (!push.config?.enabled) return null;

  const blocked = push.permission === 'denied';
  const usable = push.support === 'ok' && !blocked;

  return (
    <>
      <FieldRow
        label={(
          <>
            Notifications
            <HelpTip id="push-help" title="Notifications">
              Les administrateurs de votre groupe peuvent vous écrire : le message s'affiche sur cet appareil, même
              application fermée. Le réglage vaut pour cet appareil seulement. Sur iPhone et iPad (iOS 16.4 ou plus),
              il faut d'abord ajouter l'application à l'écran d'accueil.
            </HelpTip>
          </>
        )}
      >
        {push.support === 'install-ios' && <span className="text-muted">Ajoutez l'application à l'écran d'accueil</span>}
        {push.support === 'unsupported' && <span className="text-muted">Non prises en charge ici</span>}
        {push.support === 'ok' && blocked && <span className="text-muted">Bloquées dans le navigateur</span>}
        {usable && (
          <span className="d-inline-flex align-items-center gap-2">
            {push.busy && <Spinner animation="border" size="sm" />}
            {push.subscribed && (
              <IconButton
                variant="outline-secondary"
                icon="bell"
                label="Envoyer un essai"
                showLabel="never"
                disabled={push.busy}
                onClick={() => void push.test()}
              />
            )}
            <Form.Check
              type="switch"
              id="push-switch"
              aria-label="Activer les notifications sur cet appareil"
              checked={push.subscribed}
              disabled={push.busy}
              onChange={() => void (push.subscribed ? push.disable() : push.enable())}
            />
          </span>
        )}
      </FieldRow>
      {push.error && <Alert variant="danger" className="mt-2 mb-0">{push.error}</Alert>}
      {push.notice && <Alert variant="success" className="mt-2 mb-0">{push.notice}</Alert>}
    </>
  );
}
