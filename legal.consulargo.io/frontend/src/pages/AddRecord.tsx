import React, { useState } from 'react';
import { Form, Input, DatePicker, Button, Card, message, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recordService } from '../services/recordService';
import dayjs from 'dayjs';

const AddRecord: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const recordData = {
        ...values,
        issue_date: values.issue_date.format('YYYY-MM-DD'),
      };

      const response = await recordService.createRecord(recordData);
      message.success('记录创建成功！');
      
      // 显示生成的QR码信息
      message.info(`QR码: ${response.record.qr_code}`);
      
      navigate('/records');
    } catch (error: any) {
      message.error(error.response?.data?.error || '创建记录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/records')}
            >
              返回
            </Button>
            <h1 style={{ margin: 0 }}>添加新记录</h1>
          </Space>
        </div>

        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              issue_date: dayjs(),
              place_of_issue: 'SKA',
              legalization_type: 'SEEN AT THE MINISTRY OF FOREIGN AFFAIRS',
            }}
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

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  保存记录
                </Button>
                <Button onClick={() => navigate('/records')}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
  );
};

export default AddRecord;

