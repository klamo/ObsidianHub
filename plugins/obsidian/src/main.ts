import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";

interface ObsidianHubPluginSettings {
  serverUrl: string;
  accessToken: string;
}

const DEFAULT_SETTINGS: ObsidianHubPluginSettings = {
  serverUrl: "http://localhost:3000",
  accessToken: ""
};

export default class ObsidianHubPlugin extends Plugin {
  private settings: ObsidianHubPluginSettings = DEFAULT_SETTINGS;

  override async onload(): Promise<void> {
    await this.loadSettings();

    this.addCommand({
      id: "show-connection-target",
      name: "Show configured server URL",
      callback: () => {
        new Notice(`ObsidianHub server: ${this.settings.serverUrl}`);
      }
    });

    this.addSettingTab(new ObsidianHubSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData())
    };
  }

  async updateSettings(
    patch: Partial<ObsidianHubPluginSettings>
  ): Promise<void> {
    this.settings = {
      ...this.settings,
      ...patch
    };

    await this.saveData(this.settings);
  }

  getSettings(): ObsidianHubPluginSettings {
    return this.settings;
  }
}

class ObsidianHubSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: ObsidianHubPlugin) {
    super(app, plugin);
  }

  override display(): void {
    const { containerEl } = this;
    const settings = this.plugin.getSettings();

    containerEl.empty();
    containerEl.createEl("h2", { text: "ObsidianHub" });

    new Setting(containerEl)
      .setName("Server URL")
      .setDesc("ObsidianHub server base URL.")
      .addText((text) =>
        text.setValue(settings.serverUrl).onChange(async (value) => {
          await this.plugin.updateSettings({ serverUrl: value.trim() });
        })
      );

    new Setting(containerEl)
      .setName("Access token")
      .setDesc("Token used by the lightweight sync client.")
      .addText((text) =>
        text.setPlaceholder("Optional during scaffold phase")
          .setValue(settings.accessToken)
          .onChange(async (value) => {
            await this.plugin.updateSettings({ accessToken: value.trim() });
          })
      );
  }
}
