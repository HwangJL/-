import React, { useState } from 'react';
import { SceneData, PRESET_SCENES } from '../types';
import { Upload, Wand2, CheckCircle } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface StepOneProps {
  onSelect: (scene: SceneData) => void;
  setLoading: (loading: boolean) => void;
}

const StepOne: React.FC<StepOneProps> = ({ onSelect, setLoading }) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'generate'>('preset');
  const [genPrompt, setGenPrompt] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSelect({
          id: `upload-${Date.now()}`,
          url: reader.result as string,
          description: '用户上传场景',
          type: 'upload'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setLoading(true);
    try {
      const url = await generateImage(genPrompt);
      onSelect({
        id: `gen-${Date.now()}`,
        url,
        description: genPrompt,
        type: 'generated'
      });
    } catch (error) {
      alert('生成场景失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      <div className="flex space-x-4 mb-6 justify-center">
        <button 
          onClick={() => setActiveTab('preset')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'preset' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          预设场景
        </button>
        <button 
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          上传图片
        </button>
        <button 
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'generate' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          AI 生成
        </button>
      </div>

      {activeTab === 'preset' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PRESET_SCENES.map(scene => (
            <div 
              key={scene.id} 
              onClick={() => onSelect({ ...scene, type: 'preset' })}
              className="cursor-pointer group relative rounded-xl overflow-hidden aspect-square"
            >
              <img src={scene.url} alt={scene.description} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">{scene.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-slate-50 hover:bg-slate-100 transition-colors">
          <Upload className="text-slate-400 mb-4" size={48} />
          <p className="text-slate-600 mb-4">拖拽图片或点击上传</p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload}
            className="hidden" 
            id="scene-upload"
          />
          <label 
            htmlFor="scene-upload" 
            className="cursor-pointer bg-white border border-slate-300 px-6 py-2 rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
          >
            选择文件
          </label>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">描述你想拍摄的场景</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="例如：落日余晖下的海滩，有椰子树..."
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button 
                    onClick={handleGenerate}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                >
                    <Wand2 size={18} /> 生成
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default StepOne;