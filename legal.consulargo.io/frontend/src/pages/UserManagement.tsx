import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Card,
  Space,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';

const { Option } = Select;

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // 这里应该调用用户服务API
      // const response = await userService.getUsers();
      // setUsers(response.users);
    } catch (error) {
      message.error('加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDeleteUser = async (id: number) => {
    try {
      // await userService.deleteUser(id);
      message.success('删除用户成功');
      loadUsers();
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // await userService.updateUser(editingUser.id, values);
        message.success('更新用户成功');
      } else {
        // await userService.createUser(values);
        message.success('创建用户成功');
      }
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span style={{ 
          color: role === 'admin' ? '#52c41a' : '#1890ff',
          fontWeight: 'bold'
        }}>
          {role === 'admin' ? '管理员' : '用户'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, user: User) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(user)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(user.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>用户管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            添加用户
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </Card>

        <Modal
          title={editingUser ? '编辑用户' : '添加用户'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input />
            </Form.Item>

            {!editingUser && (
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password />
              </Form.Item>
            )}

            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select>
                <Option value="user">用户</Option>
                <Option value="admin">管理员</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingUser ? '更新' : '创建'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
