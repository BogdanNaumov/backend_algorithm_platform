from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.auth.models import User
from django.db.models import Q, Count
from algorithms.models import Algorithm
from .forms import RegisterForm

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Регистрация прошла успешно!')
            return redirect('home')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки ниже.')
    else:
        form = RegisterForm()
    
    return render(request, 'users/register.html', {'form': form})

def custom_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли в систему.')
            return redirect('home')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль.')
    
    return render(request, 'users/login.html')

def custom_logout(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы.')
    return redirect('home')

def user_profile(request, username):
    """
    Отображает профиль пользователя и его алгоритмы.
    """
    try:
        # Пытаемся найти пользователя
        user = User.objects.get(username=username)
        
        # Получаем все алгоритмы этого пользователя
        user_algorithms = Algorithm.objects.filter(author_name=username).order_by('-created_at')
        
        # Статистика по статусам
        approved_count = user_algorithms.filter(status=Algorithm.STATUS_APPROVED).count()
        pending_count = user_algorithms.filter(status=Algorithm.STATUS_PENDING).count()
        rejected_count = user_algorithms.filter(status=Algorithm.STATUS_REJECTED).count()
        
        context = {
            'profile_user': user,
            'algorithms': user_algorithms,
            'approved_count': approved_count,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
        }
        
        return render(request, 'users/profile.html', context)
    
    except User.DoesNotExist:
        # Если пользователь не найден - показываем кастомную страницу
        return render(request, 'users/profile_not_found.html', 
                     {'username': username}, status=404)

def user_search(request):
    """
    Поиск пользователей по имени.
    """
    query = request.GET.get('q', '').strip()
    users = []
    
    if query:
        # Ищем пользователей по username
        users = User.objects.filter(
            Q(username__icontains=query)
        ).order_by('username')
        
        # Для каждого пользователя вычисляем количество алгоритмов
        for user in users:
            user.algorithm_count = Algorithm.objects.filter(author_name=user.username).count()
    
    context = {
        'query': query,
        'users': users,
    }
    
    return render(request, 'users/user_search.html', context)