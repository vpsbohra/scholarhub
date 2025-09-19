import React, { useMemo } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

export default function AppLayout({ children }) {
  const location = useLocation();
  const { token } = theme.useToken();
  const role = localStorage.getItem('role');

  const items = useMemo(() => {
    if (role === 'student') {
        return [
            { key: '/dashboard/student', icon: <DashboardOutlined/>, label: <Link to="/dashboard/student">Dashboard</Link> },
            { key: '/profile/student',   icon: <FileTextOutlined/>,  label: <Link to="/profile/student">My Profile</Link> },
            { key: '/applications',      icon: <FileTextOutlined/>,  label: <Link to="/applications">My Applications</Link> },
            { key: '/scholarships',      icon: <BankOutlined/>,      label: <Link to="/scholarships">Scholarships</Link> },
        ];
    }   
    if (role === 'donor') {
        return [
            { key: '/dashboard/donor', icon: <DashboardOutlined/>, label: <Link to="/dashboard/donor">Dashboard</Link> },
            { key: '/profile/donor',   icon: <FileTextOutlined/>,  label: <Link to="/profile/donor">Organization Profile</Link> },
            // { key: '/scholarships/manage', icon: <BankOutlined/>,  label: <Link to="/scholarships/manage">Manage Scholarships</Link> },
            // { key: '/students', icon: <TeamOutlined/>, label: <Link to="/students">Students</Link> },
        ];
    }
    // admin / superadmin
    return [
      { key: '/dashboard/admin', icon: <DashboardOutlined/>, label: <Link to="/dashboard/admin">Dashboard</Link> },
      { key: '/scholarships/manage', icon: <BankOutlined/>, label: <Link to="/scholarships/manage">Manage Scholarships</Link> },
      { key: '/donors', icon: <TeamOutlined/>, label: <Link to="/donors">CSR Donors</Link> },
      { key: '/students', icon: <TeamOutlined/>, label: <Link to="/students">Students</Link> },
      { key: '/applications/admin', icon: <FileTextOutlined/>, label: <Link to="/applications/admin">Applications</Link> },
    ];
  }, [role]);

  const onLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: 'white', padding: 16, fontWeight: 700 }}>ScholarHub</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontWeight: 600 }}>Welcome, {role}</div>
          <Button type="default" icon={<LogoutOutlined />} onClick={onLogout}>Logout</Button>
        </Header>
        <Content style={{ margin: 16, padding: 16, background: token.colorBgContainer, borderRadius: 12 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
