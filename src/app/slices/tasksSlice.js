import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  completeTask,
} from "../../utility/api";

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  currentTask: null,
};

export const fetchProjectTasks = createAsyncThunk(
  "tasks/fetchProjectTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      return await fetchTasks(projectId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async ({ projectId, content, description }, { rejectWithValue }) => {
    try {
      return await createTask(projectId, content, description);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editTask = createAsyncThunk(
  "tasks/editTask",
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      return await updateTask(taskId, updates);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const success = await deleteTask(taskId);
      if (success) {
        return taskId;
      }
      return rejectWithValue("Failed to delete task");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveTaskToProject = createAsyncThunk(
  "tasks/moveTaskToProject",
  async ({ taskId, destinationProjectId }, { rejectWithValue }) => {
    try {
      await moveTask(taskId, destinationProjectId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsComplete = createAsyncThunk(
  "tasks/markAsComplete",
  async (taskId, { rejectWithValue }) => {
    try {
      const success = await completeTask(taskId);
      if (success) {
        return taskId;
      }
      return rejectWithValue("Failed to complete task");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          (task) => task.id === action.payload.id
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(moveTaskToProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(moveTaskToProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(moveTaskToProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markAsComplete.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsComplete.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(markAsComplete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentTask } = tasksSlice.actions;
export default tasksSlice.reducer;
