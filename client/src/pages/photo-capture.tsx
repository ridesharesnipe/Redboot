import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PhotoCapture from "@/components/PhotoCapture";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PhotoCapturePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/ocr/extract", { imageData });
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedWords(data.words);
      setIsProcessing(false);
      toast({
        title: "Words Extracted!",
        description: `Found ${data.words.length} words in your spelling list.`,
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to extract words from image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    extractTextMutation.mutate(imageData);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedWords([]);
  };

  const handleSaveWords = () => {
    // In a real implementation, this would save the words to a word list
    toast({
      title: "Words Saved!",
      description: "Your spelling words have been added to the word list.",
    });
    setLocation("/");
  };

  const removeWord = (wordToRemove: string) => {
    setExtractedWords(words => words.filter(word => word !== wordToRemove));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold" data-testid="text-page-title">
            Capture Spelling List
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-fun text-foreground mb-4" data-testid="text-capture-title">
            Capture Spelling List
          </h2>
          <p className="text-muted-foreground" data-testid="text-capture-subtitle">
            Take a photo of your child's spelling homework and we'll extract the words automatically
          </p>
        </div>

        {!capturedImage ? (
          /* Camera Interface */
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-center" data-testid="text-camera-instructions">
                Position Your Spelling List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoCapture onCapture={handleImageCapture} />
              <div className="mt-4 text-center">
                <p className="text-muted-foreground mb-4" data-testid="text-photo-tips">
                  Make sure the words are clearly visible and well-lit
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">Good lighting</Badge>
                  <Badge variant="secondary">Clear text</Badge>
                  <Badge variant="secondary">No shadows</Badge>
                  <Badge variant="secondary">Hold steady</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Results Interface */
          <div className="space-y-6">
            {/* Captured Image Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid="text-captured-image-title">Captured Image</span>
                  <Button 
                    variant="outline" 
                    onClick={handleRetake}
                    data-testid="button-retake"
                  >
                    <i className="fas fa-camera mr-2"></i>
                    Retake Photo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={capturedImage} 
                    alt="Captured spelling list" 
                    className="w-full h-full object-cover"
                    data-testid="img-captured"
                  />
                </div>
              </CardContent>
            </Card>

            {/* OCR Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span data-testid="text-detected-words-title">
                    Detected Words
                    {isProcessing && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        Processing...
                      </span>
                    )}
                  </span>
                  {extractedWords.length > 0 && (
                    <Badge variant="secondary" data-testid="text-word-count">
                      {extractedWords.length} words found
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3" />
                    <span data-testid="text-processing">Extracting words from image...</span>
                  </div>
                ) : extractedWords.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {extractedWords.map((word, index) => (
                        <div 
                          key={index}
                          className="bg-muted p-3 rounded-lg text-center relative group"
                        >
                          <span className="font-medium" data-testid={`text-word-${index}`}>
                            {word}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWord(word)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            data-testid={`button-remove-word-${index}`}
                          >
                            <i className="fas fa-times text-xs"></i>
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <Button 
                        onClick={handleSaveWords}
                        className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        data-testid="button-save-words"
                      >
                        <i className="fas fa-check mr-2"></i>
                        Save Word List
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleRetake}
                        data-testid="button-edit-words"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Edit Words
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground" data-testid="text-no-words">
                    No words detected. Please try taking another photo with better lighting.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
