import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  Upload, 
  Modal, 
  message,
  Card,
  Descriptions,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import html2pdf from 'html2pdf.js';
import { DEFAULT_RESUME_DATA } from './constants';
import ResumeForm from './components/ResumeForm';
import './App.css';


function App() {
  const [resumeData, setResumeData] = useState(() => {
    const savedData = localStorage.getItem('resumeData');
    return savedData ? JSON.parse(savedData) : DEFAULT_RESUME_DATA;
  });

  const [currentSection, setCurrentSection] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
    } catch (error) {
      console.error('Failed to save resume data:', error);
      message.error('Failed to save data');
    }
  }, [resumeData]);

  const renderForm = () => {
    if (!currentSection || !currentData) return null;
  
    return (
      <ResumeForm
        section={currentSection}
        data={currentData}
        onSave={(newData) => {
          const updatedData = {
            ...resumeData,
            [currentSection]: newData
          };
          setResumeData(updatedData);
          setIsModalVisible(false);
          message.success('保存成功');
        }}
      />
    );
  };

  const handleEdit = (section, data) => {
    setCurrentSection(section);
    setCurrentData(data);
    setIsModalVisible(true);
  };

  const handleAvatarUpload = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64 = reader.result;
          setResumeData(prev => ({
            ...prev,
            基本信息: {
              ...prev['基本信息'],
              头像: base64
            }
          }));
          message.success('头像上传成功！');
          resolve(false);
        } catch (error) {
          message.error('头像上传失败，请重试！');
          reject(error);
        }
      };

      reader.onerror = (error) => {
        message.error('文件读取失败，请重试！');
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片！');
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片必须小于 2MB！');
      return false;
    }

    return handleAvatarUpload(file);
  };

  const exportToPDF = () => {
    const opt = {
      margin: [15, 0, 15, 0],
      filename: '简历.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    const element = document.getElementById('resume');
    html2pdf().set(opt).from(element).save();
  };

  const renderContent = (section) => {
    const data = resumeData[section];
    
    switch (section) {
      case '基本信息':
        return (
          <div className="basic-info">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="basic-info-item">
                <strong>{key}：</strong>{value}
              </div>
            ))}
          </div>
        );
        
      case '教育背景':
        return (
          <div>
            {data.map((edu, index) => (
              <div key={index} className="education-item">
                <div>{edu.时间}</div>
                <div><strong>{edu.学校}</strong> - {edu.专业}</div>
              </div>
            ))}
          </div>
        );
        
      case '工作经验':
        return (
          <div>
            {data.map((exp, index) => (
              <div key={index} className="experience-item">
                <div>{exp.时间}</div>
                <div><strong>{exp.公司}</strong> - {exp.职位}</div>
                <div>{exp.描述}</div>
              </div>
            ))}
          </div>
        );
        
      case '专业技能':
        return (
          <div className="skills-list">
            {data.map((skill, index) => (
              <span key={index} className="skill-item">{skill}</span>
            ))}
          </div>
        );
        
      case '自我评价':
        return <div className="self-evaluation">{data}</div>;
        
      default:
        return null;
    }
  };

  return (
    <div className="resume-editor">
      {resumeData && resumeData['基本信息'] && (
        <>
          <div className="editor-toolbar">
            <Space>
              <Button type="primary" onClick={exportToPDF}>导出PDF</Button>
              <Button onClick={() => {
                localStorage.removeItem('resumeData');
                setResumeData(DEFAULT_RESUME_DATA);
                message.success('重置为默认数据');
              }}>重置</Button>
            </Space>
          </div>
  
          <div id="resume" className="resume-content">
            {/* 头部基本信息 */}
            <section className="resume-section header">
              <div className="header-section">
                <div className="avatar-section">
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    className="avatar-uploader"
                  >
                    {resumeData['基本信息']?.['头像'] ? (
                      <img src={resumeData['基本信息']['头像']} alt="头像" className="avatar-image"/>
                    ) : (
                      <div className="upload-placeholder">
                        <PlusOutlined />
                        <div>上传头像</div>
                      </div>
                    )}
                  </Upload>
                </div>
                
                <div className="basic-info" onClick={() => handleEdit('基本信息', resumeData['基本信息'])}>
                  {resumeData['基本信息'] && (
                    <>
                      <h1>{resumeData['基本信息']['姓名']}</h1>
                      <div className="info-grid">
                        {Object.entries(resumeData['基本信息'])
                          .filter(([key]) => key !== '姓名' && key !== '头像')
                          .map(([key, value]) => (
                            <span key={key} className="info-item">
                              {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                            </span>
                          ))
                        }
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
  
            {/* 两列布局的主体内容 */}
            <div className="resume-body">
              {/* 左列 */}
              <div className="resume-left-column">
                {/* 教育背景 */}
                <section className="resume-section">
                  <h2>教育背景</h2>
                  <div onClick={() => handleEdit('教育背景', resumeData['教育背景'])}>
                    {Array.isArray(resumeData['教育背景']) && resumeData['教育背景'].map((edu, index) => (
                      <div key={index} className="education-item">
                        <h3>{edu['学校']} - {edu['专业']}</h3>
                        <p>{edu['时间']} | {edu['学历']}</p>
                        <p>主修课程：{edu['主修课程']}</p>
                        <p>成绩：{edu['成绩']}</p>
                      </div>
                    ))}
                  </div>
                </section>
  
                {/* 专业技能 */}
                <section className="resume-section">
                  <h2>专业技能</h2>
                  <div onClick={() => handleEdit('专业技能', resumeData['专业技能'])}>
                    <ul>
                      {Array.isArray(resumeData['专业技能']) && resumeData['专业技能'].map((skill, index) => (
                        <li key={index}>{typeof skill === 'object' ? JSON.stringify(skill) : skill}</li>
                      ))}
                    </ul>
                  </div>
                </section>
  
                {/* 项目经验 */}
                <section className="resume-section">
                  <h2>项目经验</h2>
                  <div onClick={() => handleEdit('项目经验', resumeData['项目经验'])}>
                    {Array.isArray(resumeData['项目经验']) && resumeData['项目经验'].map((project, index) => (
                      <div key={index} className="project-item">
                        <h3>{project['名称']}</h3>
                        <p>{project['时间']}</p>
                        <p>{project['描述']}</p>
                        <ul>
                          {Array.isArray(project['职责']) && project['职责'].map((duty, i) => (
                            <li key={i}>{typeof duty === 'object' ? JSON.stringify(duty) : duty}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
  
              {/* 右列 */}
              <div className="resume-right-column">
                {/* 校园经历 */}
                <section className="resume-section">
                  <h2>校园经历</h2>
                  <div onClick={() => handleEdit('校园经历', resumeData['校园经历'])}>
                    {Array.isArray(resumeData['校园经历']) && resumeData['校园经历'].map((exp, index) => (
                      <div key={index} className="experience-item">
                        <h3>{exp['职位']}</h3>
                        <p>{exp['时间']}</p>
                        <ul>
                          {Array.isArray(exp['职责']) && exp['职责'].map((duty, i) => (
                            <li key={i}>{typeof duty === 'object' ? JSON.stringify(duty) : duty}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
  
                {/* 证书荣誉 */}
                <section className="resume-section">
                  <h2>证书荣誉</h2>
                  <div onClick={() => handleEdit('证书荣誉', resumeData['证书荣誉'])}>
                    <ul>
                      {Array.isArray(resumeData['证书荣誉']) && resumeData['证书荣誉'].map((cert, index) => (
                        <li key={index}>{typeof cert === 'object' ? JSON.stringify(cert) : cert}</li>
                      ))}
                    </ul>
                  </div>
                </section>
  
                {/* 自我评价 */}
                <section className="resume-section">
                  <h2>自我评价</h2>
                  <div onClick={() => handleEdit('自我评价', resumeData['自我评价'])}>
                    <p>{typeof resumeData['自我评价'] === 'object' ? 
                      JSON.stringify(resumeData['自我评价']) : 
                      resumeData['自我评价']}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </>
      )}
  
    <Modal
      title={`编辑${currentSection}`}
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={800}
    >
      {renderForm()} {/* 使用renderForm而不是renderContent */}
    </Modal>
    </div>
  );
}

export default App;