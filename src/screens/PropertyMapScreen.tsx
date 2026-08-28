// Source: Google Maps Platform Code Assist
import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { useMars } from '../context/MarsContext';
import {
  MapPin,
  Navigation,
  Building2,
  Phone,
  Wrench,
  DollarSign,
  Users,
  AlertTriangle,
  ExternalLink,
  Layers,
  Search,
} from 'lucide-react';

// Coordinates for Uganda Properties
const PROPERTY_COORDINATES: Record<string, { lat: number; lng: number; address: string }> = {
  'prop-1': {
    lat: 0.3476,
    lng: 32.6105,
    address: 'Plot 42 Ntinda-Nakawa Road, Kampala',
  },
  'prop-2': {
    lat: 0.0634,
    lng: 32.4789,
    address: 'Kitubulu, Entebbe Road, Entebbe',
  },
  'prop-3': {
    lat: 0.4312,
    lng: 33.2032,
    address: 'Main Street, Jinja City',
  },
};

// Coordinates for Service Providers
const PROVIDER_COORDINATES: Record<string, { lat: number; lng: number; base: string }> = {
  'sp-1': { lat: 0.3392, lng: 32.5982, base: 'Ntinda Commercial Hub' },
  'sp-2': { lat: 0.0589, lng: 32.4691, base: 'Entebbe Town Center' },
  'sp-3': { lat: 0.4285, lng: 33.2001, base: 'Jinja Industrial Area' },
  'sp-4': { lat: 0.3214, lng: 32.5832, base: 'Nakawa Business Park' },
};

interface PropertyMapScreenProps {
  onNavigate: (route: string) => void;
}

