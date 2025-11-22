
import React, { useState } from 'react';
import { AppStep, SceneData, StyleData, ResultData, HistoryItem } from './types';
import TopDisplay from './components/TopDisplay';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';
import Gallery from './components/Gallery';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SCENE_SELECTION);
  const [scene, setScene] = useState<SceneData | null>(null);
  const [style, setStyle] = useState<StyleData | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSceneSelect = (selectedScene: SceneData) => {
    setScene(selectedScene);
    setStep(AppStep.STYLE_SELECTION);
  };

  const handleStyleSelect = (selectedStyle: StyleData) => {
    setStyle(selectedStyle);
    setStep(AppStep.GENERATION_RESULT);
  };

  const handleGenerationComplete = (generatedResult: ResultData) => {
    setResult(generatedResult);
    if (scene && style) {
        setHistory(prev => [...prev, { scene, style, result: generatedResult }]);
    }
  };

  const handleReset = () => {
    setStep(AppStep.SCENE_SELECTION);
    setScene(null);
    setStyle(null);
    setResult(null);
  };

  const handleBackToStepOne = () => {
    setStep(AppStep.SCENE_SELECTION);
    setStyle(null);
  };

  return (
    <div className="min-h-screen flex flex-col pb-40">
      <TopDisplay 
        step={step} 
        scene={scene} 
        style={style} 
        result={result} 
        loading={loading}
      />

      <main className="flex-1 container mx-auto mt-6">
        {step === AppStep.SCENE_SELECTION && (
            <StepOne onSelect={handleSceneSelect} setLoading={setLoading} />
        )}
        
        {step === AppStep.STYLE_SELECTION && scene && (
            <StepTwo 
                scene={scene} 
                onSelect={handleStyleSelect} 
                setLoading={setLoading}
                onBack={handleBackToStepOne}
            />
        )}

        {step === AppStep.GENERATION_RESULT && scene && style && (
            <StepThree 
                scene={scene} 
                style={style} 
                onComplete={handleGenerationComplete} 
                setLoading={setLoading}
                loading={loading}
                onReset={handleReset}
            />
        )}
      </main>

      <Gallery history={history} />
    </div>
  );
};

export default App;
