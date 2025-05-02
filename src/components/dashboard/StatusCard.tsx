
import React from 'react';
import { Card } from '@/components/ui/card';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badge?: {
    text: string;
    className?: string;
  };
  icon?: React.ReactNode;
}

const StatusCard = ({ title, value, subtitle, badge, icon }: StatusCardProps) => {
  return (
    <Card className="p-6 dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">{title}</h3>
        {badge && (
          <span className={`text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ${badge.className || ''}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>
      {icon && <div className="mt-4">{icon}</div>}
    </Card>
  );
};

export default StatusCard;
