import type { Meta, StoryObj } from '@storybook/react';
import { NewChatPage } from './NewChatPage';
import { fn } from '@storybook/test';

const meta = {
    title: 'Chat/NewChatPage',
    component: NewChatPage,
    parameters: {
        layout: 'fullscreen',
    },
    args: {
        onModelSelect: fn(),
        userName: 'Diego',
    },
} satisfies Meta<typeof NewChatPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
    parameters: {
        // Mocking the fetch API for models would ideally happen here using MSW
        // For now, this story renders the component which will attempt to fetch
        // and show the loading/empty state or fail gracefully.
    }
};
