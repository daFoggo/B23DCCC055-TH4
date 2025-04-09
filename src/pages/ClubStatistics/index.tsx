import React, { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useModel } from 'umi';

const { Title, Text } = Typography;

const ClubStatistics: React.FC = () => {
  const { 
    loading, 
    roleStats, 
    teamStats, 
    totalApplications, 
    approvedRate, 
    rejectedRate, 
    pendingRate,
    getStatistics
  } = useModel('ClubRegistation.statistics');

  useEffect(() => {
    getStatistics();
  }, []);

  const roleColumns = [
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Total Applications',
      dataIndex: 'total',
      key: 'total',
      render: (total: number, record: any) => `${total} (${Math.round(total / totalApplications * 100 || 0)}%)`,
    },
    {
      title: 'Approved',
      dataIndex: 'approved',
      key: 'approved',
      render: (approved: number, record: any) => `${approved} (${Math.round(approved / record.total * 100 || 0)}%)`,
    },
    {
      title: 'Rejected',
      dataIndex: 'rejected',
      key: 'rejected',
      render: (rejected: number, record: any) => `${rejected} (${Math.round(rejected / record.total * 100 || 0)}%)`,
    },
    {
      title: 'Pending',
      dataIndex: 'pending',
      key: 'pending',
      render: (pending: number, record: any) => `${pending} (${Math.round(pending / record.total * 100 || 0)}%)`,
    },
  ];

  const teamColumns = [
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Member Count',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => <Progress percent={percentage} />,
    },
  ];

  return (
    <div>
      <Title level={3}>Overview Statistics</Title>
      
      <Card loading={loading}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic 
              title="Total Applications" 
              value={totalApplications} 
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Approval Rate" 
              value={approvedRate} 
              suffix="%" 
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Rejection Rate" 
              value={rejectedRate} 
              suffix="%" 
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="Pending Rate" 
              value={pendingRate} 
              suffix="%" 
              valueStyle={{ color: '#1890ff' }}
              prefix={<QuestionCircleOutlined />}
            />
          </Col>
        </Row>
      </Card>

      <Title level={3} style={{ marginTop: 24 }}>Role Statistics</Title>
      
      <Card loading={loading}>
        <Table 
          columns={roleColumns} 
          dataSource={roleStats} 
          rowKey="role" 
          pagination={false}
        />
      </Card>

      <Title level={3} style={{ marginTop: 24 }}>Team Statistics</Title>
      
      <Card loading={loading}>
        <Table 
          columns={teamColumns} 
          dataSource={teamStats} 
          rowKey="team" 
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ClubStatistics; 