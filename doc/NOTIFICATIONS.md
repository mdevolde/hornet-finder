# Notifications push

Un administrateur écrit à un membre ou à tout un groupe ; le message s'affiche sur l'écran des appareils abonnés, application fermée. Premier objectif : mesurer comment les notifications se comportent en PWA selon les plateformes.

## Fonctionnement

- **Abonnement** : chaque utilisateur active les notifications **par appareil** (Mon profil → Notifications). Le navigateur donne une adresse (*endpoint*) chez son service de notification (FCM pour Chrome et Android, Mozilla, Apple) et deux clés de chiffrement ; l'API les garde (`PushSubscription`). Un même appareil appartient à une seule personne : à la connexion de quelqu'un d'autre sur le téléphone, l'abonnement lui passe (`usePushRebind`), et il est retiré à la déconnexion.
- **Identité de l'API (VAPID, RFC 8292)** : une paire de clés par environnement signe chaque envoi. Générer avec `docker compose run --rm --no-deps <service api> python manage.py generate_vapid_keys`, puis `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (secrète) et au besoin `VAPID_SUBJECT` dans `.env`. Sans clés, l'application ne propose pas les notifications. Changer les clés désabonne tous les appareils.
- **Envoi** : depuis la liste des membres d'un groupe (*Administration → Mon groupe / Groupes / Piégeurs*), « Notifier le groupe » ou « Notifier » sur un membre. Mêmes droits que la liste : administrateur du groupe pour son groupe, administrateur de la plateforme partout (`/trappers` contient tous les comptes, donc atteint tout le monde ou n'importe qui). Les administrateurs de `/hunters` n'ont pas encore de liste de membres, donc pas d'envoi. L'expéditeur n'est jamais destinataire. Titre ≤ 60 caractères, texte ≤ 200, 10 envois par heure et par expéditeur.
- **Livraison** : l'API crée un `PushDelivery` par appareil et envoie en arrière-plan (8 envois en parallèle). Le service de notification répond 201 (pris en charge), 404/410 (appareil désabonné : l'abonnement est supprimé) ou une erreur.
- **Accusé de réception** : le service worker (`frontend/src/sw.ts`) affiche la notification puis appelle `POST /api/push/ack/<id>/` (sans session ; l'identifiant, non devinable, est le seul justificatif). Le délai entre l'envoi et l'accusé est affiché dans *Administration → Notifications* (administrateurs de la plateforme).
- **Journal d'audit** : `notification.sent` garde le titre et les effectifs, jamais le texte.

## Ce qu'on attend des plateformes (à vérifier par appareil)

| Plateforme | Attendu |
|---|---|
| Android, Chrome (onglet ou PWA installée) | Fonctionne, application fermée. Les économiseurs de batterie de certains constructeurs peuvent retarder la réception. |
| iPhone / iPad, iOS 16.4 ou plus | **Seulement dans la PWA ajoutée à l'écran d'accueil** ; l'autorisation se demande depuis cette application. Pas de push dans un onglet Safari. |
| Ordinateur : Chrome, Edge, Firefox, Safari (macOS 13+) | Fonctionne ; navigateur fermé, cela dépend du système. |

Une notification doit toujours s'afficher : iOS et Chrome retirent l'autorisation d'un site dont les pushes ne montrent rien (le worker affiche même un message sans contenu lisible).

## Protocole de test

1. En dev, générer et renseigner les clés, `./deploy.sh`.
2. Sur chaque appareil (Android Chrome, iPhone PWA installée, ordinateur) : se connecter, *Mon profil → Notifications* → activer, puis le bouton d'essai.
3. Avec un second compte administrateur de groupe : « Notifier » un membre, puis le groupe.
4. *Administration → Notifications* : statut (accepté / appareil retiré / injoignable) et délai d'affichage de chaque appareil. Tester aussi application fermée, écran verrouillé, mode économie d'énergie.

## Limites connues

- Le contenu s'affiche sur l'écran verrouillé : rien de confidentiel.
- « Accepté » ne dit pas que la personne a vu le message ; seul l'accusé du worker le dit.
- Pas de repli par email, pas d'historique côté destinataire, pas d'envoi à `/hunters` ni à « tout le monde » d'un clic (passer par `/trappers`).
