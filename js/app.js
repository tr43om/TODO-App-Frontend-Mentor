"use strict";
let todosCount = 0;

/* --------- CLASSES --------- */
// Template for todo
class Todo {
  constructor(task, num, isdone) {
    this.task = task;
    this.num = num;
    this.isdone = isdone;
  }
}

// UI Class: Handle UI Tasks
class UI {
  // Switch theme for an app
  static switchTheme() {
    const app = document.querySelector(".app");

    app.classList.toggle("dark");

    // Add information about theme in local storage
    if (app.classList.contains("dark"))
      localStorage.setItem("dark-theme", JSON.stringify(true));
    else localStorage.setItem("dark-theme", JSON.stringify(false));
  }

  static displayTodos() {
    const todos = Store.getTodos();

    todos.forEach((todo) => UI.addTodoToList(todo));
  }

  static addTodoToList(todo) {
    const list = document.querySelector(".todo__list");

    // prettier-ignore
    const html = `<li class="todo__item ${todo.isdone ? "todo__item--done" : "" }" data-todo="${todo.num}">
     <label class="todo__label ">
        <input type="checkbox" class="todo__checkbox" id="todo" ${
          todo.isdone ? "checked" : ""
        }/>
        <p>${todo.task}</p>
     </label>
        <button class="todo__delete"></button>
    </li>`;

    // Add todo to the list
    list.insertAdjacentHTML("beforeend", html);

    // Increase total count and display it
    if (!todo.isdone) this.updateTodoCount("+");
  }

  static deleteTodo(e) {
    const btn = e.target;
    const item = btn.parentElement;
    const todo = document.querySelector(`[data-todo="${item.dataset.todo}"]`);

    // If it's not a cross buttons, then return
    if (!btn.classList.contains("todo__delete")) return;

    // remove element from UI

    todo.remove();

    if (!todo.classList.contains("todo__item--done"))
      // Update todos count
      this.updateTodoCount("-");
  }

  // Update info about items left
  static updateTodoCount(sign) {
    const countLabel = document.querySelector(".todo__left");

    if (sign === "+") todosCount++;
    if (sign === "-") todosCount--;

    countLabel.textContent = todosCount;
  }

  static showActive() {
    const todos = Store.getTodos();

    // Hides all todos
    todos.forEach((todo) => this.hideTodos(todo));

    // Active todos
    const active = todos.filter((todo) => todo.isdone === false);

    // Shows all todos, which are active
    active.forEach((todo) => this.showTodos(todo));
  }

  static showAll() {
    // Displays all todos
    Store.getTodos().forEach((todo) => this.showTodos(todo));
  }

  static showCompleted() {
    const todos = Store.getTodos();

    // Hides all todos
    todos.forEach((todo) => this.hideTodos(todo));

    // Completed todos
    const completed = todos.filter((todo) => todo.isdone === true);

    // Shows all todos, which are done
    completed.forEach((todo) => this.showTodos(todo));
  }

  static hideTodos(todo) {
    return (document.querySelector(`[data-todo="${todo.num}"]`).style.display =
      "none");
  }

  static showTodos(todo) {
    return (document.querySelector(`[data-todo="${todo.num}"]`).style.display =
      "flex");
  }

  static removeCompleted() {
    const todos = Store.getTodos();
    const completed = todos.filter((todo) => todo.isdone === true);

    completed.forEach((todo) => {
      document.querySelector(`[data-todo="${todo.num}"]`).remove();
      Store.removeTodo(todo.num);
    });
  }

  // Clear input field
  static clearInput = () => (document.querySelector(".todo__input").value = "");
}

// Store Class: Handles Storage
class Store {
  static getTodos() {
    let todos;
    if (localStorage.getItem("todos") === null) {
      todos = [];
    } else {
      todos = JSON.parse(localStorage.getItem("todos"));
    }

    return todos;
  }

  static addTodo(todo) {
    const todos = Store.getTodos();

    todos.push(todo);

    localStorage.setItem("todos", JSON.stringify(todos));
  }

  static removeTodo(num) {
    const todos = Store.getTodos();

    todos.forEach((todo, index) => {
      if (todo.num == num) {
        todos.splice(index, 1);
      }
    });

    localStorage.setItem("todos", JSON.stringify(todos));
  }
}

/* --------- HELPER FUNCTIONS --------- */
const activateBtn = (e) => {
  document
    .querySelectorAll(".btn")
    .forEach((button) => button.classList.remove("btn--accent"));

  e.target.classList.add("btn--accent");
};

/* --------- EVENTS --------- */
// Event: Display Books
document.addEventListener("DOMContentLoaded", () => {
  UI.displayTodos();
  if (JSON.parse(localStorage.getItem("dark-theme")))
    document.querySelector(".app").classList.add("dark");
});

// Event: Add a todo
document.querySelector(".todo__input").addEventListener("change", (e) => {
  const task = document.querySelector(".todo__input").value;
  const num = Date.now().toString();
  const isdone = false;

  // Validate
  if (task === "") return;

  // Instatiate todo
  const todo = new Todo(task, num, isdone);

  // Add todo to UI
  UI.addTodoToList(todo);

  // Add todo to localStorage
  Store.addTodo(todo);

  // Clear input field
  UI.clearInput();
});

// Event: Remove a todo
document.querySelector(".todo__list").addEventListener("click", (e) => {
  // If it's not a cross buttons, then return
  if (!e.target.classList.contains("todo__delete")) return;
  // Remove todo from UI
  UI.deleteTodo(e);

  // Remove todo from localStorage
  Store.removeTodo(e.target.parentElement.dataset.todo);
});

// Event: change DONE state
document.querySelector(".todo__list").addEventListener("click", (e) => {
  // When you click on todo it 'active' tab it should dissappear, because it's no longer active. The same for 'completed' tab
  // prettier-ignore
  if (document.querySelector(".btn--active").classList.contains("btn--accent")) UI.showActive();
  // prettier-ignore
  if (document.querySelector(".btn--completed").classList.contains("btn--accent")) UI.showCompleted();

  const label = e.target;
  const todo = label.parentElement;

  // Guard close: e.target can be only label
  if (!label.classList.contains("todo__label")) return;

  // Add class for UI
  todo.classList.toggle("todo__item--done");

  // id of a target element
  const todoNum = label.parentElement.dataset.todo;
  // All todos from local storage
  const todos = Store.getTodos();

  todos.forEach((todo) => {
    // changing isdone status for current todo
    if (todo.num === todoNum) {
      todo.isdone = !todo.isdone;
      if (todo.isdone) UI.updateTodoCount("-");
      else UI.updateTodoCount("+");
    }
  });

  // Save new information in local storage
  localStorage.setItem("todos", JSON.stringify(todos));
});

// Event: show all todos
document.querySelector(".btn--all").addEventListener("click", (e) => {
  activateBtn(e);
  UI.showAll();
});
// Event: show only completed todos
document.querySelector(".btn--completed").addEventListener("click", (e) => {
  activateBtn(e);
  UI.showCompleted();
});
// Event: show only active todos
document.querySelector(".btn--active").addEventListener("click", (e) => {
  activateBtn(e);
  UI.showActive();
});

// Event: Clear all completed todos
document.querySelector(".btn--clear").addEventListener("click", () => {
  UI.removeCompleted();
});

// Event: Switch theme
document
  .querySelectorAll("#theme-switch")
  .forEach((btn) => btn.addEventListener("click", UI.switchTheme));
