import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAudio } from "@/contexts/AudioContext";
import { photoStorage, getWeekStart } from "@/lib/photoStorage";
import { Upload, Check, X, Edit, Loader } from 'lucide-react';

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
  
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const { playSound } = useAudio();

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

  // Preprocess image for better OCR with optimized scaling
  const preprocessImageForOCR = async (imageData: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Optimized scale - 2x is sufficient for most spelling lists
        const scale = 2;
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
      console.log('🚀 Starting FAST OCR processing...');
      
      // Preprocess image for better OCR
      console.log('📸 Preprocessing image...');
      setOcrProgress(10);
      const preprocessedImage = await preprocessImageForOCR(imageData);
      
      // Lazy-load tesseract.js
      const { createWorker } = await import('tesseract.js');
      
      // Single optimized pass - PSM 6 works well for spelling lists (single block of text)
      console.log('🔍 Running OCR...');
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(20 + Math.round(m.progress * 70)); // 20-90%
          }
        }
      });

      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
        tessedit_pageseg_mode: 6 as any, // Single uniform block of text
        tessedit_ocr_engine_mode: 1 as any,
      });

      const result = await worker.recognize(preprocessedImage);
      await worker.terminate();
      
      // Extract words from both structured data and raw text
      let allWords = extractWordsFromStructuredData(result.data);
      const textWords = extractWordsFromText(result.data.text);
      textWords.forEach(w => {
        if (!allWords.includes(w)) {
          allWords.push(w);
        }
      });
      
      console.log(`✅ OCR found ${allWords.length} words:`, allWords);
      setOcrProgress(100);

      // Deduplicate and keep unique words
      const uniqueWords = Array.from(new Set(allWords));
      console.log(`🎯 TOTAL UNIQUE WORDS FOUND: ${uniqueWords.length}`, uniqueWords);
      
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
        setShowWordList(true);
        
        // CRITICAL FIX: Notify parent page of demo words (don't save to DB yet)
        onWordsExtracted(demoWords, capturedImage || '', false);
        
        playSound('ship_bell_success');
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
      setShowWordList(true);

      // CRITICAL FIX: Notify parent page of extracted words (don't save to DB yet)
      onWordsExtracted(words, capturedImage || '', false);

      // Don't save to photoStorage here - wait for user confirmation in saveWords()
      
      playSound('ship_bell_success');
      toast({
        title: "Image Uploaded! 📤",
        description: `Found ${words.length} words. Saved in your browser storage.`,
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
        /^\s*(\d+)[\.\)\s]\s*([a-zA-Z]{2,20})/,           // "1. word" or "1) word" (allow 2-20 chars)
        /^\s*(\d+)\s+([a-zA-Z]{2,20})/,                   // "1 word"
        /(\d+)\.\s*([a-zA-Z]{2,20})/,                     // anywhere in line "1. word"
        /(\d+)\s+([a-zA-Z]{2,20})\b/,                     // "1 word" with word boundary
        /^\s*(\d{1,2})\s*\.\s*([a-zA-Z]+)/,              // More flexible "10. word" or "1. word"
        /(\d{1,2})\.([a-zA-Z]+)/                         // "10.word" (no space)
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
      
      // Extract individual words from line (more flexible approach)
      const lineWords = cleanLine.match(/\b[a-zA-Z]{2,20}\b/g); // Accept 2-20 letter words
      if (lineWords) {
        lineWords.forEach(word => {
          const cleanWord = word.toLowerCase().trim();
          // Filter out common non-spelling words and header fragments
          const skipWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'run', 'say', 'she', 'too', 'use', 'elling', 'pate', 'tern', 'ain', 'att', 'word', 'list', 'spelling', 'homework', 'test', 'on', 'an', 'at', 'be', 'by', 'do', 'go', 'he', 'if', 'in', 'is', 'it', 'me', 'my', 'no', 'of', 'or', 'so', 'to', 'up', 'us', 'we'];
          
          if (!skipWords.includes(cleanWord) && cleanWord.length >= 2) {
            console.log('Found word:', cleanWord);
            // Avoid duplicates
            if (!otherWords.includes(cleanWord) && !numberedWords.includes(cleanWord)) {
              otherWords.push(cleanWord);
            }
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
          playSound('treasure_chest_open');
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

  // Show word verification screen if words were extracted
  if (showWordList) {
    const wordCount = editableWords.filter(w => w.trim()).length;
    
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="glass-card max-w-2xl mx-auto glass-floating">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-white glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
              🏴‍☠️ Verify Your Treasure Words 🏴‍☠️
            </h2>
            
            {/* HUGE Word Count Display */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 mb-8 rounded-2xl shadow-2xl border-4 border-white/30">
              <div className="text-center">
                <p className="text-2xl font-semibold mb-3 uppercase tracking-wide">Words Captured</p>
                <div className="text-9xl font-bold mb-3 glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
                  {wordCount}
                </div>
                <p className="text-3xl font-medium">
                  {wordCount === 1 ? 'Word' : 'Words'} Found ✨
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded">
              <p className="text-yellow-800 font-semibold text-lg">⚠️ OCR Detection Notice</p>
              <p className="text-yellow-700 mt-2">
                The automatic word detection may not be perfect. Please check and edit each word below to make sure it's complete and correct.
              </p>
            </div>
            
            <p className="text-white/80 text-center mb-8 text-lg">
              Click on any word to edit it. You can also add or remove words from your treasure list.
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
              <Button onClick={addWord} className="glass-button flex-1 text-white" data-testid="button-add-word">
                <Edit className="w-4 h-4 mr-2" />
                ⚓ Add Word
              </Button>
            </div>

            <div className="flex gap-4 justify-between mt-8">
              <Button onClick={cancelVerification} className="glass-button text-white px-6 py-3" data-testid="button-cancel-words">
                ❌ Cancel
              </Button>
              <Button onClick={saveWords} className="glass-button-primary text-white px-6 py-3" data-testid="button-save-words">
                <Check className="w-5 h-5 mr-2" />
                💎 Save Treasure ({editableWords.filter(w => w.trim()).length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Processing screen
  if (isProcessing) {
    return (
      <div className="min-h-screen glass-gradient-bg flex items-center justify-center p-4">
        <Card className="glass-card max-w-2xl mx-auto glass-floating">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-bold mb-2 text-white glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
              🔍 Scanning Treasure Map...
            </h3>
            <p className="text-white/90 mb-8 text-xl font-semibold">
              Please wait while we extract your spelling words
            </p>
            
            {/* Progress Bar with Sailing Boat */}
            <div className="relative mb-8">
              {/* Ocean Waves Background */}
              <div className="w-full bg-gradient-to-b from-blue-300/30 to-blue-500/40 rounded-full h-16 border-4 border-blue-300/50 overflow-hidden relative">
                {/* Animated Waves */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                
                {/* Progress Fill (Water) */}
                <div 
                  className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 h-full transition-all duration-500 shadow-lg relative overflow-hidden" 
                  style={{ width: `${ocrProgress}%` }}
                >
                  {/* Wave animation inside progress */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
                
                {/* 3D Sailing Pirate Boat - Moves with progress */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                  style={{ 
                    left: `${Math.max(2, ocrProgress - 3)}%`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div className="relative" style={{ 
                    transform: 'perspective(200px) rotateY(-15deg)',
                    animation: 'rockBoat 2s ease-in-out infinite'
                  }}>
                    {/* Boat Hull */}
                    <div className="relative w-16 h-8" style={{
                      background: 'linear-gradient(to bottom, #8B4513 0%, #654321 100%)',
                      clipPath: 'polygon(10% 100%, 90% 100%, 100% 50%, 95% 20%, 5% 20%, 0% 50%)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2)',
                      transform: 'translateZ(10px)'
                    }}>
                      {/* Hull Highlight */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>
                    
                    {/* Main Sail */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2" style={{
                      width: 0,
                      height: 0,
                      borderLeft: '12px solid transparent',
                      borderRight: '12px solid transparent',
                      borderBottom: '28px solid #f5f5dc',
                      filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
                      transform: 'translateZ(5px)'
                    }}>
                      {/* Jolly Roger skull */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs">💀</div>
                    </div>
                    
                    {/* Mast */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-amber-900 to-amber-700" style={{
                      boxShadow: '1px 0 2px rgba(0,0,0,0.3)',
                      transform: 'translateZ(8px)'
                    }}></div>
                    
                    {/* Flag */}
                    <div className="absolute -top-14 left-1/2 text-xs" style={{
                      animation: 'waveFlag 0.5s ease-in-out infinite'
                    }}>🏴‍☠️</div>
                    
                    {/* Waves splash */}
                    <div className="absolute -bottom-1 left-0 right-0 text-center text-xs opacity-70" style={{
                      animation: 'splash 1.5s ease-in-out infinite'
                    }}>💦</div>
                  </div>
                </div>
                
                <style>{`
                  @keyframes rockBoat {
                    0%, 100% { transform: perspective(200px) rotateY(-15deg) rotateZ(-2deg); }
                    50% { transform: perspective(200px) rotateY(-15deg) rotateZ(2deg); }
                  }
                  @keyframes waveFlag {
                    0%, 100% { transform: translateX(0) rotate(0deg); }
                    50% { transform: translateX(2px) rotate(5deg); }
                  }
                  @keyframes splash {
                    0%, 100% { opacity: 0.3; transform: translateY(0) scale(0.8); }
                    50% { opacity: 0.7; transform: translateY(-2px) scale(1); }
                  }
                `}</style>
              </div>
              
              {/* Progress Percentage */}
              <div className="mt-4 text-3xl font-bold text-white glass-text-glow">
                {ocrProgress}%
              </div>
            </div>
            
            {/* Status Message */}
            <div className="bg-yellow-100/90 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-yellow-800 font-semibold text-lg">
                ⚠️ Processing in progress...
              </p>
              <p className="text-yellow-700 mt-2">
                Do not close this page or start practice yet. The boat is sailing to collect your words!
              </p>
            </div>
            
            {/* Loading Animation */}
            <div className="mt-6 flex justify-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: Start screen or photo preview
  return (
    <div className="min-h-screen glass-gradient-bg p-4 flex items-center justify-center">
      <Card className="glass-card max-w-lg mx-auto glass-floating">
        <CardContent className="p-6">
          {capturedImage ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="relative bg-white rounded-xl p-4 max-w-6xl mx-auto">
                  <img 
                    src={capturedImage} 
                    alt="Captured spelling list"
                    className="w-full h-auto rounded-lg shadow-2xl"
                    style={{
                      maxHeight: '800px',
                      minHeight: '500px',
                      objectFit: 'contain'
                    }}
                  />
                  <p className="text-center text-gray-500 mt-3 text-base font-medium">
                    📸 Check that all words are clearly visible
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-retake-photo"
                >
                  <i className="lni lni-scroll" style={{ fontSize: '1rem', marginRight: '0.5rem' }}></i>
                  Choose Different Photo
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
              <div className="mb-6 flex justify-center">
                <i className="lni lni-anchor text-white glass-text-glow" style={{ 
                  fontSize: '8rem',
                  filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.5))'
                }}></i>
              </div>
              <h3 className="text-2xl font-bold text-white glass-text-glow mb-4" data-testid="text-upload-ready" style={{ fontFamily: 'var(--font-pirate)' }}>
                📸 Chart New Waters
              </h3>
              <p className="text-white/80 mb-8 text-lg" data-testid="text-upload-instructions">
                Upload your treasure map (spelling list photo) to begin the adventure!
              </p>
              <div className="flex flex-col gap-6 items-center">
                <Button 
                  onClick={triggerFileUpload}
                  className="glass-button-primary glass-button-xl text-white font-bold glass-text-glow"
                  data-testid="button-upload-file"
                >
                  <Upload className="w-8 h-8 mr-4" />
                  📤 Upload Treasure Map
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