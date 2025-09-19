import React, { useEffect, useState, useMemo } from 'react';
import { Card, Table, Input, Space, Button, Select, Modal, Form, message, Popconfirm, Tag, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { applyFormErrors } from '../../../utils/formErrors';
import '../../../styles/table.css';

export default function DonorList() {
  const nav = useNavigate();
  const [data,setData] = useState([]);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [pageSize,setPageSize] = useState(10);
  const [search,setSearch] = useState('');

  const [open,setOpen] = useState(false);
  const [form] = Form.useForm();
  const [createdInfo, setCreatedInfo] = useState(null); // { email, generated_password }

  async function load(p=page, ps=pageSize, s=search) {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/donors', { params:{ page:p, pageSize:ps, search:s||undefined } });
      setData(data.data); setTotal(data.total); setPage(data.page); setPageSize(data.pageSize);
    } catch (e) {
      message.error(e?.response?.data?.error || 'Failed to load donors');
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function setStatus(id, status) {
    try {
      await api.patch(`/admin/donors/${id}/status`, { status });
      message.success(`Status → ${status}`);
      load();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Failed to update status');
    }
  }

  async function removeDonor(id) {
    try {
      await api.delete(`/admin/donors/${id}`);
      message.success('Donor removed');
      load();
    } catch (e) {
      const msg = e?.response?.data?.error || 'Remove failed';
      message.error(msg);
    }
  }

  const currency = n => (Number(n || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 });

  const columns = (nav, setStatus, removeDonor) => ([
    {
      title: 'Organization',
      dataIndex: 'organization_name',
      width: 220,
      ellipsis: true,
      render: (v, r) => (
        <Tooltip title={v}>
          <a onClick={() => nav(`/donors/${r.donor_id}`)} className="ellipsis">{v || '(no name)'}</a>
        </Tooltip>
      )
    },
    { title: 'Contact', dataIndex: 'contact_person', width: 160, ellipsis: true,
      render: v => <Tooltip title={v}><span className="ellipsis">{v || '-'}</span></Tooltip> },
    { title: 'Email', dataIndex: 'email', width: 220, ellipsis: true,
      render: v => <Tooltip title={v}><span className="ellipsis">{v}</span></Tooltip> },
    { title: 'Phone', dataIndex: 'phone_number', width: 140, ellipsis: true,
      render: v => <Tooltip title={v}><span className="ellipsis">{v || '-'}</span></Tooltip> },
    { title: 'City', dataIndex: 'city', width: 140, ellipsis: true,
      render: v => <Tooltip title={v}><span className="ellipsis">{v || '-'}</span></Tooltip> },
    { title: 'State', dataIndex: 'state', width: 120, ellipsis: true,
      render: v => <Tooltip title={v}><span className="ellipsis">{v || '-'}</span></Tooltip> },
    {
      title: 'Total Contribution',
      dataIndex: 'total_contribution',
      align: 'right',
      width: 160,
      render: v => <>₹{currency(v)}</>
    },
    { title: 'Status', dataIndex: 'status', width: 110, render: v => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag> },
    { title: 'Joined', dataIndex: 'created_at', width: 120, render: v => new Date(v).toLocaleDateString() },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, r) => (
        <Space>
          {r.status === 'active'
            ? <Button size="small" onClick={() => setStatus(r.donor_id, 'inactive')}>Deactivate</Button>
            : <Button size="small" type="primary" onClick={() => setStatus(r.donor_id, 'active')}>Activate</Button>}
          <Popconfirm
            title="Remove donor?"
            description="This will delete the donor if they have no scholarships."
            onConfirm={() => removeDonor(r.donor_id)}
          >
            <Button size="small" danger>Remove</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]);

  async function onCreate() {
    const v = await form.validateFields();
    const payload = {
      organization_name: v.organization_name,
      contact_person: v.contact_person,
      email: v.email,
      password: v.password || undefined,
      phone_number: v.phone_number,
      pan_number: v.pan_number,
      address: v.address,
      city: v.city,
      state: v.state,
      pincode: v.pincode,
      total_contribution: v.total_contribution,
    };
    try {
      const { data } = await api.post('/admin/donors', payload);
      setOpen(false); form.resetFields();
      setCreatedInfo(data);
      load();
    } catch (e) {
      if (!applyFormErrors(form, e)) {
        message.error(e?.response?.data?.error || 'Create failed');
      }
    }
  }

  return (
    <Card
      title="Donors"
      extra={(
        <Space>
          <Input.Search placeholder="Search org, contact, email, city…" value={search}
            onChange={e=>setSearch(e.target.value)} onSearch={()=>load(1,pageSize,search)} style={{ width: 280 }}/>
          <Button type="primary" onClick={()=>setOpen(true)}>Add Donor</Button>
        </Space>
      )}
    >
    <Table
      className="donor-table"
      rowKey="donor_id"
      columns={columns(nav, setStatus, removeDonor)}
      dataSource={data}
      loading={loading}
      pagination={{ current: page, pageSize, total, showSizeChanger: true }}
      onChange={(p) => load(p.current, p.pageSize, search)}
      tableLayout="fixed"
      size="middle"
      sticky
      scroll={{ x: 1400 }}
    />

      <Modal
        open={open}
        title="Add Donor"
        onCancel={()=>setOpen(false)}
        onOk={onCreate}
        okText="Create"
        destroyOnClose
        width={720}
      >
        <Form form={form} layout="vertical">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Form.Item name="organization_name" label="Organization name" rules={[{required:true}]}><Input/></Form.Item>
            <Form.Item name="contact_person" label="Contact person"><Input/></Form.Item>
            <Form.Item name="email" label="Email" rules={[{required:true, type:'email'}]}><Input/></Form.Item>
            <Form.Item name="phone_number" label="Phone"><Input/></Form.Item>
            <Form.Item name="pan_number" label="PAN"><Input/></Form.Item>
            <Form.Item name="total_contribution" label="Total contribution"><Input/></Form.Item>
            <Form.Item name="pincode" label="Pincode"><Input/></Form.Item>
            <Form.Item name="city" label="City"><Input/></Form.Item>
            <Form.Item name="state" label="State"><Input/></Form.Item>
            <Form.Item name="address" label="Address"><Input.TextArea rows={2}/></Form.Item>

            <Form.Item name="password" label="Set password (optional)" extra="Leave blank to auto-generate a temporary password.">
              <Input.Password placeholder="Leave blank to auto-generate"/>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={!!createdInfo}
        title="Donor Created"
        onCancel={()=>setCreatedInfo(null)}
        footer={<Button type="primary" onClick={()=>setCreatedInfo(null)}>Done</Button>}
      >
        <p><b>Email:</b> {createdInfo?.email}</p>
        {createdInfo?.generated_password ? (
          <>
            <p><b>Temporary password:</b> <code>{createdInfo.generated_password}</code></p>
            <p style={{color:'#faad14'}}>Share this password securely with the donor. They should change it after first login.</p>
          </>
        ) : (<p>Password was set manually.</p>)}
      </Modal>
    </Card>
  );
}
