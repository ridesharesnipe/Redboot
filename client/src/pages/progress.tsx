import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TreasureMap from "@/components/TreasureMap";
import { ArrowLeft, Trophy, Flame, Crown, Ship, Map } from "lucide-react";
import type { Child, Progress, WordList } from "@shared/schema";

export default function ProgressPage() {
  const { childId } = useParams();
  const [, setLocation] = useLocation();

  const { data: child } = useQuery<Child>({
    queryKey: ["/api/children", childId],
    retry: false,
  });

  const { data: progress } = useQuery<Progress[]>({
    queryKey: ["/api/children", childId, "progress"],
    retry: false,
  });

  const { data: wordLists } = useQuery<WordList[]>({
    queryKey: ["/api/children", childId, "wordlists"],
    retry: false,
  });

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const recentProgress = progress?.slice(0, 5) || [];
  const averageAccuracy = recentProgress.length > 0 
    ? Math.round(recentProgress.reduce((sum, p) => sum + (p.score || 0), 0) / recentProgress.length)
    : 0;
  const totalWordspracticed = progress?.reduce((sum, p) => sum + (p.correctWords?.length || 0) + (p.incorrectWords?.length || 0), 0) || 0;
  const totalTimeSpent = progress?.reduce((sum, p) => sum + (p.timeSpent || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-xl font-bold" data-testid="text-page-title">
            {child.name}'s Progress
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-fun text-foreground mb-4" data-testid="text-treasure-map-title">
            {child.name}'s Treasure Map
          </h2>
          <p className="text-muted-foreground" data-testid="text-treasure-map-subtitle">
            Track your spelling adventure progress across the seven seas
          </p>
        </div>

        {/* Interactive Treasure Map */}
        <TreasureMap 
          wordLists={wordLists || []} 
          progress={progress || []} 
          childId={childId || ''} 
        />

        {/* Achievement Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 text-center shadow-lg">
            <CardContent className="pt-4">
              <div className="w-12 h-12 bg-treasure-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-treasure-50" />
              </div>
              <h4 className="font-bold text-foreground" data-testid="text-badge-first-treasure">First Treasure</h4>
              <p className="text-xs text-muted-foreground">Completed first word list</p>
            </CardContent>
          </Card>

          <Card className={`p-4 text-center shadow-lg ${(child.weeklyStreak || 0) >= 5 ? '' : 'opacity-50'}`}>
            <CardContent className="pt-4">
              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                (child.weeklyStreak || 0) >= 5 ? 'bg-secondary' : 'bg-muted'
              }`}>
                <Flame className={`w-8 h-8 ${
                  (child.weeklyStreak || 0) >= 5 ? 'text-secondary-foreground' : 'text-muted-foreground'
                }`} />
              </div>
              <h4 className={`font-bold ${
                (child.weeklyStreak || 0) >= 5 ? 'text-foreground' : 'text-muted-foreground'
              }`} data-testid="text-badge-hot-streak">
                Hot Streak
              </h4>
              <p className="text-xs text-muted-foreground">5 days in a row</p>
            </CardContent>
          </Card>

          <Card className={`p-4 text-center shadow-lg ${averageAccuracy >= 100 ? '' : 'opacity-50'}`}>
            <CardContent className="pt-4">
              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                averageAccuracy >= 100 ? 'bg-accent' : 'bg-muted'
              }`}>
                <Crown className={`w-8 h-8 ${
                  averageAccuracy >= 100 ? 'text-accent-foreground' : 'text-muted-foreground'
                }`} />
              </div>
              <h4 className={`font-bold ${
                averageAccuracy >= 100 ? 'text-foreground' : 'text-muted-foreground'
              }`} data-testid="text-badge-spelling-master">
                Spelling Master
              </h4>
              <p className="text-xs text-muted-foreground">Perfect week</p>
            </CardContent>
          </Card>

          <Card className={`p-4 text-center shadow-lg ${(child.unlockedCharacters || []).length >= 4 ? '' : 'opacity-50'}`}>
            <CardContent className="pt-4">
              <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                (child.unlockedCharacters || []).length >= 4 ? 'bg-primary' : 'bg-muted'
              }`}>
                <Ship className={`w-8 h-8 ${
                  (child.unlockedCharacters || []).length >= 4 ? 'text-primary-foreground' : 'text-muted-foreground'
                }`} />
              </div>
              <h4 className={`font-bold ${
                (child.unlockedCharacters || []).length >= 4 ? 'text-foreground' : 'text-muted-foreground'
              }`} data-testid="text-badge-captains-choice">
                Captain's Choice
              </h4>
              <p className="text-xs text-muted-foreground">Unlock all characters</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Statistics */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold" data-testid="text-stats-title">
              This Week's Adventure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent" data-testid="text-accuracy-stat">
                  {averageAccuracy}%
                </div>
                <p className="text-muted-foreground">Spelling Accuracy</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary" data-testid="text-words-stat">
                  {totalWordspracticed}
                </div>
                <p className="text-muted-foreground">Words Practiced</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" data-testid="text-time-stat">
                  {Math.floor(totalTimeSpent / 60)}min
                </div>
                <p className="text-muted-foreground">Time Adventuring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {recentProgress.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold" data-testid="text-recent-sessions-title">
                Recent Adventures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProgress.map((session, index) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <Map className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold" data-testid={`text-session-${index}-title`}>
                          Treasure Hunt #{recentProgress.length - index}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-session-${index}-date`}>
                          {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent" data-testid={`text-session-${index}-score`}>
                        {session.score}%
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-session-${index}-time`}>
                        {Math.floor((session.timeSpent || 0) / 60)}:{((session.timeSpent || 0) % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
