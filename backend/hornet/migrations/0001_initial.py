# Generated by Django 5.2 on 2025-06-30 13:23

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Apiary',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('longitude', models.FloatField()),
                ('latitude', models.FloatField()),
                ('infestation_level', models.IntegerField(choices=[(1, 'Light'), (2, 'Medium'), (3, 'High')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.CharField(blank=True, max_length=255, null=True)),
                ('comments', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Nest',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('longitude', models.FloatField()),
                ('latitude', models.FloatField()),
                ('public_place', models.BooleanField(default=False)),
                ('address', models.CharField(max_length=255)),
                ('destroyed', models.BooleanField(default=False)),
                ('destroyed_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('comments', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Hornet',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('longitude', models.FloatField()),
                ('latitude', models.FloatField()),
                ('direction', models.IntegerField()),
                ('duration', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.CharField(blank=True, max_length=255, null=True)),
                ('linked_nest', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='hornet.nest')),
            ],
        ),
    ]
