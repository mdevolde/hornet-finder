import logging
import time

from django.core.management.base import BaseCommand
from django.db import DatabaseError, connection

from hornet import push, reminders

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ("Run the periodic jobs forever (the scheduler service of the compose files): "
            "the trap reminders and the retention of the notifications, every --every seconds.")

    def add_arguments(self, parser):
        parser.add_argument('--every', type=int, default=600, help="Seconds between two passes (600)")

    def handle(self, *args, **options):
        every = max(60, options['every'])
        logger.info("Scheduler started, a pass every %s s", every)
        while True:
            # Each job on its own: one failing does not hold back the others
            for name, job in (('reminders', self.send_reminders), ('push retention', push.purge_expired)):
                try:
                    job()
                except DatabaseError as exc:
                    # Typically the API has not applied its migrations yet: try again later
                    logger.warning("Scheduler job %s skipped, database not ready: %s", name, exc)
                except Exception:
                    logger.exception("Scheduler job %s failed", name)
                finally:
                    connection.close()
            time.sleep(every)

    @staticmethod
    def send_reminders():
        result = reminders.run()
        if result.get('notifications'):
            logger.info("Reminders: %s", result)
