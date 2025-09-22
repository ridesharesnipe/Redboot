import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
}

export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      // Fallback to file input if camera access fails
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = handleFileUpload;
      input.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
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
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    stopCamera();
    onCapture(imageData);
  };

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onCapture(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleFileUpload;
    input.click();
  };

  return (
    <Card className="border-2 border-dashed border-border">
      <CardContent className="p-8">
        {!isCameraActive ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-camera text-accent-foreground text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2" data-testid="text-camera-ready">
              Ready to Capture
            </h3>
            <p className="text-muted-foreground mb-6" data-testid="text-camera-instructions">
              Position your spelling list in good lighting
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={startCamera}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-open-camera"
              >
                <i className="fas fa-camera mr-2"></i>
                Open Camera
              </Button>
              <Button 
                variant="outline"
                onClick={triggerFileUpload}
                data-testid="button-upload-file"
              >
                <i className="fas fa-upload mr-2"></i>
                Upload Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-auto max-h-96 object-cover"
                autoPlay
                playsInline
                muted
                data-testid="camera-video"
              />
              <div className="absolute inset-0 border-2 border-accent/50 rounded-lg pointer-events-none">
                <div className="absolute top-4 left-4 right-4 text-center">
                  <div className="bg-black/50 text-white px-3 py-1 rounded text-sm inline-block">
                    Position spelling list in frame
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={capturePhoto}
                className="bg-accent text-accent-foreground hover:bg-accent/90 px-8"
                data-testid="button-capture-photo"
              >
                <i className="fas fa-camera mr-2"></i>
                Capture Photo
              </Button>
              <Button 
                variant="outline"
                onClick={stopCamera}
                data-testid="button-cancel-camera"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
