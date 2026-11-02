import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BarChart3,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  PlusCircle,
  Clock,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Leaf,
  Activity
} from 'lucide-react';
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  getAdminSolutions,
  submitSolutionDraft,
  approveSolutionDraft,
  rejectSolutionDraft
} from '../utils/api';

const AdminDashboard = ({ currentUser, language, onBackToScanner }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'biotech'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [solutionsData, setSolutionsData] = useState({ active_solutions: {}, pending_drafts: [] });
  const [selectedDiseaseForPreview, setSelectedDiseaseForPreview] = useState(null);

  // New Draft Form State
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [submittingDraft, setSubmittingDraft] = useState(false);
  const [draftForm, setDraftForm] = useState({
    disease_key: 'Tomato_Early_blight',
    source_reference: '',
    disease_name_hi: '',
    disease_name_en: '',
    step_1_hi: '',
    step_2_hi: '',
    step_3_hi: '',
    step_1_en: '',
    step_2_en: '',
    step_3_en: ''
  });

  // Load all admin data
  const loadAdminData = async () => {
    try {
      setErrorMsg(null);
      const [statsRes, usersRes, solRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminSolutions()
      ]);

      setStats(statsRes);
      setUsersList(usersRes);
      setSolutionsData(solRes);

      // Pre-select first disease for preview if available
      const diseases = Object.keys(solRes.active_solutions || {});
      if (diseases.length > 0 && !selectedDiseaseForPreview) {
        setSelectedDiseaseForPreview(diseases[0]);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry:', err);
      setErrorMsg(
        err.response?.data?.error ||
        (language === 'hi'
          ? 'एडमिन डेटा लोड करने में त्रुटि हुई। कृपया जांचें कि आपका खाता एडमिन है।'
          : 'Failed to load admin telemetry. Ensure your session has administrator privilege.')
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  // Toggle user role handler
  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmText =
      language === 'hi'
        ? `क्या आप ${user.name} (${user.email}) का रोल बदलकर '${newRole}' करना चाहते हैं?`
        : `Are you sure you want to change ${user.name}'s role to '${newRole}'?`;

    if (!window.confirm(confirmText)) return;

    try {
      setErrorMsg(null);
      await updateUserRole(user.id, newRole);
      setSuccessMsg(
        language === 'hi'
          ? `उपयोगकर्ता रोल सफलतापूर्वक '${newRole}' में अपडेट किया गया।`
          : `User role successfully updated to '${newRole}'.`
      );
      // Reload users list
      const updatedUsers = await getAdminUsers();
      setUsersList(updatedUsers);
      const statsRes = await getAdminStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Role update error:', err);
      setErrorMsg(
        err.response?.data?.error ||
        (language === 'hi'
          ? 'रोल अपडेट विफल रहा।'
          : 'Failed to update user role.')
      );
    }
  };

  // Approve draft handler
  const handleApproveDraft = async (draftId) => {
    try {
      setErrorMsg(null);
      await approveSolutionDraft(draftId);
      setSuccessMsg(
        language === 'hi'
          ? 'बायोटेक ड्राफ्ट स्वीकृत कर लिया गया और लाइव डेटाबेस में शामिल कर दिया गया।'
          : 'Draft approved and published to the live bio-solutions database.'
      );
      const solRes = await getAdminSolutions();
      setSolutionsData(solRes);
      const statsRes = await getAdminStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Draft approval error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to approve draft.');
    }
  };

  // Reject draft handler
  const handleRejectDraft = async (draftId) => {
    try {
      setErrorMsg(null);
      await rejectSolutionDraft(draftId);
      setSuccessMsg(
        language === 'hi'
          ? 'ड्राफ्ट अस्वीकृत कर दिया गया।'
          : 'Draft rejected.'
      );
      const solRes = await getAdminSolutions();
      setSolutionsData(solRes);
      const statsRes = await getAdminStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Draft rejection error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to reject draft.');
    }
  };

  // Submit new solution draft
  const handleDraftSubmit = async (e) => {
    e.preventDefault();
    if (!draftForm.source_reference.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया वैज्ञानिक स्रोत / आईसीएआर संदर्भ दर्ज करें।'
          : 'Please provide an ICAR / scientific bulletin reference.'
      );
      return;
    }

    setSubmittingDraft(true);
    setErrorMsg(null);

    const payload = {
      disease_key: draftForm.disease_key,
      source_reference: draftForm.source_reference.trim(),
      proposed_data: {
        disease_name_hi: draftForm.disease_name_hi.trim() || draftForm.disease_key,
        disease_name_en: draftForm.disease_name_en.trim() || draftForm.disease_key,
        cure_hi: {
          step_1_preparation: draftForm.step_1_hi.trim(),
          step_2_application: draftForm.step_2_hi.trim(),
          step_3_prevention: draftForm.step_3_hi.trim()
        },
        cure_en: {
          step_1_preparation: draftForm.step_1_en.trim(),
          step_2_application: draftForm.step_2_en.trim(),
          step_3_prevention: draftForm.step_3_en.trim()
        }
      }
    };

    try {
      await submitSolutionDraft(payload);
      setSuccessMsg(
        language === 'hi'
          ? 'नया बायोटेक ड्राफ्ट समीक्षा कतार में सफलतापूर्वक जमा हो गया है।'
          : 'Biotech remedy draft successfully submitted to review queue.'
      );
      setShowDraftModal(false);
      // Reset form
      setDraftForm({
        disease_key: 'Tomato_Early_blight',
        source_reference: '',
        disease_name_hi: '',
        disease_name_en: '',
        step_1_hi: '',
        step_2_hi: '',
        step_3_hi: '',
        step_1_en: '',
        step_2_en: '',
        step_3_en: ''
      });
      const solRes = await getAdminSolutions();
      setSolutionsData(solRes);
      const statsRes = await getAdminStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Draft submit error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to submit solution draft.');
    } finally {
      setSubmittingDraft(false);
    }
  };

  // Helper to parse proposed JSON from draft safely
  const parseProposedJson = (jsonString) => {
    if (typeof jsonString === 'object' && jsonString !== null) return jsonString;
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {language === 'hi' ? 'एडमिन टेलीमेट्री लोड हो रही है...' : 'Loading Administrator Telemetry & Verification...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-slide-up">
      {/* Top Banner & Navigation */}
      <div className="glass-card rounded-3xl p-6 border border-emerald-500/30 shadow-lg bg-gradient-to-r from-emerald-900/20 via-slate-900/40 to-emerald-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {language === 'hi' ? 'एडमिन एवं बायोटेक प्रबंधन पोर्टल' : 'Admin & Biotech Oversight Portal'}
                </h2>
                <span className="px-2 py-0.5 text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 rounded-full">
                  Admin Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {language === 'hi'
                  ? 'रोग सांख्यिकी विश्लेषण, उपयोगकर्ता नियंत्रण एवं 100% जैविक समाधान समीक्षा'
                  : 'Real foliar telemetry analytics, role-based access, and peer-reviewed bio-solutions'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-card transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={onBackToScanner}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-600 text-white shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'स्कैनर पर लौटें' : 'Back to Scanner'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-gray-200 dark:border-dark-border pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{language === 'hi' ? '📊 समग्र आंकड़े व विश्लेषण' : 'Overview & Analytics'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'hi' ? '👥 उपयोगकर्ता प्रबंधन' : 'Users & Permissions'}</span>
            {usersList.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-black/20 text-white">
                {usersList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('biotech')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'biotech'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-card'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'hi' ? '🧪 जैविक समाधान समीक्षा कतार' : 'Biotech Review Queue'}</span>
            {solutionsData.pending_drafts && solutionsData.pending_drafts.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-400 text-amber-950 font-black animate-pulse">
                {solutionsData.pending_drafts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-gray-200 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">
                {language === 'hi' ? 'कुल स्कैन (डेटाबेस)' : 'Total Database Scans'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary dark:text-secondary mt-1">
                {stats.total_scans}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {language === 'hi' ? 'वास्तविक मॉडल विश्लेषण' : 'Real model predictions'}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-gray-200 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">
                {language === 'hi' ? 'स्वस्थ फसल दर' : 'Healthy Leaf Rate'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.healthy_percentage}%
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {stats.healthy_scans} {language === 'hi' ? 'स्वस्थ पत्तियां' : 'healthy leaves'}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-gray-200 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">
                {language === 'hi' ? 'पंजीकृत उपयोगकर्ता' : 'Registered Users'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {stats.total_users}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {stats.admin_users} {language === 'hi' ? 'एडमिन सक्रिय' : 'administrators'}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-gray-200 dark:border-dark-border">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold block">
                {language === 'hi' ? 'प्रतीक्षित समाधान ड्राफ्ट' : 'Pending Bio-Drafts'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">
                {stats.pending_drafts}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {language === 'hi' ? 'समीक्षा हेतु तैयार' : 'Awaiting admin approval'}
              </span>
            </div>
          </div>

          {/* Disease Distribution Breakdown */}
          <div className="glass-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary dark:text-secondary" />
              <span>{language === 'hi' ? 'रोग वितरण सांख्यिकी' : 'Disease Frequency Breakdown'}</span>
            </h3>

            {stats.disease_distribution && stats.disease_distribution.length > 0 ? (
              <div className="space-y-3.5">
                {stats.disease_distribution.map((item, idx) => {
                  const pct = stats.total_scans > 0 ? Math.round((item.count / stats.total_scans) * 100) : 0;
                  const isHealthy = item.disease.toLowerCase().includes('healthy');
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-800 dark:text-gray-200">
                          {item.disease.replace(/___/g, ' ').replace(/_/g, ' ')}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {item.count} {language === 'hi' ? 'स्कैन' : 'scans'} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400">
                {language === 'hi' ? 'अभी तक कोई रोग स्कैन दर्ज नहीं हुआ है।' : 'No scan history recorded in SQLite yet.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USERS & PERMISSIONS */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                {language === 'hi' ? 'उपयोगकर्ता एवं अनुमतियाँ' : 'User Accounts & Roles'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'सक्रिय उपयोगकर्ताओं की सूची एवं एडमिनिस्ट्रेटर प्रिविलेज नियंत्रण'
                  : 'Manage accounts and promote/demote administrator rights.'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary dark:text-secondary">
              {usersList.length} {language === 'hi' ? 'उपयोगकर्ता' : 'Total Users'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border text-gray-400 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Registered At</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {usersList.map((user) => {
                  const isSelf = currentUser && currentUser.id === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-surface/40 transition-colors">
                      <td className="py-3 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary dark:text-secondary font-black flex items-center justify-center text-xs uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span>{user.name}</span>
                          {isSelf && (
                            <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                            user.role === 'admin'
                              ? 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30'
                              : 'bg-gray-200 dark:bg-dark-surface text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRoleToggle(user)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                            user.role === 'admin'
                              ? 'border-rose-400/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                              : 'border-emerald-400/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {user.role === 'admin'
                            ? language === 'hi' ? 'User बनाएं' : 'Demote to User'
                            : language === 'hi' ? 'Admin बनाएं' : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BIOTECH REVIEW QUEUE & SOLUTIONS */}
      {activeTab === 'biotech' && (
        <div className="space-y-6">
          {/* Header & Submit Draft Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {language === 'hi' ? 'जैविक उपचार समीक्षा एवं ज्ञानकोष' : 'Biological Remedies Review & Knowledgebase'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi'
                  ? 'वैज्ञानिक अनुसंधान आधारित जैविक समाधानों की समीक्षा करें या नया समाधान प्रस्तावित करें'
                  : 'Review scientific biological remedies or propose new peer-reviewed formulations.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDraftModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-600 text-white shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया समाधान प्रस्तावित करें' : 'Propose Remedy Draft'}</span>
            </button>
          </div>

          {/* Pending Review Queue Section */}
          <div className="glass-card rounded-3xl p-6 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-amber-500" />
              <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                {language === 'hi' ? 'समीक्षाधीन ड्राफ्ट (Pending Approval)' : 'Pending Peer Review Queue'}
              </h4>
            </div>

            {solutionsData.pending_drafts && solutionsData.pending_drafts.length > 0 ? (
              <div className="space-y-4">
                {solutionsData.pending_drafts.map((draft) => {
                  const proposed = parseProposedJson(draft.proposed_json);
                  return (
                    <div
                      key={draft.id}
                      className="p-5 rounded-2xl bg-white/70 dark:bg-dark-surface border border-amber-300 dark:border-amber-500/40 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-dark-border pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                              {draft.disease_key.replace(/___/g, ' ').replace(/_/g, ' ')}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                              Draft #{draft.id}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {language === 'hi' ? 'प्रस्तावक:' : 'Proposed by:'}{' '}
                            <span className="font-semibold">{draft.author_name || 'Admin'}</span> •{' '}
                            {draft.updated_at ? new Date(draft.updated_at).toLocaleString() : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveDraft(draft.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'स्वीकार करें' : 'Approve & Merge'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectDraft(draft.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'अस्वीकार करें' : 'Reject'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Source Citation */}
                      <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-emerald-900 dark:text-emerald-300">
                        <span className="font-bold">
                          {language === 'hi' ? '🔬 वैज्ञानिक स्रोत / संदर्भ:' : '🔬 Scientific Source:'}
                        </span>{' '}
                        {draft.source_reference}
                      </div>

                      {/* Preview of Proposed 3 Steps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-1.5">
                          <div className="font-bold text-gray-700 dark:text-gray-300">
                            🇮🇳 Hindi Formulation:
                          </div>
                          <p>
                            <span className="font-semibold">तैयारी:</span>{' '}
                            {proposed.cure_hi?.step_1_preparation || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">छिड़काव:</span>{' '}
                            {proposed.cure_hi?.step_2_application || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">रोकथाम:</span>{' '}
                            {proposed.cure_hi?.step_3_prevention || 'N/A'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-dark-border space-y-1.5">
                          <div className="font-bold text-gray-700 dark:text-gray-300">
                            🇬🇧 English Formulation:
                          </div>
                          <p>
                            <span className="font-semibold">Prep:</span>{' '}
                            {proposed.cure_en?.step_1_preparation || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">Apply:</span>{' '}
                            {proposed.cure_en?.step_2_application || 'N/A'}
                          </p>
                          <p>
                            <span className="font-semibold">Prevent:</span>{' '}
                            {proposed.cure_en?.step_3_prevention || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400">
                {language === 'hi'
                  ? 'कोई लंबित ड्राफ्ट नहीं है। सभी समाधान अद्यतित हैं।'
                  : 'No drafts pending review. Live bio-solutions database is in sync.'}
              </div>
            )}
          </div>

          {/* Active Live Bio Solutions Explorer */}
          <div className="glass-card rounded-3xl p-6 border border-gray-200 dark:border-dark-border space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                {language === 'hi' ? 'लाइव जैविक ज्ञानकोष (Live Bio-Solutions Database)' : 'Live Active Biological Remedies Database'}
              </h4>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(solutionsData.active_solutions || {}).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDiseaseForPreview(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedDiseaseForPreview === key
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {key.replace(/___/g, ' ').replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {selectedDiseaseForPreview && solutionsData.active_solutions[selectedDiseaseForPreview] && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border pb-2">
                  <h5 className="font-extrabold text-sm text-gray-900 dark:text-white">
                    {solutionsData.active_solutions[selectedDiseaseForPreview].disease_name_hi} /{' '}
                    {solutionsData.active_solutions[selectedDiseaseForPreview].disease_name_en}
                  </h5>
                  <span className="text-[11px] text-gray-400 font-mono">
                    Key: {selectedDiseaseForPreview}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Hindi Cure */}
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      🇮🇳 हिन्दी जैविक उपाय:
                    </span>
                    <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                      <p>
                        <strong className="text-primary-700 dark:text-secondary-light">1. तैयारी:</strong>{' '}
                        {solutionsData.active_solutions[selectedDiseaseForPreview].cure_hi?.step_1_preparation}
                      </p>
                      <p>
                        <strong className="text-primary-700 dark:text-secondary-light">2. प्रयोग:</strong>{' '}
                        {solutionsData.active_solutions[selectedDiseaseForPreview].cure_hi?.step_2_application}
                      </p>
                      <p>
                        <strong className="text-primary-700 dark:text-secondary-light">3. रोकथाम:</strong>{' '}
                        {solutionsData.active_solutions[selectedDiseaseForPreview].cure_hi?.step_3_prevention}
                      </p>
                    </div>
                  </div>

                  {/* English Cure */}
                  <div className="space-y-2">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                      🇬🇧 English Bio-Remedy:
                    </span>
                    <div className="space-y-1.5 text-gray-700 dark:text-gray-300">
                      <p>
                        <strong className="text-primary-700 dark:text-secondary-light">1. Preparation:</strong>{' '}
                        {solutionsData.active_solutions[selectedDiseaseForPreview].cure_en?.step_1_preparation}
                      </p>
                      <p>
                        <strong className="text-primary-700 dark:text-secondary-light">2. Application:</strong>{' '}
                        {solutionsData.active_solutions[selectedDiseaseForPreview].cure_en?.step_2_application}
                      </p>
                      <p>
                        <strong className="text-primary-700 dark:text-secondary-light">3. Prevention:</strong>{' '}
                        {solutionsData.active_solutions[selectedDiseaseForPreview].cure_en?.step_3_prevention}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Propose Solution Draft Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-slide-up overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-gray-200 dark:border-dark-border p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-dark-border pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  {language === 'hi' ? 'नया जैविक समाधान प्रस्तावित करें' : 'Propose Scientific Bio-Remedy Draft'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'hi'
                    ? 'आईसीएआर अथवा कृषि वैज्ञानिक संदर्भ सहित 3-चरणीय उपचार भरें'
                    : 'Submit 3-step formulation with verifiable agronomic reference'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDraftModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDraftSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'hi' ? 'रोग वर्ग (Disease Class)' : 'Target Disease Class'}
                  </label>
                  <select
                    value={draftForm.disease_key}
                    onChange={(e) => setDraftForm({ ...draftForm, disease_key: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
                  >
                    <option value="Tomato_Early_blight">Tomato_Early_blight (अगेती झुलसा)</option>
                    <option value="Tomato_Late_blight">Tomato_Late_blight (पछेती झुलसा)</option>
                    <option value="Tomato_Leaf_Mold">Tomato_Leaf_Mold (पत्ती फफूंद)</option>
                    <option value="Tomato_healthy">Tomato_healthy (स्वस्थ पौधा)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'hi' ? 'वैज्ञानिक स्रोत संदर्भ (Mandatory)' : 'Scientific Source Citation *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICAR-IIHR Bulletin 2024 / TNAU Agronomy"
                    value={draftForm.source_reference}
                    onChange={(e) => setDraftForm({ ...draftForm, source_reference: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Hindi Fields */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2.5">
                <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300">
                  🇮🇳 हिन्दी 3-चरणीय उपचार (Hindi 3-Step Bio-Remedy):
                </span>
                <input
                  type="text"
                  placeholder="रोग का नाम (जैसे: टमाटर अगेती झुलसा)"
                  value={draftForm.disease_name_hi}
                  onChange={(e) => setDraftForm({ ...draftForm, disease_name_hi: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
                <textarea
                  rows="2"
                  placeholder="चरण 1 (तैयारी): जैसे खट्टी छाछ और नीम तेल का मिश्रण..."
                  value={draftForm.step_1_hi}
                  onChange={(e) => setDraftForm({ ...draftForm, step_1_hi: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
                <textarea
                  rows="2"
                  placeholder="चरण 2 (छिड़काव): जैसे सुबह या शाम के समय पत्तियों के दोनों तरफ..."
                  value={draftForm.step_2_hi}
                  onChange={(e) => setDraftForm({ ...draftForm, step_2_hi: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
                <textarea
                  rows="2"
                  placeholder="चरण 3 (रोकथाम): जैसे फसल चक्र अपनाएं, जलभराव से बचें..."
                  value={draftForm.step_3_hi}
                  onChange={(e) => setDraftForm({ ...draftForm, step_3_hi: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
              </div>

              {/* English Fields */}
              <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2.5">
                <span className="font-extrabold text-xs text-blue-800 dark:text-blue-300">
                  🇬🇧 English 3-Step Bio-Remedy:
                </span>
                <input
                  type="text"
                  placeholder="Disease name in English (e.g. Tomato Early Blight)"
                  value={draftForm.disease_name_en}
                  onChange={(e) => setDraftForm({ ...draftForm, disease_name_en: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
                <textarea
                  rows="2"
                  placeholder="Step 1 (Preparation): e.g. Sour buttermilk solution with neem oil..."
                  value={draftForm.step_1_en}
                  onChange={(e) => setDraftForm({ ...draftForm, step_1_en: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
                <textarea
                  rows="2"
                  placeholder="Step 2 (Application): e.g. Spray foliage on both undersides..."
                  value={draftForm.step_2_en}
                  onChange={(e) => setDraftForm({ ...draftForm, step_2_en: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
                <textarea
                  rows="2"
                  placeholder="Step 3 (Prevention): e.g. Practice crop rotation and avoid overhead splash..."
                  value={draftForm.step_3_en}
                  onChange={(e) => setDraftForm({ ...draftForm, step_3_en: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingDraft}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-600 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {submittingDraft
                    ? (language === 'hi' ? 'जमा हो रहा है...' : 'Submitting...')
                    : (language === 'hi' ? 'ड्राफ्ट जमा करें' : 'Submit Draft')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

