'use client';

import React from 'react';
import DoorScanner from '../DoorScanner';

interface DoorScannerViewProps {
  onNavigate?: (view: string) => void;
}

export default function DoorScannerView({ onNavigate }: DoorScannerViewProps) {
  return <DoorScanner onNavigate={onNavigate} />;
}