export const PropertyMapScreen: React.FC<PropertyMapScreenProps> = ({ onNavigate }) => {
  const { properties, tenants, payments, serviceProviders } = useMars();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>('prop-1');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [filterLayer, setFilterLayer] = useState<'ALL' | 'PROPERTIES' | 'CONTRACTORS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];
  const activePropertyCoords = PROPERTY_COORDINATES[activeProperty?.id] || {
    lat: 0.3476,
    lng: 32.6105,
    address: 'Kampala, Uganda',
  };

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="property-map-screen" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-5 border-b border-[#D8E2DC]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00A86B] mb-1">
            <MapPin className="w-4 h-4" />
            <span>Geospatial Real Estate Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0D3B2E]">
            Property Portfolio & Field Service Map
          </h1>
          <p className="text-sm text-[#4A5D53] mt-1">
            Real-time geospatial visualization of residential assets, tenant units, and on-call service contractors across Uganda.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <div className="inline-flex rounded-xl bg-[#E3EBE6] p-1 border border-[#D8E2DC]">
            <button
              onClick={() => setFilterLayer('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterLayer === 'ALL'
                  ? 'bg-white text-[#0D3B2E] shadow-sm'
                  : 'text-[#4A5D53] hover:text-[#0D3B2E]'
              }`}
            >
              All Assets ({properties.length + serviceProviders.length})
            </button>
            <button
              onClick={() => setFilterLayer('PROPERTIES')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterLayer === 'PROPERTIES'
                  ? 'bg-white text-[#0D3B2E] shadow-sm'
                  : 'text-[#4A5D53] hover:text-[#0D3B2E]'
              }`}
            >
              Properties ({properties.length})
            </button>
            <button
              onClick={() => setFilterLayer('CONTRACTORS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterLayer === 'CONTRACTORS'
                  ? 'bg-white text-[#0D3B2E] shadow-sm'
                  : 'text-[#4A5D53] hover:text-[#0D3B2E]'
              }`}
            >
              Contractors ({serviceProviders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Properties & Dispatch List */}
        <div className="space-y-4">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A5D53]" />
            <input
              type="text"
              placeholder="Search property or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8E2DC] rounded-xl text-sm focus:outline-none focus:border-[#00A86B]"
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#D8E2DC] p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold text-[#4A5D53] uppercase tracking-wider">
              Uganda Portfolio Estates
            </h2>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredProperties.map((prop) => {
                const propTenants = tenants.filter((t) => t.propertyId === prop.id);
                const hasOverdue = propTenants.some((t) => t.arrears > 0);
                const isSelected = prop.id === selectedPropertyId;
                const propPayments = payments
                  .filter((p) => p.propertyId === prop.id)
                  .reduce((sum, p) => sum + p.amount, 0);

                return (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      setSelectedProviderId(null);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBF7F0] border-[#00A86B] shadow-sm ring-1 ring-[#00A86B]'
                        : 'bg-[#F9FBFA] border-[#D8E2DC] hover:border-[#00A86B]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-4 h-4 ${isSelected ? 'text-[#00A86B]' : 'text-[#4A5D53]'}`} />
                          <span className="text-sm font-bold text-[#0D3B2E]">{prop.name}</span>
                        </div>
                        <p className="text-xs text-[#4A5D53] mt-0.5">{prop.location}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#0D3B2E]/5 text-[#0D3B2E] font-medium">
                        {prop.totalUnits} Units
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-[#D8E2DC]/60">
                      <span className="text-[#4A5D53]">Collected Rent:</span>
                      <span className="font-semibold text-[#0D3B2E]">UGX {propPayments.toLocaleString()}</span>
                    </div>

                    {hasOverdue && (
                      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Arrears pending collection</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Contractor Directory */}
          <div className="bg-white rounded-2xl border border-[#D8E2DC] p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#4A5D53] uppercase tracking-wider">
                On-Call Service Providers
              </h2>
              <button
                onClick={() => onNavigate('service_providers')}
                className="text-xs text-[#00A86B] font-medium hover:underline flex items-center gap-1"
              >
                <span>Directory</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {serviceProviders.map((sp) => {
                const isSelected = sp.id === selectedProviderId;
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      setSelectedProviderId(sp.id);
                      setSelectedPropertyId(null);
                    }}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EBF7F0] border-[#00A86B]'
                        : 'bg-[#F9FBFA] border-[#D8E2DC] hover:border-[#00A86B]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B]">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0D3B2E]">{sp.name}</p>
                        <p className="text-[11px] text-[#4A5D53]">{sp.serviceType} • {sp.assignedProperty}</p>
                      </div>
                    </div>

                    <a
                      href={`tel:${sp.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Google Map Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#D8E2DC] p-3 shadow-sm flex flex-col h-[650px] overflow-hidden relative">
            {/* Map Header Status */}
            <div className="px-3 py-2 bg-[#F5F8F6] rounded-xl border border-[#D8E2DC] flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-[#0D3B2E]">
                  {selectedPropertyId
                    ? `Viewing Estate: ${activeProperty?.name}`
                    : selectedProviderId
                    ? `Viewing Contractor: ${serviceProviders.find((s) => s.id === selectedProviderId)?.name}`
                    : 'Uganda Property Map'}
                </span>
              </div>
              <div className="text-xs text-[#4A5D53] hidden sm:block">
                Map Center: {activePropertyCoords.lat.toFixed(4)}, {activePropertyCoords.lng.toFixed(4)}
              </div>
            </div>

            {/* Map Canvas Container */}
            <div className="flex-1 w-full h-full rounded-xl overflow-hidden relative border border-[#D8E2DC]">
              <APIProvider apiKey={apiKey}>
                <Map
                  mapId="DEMO_MAP_ID"
                  defaultCenter={{ lat: 0.3476, lng: 32.6105 }}
                  center={
                    selectedPropertyId
                      ? { lat: activePropertyCoords.lat, lng: activePropertyCoords.lng }
                      : selectedProviderId
                      ? {
                          lat: PROVIDER_COORDINATES[selectedProviderId]?.lat || 0.3476,
                          lng: PROVIDER_COORDINATES[selectedProviderId]?.lng || 32.6105,
                        }
                      : { lat: 0.3476, lng: 32.6105 }
                  }
                  defaultZoom={11}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                  className="w-full h-full min-h-[500px]"
                >
                  {/* Property Markers */}
                  {(filterLayer === 'ALL' || filterLayer === 'PROPERTIES') &&
                    properties.map((prop, idx) => {
                      const coords = PROPERTY_COORDINATES[prop.id] || {
                        lat: 0.3476 + (idx * 0.015),
                        lng: 32.6105 + (idx * 0.015),
                        address: prop.location || 'Kampala, Uganda',
                      };
                      const isSelected = prop.id === selectedPropertyId;

                      return (
                        <AdvancedMarker
                          key={prop.id}
                          position={{ lat: coords.lat, lng: coords.lng }}
                          title={prop.name}
                          onClick={() => {
                            setSelectedPropertyId(prop.id);
                            setSelectedProviderId(null);
                          }}
                        >
                          <Pin
                            background={isSelected ? '#00A86B' : '#0D3B2E'}
                            borderColor="#FFFFFF"
                            glyphColor="#FFFFFF"
                            scale={isSelected ? 1.3 : 1.0}
                          />
                        </AdvancedMarker>
                      );
                    })}

                  {/* Contractor Markers */}
                  {(filterLayer === 'ALL' || filterLayer === 'CONTRACTORS') &&
                    serviceProviders.map((sp) => {
                      const coords = PROVIDER_COORDINATES[sp.id];
                      if (!coords) return null;
                      const isSelected = sp.id === selectedProviderId;

                      return (
                        <AdvancedMarker
                          key={sp.id}
                          position={{ lat: coords.lat, lng: coords.lng }}
                          title={`${sp.name} (${sp.serviceType})`}
                          onClick={() => {
                            setSelectedProviderId(sp.id);
                            setSelectedPropertyId(null);
                          }}
                        >
                          <Pin
                            background={isSelected ? '#D97706' : '#F59E0B'}
                            borderColor="#FFFFFF"
                            glyphColor="#FFFFFF"
                            scale={isSelected ? 1.2 : 0.9}
                          />
                        </AdvancedMarker>
                      );
                    })}

                  {/* Info Window for Selected Property */}
                  {selectedPropertyId && activeProperty && (
                    <InfoWindow
                      position={{ lat: activePropertyCoords.lat, lng: activePropertyCoords.lng }}
                      onCloseClick={() => setSelectedPropertyId(null)}
                    >
                      <div className="p-2 max-w-xs text-left text-[#17231E]">
                        <div className="flex items-center gap-1 text-[#00A86B] font-bold text-xs">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{activeProperty.name}</span>
                        </div>
                        <p className="text-xs text-[#4A5D53] mt-1">{activeProperty.location}</p>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-xs">
                          <span>Total Units: <strong>{activeProperty.totalUnits}</strong></span>
                          <span>Currency: <strong>{activeProperty.currency}</strong></span>
                        </div>
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={() => onNavigate('landlord')}
                            className="w-full px-2 py-1 bg-[#0D3B2E] text-white text-[11px] font-semibold rounded"
                          >
                            Open Ledger
                          </button>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            </div>

            {/* Bottom Bar Info / Directions Card */}
            {activeProperty && (
              <div className="mt-3 p-3 bg-[#F9FBFA] rounded-xl border border-[#D8E2DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00A86B]/15 flex items-center justify-center text-[#00A86B]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0D3B2E]">{activeProperty.name}</h3>
                    <p className="text-xs text-[#4A5D53] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00A86B]" />
                      <span>{activeProperty.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activeProperty.name} ${activeProperty.location}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0D3B2E] text-white rounded-xl text-xs font-semibold hover:bg-[#134e3f] transition"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                  <button
                    onClick={() => onNavigate('landlord')}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 bg-white border border-[#D8E2DC] text-[#0D3B2E] rounded-xl text-xs font-semibold hover:bg-gray-50 transition"
                  >
                    <span>View Units</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
