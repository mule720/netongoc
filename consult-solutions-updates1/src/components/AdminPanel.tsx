import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, Pencil, Plus, Save, Trash2, X } from 'lucide-react';

type ReqStatus = 'new' | 'in_progress' | 'completed' | 'archived';
type ConsultancyRequest = { id: string; name: string; email: string; company: string; phone: string; service: string; message: string; status: ReqStatus; createdAt: string };
type ConsultancyPlanTask = { id: string; taskTitle: string; dueDate?: string | null; isCompleted: boolean; order: number };
type ContactRequest = { id: string; name: string; email: string; phone: string; message: string };
type ServiceItem = { id: string; title: string; description: string; iconKey: string; serviceAreas: string[]; order: number; isActive: boolean };
type HeroItem = { id: string; tagline: string; heading: string; description: string; ctaText: string; backgroundImageUrl: string; overlayColor: string; overlayOpacity: number; order: number; isActive: boolean };
type ClientItem = { id: string; name: string; logo: string; industry: string; isFeatured: boolean };
type CompanyStats = { clientSatisfaction: string; yearsExperience: string };
type CompanyUpdateItem = { id: string; title: string; content: string; imageUrl: string; isPublished: boolean };

const Q1 = `query { consultancyRequests { id name email company phone service message status createdAt } }`;
const Q2 = `query { contactRequests { id name email phone message } }`;
const Q3 = `query($includeInactive:Boolean){ services(includeInactive:$includeInactive){ id title description iconKey serviceAreas order isActive } }`;
const Q4 = `query($includeInactive:Boolean){ heroContents(includeInactive:$includeInactive){ id tagline heading description ctaText backgroundImageUrl overlayColor overlayOpacity order isActive } }`;
const Q5 = `query { clients { id name logo industry isFeatured } companyStats { clientSatisfaction yearsExperience } companiesServed }`;
const Q6 = `query { companyUpdates { id title content imageUrl isPublished } }`;
const Q7 = `query($consultancyId:ID!){ consultancyPlanTasks(consultancyId:$consultancyId){ id taskTitle dueDate isCompleted order } }`;
const MU1 = `mutation($id:ID!,$status:String!){ updateConsultancyRequestStatus(id:$id,status:$status){ success } }`;
const MU2 = `mutation($title:String!,$description:String,$iconKey:String,$serviceAreas:[String],$order:Int,$isActive:Boolean){ createService(title:$title,description:$description,iconKey:$iconKey,serviceAreas:$serviceAreas,order:$order,isActive:$isActive){ success } }`;
const MU3 = `mutation($id:ID!,$title:String,$description:String,$iconKey:String,$serviceAreas:[String],$order:Int,$isActive:Boolean){ updateService(id:$id,title:$title,description:$description,iconKey:$iconKey,serviceAreas:$serviceAreas,order:$order,isActive:$isActive){ success } }`;
const MU4 = `mutation($id:ID!){ deleteService(id:$id){ success } }`;
const MU5 = `mutation($tagline:String!,$heading:String!,$description:String!,$ctaText:String,$backgroundImageUrl:String,$overlayColor:String,$overlayOpacity:Float,$order:Int,$isActive:Boolean){ createHeroContent(tagline:$tagline,heading:$heading,description:$description,ctaText:$ctaText,backgroundImageUrl:$backgroundImageUrl,overlayColor:$overlayColor,overlayOpacity:$overlayOpacity,order:$order,isActive:$isActive){ success } }`;
const MU6 = `mutation($id:ID!,$tagline:String,$heading:String,$description:String,$ctaText:String,$backgroundImageUrl:String,$overlayColor:String,$overlayOpacity:Float,$order:Int,$isActive:Boolean){ updateHeroContent(id:$id,tagline:$tagline,heading:$heading,description:$description,ctaText:$ctaText,backgroundImageUrl:$backgroundImageUrl,overlayColor:$overlayColor,overlayOpacity:$overlayOpacity,order:$order,isActive:$isActive){ success } }`;
const MU7 = `mutation($id:ID!){ deleteHeroContent(id:$id){ success } }`;
const MU8 = `mutation($name:String!,$logo:String,$industry:String,$isFeatured:Boolean){ createClient(name:$name,logo:$logo,industry:$industry,isFeatured:$isFeatured){ success } }`;
const MU9 = `mutation($id:ID!,$name:String,$logo:String,$industry:String,$isFeatured:Boolean){ updateClient(id:$id,name:$name,logo:$logo,industry:$industry,isFeatured:$isFeatured){ success } }`;
const MU10 = `mutation($id:ID!){ deleteClient(id:$id){ success } }`;
const MU11 = `mutation($clientSatisfaction:String,$yearsExperience:String){ updateCompanyStats(clientSatisfaction:$clientSatisfaction,yearsExperience:$yearsExperience){ success } }`;
const MU12 = `mutation($title:String!,$content:String,$imageUrl:String,$isPublished:Boolean){ createCompanyUpdate(title:$title,content:$content,imageUrl:$imageUrl,isPublished:$isPublished){ success } }`;
const MU13 = `mutation($id:ID!,$title:String,$content:String,$imageUrl:String,$isPublished:Boolean){ updateCompanyUpdate(id:$id,title:$title,content:$content,imageUrl:$imageUrl,isPublished:$isPublished){ success } }`;
const MU14 = `mutation($id:ID!){ deleteCompanyUpdate(id:$id){ success } }`;
const MU15 = `mutation($consultancyId:ID!){ ensureConsultancyPlan(consultancyId:$consultancyId){ success } }`;
const MU16 = `mutation($consultancyId:ID!,$taskTitle:String!,$dueDate:Date,$order:Int){ createConsultancyPlanTask(consultancyId:$consultancyId,taskTitle:$taskTitle,dueDate:$dueDate,order:$order){ success } }`;
const MU17 = `mutation($id:ID!,$taskTitle:String,$dueDate:Date,$isCompleted:Boolean,$order:Int){ updateConsultancyPlanTask(id:$id,taskTitle:$taskTitle,dueDate:$dueDate,isCompleted:$isCompleted,order:$order){ success } }`;
const MU18 = `mutation($id:ID!){ deleteConsultancyPlanTask(id:$id){ success } }`;
const MU19 = `mutation($name:String!,$email:String!,$service:String!,$company:String,$phone:String,$message:String){ createConsultancyRequest(name:$name,email:$email,service:$service,company:$company,phone:$phone,message:$message){ success } }`;

