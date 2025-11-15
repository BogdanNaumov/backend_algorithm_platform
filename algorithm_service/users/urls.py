from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.custom_login, name='login'),
    path('logout/', views.custom_logout, name='logout'),
    path('profile/<str:username>/', views.user_profile, name='user_profile'),
     path('users/search/', views.user_search, name='user_search'),
]