import React, { useEffect, useState } from 'react';
import { Card, Table, Input, Space, Button, message, Tag } from 'antd';
import api from '../../api/axios';

export default function Scholarships() {
  const [data,setData] = useState([]);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [pageSize,setPageSize] = useState(10);
  const [search,setSearch] = useState('');

  async function load(p=page, ps=pageSize, s=search) {
    setLoading(true);
    try {
      const { data } = await api.get('/scholarships', { params: { page:p, pageSize:ps, search:s, status:'active' }});
      setData(data.data); setTotal(data.total); setPage(data.page); setPageSize(data.pageSize);
    } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  async function apply(id) {
    try {
      await api.post(`/scholarships/${id}/apply`);
      message.success('Applied successfully');
    } catch (e) {
      message.error(e.response?.data?.error || 'Apply failed');
    }
  }

  const columns = [
    { title:'Name', dataIndex:'scholarship_name' },
    { title:'Amount', dataIndex:'amount' },
    { title:'Open', render:(_,r)=> `${r.start_date} → ${r.end_date}` },
    { title:'Status', dataIndex:'status', render:v=> <Tag color={v==='active'?'green':'default'}>{v}</Tag> },
    { title:'', render:(_,r)=> <Button type="primary" onClick={()=>apply(r.scholarship_id)}>Apply</Button> }
  ];

  return (
    <Card title="Scholarships">
      <Space style={{ marginBottom: 12 }}>
        <Input.Search placeholder="Search scholarships" value={search}
          onChange={e=>setSearch(e.target.value)} onSearch={()=>load(1,pageSize,search)} style={{ width: 320 }}/>
      </Space>
      <Table rowKey="scholarship_id" columns={columns} dataSource={data}
        loading={loading}
        pagination={{ current:page, pageSize, total, showSizeChanger:true }}
        onChange={(p)=>load(p.current, p.pageSize, search)}
      />
    </Card>
  );
}
