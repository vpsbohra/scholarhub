import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Row, Col, Button, message, Popconfirm, Space, Tag, InputNumber } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import { applyFormErrors } from '../../../utils/formErrors';

export default function DonorDetail() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/donors/${id}`);
      form.setFieldsValue(data);
    } catch (e) {
      message.error(e?.response?.data?.error || 'Failed to load donor');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function save() {
    const v = await form.validateFields();
    try {
      await api.put(`/admin/donors/${id}`, v);
      message.success('Saved');
      load();
    } catch (e) {
      if (!applyFormErrors(form, e)) {
        message.error(e?.response?.data?.error || 'Save failed');
      }
    }
  }

  async function toggleStatus() {
    const current = form.getFieldValue('status');
    const next = current === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/admin/donors/${id}/status`, { status: next });
      form.setFieldValue('status', next); // instant UI feedback
      message.success(`Status → ${next}`);
      load();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Failed to update status');
    }
  }

  async function removeDonor() {
    try {
      await api.delete(`/admin/donors/${id}`);
      message.success('Donor removed');
      window.location.href = '/donors';
    } catch (e) {
      // If backend returns 409 when scholarships exist, show that clearly
      const msg = e?.response?.data?.error || 'Remove failed';
      message.error(msg);
    }
  }

  const status = form.getFieldValue('status');

  return (
    <Card
      title={(
        <Space>
          <span>{`Donor #${id}`}</span>
          {status && <Tag color={status === 'active' ? 'green' : 'default'}>{status}</Tag>}
        </Space>
      )}
      loading={loading}
    >
      <Form form={form} layout="vertical" onFinish={save}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="organization_name" label="Organization name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="contact_person" label="Contact person">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ type: 'email', required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone_number" label="Phone">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pan_number" label="PAN">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="pincode" label="Pincode">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="city" label="City">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="state" label="State">
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="address" label="Address">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="total_contribution" label="Total contribution">
              <InputNumber style={{ width: '100%' }} min={0} step={1000} />
            </Form.Item>
          </Col>
          {/* Keep status in form so toggle finds it; hide the input */}
          <Form.Item name="status" noStyle><input type="hidden" /></Form.Item>
        </Row>

        <Space size="middle">
          <Button type="primary" htmlType="submit">Save</Button>
          <Button onClick={toggleStatus}>
            {status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Popconfirm
            title="Remove donor?"
            description="This deletes the donor if they have no scholarships."
            onConfirm={removeDonor}
          >
            <Button danger>Remove</Button>
          </Popconfirm>
        </Space>
      </Form>
    </Card>
  );
}
