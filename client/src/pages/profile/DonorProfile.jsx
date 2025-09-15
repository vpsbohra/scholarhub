import React, { useEffect } from 'react';
import { Form, Input, Card, Row, Col, Button, message } from 'antd';
import api from '../../api/axios';

export default function DonorProfile() {
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/profile/donors/me').then(({data}) => {
      form.setFieldsValue(data);
    }).catch(() => message.error('Failed to load profile'));
  }, [form]);

  const onFinish = async (values) => {
    try {
      const { data } = await api.put('/profile/donors/me', values);
      form.setFieldsValue(data);
      message.success('Profile updated');
    } catch (e) {
      message.error(e.response?.data?.error || 'Update failed');
    }
  };

  return (
    <Card title="Organization Profile">
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="organization_name" label="Organization name" rules={[{required:true}]}><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="contact_person" label="Contact person"><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="email" label="Email" rules={[{type:'email', required:true}]}><Input/></Form.Item></Col>
          <Col span={12}><Form.Item name="phone_number" label="Phone"><Input/></Form.Item></Col>

          <Col span={24}><Form.Item name="address" label="Address"><Input.TextArea rows={2}/></Form.Item></Col>
          <Col span={8}><Form.Item name="city" label="City"><Input/></Form.Item></Col>
          <Col span={8}><Form.Item name="state" label="State"><Input/></Form.Item></Col>
          <Col span={8}><Form.Item name="pincode" label="Pincode"><Input/></Form.Item></Col>
        </Row>

        <Button type="primary" htmlType="submit">Save changes</Button>
      </Form>
    </Card>
  );
}
