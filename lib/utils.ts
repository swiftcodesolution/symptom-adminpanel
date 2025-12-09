import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  defaultPersonalInfo,
  mockPersonalInfo,
  PersonalInfo,
} from "./mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export const getPersonalInfo = (userId: string): PersonalInfo | null => {
  return mockPersonalInfo.find((p) => p.userId === userId) || null;
};

export const getPersonalInfoWithDefaults = (
  userId: string
): Omit<PersonalInfo, "id" | "userId"> => {
  const info = mockPersonalInfo.find((p) => p.userId === userId);

  if (info) {
    const { ...rest } = info;
    return rest;
  }
  return defaultPersonalInfo;
};
