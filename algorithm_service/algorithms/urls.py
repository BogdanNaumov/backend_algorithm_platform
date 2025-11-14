from django.urls import path
from . import views

urlpatterns = [
    path('algorithms/', views.algorithm_list, name='algorithm_list'),
    path('algorithms/add/', views.add_algorithm, name='add_algorithm'),
]