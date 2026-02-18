from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("date", models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120, unique=True)),
                ("category", models.CharField(max_length=80)),
            ],
        ),
        migrations.CreateModel(
            name="OrderProduct",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120)),
                ("package_type", models.CharField(max_length=50)),
                ("quantity", models.DecimalField(decimal_places=2, max_digits=12)),
                ("unit_of_measure", models.CharField(max_length=20)),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="products", to="ordering.order")),
            ],
        ),
        migrations.CreateModel(
            name="ProductQuantity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("age_group", models.CharField(max_length=50)),
                ("unit_of_measure", models.CharField(max_length=20)),
                ("quantity", models.DecimalField(decimal_places=2, max_digits=10)),
                ("package_type", models.CharField(max_length=50)),
                ("product", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="quantities", to="ordering.product")),
            ],
            options={
                "unique_together": {("product", "age_group", "unit_of_measure", "package_type")},
            },
        ),
        migrations.CreateModel(
            name="Recipe",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=120, unique=True)),
                ("products", models.ManyToManyField(blank=True, related_name="recipes", to="ordering.product")),
            ],
        ),
        migrations.CreateModel(
            name="Day",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
                ("recipes", models.ManyToManyField(blank=True, related_name="days", to="ordering.recipe")),
            ],
        ),
    ]
