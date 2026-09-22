import { Project, Creative, Scene, Asset, ProductionNote, HistoryEvent } from '@/types/creative';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY_PROJECTS = 'creative_hub_projects_v1';
const LOCAL_STORAGE_KEY_CREATIVES = 'creative_hub_creatives_v1';
const LOCAL_STORAGE_KEY_SCENES = 'creative_hub_scenes_v1';
const LOCAL_STORAGE_KEY_ASSETS = 'creative_hub_assets_v1';
const LOCAL_STORAGE_KEY_NOTES = 'creative_hub_notes_v1';
const LOCAL_STORAGE_KEY_HISTORY = 'creative_hub_history_v1';

// Starter demo data so the app opens instantly with ready-to-use marketing creatives
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_marketing_q4',
    name: 'Campanha Q4 - Escala Digital',
    code: 'Q4',
    description: 'Criativos de alta conversão para tráfego pago (Meta Ads e TikTok Ads) com foco em UGC e Hooks disruptivos.',
    color: '#3b82f6',
    creativeCounter: 3,
    status: 'active',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'proj_ugc_saas',
    name: 'Lançamento App Mobile',
    code: 'APP',
    description: 'Vídeos estilo creator mostrando tela de smartphone, teleprompter e depoimentos reais.',
    color: '#10b981',
    creativeCounter: 2,
    status: 'active',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CREATIVES: Creative[] = [
  {
    id: 'cr_hook_disruptivo',
    projectId: 'proj_marketing_q4',
    code: 'Q4-01',
    title: 'Pare de Queimar Dinheiro em Anúncios que Ninguém Vê',
    hook: 'Se você ainda cria vídeos sem roteiro estruturado cena a cena, você está jogando 80% do seu orçamento no lixo.',
    script: `Cena 1 (Gancho): Se você ainda cria vídeos sem roteiro estruturado cena a cena, você está jogando 80% do seu orçamento no lixo.\nCena 2 (Problema): Todo dia sobem milhares de anúncios genéricos no feed. O cérebro do cliente ignora em menos de 2 segundos.\nCena 3 (Solução): O segredo dos criativos validados é o método 3S: Gancho Magnético, Demonstração sem corte e CTA direto ao ponto.\nCena 4 (Prova/B-Roll): Veja como a taxa de retenção saltou de 14% para 58% na primeira semana.\nCena 5 (CTA): Toque no botão abaixo agora para ter acesso ao Hub e montar seu primeiro criativo hoje.`,
    status: 'recording',
    tags: ['Meta Ads', 'Gancho Forte', 'Direct Response', 'B2B'],
    scenesCount: 5,
    hasAudio: true,
    approvedAssetsCount: 2,
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cr_ugc_celular',
    projectId: 'proj_marketing_q4',
    code: 'Q4-02',
    title: 'POV: Descobri como gravar vídeos sem gaguejar',
    hook: 'Eu demorava 3 horas pra gravar um vídeo de 60 segundos... até ativar o teleprompter sincronizado no celular.',
    script: `Cena 1 (POV): Eu demorava 3 horas pra gravar um vídeo de 60 segundos... até ativar o teleprompter sincronizado no celular.\nCena 2 (Agitação): Você erra uma palavra, tem que recomeçar do zero, perde a luz natural e desiste.\nCena 3 (Demonstração): Agora coloco o celular no suporte, leio no ritmo perfeito e o áudio sai limpo na hora.\nCena 4 (Chamada): Teste gratuitamente e produza 5 criativos no tempo de 1.`,
    status: 'scripted',
    tags: ['TikTok', 'POV', 'Creator', 'Teleprompter'],
    scenesCount: 4,
    hasAudio: false,
    approvedAssetsCount: 0,
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cr_app_demo',
    projectId: 'proj_ugc_saas',
    code: 'APP-01',
    title: 'Tour Rápido: Produção de Criativos no Celular e PC',
    hook: 'Você não precisa de uma equipe de 10 pessoas para ter criativos com qualidade de agência.',
    script: `Cena 1 (Visão Geral): Você não precisa de uma equipe de 10 pessoas para ter criativos com qualidade de agência.\nCena 2 (Passo a Passo): Escreva o roteiro no computador, sincronize via QR Code no celular e grave cena por cena.\nCena 3 (Entrega): Exporte o pacote completo pronto para a edição em segundos.`,
    status: 'idea',
    tags: ['Lançamento', 'Product Tour'],
    scenesCount: 3,
    hasAudio: false,
    approvedAssetsCount: 0,
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'sc_1_hook',
    creativeId: 'cr_hook_disruptivo',
    projectId: 'proj_marketing_q4',
    order: 1,
    title: 'Gancho / Pattern Interrupt (0-3s)',
    speech: 'Se você ainda cria vídeos sem roteiro estruturado cena a cena, você está jogando 80% do seu orçamento no lixo.',
    visualInstruction: 'Olhar firme para a lente, enquadramento plano médio fechado, movimento rápido de aproximação.',
    brollInstruction: 'Gráfico de custos de anúncios subindo ou tela do Gerenciador de Anúncios.',
    notes: 'Tom enérgico, sem pausas no início para capturar a retenção imediatamente.',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_2_problem',
    creativeId: 'cr_hook_disruptivo',
    projectId: 'proj_marketing_q4',
    order: 2,
    title: 'Problema & Agitação (3-15s)',
    speech: 'Todo dia sobem milhares de anúncios genéricos no feed. O cérebro do seu cliente potencial simplesmente ignora tudo em menos de dois segundos.',
    visualInstruction: 'Gesto com as mãos simulando scroll contínuo no smartphone, expressão reflexiva.',
    brollInstruction: 'Feed do Instagram passando rápido sem ninguém parar.',
    notes: 'Criar identificação com a dor do anunciante.',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_3_solution',
    creativeId: 'cr_hook_disruptivo',
    projectId: 'proj_marketing_q4',
    order: 3,
    title: 'Apresentação da Solução (15-30s)',
    speech: 'O segredo dos criativos que realmente convertem é a estrutura validada: Gancho Magnético, Demonstração clara e Chamada irresistível.',
    visualInstruction: 'Segurar celular ou apontar para a lateral onde entrará a legenda gráfica.',
    brollInstruction: 'Interface do Creative Hub dividindo roteiro e teleprompter.',
    notes: 'Transmitir autoridade e clareza.',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_4_proof',
    creativeId: 'cr_hook_disruptivo',
    projectId: 'proj_marketing_q4',
    order: 4,
    title: 'Prova Social & Retenção (30-45s)',
    speech: 'Veja como a taxa de retenção do nosso anúncio saltou de 14% para mais de 58% logo nos primeiros três dias.',
    visualInstruction: 'Sorriso sutil e confiança, apontando para tela de métricas.',
    brollInstruction: 'Gráfico de retenção de vídeo do TikTok / Reels.',
    notes: 'Falar os números com naturalidade.',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_5_cta',
    creativeId: 'cr_hook_disruptivo',
    projectId: 'proj_marketing_q4',
    order: 5,
    title: 'Chamada para Ação (45-60s)',
    speech: 'Toque no botão abaixo agora mesmo para abrir o Creative Hub e começar a gravar seus primeiros roteiros.',
    visualInstruction: 'Apontar para baixo com dedo indicador, olhar amigável e convidativo.',
    brollInstruction: 'Animação de clique no botão Saiba Mais.',
    notes: 'CTA direto, sem hesitação final.',
    ownerId: 'demo_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to check if browser localStorage is available
function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

// Local storage init
export function initializeLocalData(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS)) {
    setLocalItem(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_CREATIVES)) {
    setLocalItem(LOCAL_STORAGE_KEY_CREATIVES, INITIAL_CREATIVES);
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_SCENES)) {
    setLocalItem(LOCAL_STORAGE_KEY_SCENES, INITIAL_SCENES);
  }
}

