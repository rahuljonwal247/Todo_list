
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Fetch tasks
  const fetchTasks = async () => {
    if (!token) return;
    const response = await fetch("http://localhost:4000/api/tasks/getTask", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      setTasks(data);
    } else {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    if (!token) return navigate("/");
    fetchTasks();
  }, [token]);

  // Add a new task
  const addTask = async () => {
    if (taskTitle.trim().length < 3) {
      setError("Task title must be at least 3 characters long.");
      return;
    }
    setError("");

    const response = await fetch(
      "http://localhost:4000/api/tasks/createTask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: taskTitle }),
      }
    );

    if (response.ok) {
      setTaskTitle("");
      fetchTasks();
    } else {
      alert("Failed to add task.");
    }
  };

  // Toggle task completion
  const toggleComplete = async (id, completed) => {
    const response = await fetch(
      `http://localhost:4000/api/tasks/updateTask/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isCompleted: !completed }),
      }
    );

    if (response.ok) {
      fetchTasks();
    } else {
      alert("Failed to toggle task status.");
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    const response = await fetch(
      `http://localhost:4000/api/tasks/deleteTask/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      fetchTasks();
    } else {
      alert("Failed to delete task.");
    }
  };

  // Edit a task
  const editTask = async () => {
    if (currentTask?.title.trim().length < 3) {
      setError("Task title must be at least 3 characters long.");
      return;
    }
    setError("");

    const response = await fetch(
      `http://localhost:4000/api/tasks/updateTask/${currentTask._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: currentTask.title }),
      }
    );

    if (response.ok) {
      setIsEditing(false);
      setCurrentTask(null);
      fetchTasks();
    } else {
      alert("Failed to edit task.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-20 lg:px-40">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-blue-700">Task Dashboard</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded shadow"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
        >
          Logout
        </button>
      </header>

      <div className="mb-6">
        <input
          className="border p-2 rounded w-full sm:w-3/4"
          placeholder="Enter a new task"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-2 sm:mt-0 sm:ml-2 rounded shadow"
          onClick={addTask}
        >
          Add Task
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <ul>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task._id}
              className="p-4 mb-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleComplete(task._id, task.isCompleted)}
                  className="h-5 w-5 text-blue-500"
                />
                <span
                  className={
                    task.isCompleted
                      ? "line-through text-gray-400"
                      : ""
                  }
                >
                  {task.title}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded shadow"
                  onClick={() => {
                    setIsEditing(true);
                    setCurrentTask(task);
                  }}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded shadow"
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500">No tasks available.</p>
        )}
      </ul>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Edit Task</h2>
            <input
              className="border p-2 rounded w-full mb-4"
              value={currentTask?.title || ""}
              onChange={(e) =>
                setCurrentTask({ ...currentTask, title: e.target.value })
              }
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow"
                onClick={editTask}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;