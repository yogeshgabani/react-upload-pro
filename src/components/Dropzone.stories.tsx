import type { Meta, StoryObj } from '@storybook/react';
import { Dropzone } from './Dropzone';

const meta: Meta<typeof Dropzone> = {
  title: 'Components/Dropzone',
  component: Dropzone,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof Dropzone>;

export const Default: Story = {
  args: {
    endpoint: '/upload',
    hint: 'PNG, JPG up to 5MB',
  },
};

export const ImagesOnly: Story = {
  args: {
    accept: 'image/*',
    maxSize: 5 * 1024 * 1024,
    hint: 'Images only, max 5MB',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const FolderUpload: Story = {
  args: { directory: true, hint: 'Drop a folder to upload nested files.' },
};
