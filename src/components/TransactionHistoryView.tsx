import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Download, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  onSelectTx?: (txId: string) => void;
}

export function TransactionHistoryView({ transactions, onSelectTx }: TransactionHistoryViewProps) {
  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter networks unique options
  const networkOptions = ['all', ...new Set(transactions.map(t => t.network))];

  // Filtering Logic
  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.wallet.toLowerCase().includes(search.toLowerCase()) ||
      (tx.tx_hash && tx.tx_hash.toLowerCase().includes(search.toLowerCase()));

    const matchesNetwork = networkFilter === 'all' || tx.network === networkFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    return matchesSearch && matchesNetwork && matchesStatus;
  });

  // Pagination compute
  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const paginatedTx = filteredTx.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatHash = (hashStr: string) => {
    if (!hashStr) return 'N/A';
    return `${hashStr.substring(0, 6)}...${hashStr.substring(hashStr.length - 6)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-white">Secure Ledger Database</h2>
        <p className="text-xs text-gray-500">Query, verify, and filter official cryptographically authorized ledger history.</p>
      </div>

      {/* Query Filter Options Bar */}
      <div className="bg-brand-card p-4 rounded-xl border border-emerald-950/40 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Reference, Wallet, Hash..."
            className="w-full bg-brand-bg/50 border border-emerald-950/50 rounded-xl py-2 pl-9 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#00C853] text-xs font-mono"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Network dropdown */}
          <div className="flex items-center gap-1.5 bg-brand-bg/60 border border-emerald-950 px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={networkFilter}
              onChange={(e) => {
                setNetworkFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Networks</option>
              {networkOptions.filter(o => o !== 'all').map((net) => (
                <option key={net} value={net}>{net}</option>
              ))}
            </select>
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-1.5 bg-brand-bg/60 border border-emerald-950 px-3 py-1.5 rounded-xl text-xs text-gray-300">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Grid/Table */}
      <div className="bg-brand-card rounded-xl border border-emerald-950/40 shadow-xl overflow-hidden">
        {paginatedTx.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs flex flex-col items-center gap-2">
            <Search className="w-8 h-8 text-emerald-950" />
            <span>No transactions matching selected parameters found in database.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-emerald-950/50 text-[10px] font-mono text-gray-500 uppercase tracking-wider bg-brand-bg/20">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference ID</th>
                  <th className="py-3 px-4">Crypto Network</th>
                  <th className="py-3 px-4">Destination Wallet Address</th>
                  <th className="py-3 px-4">Sec Hash</th>
                  <th className="py-3 px-4">Amount ($)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/30 text-xs font-medium">
                {paginatedTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-brand-bg/30 transition-colors">
                    <td className="py-3.5 px-4 text-gray-400 whitespace-nowrap">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#00C853]">
                      {tx.id.substring(0, 10)}...
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {tx.network}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400 select-all max-w-[140px] truncate">
                      {tx.wallet}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-500 select-all">
                      {formatHash(tx.tx_hash)}
                    </td>
                    <td className={`py-3.5 px-4 font-mono font-bold whitespace-nowrap
                      ${tx.amount > 0 ? 'text-[#00C853]' : 'text-red-400'}
                    `}>
                      {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap
                        ${tx.status === 'completed' ? 'bg-[#00C853]/15 text-[#00C853]' : ''}
                        ${tx.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : ''}
                        ${tx.status === 'failed' ? 'bg-red-500/15 text-red-500' : ''}
                      `}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dynamic Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-emerald-950/50 bg-brand-bg/25 flex justify-between items-center text-xs">
            <span className="text-gray-500 font-mono">
              Showing page {currentPage} of {totalPages}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-emerald-950/60 rounded-lg hover:text-[#00C853] text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-emerald-950/60 rounded-lg hover:text-[#00C853] text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
