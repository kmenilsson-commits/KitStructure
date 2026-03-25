// ─── Typed wrappers around google.script.run ─────────────────────────────────
// Provides Promise-based API so components can use async/await.

import type { AuthResult, Brand, BrandsWithModels, AdminData, Kit, KitRequest, Model } from './types';

// Type declaration for google.script.run (GAS client API)
declare const google: {
  script: {
    run: {
      withSuccessHandler: (fn: (result: unknown) => void) => typeof google.script.run;
      withFailureHandler: (fn: (err: { message: string }) => void) => typeof google.script.run;
      checkAuth: () => void;
      getBrandsWithModels: () => void;
      getKit: (modelId: string) => void;
      submitKitRequest: (brandName: string, modelName: string, note: string) => void;
      getAllBrands: () => void;
      saveBrand: (brand: Brand) => void;
      deleteBrand: (brandId: string) => void;
      getAllModels: () => void;
      saveModel: (model: Model) => void;
      deleteModel: (modelId: string) => void;
      getAdminData: () => void;
      saveKit: (kit: Kit) => void;
      deleteKit: (kitId: string) => void;
      getAllKitRequests: () => void;
      updateKitRequest: (id: string, status: string, adminNote: string) => void;
    };
  };
};

// Check if running inside GAS (vs local Vite dev)
const isGAS = typeof google !== 'undefined' && google?.script?.run;

const GAS_TIMEOUT_MS = 30_000; // 30 seconds — GAS cold-start can be slow for new users

function gasRun<T>(fn: (run: typeof google.script.run) => void): Promise<T> {
  if (!isGAS) {
    return Promise.reject(new Error('google.script.run not available (running in dev mode)'));
  }
  return new Promise((resolve, reject) => {
    // IMPORTANT: withSuccessHandler / withFailureHandler return a NEW runner object.
    // fn must be called on that object — not on the original google.script.run.
    const runner = google.script.run
      .withSuccessHandler((result: unknown) => {
        clearTimeout(timer);
        resolve(result as T);
      })
      .withFailureHandler((err: { message: string }) => {
        clearTimeout(timer);
        reject(new Error(err.message));
      });

    // Safety net: if GAS never calls either handler (known cold-start quirk),
    // reject after timeout so the UI can show an error instead of spinning forever.
    const timer = setTimeout(() => {
      reject(new Error('Request timed out — please reload and try again.'));
    }, GAS_TIMEOUT_MS);

    fn(runner);
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const api = {
  checkAuth(): Promise<AuthResult> {
    if (!isGAS) {
      // Dev mode mock
      return Promise.resolve({ email: 'dev@example.com', role: 'admin' });
    }
    return gasRun<AuthResult>(run => run.checkAuth());
  },

  // ─── Sales ────────────────────────────────────────────────────────────────

  getBrandsWithModels(): Promise<BrandsWithModels> {
    if (!isGAS) {
      return Promise.resolve({ brands: [], models: [], kitStatusByModelId: {} });
    }
    return gasRun<BrandsWithModels>(run => run.getBrandsWithModels());
  },

  getKit(modelId: string): Promise<Kit | null> {
    if (!isGAS) return Promise.resolve(null);
    return gasRun<Kit | null>(run => run.getKit(modelId));
  },

  submitKitRequest(brandName: string, modelName: string, note: string): Promise<void> {
    if (!isGAS) return Promise.resolve();
    return gasRun<void>(run => run.submitKitRequest(brandName, modelName, note));
  },

  // ─── Admin — Brands ───────────────────────────────────────────────────────

  getAllBrands(): Promise<Brand[]> {
    if (!isGAS) return Promise.resolve([]);
    return gasRun<Brand[]>(run => run.getAllBrands());
  },

  saveBrand(brand: Brand): Promise<Brand> {
    if (!isGAS) return Promise.resolve(brand);
    return gasRun<Brand>(run => run.saveBrand(brand));
  },

  deleteBrand(brandId: string): Promise<void> {
    if (!isGAS) return Promise.resolve();
    return gasRun<void>(run => run.deleteBrand(brandId));
  },

  // ─── Admin — Models ───────────────────────────────────────────────────────

  getAllModels(): Promise<Model[]> {
    if (!isGAS) return Promise.resolve([]);
    return gasRun<Model[]>(run => run.getAllModels());
  },

  saveModel(model: Model): Promise<Model> {
    if (!isGAS) return Promise.resolve(model);
    return gasRun<Model>(run => run.saveModel(model));
  },

  deleteModel(modelId: string): Promise<void> {
    if (!isGAS) return Promise.resolve();
    return gasRun<void>(run => run.deleteModel(modelId));
  },

  // ─── Admin — Kits ─────────────────────────────────────────────────────────

  getAdminData(): Promise<AdminData> {
    if (!isGAS) return Promise.resolve({ brands: [], models: [], kits: [], requests: [] });
    return gasRun<AdminData>(run => run.getAdminData());
  },

  saveKit(kit: Kit): Promise<Kit> {
    if (!isGAS) return Promise.resolve(kit);
    return gasRun<Kit>(run => run.saveKit(kit));
  },

  deleteKit(kitId: string): Promise<void> {
    if (!isGAS) return Promise.resolve();
    return gasRun<void>(run => run.deleteKit(kitId));
  },

  // ─── Admin — Requests ─────────────────────────────────────────────────────

  getAllKitRequests(): Promise<KitRequest[]> {
    if (!isGAS) return Promise.resolve([]);
    return gasRun<KitRequest[]>(run => run.getAllKitRequests());
  },

  updateKitRequest(id: string, status: string, adminNote: string): Promise<void> {
    if (!isGAS) return Promise.resolve();
    return gasRun<void>(run => run.updateKitRequest(id, status, adminNote));
  },
};
