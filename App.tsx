
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Map3D from './components/Map3D';
import AdminPanel from './components/AdminPanel';
import { WHATSAPP_URL, CONTACT_EMAIL, PRIVACY_POLICY } from './constants';
import { Business, LandingConfig, Sector, Toast } from './types';
import { supabase } from './services/supabase';
import { X, Phone, MapPin, Search, ChevronRight, Star, MessageSquare, PlusCircle, Share2, ShieldCheck, Lock, Globe, CheckCircle, Info, ExternalLink, Navigation, Package, Layers, Download, Smartphone, Mail, Bell, Home, List, HelpCircle, Send, FileText, Copy, SmartphoneNfc, Zap, Mail as MailIcon, Download as DownloadIcon } from 'lucide-react';

const SECTORS: (Sector | 'Todos')[] = ['Todos', 'Industrial', 'Logistica', 'Corporativo', 'Salud', 'Comercio', 'Construccion'];

const App: React.FC = () => {
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<Sector | 'Todos'>('Todos');
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'help'>('map');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  const [landingConfig, setLandingConfig] = useState<LandingConfig>(() => {
    const saved = localStorage.getItem('charlitron_config');
    if (saved) return JSON.parse(saved);
    return {
      heroImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      adBannerImage: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1200&q=80"
    };
  });

  const clicksRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const charlitronLogo = "https://static.wixstatic.com/media/7fb206_893f39bbcc1d4a469839dce707985bf7~mv2.png/v1/fill/w_157,h_157,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/charlitron-logo.png";

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: bizData, error: bizError } = await supabase
        .from('businesses')
        .select('*')
        .order('isPremium', { ascending: false });

      if (!bizError && bizData) setAllBusinesses(bizData);

      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'landing_config')
        .maybeSingle();
        
      if (!settingsError && settingsData) {
        const cloudConfig = { heroImage: settingsData.hero_image, adBannerImage: settingsData.ad_image };
        setLandingConfig(cloudConfig);
        localStorage.setItem('charlitron_config', JSON.stringify(cloudConfig));
      }
    } catch (e: any) {
      console.error("Error sincronización:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateLanding = async (config: LandingConfig) => {
    setLandingConfig(config);
    localStorage.setItem('charlitron_config', JSON.stringify(config));
    try {
      await supabase.from('settings').upsert({ id: 'landing_config', hero_image: config.heroImage, ad_image: config.adBannerImage }, { onConflict: 'id' });
      addToast("Diseño Sincronizado");
    } catch (e) {
      addToast("Guardado local", "success");
    }
  };

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 600);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const term = debouncedSearch.toLowerCase().trim();
    const filtered = allBusinesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(term) || (b.category || '').toLowerCase().includes(term) || (b.sector || '').toLowerCase().includes(term);
      const matchesSector = selectedSector === 'Todos' || b.sector === selectedSector;
      return matchesSearch && matchesSector;
    });
    setFilteredBusinesses(filtered);
  }, [debouncedSearch, allBusinesses, selectedSector]);

  const handleLogoClick = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    clicksRef.current += 1;
    if (clicksRef.current === 5) { setShowPassModal(true); clicksRef.current = 0; }
    else { timerRef.current = window.setTimeout(() => { clicksRef.current = 0; }, 2000); }
  };

  const verifyPass = () => {
    if (passInput === '2003') { setShowAdmin(true); setShowPassModal(false); setPassInput(''); addToast("Acceso Autorizado"); }
    else { addToast("Código Incorrecto", "error"); setPassInput(''); }
  };

  const openInMaps = (b: Business) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${b.x},${b.y}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Outfit'] select-none overflow-x-hidden pb-24">
      
      {loading && (
        <div className="fixed inset-0 z-[5000] bg-slate-950 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-mex-pink/20 border-t-mex-pink rounded-full animate-spin"></div>
          <p className="mt-4 text-[10px] font-bold text-mex-pink uppercase tracking-[0.3em] animate-pulse">Iniciando Radar Industrial...</p>
        </div>
      )}

      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[3500] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 pointer-events-auto ${t.type === 'success' ? 'bg-emerald-500 border-emerald-400' : t.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-mex-pink border-mex-pink/50'} text-white`}>
            {t.type === 'success' ? <CheckCircle size={18} /> : <Bell size={18} />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{t.message}</span>
          </div>
        ))}
      </div>

      <header className="p-4 flex items-center justify-between sticky top-0 z-[80] bg-slate-950/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
          <img src={charlitronLogo} alt="Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold font-brand tracking-tighter leading-none text-white uppercase italic text-shadow">CHARLITRON MAPS</h1>
            <span className="text-[8px] text-mex-pink font-bold uppercase tracking-[0.3em]">Directorio Estratégico SLP</span>
          </div>
        </div>
        <a href={WHATSAPP_URL} target="_blank" className="bg-mex-pink text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-2">
          Pautar <PlusCircle size={14} />
        </a>
      </header>

      <main className={`flex-1 p-5 space-y-8 transition-opacity duration-300 ${selectedBusiness || showPrivacy ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        {activeTab === 'map' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="relative h-44 rounded-[32px] overflow-hidden border border-mex-pink/30 shadow-2xl">
              <img src={landingConfig.heroImage} className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-center p-8">
                <span className="text-[9px] font-bold text-mex-pink uppercase tracking-[0.4em] mb-2">Conectividad de Élite</span>
                <h3 className="text-2xl font-bold text-white leading-tight italic">Epicentro Industrial <br/>En tu Bolsillo</h3>
              </div>
            </section>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {SECTORS.map(sector => (
                <button key={sector} onClick={() => setSelectedSector(sector)} className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest border transition-all ${selectedSector === sector ? 'bg-mex-pink border-mex-pink text-white shadow-lg shadow-mex-pink/20' : 'bg-slate-900 border-white/5 text-slate-500'}`}>{sector}</button>
              ))}
            </div>

            <section className="space-y-6">
              <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
                <Search className="text-mex-pink" size={20} />
                <input type="text" placeholder="Buscar por nombre o giro..." className="bg-transparent flex-1 text-white focus:outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="h-[420px] relative">
                <Map3D idKey="main-radar" businesses={filteredBusinesses} onBusinessSelect={b => setSelectedBusiness(b)} selectedId={selectedBusiness?.id} />
              </div>
            </section>

            <section className="relative h-32 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl bg-slate-900">
              <img src={landingConfig.adBannerImage} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent flex items-end p-6">
                <span className="text-[9px] font-bold text-white uppercase tracking-[0.3em] bg-mex-pink px-3 py-1 rounded-full">Anuncio de la Red</span>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3 shadow-2xl mb-4">
              <Search className="text-mex-pink" size={20} />
              <input type="text" placeholder="Filtrar lista..." className="bg-transparent flex-1 text-white focus:outline-none text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredBusinesses.map(b => (
                <div key={b.id} onClick={() => setSelectedBusiness(b)} className={`border p-5 rounded-[32px] flex items-center gap-5 active:scale-95 transition-all ${b.isPremium ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-mex-pink/40 shadow-xl' : 'bg-slate-900/40 border-white/5'}`}>
                  <div className={`w-16 h-16 bg-white rounded-2xl p-2.5 flex-shrink-0 ${b.isPremium ? 'ring-2 ring-mex-pink ring-offset-2 ring-offset-slate-950' : ''}`}><img src={b.logo} className="w-full h-full object-contain" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-base text-white truncate uppercase italic">{b.name}</h4>
                       {b.isPremium && <Zap size={14} className="text-mex-pink fill-mex-pink" />}
                    </div>
                    <p className="text-[8px] font-bold uppercase text-mex-pink tracking-widest">{b.sector} • {b.city}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-700" />
                </div>
              ))}
              {filteredBusinesses.length === 0 && <p className="text-center text-slate-500 text-[10px] uppercase font-bold py-10 tracking-widest">Sin resultados en el sector</p>}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6 animate-in slide-in-from-left duration-500 py-4 pb-20">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-white uppercase italic">Centro de Soporte</h2>
              <p className="text-[10px] text-mex-pink font-bold uppercase tracking-[0.2em]">Conectando la Industria de SLP</p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <a href={WHATSAPP_URL} className="bg-slate-900 border border-white/10 p-6 rounded-[32px] flex items-center gap-5 shadow-xl active:scale-95 transition-all">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><MessageSquare size={24} /></div>
                <div><h4 className="font-bold text-white">WhatsApp Directo</h4><p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Atención inmediata</p></div>
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="bg-slate-900 border border-white/10 p-6 rounded-[32px] flex items-center gap-5 shadow-xl active:scale-95 transition-all">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><MailIcon size={24} /></div>
                <div><h4 className="font-bold text-white">Correo Oficial</h4><p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{CONTACT_EMAIL}</p></div>
              </a>
              <div onClick={() => setShowPrivacy(true)} className="bg-slate-900 border border-white/10 p-6 rounded-[32px] flex items-center gap-5 shadow-xl cursor-pointer active:scale-95 transition-all">
                <div className="w-12 h-12 bg-mex-pink rounded-2xl flex items-center justify-center text-white shadow-lg shadow-mex-pink/20"><ShieldCheck size={24} /></div>
                <div><h4 className="font-bold text-white">Privacidad</h4><p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Legal y Datos ARCO</p></div>
              </div>

              {/* SECCIÓN DESCARGAR APP */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-mex-pink/20 p-8 rounded-[40px] space-y-6 shadow-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-mex-pink"><DownloadIcon size={24}/></div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Descarga nuestra App</h4>
                      <p className="text-[9px] text-mex-pink font-bold uppercase tracking-widest">Acceso Directo PWA</p>
                    </div>
                 </div>
                 <p className="text-slate-400 text-[11px] leading-relaxed">Instala Charlitron Maps en tu pantalla de inicio para una experiencia más rápida y sin conexión.</p>
                 <button onClick={() => alert("Para instalar: Toca el botón compartir en tu navegador y selecciona 'Agregar a pantalla de inicio'.")} className="w-full py-4 bg-mex-pink text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-mex-pink/20 flex items-center justify-center gap-2">
                   <Smartphone size={16}/> Instalar Ahora
                 </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FICHA DETALLADA CON GALERÍA */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-[4000] bg-slate-950/70 backdrop-blur-md flex items-end justify-center p-4 sm:items-center animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="relative h-56 bg-white/5 flex items-center justify-center border-b border-white/5">
              <button onClick={() => setSelectedBusiness(undefined)} className="absolute top-6 right-6 z-10 p-3 bg-slate-950/80 rounded-2xl text-white hover:bg-mex-pink transition-all"><X size={20} /></button>
              
              {/* Carrusel Simple de Galería */}
              <div className="w-full h-full flex overflow-x-auto snap-x no-scrollbar">
                {/* Logo primero */}
                <div className="min-w-full h-full flex items-center justify-center p-8 snap-center">
                   <div className="w-32 h-32 bg-white rounded-3xl p-4 shadow-2xl ring-4 ring-mex-pink/20"><img src={selectedBusiness.logo} className="w-full h-full object-contain" /></div>
                </div>
                {/* Fotos de Galería */}
                {(selectedBusiness.gallery || []).map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-center relative">
                    <img src={img} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                  </div>
                ))}
              </div>
              
              {/* Indicador de Deslizar */}
              {(selectedBusiness.gallery?.length || 0) > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-mex-pink"></div>
                  {selectedBusiness.gallery?.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30"></div>)}
                </div>
              )}
            </div>

            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white uppercase italic leading-none">{selectedBusiness.name}</h3>
                  <p className="text-[10px] text-mex-pink font-bold uppercase tracking-widest mt-2">{selectedBusiness.sector} • {selectedBusiness.category}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500">{selectedBusiness.reliability}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className={i < Math.floor(selectedBusiness.rating) ? 'text-mex-pink fill-mex-pink' : 'text-white/10'} />
                ))}
                <span className="text-[10px] font-bold text-slate-500 ml-1">{selectedBusiness.rating}</span>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">{selectedBusiness.description}</p>
                {selectedBusiness.industrialCapacity && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-bold text-mex-pink uppercase tracking-widest block mb-1">Capacidad Técnica</span>
                    <p className="text-white text-xs font-medium">{selectedBusiness.industrialCapacity}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => openInMaps(selectedBusiness)} className="col-span-2 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-[24px] font-bold text-[11px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Navigation size={18} /> CÓMO LLEGAR (GPS)
                </button>
                <a href={`https://wa.me/${selectedBusiness.whatsapp}`} target="_blank" className="py-4 bg-emerald-600/20 border border-emerald-600/30 text-emerald-500 rounded-[24px] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <MessageSquare size={16} /> WhatsApp
                </a>
                <a href={`tel:${selectedBusiness.officePhone}`} className="py-4 bg-white/5 border border-white/10 text-white rounded-[24px] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Phone size={16} /> Llamar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-slate-950/80 backdrop-blur-3xl border-t border-white/5 z-[2500] flex items-center justify-around px-8">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'map' ? 'text-mex-pink scale-110' : 'text-slate-600'}`}><Home size={24} /><span className="text-[8px] font-bold uppercase tracking-widest">Radar</span></button>
        <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'list' ? 'text-mex-pink scale-110' : 'text-slate-600'}`}><List size={24} /><span className="text-[8px] font-bold uppercase tracking-widest">Lista</span></button>
        <button onClick={() => setActiveTab('help')} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'help' ? 'text-mex-pink scale-110' : 'text-slate-600'}`}><HelpCircle size={24} /><span className="text-[8px] font-bold uppercase tracking-widest">Ayuda</span></button>
      </nav>

      {/* Modal Privacidad */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[5000] bg-slate-950 p-6 overflow-y-auto">
          <div className="max-w-xl mx-auto space-y-8 py-10">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-white italic">AVISO DE PRIVACIDAD</h2>
               <button onClick={() => setShowPrivacy(false)} className="p-3 bg-white/5 rounded-2xl text-white"><X size={20}/></button>
            </div>
            <div className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] text-slate-400 text-xs leading-loose whitespace-pre-wrap">{PRIVACY_POLICY}</div>
            <button onClick={() => setShowPrivacy(false)} className="w-full py-5 bg-mex-pink text-white rounded-[24px] font-bold uppercase tracking-widest">Entendido</button>
          </div>
        </div>
      )}

      {showPassModal && (
        <div className="fixed inset-0 z-[6000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="w-full max-w-xs bg-slate-900 border border-mex-pink/30 p-8 rounded-[40px] shadow-2xl text-center space-y-6">
            <Lock className="text-mex-pink mx-auto" size={32} />
            <h3 className="text-xl font-bold uppercase tracking-tighter text-white italic">Código Admin</h3>
            <input type="password" maxLength={4} value={passInput} onChange={e => setPassInput(e.target.value)} placeholder="••••" className="w-full bg-slate-950 border-2 border-white/5 rounded-2xl py-4 text-center text-2xl font-bold tracking-[0.5em] text-mex-pink outline-none" autoFocus />
            <div className="grid grid-cols-2 gap-3"><button onClick={() => setShowPassModal(false)} className="py-3 text-[10px] font-bold uppercase text-slate-500">Cerrar</button><button onClick={verifyPass} className="py-3 bg-mex-pink text-white text-[10px] font-bold uppercase rounded-xl shadow-lg shadow-mex-pink/20">Entrar</button></div>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel 
          businesses={allBusinesses} 
          landingConfig={landingConfig} 
          onClose={() => setShowAdmin(false)} 
          onSaveBusiness={async (b) => { const { error } = await supabase.from('businesses').insert([b]); if (error) addToast("Error DB: " + error.message, "error"); else { fetchData(); addToast("Socio Guardado"); } }} 
          onDeleteBusiness={async (id) => { const { error } = await supabase.from('businesses').delete().match({ id }); if (error) addToast("Error DB: " + error.message, "error"); else { fetchData(); addToast("Socio Eliminado", "info"); } }} 
          onUpdateBusiness={async (updated) => { const { error } = await supabase.from('businesses').update(updated).match({ id: updated.id }); if (error) addToast("Error DB: " + error.message, "error"); else { fetchData(); addToast("Radar Actualizado"); } }} 
          onUpdateLanding={handleUpdateLanding} 
        />
      )}
    </div>
  );
};

export default App;
