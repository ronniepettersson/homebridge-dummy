import { CharacteristicValue, PlatformAccessory } from 'homebridge';

import { OnOffAccessory } from './onoff.js';

import { strings } from '../../i18n/i18n.js';

import { AccessoryType, WebhookCommand } from '../../model/enums.js';
import { CharacteristicType, LightbulbConfig, ServiceType } from '../../model/types.js';
import { Webhook } from '../../model/webhook.js';

import { Log } from '../../tools/log.js';
import { storageGet_Deprecated, Storage } from '../../tools/storage.js';

const NO_BRIGHTNESS = -1;

export class LightbulbAccessory extends OnOffAccessory<LightbulbConfig> {

  private brightness: CharacteristicValue;
  private hue: CharacteristicValue;
  private saturation: CharacteristicValue;
  private colorTemperature: CharacteristicValue;

  constructor(
    Service: ServiceType,
    Characteristic: CharacteristicType,
    accessory: PlatformAccessory,
    config: LightbulbConfig,
    log: Log,
    isGrouped: boolean,
  ) {
    super(Service, Characteristic, accessory, config, log, isGrouped);

    this.brightness = this.config.defaultBrightness ?? NO_BRIGHTNESS;
    this.hue = this.config.defaultHue ?? 0;
    this.saturation = this.config.defaultSaturation ?? 0;
    this.colorTemperature = this.config.defaultColorTemperature ?? 0;

    if (this.isDimmer) {

      this.accessoryService.getCharacteristic(this.Characteristic.Brightness)
        .onGet(this.getBrightness.bind(this))
        .onSet(this.setBrightness.bind(this));

      if (this.isStateful && Storage.has(this.defaultBrightnessStorageKey)) {
        this.brightness = Storage.get(this.defaultBrightnessStorageKey) ?? this.brightness;
      } else {
        this.initializeBrightness_Deprecated();
      }
      this.accessoryService.getCharacteristic(this.Characteristic.Hue)
        .onGet(this.getHue.bind(this))
        .onSet(this.setHue.bind(this));

      if (this.isStateful && Storage.has(this.defaultHueStorageKey)) {
        this.hue = Storage.get(this.defaultHueStorageKey) ?? this.hue;
      }
      this.accessoryService.getCharacteristic(this.Characteristic.Saturation)
        .onGet(this.getSaturation.bind(this))
        .onSet(this.setSaturation.bind(this));

      if (this.isStateful && Storage.has(this.defaultSaturationStorageKey)) {
        this.saturation = Storage.get(this.defaultSaturationStorageKey) ?? this.saturation;
      }
      this.accessoryService.getCharacteristic(this.Characteristic.ColorTemperature)
        .onGet(this.getColorTemperature.bind(this))
        .onSet(this.setColorTemperature.bind(this));

      if (this.isStateful && Storage.has(this.defaultColorTemperatureStorageKey)) {
        this.colorTemperature = Storage.get(this.defaultColorTemperatureStorageKey) ?? this.colorTemperature;
      }
    }
  }

  private get isDimmer(): boolean {
    return this.brightness !== NO_BRIGHTNESS;
  }

  private get defaultBrightnessStorageKey(): string {
    return `${this.identifier}:Brightness`;
  }
  private get defaultHueStorageKey(): string {
    return `${this.identifier}:Hue`;
  }
  private get defaultSaturationStorageKey(): string {
    return `${this.identifier}:Saturation`;
  }
  private get defaultColorTemperatureStorageKey(): string {
    return `${this.identifier}:ColorTemperature`;
  }

  override getAccessoryType(): AccessoryType {
    return AccessoryType.Lightbulb;
  }

  override webhooks(): Webhook[] {
    return [
      ...super.webhooks(),
      new Webhook(this.identifier, WebhookCommand.Brightness,
        (value) => {
          this.setBrightness(value);
          return strings.lightbulb.brightness.replace('%s', this.name).replace('%d', value.toString());
        }),
    ];
  }

  private async initializeBrightness_Deprecated() {

    if (!this.isStateful) {
      this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
      return;
    }

    const brightness = await storageGet_Deprecated(this.defaultBrightnessStorageKey);
    if (brightness === undefined) {
      return;
    }

    await this.setBrightness(brightness);
  }

  override logMessageForOnState(value: CharacteristicValue): string {
    if (this.isDimmer && value) {
      return strings.lightbulb.stateOn.replace('%d', this.brightness.toLocaleString());
    } else {
      return super.logMessageForOnState(value);
    }
  }

  private async getBrightness(): Promise<CharacteristicValue> {
    return this.brightness;
  }

  private async setBrightness(value: CharacteristicValue) {

    if (this.brightness === value) {
      return;
    }

    this.brightness = value;

    this.logIfDesired(strings.lightbulb.brightness, this.brightness.toString());

    if (this.isStateful) {
      await Storage.set(this.defaultBrightnessStorageKey, this.brightness);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Brightness, this.brightness);
  }
  private async getHue(): Promise<CharacteristicValue> {
    return this.hue;
  }

  private async setHue(value: CharacteristicValue) {

    if (this.hue === value) {
      return;
    }

    this.hue = value;

    this.logIfDesired(strings.lightbulb.hue, this.hue.toString());

    if (this.isStateful) {
      await Storage.set(this.defaultHueStorageKey, this.hue);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Hue, this.hue);
  }

  private async getSaturation(): Promise<CharacteristicValue> {
    return this.saturation;
  }

  private async setSaturation(value: CharacteristicValue) {

    if (this.saturation === value) {
      return;
    }

    this.saturation = value;

    this.logIfDesired(strings.lightbulb.saturation, this.saturation.toString());

    if (this.isStateful) {
      await Storage.set(this.defaultSaturationStorageKey, this.saturation);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.Saturation, this.saturation);
  }

  private async getColorTemperature(): Promise<CharacteristicValue> {
    return this.colorTemperature;
  }

  private async setColorTemperature(value: CharacteristicValue) {

    if (this.colorTemperature === value) {
      return;
    }

    this.colorTemperature = value;

    this.logIfDesired(strings.lightbulb.colorTemperature, this.colorTemperature.toString());

    if (this.isStateful) {
      await Storage.set(this.defaultColorTemperatureStorageKey, this.colorTemperature);
    }

    this.accessoryService.updateCharacteristic(this.Characteristic.ColorTemperature, this.colorTemperature);
  }
}