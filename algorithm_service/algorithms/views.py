from django.shortcuts import render, redirect
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