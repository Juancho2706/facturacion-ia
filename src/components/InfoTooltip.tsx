'use client';

import { useState } from 'react';

interface InfoTooltipProps {
    content: string;
    size?: 'sm' | 'md';
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
}

export default function InfoTooltip({ content, size = 'sm', placement = 'top' }: InfoTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const sizeClasses = size === 'sm' ? 'w-4 h-4 text-xs' : 'w-5 h-5 text-sm';

    // Positioning logic
    let positionClasses = '';
    let arrowClasses = '';

    switch (placement) {
        case 'top':
            positionClasses = 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
            arrowClasses = 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
            break;
        case 'bottom':
            positionClasses = 'top-full left-1/2 transform -translate-x-1/2 mt-2';
            arrowClasses = 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900';
            break;
        case 'left':
            positionClasses = 'right-full top-1/2 transform -translate-y-1/2 mr-2';
            arrowClasses = 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900';
            break;
        case 'right':
            positionClasses = 'left-full top-1/2 transform -translate-y-1/2 ml-2';
            arrowClasses = 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900';
            break;
        case 'bottom-end': // Aligned to right edge, appearing below
            positionClasses = 'top-full right-0 mt-2';
            arrowClasses = 'bottom-full right-2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900';
            break;
        case 'top-end': // Aligned to right edge, appearing above
            positionClasses = 'bottom-full right-0 mb-2';
            arrowClasses = 'top-full right-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
            break;
        case 'bottom-start': // Aligned to left edge, appearing below
            positionClasses = 'top-full left-0 mt-2';
            arrowClasses = 'bottom-full left-2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900';
            break;
        case 'top-start': // Aligned to left edge, appearing above
            positionClasses = 'bottom-full left-0 mb-2';
            arrowClasses = 'top-full left-2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
            break;
        default:
            positionClasses = 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
            arrowClasses = 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900';
    }

    return (
        <div
            className="relative inline-flex items-center ml-1 z-10"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)}
        >
            <div className={`${sizeClasses} rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center cursor-help border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 shadow-sm shadow-blue-500/10`}>
                <span className="font-bold">?</span>
            </div>

            {isVisible && (
                <div className={`absolute ${positionClasses} w-48 sm:w-64 p-4 bg-[#151B2D]/95 backdrop-blur-xl border border-white/10 text-gray-300 text-xs rounded-xl shadow-2xl animate-fade-in z-[100] pointer-events-none`}>
                    <p className="leading-relaxed font-medium">
                        {content}
                    </p>
                    <div className={`absolute w-3 h-3 bg-[#151B2D] border-l border-t border-white/10 transform rotate-45 ${placement.includes('top') ? 'bottom-[-6px] border-l-0 border-t-0 border-r border-b' :
                        placement.includes('bottom') ? 'top-[-6px]' :
                            placement.includes('left') ? 'right-[-6px] border-l-0 border-b-0 border-r border-t' :
                                'left-[-6px] border-r-0 border-t-0 border-l border-b'
                        } ${placement === 'top' || placement === 'bottom' ? 'left-1/2 -translate-x-1/2' :
                            placement === 'left' || placement === 'right' ? 'top-1/2 -translate-y-1/2' :
                                placement.includes('end') ? 'right-3' :
                                    placement.includes('start') ? 'left-3' : ''
                        }`} style={{ zIndex: -1 }}></div>
                </div>
            )}
        </div>
    );
}
