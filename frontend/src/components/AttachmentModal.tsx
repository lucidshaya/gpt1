import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  Image,
  FileText,
  Music,
  Video,
  X,
  Download,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
}

interface AttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilesSelected: (files: AttachmentFile[]) => void;
}

const AttachmentModal = ({ open, onOpenChange, onFilesSelected }: AttachmentModalProps) => {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('audio/')) return Music;
    if (type.startsWith('video/')) return Video;
    if (type.includes('text') || type.includes('document')) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: AttachmentFile[] = Array.from(selectedFiles).map(file => ({
      id: Date.now().toString() + Math.random().toString(36),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadProgress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(file => {
      const interval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === file.id && f.uploadProgress !== undefined && f.uploadProgress < 100) {
            return { ...f, uploadProgress: f.uploadProgress + 10 };
          }
          return f;
        }));
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === file.id ? { ...f, uploadProgress: 100 } : f));
      }, 1000);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAttach = () => {
    const completedFiles = files.filter(f => f.uploadProgress === 100);
    onFilesSelected(completedFiles);
    onOpenChange(false);
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass-strong glow">
        <DialogHeader>
          <DialogTitle className="text-xl text-gradient">Attach Files</DialogTitle>
        </DialogHeader>

        {/* Upload Area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
            dragActive ? "border-primary bg-primary/10" : "border-border",
            "hover:border-primary/50 hover:bg-primary/5"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports images, documents, audio, and more (Max 20MB per file)
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="gradient-primary glow transition-spring hover:glow-strong"
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.json,.csv"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Attached Files ({files.length})</h4>
            <ScrollArea className="max-h-60">
              <div className="space-y-2">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  const isUploading = file.uploadProgress !== undefined && file.uploadProgress < 100;
                  
                  return (
                    <div key={file.id} className="flex items-center gap-3 p-3 glass rounded-lg">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileIcon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                        
                        {isUploading && file.uploadProgress !== undefined && (
                          <div className="mt-1">
                            <Progress value={file.uploadProgress} className="h-1" />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        {file.type.startsWith('image/') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = file.url;
                            link.download = file.name;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAttach}
            disabled={files.length === 0 || files.some(f => (f.uploadProgress ?? 0) < 100)}
            className="gradient-primary glow transition-spring hover:glow-strong"
          >
            Attach {files.length > 0 && `(${files.filter(f => f.uploadProgress === 100).length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentModal;