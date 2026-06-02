import type { Meta, StoryObj } from '@storybook/react';
import {
  MinimalModern,
  MinimalGlass,
  MinimalNeumorphic,
  MinimalMaterial,
  MinimalInline,
  BusinessCRM,
  BusinessDashboard,
  BusinessSaaS,
  CreativeGradient,
  CreativeAnimated,
  CreativePremium,
  CreativeAvatar,
  EnterpriseDocs,
  EnterpriseTeam,
  EnterpriseMediaLibrary,
  EnterpriseFullscreen,
  LayoutBox,
  LayoutCard,
  LayoutSidebar,
  LayoutModal,
} from './index';

const meta: Meta = { title: 'Variants' };
export default meta;

type S = StoryObj;

export const Minimal_Modern: S = { render: () => <MinimalModern hint="Modern look" /> };
export const Minimal_Glass: S = {
  render: () => (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <MinimalGlass hint="Glassmorphism" />
    </div>
  ),
};
export const Minimal_Neumorphic: S = { render: () => <MinimalNeumorphic /> };
export const Minimal_Material: S = { render: () => <MinimalMaterial hint="Drop images here" /> };
export const Minimal_Inline: S = { render: () => <MinimalInline hint="Single-line uploader" /> };
export const Business_CRM: S = { render: () => <BusinessCRM hint="Up to 50 files, 10MB each" /> };
export const Business_Dashboard: S = { render: () => <BusinessDashboard /> };
export const Business_SaaS: S = { render: () => <BusinessSaaS /> };
export const Creative_Gradient: S = { render: () => <CreativeGradient /> };
export const Creative_Animated: S = { render: () => <CreativeAnimated /> };
export const Creative_Premium: S = { render: () => <CreativePremium /> };
export const Creative_Avatar: S = { render: () => <CreativeAvatar /> };
export const Enterprise_Docs: S = { render: () => <EnterpriseDocs hint="Word, Excel, PDF" /> };
export const Enterprise_Team: S = { render: () => <EnterpriseTeam /> };
export const Enterprise_MediaLibrary: S = { render: () => <EnterpriseMediaLibrary /> };
export const Enterprise_Fullscreen: S = { render: () => <EnterpriseFullscreen /> };
export const Layout_Box: S = { render: () => <LayoutBox /> };
export const Layout_Card: S = { render: () => <LayoutCard /> };
export const Layout_Sidebar: S = { render: () => <LayoutSidebar /> };
export const Layout_Modal: S = { render: () => <LayoutModal /> };
