import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type FileType = "image" | "video" | "audio" | "document" | "apk" | "zip" | "other";

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  type: FileType;
  extension: string;
  modifiedAt: Date;
  isHidden: boolean;
  isDirectory: boolean;
  children?: FileItem[];
}

export type SortBy = "name" | "size" | "date";
export type SortOrder = "asc" | "desc";

interface FileManagerContextType {
  currentPath: string;
  files: FileItem[];
  recentFiles: FileItem[];
  favorites: FileItem[];
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  showHidden: boolean;
  selectedFiles: Set<string>;
  isSelecting: boolean;
  currentDir: FileItem[];

  setCurrentPath: (path: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleHidden: () => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setIsSelecting: (val: boolean) => void;

  addToFavorites: (file: FileItem) => void;
  removeFromFavorites: (fileId: string) => void;
  isFavorite: (fileId: string) => boolean;
  addToRecent: (file: FileItem) => void;

  copyFile: (file: FileItem, destPath: string) => Promise<void>;
  moveFile: (file: FileItem, destPath: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;

  getStorageInfo: () => { used: number; total: number; byType: Record<FileType, number> };
}

const FileManagerContext = createContext<FileManagerContextType | null>(null);

export function useFileManager() {
  const ctx = useContext(FileManagerContext);
  if (!ctx) throw new Error("useFileManager must be used within FileManagerProvider");
  return ctx;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getFileType(extension: string): FileType {
  const ext = extension.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "heic", "svg", "bmp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(ext)) return "video";
  if (["mp3", "wav", "aac", "flac", "m4a", "ogg"].includes(ext)) return "audio";
  if (["pdf", "doc", "docx", "txt", "xlsx", "pptx", "csv", "rtf", "pages", "numbers"].includes(ext)) return "document";
  if (ext === "apk") return "apk";
  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) return "zip";
  return "other";
}

function generateMockFiles(): FileItem[] {
  const now = new Date();
  const makeDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  return [
    {
      id: "1", name: "Documents", path: "/Documents", size: 0, type: "other",
      extension: "", modifiedAt: makeDate(1), isHidden: false, isDirectory: true,
      children: [
        { id: "1-1", name: "Report_Q4.pdf", path: "/Documents/Report_Q4.pdf", size: 2456789, type: "document", extension: "pdf", modifiedAt: makeDate(2), isHidden: false, isDirectory: false },
        { id: "1-2", name: "Budget_2024.xlsx", path: "/Documents/Budget_2024.xlsx", size: 523456, type: "document", extension: "xlsx", modifiedAt: makeDate(5), isHidden: false, isDirectory: false },
        { id: "1-3", name: "Notes.txt", path: "/Documents/Notes.txt", size: 2345, type: "document", extension: "txt", modifiedAt: makeDate(0), isHidden: false, isDirectory: false },
        { id: "1-4", name: "Presentation.pptx", path: "/Documents/Presentation.pptx", size: 8123456, type: "document", extension: "pptx", modifiedAt: makeDate(3), isHidden: false, isDirectory: false },
        { id: "1-5", name: ".hidden_doc", path: "/Documents/.hidden_doc", size: 1234, type: "other", extension: "", modifiedAt: makeDate(10), isHidden: true, isDirectory: false },
      ]
    },
    {
      id: "2", name: "Pictures", path: "/Pictures", size: 0, type: "other",
      extension: "", modifiedAt: makeDate(0), isHidden: false, isDirectory: true,
      children: [
        { id: "2-1", name: "vacation_2024.jpg", path: "/Pictures/vacation_2024.jpg", size: 4523456, type: "image", extension: "jpg", modifiedAt: makeDate(1), isHidden: false, isDirectory: false },
        { id: "2-2", name: "family_photo.png", path: "/Pictures/family_photo.png", size: 3456789, type: "image", extension: "png", modifiedAt: makeDate(3), isHidden: false, isDirectory: false },
        { id: "2-3", name: "screenshot.png", path: "/Pictures/screenshot.png", size: 987654, type: "image", extension: "png", modifiedAt: makeDate(0), isHidden: false, isDirectory: false },
        { id: "2-4", name: "wallpaper.jpg", path: "/Pictures/wallpaper.jpg", size: 6789012, type: "image", extension: "jpg", modifiedAt: makeDate(7), isHidden: false, isDirectory: false },
      ]
    },
    {
      id: "3", name: "Videos", path: "/Videos", size: 0, type: "other",
      extension: "", modifiedAt: makeDate(2), isHidden: false, isDirectory: true,
      children: [
        { id: "3-1", name: "birthday_party.mp4", path: "/Videos/birthday_party.mp4", size: 156789012, type: "video", extension: "mp4", modifiedAt: makeDate(5), isHidden: false, isDirectory: false },
        { id: "3-2", name: "tutorial.mov", path: "/Videos/tutorial.mov", size: 78456123, type: "video", extension: "mov", modifiedAt: makeDate(10), isHidden: false, isDirectory: false },
      ]
    },
    {
      id: "4", name: "Music", path: "/Music", size: 0, type: "other",
      extension: "", modifiedAt: makeDate(3), isHidden: false, isDirectory: true,
      children: [
        { id: "4-1", name: "favorite_song.mp3", path: "/Music/favorite_song.mp3", size: 8234567, type: "audio", extension: "mp3", modifiedAt: makeDate(2), isHidden: false, isDirectory: false },
        { id: "4-2", name: "podcast_ep1.m4a", path: "/Music/podcast_ep1.m4a", size: 45678901, type: "audio", extension: "m4a", modifiedAt: makeDate(6), isHidden: false, isDirectory: false },
        { id: "4-3", name: "ambient.flac", path: "/Music/ambient.flac", size: 34567890, type: "audio", extension: "flac", modifiedAt: makeDate(14), isHidden: false, isDirectory: false },
      ]
    },
    {
      id: "5", name: "Downloads", path: "/Downloads", size: 0, type: "other",
      extension: "", modifiedAt: makeDate(0), isHidden: false, isDirectory: true,
      children: [
        { id: "5-1", name: "app_installer.apk", path: "/Downloads/app_installer.apk", size: 45678901, type: "apk", extension: "apk", modifiedAt: makeDate(1), isHidden: false, isDirectory: false },
        { id: "5-2", name: "archive.zip", path: "/Downloads/archive.zip", size: 23456789, type: "zip", extension: "zip", modifiedAt: makeDate(2), isHidden: false, isDirectory: false },
        { id: "5-3", name: "setup.apk", path: "/Downloads/setup.apk", size: 67890123, type: "apk", extension: "apk", modifiedAt: makeDate(0), isHidden: false, isDirectory: false },
        { id: "5-4", name: "backup.tar.gz", path: "/Downloads/backup.tar.gz", size: 89012345, type: "zip", extension: "gz", modifiedAt: makeDate(4), isHidden: false, isDirectory: false },
      ]
    },
    {
      id: "6", name: "Android", path: "/Android", size: 0, type: "other",
      extension: "", modifiedAt: makeDate(30), isHidden: false, isDirectory: true,
      children: [
        { id: "6-1", name: "data", path: "/Android/data", size: 0, type: "other", extension: "", modifiedAt: makeDate(30), isHidden: false, isDirectory: true, children: [] },
        { id: "6-2", name: "obb", path: "/Android/obb", size: 0, type: "other", extension: "", modifiedAt: makeDate(30), isHidden: false, isDirectory: true, children: [] },
      ]
    },
    { id: "7", name: ".thumbnails", path: "/.thumbnails", size: 12345678, type: "other", extension: "", modifiedAt: makeDate(0), isHidden: true, isDirectory: true, children: [] },
  ];
}

function flattenFiles(items: FileItem[]): FileItem[] {
  const result: FileItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.isDirectory && item.children) {
      result.push(...flattenFiles(item.children));
    }
  }
  return result;
}

