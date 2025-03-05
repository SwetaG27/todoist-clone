import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/projectSlice";
import tasksReducer from "./slices/tasksSlice"

const store = configureStore({
  reducer: {
    projects: projectReducer,
    tasks:tasksReducer,
  },
});

export default store;
