import React, { useEffect, useState } from 'react';
import { Card, Table, Select, Button, Space, message, Input, Typography } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { ROLES } from '@/services/ClubRegistration/constants';

const { Title, Text } = Typography;
const { Option } = Select;

const ClubMemberManagement: React.FC = () => {
  const { 
    members, 
    loading, 
    page, 
    setPage, 
    limit, 
    setLimit, 
    total, 
    getMembers, 
    updateMemberTeam,
    exportMembersToXLSX,
    getRoleName
  } = useModel('ClubRegistation.member');
  
  const [searchText, setSearchText] = useState<string>('');
  const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    getMembers();
  }, []);

  useEffect(() => {
    let result = [...members];
    
    // Lọc theo tìm kiếm
    if (searchText) {
      const lowerCaseSearch = searchText.toLowerCase();
      result = result.filter(
        member => 
          member.fullName.toLowerCase().includes(lowerCaseSearch) || 
          member.email.toLowerCase().includes(lowerCaseSearch)
      );
    }
    
    // Lọc theo nhóm
    if (selectedTeam) {
      result = result.filter(member => {
        const teamName = member.team || `Team ${getRoleName(member.role)}`;
        return teamName === selectedTeam;
      });
    }
    
    setFilteredMembers(result);
  }, [members, searchText, selectedTeam]);

  const handleTeamChange = (id: number, team: string) => {
    const success = updateMemberTeam(id, team);
    if (success) {
      message.success('Team updated successfully');
    } else {
      message.error('Failed to update team');
    }
  };

  const handleExport = async () => {
    const success = await exportMembersToXLSX();
    if (success) {
      message.success('Export successful');
    } else {
      message.error('Export failed');
    }
  };

  // Tạo danh sách các nhóm từ vai trò
  const teamOptions = ROLES.map(role => ({
    value: `Team ${role.name}`,
    label: `Team ${role.name}`,
  }));

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: any, b: any) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: any, b: any) => a.email.localeCompare(b.email),
    },
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
      render: (team: string | undefined, record: any) => {
        // Lấy vai trò từ record
        const roleName = getRoleName(record.role);
        const defaultTeam = `Team ${roleName}`;
        
        return (
          <Select
            style={{ width: '100%' }}
            value={team || defaultTeam}
            onChange={(value) => handleTeamChange(record.id, value)}
            options={teamOptions}
          />
        );
      },
      sorter: (a: any, b: any) => {
        const teamA = a.team || `Team ${getRoleName(a.role)}`;
        const teamB = b.team || `Team ${getRoleName(b.role)}`;
        return teamA.localeCompare(teamB);
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: Date) => new Date(createdAt).toLocaleString(),
      sorter: (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
  ];

  return (
    <div>
      <Card
        title={
          <>
            <Title level={3}>Club Member Management</Title>
            <Typography.Paragraph>Manage and review club registration applications.</Typography.Paragraph>
          </>
        }
        extra={
          <Space>
            <Input
              placeholder="Search by name or email"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            
            <Select 
              style={{ width: 150 }} 
              placeholder="All teams"
              allowClear
              options={teamOptions}
              onChange={value => setSelectedTeam(value)}
            />
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={handleExport}
              danger
            >
              Export Excel
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            onChange: (page, pageSize) => {
              setPage(page);
              if (pageSize) setLimit(pageSize);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} members`,
          }}
        />
      </Card>
    </div>
  );
};

export default ClubMemberManagement; 