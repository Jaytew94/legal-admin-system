import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Space } from 'antd';
import { FileTextOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recordService, Record } from '../services/recordService';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    activeRecords: 0,
    inactiveRecords: 0,
  });
  const [recentRecords, setRecentRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [recordsResponse] = await Promise.all([
        recordService.getRecords({ page: 1, limit: 5 }),
      ]);

      const records = recordsResponse.records;
      const totalRecords = recordsResponse.pagination.total;
      const activeRecords = records.filter(r => r.status === 'active').length;
      const inactiveRecords = totalRecords - activeRecords;

      setStats({
        totalRecords,
        activeRecords,
        inactiveRecords,
      });
      setRecentRecords(records);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'QR码',
      dataIndex: 'qr_code',
      key: 'qr_code',
      width: 120,
    },
    {
      title: '法律编号',
      dataIndex: 'legalization_no',
      key: 'legalization_no',
    },
    {
      title: '文档所有者',
      dataIndex: 'document_owner',
      key: 'document_owner',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ 
          color: status === 'active' ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {status === 'active' ? '活跃' : '隐藏'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => navigate(`/records/edit/${record.id}`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
      <div>
        <h1 style={{ marginBottom: '24px' }}>仪表板</h1>
        
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总记录数"
                value={stats.totalRecords}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃记录"
                value={stats.activeRecords}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="隐藏记录"
                value={stats.inactiveRecords}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="用户数"
                value={1}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 快速操作 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card title="快速操作">
              <Space>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/records/new')}
                >
                  添加新记录
                </Button>
                <Button onClick={() => navigate('/records')}>
                  查看所有记录
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* 最近记录 */}
        <Row gutter={16}>
          <Col span={24}>
            <Card 
              title="最近记录" 
              extra={
                <Button type="link" onClick={() => navigate('/records')}>
                  查看全部
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={recentRecords}
                rowKey="id"
                pagination={false}
                loading={loading}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </div>
  );
};

export default Dashboard;