// Repository Methods
export async function getProjects(): Promise<Project[]> {
  const user = auth.currentUser;
  if (user) {
    try {
      const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      const list: Project[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Project);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn('Firestore getProjects falling back to local storage:', e);
    }
  }
  return getLocalItem<Project[]>(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
}

export async function saveProject(project: Project): Promise<void> {
  // Update local
  const current = getLocalItem<Project[]>(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  const index = current.findIndex(p => p.id === project.id);
  const updated = index >= 0 
    ? [...current.slice(0, index), project, ...current.slice(index + 1)]
    : [project, ...current];
  setLocalItem(LOCAL_STORAGE_KEY_PROJECTS, updated);

  // Sync to Firestore if authenticated
  const user = auth.currentUser;
  if (user) {
    const path = `projects/${project.id}`;
    try {
      await setDoc(doc(db, 'projects', project.id), {
        ...project,
        ownerId: user.uid,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const current = getLocalItem<Project[]>(LOCAL_STORAGE_KEY_PROJECTS, INITIAL_PROJECTS);
  setLocalItem(LOCAL_STORAGE_KEY_PROJECTS, current.filter(p => p.id !== projectId));

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${projectId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export async function getCreatives(projectId?: string): Promise<Creative[]> {
  const user = auth.currentUser;
  if (user && projectId) {
    try {
      const q = query(
        collection(db, 'projects', projectId, 'creatives'),
        where('ownerId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const list: Creative[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Creative);
      });
      if (list.length > 0) return list;
    } catch (e) {
      console.warn('Firestore getCreatives falling back to local storage:', e);
    }
  }

  const all = getLocalItem<Creative[]>(LOCAL_STORAGE_KEY_CREATIVES, INITIAL_CREATIVES);
  return projectId ? all.filter(c => c.projectId === projectId) : all;
}

export async function saveCreative(creative: Creative): Promise<void> {
  const current = getLocalItem<Creative[]>(LOCAL_STORAGE_KEY_CREATIVES, INITIAL_CREATIVES);
  const index = current.findIndex(c => c.id === creative.id);
  const updated = index >= 0 
    ? [...current.slice(0, index), creative, ...current.slice(index + 1)]
    : [creative, ...current];
  setLocalItem(LOCAL_STORAGE_KEY_CREATIVES, updated);

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${creative.projectId}/creatives/${creative.id}`;
    try {
      await setDoc(doc(db, 'projects', creative.projectId, 'creatives', creative.id), {
        ...creative,
        ownerId: user.uid,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteCreative(projectId: string, creativeId: string): Promise<void> {
  const current = getLocalItem<Creative[]>(LOCAL_STORAGE_KEY_CREATIVES, INITIAL_CREATIVES);
  setLocalItem(LOCAL_STORAGE_KEY_CREATIVES, current.filter(c => c.id !== creativeId));

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${projectId}/creatives/${creativeId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'creatives', creativeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export async function getScenes(creativeId: string): Promise<Scene[]> {
  const user = auth.currentUser;
  // Check local first or firestore
  const allScenes = getLocalItem<Scene[]>(LOCAL_STORAGE_KEY_SCENES, INITIAL_SCENES);
  const filtered = allScenes.filter(s => s.creativeId === creativeId).sort((a, b) => a.order - b.order);
  return filtered;
}

export async function saveScene(scene: Scene): Promise<void> {
  const current = getLocalItem<Scene[]>(LOCAL_STORAGE_KEY_SCENES, INITIAL_SCENES);
  const index = current.findIndex(s => s.id === scene.id);
  const updated = index >= 0 
    ? [...current.slice(0, index), scene, ...current.slice(index + 1)]
    : [...current, scene];
  setLocalItem(LOCAL_STORAGE_KEY_SCENES, updated);

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${scene.projectId}/creatives/${scene.creativeId}/scenes/${scene.id}`;
    try {
      await setDoc(doc(db, 'projects', scene.projectId, 'creatives', scene.creativeId, 'scenes', scene.id), {
        ...scene,
        ownerId: user.uid,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteScene(projectId: string, creativeId: string, sceneId: string): Promise<void> {
  const current = getLocalItem<Scene[]>(LOCAL_STORAGE_KEY_SCENES, INITIAL_SCENES);
  setLocalItem(LOCAL_STORAGE_KEY_SCENES, current.filter(s => s.id !== sceneId));

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${projectId}/creatives/${creativeId}/scenes/${sceneId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'creatives', creativeId, 'scenes', sceneId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

// Assets Management (Takes, Recordings, Drafts)
export async function getAssets(creativeId: string): Promise<Asset[]> {
  const all = getLocalItem<Asset[]>(LOCAL_STORAGE_KEY_ASSETS, []);
  return all.filter(a => a.creativeId === creativeId);
}

export async function saveAsset(asset: Asset): Promise<void> {
  const current = getLocalItem<Asset[]>(LOCAL_STORAGE_KEY_ASSETS, []);
  const index = current.findIndex(a => a.id === asset.id);
  const updated = index >= 0
    ? [...current.slice(0, index), asset, ...current.slice(index + 1)]
    : [asset, ...current];
  setLocalItem(LOCAL_STORAGE_KEY_ASSETS, updated);

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${asset.projectId}/creatives/${asset.creativeId}/assets/${asset.id}`;
    try {
      await setDoc(doc(db, 'projects', asset.projectId, 'creatives', asset.creativeId, 'assets', asset.id), {
        ...asset,
        ownerId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteAsset(projectId: string, creativeId: string, assetId: string): Promise<void> {
  const current = getLocalItem<Asset[]>(LOCAL_STORAGE_KEY_ASSETS, []);
  setLocalItem(LOCAL_STORAGE_KEY_ASSETS, current.filter(a => a.id !== assetId));

  const user = auth.currentUser;
  if (user) {
    const path = `projects/${projectId}/creatives/${creativeId}/assets/${assetId}`;
    try {
      await deleteDoc(doc(db, 'projects', projectId, 'creatives', creativeId, 'assets', assetId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
