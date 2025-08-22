import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Descriptions, Spin, Alert, Typography } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface LegalizationRecord {
  id: number;
  legalization_no: string;
  date_of_issue: string;
  place_of_issue: string;
  type_of_legalization: string;
  authorized_officer: string;
  document_owner: string;
  type_of_document: string;
  qr_code: string;
  created_at: string;
}

const VerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [record, setRecord] = useState<LegalizationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qrCode = searchParams.get('qr');

  useEffect(() => {
    if (!qrCode) {
      setError('缺少QR码参数');
      setLoading(false);
      return;
    }

    fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode]);

  const fetchRecord = async () => {
    try {
      const response = await fetch(`/api/public/sticker?qr=${qrCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecord(data.record);
      } else {
        setError('记录不存在或已失效');
      }
    } catch (error) {
      console.error('获取记录失败:', error);
      setError('获取记录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Alert
          message="验证失败"
          description={error}
          type="error"
          showIcon
          style={{ maxWidth: 500 }}
        />
      </div>
    );
  }

  if (!record) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Alert
          message="记录不存在"
          description="未找到对应的法律认证记录"
          type="warning"
          showIcon
          style={{ maxWidth: 500 }}
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <QrcodeOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0 }}>法律认证记录验证</Title>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            此记录已通过官方验证
          </p>
        </div>

        <Descriptions
          title="记录详情"
          bordered
          column={1}
          size="middle"
          labelStyle={{ fontWeight: 'bold', width: '200px' }}
        >
          <Descriptions.Item label="认证编号">
            {record.legalization_no}
          </Descriptions.Item>
          <Descriptions.Item label="签发日期">
            {new Date(record.date_of_issue).toLocaleDateString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="签发地点">
            {record.place_of_issue}
          </Descriptions.Item>
          <Descriptions.Item label="认证类型">
            {record.type_of_legalization}
          </Descriptions.Item>
          <Descriptions.Item label="授权官员">
            {record.authorized_officer}
          </Descriptions.Item>
          <Descriptions.Item label="文档所有者">
            {record.document_owner}
          </Descriptions.Item>
          <Descriptions.Item label="文档类型">
            {record.type_of_document}
          </Descriptions.Item>
          <Descriptions.Item label="验证码">
            <code style={{ backgroundColor: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
              {record.qr_code}
            </code>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#52c41a', fontWeight: 'bold' }}>
            ✅ 此记录已通过官方验证，真实有效
          </p>
        </div>
      </Card>
    </div>
  );
};

export default VerificationPage;
