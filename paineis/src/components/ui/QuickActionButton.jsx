import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionButton = ({ 
  actions = [], 
  context = 'default',
  position = 'bottom-right',
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6';
      case 'bottom-left':
        return 'fixed bottom-6 left-6';
      case 'top-right':
        return 'fixed top-20 right-6';
      case 'top-left':
        return 'fixed top-20 left-6';
      default:
        return 'fixed bottom-6 right-6';
    }
  };

  const getContextColor = () => {
    switch (context) {
      case 'mission':
        return 'primary';
      case 'exam':
        return 'secondary';
      case 'results':
        return 'success';
      case 'error':
        return 'destructive';
      default:
        return 'accent';
    }
  };

  const getContextIcon = () => {
    switch (context) {
      case 'mission':
        return 'Target';
      case 'exam':
        return 'FileText';
      case 'results':
        return 'BarChart3';
      case 'retry':
        return 'RotateCcw';
      case 'continue':
        return 'ArrowRight';
      default:
        return 'Plus';
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action) => {
    if (action?.onClick) {
      action?.onClick();
    }
    setIsExpanded(false);
  };

  if (actions?.length === 0) {
    return null;
  }

  // Single action - show as simple button
  if (actions?.length === 1) {
    const action = actions?.[0];
    return (
      <div className={`${getPositionClasses()} z-90 ${className}`}>
        <Button
          variant={getContextColor()}
          size="lg"
          onClick={() => handleActionClick(action)}
          iconName={action?.icon || getContextIcon()}
          className="shadow-lg hover:shadow-xl transition-all duration-200 animate-scale-in"
          disabled={action?.disabled}
        >
          {action?.label}
        </Button>
      </div>
    );
  }

  // Multiple actions - show as expandable FAB
  return (
    <div className={`${getPositionClasses()} z-90 ${className}`}>
      <div className="relative">
        {/* Action Items */}
        {isExpanded && (
          <div className="absolute bottom-16 right-0 space-y-3 animate-slide-up">
            {actions?.map((action, index) => (
              <div
                key={index}
                className="flex items-center space-x-3"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideUp 200ms ease-out forwards'
                }}
              >
                {/* Action Label */}
                <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-md">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {action?.label}
                  </span>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={() => handleActionClick(action)}
                  disabled={action?.disabled}
                  className={`
                    w-12 h-12 rounded-full shadow-lg transition-all duration-200 
                    flex items-center justify-center
                    ${action?.disabled 
                      ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                      : `bg-${getContextColor()} text-${getContextColor()}-foreground hover:scale-110 hover:shadow-xl`
                    }
                  `}
                  style={{
                    backgroundColor: action?.disabled ? undefined : `var(--color-${getContextColor()})`,
                    color: action?.disabled ? undefined : `var(--color-${getContextColor()}-foreground)`
                  }}
                >
                  <Icon 
                    name={action?.icon || 'ArrowRight'} 
                    size={20} 
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={toggleExpanded}
          className={`
            w-14 h-14 rounded-full shadow-lg transition-all duration-300 
            flex items-center justify-center
            bg-${getContextColor()} text-${getContextColor()}-foreground
            hover:scale-110 hover:shadow-xl
            ${isExpanded ? 'rotate-45' : 'rotate-0'}
          `}
          style={{
            backgroundColor: `var(--color-${getContextColor()})`,
            color: `var(--color-${getContextColor()}-foreground)`
          }}
        >
          <Icon 
            name={isExpanded ? 'X' : getContextIcon()} 
            size={24} 
          />
        </button>
      </div>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-80"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default QuickActionButton;