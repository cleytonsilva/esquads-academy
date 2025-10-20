import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SocialSharing = ({ 
  missionTitle = "Firewall Configuration Challenge",
  xpEarned = 250,
  accuracy = 92,
  masteryLevel = "Expert",
  badges = [],
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareText = `🎯 Acabei de completar "${missionTitle}" no Esquads!\n\n✨ ${xpEarned} XP ganhos\n🎯 ${accuracy}% de precisão\n🏆 Nível ${masteryLevel}\n\nVenha treinar cybersegurança comigo!`;

  const shareUrl = window.location?.origin;

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: 'MessageCircle',
      color: '#25D366',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: 'Twitter',
      color: '#1DA1F2',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: '#0077B5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Facebook',
      icon: 'Facebook',
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Esquads - Missão Concluída!',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleSocialShare = (platform) => {
    window.open(platform?.url, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`bg-card border border-border rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name="Share2" size={24} color="var(--color-accent)" />
          <h2 className="text-xl font-heading font-bold text-foreground">
            Compartilhar Conquista
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
        >
          {isExpanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-6">
          {/* Achievement Preview */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="Trophy" size={32} color="white" />
              </div>
              <h3 className="font-bold text-foreground mb-1">Missão Concluída!</h3>
              <p className="text-sm text-muted-foreground mb-3">{missionTitle}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Icon name="Zap" size={14} color="var(--color-accent)" />
                  <span className="font-medium">{xpEarned} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Target" size={14} color="var(--color-success)" />
                  <span className="font-medium">{accuracy}%</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Award" size={14} color="var(--color-primary)" />
                  <span className="font-medium">{masteryLevel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Compartilhar em:</h4>
            
            {/* Native Share (if supported) */}
            {navigator.share && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={handleNativeShare}
                  iconName="Share"
                  iconPosition="left"
                  className="w-full justify-center"
                >
                  Compartilhar
                </Button>
              </div>
            )}

            {/* Social Platforms */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {socialPlatforms?.map((platform) => (
                <Button
                  key={platform?.name}
                  variant="outline"
                  onClick={() => handleSocialShare(platform)}
                  iconName={platform?.icon}
                  iconPosition="left"
                  className="justify-center"
                >
                  {platform?.name}
                </Button>
              ))}
            </div>

            {/* Copy Link */}
            <div className="flex space-x-2">
              <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground font-mono">
                {shareUrl}
              </div>
              <Button
                variant={copySuccess ? "success" : "outline"}
                onClick={handleCopyLink}
                iconName={copySuccess ? "Check" : "Copy"}
                size="sm"
              >
                {copySuccess ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>

          {/* Share Stats */}
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Suas Conquistas</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-foreground">24</div>
                <div className="text-xs text-muted-foreground">Missões</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">12</div>
                <div className="text-xs text-muted-foreground">Conquistas</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">89%</div>
                <div className="text-xs text-muted-foreground">Precisão</div>
              </div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Inspire outros a começar sua jornada em cybersegurança! 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialSharing;