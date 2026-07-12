import { useCallback, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

type ConfirmDialogOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmDialogDefaults = {
  title: string;
  confirmLabel: string;
  cancelLabel: string;
};

const fallbackDefaults: ConfirmDialogDefaults = {
  title: 'Confirm action',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
};

export function useConfirmDialog(defaults: Partial<ConfirmDialogDefaults> = {}) {
  const mergedDefaults = { ...fallbackDefaults, ...defaults };
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((nextOptions: ConfirmDialogOptions) => {
    setOptions(nextOptions);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const ConfirmDialog = useCallback(() => {
    if (!options) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <Card className="w-full max-w-md border shadow-2xl">
          <CardContent className="space-y-5 pt-6">
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">{options.title || mergedDefaults.title}</h2>
                <p className="leading-7 text-muted-foreground">{options.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => close(false)}>
                {options.cancelLabel || mergedDefaults.cancelLabel}
              </Button>
              <Button
                type="button"
                variant={options.destructive ? 'destructive' : 'default'}
                onClick={() => close(true)}
              >
                {options.confirmLabel || mergedDefaults.confirmLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }, [close, mergedDefaults.cancelLabel, mergedDefaults.confirmLabel, mergedDefaults.title, options]);

  return { confirm, ConfirmDialog };
}
