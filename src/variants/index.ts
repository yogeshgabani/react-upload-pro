/**
 * Pre-built variants of the dropzone UI. Every variant is a thin styled
 * wrapper around `useDropzone`, so all DropzoneOptions props work everywhere.
 *
 * Categories:
 *   - minimal: clean defaults (Modern, Glass, Neumorphic, Material, Inline)
 *   - business: dashboard / CRM / SaaS layouts
 *   - creative: bold gradients & animations
 *   - enterprise: docs, team, media-library
 *   - layouts:   box, card, sidebar, modal, floating
 */

// Minimal
export {
  MinimalModern,
  MinimalGlass,
  MinimalNeumorphic,
  MinimalMaterial,
  MinimalInline,
} from './minimal';

// Business
export { BusinessCRM, BusinessDashboard, BusinessSaaS } from './business';

// Creative
export {
  CreativeGradient,
  CreativeAnimated,
  CreativePremium,
  CreativeAvatar,
} from './creative';

// Enterprise
export {
  EnterpriseDocs,
  EnterpriseTeam,
  EnterpriseMediaLibrary,
  EnterpriseFullscreen,
} from './enterprise';

// Layouts
export {
  LayoutBox,
  LayoutCard,
  LayoutSidebar,
  LayoutModal,
  LayoutFloating,
} from './layouts';

export { pickGalleryProps, type VariantProps } from './types';
