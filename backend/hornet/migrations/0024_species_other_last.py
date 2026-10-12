"""Put "Autre / indéterminé" back at the end of the species list.

A species added after the seed got `max + 1` (1000 and up), past "other"
(999); a reorder could also leave "other" anywhere. From now on the API keeps
it last (`Species.keep_other_last`); this fixes the rows already recorded.
"""

from django.db import migrations
from django.db.models import Max


def other_last(apps, schema_editor):
    Species = apps.get_model('hornet', 'Species')
    other = Species.objects.filter(slug='other').first()
    if other is None:
        return
    last = Species.objects.exclude(pk=other.pk).aggregate(last=Max('sort_order'))['last']
    if last is not None and other.sort_order <= last:
        Species.objects.filter(pk=other.pk).update(sort_order=last + 1)


class Migration(migrations.Migration):

    dependencies = [
        ("hornet", "0023_afsca_number_format"),
    ]

    operations = [
        migrations.RunPython(other_last, migrations.RunPython.noop),
    ]