export function FileManagerProvider({ children }: { children: React.ReactNode }) {
  const [allFiles] = useState<FileItem[]>(generateMockFiles);
  const [currentPath, setCurrentPath] = useState("/");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showHidden, setShowHidden] = useState(false);
  const [favorites, setFavorites] = useState<FileItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const favData = await AsyncStorage.getItem("favorites");
        const recentData = await AsyncStorage.getItem("recentFiles");
        if (favData) setFavorites(JSON.parse(favData).map((f: any) => ({ ...f, modifiedAt: new Date(f.modifiedAt) })));
        if (recentData) setRecentFiles(JSON.parse(recentData).map((f: any) => ({ ...f, modifiedAt: new Date(f.modifiedAt) })));
      } catch {}
    };
    load();
  }, []);

  const getCurrentDir = useCallback((): FileItem[] => {
    if (currentPath === "/") return allFiles;
    const parts = currentPath.split("/").filter(Boolean);
    let current: FileItem[] = allFiles;
    for (const part of parts) {
      const found = current.find(f => f.name === part && f.isDirectory);
      if (!found || !found.children) return [];
      current = found.children;
    }
    return current;
  }, [currentPath, allFiles]);

  const sortFiles = useCallback((items: FileItem[]): FileItem[] => {
    return [...items].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "size") cmp = a.size - b.size;
      else if (sortBy === "date") cmp = a.modifiedAt.getTime() - b.modifiedAt.getTime();
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [sortBy, sortOrder]);

  const currentDir = (() => {
    let items = getCurrentDir();
    if (!showHidden) items = items.filter(f => !f.isHidden);
    return sortFiles(items);
  })();

  const files = (() => {
    if (!searchQuery) return currentDir;
    const query = searchQuery.toLowerCase();
    const all = flattenFiles(allFiles);
    let matches = all.filter(f => {
      if (!showHidden && f.isHidden) return false;
      return f.name.toLowerCase().includes(query);
    });
    return sortFiles(matches);
  })();

  const addToFavorites = useCallback(async (file: FileItem) => {
    setFavorites(prev => {
      if (prev.find(f => f.id === file.id)) return prev;
      const updated = [...prev, file];
      AsyncStorage.setItem("favorites", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const removeFromFavorites = useCallback(async (fileId: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      AsyncStorage.setItem("favorites", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const isFavorite = useCallback((fileId: string) => {
    return favorites.some(f => f.id === fileId);
  }, [favorites]);

  const addToRecent = useCallback(async (file: FileItem) => {
    if (file.isDirectory) return;
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f.id !== file.id);
      const updated = [file, ...filtered].slice(0, 20);
      AsyncStorage.setItem("recentFiles", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const toggleHidden = useCallback(() => setShowHidden(prev => !prev), []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
    setIsSelecting(false);
  }, []);

  const copyFile = useCallback(async (file: FileItem, destPath: string) => {
    // Simulated copy
    await new Promise(r => setTimeout(r, 500));
  }, []);

  const moveFile = useCallback(async (file: FileItem, destPath: string) => {
    await new Promise(r => setTimeout(r, 500));
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    await new Promise(r => setTimeout(r, 300));
    setFavorites(prev => prev.filter(f => f.id !== fileId));
    setRecentFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    await new Promise(r => setTimeout(r, 300));
  }, []);

  const getStorageInfo = useCallback(() => {
    const all = flattenFiles(allFiles).filter(f => !f.isDirectory);
    const total = 128 * 1024 * 1024 * 1024; // 128 GB
    let used = 0;
    const byType: Record<FileType, number> = {
      image: 0, video: 0, audio: 0, document: 0, apk: 0, zip: 0, other: 0,
    };
    for (const f of all) {
      used += f.size;
      byType[f.type] = (byType[f.type] || 0) + f.size;
    }
    // Simulate more realistic storage
    const extraUsed = 42 * 1024 * 1024 * 1024;
    return { used: used + extraUsed, total, byType };
  }, [allFiles]);

  return (
    <FileManagerContext.Provider value={{
      currentPath,
      files,
      recentFiles,
      favorites,
      searchQuery,
      sortBy,
      sortOrder,
      showHidden,
      selectedFiles,
      isSelecting,
      currentDir,
      setCurrentPath,
      setSearchQuery,
      setSortBy,
      setSortOrder,
      toggleHidden,
      toggleSelect,
      clearSelection,
      setIsSelecting,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      addToRecent,
      copyFile,
      moveFile,
      deleteFile,
      renameFile,
      getStorageInfo,
    }}>
      {children}
    </FileManagerContext.Provider>
  );
}
