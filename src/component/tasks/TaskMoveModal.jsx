import { Modal, Select, Button } from "antd";

const { Option } = Select;

const TaskMoveModal = ({
  movingTask,
  projects,
  targetProjectId,
  onTargetProjectChange,
  onSave,
  onCancel,
}) => {
  return (
    <Modal
      title="Move Task"
      open={movingTask !== null}
      onOk={onSave}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSave}
          style={{
            backgroundColor: "#db4c3f",
            borderColor: "#db4c3f",
          }}
        >
          OK
        </Button>,
      ]}
    >
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", color: "#202020" }}
        >
          Select Project
        </label>
        <Select
          style={{ width: "100%" }}
          placeholder="Select a project"
          value={targetProjectId}
          onChange={onTargetProjectChange}
        >
          {projects.map((project) => (
            <Option key={project.id} value={project.id}>
              {project.name}
            </Option>
          ))}
        </Select>
      </div>
    </Modal>
  );
};

export default TaskMoveModal;
