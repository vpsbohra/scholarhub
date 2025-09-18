import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, Input, Space, Tag, Button, Select, message, Modal, Form, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../../api/axios';
import { applyFormErrors } from '../../../utils/formErrors';

const STATUS = ['pending', 'verified', 'rejected', 'inactive'];
const GENDERS = ['Male', 'Female', 'Other'];
const CATS = ['General', 'OBC', 'SC', 'ST', 'Other'];

export default function StudentList() {
    const nav = useNavigate();
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState();

    // NEW: modal state
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const [createdInfo, setCreatedInfo] = useState(null); // {email, generated_password}

    async function load(p = page, ps = pageSize, s = search, st = status) {
        setLoading(true);
        try {
            const params = {
                page: Number(p) || 1,
                pageSize: Number(ps) || 10,
                search: s || undefined,
                status: st || undefined,
            };

            const { data } = await api.get('/admin/students', { params });

            setData(data.data);
            setTotal(data.total);
            setPage(data.page);
            setPageSize(data.pageSize);
        } catch (e) {
            const res = e?.response;

            // 401 → send back to login
            if (res?.status === 401) {
                message.error('Session expired. Please log in again.');
                localStorage.removeItem('jwt');
                localStorage.removeItem('role');
                window.location.href = '/login';
                return;
            }

            // 422 with field-level errors from validators
            if (res?.status === 422 && Array.isArray(res.data?.errors) && res.data.errors.length) {
                const first = res.data.errors[0];
                message.error(first.message || 'Invalid query');
                return;
            }

            // 409 (rare here), 400/500 etc.
            message.error(res?.data?.error || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    async function changeStatus(id, newStatus) {
        try {
            await api.patch(`/admin/students/${id}/status`, { status: newStatus });
            message.success(`Status → ${newStatus}`);
            load();
        } catch (e) {
            message.error(e.response?.data?.error || 'Failed to update status');
        }
    }

    async function onCreate() {
        const v = await form.validateFields();
        const payload = {
            first_name: v.first_name,
            last_name: v.last_name,
            email: v.email,
            password: v.password || undefined, // optional
            phone_number: v.phone_number,
            dob: v.dob ? v.dob.format('YYYY-MM-DD') : undefined,
            gender: v.gender,
            guardian_name: v.guardian_name,
            annual_income: v.annual_income,
            category: v.category,
            address: v.address,
            city: v.city,
            state: v.state,
            pincode: v.pincode,
            bank_account_no: v.bank_account_no,
            ifsc_code: v.ifsc_code,
            status: v.status || 'pending',
        };
        try {
            const { data } = await api.post('/admin/students', payload);
            setOpen(false);
            form.resetFields();
            setCreatedInfo(data); // show password if generated
            load();
        } catch (e) {
            message.error(e.response?.data?.error || 'Create failed');
        }
    }

    const columns = useMemo(() => ([
        { title: 'Name', render: (_, r) => <a onClick={() => nav(`/students/${r.student_id}`)}>{`${r.first_name || ''} ${r.last_name || ''}`.trim() || '(no name)'}</a> },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Phone', dataIndex: 'phone_number' },
        { title: 'City', dataIndex: 'city' },
        { title: 'State', dataIndex: 'state' },
        { title: 'Status', dataIndex: 'status', render: v => <Tag color={v === 'verified' ? 'green' : v === 'pending' ? 'gold' : v === 'inactive' ? 'default' : 'red'}>{v}</Tag> },
        { title: 'Joined', dataIndex: 'created_at', render: v => new Date(v).toLocaleDateString() },
        {
            title: 'Actions', render: (_, r) => (
                <Space>
                    <Button size="small" onClick={() => changeStatus(r.student_id, 'verified')}>Verify</Button>
                    <Button size="small" onClick={() => changeStatus(r.student_id, 'rejected')}>Reject</Button>
                    <Button size="small" onClick={() => changeStatus(r.student_id, 'inactive')}>Deactivate</Button>
                </Space>
            )
        },
    ]), [nav]);

    return (
        <Card
            title="Students"
            extra={<Button type="primary" onClick={() => setOpen(true)}>Add Student</Button>}
        >
            <Space style={{ marginBottom: 12 }}>
                <Input.Search placeholder="Search name, email, phone, city…" value={search}
                    onChange={e => setSearch(e.target.value)} onSearch={() => load(1, pageSize, search, status)} style={{ width: 320 }} />
                <Select allowClear placeholder="Status" value={status} onChange={(v) => { setStatus(v); load(1, pageSize, search, v); }}
                    options={STATUS.map(v => ({ value: v, label: v }))} style={{ width: 160 }} />
            </Space>

            <Table rowKey="student_id" columns={columns} dataSource={data}
                loading={loading}
                pagination={{ current: page, pageSize, total, showSizeChanger: true }}
                onChange={(p) => load(p.current, p.pageSize, search, status)}
            />

            {/* Create Modal */}
            <Modal
                open={open}
                title="Add Student"
                onCancel={() => setOpen(false)}
                onOk={onCreate}
                okText="Create"
                destroyOnClose
                width={720}
            >
                <Form form={form} layout="vertical">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Form.Item name="first_name" label="First name" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="last_name" label="Last name" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                        <Form.Item name="phone_number" label="Phone"><Input /></Form.Item>
                        <Form.Item name="dob" label="DOB"><DatePicker style={{ width: '100%' }} /></Form.Item>
                        <Form.Item name="gender" label="Gender"><Select allowClear options={GENDERS.map(v => ({ value: v, label: v }))} /></Form.Item>
                        <Form.Item name="guardian_name" label="Guardian name"><Input /></Form.Item>
                        <Form.Item name="annual_income" label="Annual income (₹)"><Input /></Form.Item>
                        <Form.Item name="category" label="Category"><Select allowClear options={CATS.map(v => ({ value: v, label: v }))} /></Form.Item>
                        <Form.Item name="pincode" label="Pincode"><Input /></Form.Item>
                        <Form.Item name="city" label="City"><Input /></Form.Item>
                        <Form.Item name="state" label="State"><Input /></Form.Item>
                        <Form.Item name="address" label="Address" style={{ gridColumn: '1 / span 2' }}><Input.TextArea rows={2} /></Form.Item>
                        <Form.Item name="bank_account_no" label="Bank account no."><Input /></Form.Item>
                        <Form.Item name="ifsc_code" label="IFSC"><Input /></Form.Item>
                        <Form.Item name="status" label="Status" initialValue="pending"><Select options={STATUS.map(v => ({ value: v, label: v }))} /></Form.Item>

                        <Form.Item name="password" label="Set password (optional)" extra="Leave blank to auto-generate a temporary password.">
                            <Input.Password placeholder="Leave blank to auto-generate" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* Show generated password once */}
            <Modal
                open={!!createdInfo}
                title="Student Created"
                onCancel={() => setCreatedInfo(null)}
                footer={<Button type="primary" onClick={() => setCreatedInfo(null)}>Done</Button>}
            >
                <p><b>Email:</b> {createdInfo?.email}</p>
                {createdInfo?.generated_password ? (
                    <>
                        <p><b>Temporary password:</b> <code>{createdInfo.generated_password}</code></p>
                        <p style={{ color: '#faad14' }}>Share this password securely with the student. They should change it after first login.</p>
                    </>
                ) : (
                    <p>Password was set manually.</p>
                )}
            </Modal>
        </Card>
    );
}
