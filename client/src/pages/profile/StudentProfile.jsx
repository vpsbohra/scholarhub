import React, { useEffect } from 'react';
import { Form, Input, DatePicker, Select, Card, Row, Col, Button, message } from 'antd';
import dayjs from 'dayjs';
import api from '../../api/axios';

const GENDERS = ['Male','Female','Other'];
const CATS = ['General','OBC','SC','ST','Other'];

export default function StudentProfile() {
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/profile/students/me').then(({data}) => {
      const init = { ...data };
      if (init.dob) init.dob = dayjs(init.dob);
      form.setFieldsValue(init);
    }).catch(() => message.error('Failed to load profile'));
  }, [form]);

  const onFinish = async (values) => {
    const payload = { ...values };
    if (payload.dob) payload.dob = payload.dob.format('YYYY-MM-DD');
    try {
      const { data } = await api.put('/profile/students/me', payload);
      form.setFieldsValue({ ...data, dob: data.dob ? dayjs(data.dob) : null });
      message.success('Profile updated');
    } catch (e) {
      message.error(e.response?.data?.error || 'Update failed');
    }
  };

  return (
    <Card title="My Profile">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="first_name" label="First name" rules={[{required:true}]}><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="last_name"  label="Last name"  rules={[{required:true}]}><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="email" label="Email" rules={[{type:'email', required:true}]}><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="phone_number" label="Phone"><Input/></Form.Item></Col>

          <Col span={12}><Form.Item name="dob" label="Date of birth"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
          <Col span={12}><Form.Item name="gender" label="Gender"><Select options={GENDERS.map(v=>({value:v}))}/></Form.Item></Col>

          <Col span={12}><Form.Item name="guardian_name" label="Guardian name"><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="annual_income" label="Annual income (₹)"><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="category" label="Category"><Select options={CATS.map(v=>({value:v}))}/></Form.Item></Col>
          <Col span={12}><Form.Item name="aadhar_number" label="Aadhar Number"><Input/></Form.Item></Col>

          <Col span={24}><Form.Item name="address" label="Address"><Input.TextArea rows={2}/></Form.Item></Col>
          <Col span={8}><Form.Item name="city" label="City"><Input/></Form.Item></Col>
          <Col span={8}><Form.Item name="state" label="State"><Input/></Form.Item></Col>
          <Col span={8}><Form.Item name="pincode" label="Pincode"><Input/></Form.Item></Col>

          <Col span={12}><Form.Item name="bank_account_no" label="Bank account no."><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="ifsc_code" label="IFSC code"><Input/></Form.Item></Col>
        </Row>

        <Button type="primary" htmlType="submit">Save changes</Button>
      </Form>
    </Card>
  );
}
