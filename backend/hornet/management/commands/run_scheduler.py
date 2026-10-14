import logging
import time

from django.core.management.base import BaseCommand
from django.db import DatabaseError, connection

from hornet import reminders

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = ("Run the periodic jobs forever (the scheduler service of the compose files): "
            "the trap reminders, every --every seconds.")

    def add_arguments(self, parser):
        parser.add_argument('--every', type=int, default=600, help="Seconds between two passes (600)")

    def handle(self, *args, **options):
        every = max(60, options['every'])
        logger.info("Scheduler started, a pass every %s s", every)
        while True:
            try:
                result = reminders.run()
                if result.get('notifications'):
                    logger.info("Reminders: %s", result)
            except DatabaseError as exc:
                # Typically the API has not applied its migrations yet: try again later
                logger.warning("Scheduler pass skipped, database not ready: %s", exc)
            except Exception:
                logger.exception("Scheduler pass failed")
            finally:
                connection.close()
            time.sleep(every)
