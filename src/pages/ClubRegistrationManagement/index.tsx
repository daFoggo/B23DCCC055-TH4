import candidateRegistration from "@/models/ClubRegistation/candidateRegistration"
import role from "@/models/ClubRegistation/role"
import { Status } from "@/services/ClubRegistration/constants"
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons"
import { Badge, Button, Card, Form, Input, message, Modal, Select, Space, Table, Tag, Tooltip, Typography } from "antd"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const ClubRegistrationManagement = () => {
    const candidateState = candidateRegistration()
    const roleState = role()
    const [messageApi, contextHolder] = message.useMessage()
    const [rejectForm] = Form.useForm()

    const handleApprove = () => {
        const success = candidateState.handleApprove()
        if (success) {
            messageApi.success("Candidate has been approved!")
        } else {
            messageApi.error("An error occurred. Please try again later.")
        }
    }

    const handleReject = () => {
        rejectForm
            .validateFields()
            .then((values) => {
                const success = candidateState.handleReject(values.note)
                if (success) {
                    messageApi.success("Candidate has been rejected!")
                    rejectForm.resetFields()
                } else {
                    messageApi.error("An error occurred. Please try again later.")
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info)
            })
    }

    const columns = [
        {
            title: "Full Name",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a: ClubRegistration.CandidateRegistration, b: ClubRegistration.CandidateRegistration) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            sorter: (a: ClubRegistration.CandidateRegistration, b: ClubRegistration.CandidateRegistration) => a.email.localeCompare(b.email),
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (_: any, record: ClubRegistration.CandidateRegistration) => {
                const roleName = roleState.getRoleName(record.role.id)
                return <Tag color="blue">{roleName}</Tag>
            },
            sorter: (a: ClubRegistration.CandidateRegistration, b: ClubRegistration.CandidateRegistration) =>
                roleState.getRoleName(a.role.id).localeCompare(roleState.getRoleName(b.role.id)),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: Status) => {
                let color = "default"
                let text = "Unknown"

                switch (status) {
                    case Status.PENDING:
                        color = "warning"
                        text = "Pending"
                        break
                    case Status.APPROVED:
                        color = "success"
                        text = "Approved"
                        break
                    case Status.REJECTED:
                        color = "error"
                        text = "Rejected"
                        break
                }

                return <Tag color={color}>{text}</Tag>
            },
            sorter: (a: ClubRegistration.CandidateRegistration, b: ClubRegistration.CandidateRegistration) => a.status.localeCompare(b.status),
        },
        {
            title: "Actions",
            key: "action",
            render: (_: any, record: ClubRegistration.CandidateRegistration) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => {
                                candidateState.setSelectedCandidate(record)
                                candidateState.setIsViewModalVisible(true)
                            }}
                        />
                    </Tooltip>
                    {record.status === Status.PENDING && (
                        <>
                            <Tooltip title="Approve">
                                <Button
                                    type="text"
                                    icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                                    onClick={() => {
                                        candidateState.setSelectedCandidate(record)
                                        candidateState.setIsApproveModalVisible(true)
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title="Reject">
                                <Button
                                    type="text"
                                    icon={<CloseCircleOutlined style={{ color: "#f5222d" }} />}
                                    onClick={() => {
                                        candidateState.setSelectedCandidate(record)
                                        candidateState.setIsRejectModalVisible(true)
                                    }}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ]

    return (
        <div style={{ padding: "24px" }}>
            {contextHolder}
            <Card bordered={false} style={{ borderRadius: 8 }}>
                <div style={{ marginBottom: 24 }}>
                    <Title level={3}>Club Registration Management</Title>
                    <Paragraph>Manage and review club registration applications.</Paragraph>
                </div>

                {/* Filters */}
                <div style={{ marginBottom: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <Input
                        placeholder="Search by name or email"
                        prefix={<SearchOutlined />}
                        value={candidateState.searchText}
                        onChange={(e) => candidateState.setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />

                    <Select
                        placeholder="Filter by status"
                        style={{ width: 200 }}
                        value={candidateState.statusFilter}
                        onChange={(value) => candidateState.setStatusFilter(value)}
                    >
                        <Option value="ALL">All statuses</Option>
                        <Option value={Status.PENDING}>Pending</Option>
                        <Option value={Status.APPROVED}>Approved</Option>
                        <Option value={Status.REJECTED}>Rejected</Option>
                    </Select>

                    <Select
                        placeholder="Filter by role"
                        style={{ width: 200 }}
                        value={candidateState.roleFilter}
                        onChange={(value) => candidateState.setRoleFilter(value)}
                    >
                        <Option value="ALL">All roles</Option>
                        {roleState.roles.map((role) => (
                            <Option key={role.id} value={role.id}>
                                {role.name}
                            </Option>
                        ))}
                    </Select>
                </div>

                {/* Candidates Table */}
                <Table
                    columns={columns}
                    dataSource={candidateState.filteredCandidates}
                    rowKey="id"
                    loading={candidateState.loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} candidates`,
                    }}
                />

                {/* Approve Modal */}
                <Modal
                    title="Approve Candidate"
                    visible={candidateState.isApproveModalVisible}
                    onOk={handleApprove}
                    onCancel={() => candidateState.setIsApproveModalVisible(false)}
                    okText="Accept"
                    cancelText="Cancel"
                >
                    <p>
                        Are you sure you want to approve the candidate <strong>{candidateState.selectedCandidate?.fullName}</strong>?
                    </p>
                </Modal>

                {/* Reject Modal */}
                <Modal
                    title="Reject Candidate"
                    visible={candidateState.isRejectModalVisible}
                    onOk={handleReject}
                    onCancel={() => candidateState.setIsRejectModalVisible(false)}
                    okText="Accept"
                    cancelText="Cancel"
                >
                    <p>
                        Are you sure you want to reject the candidate <strong>{candidateState.selectedCandidate?.fullName}</strong>?
                    </p>
                    <Form form={rejectForm} layout="vertical">
                        <Form.Item
                            name="note"
                            label="Reason for Rejection"
                            rules={[{ required: true, message: "Please enter a reason for rejection" }]}
                        >
                            <TextArea rows={4} placeholder="Enter reason for rejection" maxLength={500} showCount />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* View Modal */}
                <Modal
                    title="Candidate Details"
                    visible={candidateState.isViewModalVisible}
                    onCancel={() => candidateState.setIsViewModalVisible(false)}
                    footer={[
                        <Button key="close" onClick={() => candidateState.setIsViewModalVisible(false)}>
                            Close
                        </Button>,
                    ]}
                    width={700}
                >
                    {candidateState.selectedCandidate && (
                        <div>
                            <div style={{ marginBottom: 16 }}>
                                <Title level={4}>Candidate Information</Title>
                                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
                                    <Text strong>Full Name:</Text>
                                    <Text>{candidateState.selectedCandidate.fullName}</Text>

                                    <Text strong>Email:</Text>
                                    <Text>{candidateState.selectedCandidate.email}</Text>

                                    <Text strong>Role :</Text>
                                    <Text>{roleState.getRoleName(candidateState.selectedCandidate.role.id)}</Text>

                                    <Text strong>Status:</Text>
                                    <Text>
                                        {candidateState.selectedCandidate.status === Status.PENDING && (
                                            <Badge status="warning" text="Pending" />
                                        )}
                                        {candidateState.selectedCandidate.status === Status.APPROVED && (
                                            <Badge status="success" text="Approved" />
                                        )}
                                        {candidateState.selectedCandidate.status === Status.REJECTED && (
                                            <Badge status="error" text="Rejected" />
                                        )}
                                    </Text>

                                    <Text strong>Created At:</Text>
                                    <Text>
                                        {candidateState.selectedCandidate.createdAt
                                            ? new Date(candidateState.selectedCandidate.createdAt).toLocaleString("vi-VN")
                                            : "N/A"}
                                    </Text>
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <Title level={4}>Reason to Apply</Title>
                                <Paragraph style={{ whiteSpace: "pre-line" }}>
                                    {candidateState.selectedCandidate.reasonToApply}
                                </Paragraph>
                            </div>

                            {candidateState.selectedCandidate.note && (
                                <div style={{ marginBottom: 16 }}>
                                    <Title level={4}>Note</Title>
                                    <Paragraph style={{ whiteSpace: "pre-line" }}>{candidateState.selectedCandidate.note}</Paragraph>
                                </div>
                            )}

                            {candidateState.selectedCandidate.actionLog && (
                                <div>
                                    <Title level={4}>Action Log</Title>
                                    <Paragraph style={{ whiteSpace: "pre-line" }}>{candidateState.selectedCandidate.actionLog}</Paragraph>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </Card>
        </div>
    )
}

export default ClubRegistrationManagement
