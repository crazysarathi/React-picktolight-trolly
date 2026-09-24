import React, { useState } from 'react';
import { ScanBarcode } from 'lucide-react';
import { Button } from 'components/ui/button';
import { testScannerAdapter } from 'services/scanner/testScannerAdapter';
import { cn } from 'lib/utils';

const SIZES = {
  md: { input: 'h-10 w-40 md:w-48 rounded-lg px-3 text-sm', button: 'h-10 px-3 text-xs', icon: 'h-4 w-4' },
  lg: { input: 'h-14 w-52 md:w-64 rounded-xl px-4 text-lg', button: 'h-14 px-5 text-base', icon: 'h-5 w-5' },
};

/**
 * TEMPORARY test input: type a barcode and press Enter (or tap Scan).
 * It calls `testScannerAdapter.scan()` → ScannerService, exactly like a physical scanner.
 */
export default function TestBarcodeInput({ size = 'md', placeholder = 'Type barcode…', className, inputClassName }) {
  const [value, setValue] = useState('');
  const s = SIZES[size] || SIZES.md;

  const submit = (event) => {
    event.preventDefault();
    const code = value.trim();
    if (!code) return;
    testScannerAdapter.scan(code);
    setValue('');
  };

  return (
    <form onSubmit={submit} className={cn('flex items-center gap-2', className)}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        autoComplete="off"
        aria-label="Barcode to simulate"
        className={cn(
          'border border-ot-border/35 bg-ot-surface-bottom/70 text-white placeholder:text-ot-text-muted/60 focus:outline-none focus:ring-2 focus:ring-ring',
          s.input,
          inputClassName
        )}
      />
      <Button type="submit" size="sm" className={s.button} disabled={!value.trim()}>
        <ScanBarcode className={cn('mr-1.5', s.icon)} /> Scan
      </Button>
    </form>
  );
}
