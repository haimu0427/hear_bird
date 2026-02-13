import React, { useMemo } from 'react';
import { ApiResponse } from '../types';
import { BIRD_DB, PLACEHOLDER_BIRD } from '../constants';

interface ResultsScreenProps {
  data: ApiResponse;
  onBack: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ data, onBack }) => {
  
  // Process API data into rich objects using our constant DB
  const processedData = useMemo(() => {
    return data.results.map(result => {
      const dbEntry = BIRD_DB[result.scientificName];
        return {
          ...result,
          image: dbEntry ? dbEntry.image : PLACEHOLDER_BIRD,
          description: dbEntry ? dbEntry.description : "No description available.",
          coverImage: dbEntry ? dbEntry.coverImage : PLACEHOLDER_BIRD,
          coverImageCenterX: dbEntry?.coverImageCenterX ?? 0.5,
          wikiLink: dbEntry?.wikiLink || null,
          // Convert confidence (0-1) to percentage
          matchPercentage: Math.round(result.confidence * 100)
        };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage); // Sort by highest confidence
  }, [data]);

  const handleWikiLinkClick = () => {
    if (primaryMatch.wikiLink) {
      window.open(primaryMatch.wikiLink, '_blank', 'noopener,noreferrer');
    }
  };

  const primaryMatch = processedData[0];
  const otherPossibilities = processedData.slice(1);

  if (!primaryMatch) return <div>No matches found</div>;

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f6f8f6] dark:bg-surface-dark text-slate-900 dark:text-white">
        {/* Noise overlay */}
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 bg-noise z-0"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center p-6 pb-2 justify-between">
            <button 
                onClick={onBack}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-center pr-10 flex-1 opacity-90 font-display">
                Identification Results
            </h2>
        </div>

        {/* Scrollable Content */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar pb-10">
            
            {/* Main Card */}
            <div className="p-6 pt-4">
                <div className="group relative w-full overflow-hidden rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                    <div className="relative">
                        {/* Image */}
                        <div 
                            className="bg-cover h-[460px] w-full transition-transform duration-700 group-hover:scale-105"
                            style={{
                                backgroundImage: `url("${primaryMatch.coverImage}")`,
                                backgroundPosition: `${primaryMatch.coverImageCenterX * 100}% center`
                            }}
                        ></div>
                        
                        {/* Gradient & Content Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="bg-primary text-surface-dark px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(19,236,91,0.4)]">
                                    <span className="material-symbols-outlined text-sm font-bold">verified</span>
                                    <span className="text-xs font-bold uppercase tracking-wide">{primaryMatch.matchPercentage}% Match</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                                <h1 className="text-white text-4xl font-bold leading-tight tracking-tight font-display">{primaryMatch.commonName}</h1>
                                <p className="text-white/80 text-lg font-medium italic font-serif tracking-wide">{primaryMatch.scientificName}</p>
                            </div>

                            <div
                              className={`mt-6 flex items-center gap-2 text-white/60 text-sm font-medium transition-colors ${primaryMatch.wikiLink ? 'cursor-pointer hover:text-white' : 'cursor-not-allowed'}`}
                              onClick={primaryMatch.wikiLink ? handleWikiLinkClick : undefined}
                            >
                                <span>{primaryMatch.wikiLink ? 'Tap to view wikipedia' : 'No wikipedia link available'}</span>
                                {primaryMatch.wikiLink && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
                            </div>
                        </div>
                    </div>
                    <div className="-mt-px bg-white dark:bg-surface-dark px-6 pb-6 pt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
                        {primaryMatch.description}
                    </div>
                </div>
            </div>

            {/* Other Possibilities Section */}
            {otherPossibilities.length > 0 && (
                <>
                    <div className="px-6 pt-2 pb-2">
                        <h3 className="text-lg font-bold tracking-tight opacity-80 flex items-center gap-2 font-display">
                            <span className="material-symbols-outlined text-primary">eco</span>
                            Other Possibilities
                        </h3>
                    </div>

                    <div className="flex flex-col gap-3 px-6">
                        {otherPossibilities.map((bird, idx) => (
                            <button key={idx} className="group flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/50 transition-all text-left w-full active:scale-[0.99]">
                                <div className="relative shrink-0">
                                    <div 
                                        className="bg-center bg-cover rounded-xl size-16 shadow-inner"
                                        style={{ backgroundImage: `url("${bird.image}")` }}
                                    ></div>
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-black rounded-full p-0.5">
                                        <div className={`size-3 rounded-full border-2 border-white dark:border-black ${bird.matchPercentage > 50 ? 'bg-yellow-400' : 'bg-orange-400'}`}></div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-base font-bold truncate">{bird.commonName}</p>
                                        <span className="text-sm font-mono font-medium text-neutral-500 dark:text-neutral-400">{bird.matchPercentage}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${bird.matchPercentage > 50 ? 'bg-yellow-400' : 'bg-orange-400'}`} 
                                            style={{ width: `${bird.matchPercentage}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 truncate italic">{bird.scientificName}</p>
                                </div>
                                <div className="shrink-0 text-neutral-300 dark:text-neutral-600 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}

            <p className="text-center text-xs text-neutral-400 mt-8 mb-4 px-10">
                AI confidence based on audio clarity and database match.
            </p>
        </div>
    </div>
  );
};
