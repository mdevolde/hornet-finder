"""Readings of a trap that could only be partly emptied: what stayed in it."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("hornet", "0024_species_other_last"),
    ]

    operations = [
        migrations.AddField(
            model_name="trapevent",
            name="left_quantity",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddConstraint(
            model_name="trapevent",
            constraint=models.CheckConstraint(
                condition=models.Q(
                    ("left_quantity__isnull", True),
                    models.Q(
                        ("emptied", False),
                        ("kind", "catch"),
                        ("left_quantity__lte", models.F("observed_quantity")),
                    ),
                    _connector="OR",
                ),
                name="trapevent_left_quantity",
            ),
        ),
    ]
