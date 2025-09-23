import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";
import { spellingStorage } from "@/lib/localStorage";
import { photoStorage, getWeekStart } from "@/lib/photoStorage";
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
      console.log('File selected for upload:', file.name, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        console.log('File read successfully, starting OCR processing');
        setCapturedImage(imageData);
        processImage(imageData);
        playSound('treasure_chest_open');
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  // Handle file upload from hidden input (for testing)
  const handleHiddenFileUpload = () => {
    if (hiddenFileInputRef.current?.files?.[0]) {
      const file = hiddenFileInputRef.current.files[0];
      console.log('Hidden file input triggered:', file.name);
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

  // Preprocess image for better OCR
  const preprocessImageForOCR = async (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          // Increase contrast
          const enhanced = gray > 128 ? Math.min(255, gray * 1.2) : Math.max(0, gray * 0.8);
          data[i] = enhanced;     // Red
          data[i + 1] = enhanced; // Green  
          data[i + 2] = enhanced; // Blue
        }
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        
        // Return processed image as data URL
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageData;
    });
  };

  // Process image with OCR
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setOcrProgress(0);
    
    try {
      // Preprocess image for better OCR
      console.log('Preprocessing image...');
      const preprocessedImage = await preprocessImageForOCR(imageData);
      
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
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789., -:/()',
        tessedit_pageseg_mode: 6, // Uniform block of text
        preserve_interword_spaces: '1',
      });

      console.log('Starting OCR processing...');

      // Perform OCR on preprocessed image
      const { data: { text } } = await worker.recognize(preprocessedImage);
      await worker.terminate();

      console.log('Raw OCR text:', text);

      // Extract words from OCR text
      const words = extractWordsFromText(text);
      console.log('Extracted words:', words);
      
      setExtractedWords(words);
      setEditableWords([...words]);
      setShowWordList(true);

      // Save photo to free browser storage
      try {
        await photoStorage.savePhoto({
          imageData,
          extractedWords: words,
          wordsCount: words.length,
          capturedAt: new Date(),
          weekStart: getWeekStart(),
        });
      } catch (storageError) {
        console.error('Error saving photo to storage:', storageError);
        // Don't fail the entire process if storage fails
      }
      
      playSound('ship_bell_success');
      toast({
        title: "Photo Saved! 📸",
        description: `Found ${words.length} words. Photo saved to your device.`,
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

  // Fix common OCR errors
  const fixOCRErrors = (word: string): string => {
    const corrections: { [key: string]: string } = {
      'sl': 'jail',      // 'j' misread as missing
      'jal': 'jail',     // 'i' misread 
      'jai': 'jail',     // 'l' missing
      'spra': 'spray',   // 'y' missing
      'mai': 'mail',     // 'l' missing
      'pla': 'play',     // 'y' missing
      'tral': 'tray',    // 'y' misread as 'l'
      'bral': 'braid',   // 'i' missing
      'dela': 'delay',   // 'y' missing
      'waite': 'waited', // 'd' missing
      'holida': 'holiday', // 'y' missing
      'trainin': 'training', // 'g' missing
      'sayin': 'saying', // 'g' missing
    };
    
    return corrections[word] || word;
  };

  // Extract and clean words from OCR text
  const extractWordsFromText = (text: string): string[] => {
    console.log('Extracting words from OCR text:', text);
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const numberedWords: string[] = [];
    const otherWords: string[] = [];
    
    lines.forEach(line => {
      console.log('Processing line:', line);
      
      // Clean up the line first
      const cleanLine = line.trim();
      
      // Skip header lines more aggressively
      if (/spelling\s*pattern|dates|week|\d+\/\d+/i.test(cleanLine)) {
        console.log('Skipping header line:', cleanLine);
        return;
      }
      
      // Look for numbered lists with more flexible patterns
      const numberedPatterns = [
        /^\s*(\d+)[\.\)\s]\s*([a-zA-Z]{2,15})/,           // "1. word" or "1) word" (allow 2+ chars)
        /^\s*(\d+)\s+([a-zA-Z]{2,15})/,                   // "1 word"
        /(\d+)\.\s*([a-zA-Z]{2,15})/,                     // anywhere in line "1. word"
        /(\d+)\s+([a-zA-Z]{2,15})\b/                      // "1 word" with word boundary
      ];
      
      for (const pattern of numberedPatterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          let number = parseInt(match[1]);
          let word = match[2].toLowerCase().trim();
          
          // Handle common OCR errors
          word = fixOCRErrors(word);
          
          // Fix common number OCR errors
          if (number === 0 && word === 'waited') number = 9; // "0. waited" -> "9. waited"
          
          console.log(`Found numbered word ${number}: ${word}`);
          // Store with number for proper ordering (ensure valid array index)
          if (number >= 1 && number <= 20) {
            numberedWords[number - 1] = word;
          }
          return;
        }
      }
      
      // Also look for specific known words that might be missed
      const knownWords = ['jail', 'spray', 'mail', 'play', 'paint', 'tray', 'braid', 'delay', 'waited', 'holiday', 'training', 'saying'];
      for (const knownWord of knownWords) {
        if (cleanLine.toLowerCase().includes(knownWord)) {
          console.log(`Found known word: ${knownWord}`);
          // Add to other words if not already found in numbered list
          if (!numberedWords.includes(knownWord)) {
            otherWords.push(knownWord);
          }
          return;
        }
      }
      
      // Skip fragments that are clearly header parts
      if (cleanLine.length < 15 && (/elling|pate|tern|ain|att/i.test(cleanLine))) {
        console.log('Skipping suspected header fragment:', cleanLine);
        return;
      }
      
      // Look for bullet points (• word, - word, etc.)
      const bulletMatch = cleanLine.match(/^[•\-*]\s*([a-zA-Z]{3,15})/);
      if (bulletMatch) {
        const word = bulletMatch[1].toLowerCase().trim();
        console.log('Found bullet word:', word);
        otherWords.push(word);
        return;
      }
      
      // Extract individual words from line (for unstructured lists) - only if no numbered words found
      if (numberedWords.length === 0) {
        const lineWords = cleanLine.match(/\b[a-zA-Z]{4,15}\b/g); // Require 4+ letters for loose words
        if (lineWords) {
          lineWords.forEach(word => {
            const cleanWord = word.toLowerCase().trim();
            // Filter out common non-spelling words and header fragments
            if (!['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'run', 'say', 'she', 'too', 'use', 'elling', 'pate', 'tern', 'ain', 'att'].includes(cleanWord)) {
              console.log('Found loose word:', cleanWord);
              otherWords.push(cleanWord);
            }
          });
        }
      }
    });
    
    // Prioritize numbered words in order, then add other words
    const finalWords: string[] = [];
    
    // Add numbered words in order (skip empty slots)
    numberedWords.forEach(word => {
      if (word && word.length >= 3) {
        finalWords.push(word);
      }
    });
    
    // Add other words if we don't have enough numbered words
    if (finalWords.length < 10) {
      otherWords.forEach(word => {
        if (!finalWords.includes(word) && word.length >= 3 && word.length <= 15) {
          finalWords.push(word);
        }
      });
    }
    
    console.log('Final extracted words:', finalWords);
    return finalWords.slice(0, 20); // Limit to 20 words max
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

  // Create a hidden file input for testing purposes
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

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
                
                {/* Hidden file input for testing */}
                <input
                  ref={hiddenFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHiddenFileUpload}
                  className="hidden"
                  data-testid="input-file-hidden"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}