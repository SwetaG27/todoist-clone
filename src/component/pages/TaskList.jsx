import { useState, useEffect } from "react";
import { message } from "antd";

import TaskHeader from "../tasks/TaskHeader";
import TaskCollection from "../tasks/TaskCollection";
import TaskEditModal from "../tasks/TaskEditModal";
import TaskMoveModal from "../tasks/TaskMoveModal";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchProjectTasks,
  addTask,
  editTask,
  removeTask,
  moveTaskToProject,
  markAsComplete,
} from "../../app/slices/tasksSlice";

const TaskList = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { selectedProject, projects } = useSelector((state) => state.projects);

  const [showForm, setShowForm] = useState(false);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [addTaskLoading, setAddTaskLoading] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [movingTask, setMovingTask] = useState(null);

  const [editContent, setEditContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [targetProjectId, setTargetProjectId] = useState(null);

  useEffect(() => {
    if (selectedProject) {
      const projectId =
        selectedProject.name === "Inbox"
          ? null
          : selectedProject.id?.toString();
      dispatch(fetchProjectTasks(projectId));
    }
  }, [selectedProject, dispatch]);

  const handleComplete = async (taskId) => {
    try {
      await dispatch(markAsComplete(taskId)).unwrap();
      message.success("Task completed");
    } catch (error) {
      message.error("Failed to complete task");
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await dispatch(removeTask(taskId)).unwrap();
      message.success("Task deleted");
    } catch (error) {
      message.error("Failed to delete task");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setEditContent(task.content);
    setEditDescription(task.description || "");
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) {
      message.error("Task name cannot be empty");
      return;
    }

    try {
      await dispatch(
        editTask({
          taskId: editingTask.id,
          updates: {
            content: editContent,
            description: editDescription,
          },
        })
      ).unwrap();

      setEditingTask(null);
      message.success("Task updated");
    } catch (error) {
      message.error("Failed to update task");
    }
  };

  const handleMove = (task) => {
    setMovingTask(task);
    setTargetProjectId(task.project_id || "inbox");
  };

  const handleMoveSave = async () => {
    try {
      message.loading({ content: "Moving task...", key: "taskMove" });

      await dispatch(
        moveTaskToProject({
          taskId: movingTask.id,
          destinationProjectId: targetProjectId,
        })
      ).unwrap();

      setMovingTask(null);
      message.success({ content: "Task moved successfully", key: "taskMove" });

      const projectId =
        selectedProject.name === "Inbox"
          ? null
          : selectedProject.id?.toString();
      dispatch(fetchProjectTasks(projectId));
    } catch (error) {
      message.error({
        content: `Failed to move task: ${error || "Unknown error"}`,
        key: "taskMove",
      });
    }
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim()) {
      message.error("Task name cannot be empty");
      return;
    }
    try {
      setAddTaskLoading(true);
      const projectId =
        selectedProject?.id === "inbox" ? null : selectedProject?.id;

      await dispatch(
        addTask({
          projectId,
          content: newTaskContent,
          description: newTaskDescription || "",
        })
      ).unwrap();

      setAddTaskLoading(false);
      setNewTaskContent("");
      setNewTaskDescription("");
      setShowForm(false);
      message.success("Task created successfully");
    } catch (error) {
      setAddTaskLoading(false);
      message.error("Failed to create task");
    }
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "transparent" }}>
      <TaskHeader projectName={selectedProject?.name} />

      <TaskCollection
        tasks={tasks}
        loading={loading}
        showForm={showForm}
        onToggleForm={setShowForm}
        newTaskContent={newTaskContent}
        newTaskDescription={newTaskDescription}
        onContentChange={setNewTaskContent}
        onDescriptionChange={setNewTaskDescription}
        onAddTask={handleAddTask}
        addTaskLoading={addTaskLoading}
        onComplete={handleComplete}
        onEdit={handleEdit}
        onMove={handleMove}
        onDelete={handleDelete}
      />

      <TaskEditModal
        editingTask={editingTask}
        editContent={editContent}
        editDescription={editDescription}
        onContentChange={(e) => setEditContent(e.target.value)}
        onDescriptionChange={(e) => setEditDescription(e.target.value)}
        onSave={handleEditSave}
        onCancel={() => setEditingTask(null)}
      />

      <TaskMoveModal
        movingTask={movingTask}
        projects={projects}
        targetProjectId={targetProjectId}
        onTargetProjectChange={(value) => setTargetProjectId(value)}
        onSave={handleMoveSave}
        onCancel={() => setMovingTask(null)}
      />
    </div>
  );
};

export default TaskList;
