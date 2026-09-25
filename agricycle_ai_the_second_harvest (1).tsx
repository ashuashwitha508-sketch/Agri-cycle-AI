import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Recycle, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  BarChart3, 
  Layers, 
  PlusCircle, 
  Thermometer, 
  Droplets, 
  Truck, 
  MapPin, 
  Upload, 
  Check, 
  Edit3, 
  X, 
  Info, 
  Play, 
  ChevronRight, 
  Search, 
  Leaf, 
  Box, 
  Activity,
  Zap,
  HelpCircle
} from 'lucide-react';

const INITIAL_BATCHES = [
  {
    id: 'BATCH-001',
    crop: 'Tomato',
    quantity: 500,
    unit: 'kg',
    harvestDaysAgo: 2,
    storageCondition: 'Open Shed',
    temperature: 32,
    humidity: 75,
    transportHours: 8,
    demand: 'Medium',
    location: 'Telangana',
    goal: 'Maximize profit before spoilage',
    risk: 'HIGH',
    urgency: 'CRITICAL',
    action: 'SELL NOW',
    confidence: 92,
    shelfLifeRemaining: '1 - 2 Days',
    reasons: [
      'High ambient temperature (32°C) accelerates ethylene production in tomatoes',
      'Harvested 2 days ago in non-refrigerated storage nearing rot threshold',
      'Transport time of 8 hours will further degrade firm quality'
    ],
    nextStep: 'Dispatch immediately to local wholesale mandis or nearby urban markets.',
    wastePathway: {
      type: 'Damaged / Overripe Tomato Waste',
      use: 'Bio-gas Generation or Vermicomposting',
      benefit: 'Prevents landfill methane; converts acidic waste into rich organic fertilizer.'
    },
    approvalStatus: 'ACCEPTED', // PENDING, ACCEPTED, EDITED, REJECTED
    humanNotes: 'Dispatched to Bowenpally Wholesale Market.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'BATCH-002',
    crop: 'Mango (Alphonso)',
    quantity: 300,
    unit: 'kg',
    harvestDaysAgo: 1,
    storageCondition: 'Ambient Shade',
    temperature: 25,
    humidity: 60,
    transportHours: 12,
    demand: 'High',
    location: 'Mahabubnagar',
    goal: 'Value addition',
    risk: 'MEDIUM',
    urgency: 'HIGH',
    action: 'PROCESS FIRST',
    confidence: 88,
    shelfLifeRemaining: '3 - 4 Days',
    reasons: [
      'High market demand for pulp/juices yields higher margin than raw bulk sale',
      'Fruit firmness allows immediate processing without degradation',
      'Long transport duration (12h) increases risk of bruising during raw transit'
    ],
    nextStep: 'Send to local FPO pulp-processing center to convert into shelf-stable mango pulp.',
    wastePathway: {
      type: 'Mango Peels & Seeds (Kernels)',
      use: 'Pectin Extraction / Seed Fat Oil / Bio-composite',
      benefit: 'High-value byproduct potential for industrial cosmetics and starch replacement.'
    },
    approvalStatus: 'PENDING',
    humanNotes: '',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'BATCH-003',
    crop: 'Onion (Red)',
    quantity: 1000,
    unit: 'kg',
    harvestDaysAgo: 1,
    storageCondition: 'Ventilated Dry Store',
    temperature: 20,
    humidity: 45,
    transportHours: 4,
    demand: 'Low',
    location: 'Nashik / Local Hub',
    goal: 'Wait for price surge',
    risk: 'LOW',
    urgency: 'LOW',
    action: 'STORE',
    confidence: 95,
    shelfLifeRemaining: '30 - 45 Days',
    reasons: [
      'Optimal dry ventilated storage with low relative humidity (45%)',
      'Red onions have high dry matter and extended physiological dormant period',
      'Current market prices are sluggish; storing captures anticipated 20% price hike next month'
    ],
    nextStep: 'Store in elevated wooden racks with proper cross-ventilation and monitor weekly.',
    wastePathway: {
      type: 'Dry Onion Skins & Outer Husks',
      use: 'Natural Textile Dye & Biomass Ash',
      benefit: 'Flavonoid-rich eco-friendly dye pigment for natural fibers.'
    },
    approvalStatus: 'ACCEPTED',
    humanNotes: 'Moved to ventilated warehouse rack 4B.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

// Crop perishability database for rule engine calculation
const CROP_KNOWLEDGE = {
  tomato: { perishability: 'HIGH', maxTemp: 25, maxHumidity: 70, baseShelf: 5 },
  mango: { perishability: 'MEDIUM', maxTemp: 26, maxHumidity: 65, baseShelf: 7 },
  onion: { perishability: 'LOW', maxTemp: 30, maxHumidity: 60, baseShelf: 60 },
  potato: { perishability: 'LOW', maxTemp: 25, maxHumidity: 70, baseShelf: 90 },
  banana: { perishability: 'HIGH', maxTemp: 22, maxHumidity: 75, baseShelf: 4 },
  spinach: { perishability: 'CRITICAL', maxTemp: 18, maxHumidity: 80, baseShelf: 2 },
  chili: { perishability: 'MEDIUM', maxTemp: 28, maxHumidity: 60, baseShelf: 14 },
  apple: { perishability: 'LOW', maxTemp: 20, maxHumidity: 70, baseShelf: 45 },
  grape: { perishability: 'HIGH', maxTemp: 20, maxHumidity: 80, baseShelf: 6 }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analyze' | 'waste' | 'history'
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [selectedBatchForModal, setSelectedBatchForModal] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'accept' | 'edit' | 'reject'
  const [editForm, setEditForm] = useState({ action: '', notes: '' });
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form State for Batch Analysis
  const [formData, setFormData] = useState({
    crop: 'Tomato',
    quantity: '500',
    unit: 'kg',
    harvestDaysAgo: '2',
    storageCondition: 'Open Shed',
    temperature: '32',
    humidity: '75',
    transportHours: '8',
    demand: 'Medium',
    location: 'Telangana',
    goal: 'Avoid losses & sell fast',
    imageUploaded: false,
    imageFileName: ''
  });

  // Missing data warnings state
  const [missingDataWarnings, setMissingDataWarnings] = useState([]);

  // Standalone Waste Matcher Form
  const [wasteForm, setWasteForm] = useState({
    wasteType: 'Tomato Pomace / Overripe Peel',
    quantity: '200',
    unit: 'kg',
    cropSource: 'Tomato Processing',
    location: 'Telangana',
    processingAccess: 'Composting Pit & Bio-gas digester nearby'
  });
  const [wasteResult, setWasteResult] = useState(null);

  const runDecisionEngine = (data) => {
    const cropKey = (data.crop || '').toLowerCase().split(' ')[0];
    const cropInfo = CROP_KNOWLEDGE[cropKey] || { perishability: 'MEDIUM', maxTemp: 25, maxHumidity: 70, baseShelf: 10 };

    const temp = parseFloat(data.temperature) || 25;
    const hum = parseFloat(data.humidity) || 60;
    const daysAgo = parseFloat(data.harvestDaysAgo) || 1;
    const transHours = parseFloat(data.transportHours) || 4;
    const demand = data.demand || 'Medium';

    // Risk calculation points
    let riskScore = 0; // 0 to 10
    let reasons = [];

    // Harvest age factor
    if (daysAgo >= 3) {
      riskScore += 3;
      reasons.push(`Harvested ${daysAgo} days ago without cold chain significantly depletes baseline freshness.`);
    } else if (daysAgo >= 2) {
      riskScore += 2;
      reasons.push(`2 days elapsed since harvest requires urgent dispatch.`);
    }

    // Temperature factor
    if (temp > cropInfo.maxTemp) {
      riskScore += 3;
      reasons.push(`Storage temperature (${temp}°C) exceeds recommended peak threshold (${cropInfo.maxTemp}°C), hastening respiration.`);
    }

    // Humidity factor
    if (hum > cropInfo.maxHumidity && cropInfo.perishability !== 'CRITICAL') {
      riskScore += 2;
      reasons.push(`Relative humidity (${hum}%) creates fungal / mold risk for ${data.crop}.`);
    }

    // Perishability base weight
    if (cropInfo.perishability === 'HIGH' || cropInfo.perishability === 'CRITICAL') {
      riskScore += 2;
      reasons.push(`${data.crop} is inherently high-perishability crop with fast soft rot progression.`);
    }

    // Determine Risk Level
    let risk = 'LOW';
    let urgency = 'LOW';
    if (riskScore >= 6) {
      risk = 'HIGH';
      urgency = transHours > 6 ? 'CRITICAL' : 'HIGH';
    } else if (riskScore >= 3) {
      risk = 'MEDIUM';
      urgency = 'MEDIUM';
    }

    // Determine Action
    let action = 'STORE';
    if (risk === 'HIGH') {
      action = demand === 'High' || demand === 'Medium' ? 'SELL NOW' : 'PROCESS FIRST';
    } else if (risk === 'MEDIUM') {
      action = demand === 'High' ? 'SELL NOW' : 'PROCESS FIRST';
    } else {
      action = demand === 'Low' ? 'STORE' : 'SELL NOW';
    }

    // Estimated Remaining Shelf Life
    let remDays = Math.max(1, Math.round(cropInfo.baseShelf - daysAgo * 1.5 - (temp > 28 ? 2 : 0)));
    let shelfLifeRemaining = `${remDays} - ${remDays + 2} Days`;
    if (remDays <= 1) shelfLifeRemaining = 'Less than 24 Hours';

    // Immediate Next Step
    let nextStep = '';
    if (action === 'SELL NOW') {
      nextStep = `Immediate sale required. Transport to nearest district mandi within ${Math.min(transHours, 12)} hours before skin softens.`;
    } else if (action === 'PROCESS FIRST') {
      nextStep = `Divert batch to local FPO facility or processor to turn raw ${data.crop} into dehydrated / pulped value products.`;
    } else {
      nextStep = `Transfer batch to well-ventilated shade storage on elevated crates; inspect every 48 hours.`;
    }

    // Waste Pathway Recommendation
    const wastePathwayMap = {
      tomato: {
        type: 'Crushed/Spoiled Tomato Pulp & Seeds',
        use: 'Anaerobic Biogas Digestion or Vermicomposting',
        benefit: 'Yields rich bio-slurry fertilizer while preventing soil acidification.'
      },
      mango: {
        type: 'Mango Seed Kernels & Fibrous Waste',
        use: 'Animal Feed Compound & Seed Butter Oil',
        benefit: 'High protein-starch content suitable for cattle feed blending.'
      },
      onion: {
        type: 'Outer Skins & Molded Layers',
        use: 'Mulch / Organic Biochar Production',
        benefit: 'Rich in antioxidants & quercetin; converts to soil-enriching biochar.'
      },
      banana: {
        type: 'Banana Peels & Stems',
        use: 'Bio-fiber Packaging or Cattle Feed',
        benefit: 'High potassium and organic fiber for livestock supplement.'
      }
    };

    const wastePathway = wastePathwayMap[cropKey] || {
      type: `Unusable ${data.crop} Crop Residue`,
      use: 'Aerobic Composting / Bio-organic Manure',
      benefit: 'Returns essential nitrogen & phosphorus back into farm soil ecosystem.'
    };

    // Calculate Confidence
    let confidence = 90;
    if (!data.temperature || !data.humidity) confidence -= 15;
    if (!data.harvestDaysAgo) confidence -= 20;

    return {
      risk,
      urgency,
      action,
      confidence: Math.max(50, confidence),
      shelfLifeRemaining,
      reasons: reasons.slice(0, 3),
      nextStep,
      wastePathway
    };
  };

  const handleAnalyzeBatch = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Validate missing fields
    const warnings = [];
    if (!formData.harvestDaysAgo) warnings.push('Harvest date missing - reduces prediction accuracy.');
    if (!formData.temperature) warnings.push('Storage temperature not provided - assuming room temperature 25°C.');
    setMissingDataWarnings(warnings);

    // Run fallback rule engine first
    const ruleResult = runDecisionEngine(formData);

    let finalResult = { ...ruleResult };

    // If Gemini API Key provided, attempt rich LLM reasoning enhancement
    if (geminiApiKey.trim()) {
      try {
        const prompt = `Act as AgriCycle AI, an expert post-harvest agricultural decision engine. 
Batch Input:
- Crop: ${formData.crop}
- Quantity: ${formData.quantity} ${formData.unit}
- Harvested: ${formData.harvestDaysAgo} days ago
- Storage: ${formData.storageCondition}, Temp: ${formData.temperature}°C, Humidity: ${formData.humidity}%
- Transport Time: ${formData.transportHours} hrs
- Local Demand: ${formData.demand}
- Location: ${formData.location}

Provide a structured assessment JSON matching:
{
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "action": "SELL NOW" | "PROCESS FIRST" | "STORE",
  "confidence": number,
  "shelfLifeRemaining": string,
  "reasons": [string, string, string],
  "nextStep": string,
  "wastePathway": { "type": string, "use": string, "benefit": string }
}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const json = await res.json();
        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            finalResult = { ...ruleResult, ...parsed };
          }
        }
      } catch (err) {
        console.warn('Gemini API call skipped or failed, using rule-based decision engine:', err);
      }
    }

    // Simulate delay
    setTimeout(() => {
      const newBatch = {
        id: `BATCH-00${batches.length + 1}`,
        crop: formData.crop,
        quantity: parseFloat(formData.quantity) || 100,
        unit: formData.unit,
        harvestDaysAgo: parseFloat(formData.harvestDaysAgo) || 1,
        storageCondition: formData.storageCondition,
        temperature: parseFloat(formData.temperature) || 25,
        humidity: parseFloat(formData.humidity) || 60,
        transportHours: parseFloat(formData.transportHours) || 2,
        demand: formData.demand,
        location: formData.location,
        goal: formData.goal,
        risk: finalResult.risk,
        urgency: finalResult.urgency,
        action: finalResult.action,
        confidence: finalResult.confidence,
        shelfLifeRemaining: finalResult.shelfLifeRemaining,
        reasons: finalResult.reasons,
        nextStep: finalResult.nextStep,
        wastePathway: finalResult.wastePathway,
        approvalStatus: 'PENDING',
        humanNotes: '',
        createdAt: new Date().toISOString()
      };

      setBatches([newBatch, ...batches]);
      setIsAnalyzing(false);
      setActiveTab('dashboard');
    }, 1000);
  };

  const handleOpenApprovalModal = (batch, action) => {
    setSelectedBatchForModal(batch);
    setModalAction(action);
    setEditForm({
      action: action === 'edit' ? batch.action : batch.action,
      notes: batch.humanNotes || ''
    });
  };

  const handleConfirmHumanDecision = () => {
    if (!selectedBatchForModal) return;

    const updated = batches.map(b => {
      if (b.id === selectedBatchForModal.id) {
        let status = 'ACCEPTED';
        let act = b.action;
        if (modalAction === 'reject') status = 'REJECTED';
        if (modalAction === 'edit') {
          status = 'EDITED';
          act = editForm.action;
        }
        return {
          ...b,
          approvalStatus: status,
          action: act,
          humanNotes: editForm.notes
        };
      }
      return b;
    });

    setBatches(updated);
    setSelectedBatchForModal(null);
    setModalAction(null);
  };

  const handleWasteMatch = (e) => {
    e.preventDefault();
    const type = wasteForm.wasteType.toLowerCase();
    
    let suggestedUse = 'Aerobic Vermicompost';
    let outputCategory = 'Compost / Bio-fertilizer';
    let benefit = 'Supplies carbon-rich organic humic substance back to soil to rebuild moisture retention.';

    if (type.includes('stover') || type.includes('straw') || type.includes('husk')) {
      suggestedUse = 'Pyrolytic Biochar Transformation';
      outputCategory = 'Biochar / Soil Amender';
      benefit = 'Sequesters carbon permanently while acting as a sponge for crop nutrients in acid soils.';
    } else if (type.includes('pomace') || type.includes('fruit') || type.includes('pulp')) {
      suggestedUse = 'Anaerobic Micro-Digester Biogas';
      outputCategory = 'Biogas & Bio-slurry';
      benefit = 'Produces renewable cooking methane gas and liquid nutrient runoff for vegetable patches.';
    } else if (type.includes('cabbage') || type.includes('leaf') || type.includes('top')) {
      suggestedUse = 'Fermented Silage Feed Blend';
      outputCategory = 'Livestock Feed Supplement';
      benefit = 'High crude protein digestibility suitable for local dairy cattle and goat nutrition.';
    }

    setWasteResult({
      suggestedUse,
      outputCategory,
      benefit,
      type: wasteForm.wasteType,
      qty: `${wasteForm.quantity} ${wasteForm.unit}`
    });
  };

  const runGuidedDemo = () => {
    setIsDemoActive(true);
    setActiveTab('analyze');
    setFormData({
      crop: 'Tomato',
      quantity: '500',
      unit: 'kg',
      harvestDaysAgo: '2',
      storageCondition: 'Open Shed',
      temperature: '32',
      humidity: '75',
      transportHours: '8',
      demand: 'Medium',
      location: 'Telangana (Nalgonda Hub)',
      goal: 'Maximize income, zero loss',
      imageUploaded: true,
      imageFileName: 'tomato_batch_sample.jpg'
    });
  };

  // Sorted Batches by Urgency (CRITICAL > HIGH > MEDIUM > LOW)
  const sortedBatches = useMemo(() => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return [...batches].sort((a, b) => order[a.urgency] - order[b.urgency]);
  }, [batches]);

  // Dashboard Stats
  const stats = useMemo(() => {
    const total = batches.length;
    const highRisk = batches.filter(b => b.risk === 'HIGH').length;
    const sellNow = batches.filter(b => b.action === 'SELL NOW').length;
    const processFirst = batches.filter(b => b.action === 'PROCESS FIRST').length;
    const store = batches.filter(b => b.action === 'STORE').length;
    const pendingApproval = batches.filter(b => b.approvalStatus === 'PENDING').length;

    return { total, highRisk, sellNow, processFirst, store, pendingApproval };
  }, [batches]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">AgriNexus</span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">AI Agent</span>
              </div>
              <h1 className="text-lg font-bold text-white leading-tight">
                AgriCycle AI <span className="text-emerald-400 font-normal">| The Second Harvest</span>
              </h1>
            </div>
          </div>

          {/* Tagline & Guided Demo CTA */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="hidden lg:inline text-xs text-slate-400 italic max-w-xs text-right">
              "Don't just grow more. Lose less. Reuse what remains."
            </span>
            <button
              onClick={runGuidedDemo}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-900/30 active:scale-95 border border-emerald-400/30"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Guided Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard & Priority</span>
            {stats.pendingApproval > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {stats.pendingApproval}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'analyze'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyze Crop Batch</span>
          </button>

          <button
            onClick={() => setActiveTab('waste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'waste'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Recycle className="w-4 h-4" />
            <span>Waste-to-Value Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Decision History Log</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">

        {/* Demo Mode Banner */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 uppercase tracking-wide text-[10px]">
              DEMO / SIMULATED DATA
            </span>
            <span>Predictions reflect hybrid rule engine + LLM post-harvest safety model calculations.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Gemini Key (Optional):</span>
            <input
              type="password"
              placeholder="Paste Gemini API Key"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-500 w-44"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD & PRIORITY OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Batches</span>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <span className="text-[10px] text-slate-500">Tracked in center</span>
              </div>

              <div className="bg-slate-800/60 border border-red-900/40 rounded-xl p-3.5 space-y-1">
                <span className="text-xs text-red-400 font-medium">High Spoilage Risk</span>
                <p className="text-2xl font-bold text-red-400">{stats.highRisk}</p>
                <span className="text-[10px] text-red-300/70">Action required immediately</span>
              </div>

              <div className="bg-slate-800/60 border border-emerald-900/40 rounded-xl p-3.5 space-y-1">
                <span className="text-xs text-emerald-400 font-medium">SELL NOW</span>
                <p className="text-2xl font-bold text-emerald-400">{stats.sellNow}</p>
                <span className="text-[10px] text-emerald-300/70">Market ready</span>
              </div>

              <div className="bg-slate-800/60 border border-amber-900/40 rounded-xl p-3.5 space-y-1">
                <span className="text-xs text-amber-400 font-medium">PROCESS FIRST</span>
                <p className="text-2xl font-bold text-amber-400">{stats.processFirst}</p>
                <span className="text-[10px] text-amber-300/70">Divert to pulping/drying</span>
              </div>

              <div className="bg-slate-800/60 border border-blue-900/40 rounded-xl p-3.5 space-y-1">
                <span className="text-xs text-blue-400 font-medium">STORE</span>
                <p className="text-2xl font-bold text-blue-400">{stats.store}</p>
                <span className="text-[10px] text-blue-300/70">Safe in storage</span>
              </div>

              <div className="bg-slate-800/60 border border-teal-900/40 rounded-xl p-3.5 space-y-1">
                <span className="text-xs text-teal-400 font-medium">Waste Opportunities</span>
                <p className="text-2xl font-bold text-teal-300">{stats.total}</p>
                <span className="text-[10px] text-teal-400/70">100% mapped pathways</span>
              </div>
            </div>

            {}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-700/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Batch Priority Matrix</h2>
                  <span className="text-xs text-slate-400 hidden sm:inline">(Automatically sorted by urgency)</span>
                </div>
                <button
                  onClick={() => setActiveTab('analyze')}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Analyze New Batch</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-700/60">
                      <th className="py-3 px-4">Batch ID & Crop</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Harvest Age</th>
                      <th className="py-3 px-4">Risk & Urgency</th>
                      <th className="py-3 px-4">AI Recommended Action</th>
                      <th className="py-3 px-4">Human Approval</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-sm">
                    {sortedBatches.map((batch) => {
                      const urgencyColor = 
                        batch.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                        batch.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-slate-700 text-slate-300 border-slate-600';

                      const actionBadge = 
                        batch.action === 'SELL NOW' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        batch.action === 'PROCESS FIRST' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/40';

                      return (
                        <tr key={batch.id} className="hover:bg-slate-800/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white">{batch.crop}</div>
                            <div className="text-xs text-slate-400">{batch.id} • {batch.location}</div>
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-200">
                            {batch.quantity} {batch.unit}
                          </td>

                          <td className="py-3.5 px-4 text-xs text-slate-300">
                            {batch.harvestDaysAgo} days ago
                            <span className="block text-[10px] text-slate-500">Temp: {batch.temperature}°C</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${urgencyColor}`}>
                                URGENCY: {batch.urgency}
                              </span>
                              <span className="text-[11px] text-slate-400">Risk Level: <strong className="text-slate-200">{batch.risk}</strong></span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold border ${actionBadge}`}>
                              {batch.action}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-1">
                              Conf: {batch.confidence}%
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {batch.approvalStatus === 'ACCEPTED' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                              </span>
                            )}
                            {batch.approvalStatus === 'EDITED' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                                <Edit3 className="w-3.5 h-3.5" /> Edited
                              </span>
                            )}
                            {batch.approvalStatus === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20">
                                <XCircle className="w-3.5 h-3.5" /> Rejected
                              </span>
                            )}
                            {batch.approvalStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 animate-pulse">
                                Needs Approval
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenApprovalModal(batch, 'accept')}
                              className="text-xs bg-slate-700 hover:bg-slate-600 text-white font-medium px-2.5 py-1.5 rounded transition-all"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div>
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Active AI Decision Cards & Waste-to-Value Opportunities</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedBatches.map((batch) => (
                  <div 
                    key={batch.id} 
                    className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all"
                  >
                    {/* Header bar of Card */}
                    <div className="p-4 border-b border-slate-700/60 bg-slate-900/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400">{batch.id}</span>
                        <h3 className="text-lg font-bold text-white">{batch.crop}</h3>
                        <span className="text-xs text-slate-300">{batch.quantity} {batch.unit} • {batch.location}</span>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border ${
                          batch.action === 'SELL NOW' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          batch.action === 'PROCESS FIRST' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {batch.action}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">Remaining: {batch.shelfLifeRemaining}</span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 text-xs">
                      {/* Risk / Urgency Badges */}
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[10px]">
                          Risk: <strong className="text-white">{batch.risk}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 text-[10px]">
                          Urgency: <strong className="text-amber-400">{batch.urgency}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700 text-[10px] ml-auto font-medium">
                          Confidence: {batch.confidence}%
                        </span>
                      </div>

                      {/* Why this recommendation */}
                      <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-300 block">Why this recommendation?</span>
                        <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                          {batch.reasons.map((r, idx) => (
                            <li key={idx} className="leading-snug">{r}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Immediate Next Step */}
                      <div className="bg-emerald-950/30 rounded-lg p-2.5 border border-emerald-900/40 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <ArrowRight className="w-3.5 h-3.5" /> Immediate Next Step
                        </span>
                        <p className="text-emerald-200/90 text-[11px] leading-relaxed">
                          {batch.nextStep}
                        </p>
                      </div>

                      {/* Waste-to-Value Reuse Pathway */}
                      <div className="bg-teal-950/30 rounded-lg p-2.5 border border-teal-900/40 space-y-1">
                        <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                          <Recycle className="w-3.5 h-3.5" /> Waste-to-Value Opportunity
                        </span>
                        <div className="text-[11px] text-slate-300">
                          <span className="text-teal-400 font-medium">{batch.wastePathway?.use}</span>
                          <p className="text-slate-400 text-[10px] mt-0.5">{batch.wastePathway?.benefit}</p>
                        </div>
                      </div>
                    </div>

                    {/* Human Approval Decision Controls */}
                    <div className="p-3 bg-slate-900/80 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-slate-400">Human Approval:</span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenApprovalModal(batch, 'accept')}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                            batch.approvalStatus === 'ACCEPTED'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-800 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>

                        <button
                          onClick={() => handleOpenApprovalModal(batch, 'edit')}
                          className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                            batch.approvalStatus === 'EDITED'
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-slate-800 hover:bg-amber-900/40 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>

                        <button
                          onClick={() => handleOpenApprovalModal(batch, 'reject')}
                          className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all ${
                            batch.approvalStatus === 'REJECTED'
                              ? 'bg-red-600 text-white shadow'
                              : 'bg-slate-800 hover:bg-red-900/40 text-red-400 border border-red-500/30'
                          }`}
                        >
                          <X className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: ANALYZE BATCH FORM */}
        {/* ========================================================================= */}
        {activeTab === 'analyze' && (
          <div className="max-w-3xl mx-auto bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-700/60 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Post-Harvest Batch Analysis Form</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enter batch parameters to assess spoilage risk, calculate remaining shelf life, and get actionable recommendations.
              </p>
            </div>

            {missingDataWarnings.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-3 text-amber-300 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Information Warning:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-200">
                  {missingDataWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleAnalyzeBatch} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato, Mango, Onion"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quantity & Unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Quantity *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="kg">kg</option>
                      <option value="Quintal">Quintal</option>
                      <option value="Tons">Tons</option>
                      <option value="Crates">Crates</option>
                    </select>
                  </div>
                </div>

                {/* Days Harvested */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harvested (Days Ago)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 2"
                    value={formData.harvestDaysAgo}
                    onChange={(e) => setFormData({ ...formData, harvestDaysAgo: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Storage Condition */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Condition</label>
                  <select
                    value={formData.storageCondition}
                    onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Open Shed">Open Shed / Field Ambient</option>
                    <option value="Ventilated Dry Store">Ventilated Dry Store</option>
                    <option value="Cold Storage">Cold Storage (Controlled Temp)</option>
                    <option value="Covered Plastic Tarpaulin">Covered Plastic Tarpaulin</option>
                  </select>
                </div>

                {/* Temperature */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Temperature (°C)</span>
                    <span className="text-[10px] text-slate-400">Ambient</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 32"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <Thermometer className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Humidity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Humidity (%)</span>
                    <span className="text-[10px] text-slate-400">Relative</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 75"
                      value={formData.humidity}
                      onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <Droplets className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Transport Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Transport Time (Hours)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 8"
                      value={formData.transportHours}
                      onChange={(e) => setFormData({ ...formData, transportHours: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <Truck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Local Demand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Local Market Demand</label>
                  <select
                    value={formData.demand}
                    onChange={(e) => setFormData({ ...formData, demand: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="High">High Demand / Good Price</option>
                    <option value="Medium">Medium Demand / Normal Price</option>
                    <option value="Low">Low Demand / Market Glut</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location / Collection Center</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Nalgonda, Telangana"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* User's Intended Goal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Farmer's Intended Goal</label>
                  <input
                    type="text"
                    placeholder="e.g. Maximize revenue, avoid rot"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Crop Image Upload Mock */}
              <div className="border border-dashed border-slate-700 rounded-lg p-4 bg-slate-900/40 text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">Optional Crop / Spoilage Image Upload</div>
                <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                  Images provide supportive quality signal only. Laboratory-grade diagnostics are not claimed.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUploaded: true, imageFileName: 'batch_photo_sample.jpg' })}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded border border-slate-700"
                  >
                    {formData.imageUploaded ? `Attached: ${formData.imageFileName}` : 'Select Image File'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Running Spoilage Risk Engine...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Batch & Generate Decision Card</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: WASTE-TO-VALUE MATCHER */}
        {/* ========================================================================= */}
        {activeTab === 'waste' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Side */}
            <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <Recycle className="w-5 h-5 text-teal-400" />
                  <h2 className="text-lg font-bold text-white">Waste-to-Value Matcher</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Map unavoidable agricultural residues into circular second-life pathways.
                </p>
              </div>

              <form onSubmit={handleWasteMatch} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Waste Material / Crop Residue</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomato pomace, Stover, Husk, Spoiled fruit"
                    value={wasteForm.wasteType}
                    onChange={(e) => setWasteForm({ ...wasteForm, wasteType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={wasteForm.quantity}
                      onChange={(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Unit</label>
                    <select
                      value={wasteForm.unit || 'kg'}
                      onChange={(e) => setWasteForm({ ...wasteForm, unit: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="kg">kg</option>
                      <option value="Tons">Tons</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Crop Source / Processing Activity</label>
                  <input
                    type="text"
                    value={wasteForm.cropSource}
                    onChange={(e) => setWasteForm({ ...wasteForm, cropSource: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Available Facilities Nearby</label>
                  <input
                    type="text"
                    placeholder="e.g. Composting pit, Biogas digester, Cattle farm"
                    value={wasteForm.processingAccess}
                    onChange={(e) => setWasteForm({ ...wasteForm, processingAccess: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-lg transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                >
                  <Recycle className="w-4 h-4" />
                  <span>Match Second-Life Pathway</span>
                </button>
              </form>
            </div>

            {/* Results Output Side */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span>Circular Economy Pathway Result</span>
                </h3>

                {wasteResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-900/80 rounded-lg p-4 border border-teal-900/50 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-teal-400 uppercase font-semibold">Matched Category</span>
                          <h4 className="text-base font-bold text-white">{wasteResult.outputCategory}</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] border border-teal-500/30 font-bold">
                          {wasteResult.qty}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div>
                          <span className="text-slate-400 block">Recommended Pathway:</span>
                          <strong className="text-emerald-300 text-sm">{wasteResult.suggestedUse}</strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block">Agronomic / Economic Benefit:</span>
                          <p className="text-slate-300 leading-relaxed">{wasteResult.benefit}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-amber-200 text-[11px] flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>Note: Local environmental regulations and moisture levels should be verified before soil or feed application.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 space-y-2 border border-dashed border-slate-700 rounded-lg">
                    <Box className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">Enter your crop residue parameters on the left to discover optimal reuse options.</p>
                  </div>
                )}
              </div>

              {/* Quick reference guide */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-slate-300">Standard Circular Agricultural Pathways</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                    <strong className="text-emerald-400 block">Compost / Vermicompost</strong>
                    Ideal for wet vegetable residues & leaf matter.
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                    <strong className="text-amber-400 block">Biochar</strong>
                    Ideal for dry woody stalks, husk, and crop stover.
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                    <strong className="text-blue-400 block">Biogas Digestion</strong>
                    High-sugar pulps and spoilage fruits.
                  </div>
                  <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                    <strong className="text-teal-400 block">Fermented Silage</strong>
                    Cabbage tops, maize greens for livestock.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: DECISION HISTORY LOG */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-700/60 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Audit Log & Human Decision History</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete record of AI recommendations vs final farmer choices.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {batches.map((b) => (
                <div key={b.id} className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400">{b.id} • {new Date(b.createdAt).toLocaleString()}</span>
                      <h3 className="text-sm font-bold text-white">{b.crop} ({b.quantity} {b.unit})</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        AI Rec: <strong className="text-emerald-400">{b.action}</strong>
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        b.approvalStatus === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        b.approvalStatus === 'EDITED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        b.approvalStatus === 'REJECTED' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        'bg-slate-700 text-slate-300 border-slate-600'
                      }`}>
                        Human Decision: {b.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {b.humanNotes && (
                    <div className="bg-slate-800/60 p-2 rounded text-[11px] text-slate-300 border border-slate-700/50">
                      <strong className="text-slate-400">User Reason / Notes:</strong> {b.humanNotes}
                    </div>
                  )}

                  <div className="text-[10px] text-teal-400/90 pt-1 border-t border-slate-800">
                    <span>Mapped Waste Pathway: {b.wastePathway?.use}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* HUMAN APPROVAL MODAL */}
      {/* ========================================================================= */}
      {selectedBatchForModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-slate-700 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Human Approval Gate</span>
                <h3 className="text-lg font-bold text-white">{selectedBatchForModal.crop} ({selectedBatchForModal.id})</h3>
              </div>
              <button 
                onClick={() => setSelectedBatchForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-lg space-y-1">
                <span className="text-slate-400">AI Recommended Action:</span>
                <p className="text-sm font-bold text-emerald-400">{selectedBatchForModal.action}</p>
                <p className="text-[11px] text-slate-300">{selectedBatchForModal.nextStep}</p>
              </div>

              {/* Action Selection for Edit Mode */}
              {modalAction === 'edit' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Override Action</label>
                  <select
                    value={editForm.action}
                    onChange={(e) => setEditForm({ ...editForm, action: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SELL NOW">SELL NOW</option>
                    <option value="PROCESS FIRST">PROCESS FIRST</option>
                    <option value="STORE">STORE</option>
                  </select>
                </div>
              )}

              {/* Feedback or Notes Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {modalAction === 'reject' ? 'Reason for Rejection *' : 'Farmer Notes / Action Details'}
                </label>
                <textarea
                  rows="3"
                  placeholder={modalAction === 'reject' ? 'e.g. Market price locally crashed, holding for buyer.' : 'Add operational notes...'}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700">
              <button
                onClick={() => setSelectedBatchForModal(null)}
                className="px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmHumanDecision}
                className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-all ${
                  modalAction === 'reject' ? 'bg-red-600 hover:bg-red-500' :
                  modalAction === 'edit' ? 'bg-amber-600 hover:bg-amber-500' :
                  'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                Confirm {modalAction === 'reject' ? 'Rejection' : modalAction === 'edit' ? 'Modification' : 'Acceptance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AgriNexus — AgriCycle AI (The Second Harvest)</span>
          <span className="text-[11px] text-slate-600">Simulated decision engine for post-harvest loss minimization</span>
        </div>
      </footer>
    </div>
  );
}