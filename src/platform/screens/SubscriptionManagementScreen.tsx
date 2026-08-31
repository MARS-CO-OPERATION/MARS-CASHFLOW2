import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import { PlatformSubscriptionTierEntity, ProductId } from '../../types';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Sliders,
  Sparkles,
  Building,
  Shield,
  Layers,
  X,
} from 'lucide-react';

export const SubscriptionManagementScreen: React.FC = () => {
  const {
    subscriptions,
    products,
    updateSubscriptionTier,
    createSubscriptionTier,
    hasScope,
    isPrincipalFounder,
  } = usePlatform();

  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [editingTier, setEditingTier] = useState<PlatformSubscriptionTierEntity | null>(null);
  const [showNewTierModal, setShowNewTierModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New tier form
  const [newProductId, setNewProductId] = useState<ProductId>('MARS_CASHFLOW');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'CUSTOM'>('GROWTH');
  const [newPriceMonthly, setNewPriceMonthly] = useState('150000');
  const [newPriceAnnual, setNewPriceAnnual] = useState('1500000');
  const [newMaxProperties, setNewMaxProperties] = useState('10');
  const [newMaxUnits, setNewMaxUnits] = useState('150');
  const [newFeatures, setNewFeatures] = useState('Real-time sync, PDF reports, Multi-manager');

  const filteredTiers =
    selectedProductFilter === 'ALL'
      ? subscriptions
      : subscriptions.filter((s) => s.productId === selectedProductFilter);

  const handleUpdateTierPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTier) return;

    const res = await updateSubscriptionTier(editingTier.id, {
      priceUgxMonthly: editingTier.priceUgxMonthly,
      priceUgxAnnual: editingTier.priceUgxAnnual,
      maxProperties: editingTier.maxProperties,
      maxUnits: editingTier.maxUnits,
      name: editingTier.name,
    });

    if (res.success) {
      setEditingTier(null);
      setFeedback('Subscription tier updated successfully.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCreateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const featuresArray = newFeatures
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const res = await createSubscriptionTier({
      productId: newProductId,
      name: newName.trim(),
      code: newCode,
      priceUgxMonthly: parseInt(newPriceMonthly) || 0,
      priceUgxAnnual: parseInt(newPriceAnnual) || 0,
      maxProperties: parseInt(newMaxProperties) || 1,
      maxUnits: parseInt(newMaxUnits) || 10,
      features: featuresArray,
      status: 'ACTIVE',
    });

    if (res.success) {
      setShowNewTierModal(false);
      setFeedback(`New subscription plan '${newName}' created.`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            Corporate Subscription & Pricing Engine
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Configure sovereign pricing tiers, unit capacity limits & feature entitlements across all MARS products
          </p>
        </div>
        {(isPrincipalFounder() || hasScope('platform.subscriptions.manage')) && (
          <button
            onClick={() => setShowNewTierModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan Tier</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedProductFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
            selectedProductFilter === 'ALL'
              ? 'bg-[#101915] text-white'
              : 'bg-white text-[#65766F] border border-[#DFE8E3] hover:bg-gray-50'
          }`}
        >
          All Products
        </button>
        {products.map((prod) => (
          <button
            key={prod.id}
            onClick={() => setSelectedProductFilter(prod.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedProductFilter === prod.id
                ? 'bg-[#101915] text-white'
                : 'bg-white text-[#65766F] border border-[#DFE8E3] hover:bg-gray-50'
            }`}
          >
            <span>{prod.icon}</span>
            <span>{prod.name}</span>
          </button>
        ))}
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTiers.map((tier) => {
          const product = products.find((p) => p.id === tier.productId);
          const isStarter = tier.code === 'STARTER';
          const isGrowth = tier.code === 'GROWTH';
          const isEnterprise = tier.code === 'ENTERPRISE';

          return (
            <div
              key={tier.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-6 ${
                isGrowth
                  ? 'bg-gradient-to-b from-white to-[#E2F8EF]/30 border-[#0AB77F] shadow-lg relative'
                  : 'bg-white border-[#DFE8E3] shadow-xs'
              }`}
            >
              {isGrowth && (
                <div className="absolute -top-3 right-6 bg-[#0AB77F] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-extrabold uppercase text-[#0AB77F] tracking-wider">
                    {product?.name || tier.productId}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                    {tier.code}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#17231E] mt-1">{tier.name}</h3>

                <div className="mt-4 pb-4 border-b border-gray-100">
                  <div className="text-2xl font-black text-[#17231E]">
                    UGX {tier.priceUgxMonthly.toLocaleString()}
                    <span className="text-xs font-semibold text-gray-500"> / month</span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#0AB77F] mt-0.5">
                    UGX {tier.priceUgxAnnual.toLocaleString()} billed annually
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#17231E]">
                    <span className="text-gray-500">Max Properties:</span>
                    <span>{tier.maxProperties >= 999 ? 'Unlimited' : tier.maxProperties}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-[#17231E]">
                    <span className="text-gray-500">Max Rental Units:</span>
                    <span>{tier.maxUnits >= 999 ? 'Unlimited' : tier.maxUnits}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="text-[11px] font-extrabold text-[#65766F] uppercase tracking-wider">
                    Plan Entitlements:
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#17231E]">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB77F] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {(isPrincipalFounder() || hasScope('platform.subscriptions.manage')) && (
                <button
                  onClick={() => setEditingTier(tier)}
                  className="w-full py-2.5 bg-[#F5F8F6] hover:bg-[#101915] hover:text-white text-[#17231E] rounded-xl text-xs font-bold border border-[#DFE8E3] transition-all cursor-pointer"
                >
                  Configure Plan Pricing
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Tier Modal */}
      {editingTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">
                  Configure {editingTier.name}
                </h3>
                <p className="text-[11px] text-[#65766F]">
                  Adjust sovereign rates & portfolio boundaries
                </p>
              </div>
              <button
                onClick={() => setEditingTier(null)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTierPrice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Monthly Rate (UGX)
                </label>
                <input
                  type="number"
                  value={editingTier.priceUgxMonthly}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      priceUgxMonthly: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Annual Rate (UGX)
                </label>
                <input
                  type="number"
                  value={editingTier.priceUgxAnnual}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      priceUgxAnnual: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Max Properties
                  </label>
                  <input
                    type="number"
                    value={editingTier.maxProperties}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        maxProperties: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Max Units
                  </label>
                  <input
                    type="number"
                    value={editingTier.maxUnits}
                    onChange={(e) =>
                      setEditingTier({
                        ...editingTier,
                        maxUnits: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTier(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Save Pricing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Tier Modal */}
      {showNewTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="font-extrabold text-sm text-[#17231E]">
                  Create Subscription Plan
                </h3>
                <p className="text-[11px] text-[#65766F]">
                  Deploy new customer plan tier
                </p>
              </div>
              <button
                onClick={() => setShowNewTierModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTier} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Product
                </label>
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value as ProductId)}
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Plan Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Sovereign Real Estate Pro"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Monthly UGX
                  </label>
                  <input
                    type="number"
                    value={newPriceMonthly}
                    onChange={(e) => setNewPriceMonthly(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Annual UGX
                  </label>
                  <input
                    type="number"
                    value={newPriceAnnual}
                    onChange={(e) => setNewPriceAnnual(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  value={newFeatures}
                  onChange={(e) => setNewFeatures(e.target.value)}
                  placeholder="Feature A, Feature B, Feature C"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTierModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Create Plan Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