const initService = { title: '', description: '', serviceAreasText: '', order: 0, isActive: true };
const initHero = { tagline: 'Growth · Strategy · Execution', heading: 'Empowering Your Business Success', description: 'Dynamic business support and consultancy services delivering exceptional solutions for growth, efficiency, and sustainability.', ctaText: 'Get Started', backgroundImageUrl: '', overlayColor: '#000000', overlayOpacityPercent: 60, order: 1, isActive: true };

export default function AdminPanel() {
  const normalizeStatus = (value: any): ReqStatus => {
    const v = String(value || '').toLowerCase().trim();
    if (v === 'new' || v === 'in_progress' || v === 'completed' || v === 'archived') return v;
    return 'new';
  };

  const { toast } = useToast();
  const [tab, setTab] = useState('consultancy');
  const [loading, setLoading] = useState(false);
  const [consultancy, setConsultancy] = useState<ConsultancyRequest[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [heroPosts, setHeroPosts] = useState<HeroItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [companiesServed, setCompaniesServed] = useState(0);
  const [companyStats, setCompanyStats] = useState<CompanyStats>({ clientSatisfaction: '98%', yearsExperience: '15+' });
  const [companyUpdates, setCompanyUpdates] = useState<CompanyUpdateItem[]>([]);
  const [openPlanFor, setOpenPlanFor] = useState<string | null>(null);
  const [planTasks, setPlanTasks] = useState<ConsultancyPlanTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [consultancyStatusFilter, setConsultancyStatusFilter] = useState<'all' | ReqStatus>('all');
  const [consultancySort, setConsultancySort] = useState<'newest' | 'oldest'>('newest');
  const [showAddConsultancy, setShowAddConsultancy] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showCreateHero, setShowCreateHero] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showSaveStats, setShowSaveStats] = useState(false);
  const [showPostUpdate, setShowPostUpdate] = useState(false);
  const [newConsultancy, setNewConsultancy] = useState({ name: '', email: '', company: '', phone: '', service: '', message: '' });

  const [newService, setNewService] = useState(initService);
  const [serviceEditId, setServiceEditId] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState(initService);

  const [newHero, setNewHero] = useState(initHero);
  const [heroEditId, setHeroEditId] = useState<string | null>(null);
  const [heroDraft, setHeroDraft] = useState(initHero);
  const [newClient, setNewClient] = useState({ name: '', logo: '', industry: '', isFeatured: true });
  const [clientEditId, setClientEditId] = useState<string | null>(null);
  const [clientDraft, setClientDraft] = useState({ name: '', logo: '', industry: '', isFeatured: true });
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '', imageUrl: '', isPublished: false });
  const [updateEditId, setUpdateEditId] = useState<string | null>(null);
  const [updateDraft, setUpdateDraft] = useState({ title: '', content: '', imageUrl: '', isPublished: false });
  const activeHero = useMemo(() => heroPosts.find(h => h.isActive), [heroPosts]);

  const gql = async (query: string, variables?: any) => {
    const r = await fetch('/graphql/', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables }) });
    const j = await r.json();
    if (j.errors?.length) throw new Error(j.errors[0].message || 'Request failed');
    return j.data;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([gql(Q1), gql(Q2), gql(Q3, { includeInactive: true }), gql(Q4, { includeInactive: true }), gql(Q5), gql(Q6)]);

      const [consultancyRes, contactRes, servicesRes, heroRes, companiesRes, updatesRes] = results;

      if (consultancyRes.status === 'fulfilled') {
        setConsultancy(
          (consultancyRes.value.consultancyRequests || []).map((item: any) => ({
            ...item,
            status: normalizeStatus(item?.status),
          }))
        );
      }
      if (contactRes.status === 'fulfilled') {
        setContacts(contactRes.value.contactRequests || []);
      }
      if (servicesRes.status === 'fulfilled') {
        setServices(
          (servicesRes.value.services || []).map((s: any) => ({
            ...s,
            serviceAreas: Array.isArray(s.serviceAreas)
              ? s.serviceAreas
              : typeof s.serviceAreas === 'string'
                ? (() => {
                    try {
                      const parsed = JSON.parse(s.serviceAreas);
                      return Array.isArray(parsed) ? parsed : [];
                    } catch {
                      return [];
                    }
                  })()
                : [],
          }))
        );
      }
      if (heroRes.status === 'fulfilled') {
        setHeroPosts(heroRes.value.heroContents || []);
      }
      if (companiesRes.status === 'fulfilled') {
        setClients(companiesRes.value.clients || []);
        setCompaniesServed(Number(companiesRes.value.companiesServed || 0));
        if (companiesRes.value.companyStats) {
          setCompanyStats({
            clientSatisfaction: companiesRes.value.companyStats.clientSatisfaction || '98%',
            yearsExperience: companiesRes.value.companyStats.yearsExperience || '15+',
          });
        }
      }
      if (updatesRes.status === 'fulfilled') {
        setCompanyUpdates(updatesRes.value.companyUpdates || []);
      }

      if (servicesRes.status === 'rejected') {
        toast({ title: 'Services load error', description: 'Could not load services list from server.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const parseAreas = (txt: string) => txt.split('\n').map(s => s.trim()).filter(Boolean);
  const resolvePreviewImageUrl = (url?: string) => {
    const value = (url || '').trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
    const normalized = value.startsWith('/') ? value : `/${value}`;
    return `${window.location.origin}${normalized}`;
  };
  const uploadHero = async (f: File, target: 'new' | 'edit') => {
    const fd = new FormData(); fd.append('file', f);
    const r = await fetch('/api/uploads/hero-background/', { method: 'POST', credentials: 'include', body: fd });
    const j = await r.json();
    if (!r.ok || !j?.url) throw new Error(j?.error || 'Upload failed');
    if (target === 'new') setNewHero(p => ({ ...p, backgroundImageUrl: j.url })); else setHeroDraft(p => ({ ...p, backgroundImageUrl: j.url }));
  };

  const loadPlan = async (consultancyId: string) => {
    await gql(MU15, { consultancyId });
    const res = await gql(Q7, { consultancyId });
    setPlanTasks(res?.consultancyPlanTasks || []);
    setOpenPlanFor(consultancyId);
  };

  const displayedConsultancy = [...consultancy]
    .filter((r) => {
      if (consultancyStatusFilter === 'all') return true;
      return normalizeStatus(r.status) === consultancyStatusFilter;
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return consultancySort === 'newest' ? bTime - aTime : aTime - bTime;
    });

  return (
    <div className="container mx-auto p-6 text-white [&_button]:font-medium [&_button]:text-white">
      <div className="mb-6">
        <div><h1 className="text-3xl font-bold">Admin Dashboard</h1><p className="text-slate-300">All sections restored + improved service editing flow.</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 mb-6">
          <TabsTrigger value="consultancy">Consultancy</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="consultancy" className="space-y-3">
          <Card className="bg-slate-900/90 border-white/10"><CardContent className="p-4"><Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={()=>setShowAddConsultancy(v=>!v)}>{showAddConsultancy ? 'Hide Add Consultancy Form' : 'Add Consultancy'}</Button>{showAddConsultancy && <div className="space-y-2 mt-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-2"><Input className="bg-slate-800" placeholder="Name" value={newConsultancy.name} onChange={e=>setNewConsultancy(p=>({...p,name:e.target.value}))}/><Input className="bg-slate-800" placeholder="Email" value={newConsultancy.email} onChange={e=>setNewConsultancy(p=>({...p,email:e.target.value}))}/><Input className="bg-slate-800" placeholder="Phone" value={newConsultancy.phone} onChange={e=>setNewConsultancy(p=>({...p,phone:e.target.value}))}/><Input className="bg-slate-800" placeholder="Company" value={newConsultancy.company} onChange={e=>setNewConsultancy(p=>({...p,company:e.target.value}))}/><Input className="bg-slate-800 md:col-span-2" placeholder="Service" value={newConsultancy.service} onChange={e=>setNewConsultancy(p=>({...p,service:e.target.value}))}/></div><Textarea className="bg-slate-800" placeholder="Message" value={newConsultancy.message} onChange={e=>setNewConsultancy(p=>({...p,message:e.target.value}))}/><Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={async()=>{await gql(MU19,{...newConsultancy}); setNewConsultancy({name:'',email:'',company:'',phone:'',service:'',message:''}); setShowAddConsultancy(false); refresh();}}><Plus className="mr-2 h-4 w-4"/>Save Consultancy</Button></div>}</CardContent></Card>

          <Card className="bg-slate-900/90 border-white/10"><CardContent className="p-4 flex flex-wrap gap-2 items-center"><Select value={consultancyStatusFilter} onValueChange={(v:any)=>setConsultancyStatusFilter(v)}><SelectTrigger className="w-44 bg-slate-800"><SelectValue placeholder="Filter by status"/></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select><Select value={consultancySort} onValueChange={(v:any)=>setConsultancySort(v)}><SelectTrigger className="w-52 bg-slate-800"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="newest">Newest Submitted</SelectItem><SelectItem value="oldest">Oldest Submitted</SelectItem></SelectContent></Select></CardContent></Card>

          {displayedConsultancy.map(r => <Card key={r.id} className="bg-slate-900/90 border-white/10"><CardContent className="p-4 space-y-3"><div className="flex justify-between gap-3"><div className="space-y-1"><p><span className="text-slate-400">Name:</span> <span className="font-semibold">{r.name}</span></p><p><span className="text-slate-400">Email:</span> {r.email}</p><p><span className="text-slate-400">Phone:</span> {r.phone || '-'}</p><p><span className="text-slate-400">Company:</span> {r.company || '-'}</p><p><span className="text-slate-400">Service:</span> {r.service}</p><p><span className="text-slate-400">Submitted:</span> {new Date(r.createdAt).toLocaleString()}</p><p><span className="text-slate-400">Current Status:</span> <span className="font-semibold text-cyan-300">{normalizeStatus(r.status).replace('_',' ')}</span></p><p className="text-sm text-slate-300"><span className="text-slate-400">Message:</span> {r.message || '-'}</p></div><div className="flex flex-col gap-2"><Select value={normalizeStatus(r.status)} onValueChange={async (status: ReqStatus)=>{const normalized = normalizeStatus(status); setConsultancy(prev=>prev.map(item=>item.id===r.id?{...item,status: normalized}:item)); await gql(MU1,{id:r.id,status: normalized}); await refresh(); toast({title:'Status updated',description:`${r.name} is now ${normalized.replace('_',' ')}`});}}><SelectTrigger className="w-44 bg-slate-800 border-slate-600 text-white"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="new">New</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select><Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={()=>loadPlan(r.id)}>Open Plan</Button></div></div>{openPlanFor===r.id && <div className="rounded-lg border border-white/10 p-3 space-y-2"><p className="font-semibold">Project Plan</p><div className="grid grid-cols-1 md:grid-cols-3 gap-2"><Input className="bg-slate-800 md:col-span-2" placeholder="Milestone / task" value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} /><Input className="bg-slate-800" type="date" value={newTaskDueDate} onChange={e=>setNewTaskDueDate(e.target.value)} /></div><Button className="bg-amber-500 text-white hover:bg-amber-400" onClick={async()=>{if(!newTaskTitle.trim()) return; await gql(MU16,{consultancyId:r.id,taskTitle:newTaskTitle,dueDate:newTaskDueDate||null,order:planTasks.length}); setNewTaskTitle(''); setNewTaskDueDate(''); await loadPlan(r.id);}}><Plus className="mr-2 h-4 w-4"/>Add Milestone</Button><div className="space-y-2">{planTasks.map((t)=><div key={t.id} className="flex items-center gap-2"><input type="checkbox" checked={!!t.isCompleted} onChange={async e=>{await gql(MU17,{id:t.id,isCompleted:e.target.checked}); await loadPlan(r.id);}} /><Input className="bg-slate-800" value={t.taskTitle} onChange={async e=>{await gql(MU17,{id:t.id,taskTitle:e.target.value}); await loadPlan(r.id);}} /><Input className="bg-slate-800 w-44" type="date" value={t.dueDate || ''} onChange={async e=>{await gql(MU17,{id:t.id,dueDate:e.target.value || null}); await loadPlan(r.id);}} /><Button variant="destructive" size="sm" className="bg-rose-700 text-white hover:bg-rose-600" onClick={async()=>{await gql(MU18,{id:t.id}); await loadPlan(r.id);}}><Trash2 className="h-4 w-4"/></Button></div>)}</div></div>}</CardContent></Card>)}
        </TabsContent>

        <TabsContent value="contact" className="space-y-3">
          {contacts.map(r => <Card key={r.id} className="bg-slate-900/90 border-white/10"><CardContent className="p-4 space-y-1"><p><span className="text-slate-400">Name:</span> <span className="font-semibold">{r.name}</span></p><p><span className="text-slate-400">Email:</span> {r.email}</p><p><span className="text-slate-400">Phone:</span> {r.phone || '-'}</p><p className="text-slate-300"><span className="text-slate-400">Message:</span> {r.message || '-'}</p></CardContent></Card>)}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {!serviceEditId && <>
            <Card className="bg-slate-900/90 border-white/10"><CardContent className="p-4"><Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={()=>setShowAddService(v=>!v)}>{showAddService ? 'Hide Add Service' : 'Add Service'}</Button>{showAddService && <div className="space-y-2 mt-4"><Input className="bg-slate-800" placeholder="Title" value={newService.title} onChange={e=>setNewService(p=>({...p,title:e.target.value}))}/><Textarea className="bg-slate-800" placeholder="Description" value={newService.description} onChange={e=>setNewService(p=>({...p,description:e.target.value}))}/><Textarea className="bg-slate-800" placeholder="Service areas (one per line)" value={newService.serviceAreasText} onChange={e=>setNewService(p=>({...p,serviceAreasText:e.target.value}))}/><Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={async()=>{await gql(MU2,{title:newService.title,description:newService.description,iconKey:'briefcase',serviceAreas:parseAreas(newService.serviceAreasText),order:newService.order,isActive:newService.isActive}); setNewService(initService); setShowAddService(false); refresh();}}><Plus className="mr-2 h-4 w-4"/>Save Service</Button></div>}</CardContent></Card>
            <Card className="bg-slate-900/90 border-white/10"><CardHeader><CardTitle>All Services ({services.length})</CardTitle></CardHeader><CardContent className="space-y-2">{services.map(s=><div key={s.id} className="rounded-lg border border-white/10 p-3 flex justify-between gap-2"><div><p className="font-semibold">{s.title}</p><p className="text-sm text-slate-300">{s.description}</p></div><div className="flex gap-2"><Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={()=>{setServiceEditId(s.id); setServiceDraft({title:s.title,description:s.description,serviceAreasText:(s.serviceAreas||[]).join('\n'),order:s.order,isActive:s.isActive});}}><Pencil className="mr-2 h-4 w-4"/>Edit</Button><Button variant="destructive" className="bg-rose-700 hover:bg-rose-600 text-white" onClick={async()=>{await gql(MU4,{id:s.id}); refresh();}}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></div></div>)}</CardContent></Card>
          </>}

          {serviceEditId && <Card className="bg-slate-900/90 border-white/10"><CardHeader><CardTitle>Service Editor</CardTitle><CardDescription>Edit on this dedicated page then preview before save.</CardDescription></CardHeader><CardContent className="space-y-3"><Input className="bg-slate-800" value={serviceDraft.title} onChange={e=>setServiceDraft(p=>({...p,title:e.target.value}))}/><Textarea className="bg-slate-800" value={serviceDraft.description} onChange={e=>setServiceDraft(p=>({...p,description:e.target.value}))}/><Textarea className="bg-slate-800" value={serviceDraft.serviceAreasText} onChange={e=>setServiceDraft(p=>({...p,serviceAreasText:e.target.value}))}/>
            <Card className="bg-slate-950 border-cyan-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4"/>Preview</CardTitle></CardHeader><CardContent><h3 className="text-lg font-semibold">{serviceDraft.title || 'Service title'}</h3><p className="text-slate-300">{serviceDraft.description || 'Service description'}</p><ul className="mt-2 list-disc pl-5 text-slate-300">{parseAreas(serviceDraft.serviceAreasText).map((a,i)=><li key={i}>{a}</li>)}</ul></CardContent></Card>
            <div className="flex gap-2"><Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={async()=>{await gql(MU3,{id:serviceEditId,title:serviceDraft.title,description:serviceDraft.description,iconKey:'briefcase',serviceAreas:parseAreas(serviceDraft.serviceAreasText),order:serviceDraft.order,isActive:serviceDraft.isActive}); setServiceEditId(null); setServiceDraft(initService); refresh();}}><Save className="mr-2 h-4 w-4"/>Save</Button><Button variant="outline" className="border-slate-500 text-white hover:bg-slate-700" onClick={()=>{setServiceEditId(null); setServiceDraft(initService);}}><X className="mr-2 h-4 w-4"/>Back to list</Button></div>
          </CardContent></Card>}
        </TabsContent>

        <TabsContent value="hero" className="space-y-4">
          <Card className="bg-slate-900/90 border-white/10"><CardContent className="p-4"><Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={()=>setShowCreateHero(v=>!v)}>{showCreateHero ? 'Hide Create Hero' : 'Create Hero'}</Button>{showCreateHero && <div className="space-y-2 mt-4"><Input className="bg-slate-800" value={newHero.tagline} onChange={e=>setNewHero(p=>({...p,tagline:e.target.value}))}/><Input className="bg-slate-800" value={newHero.heading} onChange={e=>setNewHero(p=>({...p,heading:e.target.value}))}/><Textarea className="bg-slate-800" value={newHero.description} onChange={e=>setNewHero(p=>({...p,description:e.target.value}))}/><Input className="bg-slate-800" value={newHero.ctaText} onChange={e=>setNewHero(p=>({...p,ctaText:e.target.value}))}/><Input className="bg-slate-800" value={newHero.backgroundImageUrl} onChange={e=>setNewHero(p=>({...p,backgroundImageUrl:e.target.value}))} placeholder="Background URL"/><Input type="file" accept="image/*" className="bg-slate-800" onChange={async e=>{const f=e.target.files?.[0]; if(!f) return; await uploadHero(f,'new');}}/><div className="grid grid-cols-2 gap-2"><Input type="color" className="h-10 p-1 bg-slate-800" value={newHero.overlayColor} onChange={e=>setNewHero(p=>({...p,overlayColor:e.target.value}))}/><Input type="range" min={0} max={100} className="bg-slate-800" value={newHero.overlayOpacityPercent} onChange={e=>setNewHero(p=>({...p,overlayOpacityPercent:Number(e.target.value)}))}/></div><Card className="bg-slate-950 border-cyan-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4"/>Create Preview</CardTitle></CardHeader><CardContent><div className="relative rounded-lg min-h-[200px] p-6" style={{backgroundImage:resolvePreviewImageUrl(newHero.backgroundImageUrl)?`url(${resolvePreviewImageUrl(newHero.backgroundImageUrl)})`:'none',backgroundSize:'cover',backgroundPosition:'center'}}><div className="absolute inset-0 rounded-lg" style={{backgroundColor:newHero.overlayColor,opacity:newHero.overlayOpacityPercent/100}}/><div className="relative z-10"><p className="text-xs uppercase text-cyan-300">{newHero.tagline}</p><h3 className="text-2xl font-bold mt-2">{newHero.heading}</h3><p className="text-slate-200 mt-2">{newHero.description}</p><Button className="mt-4 bg-amber-500 text-black hover:bg-amber-400">{newHero.ctaText}</Button></div></div><p className="mt-2 text-xs text-slate-400">Image source: {resolvePreviewImageUrl(newHero.backgroundImageUrl) || 'No image selected yet'}</p></CardContent></Card><Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={async()=>{await gql(MU5,{...newHero,overlayOpacity:Math.max(0,Math.min(1,newHero.overlayOpacityPercent/100))}); setNewHero(initHero); setShowCreateHero(false); refresh();}}><Plus className="mr-2 h-4 w-4"/>Save Hero</Button></div>}</CardContent></Card>
          <Card className="bg-slate-900/90 border-white/10"><CardHeader><CardTitle>Hero Posts</CardTitle><CardDescription>Active: {activeHero?.heading || 'None'}</CardDescription></CardHeader><CardContent className="space-y-2">{heroPosts.map(h=><div key={h.id} className="rounded-lg border border-white/10 p-3"><div className="flex justify-between items-center gap-2"><p className="font-semibold">{h.heading}</p><div className="flex gap-2"><Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={()=>{setHeroEditId(prev=>prev===h.id?null:h.id); setHeroDraft({tagline:h.tagline,heading:h.heading,description:h.description,ctaText:h.ctaText,backgroundImageUrl:h.backgroundImageUrl||'',overlayColor:h.overlayColor||'#000000',overlayOpacityPercent:Math.round((h.overlayOpacity??0.6)*100),order:h.order,isActive:h.isActive});}}>Edit</Button><Button variant="destructive" className="bg-rose-700 hover:bg-rose-600 text-white" onClick={async()=>{await gql(MU7,{id:h.id}); if(heroEditId===h.id) setHeroEditId(null); refresh();}}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></div></div>{heroEditId===h.id && <div className="mt-4 space-y-2 border-t border-white/10 pt-4"><Input className="bg-slate-800" value={heroDraft.tagline} onChange={e=>setHeroDraft(p=>({...p,tagline:e.target.value}))}/><Input className="bg-slate-800" value={heroDraft.heading} onChange={e=>setHeroDraft(p=>({...p,heading:e.target.value}))}/><Textarea className="bg-slate-800" value={heroDraft.description} onChange={e=>setHeroDraft(p=>({...p,description:e.target.value}))}/><Input className="bg-slate-800" value={heroDraft.ctaText} onChange={e=>setHeroDraft(p=>({...p,ctaText:e.target.value}))}/><Input className="bg-slate-800" value={heroDraft.backgroundImageUrl} onChange={e=>setHeroDraft(p=>({...p,backgroundImageUrl:e.target.value}))}/><Input type="file" accept="image/*" className="bg-slate-800" onChange={async e=>{const f=e.target.files?.[0]; if(!f) return; await uploadHero(f,'edit');}}/><div className="grid grid-cols-2 gap-2"><Input type="color" className="h-10 p-1 bg-slate-800" value={heroDraft.overlayColor} onChange={e=>setHeroDraft(p=>({...p,overlayColor:e.target.value}))}/><Input type="range" min={0} max={100} className="bg-slate-800" value={heroDraft.overlayOpacityPercent} onChange={e=>setHeroDraft(p=>({...p,overlayOpacityPercent:Number(e.target.value)}))}/></div><Card className="bg-slate-950 border-cyan-500/30"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4"/>Preview</CardTitle></CardHeader><CardContent><div className="relative rounded-lg min-h-[200px] p-6" style={{backgroundImage:resolvePreviewImageUrl(heroDraft.backgroundImageUrl)?`url(${resolvePreviewImageUrl(heroDraft.backgroundImageUrl)})`:'none',backgroundSize:'cover',backgroundPosition:'center'}}><div className="absolute inset-0 rounded-lg" style={{backgroundColor:heroDraft.overlayColor,opacity:heroDraft.overlayOpacityPercent/100}}/><div className="relative z-10"><p className="text-xs uppercase text-cyan-300">{heroDraft.tagline}</p><h3 className="text-2xl font-bold mt-2">{heroDraft.heading}</h3><p className="text-slate-200 mt-2">{heroDraft.description}</p><Button className="mt-4 bg-amber-500 text-black hover:bg-amber-400">{heroDraft.ctaText}</Button></div></div><p className="mt-2 text-xs text-slate-400">Image source: {resolvePreviewImageUrl(heroDraft.backgroundImageUrl) || 'No image selected yet'}</p></CardContent></Card><div className="flex gap-2"><Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={async()=>{await gql(MU6,{id:h.id,...heroDraft,overlayOpacity:Math.max(0,Math.min(1,heroDraft.overlayOpacityPercent/100))}); setHeroEditId(null); refresh();}}><Save className="mr-2 h-4 w-4"/>Save Hero</Button><Button variant="outline" className="border-slate-500 text-white hover:bg-slate-700" onClick={()=>setHeroEditId(null)}><X className="mr-2 h-4 w-4"/>Close</Button></div></div>}</div>)}</CardContent></Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card className="bg-slate-900/90 border-white/10"><CardHeader><CardTitle>Company Stats</CardTitle><CardDescription>Companies Served is automatic from database.</CardDescription></CardHeader><CardContent className="space-y-2"><Input className="bg-slate-800" value={`${companiesServed}`} readOnly /><Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={()=>setShowSaveStats(v=>!v)}>{showSaveStats ? 'Hide Stats Editor' : 'Save Stats'}</Button>{showSaveStats && <div className="space-y-2"><Input className="bg-slate-800" value={companyStats.clientSatisfaction} onChange={e=>setCompanyStats(p=>({...p,clientSatisfaction:e.target.value}))} placeholder="Client Satisfaction e.g. 98%"/><Input className="bg-slate-800" value={companyStats.yearsExperience} onChange={e=>setCompanyStats(p=>({...p,yearsExperience:e.target.value}))} placeholder="Years Experience e.g. 15+"/><Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={async()=>{await gql(MU11,{clientSatisfaction:companyStats.clientSatisfaction,yearsExperience:companyStats.yearsExperience}); setShowSaveStats(false); refresh();}}><Save className="mr-2 h-4 w-4"/>Save Stats</Button></div>}</CardContent></Card>

          {!clientEditId && <Card className="bg-slate-900/90 border-white/10"><CardContent className="p-4"><Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={()=>setShowAddCompany(v=>!v)}>{showAddCompany ? 'Hide Add Company' : 'Add Company'}</Button>{showAddCompany && <div className="space-y-2 mt-4"><Input className="bg-slate-800" placeholder="Company Name" value={newClient.name} onChange={e=>setNewClient(p=>({...p,name:e.target.value}))}/><Input className="bg-slate-800" placeholder="Logo (emoji or url)" value={newClient.logo} onChange={e=>setNewClient(p=>({...p,logo:e.target.value}))}/><Input className="bg-slate-800" placeholder="Industry" value={newClient.industry} onChange={e=>setNewClient(p=>({...p,industry:e.target.value}))}/><Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={async()=>{await gql(MU8,{name:newClient.name,logo:newClient.logo,industry:newClient.industry,isFeatured:newClient.isFeatured}); setNewClient({name:'',logo:'',industry:'',isFeatured:true}); setShowAddCompany(false); refresh();}}><Plus className="mr-2 h-4 w-4"/>Save Company</Button></div>}</CardContent></Card>}

          <Card className="bg-slate-900/90 border-white/10"><CardHeader><CardTitle>Companies We've Worked With ({clients.length})</CardTitle></CardHeader><CardContent className="space-y-2">{clients.map(c=><div key={c.id} className="rounded-lg border border-white/10 p-3">{clientEditId===c.id ? <div className="space-y-2"><Input className="bg-slate-800" value={clientDraft.name} onChange={e=>setClientDraft(p=>({...p,name:e.target.value}))}/><Input className="bg-slate-800" value={clientDraft.logo} onChange={e=>setClientDraft(p=>({...p,logo:e.target.value}))}/><Input className="bg-slate-800" value={clientDraft.industry} onChange={e=>setClientDraft(p=>({...p,industry:e.target.value}))}/><div className="flex gap-2"><Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={async()=>{await gql(MU9,{id:c.id,name:clientDraft.name,logo:clientDraft.logo,industry:clientDraft.industry,isFeatured:clientDraft.isFeatured}); setClientEditId(null); refresh();}}><Save className="mr-2 h-4 w-4"/>Save</Button><Button variant="outline" className="border-slate-500 text-white hover:bg-slate-700" onClick={()=>setClientEditId(null)}><X className="mr-2 h-4 w-4"/>Cancel</Button></div></div> : <div className="flex justify-between gap-2"><div><p className="font-semibold">{c.name}</p><p className="text-sm text-slate-300">{c.industry}</p></div><div className="flex gap-2"><Button className="bg-indigo-600 text-white hover:bg-indigo-500" onClick={()=>{setClientEditId(c.id); setClientDraft({name:c.name,logo:c.logo,industry:c.industry,isFeatured:c.isFeatured});}}><Pencil className="mr-2 h-4 w-4"/>Edit</Button><Button variant="destructive" className="bg-rose-700 hover:bg-rose-600 text-white" onClick={async()=>{await gql(MU10,{id:c.id}); refresh();}}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></div></div>}</div>)}</CardContent></Card>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          {!updateEditId && <Card className="bg-slate-900/90 border-white/10"><CardContent className="p-4"><Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={()=>setShowPostUpdate(v=>!v)}>{showPostUpdate ? 'Hide Post Update' : 'Post Company Update'}</Button>{showPostUpdate && <div className="space-y-2 mt-4"><Input className="bg-slate-800" placeholder="Title" value={newUpdate.title} onChange={e=>setNewUpdate(p=>({...p,title:e.target.value}))}/><Textarea className="bg-slate-800" placeholder="Content" value={newUpdate.content} onChange={e=>setNewUpdate(p=>({...p,content:e.target.value}))}/><Input className="bg-slate-800" placeholder="Image URL (optional)" value={newUpdate.imageUrl} onChange={e=>setNewUpdate(p=>({...p,imageUrl:e.target.value}))}/><div className="flex gap-2"><Button variant={newUpdate.isPublished ? 'default':'outline'} onClick={()=>setNewUpdate(p=>({...p,isPublished:!p.isPublished}))}>{newUpdate.isPublished ? 'Published':'Draft'}</Button><Button className="bg-emerald-600 text-white hover:bg-emerald-500" onClick={async()=>{await gql(MU12,{title:newUpdate.title,content:newUpdate.content,imageUrl:newUpdate.imageUrl,isPublished:newUpdate.isPublished}); setNewUpdate({title:'',content:'',imageUrl:'',isPublished:false}); setShowPostUpdate(false); refresh();}}><Plus className="mr-2 h-4 w-4"/>Save Update</Button></div></div>}</CardContent></Card>}

          <Card className="bg-slate-900/90 border-white/10"><CardHeader><CardTitle>Company Updates ({companyUpdates.length})</CardTitle></CardHeader><CardContent className="space-y-2">{companyUpdates.map(u=><div key={u.id} className="rounded-lg border border-white/10 p-3">{updateEditId===u.id ? <div className="space-y-2"><Input className="bg-slate-800" value={updateDraft.title} onChange={e=>setUpdateDraft(p=>({...p,title:e.target.value}))}/><Textarea className="bg-slate-800" value={updateDraft.content} onChange={e=>setUpdateDraft(p=>({...p,content:e.target.value}))}/><Input className="bg-slate-800" value={updateDraft.imageUrl} onChange={e=>setUpdateDraft(p=>({...p,imageUrl:e.target.value}))}/><div className="flex gap-2"><Button className={updateDraft.isPublished ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'} onClick={()=>setUpdateDraft(p=>({...p,isPublished:!p.isPublished}))}>{updateDraft.isPublished ? 'Published':'Draft'}</Button><Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={async()=>{await gql(MU13,{id:u.id,title:updateDraft.title,content:updateDraft.content,imageUrl:updateDraft.imageUrl,isPublished:updateDraft.isPublished}); setUpdateEditId(null); refresh();}}><Save className="mr-2 h-4 w-4"/>Save</Button><Button variant="outline" className="border-slate-500 text-white hover:bg-slate-700" onClick={()=>setUpdateEditId(null)}><X className="mr-2 h-4 w-4"/>Cancel</Button></div></div> : <div className="flex justify-between gap-2"><div><p className="font-semibold">{u.title}</p><p className="text-sm text-slate-300 line-clamp-2">{u.content}</p><p className="text-xs text-slate-400">{u.isPublished ? 'Published' : 'Draft'}</p></div><div className="flex gap-2"><Button variant="outline" className="border-slate-500 text-white hover:bg-slate-700" onClick={()=>{setUpdateEditId(u.id); setUpdateDraft({title:u.title,content:u.content,imageUrl:u.imageUrl,isPublished:u.isPublished});}}><Pencil className="mr-2 h-4 w-4"/>Edit</Button><Button variant="destructive" className="bg-rose-700 hover:bg-rose-600 text-white" onClick={async()=>{await gql(MU14,{id:u.id}); refresh();}}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button></div></div>}</div>)}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
