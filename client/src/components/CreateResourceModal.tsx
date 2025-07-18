import { type FC } from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import type { ResourceType } from '../hooks/useResources';
import { resourceNames } from '../hooks/useResources';

interface CreateResourceModalProps {
  visible: boolean;
  type: ResourceType;
  loading: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onOk: () => Promise<void>;
  onCancel: () => void;
}

export const CreateResourceModal: FC<CreateResourceModalProps> = ({
  visible,
  type,
  loading,
  error,
  value,
  onChange,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={`Crear ${resourceNames[type].singular}`}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form layout="vertical">
        {error && (
          <Form.Item>
            <Alert
              message={error}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </Form.Item>
        )}
        <Form.Item
          label="Nombre"
          rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
        >
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Ingresa el nombre del ${resourceNames[type].singular}`}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
