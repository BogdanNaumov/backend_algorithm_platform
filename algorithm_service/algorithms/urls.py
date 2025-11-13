from django.urls import path
from . import views

urlpatterns = [
    path('', views.algorithm_list, name='algorithm_list'),
    path('add/', views.add_algorithm, name='add_algorithm'),
    path('register/', views.register, name='register'),
    path('login/', views.custom_login, name='login'),    
    path('logout/', views.custom_logout, name='logout'), 
]