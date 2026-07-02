"use client";

import { getStoredAuth } from "./auth";
import { OwnershipCard } from "./wms-api";

const STORAGE_KEY_PREFIX = "ops_team_members_";

function storageKey(): string {
  const auth = getStoredAuth();
  const userId = auth?.user?.userId || "anonymous";
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  department?: string;
  addedAt: string;
}

export function getMyTeamMembers(): TeamMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    return JSON.parse(raw) as TeamMember[];
  } catch {
    return [];
  }
}

export function saveMyTeamMembers(members: TeamMember[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), JSON.stringify(members));
}

export function addTeamMember(card: OwnershipCard): TeamMember {
  const member: TeamMember = {
    id: card.id || card.employeeId || card.userId || crypto.randomUUID(),
    name: card.displayName || card.name || "Unknown",
    role: card.role,
    department: card.department,
    addedAt: new Date().toISOString(),
  };
  const current = getMyTeamMembers();
  if (!current.find((m) => m.id === member.id)) {
    saveMyTeamMembers([...current, member]);
  }
  return member;
}

export function removeTeamMember(id: string): void {
  const current = getMyTeamMembers();
  saveMyTeamMembers(current.filter((m) => m.id !== id));
}

export function isOnMyTeam(id: string): boolean {
  return getMyTeamMembers().some((m) => m.id === id);
}
