export type ProjectStatus = 'active' | 'archived';

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  creativeCounter: number;
  status: ProjectStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreativeStatus = 'idea' | 'scripted' | 'recording' | 'done' | 'approved';

export interface Creative {
  id: string;
  projectId: string;
  code: string;
  title: string;
  hook: string;
  script: string;
  status: CreativeStatus;
  tags: string[];
  scenesCount: number;
  hasAudio: boolean;
  approvedAssetsCount: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scene {
  id: string;
  creativeId: string;
  projectId: string;
  order: number;
  title: string;
  speech: string;
  visualInstruction?: string;
  brollInstruction?: string;
  notes?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 'audio' | 'video' | 'image' | 'document';
export type AssetSource = 'upload' | 'recorded' | 'camera';

export interface Asset {
  id: string;
  creativeId: string;
  projectId: string;
  sceneId?: string;
  type: AssetType;
  originalName: string;
  url: string;
  storagePath?: string;
  duration?: string;
  fileSize?: number;
  isApproved: boolean;
  source: AssetSource;
  notes?: string;
  ownerId: string;
  createdAt: string;
}

export interface ProductionNote {
  id: string;
  creativeId: string;
  projectId: string;
  content: string;
  ownerId: string;
  updatedAt: string;
}

export interface HistoryEvent {
  id: string;
  creativeId: string;
  projectId: string;
  timestamp: string;
  description: string;
  author: string;
  ownerId: string;
}
