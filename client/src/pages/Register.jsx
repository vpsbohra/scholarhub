import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, message, Divider, Typography } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api/axios';

export default function Register() {
  const [userType, setUserType] = useState('student');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = userType === 'student'
        ? { user_type:'student', first_name: values.first_name, last_name: values.last_name, email: values.email, password: values.password }
        : { user_type:'donor', organization_name: values.organization_name, contact_person: values.contact_person, email: values.email, password: values.password };
      await api.post('/auth/register', payload);
      message.success('Registered! Please log in.');
      window.location.href = '/login';
    } catch (e) {
      message.error(e.response?.data?.error || 'Registration failed');
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
      message.success('Signed in with Google');

      // Donor created via Google won’t have organization_name; redirect them to fill profile.
      if (data.role === 'student') window.location.href = '/profile/student';
      else if (data.role === 'donor') window.location.href = '/profile/donor';
    } catch (e) {
      message.error(e.response?.data?.error || 'Google sign-in failed');
    }
  };

  const onGoogleError = () => message.error('Google auth failed');

  return (
    <div style={{ display:'grid', placeItems:'center', minHeight:'100vh' }}>
      <Card title="Register" style={{ width: 520 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Register as">
            <Select value={userType} onChange={setUserType}
              options={[{value:'student',label:'Student'}]} />
          </Form.Item>

          {userType === 'student' ? (
            <>
              <Form.Item label="First name" name="first_name" rules={[{ required: true }]}><Input/></Form.Item>
              <Form.Item label="Last name"  name="last_name"  rules={[{ required: true }]}><Input/></Form.Item>
            </>
          ) : (
            <>
              <Form.Item label="Organization name" name="organization_name" rules={[{ required: true }]}><Input/></Form.Item>
              <Form.Item label="Contact person"   name="contact_person"><Input/></Form.Item>
            </>
          )}

          <Form.Item label="Email" name="email" rules={[{ required: true, type:'email' }]}><Input/></Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, min: 6 }]}><Input.Password/></Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>Create account</Button>
          <Typography.Paragraph style={{ marginTop: 10 }}>
            Already have account? <a href="/login">Login</a>
          </Typography.Paragraph>
        </Form>

        <Divider>or</Divider>

        <GoogleLogin onSuccess={onGoogleSuccess} onError={onGoogleError} />
      </Card>
    </div>
  );
}
