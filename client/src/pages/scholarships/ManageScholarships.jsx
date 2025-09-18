import React, { useEffect, useState } from 'react';
import { Card, Table, Input, Select, Space, Button, Modal, Form, InputNumber, DatePicker, Tag, message, Popconfirm } from 'antd';
import api from '../../api/axios';
import dayjs from 'dayjs';

const STATUSES = ['draft','active','closed','archived'];

export default function ManageScholarships() {
  const role = localStorage.getItem('role');
  const [data,setData] = useState([]);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [pageSize,setPageSize] = useState(10);
  const [search,setSearch] = useState('');
  const [status,setStatus] = useState();
  const [open,setOpen] = useState(false);
  const [editing,setEditing] = useState(null);
  const [form] = Form.useForm();

  async function load(p=page, ps=pageSize, s=search, st=status) {
    setLoading(true);
    try {
      const params = { page:p, pageSize:ps, search:s || undefined, status: st || undefined };
      if (role==='donor') params.owner = 'me';
      const { data } = await api.get('/scholarships', { params });
      setData(data.data); setTotal(data.total); setPage(data.page); setPageSize(data.pageSize);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  }
  function openEdit(rec) {
    setEditing(rec);
    form.setFieldsValue({
      ...rec,
      start_date: dayjs(rec.start_date),
      end_date: dayjs(rec.end_date),
    });
    setOpen(true);
  }

  async function onSubmit() {
    const v = await form.validateFields();
    const payload = {
      scholarship_name: v.scholarship_name,
      description: v.description,
      eligibility_criteria: v.eligibility_criteria,
      amount: v.amount,
      start_date: v.start_date.format('YYYY-MM-DD'),
      end_date: v.end_date.format('YYYY-MM-DD'),
      status: v.status,
      donor_id: v.donor_id, // admin only
    };
    try {
      if (editing) {
        await api.put(`/scholarships/${editing.scholarship_id}`, payload);
        message.success('Updated');
      } else {
        await api.post('/scholarships', payload);
        message.success('Created');
      }
      setOpen(false);
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Save failed');
    }
  }

  async function archive(id) {
    try {
      await api.delete(`/scholarships/${id}`);
      message.success('Archived');
      load();
    } catch (e) {
      message.error(e.response?.data?.error || 'Archive failed');
    }
  }

  const columns = [
    { title:'Name', dataIndex:'scholarship_name' },
    { title:'Amount', dataIndex:'amount' },
    { title:'Window', render:(_,r)=> `${r.start_date} → ${r.end_date}` },
    { title:'Status', dataIndex:'status', render:v=> <Tag color={{
        draft:'default', active:'green', closed:'orange', archived:'red'
      }[v]}>{v}</Tag> },
    { title:'Actions', render:(_,r)=> (
      <Space>
        <Button size="small" onClick={()=>openEdit(r)}>Edit</Button>
        <Popconfirm title="Archive this scholarship?" onConfirm={()=>archive(r.scholarship_id)}>
          <Button size="small" danger>Archive</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <Card title="Manage Scholarships"
      extra={<Space>
        <Input.Search placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} onSearch={()=>load(1,pageSize,search,status)} style={{ width: 240 }}/>
        <Select allowClear placeholder="Status" value={status} onChange={v=>{setStatus(v); load(1,pageSize,search,v);}}
          options={STATUSES.map(v=>({value:v,label:v}))} style={{ width: 160 }}/>
        <Button type="primary" onClick={openCreate}>New Scholarship</Button>
      </Space>}
    >
      <Table rowKey="scholarship_id" columns={columns} dataSource={data}
        loading={loading}
        pagination={{ current:page, pageSize, total, showSizeChanger:true }}
        onChange={(p)=>load(p.current, p.pageSize, search, status)}
      />

      <Modal
        title={editing ? 'Edit Scholarship' : 'New Scholarship'}
        open={open} onCancel={()=>setOpen(false)} onOk={onSubmit} okText="Save"
        destroyOnClose
      >
        <Form layout="vertical" form={form} initialValues={{ status:'draft' }}>
          <Form.Item name="scholarship_name" label="Name" rules={[{required:true}]}><Input/></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3}/></Form.Item>
          <Form.Item name="eligibility_criteria" label="Eligibility"><Input.TextArea rows={3}/></Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{required:true}]}><InputNumber style={{width:'100%'}} min={1}/></Form.Item>
          <Space>
            <Form.Item name="start_date" label="Start" rules={[{required:true}]}><DatePicker/></Form.Item>
            <Form.Item name="end_date" label="End" rules={[{required:true}]}><DatePicker/></Form.Item>
          </Space>
          <Form.Item name="status" label="Status">
            <Select options={STATUSES.map(v=>({value:v,label:v}))}/>
          </Form.Item>
          {role !== 'donor' && (
            <Form.Item name="donor_id" label="Donor ID (optional for admin)">
              <InputNumber style={{width:'100%'}} min={1}/>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
}
