import React, { useEffect, useState } from 'react';
import { Card, Tabs, Form, Input, DatePicker, Select, Row, Col, Button, message, Table, Tag, Switch, Space } from 'antd';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../../api/axios';

const GENDERS = ['Male','Female','Other'];
const CATS = ['General','OBC','SC','ST','Other'];
const STATUS = ['pending','verified','rejected','inactive'];

export default function StudentDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState(null);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students/${id}`);
      setMe(data);
      const init = { ...data };
      if (init.dob) init.dob = dayjs(init.dob);
      form.setFieldsValue(init);
    } finally { setLoading(false); }
  }

  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [id]);

  async function save() {
    const v = await form.validateFields();
    const payload = { ...v, dob: v.dob ? v.dob.format('YYYY-MM-DD') : null };
    try {
      await api.put(`/admin/students/${id}`, payload);
      message.success('Saved');
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Save failed');
    }
  }

  async function setStatus(status) {
    try {
      await api.patch(`/admin/students/${id}/status`, { status });
      message.success(`Status → ${status}`);
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Failed to set status');
    }
  }

  const appColumns = [
    { title:'Scholarship', dataIndex:'scholarship_name' },
    { title:'Amount', dataIndex:'amount' },
    { title:'Applied', dataIndex:'application_date', render:v=> new Date(v).toLocaleString() },
    { title:'Status', dataIndex:'status', render:v=> <Tag color={v==='approved'?'green':v==='pending'?'gold':v==='funded'?'geekblue':'red'}>{v}</Tag> },
  ];

  return (
    <Card title={`Student #${id}`} loading={loading}>
      <Tabs
        items={[
          {
            key: 'profile',
            label: 'Profile',
            children: (
              <Form layout="vertical" form={form} onFinish={save}>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="first_name" label="First name" rules={[{required:true}]}><Input/></Form.Item></Col>
                  <Col span={12}><Form.Item name="last_name"  label="Last name"  rules={[{required:true}]}><Input/></Form.Item></Col>
                  <Col span={12}><Form.Item name="email" label="Email" rules={[{type:'email', required:true}]}><Input/></Form.Item></Col>
                  <Col span={12}><Form.Item name="phone_number" label="Phone"><Input/></Form.Item></Col>

                  <Col span={12}><Form.Item name="dob" label="DOB"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
                  <Col span={12}><Form.Item name="gender" label="Gender"><Select options={GENDERS.map(v=>({value:v}))}/></Form.Item></Col>

                  <Col span={12}><Form.Item name="guardian_name" label="Guardian name"><Input/></Form.Item></Col>
                  <Col span={12}><Form.Item name="annual_income" label="Annual income (₹)"><Input/></Form.Item></Col>
                  <Col span={12}><Form.Item name="category" label="Category"><Select options={CATS.map(v=>({value:v}))}/></Form.Item></Col>

                  <Col span={24}><Form.Item name="address" label="Address"><Input.TextArea rows={2}/></Form.Item></Col>
                  <Col span={8}><Form.Item name="city" label="City"><Input/></Form.Item></Col>
                  <Col span={8}><Form.Item name="state" label="State"><Input/></Form.Item></Col>
                  <Col span={8}><Form.Item name="pincode" label="Pincode"><Input/></Form.Item></Col>

                  <Col span={12}><Form.Item name="bank_account_no" label="Bank account no."><Input/></Form.Item></Col>
                  <Col span={12}><Form.Item name="ifsc_code" label="IFSC"><Input/></Form.Item></Col>

                  <Col span={8}><Form.Item name="documents_uploaded" valuePropName="checked" label="Documents uploaded"><Switch /></Form.Item></Col>
                  <Col span={8}><Form.Item name="email_verified" valuePropName="checked" label="Email verified"><Switch /></Form.Item></Col>
                  <Col span={8}><Form.Item name="phone_verified" valuePropName="checked" label="Phone verified"><Switch /></Form.Item></Col>
                </Row>

                <Space style={{ marginTop: 8 }}>
                  <Button type="primary" htmlType="submit">Save</Button>
                  {me?.status && (
                    <>
                      <Button onClick={()=>setStatus('verified')}>Mark Verified</Button>
                      <Button onClick={()=>setStatus('rejected')}>Mark Rejected</Button>
                      <Button onClick={()=>setStatus(me.status==='inactive'?'pending':'inactive')}>
                        {me.status==='inactive' ? 'Activate' : 'Deactivate'}
                      </Button>
                    </>
                  )}
                </Space>
              </Form>
            )
          },
          {
            key: 'applications',
            label: 'Applications',
            children: <StudentApplications studentId={id} columns={appColumns} />
          }
        ]}
      />
    </Card>
  );
}

function StudentApplications({ studentId, columns }) {
  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [pageSize,setPageSize] = useState(10);
  const [total,setTotal] = useState(0);

  async function load(p=page, ps=pageSize) {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students/${studentId}/applications`, { params: { page:p, pageSize:ps } });
      setRows(data.data); setTotal(data.total); setPage(data.page); setPageSize(data.pageSize);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [studentId]);

  return (
    <Table rowKey="application_id" columns={columns} dataSource={rows}
      loading={loading}
      pagination={{ current:page, pageSize, total, showSizeChanger:true }}
      onChange={(p)=>load(p.current, p.pageSize)}
    />
  );
}
