
import React, { useState, useEffect } from 'react';
import { SceneData, StyleData, ResultData, AppStep } from '../types';
import { Image, User, Camera, Maximize2, X } from 'lucide-react';

interface TopDisplayProps {
  step: AppStep;
  scene: SceneData | null;
  style: StyleData | null;
  result: ResultData | null;
  loading: boolean;
}

const Card: React.FC<{ 
  title: string; 
  image: string | null; 
  icon: React.ReactNode; 
  isActive: boolean;
  label?: string;
}> = ({ title, image, icon, isActive, label }) => {
  return (
    <div 
      className={`
        relative w-28 h-40 md:w-36 md:h-52 rounded-2xl shadow-lg overflow-hidden border-4 transition-all duration-500 ease-out transform
        ${isActive ? 'border-primary scale-105 z-10 shadow-2xl' : 'border-white opacity-80 scale-95 grayscale'}
      `}
      style={{ transform: isActive ? 'rotate(0deg) translateY(-5px)' : 'rotate(-3deg)' }}
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-slate-200 flex flex-col items-center justify-center text-slate-400">
          {icon}
          <span className="text-xs mt-2 font-medium">{title}</span>
        </div>
      )}
      {label && (
         <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-1 text-white text-[10px] text-center truncate">
           {label}
         </div>
      )}
    </div>
  );
};

// Modal for zooming image
const ImageModal: React.FC<{
  isOpen: boolean;
  image: string;
  label: string;
  advice: string;
  onClose: () => void;
}> = ({ isOpen, image, label, advice, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors z-50">
        <X size={32} />
      </button>
      
      <div className="max-w-5xl w-full max-h-[90vh] bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Image Section */}
        <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative overflow-hidden group">
           <img src={image} alt={label} className="max-w-full max-h-[50vh] md:max-h-[85vh] object-contain relative z-0" />
           
           {/* Grid Overlay in Modal */}
           <div className="absolute inset-0 pointer-events-none z-10 opacity-70">
                {/* Vertical Lines */}
                <div className="absolute left-1/3 top-0 bottom-0 border-l-2 border-white/80 border-dashed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"></div>
                <div className="absolute left-2/3 top-0 bottom-0 border-l-2 border-white/80 border-dashed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"></div>
                {/* Horizontal Lines */}
                <div className="absolute top-1/3 left-0 right-0 border-t-2 border-white/80 border-dashed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"></div>
                <div className="absolute top-2/3 left-0 right-0 border-t-2 border-white/80 border-dashed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"></div>
            </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/3 p-6 overflow-y-auto bg-slate-50">
          <div className="flex items-center gap-2 mb-4">
             <span className="bg-primary text-white text-xs px-2 py-1 rounded-md font-bold uppercase">{label}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">拍摄指导建议</h3>
          <div className="text-sm text-slate-700 space-y-4 leading-relaxed whitespace-pre-line">
            {advice}
          </div>
        </div>
      </div>
    </div>
  );
};

