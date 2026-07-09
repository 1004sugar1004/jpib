import React, { useState, useEffect, useRef } from 'react';
import { MapPin, CheckCircle, Globe, RefreshCw } from 'lucide-react';
import { Landmark } from '../../types';

interface LandmarkMapProps {
  landmarks: Landmark[];
  completedIds: string[];
  onSelectLandmark: (id: string) => void;
}

export const LandmarkMap = ({ landmarks, completedIds, onSelectLandmark }: LandmarkMapProps) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loadingSvg, setLoadingSvg] = useState<boolean>(true);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Attempt to load external worldMap.svg if present
  useEffect(() => {
    setLoadingSvg(true);
    fetch('/worldMap.svg')
      .then((res) => {
        if (res.ok) {
          return res.text();
        }
        throw new Error('worldMap.svg not found, falling back to built-in map');
      })
      .then((text) => {
        // Simple sanity check that it's valid SVG
        if (text.includes('<svg') || text.includes('<SVG')) {
          setSvgContent(text);
        } else {
          setSvgContent(null);
        }
      })
      .catch(() => {
        setSvgContent(null);
      })
      .finally(() => {
        setLoadingSvg(false);
      });
  }, []);

  // When external SVG is loaded, attach click listeners to data-landmark-id
  useEffect(() => {
    if (!svgContent || !mapContainerRef.current) return;

    const container = mapContainerRef.current;
    
    const handleSvgClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const landmarkElem = target.closest('[data-landmark-id]');
      if (landmarkElem) {
        const id = landmarkElem.getAttribute('data-landmark-id');
        const name = landmarkElem.getAttribute('data-name');
        if (id) {
          let realId: string | null = null;
          
          // 1. Match by sequential index if id is numeric
          if (/^\d+$/.test(id)) {
            const idx = parseInt(id, 10) - 1;
            if (idx >= 0 && idx < landmarks.length) {
              realId = landmarks[idx].id;
            }
          }
          
          // 2. Match by name
          if (!realId && name) {
            const found = landmarks.find(lm => lm.name === name);
            if (found) realId = found.id;
          }
          
          // 3. Fallback
          if (!realId) {
            realId = id;
          }
          
          onSelectLandmark(realId);
        }
      }
    };

    container.addEventListener('click', handleSvgClick);
    return () => {
      container.removeEventListener('click', handleSvgClick);
    };
  }, [svgContent, onSelectLandmark, landmarks]);

  // Dynamically update 'completed' state on custom SVG pin nodes
  useEffect(() => {
    if (!svgContent || !mapContainerRef.current) return;
    const pins = mapContainerRef.current.querySelectorAll('.pin');
    pins.forEach((pin) => {
      const landmarkId = pin.getAttribute('data-landmark-id');
      const name = pin.getAttribute('data-name');
      if (landmarkId) {
        let realId: string | null = null;
        if (/^\d+$/.test(landmarkId)) {
          const idx = parseInt(landmarkId, 10) - 1;
          if (idx >= 0 && idx < landmarks.length) {
            realId = landmarks[idx].id;
          }
        }
        if (!realId && name) {
          const found = landmarks.find(lm => lm.name === name);
          if (found) realId = found.id;
        }
        if (!realId) {
          realId = landmarkId;
        }

        if (completedIds.includes(realId)) {
          pin.classList.add('completed');
          // Add visual cue for completed custom SVG pins (emerald green)
          (pin as HTMLElement).style.fill = '#10B981';
          (pin as HTMLElement).style.stroke = '#34D399';
        } else {
          pin.classList.remove('completed');
          (pin as HTMLElement).style.fill = '';
          (pin as HTMLElement).style.stroke = '';
        }
      }
    });
  }, [svgContent, completedIds, landmarks]);

  if (svgContent) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
          <Globe className="w-3.5 h-3.5 animate-spin-slow" />
          <span>사용자 정의 세계 지도(worldMap.svg)가 로드되었습니다.</span>
        </div>
        
        {/* Scrollable responsive wrapper designed with elegant styling and precise aspect ratio */}
        <div className="w-full overflow-auto border-2 border-slate-700 rounded-[2rem] shadow-2xl bg-[#dff4ff]">
          <div 
            ref={mapContainerRef}
            className="min-w-[1000px] aspect-[16/9] w-full cursor-pointer p-0 select-none relative"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>
      </div>
    );
  }

  // Fallback to built-in beautifully styled world map
  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* Fallback Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>인터랙티브 대륙 지도</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">지도 위의 반짝이는 핀을 눌러 탐험을 시작하세요!</p>
      </div>

      {/* Styled World Map Fallback Card */}
      <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-[2rem] border-2 border-slate-800 overflow-hidden shadow-2xl p-2 select-none">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:4%_8%]" />

        {/* Abstract Stylized Continents SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 1000 500" fill="currentColor">
          {/* North America */}
          <path d="M 100,100 Q 150,80 200,90 T 280,150 T 260,220 T 150,230 Z" className="text-slate-400" />
          {/* South America */}
          <path d="M 240,240 Q 280,260 300,320 T 280,420 T 230,350 Z" className="text-slate-400" />
          {/* Greenland */}
          <path d="M 320,40 Q 360,50 350,80 T 300,70 Z" className="text-slate-400" />
          {/* Eurasia (Europe + Asia) */}
          <path d="M 420,80 Q 550,50 700,60 T 880,120 T 820,280 T 600,280 T 450,200 Z" className="text-slate-400" />
          {/* Africa */}
          <path d="M 430,220 Q 520,210 560,280 T 520,420 T 450,320 T 410,260 Z" className="text-slate-400" />
          {/* Australia */}
          <path d="M 750,330 Q 820,320 860,350 T 820,410 T 740,380 Z" className="text-slate-400" />
        </svg>

        {/* Ocean Waves/Grid Details */}
        <div className="absolute bottom-4 left-6 text-[10px] font-mono text-slate-500 flex items-center gap-2">
          <span>PACIFIC OCEAN</span>
          <span>•</span>
          <span>ATLANTIC OCEAN</span>
          <span>•</span>
          <span>INDIAN OCEAN</span>
        </div>

        {/* Landmark Pins */}
        {landmarks.map((landmark) => {
          const isCompleted = completedIds.includes(landmark.id);
          return (
            <button
              key={landmark.id}
              onClick={() => onSelectLandmark(landmark.id)}
              style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-10"
              title={isCompleted ? `${landmark.name} (${landmark.country})` : '미개척 탐험지 ❓'}
            >
              {/* Outer pulsing ring */}
              <span className={`absolute -inset-4 rounded-full opacity-60 transition-all ${
                isCompleted 
                  ? 'bg-emerald-500/20 group-hover:scale-125' 
                  : 'bg-rose-500/30 animate-pulse group-hover:scale-150'
              }`} />

              {/* Ping animation for uncompleted */}
              {!isCompleted && (
                <span className="absolute -inset-1 rounded-full animate-ping bg-rose-500 opacity-75 pointer-events-none" />
              )}

              {/* Pin design */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border shadow-lg transform transition-all duration-300 group-hover:scale-110 ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' 
                  : 'bg-slate-900 border-rose-500 text-rose-400 shadow-rose-500/20 group-hover:bg-rose-500 group-hover:text-white'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 font-bold" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}

                {/* Hover label tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl border border-slate-800 z-50 pointer-events-none">
                  {isCompleted ? (
                    <>
                      <span className="block font-black text-emerald-400">🎉 {landmark.name}</span>
                      <span className="block text-[8px] text-slate-400 font-medium mt-0.5">{landmark.country} ({landmark.continent})</span>
                    </>
                  ) : (
                    <>
                      <span className="block font-black text-rose-400">❓ 미개척 탐험지</span>
                      <span className="block text-[8px] text-slate-400 font-medium mt-0.5">{landmark.continent} 대륙</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
