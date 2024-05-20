from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, HttpResponse
from .models import Task
import json

def index(request):
    if request.method=='POST':
        task = Task.objects.create(title=request.POST['title'],
                                    description=request.POST['description'] , 
                                    status=request.POST['status']  )
        print("hello")
        task.save()
    return render(request, 'tasks/index.html')

def get_tasks(request):
    tasks = Task.objects.all().values()
    return JsonResponse(list(tasks), safe=False)

def create_task(request):
    data = json.loads(request.body)
    task = Task(title=data['title'], description=data['description'], status=data['status'])
    task.save()
    return JsonResponse({'id': task.id, 'title': task.title, 'description': task.description, 'status': task.status})

def update_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    data = json.loads(request.body)
    task.title = data['title']
    task.description = data['description']
    task.status = data['status']
    task.save()
    return JsonResponse({'id': task.id, 'title': task.title, 'description': task.description, 'status': task.status})

def delete_task(request, task_id):
    task = get_object_or_404(Task, id=task_id)
    task.delete()
    return HttpResponse(status=204)
