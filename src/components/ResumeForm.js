// components/ResumeForm.js
import React from 'react';
import { Form, Input, Button, Space, List, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ResumeForm = ({ section, data, onSave }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    form.setFieldsValue({ [section]: data });
  }, [data, section, form]);

  const renderBasicInfoForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => onSave(values[section])}
      initialValues={{ [section]: data }}
    >
      {Object.keys(data).filter(key => key !== '头像').map(key => (
        <Form.Item
          key={key}
          label={key}
          name={[section, key]}
          rules={[{ required: true, message: `请输入${key}` }]}
        >
          <Input />
        </Form.Item>
      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );

  const renderArrayForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => onSave(values[section])}
      initialValues={{ [section]: data }}
    >
      <Form.List name={[section]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div key={field.key}>
                <Divider>{index + 1}</Divider>
                <Space align="baseline">
                  <Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    rules={[{ required: true, message: '请输入内容' }]}
                  >
                    <Input />
                  </Form.Item>
                </Space>
              </div>
            ))}
            <Form.Item>
              <Button 
                type="dashed" 
                onClick={() => add()} 
                icon={<PlusOutlined />}
              >
                添加项目
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );

  const renderObjectArrayForm = () => {
    const getFieldConfig = (section) => {
      switch (section) {
        case '教育背景':
          return {
            fields: ['学校', '专业', '学历', '时间', '主修课程', '成绩'],
            textAreas: ['主修课程']
          };
        case '项目经验':
          return {
            fields: ['名称', '时间', '描述', '职责'],
            textAreas: ['描述'],
            arrayFields: ['职责']
          };
        case '校园经历':
          return {
            fields: ['职位', '时间', '职责'],
            arrayFields: ['职责']
          };
        default:
          return { fields: [], textAreas: [], arrayFields: [] };
      }
    };
  
    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => onSave(values[section])}
        initialValues={{ [section]: data }}
      >
        <Form.List name={[section]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => {
                const config = getFieldConfig(section);
                
                return (
                  <div key={field.key} style={{ marginBottom: 24, border: '1px dashed #d9d9d9', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h4>项目 {index + 1}</h4>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </div>
                    
                    {config.fields.map(key => {
                      if (config.arrayFields?.includes(key)) {
                        // 处理数组类型的字段（如职责）
                        return (
                          <Form.List key={key} name={[field.name, key]}>
                            {(subFields, { add: addItem, remove: removeItem }) => (
                              <div style={{ marginBottom: 16 }}>
                                <label>{key}：</label>
                                {subFields.map((subField, subIndex) => (
                                  <div key={subField.key} style={{ display: 'flex', marginBottom: 8 }}>
                                    <Form.Item
                                      {...subField}
                                      style={{ flex: 1, marginBottom: 0 }}
                                      rules={[{ required: true, message: `请输入${key}` }]}
                                    >
                                      <Input.TextArea rows={2} />
                                    </Form.Item>
                                    <MinusCircleOutlined
                                      style={{ margin: '8px 0 0 8px' }}
                                      onClick={() => removeItem(subField.name)}
                                    />
                                  </div>
                                ))}
                                <Button
                                  type="dashed"
                                  onClick={() => addItem()}
                                  icon={<PlusOutlined />}
                                  style={{ width: '100%' }}
                                >
                                  添加{key}
                                </Button>
                              </div>
                            )}
                          </Form.List>
                        );
                      } else {
                        // 处理普通字段
                        return (
                          <Form.Item
                            key={key}
                            label={key}
                            name={[field.name, key]}
                            rules={[{ required: true, message: `请输入${key}` }]}
                          >
                            {config.textAreas?.includes(key) ? (
                              <Input.TextArea rows={3} />
                            ) : (
                              <Input />
                            )}
                          </Form.Item>
                        );
                      }
                    })}
                  </div>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => {
                    const currentConfig = getFieldConfig(section);  // 修复：获取当前配置
                    const emptyItem = {};
                    currentConfig.fields.forEach(key => {
                      emptyItem[key] = currentConfig.arrayFields?.includes(key) ? [] : '';
                    });
                    add(emptyItem);
                  }}
                  icon={<PlusOutlined />}
                  style={{ width: '100%' }}
                >
                  添加{section}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const renderSelfEvaluationForm = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => onSave(values[section])}
      initialValues={{ [section]: data }}
    >
      <Form.Item
        name={[section]}
        rules={[{ required: true, message: '请输入自我评价' }]}
      >
        <TextArea rows={6} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">保存</Button>
      </Form.Item>
    </Form>
  );

  switch (section) {
    case '基本信息':
      return renderBasicInfoForm();
    case '专业技能':
    case '证书荣誉':
      return renderArrayForm();
    case '教育背景':
    case '项目经验':
    case '校园经历':
      return renderObjectArrayForm();
    case '自我评价':
      return renderSelfEvaluationForm();
    default:
      return null;
  }
};

export default ResumeForm;