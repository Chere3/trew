import type { Meta, StoryObj } from '@storybook/react';
import { TaskCard } from './TaskCard';
import { fn } from '@storybook/test';

const meta = {
    title: 'Chat/TaskCard',
    component: TaskCard,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        recommendedModelName: { control: 'text' },
    },
    args: {
        onClick: fn(),
    },
} satisfies Meta<typeof TaskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Coding: Story = {
    args: {
        task: {
            id: 'refactor',
            title: 'Refactor Code',
            description: 'Improve code structure and clean up technical debt',
            category: 'coding',
        },
        recommendedModelName: 'Opus',
    },
};

export const Creative: Story = {
    args: {
        task: {
            id: 'story',
            title: 'Write Story',
            description: 'Create engaging narratives and creative content',
            category: 'creative',
        },
        recommendedModelName: 'GPT-4',
    },
};

export const NoModel: Story = {
    args: {
        task: {
            id: 'debug',
            title: 'Find Bugs',
            description: 'Analyze code to find logical errors and security issues',
            category: 'coding',
        },
        recommendedModelName: undefined,
    },
};
