from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Algorithm
from .forms import AlgorithmForm

def algorithm_list(request):
    query = request.GET.get('q')
    
    if query:
        algorithms = Algorithm.objects.filter(
            Q(name__icontains=query) | 
            Q(tegs__icontains=query) |
            Q(description__icontains=query) |
            Q(author_name__icontains=query)
        )
    else:
        algorithms = Algorithm.objects.all()
    
    return render(request, 'algorithms/list.html', {
        'algorithms': algorithms,
        'query': query
    })

def algorithm_detail(request, algorithm_id):
    algorithm = get_object_or_404(Algorithm, id=algorithm_id)
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
            algorithm.save()
            messages.success(request, 'Алгоритм успешно добавлен!')
            return redirect('algorithm_list')
    else:
        form = AlgorithmForm()
    
    return render(request, 'algorithms/add_algorithm.html', {'form': form})