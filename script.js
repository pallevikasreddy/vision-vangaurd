// Select elements
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

// Check for Notification API permissions
if (Notification.permission === 'default') {
  Notification.requestPermission();
}

// Load tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks.forEach(displayTask);

// Add Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = taskForm['task-title'].value;
  const priority = taskForm['task-priority'].value;
  const date = taskForm['task-date'].value;
  const time = taskForm['task-time'].value;
  const notify = taskForm['task-notification'].checked;

  const task = { id: Date.now(), title, priority, date, time, notify };
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  displayTask(task);
  taskForm.reset();
});

// Display Task
function displayTask(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  li.dataset.id = task.id;

  li.innerHTML = `
    <span>
      <strong>${task.title}</strong> <br>
      Priority: ${task.priority} <br>
      Due: ${task.date} at ${task.time}
    </span>
    <div class="task-actions">
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
      <button class="calendar-btn">📅</button>
    </div>
  `;

  taskList.appendChild(li);

  // Add Event Listeners for Actions
  li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
  li.querySelector('.edit-btn').addEventListener('click', () => editTask(task));
  li.querySelector('.calendar-btn').addEventListener('click', () => openCalendar(task));

  // Schedule Notification
  if (task.notify) scheduleSystemNotification(task);
}

// Delete Task
function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem('tasks', JSON.stringify(tasks));
  document.querySelector(`[data-id="${taskId}"]`).remove();
}

// Edit Task
function editTask(task) {
  taskForm['task-title'].value = task.title;
  taskForm['task-priority'].value = task.priority;
  taskForm['task-date'].value = task.date;
  taskForm['task-time'].value = task.time;

  deleteTask(task.id);
}

// Open Google Calendar
function openCalendar(task) {
  const start = new Date(`${task.date}T${task.time}`).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const end = new Date(new Date(`${task.date}T${task.time}`).getTime() + 3600000) // +1 hour
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, '');
  const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(task.title)}&dates=${start}/${end}&details=${encodeURIComponent('Task from Task Manager')}`;
  window.open(url, '_blank');
}

// Schedule System Notification
function scheduleSystemNotification(task) {
  const taskTime = new Date(`${task.date}T${task.time}`);
  const now = new Date();

  const timeout = taskTime - now;
  if (timeout > 0) {
    setTimeout(() => {
      showNotification(task.title, `Your task "${task.title}" is due now!`);
    }, timeout);
  } else {
    console.log(`Task "${task.title}" is already due.`);
  }
}

// Show Notification
function showNotification(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'https://via.placeholder.com/128', // Replace with your custom icon URL
    });
  } else {
    alert(`Notification: ${body}`);
  }
}
