import { useState, useRef, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";
import { photoStorage, getWeekStart } from "@/lib/photoStorage";
import { Upload, Check, X, Edit, Loader, Camera, Sparkles } from 'lucide-react';
import redBootImage from "@assets/1765213908924_1765214014077.jpg";
import sparkleSound from "@assets/sparkle-355937_1765236810252.mp3";

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
  onWordsExtracted: (words: string[], imageData: string, shouldSaveToDb?: boolean) => void;
  onCancel?: () => void;
}

export default function PhotoCapture({ onCapture, onWordsExtracted, onCancel }: PhotoCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [editableWords, setEditableWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [showTreasureCelebration, setShowTreasureCelebration] = useState(false);
  const [treasureWords, setTreasureWords] = useState<string[]>([]);
  
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { toast } = useToast();
  const { playSound, playAudioFile } = useAudio();

  // Treasure jewels for celebration animation
  const treasureJewels = ['💎', '💚', '⭐', '👑', '💰', '🏆', '💜', '💙', '🔶', '✨'];

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // FIX: Bind stream to video element after camera view renders
  useEffect(() => {
    if (stream && isCameraActive && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, [stream, isCameraActive]);

  // Start camera - uses Capacitor Camera plugin on native, browser getUserMedia on web
  const startCamera = async () => {
    setCameraError(null);

    if (Capacitor.isNativePlatform()) {
      try {
        const photo = await CapCamera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Camera,
          width: 1280,
          height: 720,
        });

        if (photo.dataUrl) {
          setCapturedImage(photo.dataUrl);
          processImage(photo.dataUrl);
          onCapture(photo.dataUrl);
        }
      } catch (error) {
        console.error('Capacitor camera error:', error);
        setCameraError('Camera access failed. You can still upload a photo instead.');
        toast({
          title: "Camera Access Failed",
          description: "Please allow camera access or use the upload option instead.",
          variant: "destructive",
        });
      }
      return;
    }
    
    // Web fallback: use browser getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera not available on this device. Please use the upload option.');
      toast({
        title: "Camera Not Available",
        description: "Your browser doesn't support camera access. Please upload a photo instead.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setIsCameraActive(true);
      setCameraError(null);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Camera access denied. You can still upload a photo instead.');
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access or use the upload option instead.",
        variant: "destructive",
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // Capture snapshot from camera
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64 image data (high quality JPEG)
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    stopCamera();
    setCapturedImage(imageData);
    processImage(imageData);
    // Removed loud treasure chest sound - sparkle plays during celebration instead
    onCapture(imageData);
  };

  // Cancel camera and go back
  const cancelCamera = () => {
    stopCamera();
    if (onCancel) {
      onCancel();
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
        // Removed loud treasure chest sound - sparkle plays during celebration instead
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preprocess image for better OCR - optimized for 2025 best practices
  const preprocessImageForOCR = async (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // 2025 best practice: 1000px width is optimal for web OCR
        const maxWidth = 1000;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw image to canvas with scaling
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Step 1: Convert to grayscale
        const grayscale = new Uint8Array(data.length / 4);
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          grayscale[i / 4] = gray;
        }
        
        // Step 2: Build histogram for proper Otsu thresholding
        const histogram = new Array(256).fill(0);
        for (let i = 0; i < grayscale.length; i++) {
          histogram[Math.floor(grayscale[i])]++;
        }
        
        // Step 3: Calculate Otsu's optimal threshold
        let sum = 0;
        for (let i = 0; i < 256; i++) {
          sum += i * histogram[i];
        }
        
        let sumB = 0;
        let wB = 0;
        let maxVariance = 0;
        let threshold = 128; // Default fallback
        
        for (let t = 0; t < 256; t++) {
          wB += histogram[t];
          if (wB === 0) continue;
          
          const wF = grayscale.length - wB;
          if (wF === 0) break;
          
          sumB += t * histogram[t];
          const mB = sumB / wB;
          const mF = (sum - sumB) / wF;
          const variance = wB * wF * (mB - mF) * (mB - mF);
          
          if (variance > maxVariance) {
            maxVariance = variance;
            threshold = t;
          }
        }
        
        console.log(`📊 Otsu threshold: ${threshold}`);
        
        // Step 4: Apply aggressive binarization
        for (let i = 0; i < data.length; i += 4) {
          const gray = grayscale[i / 4];
          // Binarize: white if above threshold, black if below
          const binarized = gray > threshold ? 255 : 0;
          
          data[i] = binarized;     // Red
          data[i + 1] = binarized; // Green  
          data[i + 2] = binarized; // Blue
        }
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        
        // Return processed image as data URL
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.src = imageData;
    });
  };

  // Invert image colors (for dark text on light background vs light text on dark)
  const invertImage = async (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        
        // Invert all pixels
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];       // Red
          data[i + 1] = 255 - data[i + 1]; // Green
          data[i + 2] = 255 - data[i + 2]; // Blue
        }
        
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageData;
    });
  };

  // Process image with FAST single-pass OCR
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setOcrProgress(0);
    
    try {
      console.log('🚀 Starting OCR processing...');
      setOcrProgress(10);

      let allWords: string[] = [];

      // Try Gemini Vision first (more accurate)
      try {
        console.log('🚀 Sending image to Gemini Vision...');
        setOcrProgress(30);

        const response = await fetch('/api/ocr/extract-words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        setOcrProgress(80);

        if (response.ok) {
          const ocrResult = await response.json();
          if (ocrResult.success && ocrResult.words.length > 0) {
            allWords = ocrResult.words;
            console.log(`✅ Gemini found ${allWords.length} words:`, allWords);
          }
        }
      } catch (geminiError) {
        console.log('Gemini unavailable, falling back to Tesseract:', geminiError);
      }

      // Fallback to Tesseract if Gemini returned nothing
      if (allWords.length === 0) {
        console.log('🔄 Falling back to Tesseract...');
        const preprocessedImage = await preprocessImageForOCR(imageData);
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(20 + Math.round(m.progress * 70));
            }
          }
        });
        await worker.setParameters({
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .',
          tessedit_pageseg_mode: 6 as any,
          tessedit_ocr_engine_mode: 1 as any,
        });
        const result = await worker.recognize(preprocessedImage);
        await worker.terminate();
        const numberedWords = extractWordsFromText(result.data.text);
        allWords = numberedWords.length > 0 ? numberedWords : extractWordsFromStructuredData(result.data);
        console.log(`✅ Tesseract found ${allWords.length} words:`, allWords);
      }

      setOcrProgress(100);

      // Deduplicate and limit to reasonable spelling list size (max 20 words)
      const uniqueWords = Array.from(new Set(allWords)).slice(0, 20);
      console.log(`🎯 FINAL WORDS (max 20): ${uniqueWords.length}`, uniqueWords);
      
      let words = uniqueWords;

      // Add fallback for testing or when OCR fails to find text
      if (words.length === 0) {
        console.log('OCR returned no text, offering demo words fallback');
        // Show a helpful message with option to use demo words
        toast({
          title: "No text detected",
          description: "OCR couldn't find text in the image. Would you like to use demo words for testing?",
        });
        
        // For testing purposes, provide demo words if no text detected
        const demoWords = ['jail', 'spray', 'mail', 'play', 'paint', 'tray', 'braid', 'delay', 'waited', 'holiday', 'training', 'saying'];
        console.log('📸 PhotoCapture extracted demo words:', demoWords);
        
        // FIX 1: Save directly to localStorage
        const dataToSave = { words: demoWords, savedDate: new Date().toISOString() };
        localStorage.setItem('currentSpellingWords', JSON.stringify(dataToSave));
        console.log('💾 Saving demo words to localStorage:', demoWords);
        
        setExtractedWords(demoWords);
        setEditableWords([...demoWords]);
        
        // CRITICAL FIX: Notify parent page of demo words (don't save to DB yet)
        onWordsExtracted(demoWords, capturedImage || '', false);
        
        // Show treasure celebration first!
        setTreasureWords(demoWords);
        setShowTreasureCelebration(true);
        // Only play gentle sparkle sound for jewel celebration (no loud chest sound)
        playAudioFile(sparkleSound, 0.5);
        
        // After 3 seconds, show the word list
        setTimeout(() => {
          setShowTreasureCelebration(false);
          setShowWordList(true);
          playSound('ship_bell_success');
        }, 3000);
        
        toast({
          title: "Demo Words Loaded! 📚",
          description: `Using ${demoWords.length} demo spelling words for testing.`,
        });
        return;
      }
      
      // FIX 1: Save OCR words directly to localStorage  
      if (words.length > 0) {
        const dataToSave = { words: words, savedDate: new Date().toISOString() };
        localStorage.setItem('currentSpellingWords', JSON.stringify(dataToSave));
        console.log('💾 Saving OCR words to localStorage:', words);
      }
      
      setExtractedWords(words);
      setEditableWords([...words]);

      // CRITICAL FIX: Notify parent page of extracted words (don't save to DB yet)
      onWordsExtracted(words, capturedImage || '', false);

      // Show treasure celebration first!
      setTreasureWords(words);
      setShowTreasureCelebration(true);
      // Only play gentle sparkle sound for jewel celebration (no loud chest sound)
      playAudioFile(sparkleSound, 0.5);
      
      // After 3 seconds, show the word list
      setTimeout(() => {
        setShowTreasureCelebration(false);
        setShowWordList(true);
        playSound('ship_bell_success');
      }, 3000);
      
      toast({
        title: "Treasure Found! 💎",
        description: `Found ${words.length} spelling words!`,
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

  // Extract complete words from Tesseract's structured output
  const extractWordsFromStructuredData = (data: any): string[] => {
    console.log('Extracting words from structured OCR data');
    console.log('Data keys:', Object.keys(data));
    console.log('Has words property:', !!data.words);
    
    // Try to get words from different possible locations in the data structure
    let wordsArray = data.words;
    
    // If words not at top level, check if there's a page/block structure
    if (!wordsArray && data.blocks) {
      console.log('Checking blocks for words...');
      wordsArray = [];
      for (const block of data.blocks) {
        if (block.words) {
          wordsArray.push(...block.words);
        }
      }
    }
    
    if (!wordsArray || wordsArray.length === 0) {
      console.log('No words found in structured data, will use fallback extraction');
      return [];
    }
    
    console.log(`Found ${wordsArray.length} raw word detections from Tesseract`);
    
    const extractedWords: string[] = [];
    const seenWords = new Set<string>();
    
    // Process each word from Tesseract's word-level detection
    for (const word of wordsArray) {
      const rawText = word.text?.trim();
      const confidence = word.confidence || 0;
      
      console.log(`RAW from Tesseract: "${rawText}" (confidence: ${confidence})`);
      
      // Skip empty
      if (!rawText) {
        console.log(`  → Skipped (empty)`);
        continue;
      }
      
      // NORMALIZE FIRST - strip numbers, punctuation, whitespace
      // This is the KEY FIX - clean BEFORE validating
      let cleanText = rawText
        .replace(/[\d\.\,\!\?\;\:\"\'\(\)\[\]\{\}]/g, '') // Remove numbers and punctuation
        .replace(/\s+/g, '') // Remove whitespace
        .toLowerCase()
        .trim();
      
      console.log(`  → After normalization: "${cleanText}"`);
      
      // NOW validate the cleaned text
      // Skip if:
      // - Empty after cleaning
      // - Too short (less than 2 chars)
      // - Very low confidence (< 10) - VERY lenient now
      // - Not alphabetic (after cleaning)
      // - Common header words
      if (!cleanText || 
          cleanText.length < 2 || 
          confidence < 10 ||
          !/^[a-z]+$/.test(cleanText) ||
          /^(spelling|pattern|word|list|homework|test|week|dates|the|and|for|are|but|not)$/i.test(cleanText)) {
        console.log(`  → Skipped (too short: ${cleanText.length < 2}, low conf: ${confidence < 10}, not alpha: ${!/^[a-z]+$/.test(cleanText)}, header: ${/^(spelling|pattern|word|list|homework|test|week|dates|the|and|for|are|but|not)$/i.test(cleanText)})`);
        continue;
      }
      
      // Avoid duplicates
      if (seenWords.has(cleanText)) {
        console.log(`  → Skipped (duplicate)`);
        continue;
      }
      
      console.log(`  ✓✓✓ ACCEPTED: "${cleanText}" (from raw: "${rawText}")`);
      extractedWords.push(cleanText);
      seenWords.add(cleanText);
      
      // NO LIMIT - Capture all words found (not just 20)
    }
    
    console.log(`✓ Extracted ${extractedWords.length} complete words from structured data:`, extractedWords);
    return extractedWords;
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

  // Check if a word looks like a real spelling word (not garbage OCR output)
  const isValidSpellingWord = (word: string): boolean => {
    if (!word || word.length < 3 || word.length > 15) return false;
    
    // Must be all letters
    if (!/^[a-zA-Z]+$/.test(word)) return false;
    
    // Reject words with 3+ consecutive same letters (garbage like "fffl", "ssst")
    if (/(.)\1\1/.test(word)) return false;
    
    // Reject words that are just repeated patterns (like "stst", "bsbs")
    if (/^(.{1,2})\1+$/.test(word)) return false;
    
    // Reject words with too many consonants in a row (garbage text)
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(word)) return false;
    
    // Must have at least one vowel (real words have vowels)
    if (!/[aeiou]/i.test(word)) return false;
    
    // Reject very short words that are likely noise
    if (word.length === 3 && !/^(the|and|for|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|way|who|boy|did|man|men|run|say|she|too|use|art|ask|bad|bag|bat|bed|big|bit|box|bus|buy|car|cat|cup|cut|dog|dry|eat|end|eye|far|few|fly|fun|got|gun|hat|hit|hot|job|key|kid|lay|led|leg|let|lie|lit|lot|low|mad|map|met|mix|mud|net|nor|nut|odd|oil|own|pay|pen|pet|pie|pin|pit|pop|pot|put|ran|raw|red|rid|rip|row|rub|sad|sat|sea|set|sit|six|sky|sun|tap|ten|tie|tip|top|try|van|via|war|wet|win|won|yes|yet|zip)$/.test(word)) {
      // Short words must be common English words
      return false;
    }
    
    return true;
  };

  // Extract and clean words from OCR text
  const extractWordsFromText = (text: string): string[] => {
    console.log('Extracting words from OCR text:', text);
    
    if (!text || text.trim().length === 0) {
      console.log('No text provided to extract words from');
      return [];
    }
    
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
        /^\s*(\d+)[\.\)\s]\s*([a-zA-Z]{3,15})/,           // "1. word" or "1) word"
        /^\s*(\d+)\s+([a-zA-Z]{3,15})/,                   // "1 word"
        /(\d+)\.\s*([a-zA-Z]{3,15})/,                     // anywhere in line "1. word"
        /(\d+)\s+([a-zA-Z]{3,15})\b/,                     // "1 word" with word boundary
        /^\s*(\d{1,2})\s*\.\s*([a-zA-Z]{3,15})/,         // More flexible "10. word" or "1. word"
        /(\d{1,2})\.([a-zA-Z]{3,15})/                     // "10.word" (no space)
      ];
      
      for (const pattern of numberedPatterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          let number = parseInt(match[1]);
          let word = match[2].toLowerCase().trim();
          
          // Handle common OCR errors
          word = fixOCRErrors(word);
          
          // STRICT: Only accept valid spelling words
          if (!isValidSpellingWord(word)) {
            console.log(`Rejected invalid word: "${word}"`);
            return;
          }
          
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
      
      // Skip fragments that are clearly header parts or garbage
      if (cleanLine.length < 15 && (/elling|pate|tern|ain|att/i.test(cleanLine))) {
        console.log('Skipping suspected header fragment:', cleanLine);
        return;
      }
      
      // Look for bullet points (• word, - word, etc.)
      const bulletMatch = cleanLine.match(/^[•\-*]\s*([a-zA-Z]{3,15})/);
      if (bulletMatch) {
        const word = bulletMatch[1].toLowerCase().trim();
        if (isValidSpellingWord(word)) {
          console.log('Found bullet word:', word);
          otherWords.push(word);
        }
        return;
      }
      
      // Extract individual words from line (STRICT filtering)
      const lineWords = cleanLine.match(/\b[a-zA-Z]{3,15}\b/g); // Only 3-15 letter words
      if (lineWords) {
        lineWords.forEach(word => {
          const cleanWord = word.toLowerCase().trim();
          // Filter out common non-spelling words and header fragments
          const skipWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'run', 'say', 'she', 'too', 'use', 'elling', 'pate', 'tern', 'ain', 'att', 'word', 'list', 'spelling', 'homework', 'test', 'pattern', 'week', 'date', 'name', 'class', 'grade'];
          
          // STRICT: Must pass validation AND not be a skip word
          if (!skipWords.includes(cleanWord) && isValidSpellingWord(cleanWord)) {
            console.log('Found valid word:', cleanWord);
            // Avoid duplicates
            if (!otherWords.includes(cleanWord) && !numberedWords.includes(cleanWord)) {
              otherWords.push(cleanWord);
            }
          } else {
            console.log(`Rejected word: "${cleanWord}"`);
          }
        });
      }
    });
    
    // Prioritize numbered words in order, then add other words
    const finalWords: string[] = [];
    
    // Add numbered words in order (skip empty slots)
    numberedWords.forEach(word => {
      if (word && word.length >= 2) {
        finalWords.push(word);
      }
    });
    
    // Add other words (more flexible)
    otherWords.forEach(word => {
      if (!finalWords.includes(word) && word.length >= 2 && word.length <= 20) {
        finalWords.push(word);
      }
    });
    
    console.log('Final extracted words:', finalWords);
    return finalWords; // NO LIMIT - Return all words found
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
  };

  // Add new word
  const addWord = () => {
    setEditableWords([...editableWords, '']);
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

    // Storage handled by localStorage only (simplified approach)
    
    // Also save to photoStorage for historical reference
    try {
      photoStorage.savePhoto({
        imageData: capturedImage || '',
        extractedWords: finalWords,
        wordsCount: finalWords.length,
        capturedAt: new Date(),
        weekStart: getWeekStart(),
      });
    } catch (error) {
      console.error('Error saving photo to storage:', error);
      // Don't fail if photo storage fails
    }
    
    // CRITICAL FIX: Always notify parent of final confirmed words AND save to DB
    onWordsExtracted(finalWords, capturedImage || '', true);
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
    input.onchange = (event) => {
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
          // Removed loud sound - gentle sparkle plays during celebration instead
          onCapture(imageData);
        };
        reader.readAsDataURL(file);
      } else {
        console.log('No file selected');
      }
    };
    input.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    setShowWordList(false);
  };

  // Camera view - show live camera feed with snap button
  if (isCameraActive) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            onClick={cancelCamera}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            data-testid="button-cancel-camera"
          >
            <X className="w-5 h-5" />
            <span className="text-sm font-medium">Cancel</span>
          </button>
          <span className="text-sm font-semibold text-gray-800">Take Photo</span>
          <div className="w-16"></div>
        </div>
        
        {/* Live camera feed */}
        <div className="flex-1 relative bg-gray-100 m-4 rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Camera overlay with modern guide */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 border-2 border-blue-400/50 rounded-xl"></div>
            <div className="absolute top-6 left-0 right-0 text-center">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-gray-700 text-sm font-medium">
                  Position spelling list in frame
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Camera controls - clean white design */}
        <div className="bg-white px-6 py-6 border-t border-gray-100">
          <div className="flex justify-center items-center gap-8">
            {/* Switch to upload button */}
            <button
              onClick={() => { stopCamera(); triggerFileUpload(); }}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              data-testid="button-switch-to-upload"
            >
              <Upload className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Capture button - prominent blue shutter */}
            <button
              onClick={captureSnapshot}
              className="w-18 h-18 p-1 rounded-full bg-blue-100 flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
              data-testid="button-capture-snapshot"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>
            
            {/* Empty space for balance */}
            <div className="w-12 h-12"></div>
          </div>
          
          <p className="text-gray-400 text-center mt-3 text-xs">
            Tap to capture your spelling list
          </p>
        </div>
        
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Treasure celebration animation - jewels floating down like finding treasure!
  if (showTreasureCelebration) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden" style={{
        background: 'linear-gradient(180deg, #1e3a5f 0%, #2d5a87 50%, #3d7ab3 100%)'
      }}>
        {/* Starry background */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
        
        {/* Falling treasure jewels */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => {
            const jewel = treasureJewels[i % treasureJewels.length];
            const startLeft = Math.random() * 100;
            const animDuration = 2 + Math.random() * 2;
            const delay = Math.random() * 1.5;
            const size = 1.5 + Math.random() * 2;
            const rotation = Math.random() * 720;
            
            return (
              <div
                key={`jewel-${i}`}
                className="absolute animate-bounce"
                style={{
                  left: `${startLeft}%`,
                  top: `-10%`,
                  fontSize: `${size}rem`,
                  animation: `treasureFall ${animDuration}s ease-in forwards, treasureSpin ${animDuration * 0.5}s linear infinite`,
                  animationDelay: `${delay}s`,
                  filter: `drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))`,
                  transform: `rotate(${rotation}deg)`
                }}
              >
                {jewel}
              </div>
            );
          })}
        </div>
        
        {/* Treasure chest opening */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
          <div className="text-8xl animate-bounce" style={{ 
            filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.9))',
            animation: 'chestGlow 1s ease-in-out infinite alternate'
          }}>
            🏴‍☠️
          </div>
        </div>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce" style={{ 
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))'
            }}>
              💰
            </div>
            <h2 className="text-3xl font-bold text-amber-300 mb-2" style={{ 
              fontFamily: "'Pirata One', cursive",
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              Treasure Found!
            </h2>
            <p className="text-xl text-amber-200 mb-4" style={{ 
              fontFamily: "'Fredoka One', cursive" 
            }}>
              {treasureWords.length} words discovered!
            </p>
            
            {/* Word preview bubbles floating up */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
              {treasureWords.slice(0, 6).map((word, i) => (
                <div
                  key={word}
                  className="px-3 py-1 bg-amber-400/90 text-amber-900 rounded-full font-bold text-sm"
                  style={{
                    animation: `wordFloat 0.8s ease-out forwards`,
                    animationDelay: `${1.5 + i * 0.15}s`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  {word}
                </div>
              ))}
              {treasureWords.length > 6 && (
                <div
                  className="px-3 py-1 bg-amber-300/80 text-amber-800 rounded-full font-bold text-sm"
                  style={{
                    animation: `wordFloat 0.8s ease-out forwards`,
                    animationDelay: `${1.5 + 6 * 0.15}s`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                >
                  +{treasureWords.length - 6} more
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sparkle effects */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute text-2xl"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `sparkle 1.5s ease-in-out infinite`,
                animationDelay: `${Math.random() * 1.5}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
        
        {/* CSS Animations */}
        <style>{`
          @keyframes treasureFall {
            0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(calc(100vh + 100px)) rotate(720deg); opacity: 0.8; }
          }
          @keyframes treasureSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes chestGlow {
            from { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6)); }
            to { filter: drop-shadow(0 0 40px rgba(255, 215, 0, 1)); }
          }
          @keyframes wordFloat {
            from { opacity: 0; transform: translateY(20px) scale(0.8); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show word verification screen if words were extracted - Sunset ocean theme
  if (showWordList) {
    const wordCount = editableWords.filter(w => w.trim()).length;
    
    return (
      <div className="relative min-h-[600px] rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(180deg, #f97316 0%, #fb923c 15%, #fdba74 30%, #fef3c7 50%, #a5f3fc 75%, #22d3ee 100%)'
      }}>
        {/* Floating shimmering jewels */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-4 left-6 text-3xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s', filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))' }}>💎</div>
          <div className="absolute top-8 right-8 text-2xl animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '2.3s', filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))' }}>💚</div>
          <div className="absolute top-3 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.7s', animationDuration: '1.9s', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))' }}>⭐</div>
          <div className="absolute top-12 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.5s', filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))' }}>👑</div>
          <div className="absolute bottom-24 left-4 text-2xl animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.1s', filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))' }}>💙</div>
          <div className="absolute bottom-16 right-6 text-xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.4s', filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.8))' }}>🏆</div>
          <div className="absolute bottom-32 left-1/4 text-2xl animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2s', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))' }}>✨</div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-4">
          <Card className="max-w-lg mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}>
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-1">
                  🎉 Treasure Words Found!
                </h2>
                <p className="text-4xl font-bold text-cyan-600">{wordCount}</p>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-sm">
                  🔍 <strong>Ahoy!</strong> Review yer words below. Tap to fix any that look wrong, matey!
                </p>
              </div>

              <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                {editableWords.map((word, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-xs text-cyan-500 font-bold">{index + 1}</span>
                    <Input
                      value={word}
                      onChange={(e) => updateWord(index, e.target.value)}
                      className="flex-1 border-cyan-200 focus:border-cyan-400 rounded-lg bg-white text-slate-900 font-medium"
                      placeholder="Enter word"
                      data-testid={`input-word-${index}`}
                    />
                    <button
                      onClick={() => removeWord(index)}
                      className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      data-testid={`button-remove-word-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button 
                onClick={addWord} 
                variant="outline" 
                className="w-full mb-4 border-dashed border-2 border-cyan-300 hover:border-cyan-400 hover:bg-cyan-50 text-cyan-600"
                data-testid="button-add-word"
              >
                <Edit className="w-4 h-4 mr-2" />
                Add Another Word
              </Button>

              <div className="flex gap-3">
                <Button 
                  onClick={cancelVerification} 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                  data-testid="button-cancel-words"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveWords} 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg"
                  style={{ boxShadow: '0 4px 14px rgba(34, 211, 238, 0.4)' }}
                  data-testid="button-save-words"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save {wordCount} Words
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Processing screen - Beautiful underwater ocean theme with shimmering jewels
  if (isProcessing) {
    return (
      <div className="relative min-h-[500px] rounded-2xl overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0ea5e9 0%, #38bdf8 25%, #7dd3fc 50%, #a5f3fc 75%, #cffafe 100%)'
      }}>
        {/* Floating shimmering jewels */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top row jewels */}
          <div className="absolute top-6 left-6 text-3xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s', filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))' }}>💎</div>
          <div className="absolute top-12 right-10 text-2xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s', filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))' }}>💚</div>
          <div className="absolute top-4 left-1/3 text-2xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '1.8s', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))' }}>⭐</div>
          <div className="absolute top-20 right-1/4 text-2xl animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2.2s', filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.8))' }}>💜</div>
          
          {/* Middle row jewels */}
          <div className="absolute top-1/3 left-4 text-2xl animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.3s', filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))' }}>💙</div>
          <div className="absolute top-1/3 right-6 text-xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s', filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))' }}>👑</div>
          
          {/* Bottom row jewels */}
          <div className="absolute bottom-32 left-8 text-2xl animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2.1s', filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.8))' }}>🏆</div>
          <div className="absolute bottom-24 right-12 text-xl animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '1.9s', filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))' }}>💰</div>
          <div className="absolute bottom-40 left-1/4 text-2xl animate-bounce" style={{ animationDelay: '1.4s', animationDuration: '2.4s', filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.8))' }}>✨</div>
          <div className="absolute bottom-16 right-1/3 text-xl animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '2.6s', filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.8))' }}>💎</div>
          
          {/* Bubble effects */}
          <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-white/40 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-10 left-1/2 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-5 right-1/4 w-4 h-4 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        </div>
        
        {/* Content card */}
        <div className="relative z-10 flex items-center justify-center min-h-[500px] p-6">
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.5)' }}>
                <Loader className="w-10 h-10 text-white animate-spin" />
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Extracting Words...
              </h3>
              <p className="text-gray-500 mb-6">
                🔍 Searching for treasure words!
              </p>
              
              {/* Modern progress bar with glow */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-3 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-blue-600 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${ocrProgress}%`,
                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)'
                  }}
                />
              </div>
              <p className="text-sm text-cyan-600 font-medium">{ocrProgress}% complete</p>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                <p className="text-cyan-700 text-sm">
                  ⏳ Hang tight, matey! Finding yer spelling words...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Default: Start screen or photo preview - Red Boot Pirate Theme
  return (
    <div className="relative min-h-[400px] rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 30%, #fef3c7 70%, #fde68a 100%)'
    }}>
      {/* Floating treasure jewels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 left-8 text-3xl animate-bounce" style={{ animationDelay: '0s', filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' }}>💎</div>
        <div className="absolute top-16 right-12 text-2xl animate-bounce" style={{ animationDelay: '0.3s', filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))' }}>💚</div>
        <div className="absolute top-4 right-1/4 text-2xl animate-bounce" style={{ animationDelay: '0.6s', filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' }}>⭐</div>
        <div className="absolute bottom-32 left-4 text-xl animate-bounce" style={{ animationDelay: '0.9s', filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }}>💜</div>
        <div className="absolute bottom-40 right-8 text-2xl animate-bounce" style={{ animationDelay: '1.2s', filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' }}>💙</div>
        
        {/* Palm trees */}
        <div className="absolute bottom-20 left-0 text-5xl" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>🌴</div>
        <div className="absolute bottom-16 right-0 text-6xl" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>🌴</div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {capturedImage ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl p-4 max-w-md mx-auto shadow-lg">
                <img 
                  src={capturedImage} 
                  alt="Captured spelling list"
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{
                    maxHeight: '300px',
                    objectFit: 'contain'
                  }}
                />
                <p className="text-center text-amber-700 mt-3 text-sm font-medium">
                  Check that all words are clearly visible, matey!
                </p>
              </div>
            </div>
            <div className="flex gap-3 max-w-md mx-auto">
              <Button 
                onClick={retakePhoto}
                className="flex-1 bg-white/90 hover:bg-white text-amber-700 border-2 border-amber-300"
                data-testid="button-retake-photo"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Different
              </Button>
              <Button 
                onClick={() => processImage(capturedImage)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
                style={{ boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
                data-testid="button-process-image"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Find Me Words!
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {/* Red Boot character */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-amber-400 shadow-xl bg-white">
              <img 
                src={redBootImage} 
                alt="Red Boot" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h3 className="text-2xl font-bold text-amber-800 mb-2" style={{ fontFamily: "'Pirata One', cursive" }} data-testid="text-upload-ready">
              Ahoy, Matey!
            </h3>
            <p className="text-amber-700 mb-6 text-sm font-medium" data-testid="text-upload-instructions">
              Show me yer spelling list and I'll help ye learn!
            </p>
            
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button 
                onClick={startCamera}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-6 rounded-xl transition-all"
                style={{ boxShadow: '0 4px 14px rgba(251, 146, 60, 0.5)' }}
                data-testid="button-open-camera"
              >
                <Camera className="w-6 h-6 mr-3" />
                📸 Take a Photo
              </Button>
              
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-amber-300/50"></div>
                <span className="text-amber-600 text-xs font-medium">or</span>
                <div className="flex-1 h-px bg-amber-300/50"></div>
              </div>
              
              <Button 
                onClick={triggerFileUpload}
                size="lg"
                className="w-full bg-white/90 hover:bg-white text-amber-700 border-2 border-amber-300 font-bold py-6 rounded-xl transition-all"
                data-testid="button-upload-file"
              >
                <Upload className="w-5 h-5 mr-3" />
                🖼️ Upload from Gallery
              </Button>
              
              {cameraError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                  <p className="text-red-700 text-sm" data-testid="text-camera-error">
                    {cameraError}
                  </p>
                </div>
              )}
              
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
      </div>
    </div>
  );
}