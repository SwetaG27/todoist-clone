import { useState, useCallback } from "react";
import { Layout } from "antd";
import Menubar from "./component/pages/Menubar";
import TaskList from "./component/pages/TaskList";

const { Content } = Layout;

const App = () => {
  const [selectedProject, setSelectedProject] = useState({
    id: null,
    name: "Inbox",
  });

  const [taskRefreshCounter, setTaskRefreshCounter] = useState(0);

  const refreshTasks = useCallback(() => {
    setTaskRefreshCounter((prev) => prev + 1);
  }, []);

  const handleTaskAdded = useCallback(() => {
    refreshTasks();
  }, [refreshTasks]);

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
  
          <Menubar
            onProjectSelect={setSelectedProject}
            onTaskAdded={handleTaskAdded}
           
            
          />
       
          <Content
            style={{ padding: "0 24px", marginTop: "40px", minHeight: 280 }}
          >
            <TaskList
              selectedProject={selectedProject}
              refreshKey={taskRefreshCounter}
            />
          </Content>
      
    </Layout>
  );
};

export default App;
