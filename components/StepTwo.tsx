import React, { useState } from 'react';
import { StyleData, SceneData, PRESET_STYLES } from '../types';
import { Wand2, User, Check } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface StepTwoProps {
  scene: SceneData;
  onSelect: (style: StyleData) => void;
  setLoading: (loading: boolean) => void;
  onBack: () => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ scene, onSelect, setLoading, onBack }) => {
  const [numPeople, setNumPeople] = useState(1);
  const [activeTab, setActiveTab] = useState<'preset' | 'generate'>('preset');
  const [genPrompt, setGenPrompt] = useState('');

  const handlePresetSelect = (preset: typeof PRESET_STYLES[0]) => {
    onSelect({
      id: `preset-style-${preset.id}`,
      url: preset.url,
      description: preset.description,
      numPeople: numPeople,
      type: 'preset'
    });
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setLoading(true);
    try {
      const prompt = `A clear photo showing fashion style: ${genPrompt}. Clothes only or models wearing clothes. White background preferred.`;
      const url = await generateImage(prompt);
      onSelect({
        id: `gen-style-${Date.now()}`,
        url,
        description: genPrompt,
        numPeople: numPeople,
        type: 'generated'
      });
    } catch (error) {
      alert('生成风格参考图失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-fade-in">
      
      {/* Context Bar - Showing Step 1 Selection */}
      <div className="flex items-center bg-slate-100 p-3 rounded-xl mb-6 text-sm">
        <span className="text-slate-500 mr-2">已选场景:</span>
        <div className="w-8 h-8 rounded-md overflow-hidden mr-3 border border-slate-300">
            <img src={scene.url} alt="scene thumbnail" className="w-full h-full object-cover" />
        </div>
        <span className="font-medium text-slate-700 truncate flex-1">{scene.description}</span>
        <button onClick={onBack} className="text-xs text-primary underline ml-2">更改</button>
      </div>

      {/* Number of People Slider */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
            <label className="font-medium text-slate-800 flex items-center gap-2">
                <User size={20} className="text-primary"/> 参与拍照人数
            </label>
            <span className="text-2xl font-bold text-primary">{numPeople}</span>
        </div>
        <input 
            type="range" 
            min="1" 
            max="10" 
            value={numPeople} 
            onChange={(e) => setNumPeople(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>1人 (独照)</span>
            <span>5人</span>
            <span>10人 (合照)</span>
        </div>
      </div>

      {/* Style Selection */}
      <div className="flex space-x-4 mb-6 justify-center">
        <button 
          onClick={() => setActiveTab('preset')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'preset' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          预设风格
        </button>
        <button 
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'generate' ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          描述服装/风格
        </button>
      </div>

      {activeTab === 'preset' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PRESET_STYLES.map(style => (
                <div 
                    key={style.id}
                    onClick={() => handlePresetSelect(style)}
                    className="cursor-pointer group relative rounded-xl overflow-hidden aspect-square border-2 border-transparent hover:border-primary"
                >
                    <img src={style.url} alt={style.description} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2">
                        <p className="text-white text-xs">{style.description}</p>
                    </div>
                </div>
            ))}
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-2">描述服装类型或摄影风格</label>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="例如：波西米亚长裙，或者 Cyberpunk 赛博朋克风格..."
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button 
                    onClick={handleGenerate}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                >
                    <Wand2 size={18} /> 生成风格预览
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default StepTwo;