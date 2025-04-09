import candidateRegistration from "@/models/ClubRegistation/candidateRegistration"
import role from "@/models/ClubRegistation/role"
import { Button, Card, Form, Input, Select, Typography, message } from "antd"

const { Title, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const ClubRegistration = () => {
    const [form] = Form.useForm()
    const roleState = role()
    const candidateState = candidateRegistration()
    const [messageApi, contextHolder] = message.useMessage()

    const onFinish = (values: any) => {
        const roleObj = roleState.roles.find((role) => role.id === values.role)
        if (!roleObj) {
            messageApi.error("Selected role is not valid.")
            return
        }

        const candidateData = {
            ...values,
            role: roleObj,
        }

        const success = candidateState.addCandidate(candidateData)
        if (success) {
            messageApi.success("Registration successful!")
            form.resetFields()
        } else {
            messageApi.error("Registration failed. Please try again.")
        }
    }

    return (
        <div style={{ padding: "24px" }}>
            {contextHolder}
            <Card bordered={false} style={{ maxWidth: 800, margin: "0 auto", borderRadius: 8 }} >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Title level={2}>Club Registation</Title>
                    <Paragraph>Please fill in the form below to register for the club.</Paragraph>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} scrollToFirstError>
                    <Form.Item
                        name="fullName"
                        label="Full Name"
                        rules={[
                            { required: true, message: "Please enter your full name" },
                            { min: 2, message: "Full name must be at least 2 characters" },
                        ]}
                    >
                        <Input placeholder="Enter your full name" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please enter your email" },
                            { type: "email", message: "Please enter a valid email" },
                        ]}
                    >
                        <Input placeholder="Enter your email" size="large" />
                    </Form.Item>

                    <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select your role" }]}>
                        <Select placeholder="Select your role" loading={roleState.loading} size="large">
                            {roleState.roles.map((role) => (
                                <Option key={role.id} value={role.id}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="reasonToApply"
                        label="Reason to Apply"
                        rules={[
                            { required: true, message: "Please enter your reason to apply" },
                            { min: 10, message: "Reason must be at least 10 characters" },
                            { max: 500, message: "Reason must be at most 500 characters" },
                        ]}
                    >
                        <TextArea placeholder="Enter your reason to apply" rows={4} size="large" maxLength={500} showCount />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={candidateState.loading}>
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default ClubRegistration
