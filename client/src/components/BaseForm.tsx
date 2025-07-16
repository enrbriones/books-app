import React from 'react';
import { Form, Input, Button } from 'antd';
import type { Rule } from 'antd/lib/form';

interface FormField {
  name: string;
  label: string;
  rules: Rule[];
  type?: string;
  placeholder?: string;
}

interface FormValues {
  [key: string]: unknown;
}

interface BaseFormProps {
  fields: FormField[];
  onSubmit: (values: FormValues) => void;
  submitText: string;
  loading?: boolean;
}

export const BaseForm: React.FC<BaseFormProps> = ({
  fields,
  onSubmit,
  submitText,
  loading = false
}) => {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      onFinish={onSubmit}
      layout="vertical"
      aria-label="Formulario"
    >
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={field.rules}
        >
          <Input
            type={field.type || 'text'}
            placeholder={field.placeholder}
            aria-label={field.label}
          />
        </Form.Item>
      ))}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          aria-label={submitText}
        >
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
};
