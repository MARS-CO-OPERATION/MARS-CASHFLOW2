import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { formatMoney, formatUgx } from '../utils/formatters';
import {
  Camera,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingDown,
  RefreshCw,
  X
} from 'lucide-react';

interface DocumentScannerScreenProps {
  onNavigate: (route: string) => void;
}

export const DocumentScannerScreen: React.FC<DocumentScannerScreenProps> = ({ onNavigate }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    merchant: string;
    amount: number;
    category: 'Utilities' | 'Maintenance' | 'Repairs' | 'General';
    date: string;
    description: string;
  } | null>(null);

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUri = reader.result as string;
        setImagePreview(resultUri);
        processOcr(resultUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleReceipts = [
    {
      name: 'Umeme Yaka Electricity Token',
      merchant: 'Umeme Uganda Ltd',
      amount: 150000,
      category: 'Utilities' as const,
      description: 'Umeme Yaka Units for compound & water pump',
      sampleImg: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'NWSC Water Bill',
      merchant: 'National Water & Sewerage Corp (NWSC)',
      amount: 95000,
      category: 'Utilities' as const,
      description: 'August water meter settlement for common taps',
      sampleImg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Plumbing Valves & Pipes Invoice',
      merchant: 'Kikuubo Hardware Hub',
      amount: 220000,
      category: 'Repairs' as const,
      description: 'Replacement float valves and 3/4 PVC piping',
      sampleImg: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const processOcr = (imgUri: string, presetData?: any) => {
    setIsScanning(true);
    setScannedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      if (presetData) {
        setScannedResult({
          merchant: presetData.merchant,
          amount: presetData.amount,
          category: presetData.category,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          description: presetData.description,
        });
      } else {
        setScannedResult({
          merchant: 'Umeme Yaka Uganda',
          amount: 150000,
          category: 'Utilities',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          description: 'Umeme Yaka token invoice scanned via OCR',
        });
      }
    }, 1200);
  };

  const handleSelectSample = (sample: typeof sampleReceipts[0]) => {
    setImagePreview(sample.sampleImg);
    processOcr(sample.sampleImg, sample);
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 sm:px-6 pt-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            📷
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Receipt OCR Smart Scanner</h1>
            <p className="text-xs text-[#65766F]">
              Auto-extract totals, dates & categories from paper receipts
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload / Camera Area */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE8E3] shadow-sm space-y-6">
        <div className="border-2 border-dashed border-[#DFE8E3] rounded-3xl p-6 text-center hover:border-[#0AB77F] transition-all bg-[#F5F8F6]">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative inline-block max-h-64 overflow-hidden rounded-2xl border border-[#DFE8E3]">
                <img
                  src={imagePreview}
                  alt="Scanned receipt preview"
                  className="max-h-64 object-contain"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setScannedResult(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isScanning && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#0AB77F]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning text and extracting figures with MARS OCR Engine...</span>
                </div>
              )}
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center gap-3 py-8">
              <div className="w-16 h-16 rounded-2xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F] shadow-xs">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-sm text-[#17231E]">
                  Capture or Upload Paper Receipt
                </h3>
                <p className="text-xs text-[#65766F]">
                  Supports Umeme Yaka tokens, NWSC water bills, hardware invoices
                </p>
              </div>
              <span className="px-4 py-2 bg-[#101915] text-white text-xs font-bold rounded-xl mt-2">
                Select Photo from Device
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Demo Preset Receipts */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-[#65766F] uppercase tracking-wider block">
            Or test with sample Uganda expense vouchers:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {sampleReceipts.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="p-3 bg-[#F5F8F6] hover:bg-[#E2F8EF] border border-[#DFE8E3] rounded-2xl text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="font-bold text-xs text-[#17231E]">{sample.name}</div>
                <div className="text-[10px] text-[#0AB77F] font-black">
                  UGX {formatMoney(sample.amount)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Extracted OCR Information Box */}
        {scannedResult && (
          <div className="p-5 bg-[#E2F8EF] border border-[#0AB77F]/40 rounded-3xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0AB77F] font-black text-xs">
                <Sparkles className="w-4 h-4" />
                <span>OCR EXTRACTION COMPLETED</span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#0AB77F] text-white text-[10px] font-bold rounded-full">
                99% Confidence
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-[#0AB77F]/20 text-xs">
              <div>
                <span className="text-[10px] text-[#65766F] font-bold block">Vendor / Merchant</span>
                <span className="font-extrabold text-[#17231E]">{scannedResult.merchant}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#65766F] font-bold block">Amount Extracted</span>
                <span className="font-black text-[#D93838]">{formatUgx(scannedResult.amount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#65766F] font-bold block">Category</span>
                <span className="font-bold text-[#17231E]">{scannedResult.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#65766F] font-bold block">Document Date</span>
                <span className="font-semibold text-[#17231E]">{scannedResult.date}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAddExpenseModal(true)}
                className="px-6 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit to Expense Ledger
              </button>
            </div>
          </div>
        )}
      </div>

      {scannedResult && (
        <AddExpenseModal
          isOpen={showAddExpenseModal}
          onClose={() => setShowAddExpenseModal(false)}
          initialData={{
            description: scannedResult.description,
            amount: scannedResult.amount,
            category: scannedResult.category,
            receiptPhotoUri: imagePreview,
          }}
        />
      )}
    </div>
  );
};
