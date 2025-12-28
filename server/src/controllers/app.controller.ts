import { Request, Response } from "express";

/**
 * Uygulama sürüm kontrolü endpoint'i
 * Play Store/App Store'daki minimum gerekli sürümü döner
 */
export const checkAppVersion = async (req: Request, res: Response) => {
  try {
    // Bu değerleri environment variable'dan veya database'den alabilirsiniz
    // Şimdilik sabit değerler kullanıyoruz
    const minimumVersion = process.env.MINIMUM_APP_VERSION || "1.2.4";
    const minimumVersionCode = process.env.MINIMUM_APP_VERSION_CODE
      ? parseInt(process.env.MINIMUM_APP_VERSION_CODE, 10)
      : 9;

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

