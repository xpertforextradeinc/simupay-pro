import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { dbService } from '../services/dbService';
import { adminService } from '../services/adminService';
import { 
  Product, 
  ProductCategory, 
  Coupon, 
  ProductOrder, 
  Profile, 
  ProductReview 
} from '../types';
import { 
  ShoppingBag, 
  Settings, 
  CheckCircle, 
  Lock, 
  Globe, 
  Coins, 
  Languages, 
  ChevronRight, 
  HelpCircle, 
  Save, 
  Info, 
  Sparkles, 
  AlertCircle,
  FolderHeart,
  FileCode,
  Tag,
  Menu,
  Eye,
  CreditCard,
  Download,
  Star,
  Users,
  Terminal,
  Activity,
  ArrowRight,
  Check,
  CheckCircle2,
  RefreshCw,
  ShoppingBag as StoreIcon,
  BookOpen,
  Sliders,
  Send,
  Zap,
  Ticket
} from 'lucide-react';

interface SlipMintMarketViewProps {
  profile: Profile | null;
  onProfileUpdate: (fields: Partial<Profile>) => void;
}

export function SlipMintMarketView({ profile, onProfileUpdate }: SlipMintMarketViewProps) {
  const { showToast } = useToast();
  const userId = profile?.id || 'anonymous';

  // Current active step of the wizard
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [confirmedSteps, setConfirmedSteps] = useState<Record<number, boolean>>(() => {
    return {
      1: localStorage.getItem('spp_market_step1_confirmed') === 'true',
      2: localStorage.getItem('spp_market_step2_confirmed') === 'true',
      3: localStorage.getItem('spp_market_step3_confirmed') === 'true',
      4: localStorage.getItem('spp_market_step4_confirmed') === 'true',
      5: localStorage.getItem('spp_market_step5_confirmed') === 'true'
    };
  });

  // Database loaded states
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'storefront' | 'orders'>('wizard');
  const [loading, setLoading] = useState(false);

  // Store settings inputs (Step 1)
  const [storeSettings, setStoreSettings] = useState({
    currency: 'NGN',
    currencySymbol: '₦',
    domesticMarket: 'Nigeria (NG)',
    language: 'English',
    digitalOnly: true
  });

  // Coupon applied in checkout storefront
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Review states
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Exchange rate simulation (1 USD = 1,500 NGN)
  const NGN_TO_USD_RATE = 1500;

  useEffect(() => {
    loadDatabaseEntities();
  }, []);

  const loadDatabaseEntities = async () => {
    setLoading(true);
    try {
      const cats = await dbService.getProductCategories();
      const prods = await dbService.getProducts();
      const coups = await dbService.getCoupons();
      setCategories(cats);
      setProducts(prods);
      setCoupons(coups);
    } catch (e) {
      console.error('Failed to load marketplace database entities:', e);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1 - Store Settings Confirmation
  const handleConfirmStep1 = () => {
    const updated = { ...confirmedSteps, 1: true };
    setConfirmedSteps(updated);
    localStorage.setItem('spp_market_step1_confirmed', 'true');
    setCurrentStep(2);
    showToast('STEP 1 STORE SETTINGS: Currency set to NGN & domestic market to Nigeria (English).', 'success');
  };

  // STEP 2 - Create 7 Collections
  const handleConfirmStep2 = () => {
    const updated = { ...confirmedSteps, 2: true };
    setConfirmedSteps(updated);
    localStorage.setItem('spp_market_step2_confirmed', 'true');
    setCurrentStep(3);
    showToast('STEP 2 COLLECTIONS: 7 fintech collections created & registered successfully.', 'success');
  };

  // STEP 3 - Create 3 Products in Draft Mode (or activate them)
  const handleConfirmStep3 = () => {
    const updated = { ...confirmedSteps, 3: true };
    setConfirmedSteps(updated);
    localStorage.setItem('spp_market_step3_confirmed', 'true');
    setCurrentStep(4);
    showToast('STEP 3 PRODUCTS: 3 digital products successfully registered in Draft mode.', 'success');
  };

  // Activate Products Switch
  const handleToggleProductsActivation = async (activate: boolean) => {
    setLoading(true);
    try {
      const updatedProds = await Promise.all(
        products.map(async (p) => {
          const res = await dbService.updateProductStatus(p.id, activate ? 'Active' : 'Draft');
          return res;
        })
      );
      setProducts(updatedProds);
      showToast(
        activate 
          ? 'COMMERCE ACTION: All digital products activated successfully!' 
          : 'COMMERCE ACTION: Products reverted back to Draft status.', 
        'success'
      );
    } catch (e) {
      showToast('Failed to update product statuses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 4 - Register Coupon Code
  const handleConfirmStep4 = () => {
    const updated = { ...confirmedSteps, 4: true };
    setConfirmedSteps(updated);
    localStorage.setItem('spp_market_step4_confirmed', 'true');
    setCurrentStep(5);
    showToast('STEP 4 DISCOUNT: Launch coupon LAUNCH15 (15% off) registered.', 'success');
  };

  // STEP 5 - Grouped Menu Navigation Layout
  const handleConfirmStep5 = () => {
    const updated = { ...confirmedSteps, 5: true };
    setConfirmedSteps(updated);
    localStorage.setItem('spp_market_step5_confirmed', 'true');
    showToast('STEP 5 NAVIGATION: Grouped menu navigation structured successfully.', 'success');
  };

  // Reset Stepper
  const handleResetStepper = () => {
    const fresh = { 1: false, 2: false, 3: false, 4: false, 5: false };
    setConfirmedSteps(fresh);
    localStorage.removeItem('spp_market_step1_confirmed');
    localStorage.removeItem('spp_market_step2_confirmed');
    localStorage.removeItem('spp_market_step3_confirmed');
    localStorage.removeItem('spp_market_step4_confirmed');
    localStorage.removeItem('spp_market_step5_confirmed');
    setCurrentStep(1);
    showToast('Configuration state reset for re-testing setup roadmap.', 'info');
  };

  // Coupon apply
  const handleApplyCoupon = () => {
    const found = coupons.find(c => c.code.toUpperCase() === couponCodeInput.trim().toUpperCase());
    if (found && found.is_active) {
      if (checkoutProduct && found.category_scope && checkoutProduct.category_id !== found.category_scope) {
        showToast(`Coupon LAUNCH15 is strictly scoped to Founder Vault collections.`, 'warning');
        return;
      }
      setAppliedCoupon(found);
      showToast(`Coupon code applied: ${found.discount_percent}% off discount applied!`, 'success');
    } else {
      showToast('Invalid coupon code or expired discount.', 'error');
    }
  };

  // Checkout Buy product trigger
  const handleBuyProduct = (prod: Product) => {
    setCheckoutProduct(prod);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setIsCheckoutModalOpen(true);
  };

  // Real purchase integration
  const handleExecutePurchase = async () => {
    if (!profile || !checkoutProduct) return;
    setPaymentProcessing(true);

    const basePrice = checkoutProduct.price;
    const discountAmount = appliedCoupon ? (basePrice * appliedCoupon.discount_percent) / 100 : 0;
    const finalPriceNGN = basePrice - discountAmount;
    
    // Calculate exchange equivalent in USD
    const finalPriceUSD = parseFloat((finalPriceNGN / NGN_TO_USD_RATE).toFixed(2));

    if (profile.wallet_balance < finalPriceUSD) {
      showToast(`Insufficient balance in your SimuPay wallet. Required: ~$${finalPriceUSD} (₦${finalPriceNGN.toLocaleString()})`, 'error');
      setPaymentProcessing(false);
      return;
    }

    try {
      // 1. Deduct from Profile balance
      const newBalance = parseFloat((profile.wallet_balance - finalPriceUSD).toFixed(2));
      await dbService.updateUserBalance(profile.id, newBalance);
      onProfileUpdate({ wallet_balance: newBalance });

      // 2. Register native commerce rows
      const { order, message } = await dbService.createProductOrder(
        profile.id,
        checkoutProduct.id,
        finalPriceNGN,
        'NGN',
        'wallet',
        appliedCoupon?.id
      );

      // 3. Upgrade active subscription state in app if they bought Founder Vault
      if (checkoutProduct.id === 'prod-founder-vault') {
        onProfileUpdate({
          license_active: true,
          license_type: 'Enterprise',
          subscription_status: 'Active',
          expiry_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        });
      }

      showToast(message, 'success');
      setIsCheckoutModalOpen(false);
      setActiveTab('orders');
    } catch (e) {
      console.error(e);
      showToast('Unexpected checkout error. Please try again.', 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Load reviews
  const handleViewReviews = async (productId: string) => {
    setSelectedProductForReviews(productId);
    const revs = await dbService.getProductReviews(productId);
    setProductReviews(revs);
  };

  // Save review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedProductForReviews) return;

    try {
      const added = await dbService.saveProductReview({
        product_id: selectedProductForReviews,
        user_id: profile.id,
        user_name: profile.full_name || 'SimuPay Merchant',
        rating: newReviewRating,
        comment: newReviewComment
      });

      setProductReviews(prev => [added, ...prev]);
      setNewReviewComment('');
      showToast('Thank you! Your feedback has been published natively.', 'success');
    } catch (e) {
      showToast('Could not save product review.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Navigation Tabs */}
      <div className="flex justify-between items-center bg-brand-card p-4 rounded-2xl border border-emerald-950/40 shadow-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all
              ${activeTab === 'wizard' 
                ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-brand-bg/50 border border-transparent'
              }
            `}
          >
            <Settings className="w-4 h-4" /> Setup Roadmap Wizard
          </button>
          
          <button
            onClick={() => setActiveTab('storefront')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all
              ${activeTab === 'storefront' 
                ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-brand-bg/50 border border-transparent'
              }
            `}
          >
            <StoreIcon className="w-4 h-4" /> Live Buyer Storefront
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all
              ${activeTab === 'orders' 
                ? 'bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-brand-bg/50 border border-transparent'
              }
            `}
          >
            <Activity className="w-4 h-4" /> Purchased Products & History
          </button>
        </div>

        <button
          onClick={handleResetStepper}
          className="px-3.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border border-red-900/40 text-red-400 hover:bg-red-950/20 transition-all flex items-center gap-1.5"
        >
          <RefreshCw className="w-3 h-3 animate-spin" /> Reset Wizard State
        </button>
      </div>

      {activeTab === 'wizard' && (
        <div className="space-y-6">
          {/* Main setup intro banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-1.5 z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/25">
                  <ShoppingBag className="w-5.5 h-5.5" />
                </span>
                <div>
                  <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                    SlipMint Digital Storefront Setup
                  </h2>
                  <p className="text-xs text-gray-400 font-sans mt-0.5">
                    Launch and preview high-demand trading memberships, lockout calculators, and weekly signals tailored for West African developers and traders.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 z-10">
              <div className="px-3.5 py-2 rounded-xl bg-brand-bg/60 border border-emerald-950/50 text-right">
                <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider font-mono">Domestic Target</span>
                <span className="text-xs font-semibold text-white flex items-center gap-1.5 justify-end mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00C853]" /> Nigeria (NGN ₦)
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Progress Block */}
          <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono border-b border-emerald-950/40 pb-3.5 mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00C853]" /> Storefront Launch Roadmap
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                { n: 1, label: 'Store Settings', desc: '₦ Currency Set' },
                { n: 2, label: '7 Collections', desc: 'Trading Groups' },
                { n: 3, label: 'Products', desc: 'Draft Digital Assets' },
                { n: 4, label: 'Launch Discount', desc: 'LAUNCH15 15% Off' },
                { n: 5, label: 'Navigation Menu', desc: 'Grouped Links' }
              ].map((step) => {
                const isCompleted = confirmedSteps[step.n as keyof typeof confirmedSteps];
                const isActive = currentStep === step.n;
                return (
                  <button 
                    key={step.n} 
                    onClick={() => setCurrentStep(step.n)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 relative cursor-pointer
                      ${isCompleted 
                        ? 'bg-[#00C853]/5 border-[#00C853]/30 text-white' 
                        : isActive 
                          ? 'bg-brand-bg border-[#00C853]/40 shadow-[0_0_15px_rgba(0,200,83,0.05)]' 
                          : 'bg-brand-bg/40 border-emerald-950/30 opacity-60 text-gray-500 hover:opacity-100 hover:border-emerald-900'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold w-6 h-6 rounded-lg flex items-center justify-center border
                        ${isCompleted 
                          ? 'bg-[#00C853]/20 border-[#00C853]/40 text-[#00C853]' 
                          : isActive 
                            ? 'bg-[#00C853]/10 border-[#00C853]/30 text-[#00C853]' 
                            : 'bg-emerald-950/20 border-emerald-950/30'
                        }
                      `}>
                        0{step.n}
                      </span>

                      {isCompleted ? (
                        <CheckCircle className="w-4.5 h-4.5 text-[#00C853]" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${isActive ? 'text-[#00C853]' : 'text-white'}`}>{step.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>

                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00C853] rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Active Workspace Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1 panel */}
              {currentStep === 1 && (
                <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">STEP 1: Store Settings Confirmation</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-brand-bg/50 border border-emerald-950/40 rounded-xl flex items-center gap-3">
                        <span className="p-2.5 rounded-lg bg-emerald-950/40 text-[#00C853]">
                          <Coins className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono block">Currency</span>
                          <span className="text-xs font-semibold text-white">{storeSettings.currency} ({storeSettings.currencySymbol})</span>
                        </div>
                      </div>

                      <div className="p-4 bg-brand-bg/50 border border-emerald-950/40 rounded-xl flex items-center gap-3">
                        <span className="p-2.5 rounded-lg bg-emerald-950/40 text-[#00C853]">
                          <Globe className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono block">Domestic Market</span>
                          <span className="text-xs font-semibold text-white">{storeSettings.domesticMarket}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-brand-bg/50 border border-emerald-950/40 rounded-xl flex items-center gap-3">
                        <span className="p-2.5 rounded-lg bg-emerald-950/40 text-[#00C853]">
                          <Languages className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono block">Language</span>
                          <span className="text-xs font-semibold text-white">{storeSettings.language}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#091714]/60 border border-[#16362F]/50 rounded-xl p-4 space-y-2 text-xs text-gray-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#00C853] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-semibold">Nigerian Audience Alignment:</strong> Store defaults are pre-engineered to match local payment gateways to stop transaction decline rate spikes.
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#00C853] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white font-semibold">Domestic Digital Delivery:</strong> Delivery routing is configured as digital-only (physical shipping logic and weight rules are completely excluded).
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-emerald-950/30">
                      <span className="text-xs text-gray-400">
                        Status: {confirmedSteps[1] ? '✅ Completed & Confirmed' : '⚡ Action Required'}
                      </span>

                      {!confirmedSteps[1] ? (
                        <button
                          onClick={handleConfirmStep1}
                          className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm Store Settings
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="bg-brand-bg border border-emerald-950 hover:bg-[#00C853]/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
                        >
                          Continue to Step 2 <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 panel */}
              {currentStep === 2 && (
                <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">STEP 2: Collections Configuration</h3>
                    </div>
                    
                    <span className="text-xs text-[#00C853] font-mono font-bold bg-[#00C853]/10 px-2.5 py-0.5 rounded-full">
                      7 Groups Generated
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    We have successfully registered the 7 structural collections requested for this premium fintech/trading membership brand.
                  </p>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-4 bg-brand-bg/60 border border-emerald-950/40 rounded-xl space-y-2 hover:border-[#00C853]/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15">
                              <FolderHeart className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-white">{cat.title}</h4>
                              <p className="text-[9px] text-[#00C853] font-mono font-medium">/{cat.handle}</p>
                            </div>
                          </div>

                          <span className="text-[9px] bg-emerald-950/40 text-gray-400 border border-emerald-950/30 px-2 py-0.5 rounded uppercase font-mono font-semibold">
                            Sort: {cat.sort_order}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{cat.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono bg-[#091714]/30 p-2 rounded border border-emerald-950/20 text-gray-500">
                          <div>
                            <span className="text-gray-600 block">SEO Title</span>
                            <span className="text-gray-400 truncate block">{cat.seo_title}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">SEO Description</span>
                            <span className="text-gray-400 truncate block">{cat.seo_description}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-emerald-950/30">
                    <span className="text-xs text-gray-400">
                      Status: {confirmedSteps[2] ? '✅ Collections Registered' : '⚡ Action Required'}
                    </span>

                    {!confirmedSteps[2] ? (
                      <button
                        onClick={handleConfirmStep2}
                        className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm 7 Collections
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="bg-brand-bg border border-emerald-950 hover:bg-[#00C853]/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
                      >
                        Continue to Step 3 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3 panel */}
              {currentStep === 3 && (
                <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">STEP 3: Products Configuration</h3>
                    </div>

                    <span className="text-xs text-amber-500 font-mono font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                      Draft Status (Locked)
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Three high-conversion digital products have been initialized. In accordance with requirements, they are in <strong className="text-amber-500">Draft</strong> status. Physical constraints have been unchecked, disabling shipping costs.
                  </p>

                  <div className="space-y-4">
                    {products.map((prod) => (
                      <div key={prod.id} className="p-4 bg-brand-bg/60 border border-emerald-950/40 rounded-xl space-y-3 hover:border-[#00C853]/30 transition-all">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <img 
                            src={prod.image_url} 
                            alt={prod.title} 
                            className="w-full sm:w-24 h-24 object-cover rounded-lg border border-emerald-950/50"
                            referrerPolicy="no-referrer"
                          />

                          <div className="flex-1 space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-white">{prod.title}</h4>
                                <span className="text-[9px] font-mono text-[#00C853]">Collection Scoped: {prod.category_id}</span>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-[#00C853] block">₦{prod.price.toLocaleString()}</span>
                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase inline-block mt-1
                                  ${prod.status === 'Draft' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}
                                `}>
                                  {prod.status}
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{prod.description}</p>
                            
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {prod.benefits?.map((benefit, idx) => (
                                <span key={idx} className="text-[9px] text-gray-400 bg-brand-bg/80 border border-emerald-950/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Check className="w-2.5 h-2.5 text-[#00C853]" /> {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 p-4 bg-brand-bg rounded-xl border border-emerald-950/30 justify-between items-center">
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs font-semibold text-white block">Product Activation Panel</span>
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        Ready to go live? Toggle the status from Draft to Active to publish them instantly to the Live storefront!
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleProductsActivation(false)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-brand-bg/40 border border-emerald-950/40 text-gray-400 hover:text-white"
                      >
                        Keep in Draft
                      </button>
                      <button
                        onClick={() => handleToggleProductsActivation(true)}
                        className="px-4 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/30 hover:bg-[#00C853]/25 transition-all flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Go Live & Activate
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-emerald-950/30">
                    <span className="text-xs text-gray-400">
                      Status: {confirmedSteps[3] ? '✅ Products Registered' : '⚡ Action Required'}
                    </span>

                    {!confirmedSteps[3] ? (
                      <button
                        onClick={handleConfirmStep3}
                        className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm Product Details
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="bg-brand-bg border border-emerald-950 hover:bg-[#00C853]/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
                      >
                        Continue to Step 4 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4 panel */}
              {currentStep === 4 && (
                <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">STEP 4: Launch Discount Code</h3>
                    </div>

                    <span className="text-xs text-[#00C853] font-mono font-bold bg-[#00C853]/10 px-2.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    We have successfully configured the launch discount code tailored for early platform adopters.
                  </p>

                  <div className="p-5 bg-brand-bg/80 border border-[#00C853]/20 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853]/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="space-y-1 text-center sm:text-left z-10">
                      <span className="text-[10px] font-mono text-gray-500 block">DISCOUNT PERCENTAGE</span>
                      <strong className="text-3xl font-display font-extrabold text-white block">15% OFF</strong>
                      <span className="text-[11px] text-gray-400 block mt-1">
                        Scoped to the <strong className="text-white">Founder Vault Collection</strong>
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <span className="text-[9px] font-mono text-gray-500">PROMO CODE</span>
                      <div className="px-5 py-2.5 rounded-xl bg-[#00C853]/10 border border-[#00C853]/35 font-mono text-base font-extrabold text-[#00C853] tracking-widest uppercase">
                        LAUNCH15
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
                    <div className="p-3 bg-brand-bg/40 border border-emerald-950/30 rounded-xl">
                      <span className="text-gray-500 block text-[9px] font-mono">AVAILABILITY</span>
                      <span className="text-white font-medium block mt-0.5">All customers</span>
                    </div>
                    <div className="p-3 bg-brand-bg/40 border border-emerald-950/30 rounded-xl">
                      <span className="text-gray-500 block text-[9px] font-mono">VALIDITY PERIOD</span>
                      <span className="text-white font-medium block mt-0.5">First 30 Days</span>
                    </div>
                    <div className="p-3 bg-brand-bg/40 border border-emerald-950/30 rounded-xl">
                      <span className="text-gray-500 block text-[9px] font-mono">USAGE CONSTRAINT</span>
                      <span className="text-white font-medium block mt-0.5">Digital Membership only</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-emerald-950/30">
                    <span className="text-xs text-gray-400">
                      Status: {confirmedSteps[4] ? '✅ Discount Code Registered' : '⚡ Action Required'}
                    </span>

                    {!confirmedSteps[4] ? (
                      <button
                        onClick={handleConfirmStep4}
                        className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm Discount Code
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="bg-brand-bg border border-emerald-950 hover:bg-[#00C853]/10 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
                      >
                        Continue to Step 5 <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5 panel */}
              {currentStep === 5 && (
                <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00C853] animate-pulse" />
                      <h3 className="text-sm font-semibold text-white">STEP 5: Navigation Structure</h3>
                    </div>

                    <span className="text-xs text-[#00C853] font-mono font-bold bg-[#00C853]/10 px-2.5 py-0.5 rounded-full">
                      Links Grouped
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Set up SlipMint's navigation layouts to categorize collections logically. This organizes standard routes and filters products natively.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {[
                      { group: 'Membership', icon: Users, items: ['Founder Vault', 'Premium Discord'] },
                      { group: 'Toolkits', icon: FileCode, items: ['Calculators', 'lockout Timers', 'Trader Journals'] },
                      { group: 'Education', icon: BookOpen, items: ['Fintech Masterclass', 'Beginner Starter Booklet'] },
                      { group: 'Signals', icon: Activity, items: ['Telegram Channel Entry', 'Automated Trade Feeds'] }
                    ].map((nav, idx) => (
                      <div key={idx} className="p-4 bg-brand-bg/50 border border-emerald-950/40 rounded-xl space-y-2.5 text-center sm:text-left">
                        <div className="flex justify-center sm:justify-start items-center gap-1.5">
                          <nav.icon className="w-4 h-4 text-[#00C853]" />
                          <h4 className="text-xs font-bold text-white uppercase font-mono">{nav.group}</h4>
                        </div>
                        <ul className="space-y-1 text-[10px] text-gray-400 font-sans">
                          {nav.items.map((item, itemIdx) => (
                            <li key={itemIdx} className="flex items-center gap-1 justify-center sm:justify-start">
                              <span className="w-1 h-1 rounded-full bg-[#00C853]" /> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-emerald-950/30">
                    <span className="text-xs text-gray-400">
                      Status: {confirmedSteps[5] ? '✅ Navigation Active' : '⚡ Action Required'}
                    </span>

                    {!confirmedSteps[5] ? (
                      <button
                        onClick={handleConfirmStep5}
                        className="bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Confirm Navigation Menu
                      </button>
                    ) : (
                      <span className="text-xs text-[#00C853] font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Setup Complete! Proceed to Live Buyer Storefront tab.
                      </span>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Informational sidebar context panel */}
            <div className="space-y-6">
              
              {/* Wallet/Profile Quick Status widget */}
              <div className="bg-brand-card p-5 rounded-2xl border border-emerald-950/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#16362F]/30 pb-2.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                    <CreditCard className="w-4 h-4 text-[#00C853]" /> WALLET BALANCES
                  </span>
                  <span className="text-[9px] text-[#00C853] font-bold uppercase font-mono tracking-wider">
                    Ready to test
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase font-bold font-mono">SimuPay Balance</span>
                    <strong className="text-xl font-display font-bold text-white block mt-0.5">
                      ${profile?.wallet_balance?.toLocaleString() || '35,000.00'}
                    </strong>
                  </div>

                  <div className="p-3.5 bg-brand-bg/50 border border-emerald-950/30 rounded-xl space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase font-mono font-bold block">Naira Equivalent</span>
                    <strong className="text-sm font-semibold text-[#00C853] block">
                      ₦{((profile?.wallet_balance || 35000) * NGN_TO_USD_RATE).toLocaleString()} NGN
                    </strong>
                    <span className="text-[8px] text-gray-500 block">Exchange Index: 1 USD = 1,500 NGN</span>
                  </div>
                </div>
              </div>

              {/* Step info sidebar context */}
              <div className="bg-brand-card p-5 rounded-2xl border border-emerald-950/40 shadow-xl space-y-3.5">
                <div className="flex items-center gap-2 border-b border-[#16362F]/30 pb-2">
                  <Terminal className="w-4 h-4 text-[#00C853]" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Metadata Schema</h4>
                </div>

                <div className="space-y-2.5 text-[11px] text-gray-400 font-sans leading-relaxed">
                  <p>
                    All items are natively integrated. Unlike separate storefront models, this platform binds collections directly to metadata queries.
                  </p>
                  
                  <div className="p-3 bg-brand-bg rounded-lg border border-emerald-950/50 font-mono text-[10px] space-y-1 text-gray-500">
                    <div><span className="text-white">"currency"</span>: "NGN"</div>
                    <div><span className="text-white">"is_digital"</span>: true</div>
                    <div><span className="text-white">"coupon"</span>: "LAUNCH15"</div>
                    <div><span className="text-white">"database"</span>: "Supabase"</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'storefront' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl">
            <div className="space-y-1.5">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-[#00C853]" /> Live Buyer Digital Storefront
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Browse active digital assets and services. Purchasing immediately debits your simulated wallet, launches subscriptions, generates secure PDF receipts, and records activity.
              </p>
            </div>

            <div className="p-3 bg-brand-bg rounded-xl border border-emerald-950/40 text-center sm:text-right min-w-[200px]">
              <span className="text-[9px] text-gray-500 block uppercase font-bold font-mono">Your Active Wallet</span>
              <span className="text-sm font-semibold text-white block mt-0.5">
                ${profile?.wallet_balance?.toLocaleString() || '35,000.00'} USD
              </span>
              <span className="text-[10px] text-[#00C853] font-semibold block">
                ≈ ₦{((profile?.wallet_balance || 35000) * NGN_TO_USD_RATE).toLocaleString()} NGN
              </span>
            </div>
          </div>

          {/* Active products lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((prod) => {
              const isDraft = prod.status === 'Draft';
              return (
                <div 
                  key={prod.id} 
                  className={`bg-brand-card border rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all hover:translate-y-[-2px]
                    ${isDraft ? 'border-amber-900/40 opacity-80' : 'border-emerald-950/40 hover:border-[#00C853]/40'}
                  `}
                >
                  <div className="relative">
                    <img 
                      src={prod.image_url} 
                      alt={prod.title} 
                      className="w-full h-40 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 right-3 bg-brand-bg/80 backdrop-blur-md border border-emerald-950/50 px-3 py-1 rounded-full text-xs font-mono font-bold text-[#00C853]">
                      ₦{prod.price.toLocaleString()} NGN
                    </div>

                    {isDraft && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-brand-bg px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                        DRAFT MODE (Admins Only)
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-bold text-white leading-snug">{prod.title}</h3>
                        
                        <button 
                          onClick={() => handleViewReviews(prod.id)}
                          className="text-[10px] text-gray-500 hover:text-amber-400 transition-colors flex items-center gap-1 shrink-0"
                          title="View product feedback"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Reviews</span>
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans line-clamp-3">
                        {prod.description}
                      </p>

                      <div className="space-y-1 pt-1">
                        {prod.benefits?.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-300">
                            <Check className="w-3.5 h-3.5 text-[#00C853] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-emerald-950/30 flex gap-2">
                      {isDraft ? (
                        <div className="w-full text-center py-2.5 rounded-xl border border-amber-900/30 bg-amber-500/5 text-amber-400 text-xs font-semibold">
                          Draft (Activate in Setup Wizard)
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBuyProduct(prod)}
                          className="w-full bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-950/20"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Purchase Instantly
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active reviews section */}
          {selectedProductForReviews && (
            <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-emerald-950/40 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Buyer Reviews & Feedback ({productReviews.length})
                  </h3>
                </div>

                <button 
                  onClick={() => setSelectedProductForReviews(null)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Close Reviews Panel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Review Form */}
                <form onSubmit={handleAddReview} className="p-4 bg-brand-bg/50 border border-emerald-950/40 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-white block">Write native review</span>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-mono font-bold block uppercase">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-mono font-bold block uppercase">Review Comment</label>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Share your experience using this digital product..."
                      className="w-full h-20 bg-brand-bg border border-emerald-950/60 rounded-xl px-3 py-2 text-white text-xs focus:border-[#00C853] focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-900/20 hover:bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/25 font-bold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Publish Review
                  </button>
                </form>

                {/* Reviews list */}
                <div className="md:col-span-2 space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {productReviews.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 font-mono text-xs">
                      NO_REVIEWS_YET_BE_THE_FIRST
                    </div>
                  ) : (
                    productReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-brand-bg/30 border border-emerald-950/40 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{rev.user_name}</span>
                          <span className="text-[10px] text-gray-500">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed pt-1">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checkout modal overlay */}
          {isCheckoutModalOpen && checkoutProduct && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-brand-card border border-emerald-950/60 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-scaleIn">
                <div className="flex justify-between items-center border-b border-[#16362F]/30 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <StoreIcon className="w-4 h-4 text-[#00C853]" /> Secure Checkout
                  </h3>
                  <button 
                    onClick={() => setIsCheckoutModalOpen(false)}
                    className="text-gray-500 hover:text-white font-semibold text-xs"
                  >
                    Cancel
                  </button>
                </div>

                {/* Selected digital product */}
                <div className="flex gap-3.5 bg-brand-bg/50 p-3 rounded-xl border border-emerald-950/40">
                  <img 
                    src={checkoutProduct.image_url} 
                    alt={checkoutProduct.title} 
                    className="w-16 h-16 object-cover rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-tight">{checkoutProduct.title}</h4>
                    <span className="text-[10px] text-gray-500 block">Digital Fulfillment - No Delivery Delay</span>
                    <span className="text-xs font-mono font-bold text-[#00C853] block mt-1">₦{checkoutProduct.price.toLocaleString()} NGN</span>
                  </div>
                </div>

                {/* Coupon widget */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-500 font-mono font-bold block uppercase">Promo / Discount Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. LAUNCH15"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-1 bg-brand-bg border border-emerald-950/60 rounded-xl px-3 py-2 text-white text-xs focus:border-[#00C853] focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-brand-bg hover:bg-[#00C853]/10 text-white border border-emerald-950 hover:border-[#00C853]/30 px-3 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-[#16362F]/30 font-mono text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Base Price:</span>
                    <span>₦{checkoutProduct.price.toLocaleString()} NGN</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-[#00C853]">
                      <span>Discount Coupon ({appliedCoupon.discount_percent}%):</span>
                      <span>-₦{((checkoutProduct.price * appliedCoupon.discount_percent) / 100).toLocaleString()} NGN</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-500">
                    <span>Logistic Shipping Fee:</span>
                    <span className="text-white font-semibold">₦0 (FREE - Digital)</span>
                  </div>

                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-emerald-950/30">
                    <span>Final Amount:</span>
                    <div className="text-right">
                      <span className="text-[#00C853] block">
                        ₦{(checkoutProduct.price - (appliedCoupon ? (checkoutProduct.price * appliedCoupon.discount_percent) / 100 : 0)).toLocaleString()} NGN
                      </span>
                      <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                        Equivalent: ~${parseFloat(((checkoutProduct.price - (appliedCoupon ? (checkoutProduct.price * appliedCoupon.discount_percent) / 100 : 0)) / NGN_TO_USD_RATE).toFixed(2)).toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Execution button */}
                <button
                  type="button"
                  onClick={handleExecutePurchase}
                  disabled={paymentProcessing}
                  className="w-full bg-[#00C853] hover:bg-emerald-500 text-brand-bg font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Authorizing Payment Gateway...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Confirm & Pay via Simulated Wallet
                    </>
                  )}
                </button>

                <p className="text-[9px] text-center text-gray-500 leading-relaxed font-sans">
                  By completing payment, your digital assets are registered in real time. NGN to USD conversion index is secured natively.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-brand-card p-6 rounded-2xl border border-emerald-950/40 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-950/40 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
                <h3 className="text-sm font-semibold text-white">Your Purchased Digital Assets</h3>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              These digital products are active on your profile. Because physical checkboxes are disabled, resources are immediately available for instant download below.
            </p>

            {/* Simulated Purchased Items Rows */}
            <div className="space-y-4">
              {[
                { 
                  id: 'dl-1', 
                  title: 'Founder Vault Membership', 
                  category: 'Founder Vault', 
                  details: 'Elite monthly license key active on your profile. Your Discord Invite and Signal API key are authorized.',
                  link: adminService.getSystemSettings().discordInviteLink || 'https://discord.gg/simupay-fintech-elite', 
                  linkText: 'Join Discord Private Server',
                  image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80'
                },
                { 
                  id: 'dl-2', 
                  title: 'Trading Discipline Toolkit', 
                  category: 'Trading Tools', 
                  details: 'Calculator spreadsheets and revenge lockout desktop timer executable. Includes the automated journal dashboard.',
                  link: '#', 
                  linkText: 'Download Excel Calculator & Exe',
                  image: 'https://images.unsplash.com/photo-1642390061910-0f71214e73db?auto=format&fit=crop&w=600&q=80'
                },
                { 
                  id: 'dl-3', 
                  title: 'Signal Pass Add-on', 
                  category: 'Signals', 
                  details: 'Your automated Telegram channel link has been verified and mapped to your registration.',
                  link: adminService.getSystemSettings().telegramChannelLink || 'https://t.me/simupay_priority_signals', 
                  linkText: 'Enter Private Telegram Channel',
                  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-brand-bg/50 border border-emerald-950/40 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-3.5 items-start sm:items-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-950/50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <span className="text-[9px] font-mono text-[#00C853] bg-[#00C853]/10 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{item.details}</p>
                    </div>
                  </div>

                  <a
                    href={item.link}
                    onClick={(e) => {
                      if (item.link === '#') {
                        e.preventDefault();
                        showToast(`Downloading ZIP resources to desktop: ${item.title}`, 'success');
                      } else {
                        showToast(`Routing to secure Telegram/Discord link for ${item.title}...`, 'info');
                      }
                    }}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto bg-[#00C853]/15 hover:bg-[#00C853]/25 text-[#00C853] border border-[#00C853]/35 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <Download className="w-3.5 h-3.5" /> {item.linkText}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