const TopDisplay: React.FC<TopDisplayProps> = ({ step, scene, style, result, loading }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);

  useEffect(() => {
    if (result) {
        setSelectedIndex(0);
    }
  }, [result]);

  return (
    <>
      <div className="w-full bg-gradient-to-b from-slate-100 to-white pb-8 pt-4 px-4 rounded-b-[3rem] shadow-sm border-b border-slate-200 transition-all duration-500">
        
        <div className="max-w-4xl mx-auto mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">PoseMaster AI</h1>
          
          {/* 6 Generated Suggestions (Result View) */}
          {step === AppStep.GENERATION_RESULT && result && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6 animate-fade-in">
                  {result.items.map((item, index) => (
                      <div 
                          key={index} 
                          onClick={() => setSelectedIndex(index)}
                          className={`
                              relative aspect-square rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 group
                              ${selectedIndex === index ? 'ring-4 ring-primary scale-105 z-10' : 'border-2 border-white hover:scale-105 opacity-90'}
                          `}
                      >
                          <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                          
                          {/* Rule of Thirds Grid Overlay (Thumbnails) */}
                          <div className="absolute inset-0 pointer-events-none z-10 opacity-80">
                              <div className="absolute left-1/3 top-0 bottom-0 border-l-2 border-white/80 border-dashed drop-shadow-sm"></div>
                              <div className="absolute left-2/3 top-0 bottom-0 border-l-2 border-white/80 border-dashed drop-shadow-sm"></div>
                              <div className="absolute top-1/3 left-0 right-0 border-t-2 border-white/80 border-dashed drop-shadow-sm"></div>
                              <div className="absolute top-2/3 left-0 right-0 border-t-2 border-white/80 border-dashed drop-shadow-sm"></div>
                          </div>

                          {/* Hover Zoom Overlay */}
                          <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIndex(index);
                                setZoomIndex(index);
                            }}
                            className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20"
                          >
                             <Maximize2 className="text-white drop-shadow-md" size={24} />
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center truncate px-1">
                              {item.label}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* Output Box / Status Header */}
          <div className="min-h-[120px] bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex items-start text-left transition-all duration-300 relative overflow-hidden">
              {step === AppStep.GENERATION_RESULT && result && result.items[selectedIndex] ? (
                  <div className="w-full animate-fade-in">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-md font-bold">
                                {result.items[selectedIndex].label}
                            </span>
                            <h3 className="text-primary font-bold text-sm">💡 摄影师建议</h3>
                          </div>
                          <button 
                            onClick={() => setZoomIndex(selectedIndex)}
                            className="text-xs text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
                          >
                            <Maximize2 size={12}/> 查看大图与详情
                          </button>
                      </div>
                      <p className="text-sm text-slate-700 leading-7 whitespace-pre-line">
                        {result.items[selectedIndex].advice}
                      </p>
                  </div>
              ) : (
                  <p className="text-slate-500 text-sm text-center w-full self-center">
                      {loading ? 'AI 正在思考方案与构图中...' : 
                       step === AppStep.SCENE_SELECTION ? '第一步：请选择或上传您的拍摄场景' :
                       step === AppStep.STYLE_SELECTION ? '第二步：设定人数与拍摄风格' :
                       '准备生成最终构图...'}
                  </p>
              )}
              {loading && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center rounded-xl z-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                  <span className="text-sm text-slate-500 font-medium animate-pulse">正在生成个性化摄影方案...</span>
                </div>
              )}
          </div>
        </div>

        {/* Three Steps Status Cards */}
        <div className={`flex justify-center items-center gap-3 md:gap-8 max-w-4xl mx-auto perspective-1000 mt-4 ${step === AppStep.GENERATION_RESULT ? 'opacity-40 hover:opacity-100 transition-opacity' : ''}`}>
          
          <div className="relative group transition-all duration-500" style={{ zIndex: step === 1 ? 30 : 10 }}>
              <Card 
                  title="场景" 
                  image={scene?.url || null} 
                  icon={<Image size={28}/>} 
                  isActive={step === AppStep.SCENE_SELECTION} 
                  label={scene?.description}
              />
          </div>

          <div className="relative group transition-all duration-500" style={{ zIndex: step === 2 ? 30 : 10 }}>
              <Card 
                  title="风格" 
                  image={style?.url || null} 
                  icon={<User size={28}/>} 
                  isActive={step === AppStep.STYLE_SELECTION} 
                  label={style ? `${style.numPeople}人 · ${style.description}` : undefined}
              />
          </div>

          <div className="relative group transition-all duration-500" style={{ zIndex: step === 3 ? 30 : 10 }}>
              <Card 
                  title="成片" 
                  image={result?.items[selectedIndex].image || null} 
                  icon={<Camera size={28}/>} 
                  isActive={step === AppStep.GENERATION_RESULT}
                  label="AI 推荐构图"
              />
          </div>

        </div>
      </div>

      {/* Full Screen Image Modal */}
      {result && zoomIndex !== null && (
        <ImageModal 
          isOpen={true}
          image={result.items[zoomIndex].image}
          label={result.items[zoomIndex].label}
          advice={result.items[zoomIndex].advice}
          onClose={() => setZoomIndex(null)}
        />
      )}
    </>
  );
};

export default TopDisplay;
