import React from 'react';
import { Award, Trophy, User, Medal, ExternalLink, Calendar } from 'lucide-react';

const BadgeIcon = ({ type }) => {
    switch (type?.toLowerCase()) {
        case 'gold': return <Medal className="w-6 h-6 text-yellow-400 drop-shadow-lg" fill="currentColor" />;
        case 'silver': return <Medal className="w-6 h-6 text-slate-300 drop-shadow-lg" fill="currentColor" />;
        case 'bronze': return <Medal className="w-6 h-6 text-amber-700 drop-shadow-lg" fill="currentColor" />;
        default: return <Trophy className="w-5 h-5 text-indigo-400" />;
    }
};

const AchievementCard = ({ achievement, showEventName = true }) => {
  return (
    <div className="group relative bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-indigo-500/10">
        {/* Background Image Effect if available */}
        {achievement.image_url && (
             <div className="absolute inset-0 z-0">
                 <img src={achievement.image_url} className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/90 to-transparent" />
             </div>
        )}

        <div className="relative z-10 p-5 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0 h-fit">
                        <BadgeIcon type={achievement.badge} />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                            {achievement.category}
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{achievement.title}</h3>
                        {showEventName && achievement.event_title && (
                            <div className="flex items-center gap-1.5 mt-1 text-indigo-400 text-xs font-semibold">
                                <Award size={12} />
                                <span className="truncate max-w-[200px]">{achievement.event_title}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {achievement.description && (
                <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">{achievement.description}</p>
            )}

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                {/* Student Details */}
                {achievement.student_details ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {achievement.student_name?.[0]}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">{achievement.student_name}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-mono">
                                {achievement.student_details.branch} • {achievement.student_details.year}YR
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-gray-500 italic">Unknown Student</div>
                )}
                
                {/* Certificate Link */}
                {achievement.certificate_url && (
                    <a 
                        href={achievement.certificate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="View Certificate"
                    >
                        <ExternalLink size={16} />
                    </a>
                )}
            </div>
        </div>
    </div>
  );
};

export default AchievementCard;
