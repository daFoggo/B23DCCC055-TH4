import React, { useEffect, useState } from 'react';
import { Table, Select, Button, Space, message, Tag } from 'antd';
import { genExcelFile } from '@/utils/utils';
import candidateRegistration from '@/models/ClubRegistation/candidateRegistration';

const { Option } = Select;

const MemberManagement: React.FC = () => {
    const candidateState = candidateRegistration(); // Lấy trạng thái từ ClubRegistrationManagement
    const [members, setMembers] = useState<ClubRegistration.CandidateRegistration[]>([]);
    const [editingMember, setEditingMember] = useState<number | null>(null); // ID của thành viên đang chỉnh sửa
    const [tempRole, setTempRole] = useState<string>(''); // Vai trò tạm thời khi chỉnh sửa

    // Lấy danh sách các thành viên đã được phê duyệt
    useEffect(() => {
        const approvedMembers = candidateState.candidates.filter(
            (candidate) => candidate.status === 'APPROVED'
        );
        setMembers(approvedMembers);
    }, [candidateState.candidates]);

    // Lưu thay đổi vai trò
    const saveRoleChange = (id: number) => {
        setMembers((prev) =>
            prev.map((member) =>
                member.id === id ? { ...member, role: { ...member.role, name: tempRole } } : member
            )
        );
        setEditingMember(null);
        message.success('Vai trò đã được cập nhật!');
    };

    // Hủy chỉnh sửa
    const cancelEdit = () => {
        setEditingMember(null);
        setTempRole('');
    };

    // Xuất danh sách thành viên ra file Excel
    const exportToExcel = () => {
        const data = [
            ['Full Name', 'Email', 'Role'],
            ...members.map((member) => [
                member.fullName,
                member.email,
                member.role.name,
            ]),
        ];
        genExcelFile(data, 'DanhSachThanhVien.xlsx', 'Members');
    };

    // Cấu hình các cột cho bảng
    const columns = [
        { 
            title: 'Full Name', 
            dataIndex: 'fullName', 
            key: 'fullName',
            sorter: (a: any, b: any) => a.fullName.localeCompare(b.fullName)
        },
        { 
            title: 'Email', 
            dataIndex: 'email', 
            key: 'email',
            sorter: (a: any, b: any) => a.email.localeCompare(b.email)
        },
        {
            title: 'Role',
            key: 'role',
            sorter: (a: any, b: any) => a.role.name.localeCompare(b.role.name),
            render: (_: any, record: ClubRegistration.CandidateRegistration) => {
                if (editingMember === record.id) {
                    return (
                        <Space>
                            <Select
                                value={tempRole}
                                onChange={(value) => setTempRole(value)}
                                style={{ width: 150 }}
                                autoFocus
                                open
                            >
                                <Option value="Team Design">Team Design</Option>
                                <Option value="Team Dev">Team Dev</Option>
                                <Option value="Team Media">Team Media</Option>
                                <Option value="Development">Development</Option>
                            </Select>
                            <Space size="small">
                                <Button 
                                    type="primary" 
                                    size="small" 
                                    onClick={() => saveRoleChange(record.id)}
                                >
                                    Lưu
                                </Button>
                                <Button 
                                    size="small" 
                                    onClick={cancelEdit}
                                >
                                    Hủy
                                </Button>
                            </Space>
                        </Space>
                    );
                }
                return (
                    <div 
                        style={{ cursor: 'pointer' }}
                        onDoubleClick={() => {
                            setEditingMember(record.id);
                            setTempRole(record.role.name);
                        }}
                    >
                        <Tag color="blue" style={{ padding: '0 10px' }}>
                            {record.role.name}
                        </Tag>
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={exportToExcel}>
                    Xuất Excel
                </Button>
                <span style={{ marginLeft: 16 }}>Double-click vào role để chỉnh sửa</span>
            </div>
            <Table 
                dataSource={members} 
                columns={columns} 
                rowKey="id"
                pagination={{
                    position: ['bottomRight'],
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Total ${total} members`,
                    defaultPageSize: 10
                }}
            />
        </div>
    );
};

export default MemberManagement;