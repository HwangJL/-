
import React from 'react';
import { SceneData, StyleData, ResultData, AppStep } from '../types';
import { Image, User, Camera } from 'lucide-react';

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

const TopDisplay: React.FC<TopDisplayProps> = ({ step, scene, style, result, loading }) => {
  return (
    <div className="w-full bg-gradient-to-b from-slate-100 to-white pb-8 pt-4 px-4 rounded-b-[3rem] shadow-sm border-b border-slate-200 transition-all duration-500">
      
      <div className="max-w-4xl mx-auto mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">PoseMaster AI</h1>
        
        {/* 3 Generated Suggestions (Result View) */}
        {step === AppStep.GENERATION_RESULT && result && (
            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 animate-fade-in">
                {result.images.map((imgUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden shadow-md border-2 border-white hover:scale-105 transition-transform group">
                        <img src={imgUrl} alt={`Suggestion ${index + 1}`} className="w-full h-full object-cover" />
                        
                        {/* Rule of Thirds Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Vertical Lines */}
                            <div className="absolute left-1/3 top-0 bottom-0 w-px border-l border-dashed border-white/60 drop-shadow-md"></div>
                            <div className="absolute left-2/3 top-0 bottom-0 w-px border-l border-dashed border-white/60 drop-shadow-md"></div>
                            {/* Horizontal Lines */}
                            <div className="absolute top-1/3 left-0 right-0 h-px border-t border-dashed border-white/60 drop-shadow-md"></div>
                            <div className="absolute top-2/3 left-0 right-0 h-px border-t border-dashed border-white/60 drop-shadow-md"></div>
                        </div>

                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm z-20">
                            方案 {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Output Box / Status Header */}
        <div className="min-h-[80px] bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center justify-center relative text-left">
            {step === AppStep.GENERATION_RESULT && result ? (
                <div>
                    <h3 className="text-primary font-bold mb-1 text-sm">💡 摄影师建议</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {result.adviceText}
                    </p>
                </div>
            ) : (
                <p className="text-slate-500 text-sm text-center w-full">
                    {loading ? 'AI 正在思考方案与构图中...' : 
                     step === AppStep.SCENE_SELECTION ? '第一步：请选择或上传您的拍摄场景' :
                     step === AppStep.STYLE_SELECTION ? '第二步：设定人数与拍摄风格' :
                     '准备生成最终构图...'}
                </p>
            )}
            {loading && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-xl z-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                <span className="text-xs text-slate-500">生成中...</span>
              </div>
            )}
        </div>
      </div>

      {/* Three Steps Status Cards */}
      <div className="flex justify-center items-center gap-3 md:gap-8 max-w-4xl mx-auto perspective-1000 mt-4">
        
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
                // Show the first image as the preview card
                image={result?.images[0] || null} 
                icon={<Camera size={28}/>} 
                isActive={step === AppStep.GENERATION_RESULT}
                label="AI 推荐构图"
            />
        </div>

      </div>
    </div>
  );
};

export default TopDisplay;
