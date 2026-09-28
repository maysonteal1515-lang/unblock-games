import React from 'react';
import { FileText, ArrowLeft, Share2, Printer } from 'lucide-react';

export const PanicCloak = ({ onExit }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa] text-gray-800 font-sans flex flex-col select-text">
      {/* Top Docs style bar */}
      <header className="border-b border-gray-200 bg-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-600 text-white rounded">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">AP World History - Unit 4 Study Notes</span>
              <span className="text-xs text-gray-500">Last edit was 2 minutes ago</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
              <span className="hover:bg-gray-100 px-1 py-0.5 rounded cursor-pointer">File</span>
              <span className="hover:bg-gray-100 px-1 py-0.5 rounded cursor-pointer">Edit</span>
              <span className="hover:bg-gray-100 px-1 py-0.5 rounded cursor-pointer">View</span>
              <span className="hover:bg-gray-100 px-1 py-0.5 rounded cursor-pointer">Insert</span>
              <span className="hover:bg-gray-100 px-1 py-0.5 rounded cursor-pointer">Format</span>
              <span className="hover:bg-gray-100 px-1 py-0.5 rounded cursor-pointer">Tools</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
            title="Press Esc or click to return to games"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vault (Esc)</span>
          </button>
          <div className="p-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="p-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
            <Printer className="w-4 h-4" />
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            S
          </div>
        </div>
      </header>

      {/* Document Canvas Body */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#f1f3f4]">
        <div className="w-full max-w-3xl bg-white shadow-sm border border-gray-200 p-12 min-h-[900px] text-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unit 4: Transoceanic Interconnections (c. 1450 - c. 1750)</h1>
          <p className="text-sm text-gray-500 mb-6">Course: Advanced Social Studies · Semester 2 Overview</p>

          <div className="space-y-4 text-sm leading-relaxed text-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-1">1. Technological Innovations in Navigation</h2>
            <p>
              Cross-cultural interactions resulted in the diffusion of technology and facilitated changes in patterns of trade and travel from 1450 to 1750. Notable navigational developments included:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Astrolabe & Caravel:</strong> Enabled sailors to determine latitude and sail against wind currents using triangular lateen sails.</li>
              <li><strong>Magnetic Compass:</strong> Adopted from Chinese maritime explorers, facilitating open-ocean travel.</li>
              <li><strong>Astronomical Charts:</strong> Refined by European and Islamic scholars to predict celestial coordinates.</li>
            </ul>

            <h2 className="text-lg font-semibold text-gray-900 border-b pb-1 pt-4">2. The Columbian Exchange & Global Commerce</h2>
            <p>
              The new global circulation of goods was facilitated by royal chartered European monopoly companies that took silver from Spanish colonies in the Americas to purchase Asian goods for Atlantic markets.
            </p>
            <p>
              Crops such as potatoes, maize, and manioc became staple dietary items across Afro-Eurasia, contributing to demographic stabilization and growth.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 border-b pb-1 pt-4">3. Summary Questions for Next Period</h2>
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-xs text-blue-900 space-y-1">
              <p>• How did state rivalries in the Atlantic Ocean influence maritime trade routes?</p>
              <p>• Compare the mercantilist strategies of the Dutch East India Company vs. British East India Company.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
