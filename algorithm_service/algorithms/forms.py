from django import forms
from .models import Algorithm

class AlgorithmForm(forms.ModelForm):
    class Meta:
        model = Algorithm
        fields = ['name', 'tegs', 'description', 'code']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Название алгоритма'
            }),
            'tegs': forms.TextInput(attrs={
                'class': 'form-control', 
                'placeholder': 'Теги через запятую'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Описание алгоритма',
                'rows': 4
            }),
            'code': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Код алгоритма',
                'rows': 8
            }),
        }