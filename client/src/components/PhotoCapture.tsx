import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";
import { spellingStorage } from "@/lib/localStorage";
import { Camera, Upload, Check, X, Edit, Loader, ArrowLeft } from 'lucide-react';

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
  onWordsExtracted: (words: string[]) => void;
  onCancel?: () => void;
}

export default function PhotoCapture({ onCapture, onWordsExtracted, onCancel }: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [editableWords, setEditableWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();
  const { playSound } = useAudio();

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access or upload an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  const handleCameraCancel = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    stopCamera();
    setCapturedImage(imageData);
    processImage(imageData);
    playSound('treasure_chest_open');
    onCapture(imageData);
  };

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        processImage(imageData);
        playSound('treasure_chest_open');
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with OCR
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setOcrProgress(0);
    
    try {
      // Lazy-load tesseract.js to keep bundle size small
      const { createWorker } = await import('tesseract.js');
      
      // Create Tesseract worker
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Configure for better spelling word recognition
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
      });

      // Perform OCR
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      // Extract words from OCR text
      const words = extractWordsFromText(text);
      setExtractedWords(words);
      setEditableWords([...words]);
      setShowWordList(true);
      
      playSound('ship_bell_success');
      toast({
        title: "Words Extracted!",
        description: `Found ${words.length} words. Please verify they're correct.`,
      });

    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "OCR Failed",
        description: "Could not extract text from image. Please try a clearer photo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  // Extract and clean words from OCR text
  const extractWordsFromText = (text: string): string[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const words: string[] = [];
    
    lines.forEach(line => {
      // Look for numbered lists (1. word, 2. word, etc.)
      const numberedMatch = line.match(/^\d+\.\s*([a-zA-Z]+)/);
      if (numberedMatch) {
        words.push(numberedMatch[1].toLowerCase().trim());
        return;
      }
      
      // Look for bullet points (• word, - word, etc.)
      const bulletMatch = line.match(/^[•\-*]\s*([a-zA-Z]+)/);
      if (bulletMatch) {
        words.push(bulletMatch[1].toLowerCase().trim());
        return;
      }
      
      // Extract individual words from line
      const lineWords = line.match(/[a-zA-Z]{3,}/g); // Words with 3+ letters
      if (lineWords) {
        lineWords.forEach(word => {
          if (word.length >= 3 && word.length <= 15) { // Reasonable spelling word length
            words.push(word.toLowerCase().trim());
          }
        });
      }
    });
    
    // Remove duplicates and sort
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.slice(0, 20); // Limit to 20 words max
  };

  // Update word in editable list
  const updateWord = (index: number, newWord: string) => {
    const updated = [...editableWords];
    updated[index] = newWord.toLowerCase().trim();
    setEditableWords(updated);
  };

  // Remove word from list
  const removeWord = (index: number) => {
    const updated = editableWords.filter((_, i) => i !== index);
    setEditableWords(updated);
    playSound('anchor_button_click');
  };

  // Add new word
  const addWord = () => {
    setEditableWords([...editableWords, '']);
    playSound('anchor_button_click');
  };

  // Save verified words
  const saveWords = () => {
    const finalWords = editableWords.filter(word => word.trim().length > 0);
    if (finalWords.length === 0) {
      toast({
        title: "No Words",
        description: "Please add at least one spelling word.",
        variant: "destructive",
      });
      return;
    }

    spellingStorage.saveWordList(finalWords);
    onWordsExtracted(finalWords);
    playSound('cannon_achievement');
    
    toast({
      title: "Success!",
      description: `Saved ${finalWords.length} spelling words for this week.`,
    });
  };

  // Cancel word verification and go back
  const cancelVerification = () => {
    setShowWordList(false);
    setCapturedImage(null);
    setExtractedWords([]);
    setEditableWords([]);
    if (onCancel) {
      onCancel();
    }
  };

  const triggerFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileUpload;
    input.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    setShowWordList(false);
    startCamera();
  };

  // Show word verification screen if words were extracted
  if (showWordList) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="border-2 border-border max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center" style={{ fontFamily: 'var(--font-pirate)' }}>
              Verify Your Spelling Words
            </h2>
            
            <p className="text-muted-foreground text-center mb-6">
              Check that each word is spelled correctly. You can edit or remove any words.
            </p>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {editableWords.map((word, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-8 text-sm text-muted-foreground">{index + 1}.</span>
                  <Input
                    value={word}
                    onChange={(e) => updateWord(index, e.target.value)}
                    className="flex-1"
                    placeholder="Enter spelling word"
                    data-testid={`input-word-${index}`}
                  />
                  <Button
                    onClick={() => removeWord(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    data-testid={`button-remove-word-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mb-6">
              <Button onClick={addWord} variant="outline" className="flex-1" data-testid="button-add-word">
                <Edit className="w-4 h-4 mr-2" />
                Add Word
              </Button>
            </div>

            <div className="flex gap-3">
              <Button onClick={cancelVerification} variant="outline" className="flex-1" data-testid="button-cancel-words">
                Cancel
              </Button>
              <Button onClick={saveWords} className="flex-1 bg-green-600 hover:bg-green-700" data-testid="button-save-words">
                <Check className="w-4 h-4 mr-2" />
                Save Words ({editableWords.filter(w => w.trim()).length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // FULLSCREEN CAMERA VIEW
  if (isCameraActive) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            onClick={handleCameraCancel}
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-white/30 hover:bg-black/70"
            data-testid="button-cancel-camera"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Fullscreen camera */}
        <div className="flex-1 relative">
          <video 
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
            data-testid="camera-video"
          />
          
          {/* Overlay guide */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-4 right-4 text-center">
              <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm inline-block">
                📝 Position your spelling list in the frame
              </div>
            </div>
          </div>
        </div>
        
        {/* Capture button at bottom */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Button 
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg hover:bg-gray-100"
            data-testid="button-capture-photo"
          >
            <Camera className="w-8 h-8 text-black" />
          </Button>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Processing screen
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-2 border-border max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-bold mb-2">Extracting Words...</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Reading your spelling list... {ocrProgress}%
            </p>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300" 
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Start screen or photo preview
  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="border-2 border-dashed border-border max-w-md mx-auto">
        <CardContent className="p-8">
          {capturedImage ? (
            <div className="text-center">
              <div className="mb-6">
                <img 
                  src={capturedImage} 
                  alt="Captured spelling list" 
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-retake-photo"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Retake
                </Button>
                <Button 
                  onClick={() => processImage(capturedImage)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-process-image"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Process
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera className="text-accent-foreground w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2" data-testid="text-camera-ready">
                Capture Spelling List
              </h3>
              <p className="text-muted-foreground mb-6" data-testid="text-camera-instructions">
                Take a photo of your child's spelling homework
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={startCamera}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 text-lg"
                  data-testid="button-open-camera"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
                <Button 
                  variant="outline"
                  onClick={triggerFileUpload}
                  className="w-full py-4 text-lg"
                  data-testid="button-upload-file"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}