'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Video, Image } from 'lucide-react';

interface LinkInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertLink: (url: string, text?: string) => void;
  onInsertVideo: (url: string) => void;
  onInsertImage: (url: string, alt?: string) => void;
  defaultTab?: string;
}

const LinkInsertModal: React.FC<LinkInsertModalProps> = ({
  isOpen,
  onClose,
  onInsertLink,
  onInsertVideo,
  onInsertImage,
  defaultTab = 'link',
}) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [activeTab, setActiveTab] = useState(defaultTab);

  const resetForm = () => {
    setLinkUrl('');
    setLinkText('');
    setVideoUrl('');
    setImageUrl('');
    setImageAlt('');
    setActiveTab(defaultTab);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateVideoUrl = (url: string): boolean => {
    if (!validateUrl(url)) return false;
    
    // Verificar se é URL do YouTube ou Vimeo
    const youtubeRegex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/;
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url);
  };

  const validateImageUrl = (url: string): boolean => {
    if (!validateUrl(url)) return false;
    
    // Verificar se a URL termina com extensão de imagem
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    return imageExtensions.test(url);
  };

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return;
    
    if (!validateUrl(linkUrl)) {
      alert('Por favor, insira uma URL válida.');
      return;
    }
    
    onInsertLink(linkUrl, linkText || undefined);
    handleClose();
  };

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return;
    
    if (!validateVideoUrl(videoUrl)) {
      alert('Por favor, insira uma URL válida do YouTube ou Vimeo.');
      return;
    }
    
    onInsertVideo(videoUrl);
    handleClose();
  };

  const handleInsertImage = () => {
    if (!imageUrl.trim()) return;
    
    if (!validateImageUrl(imageUrl)) {
      alert('Por favor, insira uma URL válida de imagem (jpg, png, gif, webp, svg).');
      return;
    }
    
    onInsertImage(imageUrl, imageAlt || undefined);
    handleClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inserir Mídia</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vídeo
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Imagem
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL do Link *</Label>
              <Input
                id="link-url"
                placeholder="https://exemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleInsertLink)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Texto do Link (opcional)</Label>
              <Input
                id="link-text"
                placeholder="Texto que será exibido"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleInsertLink)}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">URL do Vídeo *</Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleInsertVideo)}
              />
              <p className="text-sm text-gray-500">
                Suportamos URLs do YouTube e Vimeo
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL da Imagem *</Label>
              <Input
                id="image-url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleInsertImage)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Texto Alternativo (opcional)</Label>
              <Input
                id="image-alt"
                placeholder="Descrição da imagem para acessibilidade"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleInsertImage)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {activeTab === 'link' && (
            <Button onClick={handleInsertLink} disabled={!linkUrl.trim()}>
              Inserir Link
            </Button>
          )}
          {activeTab === 'video' && (
            <Button onClick={handleInsertVideo} disabled={!videoUrl.trim()}>
              Inserir Vídeo
            </Button>
          )}
          {activeTab === 'image' && (
            <Button onClick={handleInsertImage} disabled={!imageUrl.trim()}>
              Inserir Imagem
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkInsertModal;
