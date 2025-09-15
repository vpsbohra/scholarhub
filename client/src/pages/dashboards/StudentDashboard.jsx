import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import api from '../../api/axios';

export default function StudentDashboard() {
  const [me, setMe] = useState(null);
  useEffect(() => { api.get('/auth/me').then(r => setMe(r.data)).catch(()=>{}); }, []);
  return (
    <>
      <Typography.Title level={3}>Student Dashboard</Typography.Title>
      <Row gutter={16}>
        <Col span={8}><Card><Statistic title="Applications" value={3}/></Card></Col>
        <Col span={8}><Card><Statistic title="Approved" value={1}/></Card></Col>
        <Col span={8}><Card><Statistic title="Pending" value={2}/></Card></Col>
      </Row>
      <Card style={{ marginTop:16 }} title="Profile">
        <pre style={{ margin:0 }}>{JSON.stringify(me, null, 2)}</pre>
      </Card>
    </>
  );
}
