document.querySelector('.task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const taskInput = document.querySelector('input[name="task"]');
    const taskValue = taskInput.value.trim();

    if (taskValue) {
       
        fetch('/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: taskValue })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
              
                window.location.reload();
            } else {
                alert('Failed to add task');
            }
        });
    }
});

document.querySelectorAll('.update-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskId = form.querySelector('input[name="id"]').value;
        const taskInput = form.querySelector('input[name="task"]').value;
        const completedCheckbox = form.querySelector('input[name="completed"]');
        const completed = completedCheckbox.checked;

        fetch('/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, task: taskInput, completed: completed })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                
                window.location.reload();
            } else {
                alert('Failed to update task');
            }
        });
    });
});

document.querySelectorAll('.delete-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskId = form.querySelector('input[name="id"]').value;

        fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
               
                window.location.reload();
            } else {
                alert('Failed to delete task');
            }
        });
    });
});

document.querySelector('.search-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const searchQuery = document.querySelector('input[name="query"]').value.trim();

    if (searchQuery) {
        fetch('/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchQuery })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                
                const taskList = document.querySelector('.task-list');
                taskList.innerHTML = '';
                data.tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.classList.add('task-item');
                    li.innerHTML = `
                        <form action="/update" method="POST" class="update-form">
                            <input type="hidden" name="id" value="${task.id}">
                            <input type="text" name="task" value="${task.task}" required>
                            <label>
                                Completed:
                                <input type="checkbox" name="completed" ${task.completed ? 'checked' : ''}>
                            </label>
                            <button type="submit" class="update-btn">Update</button>
                        </form>
                        <form action="/delete" method="POST" class="delete-form">
                            <input type="hidden" name="id" value="${task.id}">
                            <button type="submit" class="delete-btn">Delete</button>
                        </form>
                    `;
                    taskList.appendChild(li);
                });
            } else {
                alert('Search failed');
            }
        });
    }
});
