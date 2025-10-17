import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

/**
 * EmptyState component for displaying empty lists and "no data" states
 *
 * @example
 * <EmptyState
 *   icon={Building2}
 *   title="No properties yet"
 *   description="Get started by adding your first property"
 *   action={{
 *     label: "Add Property",
 *     href: "/admin/properties/new"
 *   }}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}) => {
  const renderButton = (
    config: { label: string; onClick?: () => void; href?: string },
    variant: 'default' | 'outline' = 'default'
  ) => {
    if (config.href) {
      return (
        <Button asChild variant={variant}>
          <a href={config.href}>{config.label}</a>
        </Button>
      );
    }

    return (
      <Button onClick={config.onClick} variant={variant}>
        {config.label}
      </Button>
    );
  };

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-muted p-4">
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {action && renderButton(action, 'default')}
          {secondaryAction && renderButton(secondaryAction, 'outline')}
        </div>
      )}
    </div>
  );
};

/**
 * EmptyStateCard - EmptyState wrapped in a Card for consistent styling
 */
export const EmptyStateCard: React.FC<EmptyStateProps> = (props) => {
  return (
    <Card>
      <EmptyState {...props} />
    </Card>
  );
};

export default EmptyState;
