
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { PlotOutline } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import PrettyJsonViewer from './PrettyJsonViewer';

interface JsonDebugViewProps {
  jsonString: string | null;
  requestJsonString: string | null;
  plotOutline: PlotOutline | null;
  currentStep: string | null;
  currentModel: string | null;
  turnTime: number | null;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800/50 p-3 rounded-md shadow-inner mb-4">
        <h4 className="font-semibold text-cyan-400 border-b border-cyan-500/20 pb-2 mb-2">{title}</h4>
        {children}
    </div>
);

export default function JsonDebugView({ jsonString, requestJsonString, plotOutline, currentStep, currentModel, turnTime }: JsonDebugViewProps): React.ReactNode {
  const [view, setView] = useState<'formatted' | 'raw'>('formatted');
  const [jsonViewMode, setJsonViewMode] = useState<'response' | 'request'>('response');
  const { t } = useLocalization();
  const [jsonViewerHeight, setJsonViewerHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedResponseData = useMemo(() => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  }, [jsonString]);

  const parsedRequestData = useMemo(() => {
    if (!requestJsonString) return null;
    try {
      return JSON.parse(requestJsonString);
    } catch (e) {
      return null;
    }
  }, [requestJsonString]);

  const dataToShow = jsonViewMode === 'response' ? parsedResponseData : parsedRequestData;
  const stringToShow = jsonViewMode === 'response' ? jsonString : requestJsonString;
  const jsonTitle = jsonViewMode === 'response' ? t("Raw JSON Response") : t("Sent JSON Request");

  const multipliers = parsedResponseData?.multipliers;
  const assessment = parsedResponseData?.playerBehaviorAssessment;

  const multiplierLabels = [
      t("Item Search Coefficient"),
      t("Location Coefficient"),
      t("Danger Coefficient"),
      t("Logic Coefficient"),
      t("Characters Coefficient"),
  ];

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - mouseMoveEvent.clientY;
      
      const minHeight = 100;
      const maxHeight = containerRect.height - 150; // Ensure top part has at least 150px
      
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setJsonViewerHeight(newHeight);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);
  
  const formatTime = (ms: number | null) => {
    if (ms === null) return '';
    return (ms / 1000).toFixed(2) + 's';
  };

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      <h3 className="text-xl font-bold text-cyan-400 narrative-text mb-4">{t("Debug View")}</h3>
      
      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        {currentStep && (
          <Section title={t("Current AI Step")}>
              <div className="text-sm space-y-1">
                  <p><span className="font-semibold text-gray-400 w-16 inline-block">{t("Step")}:</span> <span className="font-mono text-cyan-300">{currentStep}</span></p>
                  <p><span className="font-semibold text-gray-400 w-16 inline-block">{t("Model")}:</span> <span className="font-mono text-cyan-300">{currentModel}</span></p>
              </div>
          </Section>
        )}
        {turnTime !== null && (
             <Section title={t("Turn Processing Time")}>
                 <p className="text-lg font-mono text-cyan-300">{formatTime(turnTime)}</p>
             </Section>
        )}
        {plotOutline && (
          <Section title={t("Plot Outline")}>
              <div className="space-y-3 text-sm">
                  <div>
                      <h5 className="font-bold text-gray-300">{t("Main Arc")}</h5>
                      <div className="pl-2 border-l border-gray-600 ml-2 text-gray-400">
                          <MarkdownRenderer content={`**${t("Summary")}**: ${plotOutline.mainArc.summary}\n\n**${t("Next Step")}**: ${plotOutline.mainArc.nextImmediateStep}\n\n**${t("Climax")}**: ${plotOutline.mainArc.potentialClimax}`} />
                      </div>
                  </div>
                  <div>
                      <h5 className="font-bold text-gray-300">{t("Character Subplots")}</h5>
                      {plotOutline.characterSubplots.map((subplot, i) => (
                          <div key={i} className="pl-2 border-l border-gray-600 ml-2 mt-2">
                               <h6 className="font-semibold text-cyan-300/80">{subplot.characterName}</h6>
                               <div className="pl-2 border-l border-gray-700 ml-2 text-gray-400">
                                  <MarkdownRenderer content={`**${t("Arc Summary")}**: ${subplot.arcSummary}\n\n**${t("Next Step")}**: ${subplot.nextStep}\n\n**${t("Conflict/Resolution")}**: ${subplot.potentialConflictOrResolution}`} />
                               </div>
                          </div>
                      ))}
                  </div>
                   <div>
                      <h5 className="font-bold text-gray-300">{t("Looming Threats")}</h5>
                       <ul className="list-disc list-inside pl-2 text-gray-400">
                          {plotOutline.loomingThreatsOrOpportunities.map((threat, i) => <li key={i}>{threat}</li>)}
                      </ul>
                  </div>
              </div>
          </Section>
        )}

        {multipliers && (
          <Section title={t("System Multipliers")}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {multipliers.map((m: number, i: number) => (
                      <div key={i} className="bg-gray-900/40 p-2 rounded flex justify-between">
                          <span className="text-gray-400">{multiplierLabels[i] || `Multiplier ${i + 1}`}:</span>
                          <span className="font-mono text-cyan-300">{m.toFixed(2)}</span>
                      </div>
                  ))}
              </div>
          </Section>
        )}

        {assessment && (
          <Section title={t("Player Behavior Assessment")}>
              <div className="bg-gray-900/40 p-2 rounded flex justify-between text-sm">
                  <span className="text-gray-400">{t("History Manipulation Coefficient")}:</span>
                  <span className="font-mono text-cyan-300">{assessment.historyManipulationCoefficient.toFixed(2)}</span>
              </div>
          </Section>
        )}
      
        {!plotOutline && !multipliers && !assessment && !jsonString && !currentStep && turnTime === null && (
          <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center h-full">
              <p>{t("No debug data received yet.")}</p>
          </div>
        )}
      </div>
      
      <div
        onMouseDown={startResizing}
        className="w-full h-1.5 cursor-row-resize bg-gray-700/40 hover:bg-cyan-500/60 transition-colors duration-200 flex-shrink-0"
        aria-hidden="true"
      />
      
      <div style={{ height: `${jsonViewerHeight}px` }} className="flex-shrink-0 flex flex-col pt-2">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-md">
                <button
                    onClick={() => setJsonViewMode('request')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${jsonViewMode === 'request' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                    {t('Request')}
                </button>
                <button
                    onClick={() => setJsonViewMode('response')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${jsonViewMode === 'response' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                    {t('Response')}
                </button>
            </div>
            <span className="font-semibold text-gray-300">{jsonTitle}</span>
            <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-md">
                <button 
                    onClick={() => setView('formatted')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'formatted' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                    {t('Formatted')}
                </button>
                <button
                    onClick={() => setView('raw')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${view === 'raw' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                    {t('Raw')}
                </button>
            </div>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg flex-1 overflow-auto min-h-0">
            {stringToShow ? (
                view === 'formatted' && dataToShow ? (
                    <PrettyJsonViewer data={dataToShow} />
                ) : (
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all p-4">
                        <code>{stringToShow}</code>
                    </pre>
                )
            ) : (
                <p className="text-sm text-gray-500 text-center p-4">
                    {jsonViewMode === 'response' 
                        ? t("No JSON data received yet.") 
                        : t("No request data available yet.")}
                </p>
            )}
        </div>
      </div>
    </div>
  );
}
