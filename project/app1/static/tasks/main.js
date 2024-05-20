$(document).ready(function () {
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    function fetchTasks() {
        $.ajax({
            url: '/api/tasks/',
            method: 'GET',
            success: function (data) {
                $('#task-list').empty();
                data.forEach(task => {
                    $('#task-list').append(`
                        <li data-id="${task.id}">
                            <strong>${task.title}</strong>
                            <p>${task.description}</p>
                            <p>Status: ${task.status}</p>
                            <button class="edit-task">Edit</button>
                            <button class="delete-task">Delete</button>
                        </li>
                    `);
                });
            }
        });
    }

    $('#task-form').on('submit', function (e) {
        e.preventDefault();
        const taskData = {
            title: $('#title').val(),
            description: $('#description').val(),
            status: $('#status').val()
        };
        $.ajax({
            url: '/api/tasks/create/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(taskData),
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function () {
                fetchTasks();
                $('#task-form')[0].reset();
            }
        });
    });

    $('#task-list').on('click', '.delete-task', function () {
        const taskId = $(this).closest('li').data('id');
        $.ajax({
            url: `/api/tasks/delete/${taskId}/`,
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function () {
                fetchTasks();
            }
        });
    });

    $('#task-list').on('click', '.edit-task', function () {
        const taskId = $(this).closest('li').data('id');
        const taskTitle = $(this).siblings('strong').text();
        const taskDescription = $(this).siblings('p').eq(0).text();
        const taskStatus = $(this).siblings('p').eq(1).text().split(': ')[1];

        $('#title').val(taskTitle);
        $('#description').val(taskDescription);
        $('#status').val(taskStatus);

        $('#task-form').off('submit').on('submit', function (e) {
            e.preventDefault();
            const updatedTaskData = {
                title: $('#title').val(),
                description: $('#description').val(),
                status: $('#status').val()
            };
            $.ajax({
                url: `/api/tasks/update/${taskId}/`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedTaskData),
                headers: {
                    'X-CSRFToken': csrftoken
                },
                success: function () {
                    fetchTasks();
                    $('#task-form')[0].reset();
                    $('#task-form').off('submit').on('submit', function (e) {
                        e.preventDefault();
                        const newTaskData = {
                            title: $('#title').val(),
                            description: $('#description').val(),
                            status: $('#status').val()
                        };
                        $.ajax({
                            url: '/api/tasks/create/',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(newTaskData),
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                            success: function () {
                                fetchTasks();
                                $('#task-form')[0].reset();
                            }
                        });
                    });
                }
            });
        });
    });

    $('#filter-status').on('change', function () {
        const filter = $(this).val();
        $('#task-list li').each(function () {
            const status = $(this).find('p').eq(1).text().split(': ')[1];
            if (filter === 'all' || status === filter) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    fetchTasks();
});
