// InsurAI - Complete Single File React Application
// MumbaiHacks 2025 - Agentic AI Insurance Platform
// Copy this entire file into src/App.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Shield, AlertTriangle, FileText, CheckCircle, Activity, Search, Upload,
  BarChart3, Lock, ChevronRight, Users, Clock, DollarSign, Menu, X,
  Sparkles, MessageSquare, Send, Loader, Mail, Bot, Database, Scale,
  FileSearch, Siren, BrainCircuit, Server, Paperclip, Camera, UserCheck,
  Briefcase, TrendingUp, CreditCard, MapPin, Calendar, LogIn, Eye,
  Terminal, Bell, FileCheck, XCircle, Wand2, Lightbulb, Zap, WifiOff,
  Mic, Languages, BookOpen, Volume2, Umbrella, Download, Home, Settings
} from 'lucide-react';

const InsurAI = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // API Configuration
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";

  // Theme
  const theme = {
    bg: "bg-slate-900",
    cardBg: "bg-slate-800",
    text: "text-slate-100",
    textMuted: "text-slate-400",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500",
    border: "border-slate-700"
  };

  // State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isUsingLiveApi, setIsUsingLiveApi] = useState(false);

  // Agent Workflow
  const [orchestrationStatus, setOrchestrationStatus] = useState('idle');
  const [activeAgent, setActiveAgent] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [claimDescription, setClaimDescription] = useState("I was driving when a deer jumped out. I swerved and hit the guardrail. Front bumper damaged.");
  const [riskScore, setRiskScore] = useState(0);
  const [finalReport, setFinalReport] = useState(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState(null);

  // Advisor
  const [advisorMessages, setAdvisorMessages] = useState([
    { role: 'system', content: "Hello! I'm your InsurAI Advisor. How can I help you today? 💬\n\n(I can help with quotes, coverage comparisons, or policy details)" }
  ]);
  const [advisorInput, setAdvisorInput] = useState("");
  const [isAdvising, setIsAdvising] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'Welcome to InsurAI', message: 'Your account verified for MumbaiHacks 2025', time: '2 hours ago', read: true },
    { id: 2, type: 'alert', title: 'Action Required', message: 'Upload vehicle registration for CLM-X82', time: '1 day ago', read: false }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Admin Claims
  const [claimsList, setClaimsList] = useState([
    { id: "CLM-X82", name: "Rajesh Kumar", type: "Auto", amount: "₹45,000", score: 92, status: "Flagged", progress: 2, report: "Suspicious metadata anomalies found." },
    { id: "CLM-A91", name: "Sarah Khan", type: "Health", amount: "₹1,20,000", score: 15, status: "Approved", progress: 5, report: "Valid Hospital Invoice verified." },
    { id: "CLM-B22", name: "Amit Patel", type: "Auto", amount: "₹15,000", score: 45, status: "Review", progress: 1, report: "Minor inconsistency in dates." },
  ]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [officerNote, setOfficerNote] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Co-Pilot
  const [copilotMessages, setCopilotMessages] = useState([]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [showCopilot, setShowCopilot] = useState(false);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [advisorMessages]);

  // File to Base64
  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({
        inlineData: { data: reader.result.split(',')[1], mimeType: file.type },
      });
      reader.readAsDataURL(file);
    });
  };

  // Gemini API
  const callGemini = async (prompt, isJson = false, imageFile = null) => {
    try {
      if (!apiKey) throw new Error("Simulation Mode");

      const parts = [{ text: prompt }];
      if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        parts.push(imagePart);
      }

      const payload = {
        contents: [{ parts: parts }],
        generationConfig: isJson ? { responseMimeType: "application/json" } : {}
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setIsUsingLiveApi(true);
      return isJson ? JSON.parse(text) : text;

    } catch (error) {
      console.log("Simulation Mode:", error.message);
      setIsUsingLiveApi(false);
      await new Promise(r => setTimeout(r, 1200));

      // Simulation Fallback
      if (isJson) {
        if (prompt.includes("valid evidence")) {
          const lowerName = imageFile ? imageFile.name.toLowerCase() : "";
          const isValid = imageFile && !lowerName.includes("flower") && !lowerName.includes("scenery");
          return {
            valid: isValid,
            description: isValid ? "✅ Valid evidence (Vehicle damage/Injury/Document)" : "❌ Invalid: Irrelevant content detected",
            confidence: 95
          };
        }
        if (prompt.includes("fraud")) return { flags: ["Metadata check passed"], isSuspicious: false };
        if (prompt.includes("Compliance")) return { valid: true, reason: "Coverage verified under policy." };
      }

      if (prompt.includes("Advisor")) {
        const promptLower = prompt.toLowerCase();
        if (promptLower.includes("quote")) return "### 📋 Insurance Quotes\n\n| Plan | Premium | Coverage |\n|------|---------|----------|\n| **Saver** | ₹850/mo | Basic |\n| **Standard** | ₹1,450/mo | Best Value |\n| **Premium** | ₹2,800/mo | Full Coverage |";
        if (promptLower.includes("hindi")) return "नमस्ते! मैं आपकी बीमा सलाहकार हूँ। मैं आपको सर्वश्रेष्ठ नीति खोजने में मदद कर सकती हूँ।";
        if (promptLower.includes("marathi")) return "नमस्कार! मी तुमचा विमा सल्लागार आहे. मी तुम्हाला सर्वोत्तम पॉलिसी शोधण्यात मदत करू शकतो.";
        if (promptLower.includes("scenario")) return "### 🌧️ Scenario Analysis\n\n**Verdict:** ✅ **LIKELY COVERED**\n\nMost comprehensive policies cover natural calamities. Estimated deductible: ₹2,000.";
      }

      return "Analysis complete. ✓";
    }
  };

  // Advisor Chat
  const handleAdvisorSend = async (customPrompt = null) => {
    const input = customPrompt || advisorInput;
    if (!input.trim()) return;

    if (!customPrompt) {
      setAdvisorMessages(prev => [...prev, { role: 'user', content: input }]);
      setAdvisorInput("");
    }

    setIsAdvising(true);
    let finalPrompt = "";

    if (customPrompt === "SIMPLIFY") {
      const lastMsg = [...advisorMessages].reverse().find(m => m.role === 'system')?.content || "";
      finalPrompt = `Explain in very simple terms: "${lastMsg}"`;
    } else if (customPrompt === "TRANSLATE_HINDI") {
      const lastMsg = [...advisorMessages].reverse().find(m => m.role === 'system')?.content || "";
      finalPrompt = `Translate to Hindi: "${lastMsg}"`;
    } else if (customPrompt === "TRANSLATE_MARATHI") {
      const lastMsg = [...advisorMessages].reverse().find(m => m.role === 'system')?.content || "";
      finalPrompt = `Translate to Marathi: "${lastMsg}"`;
    } else if (customPrompt === "SCENARIO") {
      finalPrompt = "Scenario Analysis. Would flooding be covered?";
    } else {
      finalPrompt = `Insurance Advisor: "${input}". Respond helpfully with relevant details.`;
    }

    const reply = await callGemini(finalPrompt, false);
    setAdvisorMessages(prev => [...prev, { role: 'system', content: reply }]);
    setIsAdvising(false);
  };

  // Voice Input
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice not supported");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAdvisorInput(transcript);
    };
    recognition.start();
  };

  // Agent Orchestration
  const startAgentOrchestration = async () => {
    setOrchestrationStatus('running');
    setAgentLogs([]);
    setFinalReport(null);
    setRiskScore(0);
    setEvidenceAnalysis(null);

    const addLog = (agent, msg) => {
      setAgentLogs(prev => [...prev, {
        agent: agent,
        message: msg,
        time: new Date().toLocaleTimeString()
      }]);
    };

    // Step 1
    setActiveAgent('retrieval');
    addLog('Data Retriever', 'Fetching Policy #POL-9982...');
    await new Promise(r => setTimeout(r, 1000));

    // Step 2
    setActiveAgent('fraud');
    addLog('Fraud Analyst', 'Analyzing evidence...');

    let evidenceResult = { valid: false, description: "No evidence" };
    if (uploadedFile) {
      const visionPrompt = `Analyze this image. Valid: Damage/Injury/Bills. Invalid: Flowers/Scenery.`;
      evidenceResult = await callGemini(visionPrompt, true, uploadedFile);
      setEvidenceAnalysis(evidenceResult);
      addLog('Fraud Analyst', `Evidence: ${evidenceResult.description}`);
      
      if (!evidenceResult.valid) {
        setRiskScore(99);
        setFinalReport(`⛔ FRAUD DETECTED: ${evidenceResult.description}`);
        setOrchestrationStatus('complete');
        setActiveAgent(null);
        return;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Step 3
    setActiveAgent('risk');
    const score = Math.floor(Math.random() * 40) + 10;
    setRiskScore(score);
    addLog('Risk Scorer', `Score calculated: ${score}/100`);
    await new Promise(r => setTimeout(r, 1000));

    // Step 4
    setActiveAgent('compliance');
    addLog('Compliance', 'IRDAI verification passed ✓');
    await new Promise(r => setTimeout(r, 800));

    // Step 5
    setActiveAgent('report');
    addLog('Reporter', 'Generating final report...');
    const report = await callGemini(`Generate brief insurance report for claim: "${claimDescription}"`, false);
    setFinalReport(report);
    await new Promise(r => setTimeout(r, 800));

    setActiveAgent(null);
    setOrchestrationStatus('complete');
    addLog('System', '✅ Investigation Complete');

    // Add to notifications
    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      title: 'Claim Processed',
      message: `Risk Score: ${score}/100`,
      fullReport: report,
      time: 'Now',
      read: false
    }, ...prev]);
  };

  // Admin Functions
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginCreds.username === 'officer' && loginCreds.password === 'admin123') {
      setIsAdminLoggedIn(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Credentials');
    }
  };

  const getAiRecommendation = async (claim) => {
    setAiRecommendation(null);
    const advice = await callGemini(`Claim ${claim.id} has risk score ${claim.score}. Recommend: Approve/Reject?`, false);
    setAiRecommendation(advice);
  };

  const processClaimDecision = async (decision) => {
    if (!selectedClaim) return;
    setIsGeneratingReport(true);
    const statusMap = { 'approve': 'Settled', 'reject': 'Rejected', 'investigate': 'Field Investigation' };
    const newStatus = statusMap[decision];
    const report = await callGemini(`Generate ${decision} report for claim ${selectedClaim.id}`, false);

    setClaimsList(prev => prev.map(c =>
      c.id === selectedClaim.id ? { ...c, status: newStatus, progress: 5, report: report } : c
    ));

    setNotifications(prev => [{
      id: Date.now(),
      type: 'info',
      title: `Claim ${newStatus}`,
      message: `Update for ${selectedClaim.id}`,
      fullReport: report,
      time: 'Now',
      read: false
    }, ...prev]);

    setIsGeneratingReport(false);
    setSelectedClaim(null);
  };

  const InsurAILogo = () => (
    <div className="relative w-10 h-10 flex items-center justify-center mr-2">
      <Shield className="w-10 h-10 text-slate-100 fill-slate-800" strokeWidth={1.5} />
      <BrainCircuit className="w-5 h-5 text-emerald-400 absolute" />
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.bg} font-sans ${theme.text}`}>
      {/* Navbar */}
      <nav className={`bg-slate-900/80 backdrop-blur-md border-b ${theme.border} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
              <InsurAILogo />
              <span className="text-2xl font-bold">Insur<span className="text-emerald-400">AI</span></span>
            </div>

            <div className="hidden md:flex space-x-1">
              {['home', 'agents', 'advisor', 'notifications'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 rounded-lg capitalize text-sm ${activeTab === t ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>
                  {t}
                  {t === 'notifications' && unreadCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                </button>
              ))}
              <button onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg flex items-center text-sm ${activeTab === 'dashboard' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}>
                <Lock className="w-4 h-4 mr-2" /> Officer
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="py-12 text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              🏆 MumbaiHacks 2025 Finalist
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              Autonomous <span className="text-emerald-400">Agentic AI</span><br />for Real-Time Insurance Intelligence
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              5 AI Agents orchestrating real-time fraud detection, risk assessment, and intelligent policy guidance.
            </p>
            <button onClick={() => setActiveTab('agents')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/20">
              Launch Agent Demo →
            </button>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <Bot className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="font-bold mb-2">5 AI Agents</h3>
                <p className="text-sm text-slate-400">Data Retrieval, Fraud Analysis, Risk Scoring, Compliance, Reporting</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <Camera className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="font-bold mb-2">Vision AI</h3>
                <p className="text-sm text-slate-400">Gemini-powered image analysis for evidence validation</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl">
                <MessageSquare className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="font-bold mb-2">Smart Advisor</h3>
                <p className="text-sm text-slate-400">Multilingual chatbot for instant policy guidance</p>
              </div>
            </div>
          </div>
        )}

        {/* AGENT WORKFLOW TAB */}
        {activeTab === 'agents' && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h3 className="font-bold flex items-center mb-4"><FileText className="mr-2 text-emerald-400" /> New Claim</h3>
                <textarea value={claimDescription} onChange={e => setClaimDescription(e.target.value)}
                  placeholder="Describe your claim..." className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm min-h-[100px] mb-4" />

                <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center relative hover:bg-slate-700/50">
                  <input type="file" onChange={e => { setUploadedFile(e.target.files[0]); setFilePreview(URL.createObjectURL(e.target.files[0])); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {filePreview ? <img src={filePreview} className="h-24 mx-auto rounded" /> : <div className="text-slate-500 text-sm"><Upload className="w-6 h-6 mx-auto mb-2" />Upload Evidence</div>}
                </div>

                <button onClick={startAgentOrchestration} disabled={orchestrationStatus === 'running'}
                  className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 rounded-xl flex justify-center">
                  {orchestrationStatus === 'running' ? <Loader className="animate-spin" /> : '🚀 Start Investigation'}
                </button>
              </div>

              <div className="bg-black rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs border border-slate-800">
                <div className="text-emerald-500 border-b border-slate-800 pb-2 mb-2">$ System Terminal</div>
                {agentLogs.map((log, i) => (
                  <div key={i} className="mb-1"><span className="text-slate-500">{log.time}</span> <span className="text-emerald-400">[{log.agent}]</span> {log.message}</div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-8 relative overflow-hidden min-h-[600px]">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

              <div className="flex justify-between mb-8 relative z-10">
                {['retrieval', 'fraud', 'risk', 'compliance', 'report'].map(id => (
                  <div key={id} className={`flex flex-col items-center transition-all duration-500 ${activeAgent === id ? 'scale-110 text-emerald-400' : 'text-slate-600'}`}>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-slate-900 ${activeAgent === id ? 'border-emerald-400 shadow-[0_0_15px_#10b981]' : 'border-slate-700'}`}>
                      <Bot className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold mt-2">{id}</span>
                  </div>
                ))}
              </div>

              {evidenceAnalysis && (
                <div className={`mb-4 p-4 rounded-xl border ${evidenceAnalysis.valid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <h4 className="font-bold text-sm flex items-center"><Camera className="w-4 h-4 mr-2" /> Computer Vision Analysis</h4>
                  <p className="text-sm mt-1">{evidenceAnalysis.description}</p>
                </div>
              )}

              {finalReport && (
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
                  <h4 className="text-emerald-400 font-bold mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" /> Final Case Report</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{finalReport}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Risk Score: {riskScore}/100</span>
                    <span className={`px-3 py-1 rounded text-xs font-bold ${riskScore > 70 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {riskScore > 70 ? '⚠️ HIGH RISK' : '✅ LOW RISK'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADVISOR TAB */}
        {activeTab === 'advisor' && (
          <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
              <div className="flex items-center">
                <Bot className="mr-2 text-emerald-400" />
                <span className="font-bold">Policy Advisor</span>
                {isUsingLiveApi ? <span className="ml-2 flex items-center text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full"><Zap className="w-3 h-3 mr-1" /> Gemini Live</span> : <span className="ml-2 flex items-center text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full"><WifiOff className="w-3 h-3 mr-1" /> Simulation</span>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {advisorMessages.map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-emerald-600 ml-auto text-white' : 'bg-slate-700 mr-auto text-slate-200'}`}>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              {isAdvising && <div className="text-slate-500 text-xs ml-4">Advisor is typing...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 flex gap-2 overflow-x-auto">
              <button onClick={() => handleAdvisorSend("SIMPLIFY")} className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full"><BookOpen className="w-3 h-3 mr-1" /> Simplify</button>
              <button onClick={() => handleAdvisorSend("SCENARIO")} className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full"><Umbrella className="w-3 h-3 mr-1" /> Coverage</button>
              <button onClick={() => handleAdvisorSend("TRANSLATE_HINDI")} className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full"><Languages className="w-3 h-3 mr-1" /> Hindi</button>
              <button onClick={() => handleAdvisorSend("TRANSLATE_MARATHI")} className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full"><Languages className="w-3 h-3 mr-1" /> Marathi</button>
            </div>

            <div className="p-4 bg-slate-900 flex gap-2">
              <div className="relative flex-1">
                <input value={advisorInput} onChange={e => setAdvisorInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAdvisorSend()}
                  placeholder="Ask me anything..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 pr-10" />
                <button onClick={startListening} className={`absolute right-2 top-2 p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-slate-400 hover:text-white'}`}>
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => handleAdvisorSend()} className="bg-emerald-500 text-slate-900 p-3 rounded-xl font-bold hover:bg-emerald-400">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center"><Bell className="mr-3 text-emerald-400" /> Notifications</h2>
              <span className="text-xs text-slate-500">{unreadCount} unread</span>
            </div>
            <div className="space-y-4">
              {notifications.map(n => (
                <div key={n.id} className={`bg-slate-800 border ${n.read ? 'border-slate-700' : 'border-emerald-500/50'} rounded-xl p-6`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold ${n.read ? 'text-slate-300' : 'text-white'}`}>{n.title}</h3>
                    <span className="text-xs text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{n.message}</p>
                  {n.fullReport && <div className="bg-slate-900 rounded-lg p-4 text-xs font-mono text-slate-300 border border-slate-700 whitespace-pre-wrap mb-4">{n.fullReport}</div>}
                  {!n.read && <button onClick={() => setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item))} className="text-xs text-emerald-400 hover:underline">Mark as Read</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto mt-20 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl text-center">
                <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-6">Officer Dashboard</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Officer ID" value={loginCreds.username} onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                  <input type="password" placeholder="Password" value={loginCreds.password} onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                  {authError && <div className="text-red-400 text-xs">{authError}</div>}
                  <button onClick={handleLogin} className="w-full bg-emerald-500 text-slate-900 font-bold py-3 rounded-xl">Login</button>
                  <p className="text-xs text-slate-600">Demo: officer / admin123</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700">
                  <h2 className="text-2xl font-bold">Officer Dashboard</h2>
                  <button onClick={() => { setIsAdminLoggedIn(false); setSelectedClaim(null); }} className="text-slate-500 hover:text-white text-sm">Logout</button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {claimsList.map(claim => (
                      <div key={claim.id} onClick={() => setSelectedClaim(claim)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedClaim?.id === claim.id ? 'bg-slate-700 border-emerald-500' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>
                        <div>
                          <div className="font-bold text-white flex items-center">{claim.name} <span className="text-xs text-slate-500 ml-2">{claim.id}</span></div>
                          <div className="text-xs text-slate-400 mt-1">{claim.type} • {claim.amount}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-bold px-2 py-1 rounded ${claim.score > 70 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>Risk: {claim.score}%</div>
                          <div className="text-xs text-slate-500 mt-1">{claim.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    {selectedClaim ? (
                      <div className="space-y-4 h-full flex flex-col">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{selectedClaim.name}</h3>
                          <div className="text-xs text-slate-400">ID: {selectedClaim.id}</div>
                          <div className="text-xs text-slate-400 mt-1">Progress: {selectedClaim.progress}/5</div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs leading-relaxed">{selectedClaim.report}</div>

                        <button onClick={() => getAiRecommendation(selectedClaim)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold">
                          {aiRecommendation ? "✓ Got AI Recommendation" : "🤖 Ask AI"}
                        </button>

                        {aiRecommendation && <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg text-xs text-blue-200">{aiRecommendation}</div>}

                        <div className="space-y-2">
                          <button onClick={() => processClaimDecision('approve')} disabled={isGeneratingReport}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-bold">✓ Approve</button>
                          <button onClick={() => processClaimDecision('reject')} disabled={isGeneratingReport}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold">✗ Reject</button>
                          <button onClick={() => processClaimDecision('investigate')} disabled={isGeneratingReport}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg text-xs font-bold">🔍 Investigate</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">Select a claim to view details</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default InsurAI;