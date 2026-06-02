import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/theme';
import { I18nProvider } from '../src/i18n';
import '../src/theme/styles.css';
import './tailwind.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="light">
        <I18nProvider locale="en">
          <Story />
        </I18nProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
