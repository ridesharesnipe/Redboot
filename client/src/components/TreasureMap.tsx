import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, MapPin, Lock } from "lucide-react";
import type { WordList, Progress } from "@shared/schema";

interface TreasureMapProps {
  wordLists: WordList[];
  progress: Progress[];
  childId: string;
}

export default function TreasureMap({ wordLists, progress, childId }: TreasureMapProps) {
  const getWeekStatus = (weekNumber: number) => {
    const weekProgress = progress.filter(p => {
      const wordList = wordLists.find(wl => wl.id === p.wordListId);
      return wordList?.weekNumber === weekNumber;
    });

    if (weekProgress.length === 0) return { status: 'locked', score: 0 };
    
    const avgScore = weekProgress.reduce((sum, p) => sum + (p.score || 0), 0) / weekProgress.length;
    
    if (avgScore >= 80) return { status: 'completed', score: Math.round(avgScore) };
    return { status: 'current', score: Math.round(avgScore) };
  };

  const maxWeeks = Math.max(8, Math.max(...wordLists.map(wl => wl.weekNumber || 1)));
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);

  return (
    <Card className="bg-gradient-to-br from-ocean-100 to-ocean-200 rounded-2xl mb-8 relative overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-ocean-800 text-center">
          🗺️ Weekly Progress Map
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Map Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-8 h-8 bg-pirate-500 rounded-full"></div>
          <div className="absolute top-20 right-20 w-6 h-6 bg-treasure-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/3 w-4 h-4 bg-primary rounded-full"></div>
        </div>

        {/* Progress Path */}
        <div className="relative z-10" data-testid="treasure-map">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {weeks.map((weekNumber) => {
              const { status, score } = getWeekStatus(weekNumber);
              
              return (
                <div key={weekNumber} className="text-center">
                  <Link href={status !== 'locked' ? `/game/${childId}` : '#'}>
                    <div 
                      className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg transition-all cursor-pointer hover:scale-105 ${
                        status === 'completed' 
                          ? 'bg-secondary' 
                          : status === 'current' 
                          ? 'bg-accent treasure-shimmer' 
                          : 'bg-muted opacity-50'
                      }`}
                      data-testid={`week-${weekNumber}-${status}`}
                    >
                      {status === 'completed' ? (
                        <Check className="w-6 h-6 text-secondary-foreground" />
                      ) : status === 'current' ? (
                        <MapPin className="w-6 h-6 text-accent-foreground" />
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </Link>
                  <h4 className={`font-bold text-sm ${
                    status === 'locked' ? 'text-muted-foreground' : 'text-foreground'
                  }`} data-testid={`text-week-${weekNumber}-title`}>
                    Week {weekNumber}
                  </h4>
                  <p className={`text-xs ${
                    status === 'locked' ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`} data-testid={`text-week-${weekNumber}-score`}>
                    {status === 'locked' ? 'Locked' : `${score}%`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
