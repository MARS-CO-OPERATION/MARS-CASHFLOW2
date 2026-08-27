import React, { useState } from 'react';
import { useMars } from '../context/MarsContext';
import { ServiceProviderEntity } from '../types';
import {
  Wrench,
  Plus,
  Phone,
  Star,
  CheckCircle2,
  X,
  Search,
  MessageCircle,
  Briefcase
} from 'lucide-react';

interface ServiceProviderScreenProps {
  onNavigate: (route: string) => void;
}

export const ServiceProviderScreen: React.FC<ServiceProviderScreenProps> = ({ onNavigate }) => {
  const { serviceProviders, addServiceProvider } = useMars();

  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New provider modal state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceProviderEntity['serviceType']>('Plumbing');
  const [rate, setRate] = useState('UGX 50,000 / call');
  const [assignedProperty, setAssignedProperty] = useState('All Properties');

  const trades = ['ALL', 'Plumbing', 'Electrical', 'Security', 'Fumigation', 'General', 'Masonry', 'Painting'];

  const filteredProviders = serviceProviders.filter((p) => {
    if (tradeFilter === 'ALL') return true;
    return p.serviceType === tradeFilter;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    addServiceProvider({
      name,
      phone,
      serviceType,
      rate,
      assignedProperty
    });
    setName('');
    setPhone('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto px-4 sm:px-6 pt-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">
            🔧
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Contractor & Artisan Directory</h1>
            <p className="text-xs text-[#65766F]">
              Vetted plumbers, electricians, security guards & handy artisans
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Contractor
        </button>
      </div>

      {/* Trades Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white p-2 rounded-2xl border border-[#DFE8E3]">
        {trades.map((t) => (
          <button
            key={t}
            onClick={() => setTradeFilter(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              tradeFilter === t
                ? 'bg-[#101915] text-white shadow-xs'
                : 'text-[#65766F] hover:bg-gray-100 hover:text-[#17231E]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-3xl p-5 border border-[#DFE8E3] shadow-xs space-y-4 hover:border-[#0AB77F]/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E2F8EF] text-[#0AB77F]">
                  {provider.serviceType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    provider.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {provider.status === 'Available' ? '● Available' : '● On Job'}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">{provider.name}</h3>
                <p className="text-xs text-[#65766F] mt-0.5">{provider.phone} • {provider.assignedProperty}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-[#17231E] pt-2 border-t border-[#DFE8E3]">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{provider.rating.toFixed(1)}</span>
                </div>
                <div className="text-[#65766F] text-[11px]">
                  {provider.rate}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DFE8E3] flex items-center gap-2">
              <a
                href={`tel:${provider.phone}`}
                className="flex-1 py-2 bg-[#F5F8F6] hover:bg-gray-200 text-[#17231E] rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#0AB77F]" />
                Call Direct
              </a>
              <button
                onClick={() => onNavigate('maintenance')}
                className="px-3 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Assign Work
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#DFE8E3] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE8E3]">
              <h3 className="font-extrabold text-base text-[#17231E]">Register Service Provider</h3>
              <button onClick={() => setShowAddModal(false)} className="cursor-pointer text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#17231E] mb-1">Contractor Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Samuel Okello"
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">Uganda Phone (MTN/Airtel)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0772 345 678"
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#17231E] mb-1">Trade Specialization</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as ServiceProviderEntity['serviceType'])}
                  className="w-full px-3 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl font-semibold text-[#17231E] focus:outline-hidden focus:border-[#0AB77F]"
                >
                  <option value="Plumbing">Plumbing (Pipes & Valves)</option>
                  <option value="Electrical">Electrical (Wiring & Yaka)</option>
                  <option value="Security">Security (Guards & Sensors)</option>
                  <option value="Fumigation">Fumigation (Pest Control)</option>
                  <option value="General">General (Handyman & Cleaning)</option>
                  <option value="Masonry">Masonry (Brickwork & Tile)</option>
                  <option value="Painting">Painting (Finishes & Coatings)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DFE8E3]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#65766F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  Save Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
