'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Select icon based on variant
        let Icon = Info;
        if (variant === 'success') Icon = CheckCircle;
        else if (variant === 'destructive') Icon = AlertCircle;
        else if (variant === 'warning') Icon = AlertTriangle;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <div className={`shrink-0 ${
                variant === 'success' ? 'text-green-400' :
                variant === 'destructive' ? 'text-red-400' :
                variant === 'warning' ? 'text-yellow-400' :
                variant === 'info' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
