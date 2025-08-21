import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Button, Card, message, Space, Select, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { recordService } from '../services/recordService';
import MainLayout from '../components/Layout/MainLayout';
import dayjs from 'dayjs';

const { Option } = Select;

const EditRecord: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      loadRecord(parseInt(id));
    }
  }, [id]);

  const loadRecord = async (recordId: number) => {
    try {
      const response = await recordService.getRecord(recordId);
      const record = response.record;
      
      form.setFieldsValue({
        ...record,
        issue_date: dayjs(record.issue_date),
      });
    } catch (error) {
      message.error('加载记录失败');
      navigate('/records');
    } finally {
      setInitialLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const recordData = {
        ...values,
        issue_date: values.issue_date.format('YYYY-MM-DD'),
      };

      await recordService.updateRecord(parseInt(id), recordData);
      message.success('记录更新成功！');
      navigate('/records');
    } catch (error: any) {
      message.error(error.response?.data?.error || '更新记录失败');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/records')}
            >
              返回
            </Button>
            <h1 style={{ margin: 0 }}>编辑记录</h1>
          </Space>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="legalization_no"
              label="法律编号"
              rules={[{ required: true, message: '请输入法律编号' }]}
            >
              <Input placeholder="例如: SKAKP5V-001" />
            </Form.Item>

            <Form.Item
              name="issue_date"
              label="发布日期"
              rules={[{ required: true, message: '请选择发布日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="place_of_issue"
              label="发布地点"
            >
              <Input placeholder="例如: SKA" />
            </Form.Item>

            <Form.Item
              name="legalization_type"
              label="认证类型"
              rules={[{ required: true, message: '请输入认证类型' }]}
            >
              <Input placeholder="例如: SEEN AT THE MINISTRY OF FOREIGN AFFAIRS" />
            </Form.Item>

            <Form.Item
              name="authorized_officer"
              label="授权官员"
              rules={[{ required: true, message: '请输入授权官员姓名' }]}
            >
              <Input placeholder="例如: MISS SAMARIN SIRISAWAT" />
            </Form.Item>

            <Form.Item
              name="document_owner"
              label="文档所有者"
              rules={[{ required: true, message: '请输入文档所有者姓名' }]}
            >
              <Input placeholder="例如: MISS UNYANEE KHAOWISET" />
            </Form.Item>

            <Form.Item
              name="document_type"
              label="文档类型"
              rules={[{ required: true, message: '请输入文档类型' }]}
            >
              <Input placeholder="例如: CERTIFICATE OF BIRTH" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value="active">活跃</Option>
                <Option value="inactive">隐藏</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  保存更改
                </Button>
                <Button onClick={() => navigate('/records')}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default EditRecord;

