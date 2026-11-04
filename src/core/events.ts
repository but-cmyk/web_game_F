/**
 * Strongly-typed Event Bus and Core Game Events for DEEPER.
 * Serves as the clean decoupled bridge between pure Core logic and Presentation scenes.
 * Zero Phaser imports, zero any.
 */

export interface StepTakenEvent {
  readonly depth: number;
  readonly x: number;
  readonly y: number;
  readonly mode: 'sneak' | 'walk' | 'run';
  readonly oilCost: number;
}

export interface NoiseEmittedEvent {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly source: string;
}

export interface DreadChangedEvent {
  readonly oldDread: number;
  readonly newDread: number;
  readonly reason: string;
}

export interface MonsterStateChangedEvent {
  readonly monsterId: string;
  readonly oldState: string;
  readonly newState: string;
}

export interface MonsterAlertedEvent {
  readonly monsterId: string;
  readonly type: string;
  readonly state: string;
  readonly x: number;
  readonly y: number;
}

export interface MonsterAttackedEvent {
  readonly monsterId: string;
  readonly damage: number;
  readonly remainingHp: number;
}

export interface HallucinationTriggeredEvent {
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
}

export interface HallucinationEvaporatedEvent {
  readonly id: string;
  readonly x: number;
  readonly y: number;
}

export interface GoldPickedEvent {
  readonly amount: number;
  readonly totalCarried: number;
  readonly x: number;
  readonly y: number;
}

export interface OilPickedEvent {
  readonly amount: number;
  readonly currentOil: number;
  readonly x: number;
  readonly y: number;
}

export interface ChestOpenedEvent {
  readonly isCursed: boolean;
  readonly curseId?: string;
  readonly gold: number;
}

export interface BargainOfferedEvent {
  readonly bargainId: string;
  readonly costDescription: string;
  readonly rewardDescription: string;
}

export interface BargainResolvedEvent {
  readonly bargainId: string;
  readonly accepted: boolean;
}

export interface ExtractStartedEvent {
  readonly depth: number;
  readonly turnsRemaining: number;
}

export interface RunEndedEvent {
  readonly outcome: 'extracted' | 'died';
  readonly depth: number;
  readonly bankedGold: number;
  readonly lostGold: number;
}

export interface GameEventMap {
  StepTaken: StepTakenEvent;
  NoiseEmitted: NoiseEmittedEvent;
  DreadChanged: DreadChangedEvent;
  MonsterStateChanged: MonsterStateChangedEvent;
  MonsterAlerted: MonsterAlertedEvent;
  MonsterAttacked: MonsterAttackedEvent;
  HallucinationTriggered: HallucinationTriggeredEvent;
  HallucinationEvaporated: HallucinationEvaporatedEvent;
  GoldPicked: GoldPickedEvent;
  OilPicked: OilPickedEvent;
  ChestOpened: ChestOpenedEvent;
  BargainOffered: BargainOfferedEvent;
  BargainResolved: BargainResolvedEvent;
  ExtractStarted: ExtractStartedEvent;
  RunEnded: RunEndedEvent;
}

type EventListener<T> = (payload: T) => void;
type UntypedListener = (payload: unknown) => void;

export class EventBus<Events = GameEventMap> {
  private listeners: Map<keyof Events, Set<UntypedListener>> = new Map();

  on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const untyped = listener as UntypedListener;
    this.listeners.get(event)!.add(untyped);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener as UntypedListener);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const listener of set) {
        listener(payload);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
