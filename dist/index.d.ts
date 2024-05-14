import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon';
interface SuperNotesPluginSettingsDescription extends PluginSettingsDescription {
    token: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    template: {
        type: 'text';
        required: boolean;
        label: string;
        description: string;
        default: string;
    };
    tags: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
        default: string;
    };
}
interface SuperNotesPluginSettings extends MoonPluginSettings {
    token: string;
    template: string;
}
export default class extends MoonPlugin {
    name: string;
    logo: string;
    settingsDescription: SuperNotesPluginSettingsDescription;
    settings: SuperNotesPluginSettings;
    log: ((log: string) => void) | undefined;
    constructor(props?: MoonPluginConstructorProps<SuperNotesPluginSettings>);
    integration: {
        callback: ({ context, markdown }: {
            html: string;
            markdown: string;
            context: Context;
        }) => Promise<boolean>;
        buttonIconUrl: string;
    };
}
export {};
