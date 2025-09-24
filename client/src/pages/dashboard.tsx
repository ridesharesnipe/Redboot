import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Child } from "@shared/schema";
import { Anchor, Crown, LogOut, Upload, Mic, Map, User, TrendingUp, Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [childGrade, setChildGrade] = useState("");

  const { data: children, isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
    retry: false,
  });

  const addChildMutation = useMutation({
    mutationFn: async (childData: { name: string; age: number; grade: string }) => {
      await apiRequest("POST", "/api/children", childData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      setShowAddChild(false);
      setChildName("");
      setChildAge("");
      setChildGrade("");
      toast({
        title: "Success",
        description: "New pirate crew member added!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddChild = () => {
    if (!childName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your pirate.",
        variant: "destructive",
      });
      return;
    }

    addChildMutation.mutate({
      name: childName.trim(),
      age: parseInt(childAge) || 8,
      grade: childGrade || "3rd",
    });
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <Anchor className="text-secondary-foreground text-lg" />
            </div>
            <h1 className="font-pirate text-xl text-primary" data-testid="text-app-title">
              Red Boot's Adventure
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground" data-testid="text-user-greeting">
              Welcome, {(user as any)?.firstName || 'Captain'}!
            </span>
            <Link href="/subscribe">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-upgrade">
                <Crown className="w-4 h-4 mr-2" />Upgrade
              </Button>
            </Link>
            <Button 
              variant="ghost"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-fun text-foreground mb-2" data-testid="text-dashboard-title">
            Captain's Quarters
          </h2>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Manage your crew of young pirates and track their progress
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/photo-capture">
            <Card className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-accent text-accent-foreground">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  Capture Word List
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm opacity-90" data-testid="text-action-photo-desc">
                  Take a photo of homework spelling lists
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-secondary text-secondary-foreground">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Weekly Test
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm opacity-90" data-testid="text-action-test-desc">
                Friday test simulator with voice prompts
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 bg-primary text-primary-foreground">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Map className="w-6 h-6" />
                Treasure Map
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm opacity-90" data-testid="text-action-map-desc">
                View progress and achievements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Child Profiles */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold" data-testid="text-crew-title">
              Your Pirate Crew
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children?.map((child) => (
                <Card key={child.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-pirate-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-pirate-50" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground" data-testid={`text-child-name-${child.id}`}>
                        {child.name}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-child-info-${child.id}`}>
                        {child.grade} • Age {child.age}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">This Week</span>
                      <span className="font-medium text-foreground" data-testid={`text-child-accuracy-${child.id}`}>
                        {Math.floor(Math.random() * 30) + 70}% accuracy
                      </span>
                    </div>
                    <Progress value={Math.floor(Math.random() * 30) + 70} className="h-2" />
                    <div className="flex space-x-2">
                      <Link href={`/game/${child.id}`} className="flex-1">
                        <Button 
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                          data-testid={`button-start-adventure-${child.id}`}
                        >
                          Start Adventure
                        </Button>
                      </Link>
                      <Link href={`/progress/${child.id}`}>
                        <Button 
                          variant="outline" 
                          size="icon"
                          data-testid={`button-view-progress-${child.id}`}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add Child Button */}
              <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
                <DialogTrigger asChild>
                  <Card className="p-4 border-2 border-dashed border-border hover:border-accent hover:text-accent transition-colors cursor-pointer flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                    <Plus className="w-6 h-6 mb-2" />
                    <span className="font-medium" data-testid="button-add-pirate">Add New Pirate</span>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle data-testid="text-add-child-title">Add New Pirate</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" data-testid="label-child-name">Name</Label>
                      <Input
                        id="name"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="Enter pirate name"
                        data-testid="input-child-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age" data-testid="label-child-age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        placeholder="8"
                        data-testid="input-child-age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="grade" data-testid="label-child-grade">Grade</Label>
                      <Select value={childGrade} onValueChange={setChildGrade}>
                        <SelectTrigger data-testid="select-child-grade">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="K">Kindergarten</SelectItem>
                          <SelectItem value="1st">1st Grade</SelectItem>
                          <SelectItem value="2nd">2nd Grade</SelectItem>
                          <SelectItem value="3rd">3rd Grade</SelectItem>
                          <SelectItem value="4th">4th Grade</SelectItem>
                          <SelectItem value="5th">5th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddChild}
                      disabled={addChildMutation.isPending}
                      className="w-full"
                      data-testid="button-save-child"
                    >
                      {addChildMutation.isPending ? "Adding..." : "Add Pirate"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        {!(user as any)?.isPremium && (
          <Card className="bg-gradient-to-r from-treasure-400 to-treasure-600 text-treasure-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2" data-testid="text-trial-title">Free Trial Active</h3>
                  <p className="text-treasure-100" data-testid="text-trial-subtitle">
                    Unlock all characters with Premium
                  </p>
                </div>
                <Link href="/subscribe">
                  <Button 
                    className="bg-white text-treasure-600 hover:bg-treasure-50"
                    data-testid="button-upgrade-now"
                  >
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
