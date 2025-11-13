from django.db import models

# Create your models here.
class Algorithm(models.Model):
    name = models.CharField(max_length=200)
    tegs = models.TextField(default='')
    description = models.TextField(default='')
    code = models.TextField(default='')
    def __str__(self):
        return self.name