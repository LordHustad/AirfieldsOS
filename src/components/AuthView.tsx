import React, { useState } from 'react';
import {
  Plane,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building2,
  Radio,
  ArrowRight,
  CheckCircle2,
  Users,
  KeyRound,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { SaaSUser, UserRole } from '../types/auth';
import {
  getRegisteredUsers,
  loginWithEmail,
  loginAsUser,
  registerNewOperator,
} from '../services/saasBackend';

interface AuthViewProps {
  onAuthSuccess: (user: SaaSUser) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'switch'>('signin');

  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAirfieldName, setRegAirfieldName] = useState('');
  const [regIcao, setRegIcao] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('AIRFIELD_MANAGER');
  const [regTier, setRegTier] = useState<'STRIP' | 'LICENSED' | 'REGIONAL'>('LICENSED');
  const [regError, setRegError] = useState<string | null>(null);

  const registeredUsers = getRegisteredUsers();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    if (!signInEmail.trim()) {
      setSignInError('Please enter your airfield operator email.');
      return;
    }

    const session = loginWithEmail(signInEmail.trim());
    if (!session) {
      setSignInError('No operator account found with this email. Please check your spelling or choose a demo operator below.');
      return;
    }

    onAuthSuccess(session.user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regAirfieldName.trim() || !regIcao.trim()) {
      setRegError('Please complete all required fields to provision your aerodrome tenant.');
      return;
    }

    if (regIcao.trim().length < 3) {
      setRegError('ICAO code must be 3 or 4 letters (e.g. EGMD, EGBJ, EGLD).');
      return;
    }

    try {
      const session = registerNewOperator({
        name: regName,
        email: regEmail,
        airfieldName: regAirfieldName,
        icao: regIcao.toUpperCase(),
        role: regRole,
        tier: regTier,
      });

      onAuthSuccess(session.user);
    } catch (err: any) {
      setRegError(err.message || 'Failed to create airfield tenant account.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    const session = loginAsUser(userId);
    if (session) {
      onAuthSuccess(session.user);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans text-zinc-900 selection:bg-zinc-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-tight text-zinc-950">AirfieldOS GA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold">
                MULTI-TENANT SAAS
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">General Aviation Aerodrome Management & CAA Statutory Compliance</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-zinc-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-700" />
            100% Tenant Isolation Active
          </span>
          <span className="text-zinc-300">|</span>
          <span>UTC {new Date().toISOString().substring(11, 16)}Z</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-500">
              OPERATOR AUTHENTICATION PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              Access Your Aerodrome Terminal
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
              Sign in to your private airfield workspace or provision a new licensed aerodrome tenant with isolated logs, runways, and billing.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setSignInError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'signin'
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Create New Airfield</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('switch');
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'switch'
                  ? 'bg-white text-zinc-950 font-bold shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch Demo ({registeredUsers.length})</span>
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 pt-2">
              {signInError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{signInError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  Operator Email Address
                </label>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@meadowfield-airfield.co.uk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                    Security Password
                  </label>
                  <span className="text-[11px] text-zinc-400">Demo PIN: 1234</span>
                </div>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 uppercase tracking-wide mt-2"
              >
                <span>Access Airfield Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1.5 mt-4">
                <p className="font-bold text-zinc-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Fast Demo Testing
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Want to immediately test data isolation without typing? Click the <strong>&quot;Switch Demo&quot;</strong> tab above to sign into Meadowfield (EGMS), Compton Abbas (EGHA), or Wessex Jet Centre (EGWX) with 1 click.
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: CREATE NEW AIRFIELD */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 pt-2">
              {regError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    Operator Full Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Capt. David Miller"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. dmiller@shoreham-airport.co.uk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    Aerodrome / Airfield Name
                  </label>
                  <input
                    type="text"
                    value={regAirfieldName}
                    onChange={(e) => setRegAirfieldName(e.target.value)}
                    placeholder="e.g. Shoreham Airport"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-zinc-400" />
                    ICAO Code
                  </label>
                  <input
                    type="text"
                    value={regIcao}
                    onChange={(e) => setRegIcao(e.target.value.toUpperCase())}
                    placeholder="e.g. EGKA"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Operational Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  >
                    <option value="AIRFIELD_MANAGER">Airfield General Manager</option>
                    <option value="DUTY_CONTROLLER">Duty Controller / AFISO</option>
                    <option value="FBO_ADMIN">FBO Ramp Administrator</option>
                    <option value="ACCOUNTS_OFFICER">Accounts & Billing Officer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700">Subscription Tier</label>
                  <select
                    value={regTier}
                    onChange={(e) => setRegTier(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  >
                    <option value="STRIP">Grass Strip / Flying Club (£149/mo)</option>
                    <option value="LICENSED">Licensed Aerodrome Tier (£399/mo)</option>
                    <option value="REGIONAL">Regional GA & FBO Hub (£899/mo)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create your security password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 uppercase tracking-wide mt-2"
              >
                <span>Provision Isolated Airfield & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: DEMO OPERATOR SWITCHER */}
          {activeTab === 'switch' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-zinc-500 mb-2">
                Click on any operator below to instantly log in. Each account possesses its own completely isolated runways, movements, CAA radio logs, and billing ledger:
              </p>

              <div className="space-y-2.5">
                {registeredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-2xl border border-zinc-200 hover:border-zinc-950 bg-white hover:bg-zinc-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-950">{user.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-bold">
                            {user.icao}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 font-medium">{user.airfieldName}</p>
                        <p className="text-[10px] text-zinc-400">{user.title} • {user.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQuickLogin(user.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 group-hover:bg-zinc-950 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <span>Enter as {user.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Isolation & Statutory Note Footer */}
          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
              Encrypted per-tenant partition
            </span>
            <span>CAP 797 & EASA Part-ADR Compliant</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-3 text-center text-xs text-zinc-500">
        AirfieldOS GA Multi-Tenant Operating System • Confidential & Proprietary
      </footer>
    </div>
  );
};
