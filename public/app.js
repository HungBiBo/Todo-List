document.addEventListener('DOMContentLoaded', () => {
    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            tasks = data;
            displayTasks();
        });
});

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        const newTask = { text: taskText, completed: false };

        fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        })
        .then(response => response.json())
        .then(data => {
            newTask.id = data.id;
            tasks.push(newTask);
            displayTasks();
        });

        taskInput.value = '';
    }
}

function deleteTask(index) {
    const taskId = tasks[index].id;

    fetch(`/delete/${taskId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        tasks.splice(index, 1);
        displayTasks();
    });
}

function editTask(index, newText) {
    const taskId = tasks[index].id;
    const updatedTask = { text: newText };

    fetch(`/update/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    })
    .then(response => response.json())
    .then(data => {
        tasks[index].text = newText;
        displayTasks();
    });
}

function toggleCompleted(index) {
    const taskId = tasks[index].id;
    const status = {completed: true};

    fetch(`/done/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
    })
    .then(response => response.json())
    .then(data => {
        tasks[index].completed = true;
        displayTasks();
    });
}

// Cập nhật hàm displayTasks
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        // Chỉ hiển thị task nếu trường completed là false
        if (!task.completed) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${task.text}</span>
                <input type="text" value="${task.text}" onblur="editTask(${index}, this.value)">
                <button onclick="deleteTask(${index})">Delete</button>
                <button onclick="toggleCompleted(${index})">Done</button>
            `;
            taskList.appendChild(li);
        }
    });
}