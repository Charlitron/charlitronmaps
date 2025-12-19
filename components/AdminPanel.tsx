
import React, { useState } from 'react';
import { X, Save, MapPin, Briefcase, Upload, Image as ImageIcon, Loader2, Edit3, Trash2, CheckCircle, Globe, Plus, Phone, MessageSquare, Package, Layout, Star, ShieldCheck, Activity, Trash, Mail, BarChart3, Users, Target, Link, FileText, Zap, Award } from 'lucide-react';
import { Business, LandingConfig, Sector } from '../types';
import { resolveLocationFromText } from '../services/geminiService';
import { supabase } from '../services/supabase';

interface AdminPanelProps {
  businesses: Business[];
  landingConfig: LandingConfig;
  onClose: () => void;
  onSaveBusiness: (business: Business) => void;
  onDeleteBusiness: (id: string) => void;
  onUpdateBusiness: (business: Business) => void;
  onUpdateLanding: (config: LandingConfig) => void;
}

const SECTORS: Sector[] = ['Industrial', 'Logistica', 'Corporativo', 'Salud', 'Comercio', 'Construccion'];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  businesses, landingConfig, onClose, onSaveBusiness, onDeleteBusiness, onUpdateBusiness, onUpdateLanding 
}) => {
  const [activeTab, setActiveTab] = useState<'partners' | 'design' | 'stats'>('partners');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [isResolving, setIsResolving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');

  const initialForm: Partial<Business> = {
    name: '', sector: 'Industrial', category: '', description: '', address: '', city: 'San Luis Potosí', 
    officePhone: '', whatsapp: '', email: '', website: '', industrialCapacity: '', services: [], gallery: [], logo: '',
    rating: 5.0, reliability: 100, status: 'active', x: 22.15, y: -100.98, isPremium: false
  };

  const [formData, setFormData] = useState<Partial<Business>>(initialForm);

  const handleEdit = (b: Business) => {
    setFormData(b);
    setEditingId(b.id);
    setLocationInput(b.address);
    setView('form');
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `radar/${fileName}`;

    const { data, error } = await supabase.storage
      .from('radar-fotos')
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error.message);
      alert("Error al subir imagen: " + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('radar-fotos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'photo1' | 'photo2' | 'hero' | 'ad') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const file = files[0];
    const url = await uploadFile(file);
    
    if (url) {
      if (field === 'logo') setFormData(prev => ({ ...prev, logo: url }));
      else if (field === 'hero') onUpdateLanding({ ...landingConfig, heroImage: url });
      else if (field === 'ad') onUpdateLanding({ ...landingConfig, adBannerImage: url });
      else if (field === 'photo1') {
        const currentGallery = [...(formData.gallery || [])];
        currentGallery[0] = url;
        setFormData(prev => ({ ...prev, gallery: currentGallery }));
      }
      else if (field === 'photo2') {
        const currentGallery = [...(formData.gallery || [])];
        currentGallery[1] = url;
        setFormData(prev => ({ ...prev, gallery: currentGallery }));
      }
    }
    setIsUploading(false);
  };

  const handleResolveLocation = async () => {
    if (!locationInput) return;
    setIsResolving(true);
    const coords = await resolveLocationFromText(`${locationInput}, ${formData.city}`);
    setFormData(prev => ({ ...prev, x: coords.lat, y: coords.lng, address: locationInput }));
    setIsResolving(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.logo) return alert("Nombre y Logo son obligatorios");
    
    const payload = {
      ...formData,
      services: formData.services || [],
      gallery: formData.gallery || [],
      rating: Number(formData.rating) || 5.0,
      reliability: Number(formData.reliability) || 100
    };

    if (editingId) onUpdateBusiness({ ...payload, id: editingId } as Business);
    else onSaveBusiness({ ...payload, id: `CH-${Date.now()}` } as Business);
    setView('list');
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      <header className="p-6 border-b border-white/5 flex flex-col gap-4 bg-slate-900">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-mex-pink rounded-xl flex items-center justify-center shadow-lg"><Briefcase className="text-white" size={20} /></div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tighter leading-none">Admin Maestro</h2>
              <p className="text-[10px] text-mex-pink font-bold uppercase tracking-[0.2em] mt-1">Radar Industrial v3.1</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 rounded-xl text-white"><X size={20} /></button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setActiveTab('partners')} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'partners' ? 'bg-mex-pink text-white' : 'bg-white/5 text-slate-500'}`}><Users size={14} /> Socios</button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'stats' ? 'bg-mex-pink text-white' : 'bg-white/5 text-slate-500'}`}><BarChart3 size={14} /> Métricas</button>
          <button onClick={() => setActiveTab('design')} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'design' ? 'bg-mex-pink text-white' : 'bg-white/5 text-slate-500'}`}><Layout size={14} /> Diseño</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'partners' && (
          view === 'list' ? (
            <div className="p-6 space-y-6">
              <button onClick={() => { setFormData(initialForm); setEditingId(null); setView('form'); }} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl"><Plus size={16} /> Alta de Nuevo Socio</button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businesses.map(b => (
                  <div key={b.id} className="bg-slate-900/50 border border-white/5 p-5 rounded-[32px] flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-white rounded-2xl p-2 flex-shrink-0 shadow-lg overflow-hidden"><img src={b.logo} className="w-full h-full object-contain" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate text-white">{b.name}</h3>
                      <p className="text-[8px] text-mex-pink font-bold uppercase mt-1">{b.sector} • {b.city}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(b)} className="p-3 bg-white/5 hover:bg-mex-pink rounded-xl text-white transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => { if(confirm('¿Seguro que deseas eliminar este socio?')) onDeleteBusiness(b.id) }} className="p-3 bg-white/5 hover:bg-red-500 rounded-xl text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-w-5xl mx-auto w-full pb-32">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter">{editingId ? 'Editar Socio' : 'Nuevo Registro'}</h3>
                <div className="flex items-center gap-3 bg-mex-pink/10 px-4 py-2 rounded-2xl border border-mex-pink/20">
                   <span className="text-[10px] font-bold text-mex-pink uppercase tracking-widest">Premium</span>
                   <input type="checkbox" className="w-5 h-5 rounded accent-mex-pink cursor-pointer" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} />
                </div>
              </div>

              <div className="bg-slate-900/60 border border-white/5 p-8 rounded-[40px] grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Star size={16} className="text-mex-pink" /><span className="text-[10px] font-bold text-white uppercase tracking-widest">Calificación: {formData.rating}</span></div>
                  </div>
                  <input type="range" min="1" max="5" step="0.1" className="w-full accent-mex-pink" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /><span className="text-[10px] font-bold text-white uppercase tracking-widest">Confianza: {formData.reliability}%</span></div>
                  </div>
                  <input type="range" min="0" max="100" step="1" className="w-full accent-emerald-500" value={formData.reliability} onChange={e => setFormData({...formData, reliability: parseInt(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white uppercase tracking-tighter">Imágenes del Socio</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LOGO */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logo Principal</span>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-[32px] cursor-pointer hover:border-mex-pink bg-slate-900 overflow-hidden relative group">
                      {formData.logo ? <img src={formData.logo} className="w-full h-full object-contain p-4" /> : <div className="text-center"><Upload size={24} className="mx-auto mb-2 text-slate-600"/><p className="text-[8px] text-slate-500 font-bold uppercase">Subir Logo</p></div>}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'logo')} disabled={isUploading} />
                    </label>
                  </div>
                  {/* FOTO GALERIA 1 */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Foto de Galería 1</span>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-[32px] cursor-pointer hover:border-mex-pink bg-slate-900 overflow-hidden relative group">
                      {formData.gallery?.[0] ? <img src={formData.gallery[0]} className="w-full h-full object-cover" /> : <div className="text-center"><Upload size={24} className="mx-auto mb-2 text-slate-600"/><p className="text-[8px] text-slate-500 font-bold uppercase">Subir Foto 1</p></div>}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'photo1')} disabled={isUploading} />
                    </label>
                  </div>
                  {/* FOTO GALERIA 2 */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Foto de Galería 2</span>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-[32px] cursor-pointer hover:border-mex-pink bg-slate-900 overflow-hidden relative group">
                      {formData.gallery?.[1] ? <img src={formData.gallery[1]} className="w-full h-full object-cover" /> : <div className="text-center"><Upload size={24} className="mx-auto mb-2 text-slate-600"/><p className="text-[8px] text-slate-500 font-bold uppercase">Subir Foto 2</p></div>}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'photo2')} disabled={isUploading} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Empresa</span>
                    <input required type="text" className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-mex-pink outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector</span>
                    <select className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none appearance-none" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value as Sector})}>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Giro</span>
                    <input required type="text" placeholder="Manufactura, Logística, etc." className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-mex-pink outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                  </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Descripción</span>
                <textarea rows={4} className="w-full bg-slate-900 border border-white/10 rounded-3xl px-6 py-5 text-white text-sm focus:border-mex-pink outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] space-y-6">
                 <h4 className="text-lg font-bold text-white uppercase tracking-tighter">Contacto y Capacidad</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" placeholder="WhatsApp (521...)" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                    <input type="text" placeholder="Oficina" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={formData.officePhone} onChange={e => setFormData({...formData, officePhone: e.target.value})} />
                    <input type="email" placeholder="Email" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    <input type="url" placeholder="Sitio Web" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    <div className="md:col-span-2">
                      <input type="text" placeholder="Capacidad Técnica (Ej. Planta de 5000m2)" className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={formData.industrialCapacity} onChange={e => setFormData({...formData, industrialCapacity: e.target.value})} />
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900 border border-mex-pink/10 p-8 rounded-[40px] space-y-4">
                 <h4 className="text-lg font-bold text-white uppercase tracking-tighter">Ubicación Radar</h4>
                 <div className="flex gap-2">
                    <input type="text" placeholder="Dirección o Link Maps..." className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm" value={locationInput} onChange={e => setLocationInput(e.target.value)} />
                    <button type="button" onClick={handleResolveLocation} className="bg-white text-slate-950 px-6 rounded-2xl font-bold text-[10px] uppercase flex items-center gap-2">
                      {isResolving ? <Loader2 className="animate-spin" size={16}/> : <Activity size={16}/>} Calibrar
                    </button>
                 </div>
              </div>

              <div className="pt-10 flex flex-col gap-4">
                <button type="submit" disabled={isUploading || isResolving} className="w-full py-6 bg-mex-pink text-white font-bold text-sm uppercase rounded-[32px] shadow-lg">
                  <Save size={20} className="inline mr-2" /> {editingId ? 'Actualizar Socio' : 'Confirmar Registro'}
                </button>
                <button type="button" onClick={() => setView('list')} className="w-full py-3 text-slate-500 font-bold text-[10px] uppercase">Cancelar</button>
              </div>
            </form>
          )
        )}
        {activeTab === 'design' && (
          <div className="p-8 space-y-12 max-w-4xl mx-auto w-full">
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter border-l-2 border-mex-pink pl-4">Hero Principal</h3>
              <label className="block relative h-64 bg-slate-900 rounded-[40px] border-2 border-dashed border-white/10 overflow-hidden cursor-pointer">
                {landingConfig.heroImage ? <img src={landingConfig.heroImage} className="w-full h-full object-cover opacity-60" /> : <div className="flex flex-col items-center justify-center h-full text-slate-500"><ImageIcon size={40}/><p className="text-[10px] uppercase font-bold">Cambiar Hero</p></div>}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'hero')} disabled={isUploading} />
              </label>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter border-l-2 border-mex-pink pl-4">Banner Publicitario</h3>
              <label className="block relative h-48 bg-slate-900 rounded-[40px] border-2 border-dashed border-white/10 overflow-hidden cursor-pointer">
                {landingConfig.adBannerImage ? <img src={landingConfig.adBannerImage} className="w-full h-full object-cover opacity-60" /> : <div className="flex flex-col items-center justify-center h-full text-slate-500"><ImageIcon size={40}/><p className="text-[10px] uppercase font-bold">Subir Banner</p></div>}
                <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'ad')} disabled={isUploading} />
              </label>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
