"""
The end of a season of nests.

A nest serves one season and is never reoccupied: the colony dies during the
winter. On `SEASON_END` (1 March), the nests of the previous seasons still
reported or confirmed are marked abandoned, with an entry "Fin de saison" in
their journal. Run by the scheduler service at every pass; idempotent (only
open nests are touched). Nobody is notified.
"""

import datetime
import logging

from django.db import transaction
from django.utils import timezone

from audit import recorder as audit
from .models import Nest, NestEvent

logger = logging.getLogger(__name__)

SEASON_END = (3, 1)


def cutoff(now=None):
    """Nests created before this moment have seen their season end."""
    local = timezone.localtime(now or timezone.now())
    year = local.year if (local.month, local.day) >= SEASON_END else local.year - 1
    return timezone.make_aware(datetime.datetime(year, 1, 1))


def run(now=None, dry_run=False) -> dict:
    now = now or timezone.now()
    nests = Nest.objects.filter(created_at__lt=cutoff(now), status__in=Nest.OPEN_STATUSES)
    ids = list(nests.values_list('pk', flat=True))
    if dry_run or not ids:
        return {'abandoned': len(ids)}
    with transaction.atomic():
        for nest in Nest.objects.select_for_update().filter(pk__in=ids, status__in=Nest.OPEN_STATUSES):
            NestEvent.objects.create(nest=nest, kind=NestEvent.KIND_SEASON_END, performed_at=now, alerted_at=now)
            nest.recompute_status()
        audit.record(None, 'nest.season_ended', ('nest', None), changes={'count': len(ids)},
                     refs=[audit.ref('nest', pk) for pk in ids])
    logger.info("Season end: %s nest(s) marked abandoned", len(ids))
    return {'abandoned': len(ids)}
