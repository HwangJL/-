
import React, { useEffect } from 'react';
import { SceneData, StyleData, ResultData } from '../types';
import { generatePhotoGuide } from '../services/geminiService';
import { Loader2, RefreshCw, RotateCcw } from 'lucide-react';

interface StepThreeProps {
  scene: SceneData;
  style: StyleData;
  onComplete: (result: ResultData) => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
  onReset: () => void;
}

const StepThree: React.FC<StepThreeProps> = ({ scene, style, onComplete, setLoading, loading, onReset }) => {

  useEffect(() => {
     const executeGeneration = async () => {
        setLoading(true);
        try {
            const items = await generatePhotoGuide(
                scene.url, 
                scene.description, 
                style.numPeople, 
                style.description
            );

            const result: ResultData = {
                id: `res-${Date.now()}`,
                items: items,
                createdAt: Date.now()
            };
            onComplete(result);
        } catch (error) {
            console.error(error);
            alert("生成失败，请检查图片源或重试");
            onReset();
        } finally {
            setLoading(false);
        }
     };

     executeGeneration();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h2 className="text-xl font-semibold text-slate-800">正在为您定制拍摄方案...</h2>
              <p className="text-slate-500 mt-2">AI 正在生成6种不同构图与专业指导</p>
          </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-center animate-fade-in">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">生成完成！</h2>
            <p className="text-slate-600">6张推荐构图已生成，点击上方图片查看详细建议。</p>
        </div>
        
        <div className="flex gap-4 justify-center">
            <button 
                onClick={onReset}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium"
            >
                <RotateCcw size={20}/> 重新开始
            </button>
            <button 
                onClick={() => window.location.reload()} 
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white hover:bg-indigo-600 transition-colors font-medium shadow-lg shadow-indigo-200"
            >
                <RefreshCw size={20}/> 再来一组
            </button>
        </div>
    </div>
  );
};

export default StepThree;
