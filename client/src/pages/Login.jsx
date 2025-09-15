import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Typography, message, Divider } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('student');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', values);
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('role', data.role);
      message.success('Logged in');
      if (data.role === 'student') window.location.href = '/dashboard/student';
      else if (data.role === 'donor') window.location.href = '/dashboard/donor';
      else window.location.href = '/dashboard/admin';
    } catch (e) {
      message.error(e.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (resp) => {
    try {
      const credential = resp.credential;
      const { data } = await api.post('/auth/google', { credential, user_type: userType });
      localStorage.setItem('jwt', data.token);
      localStorage.setItem('role', data.role);
      message.success('Logged in with Google');
      if (data.role === 'student') window.location.href = '/dashboard/student';
      else if (data.role === 'donor') window.location.href = '/dashboard/donor';
    } catch (e) {
      message.error(e.response?.data?.error || 'Google login failed');
    }
  };

  const onGoogleError = () => message.error('Google auth failed');

  return (
    <div style={{ display:'grid', placeItems:'center', minHeight:'100vh' }}>
      <Card title="Login" style={{ width: 420 }}>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ user_type: 'student' }}>
          <Form.Item label="User Type" name="user_type" rules={[{ required: true }]}>
            <Select value={userType} onChange={setUserType}
              options={[{value:'student',label:'Student'},{value:'donor',label:'Donor'},{value:'admin',label:'Admin'}]}/>
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type:'email' }]}>
            <Input placeholder="you@example.com" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min:6 }]}>
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Log in</Button>
          </Form.Item>
          <Typography.Paragraph style={{ margin: 0 }}>
            New here? <a href="/register">Create an account</a>
          </Typography.Paragraph>
        </Form>

        <Divider>or</Divider>
    {/* <GoogleLogin
  onSuccess={(resp) => console.log('credential:', resp.credential?.slice(0,20)+'...')}
  onError={() => console.error('google error')}
/> */}
        {/* Google button uses selected userType (student/donor). We do not support admin via Google. */}
        <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} />
      </Card>
    </div>
  );
}
