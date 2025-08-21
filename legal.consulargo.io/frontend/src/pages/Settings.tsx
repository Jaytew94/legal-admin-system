import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();

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

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>设置</h1>
        
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

