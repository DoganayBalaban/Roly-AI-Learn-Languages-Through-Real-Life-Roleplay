import { Request, Response } from "express";
import { config } from "../config/env";

/**
 * Uygulama sürüm kontrolü endpoint'i
 * Play Store/App Store'daki minimum gerekli sürümü döner
 */
export const checkAppVersion = async (req: Request, res: Response) => {
  try {
    const minimumVersion = config.minimumAppVersion;
    const minimumVersionCode = config.minimumAppVersionCode;

    // Eğer minimum sürüm belirlenmişse, güncelleme gereklidir
    const requiresUpdate = !!minimumVersion || !!minimumVersionCode;

    res.json({
      requiresUpdate,
      minimumVersion,
      minimumVersionCode,
      currentStoreVersion: minimumVersion, // Store'daki mevcut sürüm
    });
  } catch (error: any) {
    console.error("Version check error:", error);
    res.status(500).json({
      error: "Sürüm kontrolü yapılamadı",
      requiresUpdate: false, // Hata durumunda güncelleme zorunlu değil
    });
  }
};

