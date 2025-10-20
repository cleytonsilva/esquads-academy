import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialSharingProps {
  missionTitle: string;
  score: number;
  xpEarned: number;
  badgesEarned: number;
  onShare?: (platform: string) => void;
}

const SocialSharing: React.FC<SocialSharingProps> = ({ 
  missionTitle, 
  score, 
  xpEarned, 
  badgesEarned,
  onShare 
}) => {
  const [copied, setCopied] = useState(false);

  const shareText = `🎯 Acabei de completar a missão "${missionTitle}" no Esquads Academy! 

📊 Pontuação: ${score}%
⚡ XP Ganho: ${xpEarned}
🏆 Badges: ${badgesEarned}

#EsquadsAcademy #Cybersecurity #Gamification`;

  const shareUrl = `${window.location.origin}/student/missions`;

  const handleShare = async (platform: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      onShare?.(platform);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareButtons = [
    {
      platform: 'twitter',
      icon: Twitter,
      label: 'Twitter',
      color: 'hover:bg-blue-500 hover:text-white'
    },
    {
      platform: 'facebook',
      icon: Facebook,
      label: 'Facebook',
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      platform: 'linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'hover:bg-blue-700 hover:text-white'
    },
    {
      platform: 'whatsapp',
      icon: MessageCircle,
      label: 'WhatsApp',
      color: 'hover:bg-green-500 hover:text-white'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Share2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Compartilhar Conquista</h3>
      </div>

      {/* Share Preview */}
      <div className="bg-muted border border-border rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">E</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-foreground">Esquads Academy</span>
              <span className="text-muted-foreground text-sm">@esquadsacademy</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-line">{shareText}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR')} • {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {shareButtons.map((button) => {
            const IconComponent = button.icon;
            return (
              <Button
                key={button.platform}
                variant="outline"
                className={`w-full ${button.color} transition-colors`}
                onClick={() => handleShare(button.platform)}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {button.label}
              </Button>
            );
          })}
        </div>

        {/* Copy Link */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Share Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Compartilhamentos desta missão:</span>
          <span className="font-medium text-foreground">1,247</span>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
          <span>Seus compartilhamentos totais:</span>
          <span className="font-medium text-foreground">23</span>
        </div>
      </div>

      {/* Social Benefits */}
      <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
        <h4 className="text-sm font-semibold text-accent mb-2">💡 Dica</h4>
        <p className="text-sm text-muted-foreground">
          Compartilhar suas conquistas pode inspirar outros estudantes e te ajudar a construir uma rede profissional na área de cibersegurança!
        </p>
      </div>
    </div>
  );
};

export default SocialSharing;
