from django.urls import path
from . import views

urlpatterns = [
    path('', views.algorithm_list, name='algorithm_list'),
]