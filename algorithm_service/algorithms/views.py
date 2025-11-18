from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.utils import timezone
from .models import Algorithm
from .forms import AlgorithmForm, AlgorithmModerationForm

def is_moderator(user):
    """Проверяет, является ли пользователь модератором"""
    return user.is_authenticated and (user.is_staff or user.groups.filter(name='Модераторы').exists())

def algorithm_list(request):
    query = request.GET.get('q')
    
    # Показываем только одобренные алгоритмы для обычных пользователей
    if query:
        algorithms = Algorithm.objects.filter(
            Q(name__icontains=query) | 
            Q(tegs__icontains=query) |
            Q(description__icontains=query) |
            Q(author_name__icontains=query),
            status=Algorithm.STATUS_APPROVED  # Только одобренные
        )
    else:
        algorithms = Algorithm.objects.filter(status=Algorithm.STATUS_APPROVED)
    
    return render(request, 'algorithms/list.html', {
        'algorithms': algorithms,
        'query': query
    })

def algorithm_detail(request, algorithm_id):
    algorithm = get_object_or_404(Algorithm, id=algorithm_id)
    
    # Проверяем права на просмотр с помощью метода модели
    if not algorithm.can_view(request.user):
        messages.error(request, 'У вас нет прав для просмотра этого алгоритма.')
        return redirect('algorithm_list')
    
    return render(request, 'algorithms/algorithm_detail.html', {
        'algorithm': algorithm
    })

@login_required
def add_algorithm(request):
    if request.method == 'POST':
        form = AlgorithmForm(request.POST)
        if form.is_valid():
            algorithm = form.save(commit=False)
            algorithm.author_name = request.user.username
            algorithm.status = Algorithm.STATUS_PENDING  # Статус "на модерации"
            algorithm.save()
            messages.success(request, 'Алгоритм успешно добавлен и отправлен на модерацию!')
            return redirect('algorithm_list')
    else:
        form = AlgorithmForm()
    
    return render(request, 'algorithms/add_algorithm.html', {'form': form})

@login_required
def edit_algorithm(request, algorithm_id):
    algorithm = get_object_or_404(Algorithm, id=algorithm_id)
    
    # Разрешаем редактирование только автору
    if not algorithm.can_edit(request.user):
        messages.error(request, 'Вы не можете редактировать этот алгоритм.')
        return redirect('algorithm_detail', algorithm_id=algorithm_id)
    
    if request.method == 'POST':
        form = AlgorithmForm(request.POST, instance=algorithm)
        if form.is_valid():
            algorithm = form.save(commit=False)
            
            # Если алгоритм был одобрен или отклонен, сбрасываем модерацию
            if algorithm.status in [Algorithm.STATUS_APPROVED, Algorithm.STATUS_REJECTED]:
                algorithm.reset_moderation()
                messages.success(request, 'Алгоритм успешно обновлен и отправлен на повторную модерацию!')
            else:
                messages.success(request, 'Алгоритм успешно обновлен!')
                
            algorithm.save()
            return redirect('algorithm_detail', algorithm_id=algorithm_id)
    else:
        form = AlgorithmForm(instance=algorithm)
    
    return render(request, 'algorithms/edit_algorithm.html', {
        'form': form,
        'algorithm': algorithm
    })

@login_required
@user_passes_test(is_moderator)
def moderation_list(request):
    """Список алгоритмов на модерации"""
    pending_algorithms = Algorithm.objects.filter(status=Algorithm.STATUS_PENDING).order_by('created_at')
    
    return render(request, 'algorithms/moderation_list.html', {
        'algorithms': pending_algorithms
    })

@login_required
@user_passes_test(is_moderator)
def moderate_algorithm(request, algorithm_id):
    """Страница модерации конкретного алгоритма"""
    algorithm = get_object_or_404(Algorithm, id=algorithm_id)
    
    if request.method == 'POST':
        form = AlgorithmModerationForm(request.POST, instance=algorithm)
        if form.is_valid():
            algorithm = form.save(commit=False)
            algorithm.moderated_by = request.user
            algorithm.moderated_at = timezone.now()
            algorithm.save()
            
            if algorithm.is_approved:
                messages.success(request, f'Алгоритм "{algorithm.name}" одобрен и опубликован.')
            else:
                messages.success(request, f'Алгоритм "{algorithm.name}" отклонен.')
            
            return redirect('moderation_list')
    else:
        form = AlgorithmModerationForm(instance=algorithm)
    
    return render(request, 'algorithms/moderate_algorithm.html', {
        'form': form,
        'algorithm': algorithm
    })