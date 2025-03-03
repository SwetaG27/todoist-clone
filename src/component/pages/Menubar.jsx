import { useEffect, useState } from "react";
import { Layout, Menu, message, Typography, Space, Avatar } from "antd";
import { BellOutlined } from "@ant-design/icons";
import Navigation from "../sidebar/Navigation";
import {
  fetchFavoriteProjects,
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  toggleProjectFavorite,
} from "../../utility/api";
import AddTask from "../sidebar/AddTask";
import ProjectModals from "../sidebar/ProjectModals";
import FavouriteSection from "../sidebar/FavouriteSection";
import ProjectSection from "../sidebar/ProjectSection";
const { Sider } = Layout;
const { Title } = Typography;

const Menubar = ({ onProjectSelect, onTaskAdded }) => {
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
    const getProjects = async () => {
      try {
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data.filter((project) => project.name !== "Inbox"));

        const favprojects = await fetchFavoriteProjects();
        setFavorites(favprojects);
      } catch (error) {
        message.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    getProjects();
  }, []);

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

    setLoading(true);
    try {
      const updatedProject = await toggleProjectFavorite(project, isFavorite);

      if (updatedProject) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? updatedProject : p))
        );

        if (isFavorite) {
          setFavorites((prev) => prev.filter((p) => p.id !== project.id));
          message.success(`Removed ${project.name} from favorites`);
        } else {
          setFavorites((prev) => [...prev, updatedProject]);
          message.success(`Added ${project.name} to favorites`);
        }
      }
    } catch (error) {
      console.error("Error handling toggle favorite:", error);
      message.error("Failed to update favorite status");
    } finally {
      setLoading(false);
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
      onProjectSelect({ id: null, name: "Inbox" });
    } else if (["today", "upcoming", "filters"].includes(e.key)) {
      onProjectSelect({
        id: e.key,
        name: e.key.charAt(0).toUpperCase() + e.key.slice(1),
      });
    } else {
      const project =
        projects.find((p) => p.id.toString() === e.key) ||
        favorites.find((p) => p.id.toString() === e.key);
      if (project) {
        onProjectSelect({ id: project.id, name: project.name });
      }
    }
  };
  const handleAddProjectSave = async () => {
    if (!newProjectName.trim()) {
      message.error("Project name cannot be empty");
      return;
    }

    setLoading(true);
    const newProject = await createProject(newProjectName);
    setLoading(false);
    handleMenuClick;
    if (newProject) {
      setProjects([...projects, newProject]);
      setNewProjectName("");
      setIsAddModalVisible(false);
      message.success("Project created successfully");
    } else {
      message.error("Failed to create project");
    }
  };

  const handleEditProjectSave = async () => {
    if (!currentProject || !currentProject.name.trim()) {
      message.error("Project name cannot be empty");
      return;
    }

    setLoading(true);
    const updatedProject = await updateProject(currentProject.id, {
      name: currentProject.name,
    });
    setLoading(false);

    if (updatedProject) {
      setProjects(
        projects.map((p) => (p.id === currentProject.id ? updatedProject : p))
      );

      if (favorites.some((f) => f.id === currentProject.id)) {
        setFavorites(
          favorites.map((f) =>
            f.id === currentProject.id ? updatedProject : f
          )
        );
      }

      setIsEditModalVisible(false);
      message.success("Project updated successfully");
    } else {
      message.error("Failed to update project");
    }
  };

  const handleDeleteProjectSave = async () => {
    if (!currentProject) return;

    setLoading(true);
    const success = await deleteProject(currentProject.id);
    setLoading(false);

    if (success) {
      setProjects(projects.filter((p) => p.id !== currentProject.id));

      if (favorites.some((f) => f.id === currentProject.id)) {
        setFavorites(favorites.filter((f) => f.id !== currentProject.id));
      }

      if (selectedKey === currentProject.id.toString()) {
        SetSelectedKey("inbox");
        onProjectSelect({ id: null, name: "Inbox" });
      }

      setIsDeleteModalVisible(false);
      message.success("Project deleted successfully");
    } else {
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
