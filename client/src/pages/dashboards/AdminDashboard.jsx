import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, Table, Input, Space, Tag, Card, Statistic, Row, Col } from 'antd';
import api from '../../api/axios';

function usePaginatedFetch(url, extraParams = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(undefined);

  async function fetchData(p = page, ps = pageSize, s = search, st = status) {
    setLoading(true);
    try {
      const { data } = await api.get(url, {
        params: { page: p, pageSize: ps, search: s || undefined, status: st, ...extraParams },
      });
      setData(data.data);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  return {
    data, total, loading, page, pageSize, search, setSearch, status, setStatus,
    onChange: (pag) => fetchData(pag.current, pag.pageSize),
    refetch: () => fetchData(),
    fetchWith: (opts) => fetchData(1, pageSize, opts?.search ?? search, opts?.status ?? status),
  };
}

export default function AdminDashboard() {
  // small “stats” section (optional demo)
  const [stats, setStats] = useState({ students: 0, donors: 0 });
  useEffect(() => {
    Promise.all([
      api.get('/admin/students', { params: { page: 1, pageSize: 1 } }),
      api.get('/admin/donors',   { params: { page: 1, pageSize: 1 } }),
    ]).then(([s, d]) => setStats({ students: s.data.total, donors: d.data.total })).catch(()=>{});
  }, []);

  // Students list state
  const students = usePaginatedFetch('/admin/students');
  const donors = usePaginatedFetch('/admin/donors');

  const studentColumns = useMemo(() => ([
    { title: 'Name', render: (_, r) => `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone_number' },
    { title: 'Status', dataIndex: 'status', render: v =>
        v ? <Tag color={v==='verified'?'green':v==='pending'?'gold':'volcano'}>{v}</Tag> : '-' },
    { title: 'City', dataIndex: 'city' },
    { title: 'State', dataIndex: 'state' },
    { title: 'Joined', dataIndex: 'created_at', render: v => new Date(v).toLocaleDateString() },
  ]), []);

  const donorColumns = useMemo(() => ([
    { title: 'Organization', dataIndex: 'organization_name' },
    { title: 'Contact', dataIndex: 'contact_person' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone_number' },
    { title: 'City', dataIndex: 'city' },
    { title: 'State', dataIndex: 'state' },
    { title: 'Total Contribution', dataIndex: 'total_contribution' },
    { title: 'Joined', dataIndex: 'created_at', render: v => new Date(v).toLocaleDateString() },
  ]), []);

  return (
    <>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}><Card><Statistic title="Total Students" value={stats.students} /></Card></Col>
        <Col span={12}><Card><Statistic title="Total Donors" value={stats.donors} /></Card></Col>
      </Row>

      <Tabs items={[
        {
          key: 'students', label: 'Students',
          children: (
            <>
              <Space style={{ marginBottom: 12 }}>
                <Input.Search
                  allowClear
                  placeholder="Search name, email, phone, city…"
                  value={students.search}
                  onChange={e => students.setSearch(e.target.value)}
                  onSearch={() => students.fetchWith({ search: students.search })}
                  style={{ width: 320 }}
                />
                {/* Status quick filter (optional) */}
                {/* <Select
                  placeholder="Status"
                  allowClear
                  style={{ width: 160 }}
                  options={['pending','verified','rejected','inactive'].map(v=>({value:v,label:v}))}
                  value={students.status}
                  onChange={(v)=>{ students.setStatus(v); students.fetchWith({ status:v }); }}
                /> */}
              </Space>

              <Table
                rowKey="student_id"
                columns={studentColumns}
                dataSource={students.data}
                loading={students.loading}
                pagination={{ current: students.page, pageSize: students.pageSize, total: students.total, showSizeChanger: true }}
                onChange={students.onChange}
              />
            </>
          )
        },
        {
          key: 'donors', label: 'Donors',
          children: (
            <>
              <Space style={{ marginBottom: 12 }}>
                <Input.Search
                  allowClear
                  placeholder="Search org, contact, email, city…"
                  value={donors.search}
                  onChange={e => donors.setSearch(e.target.value)}
                  onSearch={() => donors.fetchWith({ search: donors.search })}
                  style={{ width: 320 }}
                />
              </Space>

              <Table
                rowKey="donor_id"
                columns={donorColumns}
                dataSource={donors.data}
                loading={donors.loading}
                pagination={{ current: donors.page, pageSize: donors.pageSize, total: donors.total, showSizeChanger: true }}
                onChange={donors.onChange}
              />
            </>
          )
        },
      ]}/>
    </>
  );
}
