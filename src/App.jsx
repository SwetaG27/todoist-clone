import { useEffect } from "react";
import { Layout } from "antd";
import Menubar from "./component/pages/Menubar";
import TaskList from "./component/pages/TaskList";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllProjects, fetchAllFavorites } from "./app/slices/projectSlice";

const { Content } = Layout;

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchAllProjects());
    dispatch(fetchAllFavorites());
  }, [dispatch]);

  return (
    <Layout style={{ minHeight: "100vh", background: "transparent" }}>
      <Menubar />

      <Content style={{ padding: "0 24px", marginTop: "40px", minHeight: 280 }}>
        <TaskList />
      </Content>
    </Layout>
  );
};

export default App;
