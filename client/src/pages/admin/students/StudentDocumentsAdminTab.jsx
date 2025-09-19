// client/src/pages/admin/students/StudentDocumentsAdminTab.jsx
import React, { useEffect, useState } from 'react';
import { Table, Space, Tag, Button, Modal, Form, Input, message, Upload, Select, Card, Alert, Popconfirm } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../../api/axios';
import { fileUrl } from '../../../utils/fileUrl';

const DOC_TYPES = [
  { value: 'id_proof', label: 'ID Proof' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'education', label: 'Educational Document' },
];

export default function StudentDocumentsAdminTab({ studentId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // status modal
  const [modalOpen, setModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null); // { id, nextStatus }
  const [statusForm] = Form.useForm();

  // upload state
  const [uploadForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students/${studentId}/documents`);
      setRows(data);
    } catch (e) {
      message.error(e?.response?.data?.error || 'Failed to load documents');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [studentId]);

  function openStatus(doc, nextStatus) {
    setStatusTarget({ id: doc.document_id, nextStatus });
    statusForm.resetFields();
    setModalOpen(true);
  }

  async function submitStatus() {
    const v = await statusForm.validateFields();
    try {
      await api.patch(`/admin/documents/${statusTarget.id}/status`, {
        status: statusTarget.nextStatus,
        remarks: v.remarks || undefined,
      });
      message.success(`Marked ${statusTarget.nextStatus}`);
      setModalOpen(false);
      load();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Update failed');
    }
  }

  // ---- Admin upload for this student ----
  const beforeUpload = () => false; // prevent auto upload
  const onRemove = () => setFileList([]);

  async function submitUpload() {
    const v = await uploadForm.validateFields();
    const file = fileList[0]?.originFileObj;
    if (!file) return message.error('Please choose a file');

    const fd = new FormData();
    fd.append('doc_type', v.doc_type);
    if (v.title) fd.append('title', v.title);
    fd.append('file', file);

    setUploading(true);
    try {
      await api.post(`/admin/students/${studentId}/documents`, fd);
      message.success('Document uploaded');
      setFileList([]);
      uploadForm.resetFields(['title']);
      load();
    } catch (e) {
      const res = e?.response;
      if (res?.status === 422 && res?.data?.errors?.length) {
        message.error(res.data.errors[0].message);
      } else {
        message.error(res?.data?.error || 'Upload failed');
      }
    } finally { setUploading(false); }
  }

  async function deleteDoc(doc) {
    try {
      await api.delete(`admin/students/${studentId}/documents/${doc.document_id}`);
      message.success('Deleted');
      load();
    } catch (e) {
      message.error(e?.response?.data?.error || 'Delete failed');
    }
  }

  const columns = [
    { title: 'Type', dataIndex: 'doc_type', render: v => ({ id_proof: 'ID Proof', address_proof: 'Address Proof', education: 'Educational' }[v] || v) },
    { title: 'Title', dataIndex: 'title', render: v => v || '-' },
    { title: 'File', render: (_, r) => <a href={fileUrl(r.file_path)} target="_blank" rel="noreferrer">{r.file_name}</a> },
    { title: 'Status', dataIndex: 'status', render: v => <Tag color={v==='approved'?'green':v==='pending'?'gold':'red'}>{v}</Tag> },
    { title: 'Remarks', dataIndex: 'remarks', render: v => v || '-' },
    { title: 'Uploaded', dataIndex: 'uploaded_at', render: v => new Date(v).toLocaleString() },
    { title: 'Actions', render: (_, r) => (
      <Space>
        <a href={fileUrl(r.file_path)} target="_blank" rel="noreferrer">View</a>
        {r.status !== 'approved' && <Button size="small" type="primary" onClick={() => openStatus(r, 'approved')}>Approve</Button>}
        {r.status !== 'rejected' && <Button size="small" danger onClick={() => openStatus(r, 'rejected')}>Reject</Button>}
        {r.status !== 'pending'  && <Button size="small" onClick={() => openStatus(r, 'pending')}>Mark Pending</Button>}
        <Popconfirm title="Delete this document?" onConfirm={() => deleteDoc(r)}>
          <Button size="small" icon={<DeleteOutlined />} danger>Delete</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <>
      <Card
        size="small"
        title="Upload Document (Admin)"
        style={{ marginBottom: 12 }}
      >
        {/* <Alert
          type="info" showIcon
          style={{ marginBottom: 12 }}
          message="Admin upload"
          description="ID/Address proof will replace any existing one. Educational documents allow multiple files."
        /> */}
        <Form form={uploadForm} layout="inline" onFinish={submitUpload}>
          <Form.Item
            name="doc_type" label="Type"
            rules={[{ required: true, message: 'Select document type' }]}
            initialValue="id_proof"
          >
            <Select style={{ width: 200 }} options={DOC_TYPES} />
          </Form.Item>

          <Form.Item name="title" label="Title">
            <Input placeholder="(optional)" style={{ width: 220 }} />
          </Form.Item>

          <Form.Item>
            <Upload.Dragger
              multiple={false}
              beforeUpload={beforeUpload}
              onRemove={onRemove}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              style={{ width: 360 }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Click or drag file here</p>
              <p className="ant-upload-hint">PDF / Image (max 10 MB)</p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>Upload</Button>
          </Form.Item>
        </Form>
      </Card>

      <Table
        rowKey="document_id"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
      />

      <Modal
        open={modalOpen}
        title={`Set status: ${statusTarget?.nextStatus}`}
        onCancel={() => setModalOpen(false)}
        onOk={submitStatus}
        okText="Save"
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item name="remarks" label="Remarks (optional)">
            <Input.TextArea rows={3} placeholder="Why approved/rejected?" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
