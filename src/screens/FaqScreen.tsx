import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building,
  Scale,
  Smartphone,
  ShieldCheck,
  PhoneCall,
  FileText
} from 'lucide-react';

interface FaqScreenProps {
  onNavigate: (route: string) => void;
}

export const FaqScreen: React.FC<FaqScreenProps> = ({ onNavigate }) => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const faqs = [
    {
      title: 'Uganda Landlord and Tenant Act (2022) Regulations',
      icon: '⚖️',
      items: [
        {
          q: 'Is it legal to quote or demand rent in foreign currency (USD) in Uganda?',
          a: 'Under Section 23 of the Uganda Landlord and Tenant Act (2022), all rent obligations and transactions in Uganda MUST be expressed and paid in Uganda Shillings (UGX), unless there is explicit mutual agreement between both parties.',
        },
        {
          q: 'Must landlords issue a receipt for every rent collection?',
          a: 'Yes. Section 24 mandates that a landlord or caretaker MUST issue a written or digital receipt to the tenant immediately upon receiving rent. MARS Cashflow automatically satisfies this legal requirement by generating stamped, verifiable digital receipts for every payment.',
        },
        {
          q: 'What is the required notice period for rent increments?',
          a: 'Landlords must give at least 90 days written notice to tenants before implementing any rent increment, and rent cannot be increased more than once in a 12-month period (capped at 10% annually unless substantial renovations were executed).',
        },
        {
          q: 'What is the legal process for handling overdue rent arrears?',
          a: 'If a tenant fails to pay rent for more than 30 consecutive days from the due date, the landlord must issue a formal 30-day Notice of Default before seeking an eviction order through the local council court or magistrate.',
        },
      ],
    },
    {
      title: 'Mobile Money & Payment Collections',
      icon: '📱',
      items: [
        {
          q: 'Which Mobile Money networks are supported?',
          a: 'MARS Cashflow supports all Ugandan telecom gateways, primarily MTN Mobile Money (*165#) and Airtel Money (*185#), as well as direct EFT / bank transfers and cash receipts.',
        },
        {
          q: 'How does digital receipt verification work?',
          a: 'Every payment logged generates a unique cryptographically signed transaction hash and receipt number that can be verified and shared via WhatsApp, SMS, or PDF printout.',
        },
      ],
    },
    {
      title: 'Caretaker Operations & Offline Syncing',
      icon: '👨🏾‍💼',
      items: [
        {
          q: 'Can caretakers log payments without an active internet connection?',
          a: 'Yes! MARS utilizes an offline-first architecture with local database storage. Collections recorded on-site queue locally and synchronize to the cloud as soon as a data connection is detected.',
        },
      ],
    },
    {
      title: 'Operating Expenses & OCR Scanner',
      icon: '📷',
      items: [
        {
          q: 'How does the OCR Receipt Scanner work?',
          a: 'The OCR scanner uses image analysis to read printed text on paper utility receipts (Umeme Yaka, NWSC water vouchers, hardware receipts) and automatically extracts merchant names, figures, and dates directly into the expense ledger.',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto px-4 sm:px-6 pt-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0AB77F] text-white flex items-center justify-center text-xl">
            ❓
          </div>
          <div>
            <h1 className="text-xl font-black text-[#17231E]">Uganda Tenancy & Ledger FAQs</h1>
            <p className="text-xs text-[#65766F]">
              Legal guidelines, Mobile Money integration & operational instructions
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#DFE8E3] rounded-xl text-xs font-bold text-[#17231E] transition-all cursor-pointer self-start sm:self-auto"
        >
          Back to Dashboard →
        </button>
      </div>

      {/* Accordion Categories */}
      <div className="space-y-4">
        {faqs.map((cat, catIdx) => {
          const isOpen = openSection === catIdx;
          return (
            <div
              key={cat.title}
              className="bg-white rounded-3xl border border-[#DFE8E3] overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenSection(isOpen ? null : catIdx)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-[#F5F8F6] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#17231E]">{cat.title}</h3>
                    <p className="text-[11px] text-[#65766F]">{cat.items.length} legal & operational topics</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {isOpen && (
                <div className="p-5 pt-0 space-y-4 border-t border-[#DFE8E3] divide-y divide-gray-100 bg-[#F5F8F6]/30">
                  {cat.items.map((item, idx) => (
                    <div key={idx} className="pt-4 first:pt-2 space-y-1">
                      <h4 className="font-black text-xs text-[#17231E] flex items-start gap-2">
                        <span className="text-[#0AB77F] font-black">Q:</span>
                        <span>{item.q}</span>
                      </h4>
                      <p className="text-xs text-[#65766F] leading-relaxed pl-5 font-medium">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Box */}
      <div className="bg-[#101915] rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-black text-sm text-white">Need Additional Legal or Setup Assistance?</h4>
          <p className="text-xs text-[#9FB2A9]">
            MARS Support Desk is available in Kampala for property manager onboarding.
          </p>
        </div>

        <a
          href="tel:+256772000000"
          className="px-5 py-2.5 bg-[#0AB77F] hover:bg-[#07885E] text-white rounded-xl text-xs font-black transition-colors cursor-pointer whitespace-nowrap"
        >
          Call MARS Help (+256 772 000 000)
        </a>
      </div>
    </div>
  );
};
