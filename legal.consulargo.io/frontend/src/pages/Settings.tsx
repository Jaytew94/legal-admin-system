import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [form] = Form.useForm();
  const [usernameForm] = Form.useForm();
  const { user, refreshUser } = useAuth();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      message.success('密码修改成功！');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const onUsernameFinish = async (values: any) => {
    setUsernameLoading(true);
    try {
      await authService.changeUsername(values.newUsername);
      message.success('用户名修改成功！');
      usernameForm.resetFields();
      // 刷新用户信息
      if (refreshUser) {
        refreshUser();
      }
    } catch (error: any) {
      message.error(error.message || '用户名修改失败');
    } finally {
      setUsernameLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>设置</h1>
      
      <Card title="修改用户名" style={{ maxWidth: 500, marginBottom: '24px' }}>
        <Form
          form={usernameForm}
          layout="vertical"
          onFinish={onUsernameFinish}
        >
          <Form.Item
            name="newUsername"
            label="新用户名"
            rules={[
              { required: true, message: '请输入新用户名' },
              { min: 3, message: '用户名长度至少3位' },
              {
                validator: (_, value) => {
                  if (value && value === user?.username) {
                    return Promise.reject(new Error('新用户名不能与当前用户名相同'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined />}
              placeholder={`当前用户名: ${user?.username}`}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={usernameLoading}
              >
                修改用户名
              </Button>
              <Button onClick={() => usernameForm.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
        
      <Card title="修改密码" style={{ maxWidth: 500 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="currentPassword"
              label="当前密码"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请输入当前密码"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度至少6位' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请输入新密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="请再次输入新密码"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  修改密码
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card title="账户信息" style={{ maxWidth: 500, marginTop: '24px' }}>
          <div>
            <p><strong>用户名：</strong>{user?.username}</p>
            <p><strong>邮箱：</strong>{user?.email || '未设置'}</p>
            <p><strong>角色：</strong>{user?.role === 'admin' ? '管理员' : '用户'}</p>
          </div>
        </Card>
      </div>
  );
};

export default Settings;

