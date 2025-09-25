import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { GlassCard } from './GlassCard';
import { toast } from 'sonner@2.0.3';

interface CustomBackgroundUploaderProps {
  onBackgroundChange: (imageUrl: string | null) => void;
  currentBackground?: string;
  className?: string;
}

export function CustomBackgroundUploader({ 
  onBackgroundChange, 
  currentBackground,
  className = '' 
}: CustomBackgroundUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentBackground || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setPreviewUrl(imageUrl);
      onBackgroundChange(imageUrl);
      setUploading(false);
      toast.success('Custom background uploaded successfully!');
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveBackground = () => {
    setPreviewUrl(null);
    onBackgroundChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Custom background removed');
  };

  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary-solid" />
          <h3 className="font-semibold text-gradient-primary">Custom Background</h3>
        </div>

        {/* Preview */}
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-full h-32 rounded-lg overflow-hidden bg-muted relative">
              <img
                src={previewUrl}
                alt="Custom background preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <motion.button
                onClick={handleRemoveBackground}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3 h-3" />
              </motion.button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Custom background active</span>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        <motion.div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer
            ${dragActive 
              ? 'border-primary-solid bg-primary-solid/10 glow-primary' 
              : 'border-muted-foreground/30 hover:border-primary-solid/50 hover:bg-primary-solid/5'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary-solid border-t-transparent rounded-full mx-auto mb-2"
            />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Upload Custom Background'}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag & drop or click to select • PNG, JPG up to 5MB
            </p>
          </div>
        </motion.div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>Your custom background will be used in fullscreen focus sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>Choose calming, low-contrast images for better focus</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>Background preference is automatically saved</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}