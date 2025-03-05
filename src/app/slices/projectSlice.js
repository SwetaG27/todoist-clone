import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchFavoriteProjects,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFavorite,
} from "../../utility/api";

const initialState = {
  projects: [],
  favorites: [],
  loading: false,
  error: null,
  selectedProject: { id: null, name: "Inbox" },
};

export const fetchAllProjects = createAsyncThunk(
  "projects/fetchAll",
  async (__, { rejectWithValue }) => {
    try {
      const data = await fetchProjects();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllFavorites = createAsyncThunk(
  "projects/fetchFavorites",
  async (__, { rejectWithValue }) => {
    try {
      return await fetchFavoriteProjects();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProject = createAsyncThunk(
  "projects/addProject",
  async (name, { rejectWithValue }) => {
    try {
      return await createProject(name);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editProject = createAsyncThunk(
  "projects/editProject",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateProject(id, data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeProject = createAsyncThunk(
  "projects/removeProject",
  async (id, { rejectWithValue }) => {
    try {
      await deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "projects/toggleFavorite",
  async ({ project, isFavorite }, { rejectWithValue }) => {
    try {
      const updatedProject = await toggleProjectFavorite(project, isFavorite);
      return { project: updatedProject, isFavorite };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectSlice = createSlice({
  name: "Projects",
  initialState,
  reducers: {
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchAllFavorites.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchAllFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        );

        state.favorites = state.favorites.map((favorite) =>
          favorite.id === action.payload.id ? action.payload : favorite
        );
      })
      .addCase(editProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(
          (project) => project.id !== action.payload
        );
        state.favorites = state.favorites.filter(
          (favorite) => favorite.id !== action.payload
        );

        if (state.selectedProject.id === action.payload) {
          state.selectedProject = { id: null, name: "Inbox" };
        }
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;
        const { project, isFavorite } = action.payload;

        const index = state.projects.findIndex((p) => p.id === project.id);
        if (index !== -1) {
          state.projects[index] = project;
        }

        if (isFavorite) {
          state.favorites = state.favorites.filter((p) => p.id !== project.id);
        } else {
          state.favorites.push(project);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
