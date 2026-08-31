import React, { useState } from 'react';
import { usePlatform } from '../PlatformContext';
import { ProductRegistryEntity, ProductId } from '../../types';
import {
  Layers,
  Plus,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Code2,
  Sparkles,
  X,
  Boxes,
  Tag,
} from 'lucide-react';

export const ProductRegistryScreen: React.FC = () => {
  const {
    products,
    updateProduct,
    toggleProductFeatureFlag,
    registerNewProduct,
    hasScope,
    isPrincipalFounder,
  } = usePlatform();

  const [selectedProductId, setSelectedProductId] = useState<ProductId>('MARS_CASHFLOW');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New product form
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCategory, setNewCategory] = useState<ProductRegistryEntity['category']>('SERVICES');
  const [newVersion, setNewVersion] = useState('v1.0.0-dev');
  const [newRoles, setNewRoles] = useState('AGENT, CLIENT, INSPECTOR');
  const [newDescription, setNewDescription] = useState('');
  const [newIcon, setNewIcon] = useState('🚀');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleToggleFlag = async (flagKey: string, currentVal: boolean) => {
    const res = await toggleProductFeatureFlag(selectedProduct.id, flagKey, !currentVal);
    if (res.success) {
      setFeedback(`Feature flag '${flagKey}' updated to ${!currentVal ? 'ENABLED' : 'DISABLED'}`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleStatusChange = async (newStatus: ProductRegistryEntity['status']) => {
    const res = await updateProduct(selectedProduct.id, { status: newStatus });
    if (res.success) {
      setFeedback(`Product status updated to ${newStatus}`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleCreateNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) return;

    const formattedId = newId.trim().toUpperCase().replace(/\s+/g, '_');
    const rolesArray = newRoles
      .split(',')
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean);

    const res = await registerNewProduct({
      id: formattedId,
      name: newName.trim(),
      tagline: newTagline.trim(),
      category: newCategory,
      status: 'IN_DEVELOPMENT',
      version: newVersion.trim(),
      customerRoles: rolesArray.length ? rolesArray : ['CUSTOMER_USER'],
      icon: newIcon || '📦',
      description: newDescription.trim(),
      featureFlags: {
        api_access: true,
        beta_testers_only: true,
      },
      subscriptionTiers: ['STARTER', 'GROWTH'],
      stats: {
        activeWorkspaces: 0,
        totalUsers: 0,
        monthlyThroughputUgx: 0,
      },
    });

    if (res.success) {
      setShowNewProductModal(false);
      setSelectedProductId(formattedId);
      setFeedback(`Product '${newName}' successfully registered under MARS Corporation!`);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17231E]">
            MARS Product Registry & Feature Engine
          </h2>
          <p className="text-xs text-[#65766F] mt-0.5">
            Manage live products, customer roles, remote feature flags & deployment statuses
          </p>
        </div>
        {(isPrincipalFounder() || hasScope('platform.products.manage')) && (
          <button
            onClick={() => setShowNewProductModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-2xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New MARS Product</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#0AB77F] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Product Selector & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-extrabold text-[#65766F] uppercase tracking-wider px-1">
            Registered Products ({products.length})
          </div>
          <div className="space-y-2">
            {products.map((p) => {
              const isSelected = p.id === selectedProduct.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#101915] text-white border-[#101915] shadow-md'
                      : 'bg-white text-[#17231E] border-[#DFE8E3] hover:border-[#0AB77F]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <div className="font-extrabold text-sm leading-tight">{p.name}</div>
                      <div
                        className={`text-[11px] font-mono font-semibold ${
                          isSelected ? 'text-[#62E3B6]' : 'text-gray-400'
                        }`}
                      >
                        {p.id}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      p.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'BETA'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Product Command Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedProduct.icon}</span>
                <div>
                  <h3 className="text-xl font-black text-[#17231E]">{selectedProduct.name}</h3>
                  <div className="text-xs text-gray-500 font-semibold">{selectedProduct.tagline}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 font-mono">{selectedProduct.version}</span>
                <select
                  value={selectedProduct.status}
                  onChange={(e) => handleStatusChange(e.target.value as any)}
                  className="px-3 py-1.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE (Production)</option>
                  <option value="BETA">BETA (Pilot Phase)</option>
                  <option value="IN_DEVELOPMENT">IN DEVELOPMENT</option>
                  <option value="MAINTENANCE">MAINTENANCE MODE</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-[#65766F] leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Roles Allowed */}
            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-extrabold text-[#65766F] uppercase tracking-wider">
                Authorized Customer Roles:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.customerRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 bg-[#E2F8EF] border border-[#0AB77F]/30 text-[#07885E] rounded-xl text-xs font-extrabold"
                  >
                    👤 {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Flags Management */}
          <div className="bg-white p-6 rounded-3xl border border-[#DFE8E3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-[#17231E]">
                  Remote Feature Flags & Capabilities
                </h4>
                <p className="text-xs text-[#65766F]">
                  Authoritative feature switches controlled by MARS Platform HQ
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400">
                {Object.keys(selectedProduct.featureFlags || {}).length} Flags
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {Object.entries(selectedProduct.featureFlags || {}).map(([flagKey, enabled]) => (
                <div
                  key={flagKey}
                  className="p-3.5 rounded-2xl border border-gray-200 bg-[#F5F8F6] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-[#17231E] font-mono">
                      {flagKey}
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold">
                      {enabled ? 'Currently live for users' : 'Disabled platform-wide'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleFlag(flagKey, enabled)}
                    className="text-2xl transition-transform active:scale-90 cursor-pointer"
                    title={enabled ? 'Click to Disable' : 'Click to Enable'}
                  >
                    {enabled ? (
                      <span className="text-[#0AB77F]">🟢 ON</span>
                    ) : (
                      <span className="text-gray-400">⚪ OFF</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Register New Product */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-[#17231E] shadow-2xl space-y-4 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E2F8EF] flex items-center justify-center text-[#0AB77F]">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#17231E]">
                    Register Future MARS Product
                  </h3>
                  <p className="text-[11px] text-[#65766F]">
                    Attach new sovereign product to Platform HQ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProduct} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Product Identifier (Code) *
                </label>
                <input
                  type="text"
                  required
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="e.g. MARS_LOGISTICS"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-mono font-bold text-[#17231E] uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. MARS Logistics & Fleet"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  >
                    <option value="FINANCE">Finance</option>
                    <option value="REAL_ESTATE">Real Estate</option>
                    <option value="UTILITIES">Utilities</option>
                    <option value="ENGINEERING">Engineering</option>
                    <option value="SERVICES">Services</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#17231E] mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="e.g. 🚚"
                    className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Sovereign fleet & heavy machinery routing"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Customer Roles (comma separated)
                </label>
                <input
                  type="text"
                  value={newRoles}
                  onChange={(e) => setNewRoles(e.target.value)}
                  placeholder="FLEET_OWNER, DRIVER, DISPATCHER"
                  className="w-full px-3.5 py-2.5 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17231E] mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Overview of the product architecture..."
                  className="w-full px-3.5 py-2 bg-[#F5F8F6] border border-[#DFE8E3] rounded-xl text-xs text-[#17231E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#65766F] rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Register Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
