import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTenantModal: React.FC<AddTenantModalProps> = ({ isOpen, onClose }) => {
  const { properties, addTenant } = useMars();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyName, setPropertyName] = useState(properties[0]?.name || 'Kampala Apartments');
  const [unitName, setUnitName] = useState('Unit 105');
  const [monthlyRent, setMonthlyRent] = useState('1200000');
  const [arrears, setArrears] = useState('0');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !unitName.trim()) {
      setErrorMessage('Please fill in all tenant identity fields.');
      return;
    }

    const rent = parseFloat(monthlyRent.replace(/[^0-9]/g, '')) || 0;
    const initialArrears = parseFloat(arrears.replace(/[^0-9]/g, '')) || 0;

    addTenant({
      name,
      phone,
      propertyName,
      unitName,
      monthlyRent: rent,
      arrears: initialArrears,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#DFE8E3] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 bg-[#101915] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0AB77F] flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">Onboard New Tenant</h3>
              <p className="text-xs text-[#9FB2A9]">Register occupant & unit lease profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#D93838] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Full Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Harriet Babirye"
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-[#17231E] mb-1">Uganda Phone / WhatsApp</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0772 987 654"
              className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Assigned Property</label>
              <select
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Unit Number / Door</label>
              <input
                type="text"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Unit 105"
                className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Monthly Rent (UGX)</label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="1,200,000"
                className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#17231E] mb-1">Opening Arrears (UGX)</label>
              <input
                type="number"
                value={arrears}
                onChange={(e) => setArrears(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 bg-white border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#D93838] focus:outline-hidden focus:border-[#D93838]"
              />
            </div>
          </div>

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
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#0AB77F] hover:bg-[#07885E] shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Tenant Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
