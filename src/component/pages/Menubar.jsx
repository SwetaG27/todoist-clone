import { useEffect, useState } from "react";

import { Layout, Menu, message, Typography, Space, Avatar } from "antd";
import { BellOutlined } from "@ant-design/icons";

import Navigation from "../sidebar/Navigation";
import AddTask from "../sidebar/AddTask";
import ProjectModals from "../sidebar/ProjectModals";
import FavouriteSection from "../sidebar/FavouriteSection";
import ProjectSection from "../sidebar/ProjectSection";

import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedProject,
  addProject,
  editProject,
  removeProject,
  toggleFavorite,
} from "../../app/slices/projectSlice";
const { Sider } = Layout;
const { Title } = Typography;

const Menubar = ({ onTaskAdded }) => {
  const dispatch = useDispatch();
  const {
    projects: reduxProjects,
    favorites: reduxFavorites,
    loading: reduxLoading,
  } = useSelector((state) => state.projects);

  const [selectedKey, SetSelectedKey] = useState("inbox");
  const [projects, setProjects] = useState([]);

  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [currentProject, setCurrentProject] = useState(null);

  useEffect(() => {
    if (reduxProjects.length > 0) {
      setProjects(reduxProjects.filter((project) => project.name !== "Inbox"));
    }
  }, [reduxProjects]);

  useEffect(() => {
    if (reduxFavorites.length > 0) {
      setFavorites(reduxFavorites);
    }
  }, [reduxFavorites]);

  const handleTaskAdded = (newTask) => {
    setIsAddTaskVisible(false);
    if (onTaskAdded) {
      onTaskAdded(newTask);
    }
  };
  const handleEditProjectOpen = (project) => {
    setCurrentProject({ ...project });
    setIsEditModalVisible(true);
  };

  const handleDeleteProjectOpen = (project) => {
    setCurrentProject(project);
    setIsDeleteModalVisible(true);
  };

  const handleToggleFavorite = async (project) => {
    const isFavorite = favorites.some((p) => p.id === project.id);

    try {
      await dispatch(toggleFavorite({ project, isFavorite })).unwrap();

      if (isFavorite) {
        message.success(`Removed ${project.name} from favorites`);
      } else {
        message.success(`Added ${project.name} to favorites`);
      }
    } catch (error) {
      message.error("Failed to update favorite status");
    }
  };
  const getMenuItems = () => {
    const items = [];

    const favoritesSection = FavouriteSection({
      favorites,
      onEditProject: handleEditProjectOpen,
      onDeleteProject: handleDeleteProjectOpen,
      onToggleFavorite: handleToggleFavorite,
    });

    if (favoritesSection) {
      items.push(favoritesSection);
    }

    const projectsSection = ProjectSection({
      projects,
      favorites,
      onEditProject: handleEditProjectOpen,
      onDeleteProject: handleDeleteProjectOpen,
      onToggleFavorite: handleToggleFavorite,
      onAddProject: () => setIsAddModalVisible(true),
    });

    items.push(projectsSection);
    return items;
  };

  const handleMenuClick = (e) => {
    SetSelectedKey(e.key);

    if (e.key === "inbox") {
      dispatch(setSelectedProject({ id: null, name: "Inbox" }));
    } else if (["today", "upcoming", "filters"].includes(e.key)) {
      dispatch(
        setSelectedProject({
          id: e.key,
          name: e.key.charAt(0).toUpperCase() + e.key.slice(1),
        })
      );
    } else {
      const project =
        projects.find((p) => p.id.toString() === e.key) ||
        favorites.find((p) => p.id.toString() === e.key);
      if (project) {
        dispatch(setSelectedProject({ id: project.id, name: project.name }));
      }
    }
  };
  const handleAddProjectSave = async () => {
    if (!newProjectName.trim()) {
      message.error("Project name cannot be empty");
      return;
    }
    try {
      await dispatch(addProject(newProjectName)).unwrap();
      setNewProjectName("");
      setIsAddModalVisible(false);
      message.success("Project created Successfully");
    } catch (error) {
      message.error("Failed to create project");
    }
  };

  const handleEditProjectSave = async () => {
    if (!currentProject || !currentProject.name.trim()) {
      message.error("Project name cannot be empty");
      return;
    }
    try {
      await dispatch(
        editProject({
          id: currentProject.id,
          data: { name: currentProject.name },
        })
      ).unwrap();
      setIsEditModalVisible(false);
      message.success("Project updated successfully");
    } catch (error) {
      message.error("Failed to update project");
    }
  };

  const handleDeleteProjectSave = async () => {
    if (!currentProject) return;

    try {
      await dispatch(removeProject(currentProject.id)).unwrap();

      if (selectedKey === currentProject.id.toString()) {
        SetSelectedKey("inbox");
      }
      setIsDeleteModalVisible(false);
      message.success("Project deleted successfully");
    } catch (error) {
      message.error("Failed to delete project");
    }
  };

  return (
    <Sider width={250} style={{ background: "#fcfaf8" }}>
      <Title level={5} style={{ paddingLeft: "16px", marginTop: "15px" }}>
        <Space size={15}>
          <Avatar>S</Avatar>
          <Space size={40}>Swetagabhane</Space>

          <BellOutlined />
        </Space>
      </Title>

      <AddTask
        visible={isAddTaskVisible}
        onCancel={() => setIsAddTaskVisible(false)}
        onTaskAdded={handleTaskAdded}
      />
      <Navigation
        selectedKey={selectedKey}
        onMenuClick={handleMenuClick}
        onAddTaskClick={() => setIsAddTaskVisible(true)}
      />
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={["projects", "favorites"]}
        onClick={handleMenuClick}
        style={{ height: "100%", borderRight: 0 }}
        items={getMenuItems()}
      />

      <ProjectModals
        isAddModalVisible={isAddModalVisible}
        isEditModalVisible={isEditModalVisible}
        isDeleteModalVisible={isDeleteModalVisible}
        newProjectName={newProjectName}
        currentProject={currentProject}
        loading={loading}
        onAddProject={handleAddProjectSave}
        onEditProject={handleEditProjectSave}
        onDeleteProject={handleDeleteProjectSave}
        onCancelAdd={() => setIsAddModalVisible(false)}
        onCancelEdit={() => setIsEditModalVisible(false)}
        onCancelDelete={() => setIsDeleteModalVisible(false)}
        onNewProjectNameChange={(e) => setNewProjectName(e.target.value)}
        onCurrentProjectNameChange={(e) =>
          setCurrentProject({ ...currentProject, name: e.target.value })
        }
      />
    </Sider>
  );
};

export default Menubar;
