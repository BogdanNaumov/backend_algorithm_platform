from django.shortcuts import render

# Create your views here.

from .models import Algorithm

def algorithm_list(request):
    algorithms = Algorithm.objects.all()
    return render(request, 'algorithms/list.html', {'algorithms': algorithms})