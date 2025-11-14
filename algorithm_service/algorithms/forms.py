from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
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

class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user