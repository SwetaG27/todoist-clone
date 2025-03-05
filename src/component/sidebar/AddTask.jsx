// src/component/sidebar/AddTask.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { addTask } from "../../app/slices/tasksSlice";
import { fetchAllProjects } from "../../app/slices/projectSlice";

const AddTask = ({ visible, onCancel, onTaskAdded }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { projects } = useSelector((state) => state.projects);
  const { loading } = useSelector((state) => state.tasks);

  useEffect(() => {
    if (visible && projects.length === 0) {
      dispatch(fetchAllProjects());
    }
    if (visible) {
      form.resetFields();
    }
  }, [visible, projects.length, dispatch, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectId =
        values.project_id === "inbox" ? null : values.project_id;

      await dispatch(
        addTask({
          projectId,
          content: values.content,
          description: values.description || "",
        })
      ).unwrap();

      message.success("Task created successfully");
      form.resetFields();

      if (onTaskAdded) onTaskAdded();
      onCancel();
    } catch (error) {
      message.error("Failed to create task");
    }
  };

  return (
    <Modal
      title="Add Task"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{
            backgroundColor: "#db4c3f",
            borderColor: "#db4c3f",
          }}
        >
          Add Task
        </Button>,
      ]}
      styles={{ padding: "16px" }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ project_id: "inbox" }}
      >
        <Form.Item
          name="content"
          label="Task Name"
          rules={[{ required: true, message: "Please enter a task name" }]}
        >
          <Input
            placeholder="What needs to be done?"
            style={{ borderColor: "#e8e8e8" }}
          />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            placeholder="Add details..."
            rows={3}
            style={{ borderColor: "#e8e8e8" }}
          />
        </Form.Item>

        <Form.Item name="project_id" label="Project">
          <Select
            placeholder="Select a project"
            style={{ borderColor: "#e8e8e8" }}
            dropdownStyle={{ borderColor: "#e8e8e8" }}
          >
            <Select.Option key="inbox" value="inbox">
              Inbox
            </Select.Option>
            {projects.map((project) => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddTask;
