import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Select, 
  Popconfirm, 
  message, 
  Card,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { recordService, Record } from '../services/recordService';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const RecordsList: React.FC = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const navigate = useNavigate();

  const loadStats = useCallback(async (recordsData: any[]) => {
    try {
      // 这里可以调用API获取统计数据，暂时使用模拟数据
      const total = recordsData.length;
      const active = recordsData.filter(r => r.status === 'active').length;
      const inactive = recordsData.filter(r => r.status === 'inactive').length;
      setStats({ total, active, inactive });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await recordService.getRecords({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        status: statusFilter,
      });
      
      setRecords(response.records);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
      }));
      
      // 更新统计数据
      loadStats(response.records);
    } catch (error) {
      message.error('加载记录失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, statusFilter, loadStats]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleDelete = async (id: number) => {
    try {
      await recordService.deleteRecord(id);
      message.success('删除成功');
      loadRecords();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }

    try {
      await recordService.deleteRecords(selectedRowKeys as number[]);
      message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
      setSelectedRowKeys([]);
      loadRecords();
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  const handleStatusChange = async (ids: number[], status: string) => {
    try {
      await recordService.updateRecordsStatus(ids, status);
      message.success(`成功更新 ${ids.length} 条记录状态`);
      loadRecords();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: 'QR码',
      dataIndex: 'qr_code',
      key: 'qr_code',
      width: 180,
      render: (text: string) => (
        <Tooltip title="点击复制">
          <Text 
            copyable={{ text }}
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px',
              color: '#1890ff',
              cursor: 'pointer'
            }}
          >
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '法律编号',
      dataIndex: 'legalization_no',
      key: 'legalization_no',
      width: 150,
      render: (text: string) => (
        <Text strong style={{ color: '#262626' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '发布日期',
      dataIndex: 'issue_date',
      key: 'issue_date',
      width: 120,
      render: (text: string) => (
        <Text style={{ color: '#595959' }}>
          {text}
        </Text>
      ),
    },
    {
      title: '文档所有者',
      dataIndex: 'document_owner',
      key: 'document_owner',
      width: 200,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 180 }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: '文档类型',
      dataIndex: 'document_type',
      key: 'document_type',
      width: 150,
      render: (text: string) => (
        <Tag color="blue" style={{ borderRadius: '12px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={
            <Tag color={status === 'active' ? 'green' : 'orange'} style={{ borderRadius: '12px' }}>
              {status === 'active' ? '活跃' : '隐藏'}
            </Tag>
          }
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {new Date(text).toLocaleString('zh-CN')}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right' as const,
      render: (_: any, record: Record) => (
        <Space size="small">
          <Tooltip title="编辑记录">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/records/edit/${record.id}`)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="下载二维码">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => window.open(`/api/qrcode/download/${record.qr_code}`)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="预览页面">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => window.open(`/check/sticker.html?qr=${record.qr_code}`)}
              style={{ color: '#722ed1' }}
            />
          </Tooltip>
          <Tooltip title="删除记录">
            <Popconfirm
              title="确定要删除这条记录吗？"
              description="删除后无法恢复，请谨慎操作"
              onConfirm={() => handleDelete(record.id)}
              okText="确定删除"
              cancelText="取消"
              placement="topRight"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
        {/* 页面标题和统计 */}
        <div style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Title level={2} style={{ margin: 0, color: '#262626' }}>
                <FileTextOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                记录管理
              </Title>
              <Text type="secondary">管理和查看所有认证记录</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => navigate('/records/new')}
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
                }}
              >
                添加记录
              </Button>
            </Col>
          </Row>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title="总记录数"
                value={stats.total}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title="活跃记录"
                value={stats.active}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <Statistic
                title="隐藏记录"
                value={stats.inactive}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 主要内容卡片 */}
        <Card
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          {/* 搜索和筛选 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} md={12}>
              <Search
                placeholder="搜索QR码、法律编号、文档所有者..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchText}
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                placeholder="状态筛选"
                allowClear
                size="large"
                style={{ 
                  width: '100%',
                  borderRadius: '8px'
                }}
                onChange={setStatusFilter}
              >
                <Option value="active">
                  <Badge status="success" text="活跃" />
                </Option>
                <Option value="inactive">
                  <Badge status="default" text="隐藏" />
                </Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Button
                size="large"
                style={{ 
                  width: '100%',
                  borderRadius: '8px'
                }}
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('');
                }}
              >
                重置
              </Button>
            </Col>
          </Row>

          {/* 批量操作 */}
          {selectedRowKeys.length > 0 && (
            <div style={{ 
              marginBottom: '24px',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <Row gutter={[16, 16]} align="middle">
                <Col flex="auto">
                  <Text style={{ color: 'white', fontSize: '16px' }}>
                    已选择 <strong>{selectedRowKeys.length}</strong> 项记录
                  </Text>
                </Col>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      ghost
                      icon={<EyeOutlined />}
                      onClick={() => handleStatusChange(selectedRowKeys as number[], 'active')}
                      style={{ borderRadius: '8px' }}
                    >
                      批量激活
                    </Button>
                    <Button
                      type="primary"
                      ghost
                      icon={<EyeInvisibleOutlined />}
                      onClick={() => handleStatusChange(selectedRowKeys as number[], 'inactive')}
                      style={{ borderRadius: '8px' }}
                    >
                      批量隐藏
                    </Button>
                    <Popconfirm
                      title={`确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`}
                      description="删除后无法恢复，请谨慎操作"
                      onConfirm={handleBatchDelete}
                      okText="确定删除"
                      cancelText="取消"
                      placement="topRight"
                    >
                      <Button 
                        danger 
                        ghost
                        icon={<DeleteOutlined />}
                        style={{ borderRadius: '8px' }}
                      >
                        批量删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </Col>
              </Row>
            </div>
          )}

          <Divider style={{ margin: '24px 0' }} />

          {/* 数据表格 */}
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              style: { marginTop: '16px' }
            }}
            onChange={(pagination) => {
              setPagination(prev => ({
                ...prev,
                current: pagination.current || 1,
                pageSize: pagination.pageSize || 10,
              }));
            }}
            style={{
              borderRadius: '8px',
              overflow: 'hidden'
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
  );
};

export default RecordsList;
