import React, { useState } from 'react';
import { X, Coins, Gem, ShoppingCart, Zap } from 'lucide-react';
import { PlayerCurrency, PlayerInventory, ShopItem } from '../types';
import { SHOP_ITEMS } from '../data/shopItems';

interface ShopProps {
  currency: PlayerCurrency;
  inventory: PlayerInventory;
  onPurchase: (itemId: string) => boolean;
  onClose: () => void;
}

type Tab = 'consumables' | 'upgrades';

export const Shop: React.FC<ShopProps> = ({ currency, inventory, onPurchase, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('consumables');

  const consumables = SHOP_ITEMS.filter(item => item.type === 'consumable');
  const upgrades = SHOP_ITEMS.filter(item => item.type === 'permanent');

  const isItemPurchased = (item: ShopItem): boolean => {
    switch (item.id) {
      case 'score-multiplier-1':
        return inventory.scoreMultiplierLevel >= 1;
      case 'score-multiplier-2':
        return inventory.scoreMultiplierLevel >= 2;
      case 'score-multiplier-3':
        return inventory.scoreMultiplierLevel >= 3;
      case 'starting-undo':
        return inventory.hasStartingUndo;
      case 'spool-upgrade':
        return inventory.hasSpoolUpgrade;
      case 'coin-magnet':
        return inventory.hasCoinMagnet;
      default:
        return false;
    }
  };

  const canAfford = (item: ShopItem): boolean => {
    return item.currency === 'coins'
      ? currency.coins >= item.price
      : currency.gems >= item.price;
  };

  const getConsumableCount = (itemId: string): number => {
    switch (itemId) {
      case 'extra-undo': return inventory.extraUndos;
      case 'freeze-time': return inventory.freezeTime;
      case 'conveyor-speed': return inventory.conveyorSpeed;
      case 'reroll-grid': return inventory.rerollGrid;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Shop</h2>
          </div>

          {/* Currency Display */}
          <div className="flex items-center gap-4 mr-12">
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold">{currency.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
              <Gem className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-bold">{currency.gems.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('consumables')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'consumables'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Consumables
            </div>
          </button>
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'upgrades'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              Permanent Upgrades
            </div>
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'consumables' ? consumables : upgrades).map(item => {
              const purchased = isItemPurchased(item);
              const affordable = canAfford(item);
              const consumableCount = item.type === 'consumable' ? getConsumableCount(item.id) : 0;

              return (
                <div
                  key={item.id}
                  className={`bg-slate-700/50 rounded-xl p-4 border-2 transition-all ${
                    purchased
                      ? 'border-green-500/50 bg-green-900/20'
                      : affordable
                      ? 'border-purple-500/50 hover:border-purple-400'
                      : 'border-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{item.icon}</div>
                      <div>
                        <h3 className="text-white font-bold">{item.name}</h3>
                        {item.type === 'consumable' && consumableCount > 0 && (
                          <p className="text-purple-300 text-sm">Owned: {consumableCount}</p>
                        )}
                      </div>
                    </div>
                    {purchased && item.type === 'permanent' && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        OWNED
                      </div>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm mb-4">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {item.currency === 'coins' ? (
                        <Coins className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Gem className="w-5 h-5 text-cyan-400" />
                      )}
                      <span className="text-white font-bold">{item.price}</span>
                    </div>

                    <button
                      onClick={() => onPurchase(item.id)}
                      disabled={!affordable || (purchased && item.type === 'permanent')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        !affordable || (purchased && item.type === 'permanent')
                          ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95'
                      }`}
                    >
                      {purchased && item.type === 'permanent' ? 'Purchased' : 'Buy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
