import React, { useState } from 'react';
import { useToast } from './Toast';
import { Receipt, FileText, Printer, CheckCircle, Download, Calendar, Coins, Hash, ShieldCheck, Tag } from 'lucide-react';
import { Transaction } from '../types';

interface ReceiptGeneratorViewProps {
  transactions: Transaction[];
}

export function ReceiptGeneratorView({ transactions }: ReceiptGeneratorViewProps) {
  const [selectedTxId, setSelectedTxId] = useState<string>('manual');
  
  // Custom manual inputs
  const [manualAmount, setManualAmount] = useState('25000.00');
  const [manualNetwork, setManualNetwork] = useState('USDT (TRC20)');
  const [manualWallet, setManualWallet] = useState('TY6XepvMMy6F84gGZveVf7vPqKPh1Tsw8f');
  const [manualDate, setManualDate] = useState(new Date().toISOString().substring(0, 10));
  const [manualStatus, setManualStatus] = useState<'completed' | 'pending' | 'failed'>('completed');

  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
    showToast('Receipt printable document triggered successfully!', 'success');
  };

  const activeTx = selectedTxId === 'manual'
    ? {
        id: 'SPP-TX-' + Math.floor(10000000 + Math.random() * 90000000),
        amount: parseFloat(manualAmount) || 0,
        network: manualNetwork,
        wallet: manualWallet,
        created_at: new Date(manualDate).toISOString(),
        status: manualStatus,
        tx_hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      }
    : (() => {
        const found = transactions.find(t => t.id === selectedTxId);
        if (found) {
          return {
            ...found,
            amount: Math.abs(found.amount) // convert to positive for professional invoice display
          };
        }
        return null;
      })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-white">Security Receipt Generator</h2>
        <p className="text-xs text-gray-500">Produce official printable merchant audits and secure transaction compliance receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Configuration Inputs */}
        <div className="lg:col-span-2 space-y-4 print:hidden">
          <div className="bg-brand-card p-5 rounded-xl border border-emerald-950/40 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-emerald-950/50 pb-2">Receipt Selector</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source Transaction</label>
                <select
                  value={selectedTxId}
                  onChange={(e) => setSelectedTxId(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C853] text-xs font-mono"
                >
                  <option value="manual">-- Create New Custom Receipt --</option>
                  {transactions.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.created_at.split('T')[0]} - ${Math.abs(t.amount).toLocaleString()} ({t.network.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTxId === 'manual' && (
                <div className="space-y-3.5 pt-2 border-t border-emerald-950/40">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Network Protocol</label>
                    <select
                      value={manualNetwork}
                      onChange={(e) => setManualNetwork(e.target.value)}
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00C853] text-xs"
                    >
                      <option value="USDT (TRC20)">Tether USDT (TRC-20)</option>
                      <option value="USDT (ERC20)">Tether USDT (ERC-20)</option>
                      <option value="USDT (BEP20)">Tether USDT (BEP-20)</option>
                      <option value="BTC (Bitcoin)">Bitcoin Chain (BTC)</option>
                      <option value="ETH (Ethereum)">Ethereum Mainnet (ETH)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Wallet Destination Address</label>
                    <input
                      type="text"
                      value={manualWallet}
                      onChange={(e) => setManualWallet(e.target.value)}
                      placeholder="e.g. TY6XepvMMy6F84gGZveVf..."
                      className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount ($)</label>
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl px-3 py-2.5 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Flag</label>
                    <div className="flex gap-2">
                      {['completed', 'pending', 'failed'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setManualStatus(st as any)}
                          className={`flex-1 py-2 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer
                            ${manualStatus === st
                              ? 'bg-[#00C853]/10 border-[#00C853] text-[#00C853]'
                              : 'bg-brand-bg/50 border-emerald-950 text-gray-500 hover:text-white'
                            }
                          `}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Premium Printable Receipt View */}
        {activeTx ? (
          <div className="lg:col-span-3 space-y-4">
            {/* Visual Receipt Box */}
            <div
              id="printable-receipt-card"
              className="bg-white text-brand-bg p-8 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col min-h-[580px] border border-gray-200 receipt-watermark font-sans max-w-lg mx-auto print:p-4 print:shadow-none print:border-none print:w-full print:mx-0 print:rounded-none"
            >
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b-2 border-gray-100 pb-5">
                <div>
                  <h1 className="text-xl font-display font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                    SimuPay <span className="text-[#00C853]">Pro</span>
                  </h1>
                  <span className="text-[9px] font-mono text-gray-400 block tracking-widest mt-0.5">OFFICIAL TRANSACTION RECEIPT</span>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md tracking-wider border
                    ${activeTx.status === 'completed' ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' : ''}
                    ${activeTx.status === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-700' : ''}
                    ${activeTx.status === 'failed' ? 'bg-red-100 border-red-300 text-red-700' : ''}
                  `}>
                    {activeTx.status}
                  </span>
                </div>
              </div>

              {/* Transaction amount large */}
              <div className="py-8 text-center space-y-1 border-b border-gray-100">
                <span className="text-xs text-gray-400 uppercase font-mono tracking-wider">Transaction Amount</span>
                <h2 className="text-4xl font-display font-extrabold text-gray-900 tracking-tight">
                  ${activeTx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h2>
                <div className="flex justify-center items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Settled via {activeTx.network}</span>
                </div>
              </div>

              {/* Parameters List */}
              <div className="flex-1 py-6 space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400 font-mono">Reference ID:</span>
                  <span className="col-span-2 text-right font-mono font-bold text-gray-800 break-all">{activeTx.id}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400 font-mono">Transfer Date:</span>
                  <span className="col-span-2 text-right text-gray-800 font-medium">
                    {new Date(activeTx.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400 font-mono">Ledger Address:</span>
                  <span className="col-span-2 text-right text-gray-800 font-mono break-all text-[11px] leading-tight select-all">
                    {activeTx.wallet}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-400 font-mono">Security Hash:</span>
                  <span className="col-span-2 text-right text-gray-500 font-mono break-all text-[10px] leading-tight select-all">
                    {activeTx.tx_hash}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                  <span className="text-gray-400 font-mono">Terminal Node:</span>
                  <span className="col-span-2 text-right text-gray-700 font-mono font-semibold">SimuPay Node #905-SSL</span>
                </div>
              </div>

              {/* Footer containing barcode, simulated vector QR code & watermarks */}
              <div className="border-t-2 border-gray-100 pt-6 flex justify-between items-center mt-auto">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-BIT ENCRYPTED RECORD</span>
                  </div>
                  {/* Mock Barcode visual */}
                  <div className="flex gap-[1.5px] items-end h-7 bg-white select-none">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 4, 2].map((w, i) => (
                      <div key={i} className="bg-gray-800 h-full" style={{ width: `${w * 1.5}px` }} />
                    ))}
                  </div>
                </div>

                {/* Highly Realistic SVG QR Code Mockup */}
                <div className="w-16 h-16 bg-white p-1 border border-gray-200 rounded flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900 fill-current">
                    <path d="M0,0h30v30h-30z M10,10h10v10h-10z" />
                    <path d="M70,0h30v30h-30z M80,10h10v10h-10z" />
                    <path d="M0,70h30v30h-30z M10,80h10v10h-10z" />
                    <path d="M40,10h10v10h-10z M50,20h10v10h-10z M35,40h15v10h-15z M60,40h20v10h-20z M45,60h10v15h-10z" />
                    <path d="M70,70h10v10h-10z M90,70h10v10h-10z M80,85h15v10h-15z" />
                    <circle cx="50" cy="50" r="4" fill="#00C853" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Printable / Download Options */}
            <div className="flex gap-2 justify-center max-w-lg mx-auto print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-brand-card hover:border-[#00C853]/40 text-white font-semibold text-xs rounded-xl border border-emerald-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-emerald-500" /> Print Audit Receipt
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
