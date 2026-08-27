import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { ExpenseEntity } from '../types';
import {
  X,
  TrendingDown,
  Camera,
  CheckCircle2,
  AlertCircle,
  UploadCloud
} from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    description?: string;
    amount?: number;
    category?: ExpenseEntity['category'];
    propertyName?: string;
    receiptPhotoUri?: string | null;
  };
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { properties, addExpense } = useMars();

  const [propertyName, setPropertyName] = useState<string>(
    initialData?.propertyName || properties[0]?.name || 'Kampala Apartments'
  );
  const [description, setDescription] = useState<string>(
    initialData?.description || ''
  );
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? initialData.amount.toString() : ''
  );
  const [category, setCategory] = useState<ExpenseEntity['category']>(
    initialData?.category || 'Maintenance'
  );
  const [receiptPhotoUri, setReceiptPhotoUri] = useState<string | null>(
    initialData?.receiptPhotoUri || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories: ExpenseEntity['category'][] = [
    'Maintenance',
    'Utilities',
    'Caretaker Wage',
    'Repairs',
    'Security',
    'General',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPhotoUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount in UGX.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage('Please enter an expense description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      addExpense({
        propertyName,
        description,
        amount: numAmount,
        category,
        receiptPhotoUri,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to add expense');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D93838] flex items-center justify-center text-white">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Record Operating Expense</h3>
              <p className="text-xs text-[#9FB2A9]">Log outgoing operational expenditure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#D93838] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Property selector */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1">Target Property</label>
            <select
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.location})
                </option>
              ))}
            </select>
          </div>

          {/* Expense Category */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                    category === cat
                      ? 'border-[#D93838] bg-red-50 text-[#D93838]'
                      : 'border-[#DFE8E3] bg-white text-[#65766F] hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1">Expense Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Umeme Yaka electricity units for compound lighting"
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1">Amount Spent (UGX)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm">
                UGX
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150,000"
                className="w-full pl-14 pr-4 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-sm font-black text-[#D93838] focus:outline-hidden focus:border-[#D93838]"
                required
              />
            </div>
          </div>

          {/* Receipt Photo Upload */}
          <div>
            <label className="block font-bold text-[#17231E] mb-1">Physical Receipt / Invoice Photo</label>
            <div className="border-2 border-dashed border-[#DFE8E3] rounded-2xl p-4 text-center bg-[#F5F8F6] relative hover:bg-gray-100 transition-colors">
              {receiptPhotoUri ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={receiptPhotoUri}
                      alt="Receipt preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                    />
                    <span className="font-bold text-[#17231E]">Receipt Attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptPhotoUri(null)}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Camera className="w-6 h-6 text-[#65766F]" />
                  <span className="font-bold text-xs text-[#17231E]">
                    Click or drag invoice photo here
                  </span>
                  <span className="text-[10px] text-[#65766F]">PNG, JPG, PDF up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DFE8E3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65766F] hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#D93838] hover:bg-red-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording...' : 'Save Expense to Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
