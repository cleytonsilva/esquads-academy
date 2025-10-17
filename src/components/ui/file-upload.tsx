import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // em bytes
  multiple?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB por padrão
  multiple = false,
  children,
  className,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    setError('');

    // Verificar tamanho do arquivo
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return false;
    }

    // Verificar tipo de arquivo se accept foi especificado
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType.toLowerCase() === fileExtension;
        }
        if (acceptedType.includes('*')) {
          const baseType = acceptedType.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return acceptedType === fileType;
      });

      if (!isAccepted) {
        setError(`Tipo de arquivo não aceito. Tipos aceitos: ${accept}`);
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // Pegar apenas o primeiro arquivo se não for múltiplo
    
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!disabled) {
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "cursor-pointer transition-all duration-200",
          isDragOver && "scale-105 opacity-80",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};
