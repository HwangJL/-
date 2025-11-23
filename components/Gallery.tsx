
import React from 'react';
import { HistoryItem } from '../types';
import { Download } from 'lucide-react';

interface GalleryProps {
  history: HistoryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ history }) => {
  if (history.length === 0) return null;

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `posemaster-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 z-50">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-2">历史生成记录</h3>
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide px-2">
        {history.slice().reverse().map((item, idx) => (
          <div key={item.result.id} className="flex-shrink-0 flex gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
            {item.result.items.map((generatedItem, imgIdx) => (
                <div key={`${item.result.id}-${imgIdx}`} className="w-20 h-20 relative group rounded overflow-hidden">
                    <img src={generatedItem.image} alt={generatedItem.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={() => handleDownload(generatedItem.image)}
                            className="text-white hover:text-primary p-1"
                            title="下载"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                    <div className="absolute bottom-0 w-full text-[8px] text-white bg-black/50 text-center truncate px-1">
                        {generatedItem.label}
                    </div>
                </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
