/**
 * 待办清单 — 原生 JS 示例
 * 数据存在 localStorage，键名如下（不要和其它项目冲突可改这里）
 */
var STORAGE_KEY = "todo-app-tasks";

var taskInput = document.getElementById("task-input");
var addForm = document.getElementById("add-form");
var taskListEl = document.getElementById("task-list");
var errorMsg = document.getElementById("error-msg");

// 内存里的任务列表，结构和 localStorage 里存的一样
var tasks = [];

/**
 * 从 localStorage 读出任务数组；读失败或格式不对就返回空数组
 */
function loadTasks() {
  var raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    var data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }
    return data.filter(function (item) {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.completed === "boolean"
      );
    });
  } catch (e) {
    return [];
  }
}

/**
 * 把当前 tasks 存回 localStorage
 */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * 生成不重复的简单 id（练习项目够用）
 */
function newId() {
  return String(Date.now()) + "-" + String(Math.random()).slice(2, 8);
}

function hideError() {
  errorMsg.hidden = true;
}

function showError() {
  errorMsg.hidden = false;
}

/**
 * 根据 tasks 数组重新画列表
 */
function render() {
  taskListEl.innerHTML = "";

  if (tasks.length === 0) {
    var tip = document.createElement("p");
    tip.className = "empty-tip";
    tip.textContent = "还没有任务，在上方输入一条试试吧。";
    taskListEl.appendChild(tip);
    return;
  }

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];

    var li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "标记完成：" + task.text);
    (function (t) {
      checkbox.addEventListener("change", function () {
        toggleComplete(t.id);
      });
    })(task);

    var span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "task-delete";
    delBtn.textContent = "删除";
    delBtn.setAttribute("aria-label", "删除：" + task.text);
    (function (t) {
      delBtn.addEventListener("click", function () {
        deleteTask(t.id);
      });
    })(task);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    taskListEl.appendChild(li);
  }
}

/**
 * 添加任务：去掉首尾空格，空的不加
 */
function addTask() {
  var text = taskInput.value.trim();
  hideError();

  if (text === "") {
    showError();
    return;
  }

  tasks.push({
    id: newId(),
    text: text,
    completed: false,
  });
  saveTasks();
  taskInput.value = "";
  taskInput.focus();
  render();
}

function toggleComplete(id) {
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) {
      tasks[i].completed = !tasks[i].completed;
      break;
    }
  }
  saveTasks();
  render();
}

function deleteTask(id) {
  var next = [];
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id !== id) {
      next.push(tasks[i]);
    }
  }
  tasks = next;
  saveTasks();
  render();
}

// 输入时隐藏错误提示
taskInput.addEventListener("input", hideError);

// 表单提交：点「添加」或输入框里按回车都会触发
addForm.addEventListener("submit", function (e) {
  e.preventDefault();
  addTask();
});

// 启动：先读存储，再画界面
tasks = loadTasks();
render();
