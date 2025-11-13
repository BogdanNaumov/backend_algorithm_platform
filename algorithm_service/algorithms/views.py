from django.shortcuts import render, redirect
from django.db.models import Q
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from .models import Algorithm
from .forms import AlgorithmForm, RegisterForm

def algorithm_list(request):
    query = request.GET.get('q')
    
    if query:
        algorithms = Algorithm.objects.filter(
            Q(name__icontains=query) | 
            Q(tegs__icontains=query)
        )
    else:
        algorithms = Algorithm.objects.all()
    
    return render(request, 'algorithms/list.html', {
        'algorithms': algorithms,
        'query': query
    })

def add_algorithm(request):
    if request.method == 'POST':
        form = AlgorithmForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('algorithm_list')
    else:
        form = AlgorithmForm()
    
    return render(request, 'algorithms/add_algorithm.html', {'form': form})

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Регистрация прошла успешно!')
            return redirect('algorithm_list')
        else:
            messages.error(request, 'Пожалуйста, исправьте ошибки ниже.')
    else:
        form = RegisterForm()
    
    return render(request, 'algorithms/register.html', {'form': form})

def custom_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли в систему.')
            return redirect('algorithm_list')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль.')
    
    return render(request, 'algorithms/login.html')

def custom_logout(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы.')
    return redirect('algorithm_list')