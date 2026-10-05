"use client";

export const dynamic = "force-static";

import {
  Anvil,
  Archive,
  Atom,
  BookOpenText,
  BrickWall,
  CircuitBoard,
  Cog,
  Compass,
  createLucideIcon,
  Cable,
  Eye,
  Factory,
  FlameKindling,
  Filter as FilterIcon,
  FlaskConical,
  FolderOpen,
  Gem,
  GitMerge,
  Hammer,
  HardDrive,
  Keyboard,
  Lock,
  LockOpen,
  Map as MapIcon,
  Menu,
  Minus,
  Mountain,
  PackageOpen,
  Palette,
  Pause,
  Pickaxe,
  Play,
  Plus,
  Save,
  Split,
  Sprout,
  Trash2,
  TreePine,
  TriangleAlert,
  Trophy,
  Unplug,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { SmoothProgress } from "@/components/ui/smooth-progress";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const AreaExpansionIcon = createLucideIcon("area-expansion", [
  ["path", { d: "M10 10 4 4", key: "northwest-shaft" }],
  ["path", { d: "M4 9V4h5", key: "northwest-head" }],
  ["path", { d: "m14 10 6-6", key: "northeast-shaft" }],
  ["path", { d: "M15 4h5v5", key: "northeast-head" }],
  ["path", { d: "m10 14-6 6", key: "southwest-shaft" }],
  ["path", { d: "M4 15v5h5", key: "southwest-head" }],
  ["path", { d: "m14 14 6 6", key: "southeast-shaft" }],
  ["path", { d: "M15 20h5v-5", key: "southeast-head" }],
]);

const MiningDrillIcon = createLucideIcon("mining-drill", [
  ["rect", { x: "1", y: "6.5", width: "7", height: "11", rx: "1", key: "drive-housing" }],
  ["path", { d: "M8 4v16l12-8Z", strokeWidth: "1.25", key: "conical-bit" }],
  ["path", { d: "m9 6.5 2.5 10.5", strokeWidth: "1.25", key: "rear-flute" }],
  ["path", { d: "m12 8 2 7.5", strokeWidth: "1.25", key: "middle-flute" }],
  ["path", { d: "m15 9.8 1.3 4.2", strokeWidth: "1.25", key: "front-flute" }],
  ["path", { d: "M23 3v18", key: "rock-wall" }],
]);

const RoadIcon = createLucideIcon("road", [
  [
    "path",
    {
      d: "M9.5 2h5L21 22H3L9.5 2Z",
      fill: "currentColor",
      fillOpacity: "0.18",
      strokeLinejoin: "round",
      key: "paved-road",
    },
  ],
  ["path", { d: "M12 4v2", strokeWidth: "1.8", key: "center-dash-far" }],
  ["path", { d: "M12 9v3", strokeWidth: "1.8", key: "center-dash-middle" }],
  ["path", { d: "M12 16v5", strokeWidth: "1.8", key: "center-dash-near" }],
]);

enum ResourceType {
  RESOURCE = "RESOURCE",
  IRON_ORE = "IRON_ORE",
  COPPER_ORE = "COPPER_ORE",
  STONE_CHUNKS = "STONE_CHUNKS",
  FOREST = "FOREST",
  METAL = "METAL",
  IRON = "IRON",
  COPPER = "COPPER",
  MYTHRIL = "MYTHRIL",
  STONE = "STONE",
  BRICK = "BRICK",
  WOOD = "WOOD",
  CHARCOAL = "CHARCOAL",
  PLATE = "PLATE",
  IRON_PLATE = "IRON_PLATE",
  COPPER_PLATE = "COPPER_PLATE",
  MYTHRIL_PLATE = "MYTHRIL_PLATE",
  GEAR = "GEAR",
  IRON_GEAR = "IRON_GEAR",
  COPPER_GEAR = "COPPER_GEAR",
  MYTHRIL_GEAR = "MYTHRIL_GEAR",
  WIRE = "WIRE",
  IRON_WIRE = "IRON_WIRE",
  COPPER_WIRE = "COPPER_WIRE",
  MYTHRIL_WIRE = "MYTHRIL_WIRE",
  MOTOR = "MOTOR",
  CIRCUIT_A = "CIRCUIT_A",
  CORE = "CORE",
  BASIC_CORE = "BASIC_CORE",
  AUTOMATA_CORE = "AUTOMATA_CORE",
  FOREST_GROWTH = "FOREST_GROWTH",
  POWER = "POWER",
  WATER = "WATER",
  ANY = "ANY",
}

const PRODUCTION_PORT_LABEL = "Production";

const PortLabel = ({ label }: { label: string }) =>
  label === PRODUCTION_PORT_LABEL ? (
    <span className="production-port-label" title="Production">
      <Factory aria-label="Production" />
    </span>
  ) : (
    <span>{label}</span>
  );

type NodeId = string;
type ProcessorKind =
  | "furnace"
  | "kiln"
  | "automataCoreAssembler"
  | "refiner"
  | "assembler";
type AssemblerRecipeId = "motor" | "circuitA" | "basicCore" | "automataCore";
type RefinerRecipeId = "gear" | "wire" | "brick";
type ExtractorKind = "extractor";
type PurchasableKind = ExtractorKind | "generator" | "powerSplitter" | "researchFoundry" | "treePlanter" | "miningDrill" | "splitter" | "merger" | "joint" | "road" | "inventorySource" | "filter" | "storage" | "woodenChest" | ProcessorKind;
type NodeKind = "ironOre" | "copperOre" | "mythrilOre" | "stone" | "forest" | PurchasableKind;
type BuildCategory = "all" | "production" | "logistics" | "storage";
type JournalCategory = BuildCategory | "achievements";
type PortDirection = "input" | "output";
type JointOrientation = "horizontal" | "vertical";
type UnlockTimes = Partial<Record<PurchasableKind, number>>;
type ResearchProjectId = "logistics" | "kiln" | "charcoalGenerator" | "furnace" | "refiner" | "assembler" | "researchCenter" | "road" | "areaExpansion1" | "extractor2" | "extractor3" | "treePlanter" | "miningDrill" | "exploration" | "mapNode" | "automataCore";
type AchievementId = "oops" | "handHolding";
type MiningDrillTarget = ResourceType.IRON | ResourceType.COPPER | ResourceType.MYTHRIL | ResourceType.STONE;
type CoreType = ResourceType.BASIC_CORE | ResourceType.AUTOMATA_CORE;
type MapEdge = "north" | "east" | "south" | "west";
type RoadMode = "export" | "import";

type ControlGroup = {
  id: string;
  nodeIds: NodeId[];
  color: string;
  colorName: string;
};

type MapNodeProgress = {
  explored: boolean;
  customName?: string | null;
};

type MapNodeProgressBySector = Record<string, MapNodeProgress>;

type InventoryOverflowPrompt = {
  title: string;
  description: string;
  suppressionLabel?: string;
  suppressionDescription?: string;
  loss: Array<[InventoryItemType, number]>;
};

type Port = {
  id: string;
  label: string;
  type: ResourceType;
  direction: PortDirection;
};

type NodeSpec = {
  id: NodeId;
  kind: NodeKind;
  title: string;
  eyebrow: string;
  color: string;
  icon: typeof Pickaxe;
  inputs: Port[];
  outputs: Port[];
};

type Connection = {
  id: string;
  sourceNode: NodeId;
  sourcePort: string;
  targetNode: NodeId;
  targetPort: string;
  type: ResourceType;
};

type Position = { x: number; y: number };
type Positions = Record<NodeId, Position>;
type NodeSize = { width: number; height: number };
type BlackHoleObstacle = {
  id: string;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  shape: number[];
  stoneFilled: number;
};
type LakeObstacle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: number[];
  productionElapsed: number;
  nextOutputIndex: number;
};
type ObstructionTooltipState = {
  kind: "blackHole" | "lake";
  nodeId: NodeId;
  clientX: number;
  clientY: number;
};
type SelectionBox = { start: Position; end: Position };
type PortHandle = { nodeId: NodeId; port: Port };
type InsertionPlan = { connection: Connection; input: Port; output: Port };
type NodeConnectionOption = {
  nodeId: NodeId;
  title: string;
  eyebrow: string;
  color: string;
  mode: "send" | "receive";
  routes: string[];
  connected: boolean;
};

type ModelTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
};

type ModelContextApi = {
  registerTool: (tool: ModelTool, options?: { signal?: AbortSignal }) => void | Promise<void>;
};

type ExtractorState = {
  progress: number;
  stored: number;
  full: boolean;
  /** Product already buffered in the output, retained when the input cable is removed. */
  materialType?: InventoryItemType | null;
};

type Runtime = {
  ironOre: { remaining: number; capacity: number };
  copperOre: { remaining: number; capacity: number };
  stone: { remaining: number; capacity: number };
  forest: { remaining: number; capacity: number; regenerationElapsed: number };
  extractors: Record<NodeId, ExtractorState>;
  processors: Record<NodeId, {
    progress: number;
    stored: number;
    full: boolean;
    inputs: Record<string, number>;
    materialType: ResourceType | null;
    assemblerRecipe?: AssemblerRecipeId | null;
    refinerRecipe?: RefinerRecipeId | null;
  }>;
  generators: Record<NodeId, { power: number; charcoal: number }>;
  researchFoundries: Record<NodeId, {
    progress: number;
    cores: number;
    coreItems?: CoreType[];
    /** Retained only so older version-1 saves can be migrated on load. */
    coreLoaded?: boolean;
  }>;
  treePlanters: Record<NodeId, { progress: number }>;
  miningDrills: Record<NodeId, {
    progress: number;
    iterations: number;
    selectedType: MiningDrillTarget | null;
  }>;
  minedDeposits: Record<NodeId, {
    type: MiningDrillTarget;
    remaining: number;
    capacity: number;
  }>;
  blackHoles: Record<NodeId, BlackHoleObstacle>;
  lakes: Record<NodeId, LakeObstacle>;
  mapPoints: number;
  research: {
    available: boolean;
    activeProject: ResearchProjectId | null;
    progress: Record<ResearchProjectId, number>;
    logisticsUnlocked: boolean;
    kilnUnlocked: boolean;
    charcoalGeneratorUnlocked: boolean;
    furnaceUnlocked: boolean;
    refinerUnlocked: boolean;
    assemblerUnlocked: boolean;
    researchCenterUnlocked: boolean;
    roadUnlocked: boolean;
    areaExpansion1Unlocked: boolean;
    areaExpansionLevel: number;
    extractor2Unlocked: boolean;
    extractor3Unlocked: boolean;
    treePlanterUnlocked: boolean;
    miningDrillUnlocked: boolean;
    explorationUnlocked: boolean;
    automataCoreUnlocked: boolean;
    mapNodeResearchCompletions: number;
  };
  splitters: Record<NodeId, {
    nextOutput: "a" | "b";
  }>;
  joints: Record<NodeId, {
    bufferedType: ResourceType | null;
    orientation: JointOrientation;
  }>;
  roads: Record<NodeId, {
    outboundType: InventoryItemType | null;
    inboundType: InventoryItemType | null;
    pairedSector: string | null;
    pairedRoadId: NodeId | null;
    edge: MapEdge | null;
    mode: RoadMode;
  }>;
  inventorySources: Record<NodeId, {
    progress: number;
    full: boolean;
    itemType: InventoryItemType | null;
    channels: Record<string, {
      progress: number;
      full: boolean;
      itemType: InventoryItemType | null;
    }>;
  }>;
  filters: Record<NodeId, {
    selectedType: InventoryItemType | null;
    bufferedType: InventoryItemType | null;
  }>;
  woodenChests: Record<NodeId, {
    itemType: InventoryItemType | null;
    stored: number;
  }>;
  storages: Record<NodeId, {
    items: Record<InventoryItemType, number>;
    capacityPerItem: number;
  }>;
  pausedOutputs: Record<NodeId, boolean>;
  construction: Record<NodeId, { progress: number; complete: boolean }>;
  inventoryCapacity: number;
  inventory: Record<InventoryItemType, number>;
  produced: Record<InventoryItemType, number>;
  extractorProduced: Record<InventoryItemType, number>;
};

type InventoryItemType =
  | ResourceType.IRON
  | ResourceType.COPPER
  | ResourceType.MYTHRIL
  | ResourceType.STONE
  | ResourceType.BRICK
  | ResourceType.WOOD
  | ResourceType.CHARCOAL
  | ResourceType.IRON_PLATE
  | ResourceType.COPPER_PLATE
  | ResourceType.MYTHRIL_PLATE
  | ResourceType.IRON_GEAR
  | ResourceType.COPPER_GEAR
  | ResourceType.MYTHRIL_GEAR
  | ResourceType.IRON_WIRE
  | ResourceType.COPPER_WIRE
  | ResourceType.MYTHRIL_WIRE
  | ResourceType.MOTOR
  | ResourceType.CIRCUIT_A
  | ResourceType.BASIC_CORE
  | ResourceType.AUTOMATA_CORE
  | ResourceType.WATER;

type BuildSequence = Record<PurchasableKind, number>;
type SerializedNode = Omit<NodeSpec, "icon">;
type RetiredProductionNodeKind =
  | "gearPress"
  | "wireMill"
  | "motorFactory"
  | "circuitAConduit";
type SaveSerializedNode = Omit<SerializedNode, "kind"> & {
  kind: NodeKind | RetiredProductionNodeKind;
};
type ShortcutBarId = "shortcutBar1" | "shortcutBar2" | "shortcutBar3";
type ShortcutBarConfig = {
  visible: boolean;
  position: { x: number; y: number };
  scale: number;
  rotation: 0 | 90;
  locked: boolean;
  assignments: Array<PurchasableKind | null>;
};
type ShortcutBarsState = Record<ShortcutBarId, ShortcutBarConfig>;
type ShortcutBarGroupAxis = "horizontal" | "vertical";
type ShortcutBarGroup = {
  axis: ShortcutBarGroupAxis;
  barIds: ShortcutBarId[];
};
type ShortcutBarSnapCandidate = {
  movingBarId: ShortcutBarId;
  targetBarId: ShortcutBarId;
  axis: ShortcutBarGroupAxis;
  movingBeforeTarget: boolean;
};
type ShortcutBarScreenRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};
type PromptPreferences = {
  skipConnectionDeleteConfirmation: boolean;
  automaticallyDestroyInventoryOverflow: boolean;
  skipNodeDestructionConfirmation: boolean;
  skipHighlightedGroupDeleteConfirmation: boolean;
  skipControlGroupTutorial: boolean;
  skipAssemblerRecipeChangeConfirmation: boolean;
  skipMiningDrillCompletionWarning: boolean;
  skipMultiConnectionTooltip: boolean;
  skipShortcutBarGroupTooltip: boolean;
};

type StarterBuildHintStage = "waiting" | "menu" | "extractor" | "complete";
type StarterConnectionHintStage = "waiting" | "active" | "complete";
type StarterTutorialSeenState = {
  stoneFirst: boolean;
  stoneSecond: boolean;
  forestFirst: boolean;
  forestSecond: boolean;
  extractorBuilding: boolean;
  connectionMaking: boolean;
};

const makeStarterTutorialSeenState = (): StarterTutorialSeenState => ({
  stoneFirst: false,
  stoneSecond: false,
  forestFirst: false,
  forestSecond: false,
  extractorBuilding: false,
  connectionMaking: false,
});

const hasSeenEveryStarterTutorial = (seen: StarterTutorialSeenState) =>
  Object.values(seen).every(Boolean);

type MapFactoryState = {
  nodes: SaveSerializedNode[];
  positions: Positions;
  connections: Connection[];
  runtime: Runtime;
  controlGroups: ControlGroup[];
  buildSequence: BuildSequence;
  zoom: number;
  viewport: { scrollLeft: number; scrollTop: number };
  lastSimulatedAt: number;
  producedBaseline: Record<InventoryItemType, number>;
  extractorProducedBaseline: Record<InventoryItemType, number>;
};

type MapFactoriesBySector = Record<string, MapFactoryState>;

const normalizePromptPreferences = (
  preferences?: Partial<PromptPreferences> | null,
): PromptPreferences => ({
  skipConnectionDeleteConfirmation:
    preferences?.skipConnectionDeleteConfirmation === true,
  automaticallyDestroyInventoryOverflow:
    preferences?.automaticallyDestroyInventoryOverflow === true,
  skipNodeDestructionConfirmation:
    preferences?.skipNodeDestructionConfirmation === true ||
    preferences?.skipHighlightedGroupDeleteConfirmation === true,
  skipHighlightedGroupDeleteConfirmation:
    preferences?.skipHighlightedGroupDeleteConfirmation === true,
  skipControlGroupTutorial: preferences?.skipControlGroupTutorial === true,
  skipAssemblerRecipeChangeConfirmation:
    preferences?.skipAssemblerRecipeChangeConfirmation === true,
  skipMiningDrillCompletionWarning:
    preferences?.skipMiningDrillCompletionWarning === true,
  skipMultiConnectionTooltip:
    preferences?.skipMultiConnectionTooltip === true,
  skipShortcutBarGroupTooltip:
    preferences?.skipShortcutBarGroupTooltip === true,
});

type SaveGamePayload = {
  version: 1;
  nodes: SaveSerializedNode[];
  positions: Positions;
  connections: Connection[];
  runtime: Runtime;
  controlGroups: ControlGroup[];
  revealedBuildKinds: PurchasableKind[];
  builtBuildKinds: PurchasableKind[];
  placedBuildKinds?: PurchasableKind[];
  newBuildKinds: PurchasableKind[];
  unlockTimes: UnlockTimes;
  logisticsUnlocked: boolean;
  selectedMapSector: string | null;
  mapNodeProgress?: MapNodeProgressBySector;
  activeMapSector?: string;
  mapFactories?: MapFactoriesBySector;
  gameElapsedMs: number;
  zoom: number;
  viewport: { scrollLeft: number; scrollTop: number };
  buildSequence: BuildSequence;
  controlGroupSequence: number;
  isRunning: boolean;
  buildAttention: boolean;
  journalAttention: boolean;
  promptPreferences?: PromptPreferences;
  shortcutBars?: ShortcutBarsState;
  shortcutBarGroups?: ShortcutBarGroup[];
  achievements?: AchievementId[];
  removeBuildCosts?: boolean;
  starterStoneCollectHint?: {
    activated: boolean;
    dismissed: boolean;
    secondPending?: boolean;
    secondActive?: boolean;
    stoneCollections?: number;
    lastCollectionElapsedMs?: number;
  };
  starterForestCollectHint?: {
    activated: boolean;
    dismissed: boolean;
    secondPending?: boolean;
    secondActive?: boolean;
    eligibleAtElapsedMs?: number;
  };
  starterBuildHint?: {
    stage: StarterBuildHintStage;
    eligibleAtElapsedMs?: number;
    lastActivityElapsedMs?: number;
  };
  starterConnectionHint?: {
    stage: StarterConnectionHintStage;
    eligibleAtElapsedMs?: number;
    extractorId?: NodeId | null;
  };
  starterTutorialOutro?: {
    shown?: boolean;
    eligibleAtElapsedMs?: number;
    seen?: Partial<StarterTutorialSeenState>;
  };
};
type SaveGameSlot = {
  name: string;
  savedAt: string;
  data: SaveGamePayload;
};

type GraphUndoSnapshot = {
  nodes: NodeSpec[];
  positions: Positions;
  connections: Connection[];
  runtime: Runtime;
  controlGroups: ControlGroup[];
  mapFactoryRuntimes?: Record<string, Runtime>;
  mapFactoryStates?: Record<string, MapFactoryState>;
};

type UndoEntry =
  | { kind: "graph"; snapshot: GraphUndoSnapshot }
  | { kind: "movement"; positions: Partial<Positions> };

type RapidClickAnimationVariant = 0 | 1 | 2 | 3 | 4;
type RapidClickAnimation = {
  token: number;
  variant: RapidClickAnimationVariant;
};

const MAX_UNDO_HISTORY = 50;
const RAPID_CLICK_TARGET = 6;
const RAPID_CLICK_WINDOW_MS = 2500;
const RAPID_CLICK_SEQUENCE_WINDOW_MS = 12000;
const RAPID_CLICK_ANIMATION_DURATION_MS = 1400;
const STONE_COLLECT_HINT_DELAY_MS = 60_000;
const SUBSEQUENT_COLLECT_HINT_DELAY_MS = 20_000;
const STONE_COLLECT_HINT_ARROW_COUNT = 12;
const BLACK_HOLE_RADIUS = 38;
const BLACK_HOLE_CLEARANCE = 10;
const BLACK_HOLE_CLICK_CLUSTER_RADIUS = 24;
const BLACK_HOLE_SHAPE_POINTS = 11;
const BLACK_HOLE_GENERATION_CENTER_SPACING = 1.7;
const BLACK_HOLE_GENERATION_RANDOMIZATION_PASSES = 3;
const BLACK_HOLE_GENERATION_RANDOMIZATION_ATTEMPTS = 160;
const RESOURCE_DEPLETION_BLACK_HOLE_RADIUS = BLACK_HOLE_RADIUS * Math.sqrt(10);
const BLACK_HOLE_INPUT_PORT: Port = {
  id: "black-hole-stone-in",
  label: "Stone",
  type: ResourceType.STONE,
  direction: "input",
};
const LAKE_SHAPE_POINTS = 18;
const LAKE_PRODUCTION_DURATION = 1000;
const LAKE_CONNECTOR_COLOR = "#5b6cff";
type LakeOutputDirection = "north" | "east" | "south" | "west";
const LAKE_WATER_OUTPUT_PORTS: Array<Port & { side: LakeOutputDirection }> = [
  { id: "lake-water-out-north", label: "Water", type: ResourceType.WATER, direction: "output", side: "north" },
  { id: "lake-water-out", label: "Water", type: ResourceType.WATER, direction: "output", side: "east" },
  { id: "lake-water-out-south", label: "Water", type: ResourceType.WATER, direction: "output", side: "south" },
  { id: "lake-water-out-west", label: "Water", type: ResourceType.WATER, direction: "output", side: "west" },
];
const getLakeWaterOutputPort = (portId: string) =>
  LAKE_WATER_OUTPUT_PORTS.find((port) => port.id === portId) ?? null;

const createBlackHoleObstacle = (
  center: Position,
  radius = BLACK_HOLE_RADIUS,
  id = `black-hole-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
): BlackHoleObstacle => ({
  id,
  x: center.x,
  y: center.y,
  radius,
  rotation: Math.random() * 360,
  shape: Array.from(
    { length: BLACK_HOLE_SHAPE_POINTS },
    () => 0.76 + Math.random() * 0.24,
  ),
  stoneFilled: 0,
});

const normalizeBlackHoles = (value: unknown): Record<NodeId, BlackHoleObstacle> => {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, Partial<BlackHoleObstacle>>).flatMap(([id, hole]) => {
      const x = Number(hole?.x);
      const y = Number(hole?.y);
      const radius = Number(hole?.radius);
      if (!id || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius <= 0) {
        return [];
      }
      const shape = Array.isArray(hole.shape) && hole.shape.length >= 7
        ? hole.shape.map((point) => Math.min(1.15, Math.max(0.55, Number(point) || 0.8)))
        : Array.from({ length: BLACK_HOLE_SHAPE_POINTS }, () => 0.82);
      return [[id, {
        id,
        x,
        y,
        radius,
        rotation: Number(hole.rotation) || 0,
        shape,
        stoneFilled: Math.max(0, Math.floor(Number(hole.stoneFilled) || 0)),
      } satisfies BlackHoleObstacle]];
    }),
  );
};

const getPolygonArea = (points: Position[]) => Math.abs(points.reduce(
  (area, point, index) => {
    const next = points[(index + 1) % points.length];
    return area + point.x * next.y - next.x * point.y;
  },
  0,
)) / 2;

const createLakeObstacle = (
  playAreaSize: NodeSize,
  targetAreaRatio: number,
  margin: number,
  id = `lake-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
): LakeObstacle => {
  const shape = Array.from({ length: LAKE_SHAPE_POINTS }, (_, index) => {
    const wave = Math.sin(index * 1.9) * 0.07 + Math.cos(index * 2.7) * 0.05;
    return Math.min(0.98, Math.max(0.68, 0.86 + wave + (Math.random() - 0.5) * 0.18));
  });
  const aspectRatio = 1.25 + Math.random() * 0.5;
  const unitPoints = shape.map((scale, index) => {
    const angle = (Math.PI * 2 * index) / shape.length;
    return {
      x: Math.cos(angle) * aspectRatio * scale,
      y: Math.sin(angle) * scale,
    };
  });
  const targetArea = playAreaSize.width * playAreaSize.height * targetAreaRatio;
  const scale = Math.sqrt(targetArea / Math.max(0.001, getPolygonArea(unitPoints)));
  const halfWidth = aspectRatio * scale;
  const halfHeight = scale;
  const availableWidth = Math.max(0, playAreaSize.width - halfWidth * 2 - margin * 2);
  const availableHeight = Math.max(0, playAreaSize.height - halfHeight * 2 - margin * 2);
  return {
    id,
    x: margin + halfWidth + Math.random() * availableWidth,
    y: margin + halfHeight + Math.random() * availableHeight,
    width: halfWidth * 2,
    height: halfHeight * 2,
    shape,
    productionElapsed: 0,
    nextOutputIndex: 0,
  };
};

const getLakeObstacleArea = (lake: LakeObstacle) => getPolygonArea(
  lake.shape.map((scale, index) => {
    const angle = (Math.PI * 2 * index) / lake.shape.length;
    return {
      x: Math.cos(angle) * (lake.width / 2) * scale,
      y: Math.sin(angle) * (lake.height / 2) * scale,
    };
  }),
);

const normalizeLakes = (value: unknown): Record<NodeId, LakeObstacle> => {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, Partial<LakeObstacle>>).flatMap(([id, lake]) => {
      const x = Number(lake?.x);
      const y = Number(lake?.y);
      const width = Number(lake?.width);
      const height = Number(lake?.height);
      if (
        !id ||
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) return [];
      const shape = Array.isArray(lake.shape) && lake.shape.length >= 8
        ? lake.shape.map((scale) => Math.min(1, Math.max(0.55, Number(scale) || 0.82)))
        : Array.from({ length: LAKE_SHAPE_POINTS }, () => 0.84);
      return [[id, {
        id,
        x,
        y,
        width,
        height,
        shape,
        productionElapsed: Math.max(0, Number(lake.productionElapsed) || 0) % LAKE_PRODUCTION_DURATION,
        nextOutputIndex: Math.max(0, Math.floor(Number(lake.nextOutputIndex) || 0)),
      } satisfies LakeObstacle]];
    }),
  );
};

const IRON_RESOURCE_COLOR = "#8296a6";
const MYTHRIL_RESOURCE_COLOR = "#55c97a";

const RESOURCE_COLORS: Record<ResourceType, string> = {
  [ResourceType.RESOURCE]: "#8ea0a6",
  [ResourceType.IRON_ORE]: IRON_RESOURCE_COLOR,
  [ResourceType.COPPER_ORE]: "#d17b55",
  [ResourceType.STONE_CHUNKS]: "#8c918f",
  [ResourceType.FOREST]: "#72a873",
  [ResourceType.METAL]: "#a89a91",
  [ResourceType.IRON]: IRON_RESOURCE_COLOR,
  [ResourceType.COPPER]: "#d98a62",
  [ResourceType.MYTHRIL]: MYTHRIL_RESOURCE_COLOR,
  [ResourceType.STONE]: "#a6aaa7",
  [ResourceType.BRICK]: "#666b70",
  [ResourceType.WOOD]: "#d29a5a",
  [ResourceType.CHARCOAL]: "#6f7782",
  [ResourceType.PLATE]: "#b5a69d",
  [ResourceType.IRON_PLATE]: IRON_RESOURCE_COLOR,
  [ResourceType.COPPER_PLATE]: "#db8f69",
  [ResourceType.MYTHRIL_PLATE]: "#62d287",
  [ResourceType.GEAR]: "#91b6bb",
  [ResourceType.IRON_GEAR]: IRON_RESOURCE_COLOR,
  [ResourceType.COPPER_GEAR]: "#d69a72",
  [ResourceType.MYTHRIL_GEAR]: "#58bd78",
  [ResourceType.WIRE]: "#b7a79a",
  [ResourceType.IRON_WIRE]: IRON_RESOURCE_COLOR,
  [ResourceType.COPPER_WIRE]: "#e79a70",
  [ResourceType.MYTHRIL_WIRE]: "#73dd96",
  [ResourceType.MOTOR]: "#d9a54a",
  [ResourceType.CIRCUIT_A]: "#6fcf9b",
  [ResourceType.CORE]: "#8baadf",
  [ResourceType.BASIC_CORE]: "#e45757",
  [ResourceType.AUTOMATA_CORE]: "#ff6b00",
  [ResourceType.FOREST_GROWTH]: "#82d982",
  [ResourceType.POWER]: "#f2d45c",
  [ResourceType.WATER]: "#55bde8",
  [ResourceType.ANY]: "#d5b666",
};

const formatResourceType = (type: ResourceType) =>
  type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const STORAGE_NODE_CAPACITY = 10;
const WOODEN_CHEST_CAPACITY = 20;
const BASE_INVENTORY_CAPACITY = 10;
const BASE_INVENTORY_NODE_ID = "base-inventory";
const BASE_PRODUCTION_STORAGE_CAPACITY = 5;
const EXTRACTOR_CAPACITY = BASE_PRODUCTION_STORAGE_CAPACITY;
const PROCESSOR_CAPACITY = BASE_PRODUCTION_STORAGE_CAPACITY;
const INVENTORY_ITEMS: Array<{ type: InventoryItemType; label: string }> = [
  { type: ResourceType.STONE, label: "Stone" },
  { type: ResourceType.WOOD, label: "Wood" },
  { type: ResourceType.COPPER, label: "Copper" },
  { type: ResourceType.IRON, label: "Iron" },
  { type: ResourceType.MYTHRIL, label: "Mythril" },
  { type: ResourceType.BRICK, label: "Brick" },
  { type: ResourceType.CHARCOAL, label: "Charcoal" },
  { type: ResourceType.IRON_PLATE, label: "Iron Plate" },
  { type: ResourceType.COPPER_PLATE, label: "Copper Plate" },
  { type: ResourceType.MYTHRIL_PLATE, label: "Mythril Plate" },
  { type: ResourceType.IRON_GEAR, label: "Iron Gear" },
  { type: ResourceType.COPPER_GEAR, label: "Copper Gear" },
  { type: ResourceType.MYTHRIL_GEAR, label: "Mythril Gear" },
  { type: ResourceType.IRON_WIRE, label: "Iron Wire" },
  { type: ResourceType.COPPER_WIRE, label: "Copper Wire" },
  { type: ResourceType.MYTHRIL_WIRE, label: "Mythril Wire" },
  { type: ResourceType.MOTOR, label: "Motor" },
  { type: ResourceType.CIRCUIT_A, label: "Circuit A" },
  { type: ResourceType.BASIC_CORE, label: "Basic Core" },
  { type: ResourceType.AUTOMATA_CORE, label: "Automata Core" },
  { type: ResourceType.WATER, label: "Water" },
];

const STARTING_INVENTORY_ITEM_TYPES = new Set<InventoryItemType>([
  ResourceType.IRON,
  ResourceType.COPPER,
  ResourceType.STONE,
  ResourceType.WOOD,
]);

const PRODUCIBLE_INVENTORY_TYPES_BY_KIND: Partial<Record<NodeKind, readonly InventoryItemType[]>> = {
  mythrilOre: [ResourceType.MYTHRIL],
  kiln: [ResourceType.CHARCOAL],
  furnace: [ResourceType.IRON_PLATE, ResourceType.COPPER_PLATE, ResourceType.MYTHRIL_PLATE],
  assembler: [
    ResourceType.MOTOR,
    ResourceType.CIRCUIT_A,
    ResourceType.BASIC_CORE,
    ResourceType.AUTOMATA_CORE,
  ],
  refiner: [
    ResourceType.IRON_GEAR,
    ResourceType.COPPER_GEAR,
    ResourceType.MYTHRIL_GEAR,
    ResourceType.IRON_WIRE,
    ResourceType.COPPER_WIRE,
    ResourceType.MYTHRIL_WIRE,
    ResourceType.BRICK,
  ],
  automataCoreAssembler: [ResourceType.AUTOMATA_CORE],
};

const CONTROL_GROUP_COLORS = [
  { name: "Blue", value: "#4E79A7" },
  { name: "Orange", value: "#F28E2B" },
  { name: "Red", value: "#E15759" },
  { name: "Teal", value: "#76B7B2" },
  { name: "Green", value: "#59A14F" },
  { name: "Yellow", value: "#EDC948" },
  { name: "Purple", value: "#B07AA1" },
  { name: "Pink", value: "#FF9DA7" },
  { name: "Brown", value: "#9C755F" },
  { name: "Gray", value: "#BAB0AC" },
] as const;

const makeEmptyItemStore = () => Object.fromEntries(
  INVENTORY_ITEMS.map((item) => [item.type, 0]),
) as Record<InventoryItemType, number>;

const normalizeItemStore = (
  items: Partial<Record<InventoryItemType, number>> | undefined,
  capacity = Number.POSITIVE_INFINITY,
) => Object.fromEntries(
  INVENTORY_ITEMS.map(({ type }) => [
    type,
    Math.min(capacity, Math.max(0, Math.floor(Number(items?.[type]) || 0))),
  ]),
) as Record<InventoryItemType, number>;

const FOREST_GROWTH_INPUT: Port = {
  id: "forest-growth-in",
  label: "Reforestation",
  type: ResourceType.FOREST_GROWTH,
  direction: "input",
};

const INITIAL_NODES: NodeSpec[] = [
  {
    id: "ironOre",
    kind: "ironOre",
    title: "Iron",
    eyebrow: "ORE DEPOSIT 01",
    color: RESOURCE_COLORS.IRON_ORE,
    icon: Gem,
    inputs: [],
    outputs: [{ id: "ore-out", label: "Iron", type: ResourceType.IRON, direction: "output" }],
  },
  {
    id: "copperOre",
    kind: "copperOre",
    title: "Copper",
    eyebrow: "ORE DEPOSIT 03",
    color: RESOURCE_COLORS.COPPER_ORE,
    icon: Gem,
    inputs: [],
    outputs: [{ id: "copper-ore-out", label: "Copper", type: ResourceType.COPPER, direction: "output" }],
  },
  {
    id: "stone",
    kind: "stone",
    title: "Stone Deposit",
    eyebrow: "STONE DEPOSIT 04",
    color: RESOURCE_COLORS.STONE,
    icon: Mountain,
    inputs: [],
    outputs: [{ id: "stone-out", label: "Stone", type: ResourceType.STONE, direction: "output" }],
  },
  {
    id: "forest",
    kind: "forest",
    title: "Forest",
    eyebrow: "RESOURCE 02",
    color: RESOURCE_COLORS.FOREST,
    icon: TreePine,
    inputs: [],
    outputs: [{ id: "forest-out", label: "Wood", type: ResourceType.WOOD, direction: "output" }],
  },
];

const MYTHRIL_RESOURCE_NODE: NodeSpec = {
  id: "mythrilOre",
  kind: "mythrilOre",
  title: "Mythril",
  eyebrow: "ORE DEPOSIT 05",
  color: MYTHRIL_RESOURCE_COLOR,
  icon: Gem,
  inputs: [],
  outputs: [{
    id: "mythril-ore-out",
    label: "Mythril",
    type: ResourceType.MYTHRIL,
    direction: "output",
  }],
};

const HOME_OFFSET = { x: 0, y: 0 };
const WORLD_SIZE = { width: 3600, height: 2400 };
const AREA_EXPANSION_SIZE_INCREMENT = 0.25;
const MAX_AREA_EXPANSION_LEVEL = 3;
const MAP_NODE_MAX_SIZE_MULTIPLIER = 2;
const BASIC_CORE_RESEARCH_COST = 10;
const EXPLORATION_RESEARCH_COST = 5;
const CONNECTION_AUTO_SCROLL_EDGE = 72;
const CONNECTION_AUTO_SCROLL_MAX_SPEED = 880;
const PORT_SNAP_PADDING = 14;
const NODE_CLEARANCE = 12;
const JOINT_NODE_SIZE = 54;
const COMPACT_ROUTING_NODE_SIZE = JOINT_NODE_SIZE * 1.25;
const ROAD_NODE_SIZE = COMPACT_ROUTING_NODE_SIZE * 2;
const WOODEN_CHEST_NODE_SIZE = { width: 129, height: 101 };
const RESOURCE_NODE_SIZE = { width: 310, height: 242 };
const RESEARCH_CENTER_NODE_SCALE = 1.2;
const STARTING_RESOURCE_X = 96 + RESOURCE_NODE_SIZE.width / 2;
const STARTING_RESOURCE_STEP = (RESOURCE_NODE_SIZE.height + NODE_CLEARANCE) * 2;

const isResourceNodeKind = (kind: NodeKind) =>
  kind === "ironOre" ||
  kind === "copperOre" ||
  kind === "mythrilOre" ||
  kind === "stone" ||
  kind === "forest";

const getEstimatedNodeSize = (node: NodeSpec): NodeSize => {
  if (isResourceNodeKind(node.kind)) return RESOURCE_NODE_SIZE;
  if (node.kind === "joint" || node.kind === "powerSplitter") {
    return { width: JOINT_NODE_SIZE, height: JOINT_NODE_SIZE };
  }
  if (node.kind === "road") {
    return { width: ROAD_NODE_SIZE, height: ROAD_NODE_SIZE };
  }
  if (node.kind === "splitter" || node.kind === "merger" || node.kind === "filter") {
    return { width: COMPACT_ROUTING_NODE_SIZE, height: COMPACT_ROUTING_NODE_SIZE };
  }
  if (node.kind === "woodenChest") return WOODEN_CHEST_NODE_SIZE;
  const portRows = Math.max(node.inputs.length, node.outputs.length, 1);
  const size = { width: 258, height: 171 + portRows * 30 };
  return node.kind === "researchFoundry"
    ? {
        width: size.width * RESEARCH_CENTER_NODE_SCALE,
        height: size.width * RESEARCH_CENTER_NODE_SCALE,
      }
    : size;
};

const rectanglesOverlap = (
  first: Position & NodeSize,
  second: Position & NodeSize,
  clearance = NODE_CLEARANCE,
) =>
  first.x < second.x + second.width + clearance &&
  first.x + first.width + clearance > second.x &&
  first.y < second.y + second.height + clearance &&
  first.y + first.height + clearance > second.y;

const INITIAL_POSITIONS: Positions = {
  stone: { x: STARTING_RESOURCE_X, y: 120 },
  forest: { x: STARTING_RESOURCE_X, y: 120 + STARTING_RESOURCE_STEP },
  copperOre: { x: STARTING_RESOURCE_X, y: 120 + STARTING_RESOURCE_STEP * 2 },
  ironOre: { x: STARTING_RESOURCE_X, y: 120 + STARTING_RESOURCE_STEP * 3 },
};

const STARTING_RESOURCE_BOUNDS = {
  left: STARTING_RESOURCE_X,
  top: INITIAL_POSITIONS.stone.y,
  right: STARTING_RESOURCE_X + RESOURCE_NODE_SIZE.width,
  bottom: INITIAL_POSITIONS.ironOre.y + RESOURCE_NODE_SIZE.height,
};

const INITIAL_CONNECTIONS: Connection[] = [];

const RESOURCE_CAPACITIES = {
  ironOre: 1000,
  copperOre: 1000,
  mythrilOre: 1000,
  stone: 1000,
  forest: 1000,
} as const;
const normalizeBaseResourceState = (
  state: { remaining?: number; capacity?: number } | null | undefined,
  capacity: number,
) => ({
  capacity,
  remaining: Math.min(
    capacity,
    Math.max(0, Math.floor(Number(state?.remaining ?? capacity) || 0)),
  ),
});
const FOREST_BASE_REGENERATION_DURATION = 30_000;
const SIMULATION_TICK_INTERVAL = 100;
const SIMULATION_UI_INTERVAL = 250;
const MAX_SIMULATION_ELAPSED = 1000;

const MINED_DEPOSIT_CAPACITY = 1000;
const MINING_DRILL_ITERATIONS = 20;
const MYTHRIL_MIN_MAP_NODE_VALUE = 4;

const MINING_DRILL_TARGETS: Array<{
  type: MiningDrillTarget;
  kind: "ironOre" | "copperOre" | "mythrilOre" | "stone";
  title: string;
  label: string;
  portId: "ore-out" | "copper-ore-out" | "mythril-ore-out" | "stone-out";
  minimumMapNodeValue: number;
  icon: NodeSpec["icon"];
}> = [
  {
    type: ResourceType.IRON,
    kind: "ironOre",
    title: "Iron",
    label: "Iron",
    portId: "ore-out",
    minimumMapNodeValue: 0,
    icon: Gem,
  },
  {
    type: ResourceType.COPPER,
    kind: "copperOre",
    title: "Copper",
    label: "Copper",
    portId: "copper-ore-out",
    minimumMapNodeValue: 0,
    icon: Gem,
  },
  {
    type: ResourceType.MYTHRIL,
    kind: "mythrilOre",
    title: "Mythril",
    label: "Mythril",
    portId: "mythril-ore-out",
    minimumMapNodeValue: MYTHRIL_MIN_MAP_NODE_VALUE,
    icon: Gem,
  },
  {
    type: ResourceType.STONE,
    kind: "stone",
    title: "Stone Deposit",
    label: "Stone",
    portId: "stone-out",
    minimumMapNodeValue: 0,
    icon: Mountain,
  },
];

const normalizeResourceOutputType = (type: ResourceType) =>
  type === ResourceType.IRON_ORE
    ? ResourceType.IRON
    : type === ResourceType.COPPER_ORE
      ? ResourceType.COPPER
      : type === ResourceType.STONE_CHUNKS
        ? ResourceType.STONE
        : type === ResourceType.FOREST
          ? ResourceType.WOOD
          : type;

const getMiningTarget = (type: ResourceType | null) =>
  MINING_DRILL_TARGETS.find(
    (target) => target.type === (type ? normalizeResourceOutputType(type) : type),
  ) ?? null;

const createMinedDepositNode = (id: NodeId, type: MiningDrillTarget): NodeSpec => {
  const target = getMiningTarget(type) ?? MINING_DRILL_TARGETS[0];
  return {
    id,
    kind: target.kind,
    title: target.title,
    eyebrow: "DRILLED DEPOSIT",
    color: RESOURCE_COLORS[target.type],
    icon: target.icon,
    inputs: [],
    outputs: [{ id: target.portId, label: target.label, type: target.type, direction: "output" }],
  };
};

const isDirectResourceSource = (
  runtime: Runtime,
  sourceNode: NodeId,
  type: ResourceType,
) =>
  (
    runtime.minedDeposits[sourceNode] &&
    normalizeResourceOutputType(runtime.minedDeposits[sourceNode].type) === normalizeResourceOutputType(type)
  ) ||
  (sourceNode === "ironOre" && normalizeResourceOutputType(type) === ResourceType.IRON) ||
  (sourceNode === "copperOre" && normalizeResourceOutputType(type) === ResourceType.COPPER) ||
  (sourceNode === "stone" && normalizeResourceOutputType(type) === ResourceType.STONE) ||
  (sourceNode === "forest" && normalizeResourceOutputType(type) === ResourceType.WOOD);

const getDirectResourceRemaining = (
  runtime: Runtime,
  sourceNode: NodeId,
  type: ResourceType,
) => {
  const minedDeposit = runtime.minedDeposits[sourceNode];
  if (
    minedDeposit &&
    normalizeResourceOutputType(minedDeposit.type) === normalizeResourceOutputType(type)
  ) return minedDeposit.remaining;
  if (sourceNode === "ironOre" && normalizeResourceOutputType(type) === ResourceType.IRON) return runtime.ironOre.remaining;
  if (sourceNode === "copperOre" && normalizeResourceOutputType(type) === ResourceType.COPPER) return runtime.copperOre.remaining;
  if (sourceNode === "stone" && normalizeResourceOutputType(type) === ResourceType.STONE) return runtime.stone.remaining;
  if (sourceNode === "forest" && normalizeResourceOutputType(type) === ResourceType.WOOD) return runtime.forest.remaining;
  return 0;
};

const resolveResourceSourceNode = (
  runtime: Runtime,
  sourceNode: NodeId,
  type: ResourceType,
  edges: Connection[],
  visited = new Set<NodeId>(),
): NodeId | null => {
  if (visited.has(sourceNode)) return null;
  if (isDirectResourceSource(runtime, sourceNode, type)) return sourceNode;
  const nextVisited = new Set(visited).add(sourceNode);
  const incoming = edges.filter(
    (edge) => edge.targetNode === sourceNode && edge.type === type,
  );
  let fallback: NodeId | null = null;
  for (const edge of incoming) {
    const resolved = resolveResourceSourceNode(
      runtime,
      edge.sourceNode,
      type,
      edges,
      nextVisited,
    );
    if (!resolved) continue;
    if (getDirectResourceRemaining(runtime, resolved, type) > 0) return resolved;
    fallback ??= resolved;
  }
  return fallback;
};

const getResourceRemaining = (
  runtime: Runtime,
  sourceNode: NodeId,
  type: ResourceType,
  edges: Connection[] = [],
) => {
  const resolvedSource = resolveResourceSourceNode(runtime, sourceNode, type, edges) ?? sourceNode;
  return getDirectResourceRemaining(runtime, resolvedSource, type);
};

const consumeResource = (
  runtime: Runtime,
  sourceNode: NodeId,
  type: ResourceType,
  edges: Connection[] = [],
) => {
  const resolvedSource = resolveResourceSourceNode(runtime, sourceNode, type, edges) ?? sourceNode;
  const minedDeposit = runtime.minedDeposits[resolvedSource];
  if (
    minedDeposit &&
    normalizeResourceOutputType(minedDeposit.type) === normalizeResourceOutputType(type)
  ) {
    minedDeposit.remaining = Math.max(0, minedDeposit.remaining - 1);
  } else if (resolvedSource === "ironOre" && normalizeResourceOutputType(type) === ResourceType.IRON) {
    runtime.ironOre.remaining = Math.max(0, runtime.ironOre.remaining - 1);
  } else if (resolvedSource === "copperOre" && normalizeResourceOutputType(type) === ResourceType.COPPER) {
    runtime.copperOre.remaining = Math.max(0, runtime.copperOre.remaining - 1);
  } else if (resolvedSource === "stone" && normalizeResourceOutputType(type) === ResourceType.STONE) {
    runtime.stone.remaining = Math.max(0, runtime.stone.remaining - 1);
  } else if (resolvedSource === "forest" && normalizeResourceOutputType(type) === ResourceType.WOOD) {
    runtime.forest.remaining = Math.max(0, runtime.forest.remaining - 1);
  }
};

const makeResearchState = (): Runtime["research"] => ({
  available: false,
  activeProject: null,
  progress: {
    logistics: 0,
    kiln: 0,
    charcoalGenerator: 0,
    furnace: 0,
    refiner: 0,
    assembler: 0,
    researchCenter: 0,
    road: 0,
    areaExpansion1: 0,
    extractor2: 0,
    extractor3: 0,
    treePlanter: 0,
    miningDrill: 0,
    exploration: 0,
    mapNode: 0,
    automataCore: 0,
  },
  logisticsUnlocked: false,
  kilnUnlocked: false,
  charcoalGeneratorUnlocked: false,
  furnaceUnlocked: false,
  refinerUnlocked: false,
  assemblerUnlocked: false,
  researchCenterUnlocked: false,
  roadUnlocked: false,
  areaExpansion1Unlocked: false,
  areaExpansionLevel: 0,
  extractor2Unlocked: false,
  extractor3Unlocked: false,
  treePlanterUnlocked: false,
  miningDrillUnlocked: false,
  explorationUnlocked: false,
  automataCoreUnlocked: false,
  mapNodeResearchCompletions: 0,
});

const makeRuntime = (): Runtime => ({
  ironOre: { remaining: RESOURCE_CAPACITIES.ironOre, capacity: RESOURCE_CAPACITIES.ironOre },
  copperOre: { remaining: RESOURCE_CAPACITIES.copperOre, capacity: RESOURCE_CAPACITIES.copperOre },
  stone: { remaining: RESOURCE_CAPACITIES.stone, capacity: RESOURCE_CAPACITIES.stone },
  forest: {
    remaining: RESOURCE_CAPACITIES.forest,
    capacity: RESOURCE_CAPACITIES.forest,
    regenerationElapsed: 0,
  },
  extractors: {},
  processors: {},
  generators: {},
  researchFoundries: {},
  treePlanters: {},
  miningDrills: {},
  minedDeposits: {},
  blackHoles: {},
  lakes: {},
  mapPoints: 0,
  research: makeResearchState(),
  splitters: {},
  joints: {},
  roads: {},
  inventorySources: {},
  filters: {},
  woodenChests: {},
  storages: {},
  inventoryCapacity: BASE_INVENTORY_CAPACITY,
  inventory: makeEmptyItemStore(),
  pausedOutputs: {},
  construction: {},
  produced: makeEmptyItemStore(),
  extractorProduced: makeEmptyItemStore(),
});

type ExtractorNodeId = NodeId;
type ExtractorProduct = ResourceType.IRON | ResourceType.COPPER | ResourceType.MYTHRIL | ResourceType.STONE | ResourceType.WOOD;

const EXTRACTOR_BASE_CYCLE_DURATION = 5000;

const EXTRACTOR_RECIPES: Partial<Record<ResourceType, { product: ExtractorProduct; label: string; duration: number }>> = {
  [ResourceType.IRON_ORE]: { product: ResourceType.IRON, label: "Iron", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.IRON]: { product: ResourceType.IRON, label: "Iron", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.COPPER_ORE]: { product: ResourceType.COPPER, label: "Copper", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.COPPER]: { product: ResourceType.COPPER, label: "Copper", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.MYTHRIL]: { product: ResourceType.MYTHRIL, label: "Mythril", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.STONE_CHUNKS]: { product: ResourceType.STONE, label: "Stone", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.STONE]: { product: ResourceType.STONE, label: "Stone", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.FOREST]: { product: ResourceType.WOOD, label: "Wood", duration: EXTRACTOR_BASE_CYCLE_DURATION },
  [ResourceType.WOOD]: { product: ResourceType.WOOD, label: "Wood", duration: EXTRACTOR_BASE_CYCLE_DURATION },
};

const getManualResourceProductType = (node: NodeSpec): ExtractorProduct | null => {
  if (!isResourceNodeKind(node.kind)) return null;
  const outputType = node.outputs[0]?.type;
  return outputType ? EXTRACTOR_RECIPES[outputType]?.product ?? null : null;
};

const formatCycleDuration = (duration: number) =>
  `${Number((duration / 1000).toFixed(2))} s`;

const isExtractorNode = (nodeId: NodeId): nodeId is ExtractorNodeId =>
  nodeId === "ironExtractor" ||
  nodeId === "woodExtractor" ||
  nodeId.startsWith("extractor-");

const isExtractorKind = (kind: NodeKind): kind is ExtractorKind =>
  kind === "extractor";

const PRODUCTION_BUILD_TIME = 5000;

const BUILD_TIMES = {
  extractor: PRODUCTION_BUILD_TIME,
  generator: PRODUCTION_BUILD_TIME,
  powerSplitter: 6000,
  researchFoundry: PRODUCTION_BUILD_TIME,
  treePlanter: PRODUCTION_BUILD_TIME,
  miningDrill: PRODUCTION_BUILD_TIME,
  furnace: PRODUCTION_BUILD_TIME,
  automataCoreAssembler: PRODUCTION_BUILD_TIME,
  refiner: PRODUCTION_BUILD_TIME,
  assembler: PRODUCTION_BUILD_TIME,
  kiln: PRODUCTION_BUILD_TIME,
  splitter: 2000,
  merger: 2000,
  joint: 2000,
  road: 2000,
  inventorySource: 12000,
  filter: 10000,
  storage: 12000,
  woodenChest: 2000,
} as const;

const makeBuildSequence = (): BuildSequence => ({
  extractor: 0,
  generator: 0,
  powerSplitter: 0,
  researchFoundry: 0,
  treePlanter: 0,
  miningDrill: 0,
  furnace: 0,
  kiln: 0,
  automataCoreAssembler: 0,
  refiner: 0,
  assembler: 0,
  splitter: 0,
  merger: 0,
  joint: 0,
  road: 0,
  inventorySource: 0,
  filter: 0,
  storage: 0,
  woodenChest: 0,
});

const SAVE_STORAGE_KEY = "factorinode.save-slots.v1";
const TEMPORARY_SAVE_STORAGE_KEY = "factorinode.temporary-save.v1";
const TEMPORARY_SAVE_FREQUENCY_STORAGE_KEY = "factorinode.temporary-save-frequency.v1";
const WIRE_ANIMATION_STORAGE_KEY = "factorinode.wire-animations.v1";
const SAVE_SLOT_COUNT = 3;
const DEFAULT_TEMPORARY_SAVE_FREQUENCY_MINUTES = 5;
const MIN_TEMPORARY_SAVE_FREQUENCY_MINUTES = 1;
const MAX_TEMPORARY_SAVE_FREQUENCY_MINUTES = 60;
const EMPTY_ACHIEVEMENT_FLAVOR_TEXTS = [
  "Nope, nothing here yet",
  "Are you even trying?",
  "Someday, maybe.",
] as const;
const ACHIEVEMENT_UNLOCK_DETAILS: Record<AchievementId, {
  title: string;
  description: string;
  flavorText: string;
  icon: NodeSpec["icon"];
}> = {
  oops: {
    title: "Oops.",
    description: "Create a Black Hole by rapidly clicking an empty part of the field.",
    flavorText: "Did I do thaaaaat?",
    icon: Trophy,
  },
  handHolding: {
    title: "Hand Holding",
    description: "See the final tutorial after completing every previous tutorial.",
    flavorText: "You are either very deliberate, or very slow.  Or both?",
    icon: BookOpenText,
  },
};
const isAchievementId = (value: unknown): value is AchievementId =>
  value === "oops" || value === "handHolding";
const SHORTCUT_SLOT_COUNT = 5;
const SHORTCUT_BAR_SCALE_MIN = 0.72;
const SHORTCUT_BAR_SCALE_MAX = 1.55;
const SHORTCUT_BAR_GROUP_GAP = 6;
const SHORTCUT_BAR_SNAP_DISTANCE = 32;
const SHORTCUT_BAR_IDS: ShortcutBarId[] = ["shortcutBar1", "shortcutBar2", "shortcutBar3"];
const makeShortcutAssignments = (): Array<PurchasableKind | null> =>
  Array.from({ length: SHORTCUT_SLOT_COUNT }, () => null);
const makeDefaultShortcutBars = (): ShortcutBarsState => ({
  shortcutBar1: {
    visible: true,
    position: { x: 50, y: 78 },
    scale: 1,
    rotation: 0,
    locked: false,
    assignments: makeShortcutAssignments(),
  },
  shortcutBar2: {
    visible: false,
    position: { x: 50, y: 162 },
    scale: 1,
    rotation: 0,
    locked: false,
    assignments: makeShortcutAssignments(),
  },
  shortcutBar3: {
    visible: false,
    position: { x: 50, y: 246 },
    scale: 1,
    rotation: 0,
    locked: false,
    assignments: makeShortcutAssignments(),
  },
});
const normalizeShortcutBarConfig = (
  value: Partial<ShortcutBarConfig> | null | undefined,
  fallback: ShortcutBarConfig,
): ShortcutBarConfig => ({
  visible: typeof value?.visible === "boolean" ? value.visible : fallback.visible,
  position: {
    x: Math.min(98, Math.max(2, Number(value?.position?.x) || fallback.position.x)),
    y: Math.max(68, Number(value?.position?.y) || fallback.position.y),
  },
  scale: Math.min(
    SHORTCUT_BAR_SCALE_MAX,
    Math.max(SHORTCUT_BAR_SCALE_MIN, Number(value?.scale) || fallback.scale),
  ),
  rotation: value?.rotation === 90 ? 90 : 0,
  locked: value?.locked === true,
  assignments: Array.from({ length: SHORTCUT_SLOT_COUNT }, (_, index) => {
    const assignment = value?.assignments?.[index];
    return typeof assignment === "string" && isPurchasableKind(assignment as NodeKind)
      ? assignment as PurchasableKind
      : null;
  }),
});
const normalizeShortcutBars = (
  value?: Partial<ShortcutBarsState> | null,
): ShortcutBarsState => {
  const defaults = makeDefaultShortcutBars();
  return {
    shortcutBar1: normalizeShortcutBarConfig(value?.shortcutBar1, defaults.shortcutBar1),
    shortcutBar2: normalizeShortcutBarConfig(value?.shortcutBar2, defaults.shortcutBar2),
    shortcutBar3: normalizeShortcutBarConfig(value?.shortcutBar3, defaults.shortcutBar3),
  };
};
const normalizeShortcutBarGroups = (
  value: unknown,
  bars: ShortcutBarsState,
): ShortcutBarGroup[] => {
  if (!Array.isArray(value)) return [];
  const groupedBarIds = new Set<ShortcutBarId>();
  const groups: ShortcutBarGroup[] = [];
  value.forEach((candidate) => {
    if (!candidate || typeof candidate !== "object") return;
    const serialized = candidate as Partial<ShortcutBarGroup>;
    const candidateBarIds = new Set<ShortcutBarId>();
    const barIds = Array.isArray(serialized.barIds)
      ? serialized.barIds.filter((barId): barId is ShortcutBarId => {
          const normalizedBarId = barId as ShortcutBarId;
          if (
            !SHORTCUT_BAR_IDS.includes(normalizedBarId) ||
            !bars[normalizedBarId].visible ||
            groupedBarIds.has(normalizedBarId) ||
            candidateBarIds.has(normalizedBarId)
          ) {
            return false;
          }
          candidateBarIds.add(normalizedBarId);
          return true;
        })
      : [];
    if (barIds.length < 2) return;
    barIds.forEach((barId) => groupedBarIds.add(barId));
    groups.push({
      axis: serialized.axis === "vertical" ? "vertical" : "horizontal",
      barIds,
    });
  });
  return groups;
};
const makeEmptySaveSlots = (): Array<SaveGameSlot | null> =>
  Array.from({ length: SAVE_SLOT_COUNT }, () => null);
const makeDefaultSaveNames = () =>
  Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => `Save ${index + 1}`);

const GENERATOR_MAX_POWER = 100;
const POWER_PER_CHARCOAL = 50;
const PRODUCTION_INGREDIENT_CAPACITY = 5;
const RESEARCH_CORE_CAPACITY_PER_TYPE = 5;
const RESEARCH_CYCLE_DURATION = 20000;
const RESEARCH_UNLOCK_COST = 10;
const MAP_GRID_SIZE = 11;
const MAP_HOME_INDEX = Math.floor(MAP_GRID_SIZE / 2);
const MAP_HOME_SECTOR = `${MAP_HOME_INDEX},${MAP_HOME_INDEX}`;
const LEGACY_MAP_GRID_SIZE = 13;
const LEGACY_MAP_HOME_INDEX = Math.floor(LEGACY_MAP_GRID_SIZE / 2);
const MAX_MAP_NODE_VALUE = 10;
const TIER_3_MAP_NODE_UNLOCK_COUNT = 24;
const MAP_NODE_RESEARCH_GROWTH_COMPLETION_CAP = TIER_3_MAP_NODE_UNLOCK_COUNT - 1;
const MAP_NODE_RESEARCH_COST_STEP = 5;
const MAP_NODE_RESOURCE_CAPACITY_PER_TIER = 200;
const MAP_NODE_BLACK_HOLE_START_AREA_RATIO = 0.15;
const MAP_NODE_BLACK_HOLE_MAX_AREA_RATIO = 0.5;
const MAP_NODE_BLACK_HOLE_MAX_SCALING_TIER = 9;
const MAP_NODE_MAX_OBSTRUCTION_AREA_RATIO = 0.6;
const MAP_OBSTRUCTION_MARGIN = 72;
const MYTHRIL_TIER_FOUR_SPAWN_CHANCE = 0.6;
const MYTHRIL_GUARANTEED_MAP_NODE_VALUE = 9;
const BLACK_HOLE_MIN_STONE_REQUIREMENT = 20;
const BLACK_HOLE_MAX_STONE_REQUIREMENT = 20000;
const BLACK_HOLE_TIER_ONE_REQUIREMENT_MULTIPLIER = 0.2;
const BLACK_HOLE_FULL_REQUIREMENT_TIER = 9;
const parseMapSectorKeyWithinSize = (sectorKey: string, gridSize: number): Position | null => {
  const [rawX, rawY, ...rest] = sectorKey.split(",");
  const x = Number(rawX);
  const y = Number(rawY);
  if (
    rest.length > 0 ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    y < 0 ||
    x >= gridSize ||
    y >= gridSize
  ) return null;
  return { x, y };
};
const parseMapSectorKey = (sectorKey: string): Position | null =>
  parseMapSectorKeyWithinSize(sectorKey, MAP_GRID_SIZE);
const getMapNodeValue = (sectorKey: string) => {
  const coordinate = parseMapSectorKey(sectorKey);
  return coordinate
    ? Math.abs(coordinate.x - MAP_HOME_INDEX) + Math.abs(coordinate.y - MAP_HOME_INDEX)
    : 0;
};
const getMapNodeStartingResourceCapacity = (sectorKey: string) => {
  const mapNodeValue = getMapNodeValue(sectorKey);
  if (mapNodeValue >= MAX_MAP_NODE_VALUE) return 0;
  return RESOURCE_CAPACITIES.ironOre + mapNodeValue * MAP_NODE_RESOURCE_CAPACITY_PER_TIER;
};
const getMythrilSpawnChance = (mapNodeValue: number) => {
  if (mapNodeValue < MYTHRIL_MIN_MAP_NODE_VALUE || mapNodeValue >= MAX_MAP_NODE_VALUE) return 0;
  const progression = Math.min(
    1,
    (mapNodeValue - MYTHRIL_MIN_MAP_NODE_VALUE) /
      (MYTHRIL_GUARANTEED_MAP_NODE_VALUE - MYTHRIL_MIN_MAP_NODE_VALUE),
  );
  return MYTHRIL_TIER_FOUR_SPAWN_CHANCE +
    (1 - MYTHRIL_TIER_FOUR_SPAWN_CHANCE) * progression;
};
const isMapNodeInRange = (sectorKey: string) =>
  Boolean(parseMapSectorKey(sectorKey)) && getMapNodeValue(sectorKey) <= MAX_MAP_NODE_VALUE;
const normalizeStoredMapSectorKey = (sectorKey: string, migrateLegacyCoordinates: boolean) => {
  if (!migrateLegacyCoordinates) return isMapNodeInRange(sectorKey) ? sectorKey : null;
  const coordinate = parseMapSectorKeyWithinSize(sectorKey, LEGACY_MAP_GRID_SIZE);
  if (!coordinate) return null;
  const migratedKey = `${coordinate.x - (LEGACY_MAP_HOME_INDEX - MAP_HOME_INDEX)},${
    coordinate.y - (LEGACY_MAP_HOME_INDEX - MAP_HOME_INDEX)
  }`;
  return isMapNodeInRange(migratedKey) ? migratedKey : null;
};
const hasLegacyMapCoordinates = (value: unknown) => {
  if (!value || typeof value !== "object") return false;
  return Object.keys(value).some((sectorKey) => {
    const coordinate = parseMapSectorKeyWithinSize(sectorKey, LEGACY_MAP_GRID_SIZE);
    return Boolean(coordinate && (coordinate.x >= MAP_GRID_SIZE || coordinate.y >= MAP_GRID_SIZE));
  });
};
const getAdjacentMapSectors = (sectorKey: string) => {
  const coordinate = parseMapSectorKey(sectorKey);
  if (!coordinate) return [];
  return [
    { x: coordinate.x, y: coordinate.y - 1 },
    { x: coordinate.x + 1, y: coordinate.y },
    { x: coordinate.x, y: coordinate.y + 1 },
    { x: coordinate.x - 1, y: coordinate.y },
  ]
    .filter(({ x, y }) => x >= 0 && y >= 0 && x < MAP_GRID_SIZE && y < MAP_GRID_SIZE)
    .map(({ x, y }) => `${x},${y}`)
    .filter(isMapNodeInRange);
};
const ROAD_EDGE_SNAP_DISTANCE = 140;
const OPPOSITE_MAP_EDGE: Record<MapEdge, MapEdge> = {
  north: "south",
  east: "west",
  south: "north",
  west: "east",
};
const getAdjacentMapSectorForEdge = (sectorKey: string, edge: MapEdge) => {
  const coordinate = parseMapSectorKey(sectorKey);
  if (!coordinate) return null;
  const offset = edge === "north"
    ? { x: 0, y: -1 }
    : edge === "east"
      ? { x: 1, y: 0 }
      : edge === "south"
        ? { x: 0, y: 1 }
        : { x: -1, y: 0 };
  const adjacent = `${coordinate.x + offset.x},${coordinate.y + offset.y}`;
  return isMapNodeInRange(adjacent) ? adjacent : null;
};
const getRoadEdgePlacement = (
  position: Position,
  size: NodeSize,
  playAreaSize: NodeSize,
  sectorKey: string,
  progress: MapNodeProgressBySector,
) => {
  const candidates: Array<{ edge: MapEdge; distance: number }> = [
    { edge: "west", distance: Math.max(0, position.x) },
    { edge: "east", distance: Math.max(0, playAreaSize.width - position.x - size.width) },
    { edge: "north", distance: Math.max(0, position.y) },
    { edge: "south", distance: Math.max(0, playAreaSize.height - position.y - size.height) },
  ].sort((first, second) => first.distance - second.distance);
  const candidate = candidates.find(({ edge, distance }) => {
    if (distance > ROAD_EDGE_SNAP_DISTANCE) return false;
    const adjacentSector = getAdjacentMapSectorForEdge(sectorKey, edge);
    return Boolean(adjacentSector && isMapNodeUnlocked(progress, adjacentSector));
  });
  if (!candidate) return null;
  const adjacentSector = getAdjacentMapSectorForEdge(sectorKey, candidate.edge);
  if (!adjacentSector) return null;
  const edge = candidate.edge;
  const snappedPosition = {
    x: edge === "west"
      ? 0
      : edge === "east"
        ? playAreaSize.width - size.width
        : Math.max(12, Math.min(playAreaSize.width - size.width - 12, position.x)),
    y: edge === "north"
      ? 0
      : edge === "south"
        ? playAreaSize.height - size.height
        : Math.max(12, Math.min(playAreaSize.height - size.height - 12, position.y)),
  };
  return { edge, adjacentSector, position: snappedPosition };
};
const getAreaExpansionLevel = (research: Partial<Runtime["research"]>) => Math.min(
  MAX_AREA_EXPANSION_LEVEL,
  Math.max(
    research.areaExpansion1Unlocked ? 1 : 0,
    Math.max(0, Math.floor(Number(research.areaExpansionLevel) || 0)),
  ),
);
const getPlayAreaWorldSize = (
  research: Runtime["research"],
  sectorKey = MAP_HOME_SECTOR,
) => {
  const mapNodeValue = getMapNodeValue(sectorKey);
  const distanceMultiplier = 1 +
    (MAP_NODE_MAX_SIZE_MULTIPLIER - 1) *
      (Math.min(MAX_MAP_NODE_VALUE, mapNodeValue) / MAX_MAP_NODE_VALUE);
  const researchMultiplier = 1 +
    getAreaExpansionLevel(research) * AREA_EXPANSION_SIZE_INCREMENT;
  const multiplier = distanceMultiplier * researchMultiplier;
  return {
    width: Math.round(WORLD_SIZE.width * multiplier),
    height: Math.round(WORLD_SIZE.height * multiplier),
  };
};
const getMapNodeBlackHoleAreaRatio = (mapNodeValue: number) => {
  const scalingTier = Math.min(mapNodeValue, MAP_NODE_BLACK_HOLE_MAX_SCALING_TIER);
  const scalingProgress = Math.max(0, scalingTier - 1) /
    (MAP_NODE_BLACK_HOLE_MAX_SCALING_TIER - 1);
  return MAP_NODE_BLACK_HOLE_START_AREA_RATIO +
    (MAP_NODE_BLACK_HOLE_MAX_AREA_RATIO - MAP_NODE_BLACK_HOLE_START_AREA_RATIO) *
      scalingProgress;
};
const getBlackHoleGenerationLayouts = (
  playAreaSize: NodeSize,
  targetBlackHoleArea: number,
) => {
  const usableWidth = playAreaSize.width - MAP_OBSTRUCTION_MARGIN * 2;
  const usableHeight = playAreaSize.height - MAP_OBSTRUCTION_MARGIN * 2;
  const fieldAspectRatio = usableWidth / usableHeight;
  return Array.from({ length: 10 }, (_, index) => {
    const holeCount = index + 1;
    const rows = Math.max(1, Math.round(Math.sqrt(holeCount / fieldAspectRatio)));
    const columns = Math.ceil(holeCount / rows);
    const cellWidth = usableWidth / columns;
    const cellHeight = usableHeight / rows;
    const radius = Math.sqrt(targetBlackHoleArea / (Math.PI * holeCount));
    return { holeCount, rows, columns, cellWidth, cellHeight, radius };
  }).filter((layout) =>
    layout.radius * 2 <= Math.min(layout.cellWidth, layout.cellHeight)
  );
};
const MAX_GENERATED_BLACK_HOLE_RADIUS = Math.max(
  BLACK_HOLE_RADIUS,
  ...Array.from({ length: MAX_MAP_NODE_VALUE }, (_, index) => {
    const mapNodeValue = index + 1;
    const sizeMultiplier = 1 +
      (MAP_NODE_MAX_SIZE_MULTIPLIER - 1) * (mapNodeValue / MAX_MAP_NODE_VALUE);
    const playAreaSize = {
      width: Math.round(WORLD_SIZE.width * sizeMultiplier),
      height: Math.round(WORLD_SIZE.height * sizeMultiplier),
    };
    const targetArea = playAreaSize.width * playAreaSize.height *
      getMapNodeBlackHoleAreaRatio(mapNodeValue);
    return Math.max(
      BLACK_HOLE_RADIUS,
      ...getBlackHoleGenerationLayouts(playAreaSize, targetArea).map((layout) => layout.radius),
    );
  }),
);
const getBlackHoleStoneRequirementMultiplier = (mapNodeValue: number) => {
  if (mapNodeValue <= 0) return 1;
  const tier = Math.min(BLACK_HOLE_FULL_REQUIREMENT_TIER, Math.max(1, mapNodeValue));
  const progression = (tier - 1) / (BLACK_HOLE_FULL_REQUIREMENT_TIER - 1);
  return BLACK_HOLE_TIER_ONE_REQUIREMENT_MULTIPLIER +
    (1 - BLACK_HOLE_TIER_ONE_REQUIREMENT_MULTIPLIER) * progression;
};
const getBlackHoleStoneRequirement = (
  hole: Pick<BlackHoleObstacle, "radius">,
  mapNodeValue = 0,
) => {
  const sizeProgress = Math.max(0, Math.min(
    1,
    (hole.radius - BLACK_HOLE_RADIUS) /
      (MAX_GENERATED_BLACK_HOLE_RADIUS - BLACK_HOLE_RADIUS),
  ));
  const sizeRequirement = Math.round(
    BLACK_HOLE_MIN_STONE_REQUIREMENT +
      (BLACK_HOLE_MAX_STONE_REQUIREMENT - BLACK_HOLE_MIN_STONE_REQUIREMENT) * sizeProgress,
  );
  return Math.max(1, Math.round(
    sizeRequirement * getBlackHoleStoneRequirementMultiplier(mapNodeValue),
  ));
};
const isMapNodeUnlocked = (progress: MapNodeProgressBySector, sectorKey: string) =>
  isMapNodeInRange(sectorKey) && progress[sectorKey]?.explored === true;
const canUnlockMapNode = (progress: MapNodeProgressBySector, sectorKey: string) =>
  Boolean(
    sectorKey !== MAP_HOME_SECTOR &&
    isMapNodeInRange(sectorKey) &&
    !isMapNodeUnlocked(progress, sectorKey) &&
    getAdjacentMapSectors(sectorKey).some((adjacentKey) => isMapNodeUnlocked(progress, adjacentKey)),
  );
const makeInitialMapNodeProgress = (): MapNodeProgressBySector => ({
  [MAP_HOME_SECTOR]: { explored: true, customName: "Home Factory" },
});
const normalizeMapNodeProgress = (
  value: unknown,
  migrateLegacyCoordinates = false,
): MapNodeProgressBySector => {
  const normalized = makeInitialMapNodeProgress();
  if (!value || typeof value !== "object") return normalized;
  Object.entries(value).forEach(([sectorKey, rawProgress]) => {
    const normalizedSectorKey = normalizeStoredMapSectorKey(
      sectorKey,
      migrateLegacyCoordinates,
    );
    if (!normalizedSectorKey) return;
    if (!rawProgress || typeof rawProgress !== "object") return;
    const progress = rawProgress as Partial<MapNodeProgress>;
    const customName = typeof progress.customName === "string"
      ? progress.customName.trim().slice(0, 80)
      : null;
    normalized[normalizedSectorKey] = {
      explored: normalizedSectorKey === MAP_HOME_SECTOR || Boolean(progress.explored),
      customName: customName || (normalizedSectorKey === MAP_HOME_SECTOR ? "Home Factory" : null),
    };
  });
  return normalized;
};
const TREE_PLANTER_CYCLE_DURATION = 1000;
const TREE_PLANTER_POWER_COST = 5;
const INVENTORY_SOURCE_CYCLE_DURATION = 4000;
const EXTRACTOR_1_CYCLE_MULTIPLIER = 0.9;
const EXTRACTOR_2_CYCLE_MULTIPLIER = 0.8;
const getExtractorResearchCycleMultiplier = (research: Runtime["research"]) =>
  research.extractor3Unlocked
    ? EXTRACTOR_2_CYCLE_MULTIPLIER
    : research.extractor2Unlocked
      ? EXTRACTOR_1_CYCLE_MULTIPLIER
      : 1;

type ProcessorRecipe = {
  title: string;
  eyebrow: string;
  color: string;
  icon: typeof Pickaxe;
  inputs: Array<{ id: string; label: string; type: ResourceType; amount: number }>;
  output: { id: string; label: string; type: ResourceType };
  duration: number;
  summary: string;
  activeLabel: string;
};

const PROCESSOR_RECIPES: Record<ProcessorKind, ProcessorRecipe> = {
  kiln: {
    title: "Kiln",
    eyebrow: "PROCESSOR",
    color: RESOURCE_COLORS.CHARCOAL,
    icon: FlameKindling,
    inputs: [{ id: "wood-in", label: "Wood", type: ResourceType.WOOD, amount: 1 }],
    output: { id: "charcoal-out", label: "Charcoal", type: ResourceType.CHARCOAL },
    duration: 3500,
    summary: "1 Wood → 1 Charcoal",
    activeLabel: "Firing charcoal",
  },
  furnace: {
    title: "Furnace",
    eyebrow: "SMELTER",
    color: RESOURCE_COLORS.IRON_PLATE,
    icon: Anvil,
    inputs: [
      { id: "metal-in", label: "Metal", type: ResourceType.METAL, amount: 1 },
      { id: "charcoal-in", label: "Charcoal", type: ResourceType.CHARCOAL, amount: 1 },
    ],
    output: { id: "plate-out", label: "Plate", type: ResourceType.PLATE },
    duration: 6000,
    summary: "1 Metal + 1 Charcoal",
    activeLabel: "Smelting plate",
  },
  automataCoreAssembler: {
    title: "Automata Core Assembler",
    eyebrow: "CORE ASSEMBLY",
    color: RESOURCE_COLORS.AUTOMATA_CORE,
    icon: Atom,
    inputs: [
      { id: "core-circuit-in", label: "Circuit A", type: ResourceType.CIRCUIT_A, amount: 1 },
      { id: "core-plate-in", label: "Brick", type: ResourceType.BRICK, amount: 1 },
    ],
    output: { id: "automata-core-out", label: "Automata Core", type: ResourceType.AUTOMATA_CORE },
    duration: 8500,
    summary: "1 Circuit A + 1 Brick → 1 Automata Core",
    activeLabel: "Synchronizing core",
  },
  refiner: {
    title: "Refiner",
    eyebrow: "CONFIGURABLE",
    color: "#b99362",
    icon: Cog,
    inputs: [
      { id: "refiner-in", label: "Choose recipe", type: ResourceType.ANY, amount: 1 },
    ],
    output: { id: "refiner-out", label: "Choose recipe", type: ResourceType.ANY },
    duration: 0,
    summary: "Choose a recipe from the node icon",
    activeLabel: "Awaiting recipe",
  },
  assembler: {
    title: "Assembler",
    eyebrow: "CONFIGURABLE",
    color: "#8fa3b8",
    icon: Hammer,
    inputs: [
      { id: "assembler-a-in", label: "Choose recipe", type: ResourceType.ANY, amount: 1 },
      { id: "assembler-b-in", label: "Choose recipe", type: ResourceType.ANY, amount: 1 },
    ],
    output: { id: "assembler-out", label: "Choose recipe", type: ResourceType.ANY },
    duration: 0,
    summary: "Choose a recipe from the node icon",
    activeLabel: "Awaiting recipe",
  },
};

const REFINER_RECIPES: Record<RefinerRecipeId, ProcessorRecipe> = {
  gear: {
    title: "Gear",
    eyebrow: "REFINER RECIPE",
    color: RESOURCE_COLORS.IRON_GEAR,
    icon: Cog,
    inputs: [
      { id: "refiner-in", label: "Metal Plate", type: ResourceType.PLATE, amount: 1 },
    ],
    output: { id: "refiner-out", label: "Gear", type: ResourceType.GEAR },
    duration: 3000,
    summary: "1 Metal Plate → 1 Gear",
    activeLabel: "Refining gear",
  },
  wire: {
    title: "Wire",
    eyebrow: "REFINER RECIPE",
    color: RESOURCE_COLORS.WIRE,
    icon: Cable,
    inputs: [
      { id: "refiner-in", label: "Metal Plate", type: ResourceType.PLATE, amount: 1 },
    ],
    output: { id: "refiner-out", label: "Wire", type: ResourceType.WIRE },
    duration: 3000,
    summary: "1 Metal Plate → 1 Wire",
    activeLabel: "Refining wire",
  },
  brick: {
    title: "Brick",
    eyebrow: "REFINER RECIPE",
    color: RESOURCE_COLORS.BRICK,
    icon: BrickWall,
    inputs: [
      { id: "refiner-in", label: "Stone", type: ResourceType.STONE, amount: 1 },
    ],
    output: { id: "refiner-out", label: "Brick", type: ResourceType.BRICK },
    duration: 4000,
    summary: "1 Stone → 1 Brick",
    activeLabel: "Firing brick",
  },
};

const ASSEMBLER_RECIPES: Record<AssemblerRecipeId, ProcessorRecipe> = {
  motor: {
    title: "Motor",
    eyebrow: "ASSEMBLER RECIPE",
    color: RESOURCE_COLORS.MOTOR,
    icon: Factory,
    inputs: [
      { id: "assembler-a-in", label: "Iron Gear", type: ResourceType.IRON_GEAR, amount: 1 },
      { id: "assembler-b-in", label: "Copper Wire", type: ResourceType.COPPER_WIRE, amount: 1 },
    ],
    output: { id: "assembler-out", label: "Motor", type: ResourceType.MOTOR },
    duration: 6500,
    summary: "1 Iron Gear + 1 Copper Wire → 1 Motor",
    activeLabel: "Assembling motor",
  },
  circuitA: {
    title: "Circuit A",
    eyebrow: "ASSEMBLER RECIPE",
    color: RESOURCE_COLORS.CIRCUIT_A,
    icon: CircuitBoard,
    inputs: [
      { id: "assembler-a-in", label: "Copper Wire", type: ResourceType.COPPER_WIRE, amount: 1 },
      { id: "assembler-b-in", label: "Iron Plate", type: ResourceType.IRON_PLATE, amount: 1 },
    ],
    output: { id: "assembler-out", label: "Circuit A", type: ResourceType.CIRCUIT_A },
    duration: 5000,
    summary: "1 Copper Wire + 1 Iron Plate → 1 Circuit A",
    activeLabel: "Etching Circuit A",
  },
  basicCore: {
    title: "Basic Core",
    eyebrow: "ASSEMBLER RECIPE",
    color: RESOURCE_COLORS.BASIC_CORE,
    icon: Atom,
    inputs: [
      { id: "assembler-a-in", label: "Copper Plate", type: ResourceType.COPPER_PLATE, amount: 1 },
      { id: "assembler-b-in", label: "Iron Wire", type: ResourceType.IRON_WIRE, amount: 1 },
    ],
    output: { id: "assembler-out", label: "Basic Core", type: ResourceType.BASIC_CORE },
    duration: 6000,
    summary: "1 Copper Plate + 1 Iron Wire → 1 Basic Core",
    activeLabel: "Assembling basic core",
  },
  automataCore: {
    ...PROCESSOR_RECIPES.automataCoreAssembler,
    title: "Automata Core",
    eyebrow: "ASSEMBLER RECIPE",
    inputs: [
      { id: "assembler-a-in", label: "Circuit A", type: ResourceType.CIRCUIT_A, amount: 1 },
      { id: "assembler-b-in", label: "Brick", type: ResourceType.BRICK, amount: 1 },
    ],
    output: { id: "assembler-out", label: "Automata Core", type: ResourceType.AUTOMATA_CORE },
    summary: "1 Circuit A + 1 Brick → 1 Automata Core",
  },
};

const ASSEMBLER_RECIPE_OPTIONS: Array<{ id: AssemblerRecipeId; label: string }> = [
  { id: "motor", label: "Motor" },
  { id: "circuitA", label: "Circuit A" },
  { id: "basicCore", label: "Basic Core" },
  { id: "automataCore", label: "Automata Core" },
];

const REFINER_RECIPE_OPTIONS: Array<{ id: RefinerRecipeId; label: string }> = [
  { id: "gear", label: "Gear" },
  { id: "wire", label: "Wire" },
  { id: "brick", label: "Brick" },
];

type RecipeGuideEntry = {
  id: string;
  title: string;
  node: string;
  icon: NodeSpec["icon"];
  color: string;
  inputs: Array<{ type: ResourceType; label: string; amount: string }>;
  output: { type: ResourceType; label: string; amount: string };
  duration?: number;
  summary: string;
};

const makeProcessorRecipeGuideEntry = (
  id: string,
  node: string,
  recipe: ProcessorRecipe,
): RecipeGuideEntry => ({
  id,
  title: recipe.title,
  node,
  icon: recipe.icon,
  color: recipe.color,
  inputs: recipe.inputs.map((input) => ({
    type: input.type,
    label: input.label,
    amount: `${input.amount}×`,
  })),
  output: {
    type: recipe.output.type,
    label: recipe.output.label,
    amount: "1×",
  },
  duration: recipe.duration,
  summary: recipe.summary,
});

const makeConcreteMaterialRecipeGuideEntry = (
  id: string,
  node: string,
  recipe: ProcessorRecipe,
  materialType: ResourceType,
  outputType: ResourceType,
): RecipeGuideEntry => {
  const materialLabel = formatResourceType(materialType);
  const outputLabel = formatResourceType(outputType);
  const inputs = recipe.inputs.map((input, index) => ({
    type: index === 0 ? materialType : input.type,
    label: index === 0 ? materialLabel : input.label,
    amount: `${input.amount}×`,
  }));
  return {
    id,
    title: outputLabel,
    node,
    icon: recipe.icon,
    color: RESOURCE_COLORS[outputType],
    inputs,
    output: { type: outputType, label: outputLabel, amount: "1×" },
    duration: recipe.duration,
    summary: `${inputs.map((input) => `${input.amount.replace("×", "")} ${input.label}`).join(" + ")} → 1 ${outputLabel}`,
  };
};

const RECIPE_GUIDE_ENTRIES: RecipeGuideEntry[] = [
  ...Object.entries(EXTRACTOR_RECIPES).flatMap(([inputType, recipe]) => recipe ? [{
    id: `extractor-${inputType.toLowerCase()}`,
    title: recipe.label,
    node: "Extractor",
    icon: Pickaxe,
    color: RESOURCE_COLORS[recipe.product],
    inputs: [{
      type: inputType as ResourceType,
      label: formatResourceType(inputType as ResourceType),
      amount: "1×",
    }],
    output: { type: recipe.product, label: recipe.label, amount: "1×" },
    duration: recipe.duration,
    summary: `1 ${formatResourceType(inputType as ResourceType)} → 1 ${recipe.label}`,
  }] : []),
  makeProcessorRecipeGuideEntry("kiln-charcoal", "Kiln", PROCESSOR_RECIPES.kiln),
  makeConcreteMaterialRecipeGuideEntry(
    "furnace-iron-plate",
    "Furnace",
    PROCESSOR_RECIPES.furnace,
    ResourceType.IRON,
    ResourceType.IRON_PLATE,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "furnace-copper-plate",
    "Furnace",
    PROCESSOR_RECIPES.furnace,
    ResourceType.COPPER,
    ResourceType.COPPER_PLATE,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "furnace-mythril-plate",
    "Furnace",
    PROCESSOR_RECIPES.furnace,
    ResourceType.MYTHRIL,
    ResourceType.MYTHRIL_PLATE,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "refiner-iron-gear",
    "Refiner",
    REFINER_RECIPES.gear,
    ResourceType.IRON_PLATE,
    ResourceType.IRON_GEAR,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "refiner-copper-gear",
    "Refiner",
    REFINER_RECIPES.gear,
    ResourceType.COPPER_PLATE,
    ResourceType.COPPER_GEAR,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "refiner-mythril-gear",
    "Refiner",
    REFINER_RECIPES.gear,
    ResourceType.MYTHRIL_PLATE,
    ResourceType.MYTHRIL_GEAR,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "refiner-iron-wire",
    "Refiner",
    REFINER_RECIPES.wire,
    ResourceType.IRON_PLATE,
    ResourceType.IRON_WIRE,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "refiner-copper-wire",
    "Refiner",
    REFINER_RECIPES.wire,
    ResourceType.COPPER_PLATE,
    ResourceType.COPPER_WIRE,
  ),
  makeConcreteMaterialRecipeGuideEntry(
    "refiner-mythril-wire",
    "Refiner",
    REFINER_RECIPES.wire,
    ResourceType.MYTHRIL_PLATE,
    ResourceType.MYTHRIL_WIRE,
  ),
  makeProcessorRecipeGuideEntry("refiner-brick", "Refiner", REFINER_RECIPES.brick),
  ...Object.entries(ASSEMBLER_RECIPES).map(([id, recipe]) =>
    makeProcessorRecipeGuideEntry(`assembler-${id}`, "Assembler", recipe),
  ),
  {
    id: "generator-power",
    title: "Power",
    node: "Charcoal Generator",
    icon: Zap,
    color: RESOURCE_COLORS.POWER,
    inputs: [{ type: ResourceType.CHARCOAL, label: "Charcoal", amount: "1×" }],
    output: { type: ResourceType.POWER, label: "Power", amount: `${POWER_PER_CHARCOAL}W` },
    summary: `1 Charcoal → ${POWER_PER_CHARCOAL}W Power`,
  },
  ...([ResourceType.BASIC_CORE, ResourceType.AUTOMATA_CORE] as const).map((coreType) => ({
    id: `research-center-${coreType.toLowerCase()}`,
    title: `${formatResourceType(coreType)} Research`,
    node: "Research Center",
    icon: FlaskConical,
    color: RESOURCE_COLORS[coreType],
    inputs: [{ type: coreType, label: formatResourceType(coreType), amount: "1×" }],
    output: { type: coreType, label: "Research Progress", amount: "1×" },
    duration: RESEARCH_CYCLE_DURATION,
    summary: `1 ${formatResourceType(coreType)} → 1 Research Progress`,
  })),
  {
    id: "tree-planter-forest",
    title: "Forest Capacity",
    node: "Tree Planter",
    icon: Sprout,
    color: RESOURCE_COLORS.FOREST_GROWTH,
    inputs: [{ type: ResourceType.POWER, label: "Power", amount: `${TREE_PLANTER_POWER_COST}W` }],
    output: { type: ResourceType.FOREST_GROWTH, label: "Forest Capacity", amount: "+1" },
    duration: TREE_PLANTER_CYCLE_DURATION,
    summary: `${TREE_PLANTER_POWER_COST}W Power → +1 Forest Capacity`,
  },
  {
    id: "mining-drill-deposit",
    title: "Selected Ore Deposit",
    node: "Mining Drill",
    icon: MiningDrillIcon,
    color: "#d6a44f",
    inputs: [{ type: ResourceType.MOTOR, label: "Motor", amount: String(MINING_DRILL_ITERATIONS) }],
    output: { type: ResourceType.RESOURCE, label: "Selected Ore Deposit", amount: `${MINED_DEPOSIT_CAPACITY.toLocaleString()}-unit` },
    summary: `${MINING_DRILL_ITERATIONS} Motors → ${MINED_DEPOSIT_CAPACITY.toLocaleString()}-unit deposit`,
  },
];

const RECIPE_GUIDE_GROUPS = Array.from(
  RECIPE_GUIDE_ENTRIES.reduce((groups, recipe) => {
    const existing = groups.get(recipe.node);
    if (existing) existing.push(recipe);
    else groups.set(recipe.node, [recipe]);
    return groups;
  }, new Map<string, RecipeGuideEntry[]>()),
  ([node, recipes]) => ({ node, recipes }),
);

const getRecipeIngredientTotals = (recipe: ProcessorRecipe) => Array.from(
  recipe.inputs.reduce((ingredients, input) => {
    const existing = ingredients.get(input.type);
    ingredients.set(input.type, {
      type: input.type,
      label: formatResourceType(input.type),
      amount: (existing?.amount ?? 0) + input.amount,
    });
    return ingredients;
  }, new Map<ResourceType, { type: ResourceType; label: string; amount: number }>()).values(),
);

const isAssemblerRecipeId = (value: unknown): value is AssemblerRecipeId =>
  value === "motor" ||
  value === "circuitA" ||
  value === "basicCore" ||
  value === "automataCore";

const isRefinerRecipeId = (value: unknown): value is RefinerRecipeId =>
  value === "gear" || value === "wire" || value === "brick";

const getProcessorRecipe = (
  kind: ProcessorKind,
  processor?: Runtime["processors"][NodeId] | null,
) => kind === "assembler"
  ? processor?.assemblerRecipe
    ? ASSEMBLER_RECIPES[processor.assemblerRecipe]
    : null
  : kind === "refiner"
    ? processor?.refinerRecipe
      ? REFINER_RECIPES[processor.refinerRecipe]
      : null
  : PROCESSOR_RECIPES[kind];

const isProcessorKind = (kind: NodeKind): kind is ProcessorKind =>
  kind === "furnace" ||
  kind === "kiln" ||
  kind === "automataCoreAssembler" ||
  kind === "refiner" ||
  kind === "assembler";

const isPurchasableKind = (kind: NodeKind): kind is PurchasableKind =>
  isExtractorKind(kind) ||
  kind === "generator" ||
  kind === "powerSplitter" ||
  kind === "researchFoundry" ||
  kind === "treePlanter" ||
  kind === "miningDrill" ||
  kind === "splitter" ||
  kind === "merger" ||
  kind === "joint" ||
  kind === "road" ||
  kind === "inventorySource" ||
  kind === "filter" ||
  kind === "storage" ||
  kind === "woodenChest" ||
  isProcessorKind(kind);

const isNodeKind = (value: unknown): value is NodeKind =>
  typeof value === "string" && (
    value === "ironOre" ||
    value === "copperOre" ||
    value === "mythrilOre" ||
    value === "stone" ||
    value === "forest" ||
    isPurchasableKind(value as NodeKind)
  );

const isRetiredProductionNodeKind = (
  value: unknown,
): value is RetiredProductionNodeKind =>
  value === "gearPress" ||
  value === "wireMill" ||
  value === "motorFactory" ||
  value === "circuitAConduit";

const getNodeIcon = (kind: NodeKind): NodeSpec["icon"] => {
  if (kind === "ironOre" || kind === "copperOre" || kind === "mythrilOre") return Gem;
  if (kind === "stone") return Mountain;
  if (kind === "forest") return TreePine;
  if (kind === "extractor") return Pickaxe;
  if (kind === "miningDrill") return MiningDrillIcon;
  if (kind === "generator" || kind === "powerSplitter") return Zap;
  if (kind === "researchFoundry") return FlaskConical;
  if (kind === "treePlanter") return Sprout;
  if (kind === "splitter") return Split;
  if (kind === "merger") return GitMerge;
  if (kind === "joint") return Cable;
  if (kind === "road") return RoadIcon;
  if (kind === "filter") return FilterIcon;
  if (kind === "woodenChest") return Archive;
  if (kind === "inventorySource" || kind === "storage") return PackageOpen;
  if (kind === "assembler") return Hammer;
  if (kind === "refiner") return Cog;
  return PROCESSOR_RECIPES[kind].icon;
};

const serializeNode = ({ id, kind, title, eyebrow, color, inputs, outputs }: NodeSpec): SerializedNode => ({
  id,
  kind,
  title,
  eyebrow,
  color,
  inputs,
  outputs,
});
const hydrateNode = (node: SerializedNode): NodeSpec => ({
  ...node,
  title: node.kind === "researchFoundry"
    ? "Research Center"
    : node.kind === "ironOre"
      ? "Iron"
    : node.kind === "copperOre"
      ? "Copper"
      : node.kind === "mythrilOre"
        ? "Mythril"
      : node.title,
  icon: getNodeIcon(node.kind),
  inputs: node.kind === "researchFoundry"
    ? [{ id: "research-core-in", label: "All Cores", type: ResourceType.CORE, direction: "input" }]
    : node.kind === "miningDrill"
    ? [{ id: "motor-in", label: "Motor", type: ResourceType.MOTOR, direction: "input" }]
    : isProcessorKind(node.kind)
      ? node.inputs.filter((port) => port.id !== "power-in")
      : node.inputs,
  outputs: node.kind === "ironOre"
    ? [{ id: "ore-out", label: "Iron", type: ResourceType.IRON, direction: "output" }]
    : node.kind === "copperOre"
      ? [{ id: "copper-ore-out", label: "Copper", type: ResourceType.COPPER, direction: "output" }]
    : node.kind === "mythrilOre"
      ? [{ id: "mythril-ore-out", label: "Mythril", type: ResourceType.MYTHRIL, direction: "output" }]
  : node.kind === "stone"
    ? [{ id: "stone-out", label: "Stone", type: ResourceType.STONE, direction: "output" }]
    : node.kind === "forest"
      ? [{ id: "forest-out", label: "Wood", type: ResourceType.WOOD, direction: "output" }]
  : node.kind === "woodenChest"
    ? [{
        id: "chest-out",
        label: PRODUCTION_PORT_LABEL,
        type: ResourceType.ANY,
        direction: "output",
      }]
    : node.outputs,
});

type TierTwoObstruction = "lake" | "blackHoles";

const makeRemoteMapFactoryState = (
  globalRuntime: Runtime,
  zoom: number,
  sectorKey: string,
  tierTwoObstruction?: TierTwoObstruction,
): MapFactoryState => {
  const runtime = makeRuntime();
  runtime.extractors = {};
  runtime.processors = {};
  runtime.generators = {};
  runtime.researchFoundries = {};
  runtime.treePlanters = {};
  runtime.miningDrills = {};
  runtime.minedDeposits = {};
  runtime.splitters = {};
  runtime.joints = {};
  runtime.roads = {};
  runtime.inventorySources = {};
  runtime.filters = {};
  runtime.woodenChests = {};
  runtime.storages = {};
  runtime.pausedOutputs = {};
  runtime.construction = {};
  runtime.research = {
    ...globalRuntime.research,
    progress: { ...globalRuntime.research.progress },
  };
  runtime.mapPoints = globalRuntime.mapPoints;
  runtime.produced = { ...globalRuntime.produced };
  runtime.extractorProduced = { ...globalRuntime.extractorProduced };
  const mapNodeValue = getMapNodeValue(sectorKey);
  const resourceCapacity = getMapNodeStartingResourceCapacity(sectorKey);
  runtime.ironOre = { remaining: resourceCapacity, capacity: resourceCapacity };
  runtime.copperOre = { remaining: resourceCapacity, capacity: resourceCapacity };
  runtime.stone = { remaining: resourceCapacity, capacity: resourceCapacity };
  runtime.forest = { remaining: resourceCapacity, capacity: resourceCapacity, regenerationElapsed: 0 };
  const isEmptyTierTen = mapNodeValue === MAX_MAP_NODE_VALUE;
  if (isEmptyTierTen) {
    runtime.ironOre.remaining = 0;
    runtime.copperOre.remaining = 0;
    runtime.stone.remaining = 0;
    runtime.forest.remaining = 0;
  }
  const hasMythrilDeposit = !isEmptyTierTen &&
    Math.random() < getMythrilSpawnChance(mapNodeValue);
  const resourceNodes = isEmptyTierTen
    ? []
    : [
        ...INITIAL_NODES.filter((node) => isResourceNodeKind(node.kind)),
        ...(hasMythrilDeposit ? [MYTHRIL_RESOURCE_NODE] : []),
      ];
  if (hasMythrilDeposit) {
    const mythrilCapacity = resourceCapacity;
    runtime.minedDeposits[MYTHRIL_RESOURCE_NODE.id] = {
      type: ResourceType.MYTHRIL,
      remaining: mythrilCapacity,
      capacity: mythrilCapacity,
    };
  }
  const playAreaSize = getPlayAreaWorldSize(globalRuntime.research, sectorKey);
  const mapMargin = MAP_OBSTRUCTION_MARGIN;
  const holes: BlackHoleObstacle[] = [];
  const lakes: LakeObstacle[] = [];

  if (!isEmptyTierTen && mapNodeValue === 2 && tierTwoObstruction === "lake") {
    const lakeAreaRatio = 0.15 + Math.random() * 0.1;
    const lake = createLakeObstacle(
      playAreaSize,
      lakeAreaRatio,
      mapMargin,
      `lake-${sectorKey.replace(",", "-")}`,
    );
    lakes.push(lake);
  } else if (!isEmptyTierTen && mapNodeValue > 0) {
    const playArea = playAreaSize.width * playAreaSize.height;
    const targetBlackHoleAreaRatio = getMapNodeBlackHoleAreaRatio(mapNodeValue);
    const otherObstructionArea = lakes.reduce(
      (total, lake) => total + getLakeObstacleArea(lake),
      0,
    );
    const targetBlackHoleArea = Math.max(
      0,
      Math.min(
        playArea * targetBlackHoleAreaRatio,
        playArea * MAP_NODE_MAX_OBSTRUCTION_AREA_RATIO - otherObstructionArea,
      ),
    );

    if (targetBlackHoleArea > 0) {
      const fittingLayouts = getBlackHoleGenerationLayouts(playAreaSize, targetBlackHoleArea);
      const layout = fittingLayouts[Math.floor(Math.random() * fittingLayouts.length)] ??
        fittingLayouts[fittingLayouts.length - 1];

      if (layout) {
        const { holeCount, rows, columns, cellWidth, cellHeight, radius } = layout;
        const cells = Array.from({ length: rows * columns }, (_, index) => ({
          column: index % columns,
          row: Math.floor(index / columns),
        })).sort(() => Math.random() - 0.5).slice(0, holeCount);
        const minimumCenterDistance = radius * BLACK_HOLE_GENERATION_CENTER_SPACING;
        const maximumCellJitterX = Math.max(0, Math.min(
          cellWidth / 2 - radius,
          (cellWidth - minimumCenterDistance) / 2,
        ));
        const maximumCellJitterY = Math.max(0, Math.min(
          cellHeight / 2 - radius,
          (cellHeight - minimumCenterDistance) / 2,
        ));
        const centers = cells.map((cell) => ({
          x: mapMargin + cellWidth * (cell.column + 0.5) +
            (Math.random() * 2 - 1) * maximumCellJitterX,
          y: mapMargin + cellHeight * (cell.row + 0.5) +
            (Math.random() * 2 - 1) * maximumCellJitterY,
        }));
        const minimumX = mapMargin + radius;
        const maximumX = playAreaSize.width - mapMargin - radius;
        const minimumY = mapMargin + radius;
        const maximumY = playAreaSize.height - mapMargin - radius;

        for (let pass = 0; pass < BLACK_HOLE_GENERATION_RANDOMIZATION_PASSES; pass += 1) {
          const randomizedIndexes = centers.map((_, index) => index).sort(() => Math.random() - 0.5);
          randomizedIndexes.forEach((centerIndex) => {
            for (
              let attempt = 0;
              attempt < BLACK_HOLE_GENERATION_RANDOMIZATION_ATTEMPTS;
              attempt += 1
            ) {
              const candidate = {
                x: minimumX + Math.random() * Math.max(0, maximumX - minimumX),
                y: minimumY + Math.random() * Math.max(0, maximumY - minimumY),
              };
              const fits = centers.every((center, otherIndex) =>
                otherIndex === centerIndex ||
                Math.hypot(candidate.x - center.x, candidate.y - center.y) >= minimumCenterDistance
              );
              if (!fits) continue;
              centers[centerIndex] = candidate;
              break;
            }
          });
        }

        centers.forEach((center, index) => {
          holes.push(createBlackHoleObstacle(
            center,
            radius,
            `black-hole-${sectorKey.replace(",", "-")}-${index + 1}`,
          ));
        });
      }
    }
  }
  runtime.blackHoles = Object.fromEntries(holes.map((hole) => [hole.id, hole]));
  runtime.lakes = Object.fromEntries(lakes.map((lake) => [lake.id, lake]));

  const resourcePositions: Positions = (() => {
    const positions: Positions = {};
    const occupied: Array<Position & NodeSize> = [];
    resourceNodes.forEach((node, index) => {
      let position: Position | null = null;
      for (let attempt = 0; attempt < 300 && !position; attempt += 1) {
        const candidate = {
          x: mapMargin + Math.random() * Math.max(
            0,
            playAreaSize.width - RESOURCE_NODE_SIZE.width - mapMargin * 2,
          ),
          y: mapMargin + Math.random() * Math.max(
            0,
            playAreaSize.height - RESOURCE_NODE_SIZE.height - mapMargin * 2,
          ),
        };
        const candidateRect = { ...candidate, ...RESOURCE_NODE_SIZE };
        const intersectsObstruction = holes.some((hole) =>
          rectangleIntersectsBlackHole(candidateRect, hole, NODE_CLEARANCE * 2)
        ) || lakes.some((lake) =>
          rectangleIntersectsLake(candidateRect, lake, NODE_CLEARANCE * 2)
        );
        if (
          !intersectsObstruction &&
          !occupied.some((rectangle) => rectanglesOverlap(candidateRect, rectangle))
        ) {
          position = candidate;
          occupied.push(candidateRect);
        }
      }
      const fallback = position ?? {
        x: mapMargin + (index % 2) * (RESOURCE_NODE_SIZE.width + NODE_CLEARANCE * 3),
        y: mapMargin + Math.floor(index / 2) * (RESOURCE_NODE_SIZE.height + NODE_CLEARANCE * 3),
      };
      positions[node.id] = fallback;
    });
    return positions;
  })();

  return {
    nodes: resourceNodes.map(serializeNode),
    positions: resourcePositions,
    connections: [],
    runtime,
    controlGroups: [],
    buildSequence: makeBuildSequence(),
    zoom,
    viewport: { scrollLeft: 0, scrollTop: 0 },
    lastSimulatedAt: Date.now(),
    producedBaseline: { ...globalRuntime.produced },
    extractorProducedBaseline: { ...globalRuntime.extractorProduced },
  };
};

const redistributeUnknownMapFactoryForExpansion = (
  factory: MapFactoryState,
  sectorKey: string,
  research: Runtime["research"],
): MapFactoryState => {
  const playAreaSize = getPlayAreaWorldSize(research, sectorKey);
  const randomCoordinate = (minimum: number, maximum: number) =>
    minimum + Math.random() * Math.max(0, maximum - minimum);
  const lakes: LakeObstacle[] = [];

  Object.values(factory.runtime.lakes ?? {}).forEach((lake) => {
    const minimumX = MAP_OBSTRUCTION_MARGIN + lake.width / 2;
    const maximumX = playAreaSize.width - MAP_OBSTRUCTION_MARGIN - lake.width / 2;
    const minimumY = MAP_OBSTRUCTION_MARGIN + lake.height / 2;
    const maximumY = playAreaSize.height - MAP_OBSTRUCTION_MARGIN - lake.height / 2;
    let relocated: LakeObstacle | null = null;

    for (let attempt = 0; attempt < 300 && !relocated; attempt += 1) {
      const candidate = {
        ...lake,
        x: randomCoordinate(minimumX, Math.max(minimumX, maximumX)),
        y: randomCoordinate(minimumY, Math.max(minimumY, maximumY)),
      };
      const candidateBounds = {
        x: candidate.x - candidate.width / 2,
        y: candidate.y - candidate.height / 2,
        width: candidate.width,
        height: candidate.height,
      };
      const overlapsLake = lakes.some((placedLake) => rectanglesOverlap(
        candidateBounds,
        {
          x: placedLake.x - placedLake.width / 2,
          y: placedLake.y - placedLake.height / 2,
          width: placedLake.width,
          height: placedLake.height,
        },
        NODE_CLEARANCE,
      ));
      if (!overlapsLake) relocated = candidate;
    }

    lakes.push(relocated ?? {
      ...lake,
      x: Math.max(minimumX, Math.min(maximumX, lake.x)),
      y: Math.max(minimumY, Math.min(maximumY, lake.y)),
    });
  });

  const holes: BlackHoleObstacle[] = [];
  Object.values(factory.runtime.blackHoles ?? {}).forEach((hole) => {
    const minimumX = MAP_OBSTRUCTION_MARGIN + hole.radius;
    const maximumX = playAreaSize.width - MAP_OBSTRUCTION_MARGIN - hole.radius;
    const minimumY = MAP_OBSTRUCTION_MARGIN + hole.radius;
    const maximumY = playAreaSize.height - MAP_OBSTRUCTION_MARGIN - hole.radius;
    let relocated: BlackHoleObstacle | null = null;

    for (let attempt = 0; attempt < 600 && !relocated; attempt += 1) {
      const candidate = {
        ...hole,
        x: randomCoordinate(minimumX, Math.max(minimumX, maximumX)),
        y: randomCoordinate(minimumY, Math.max(minimumY, maximumY)),
      };
      const candidateBounds = {
        x: candidate.x - candidate.radius,
        y: candidate.y - candidate.radius,
        width: candidate.radius * 2,
        height: candidate.radius * 2,
      };
      const overlapsLake = lakes.some((lake) =>
        rectangleIntersectsLake(candidateBounds, lake, 0)
      );
      const overlapsHole = holes.some((placedHole) =>
        Math.hypot(candidate.x - placedHole.x, candidate.y - placedHole.y) <
          (candidate.radius + placedHole.radius) * (BLACK_HOLE_GENERATION_CENTER_SPACING / 2)
      );
      if (!overlapsLake && !overlapsHole) relocated = candidate;
    }

    holes.push(relocated ?? {
      ...hole,
      x: Math.max(minimumX, Math.min(maximumX, hole.x)),
      y: Math.max(minimumY, Math.min(maximumY, hole.y)),
    });
  });

  const relocatedPositions: Positions = {};
  const occupiedNodeBounds: Array<Position & NodeSize> = [];
  const factoryNodes = getMapFactoryNodes(factory);
  const isAvailable = (candidate: Position, size: NodeSize) => {
    const candidateBounds = { ...candidate, ...size };
    return !holes.some((hole) =>
      rectangleIntersectsBlackHole(candidateBounds, hole, NODE_CLEARANCE * 2)
    ) && !lakes.some((lake) =>
      rectangleIntersectsLake(candidateBounds, lake, NODE_CLEARANCE * 2)
    ) && !occupiedNodeBounds.some((bounds) => rectanglesOverlap(candidateBounds, bounds));
  };

  factoryNodes.forEach((node) => {
    const size = getEstimatedNodeSize(node);
    const minimumX = MAP_OBSTRUCTION_MARGIN;
    const maximumX = Math.max(minimumX, playAreaSize.width - MAP_OBSTRUCTION_MARGIN - size.width);
    const minimumY = MAP_OBSTRUCTION_MARGIN;
    const maximumY = Math.max(minimumY, playAreaSize.height - MAP_OBSTRUCTION_MARGIN - size.height);
    let relocated: Position | null = null;

    for (let attempt = 0; attempt < 800 && !relocated; attempt += 1) {
      const candidate = {
        x: randomCoordinate(minimumX, maximumX),
        y: randomCoordinate(minimumY, maximumY),
      };
      if (isAvailable(candidate, size)) relocated = candidate;
    }

    if (!relocated) {
      const horizontalStep = Math.max(NODE_CLEARANCE, Math.min(80, size.width / 3));
      const verticalStep = Math.max(NODE_CLEARANCE, Math.min(80, size.height / 3));
      for (let y = minimumY; y <= maximumY && !relocated; y += verticalStep) {
        for (let x = minimumX; x <= maximumX && !relocated; x += horizontalStep) {
          const candidate = { x, y };
          if (isAvailable(candidate, size)) relocated = candidate;
        }
      }
    }

    const previous = factory.positions[node.id] ?? { x: minimumX, y: minimumY };
    const position = relocated ?? {
      x: Math.max(minimumX, Math.min(maximumX, previous.x)),
      y: Math.max(minimumY, Math.min(maximumY, previous.y)),
    };
    relocatedPositions[node.id] = position;
    occupiedNodeBounds.push({ ...position, ...size });
  });

  return {
    ...factory,
    positions: relocatedPositions,
    runtime: {
      ...factory.runtime,
      blackHoles: Object.fromEntries(holes.map((hole) => [hole.id, hole])),
      lakes: Object.fromEntries(lakes.map((lake) => [lake.id, lake])),
    },
    viewport: { scrollLeft: 0, scrollTop: 0 },
  };
};

const generateMapFactoriesAtGameStart = (
  globalRuntime: Runtime,
  zoom: number,
): MapFactoriesBySector => {
  const sectorKeys = Array.from({ length: MAP_GRID_SIZE * MAP_GRID_SIZE }, (_, index) => {
    const x = index % MAP_GRID_SIZE;
    const y = Math.floor(index / MAP_GRID_SIZE);
    return `${x},${y}`;
  }).filter((sectorKey) => sectorKey !== MAP_HOME_SECTOR && isMapNodeInRange(sectorKey));
  const tierTwoSectors = sectorKeys
    .filter((sectorKey) => getMapNodeValue(sectorKey) === 2)
    .sort(() => Math.random() - 0.5);
  const minimumLakeCount = Math.ceil(tierTwoSectors.length * 0.6);
  const lakeCount = tierTwoSectors.length > minimumLakeCount
    ? minimumLakeCount + Math.floor(Math.random() * (tierTwoSectors.length - minimumLakeCount))
    : minimumLakeCount;
  const lakeSectors = new Set(tierTwoSectors.slice(0, lakeCount));

  return Object.fromEntries(sectorKeys.map((sectorKey) => {
    const mapNodeValue = getMapNodeValue(sectorKey);
    const tierTwoObstruction = mapNodeValue === 2
      ? lakeSectors.has(sectorKey) ? "lake" as const : "blackHoles" as const
      : undefined;
    return sectorKey === MAP_HOME_SECTOR || !isMapNodeInRange(sectorKey)
      ? null
      : [
          sectorKey,
          makeRemoteMapFactoryState(globalRuntime, zoom, sectorKey, tierTwoObstruction),
        ] as const;
  }).filter((entry): entry is readonly [string, MapFactoryState] => entry !== null),
  );
};

const isSaveGameSlot = (value: unknown): value is SaveGameSlot => {
  if (!value || typeof value !== "object") return false;
  const slot = value as Partial<SaveGameSlot>;
  const data = slot.data as Partial<SaveGamePayload> | undefined;
  return (
    typeof slot.name === "string" &&
    typeof slot.savedAt === "string" &&
    data?.version === 1 &&
    Array.isArray(data.nodes) &&
    data.nodes.every((node) =>
      Boolean(node) &&
      typeof node === "object" &&
      typeof (node as SaveSerializedNode).id === "string" &&
      (
        isNodeKind((node as SaveSerializedNode).kind) ||
        isRetiredProductionNodeKind((node as SaveSerializedNode).kind)
      ),
    ) &&
    Boolean(data.positions) &&
    Array.isArray(data.connections) &&
    Boolean(data.runtime)
  );
};

const formatSaveDate = (savedAt: string) => {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatTemporarySaveName = (value: Date | string = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Temporary Save";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatTemporarySaveFrequency = (minutes: number) =>
  minutes >= 60 ? "1h" : `${minutes}m`;

const describeTemporarySaveFrequency = (minutes: number) =>
  minutes === 1
    ? "Every minute"
    : minutes >= 60
      ? "Once an hour"
      : `Every ${minutes} minutes`;

const isDestroyableNode = (node: NodeSpec) =>
  isPurchasableKind(node.kind) && node.id !== "storage";

const isSplitterNode = (nodeId: NodeId) => nodeId.startsWith("splitter-");
const isMergerNode = (nodeId: NodeId) => nodeId.startsWith("merger-");
const isJointNode = (nodeId: NodeId) => nodeId.startsWith("joint-");
const isRoadNode = (nodeId: NodeId) => nodeId.startsWith("road-");
const getOppositeRoadMode = (mode: RoadMode): RoadMode => mode === "export" ? "import" : "export";
const makeRoadRuntimeState = (
  state?: Partial<Runtime["roads"][NodeId]> | null,
  nodeId = "",
): Runtime["roads"][NodeId] => ({
  outboundType: state?.outboundType ?? null,
  inboundType: state?.inboundType ?? null,
  pairedSector: state?.pairedSector ?? null,
  pairedRoadId: state?.pairedRoadId ?? null,
  edge: state?.edge === "north" || state?.edge === "east" || state?.edge === "south" || state?.edge === "west"
    ? state.edge
    : null,
  mode: state?.mode === "import" || state?.mode === "export"
    ? state.mode
    : nodeId.startsWith("road-pair-")
      ? "import"
      : "export",
});
const isGeneratorNode = (nodeId: NodeId) => nodeId.startsWith("generator-");
const isPowerSplitterNode = (nodeId: NodeId) => nodeId.startsWith("powerSplitter-");
const findPowerGeneratorId = (
  sourceNode: NodeId,
  edges: Connection[],
  generators: Runtime["generators"],
  pausedOutputs: Runtime["pausedOutputs"] = {},
) => {
  let currentNode = sourceNode;
  const visited = new Set<NodeId>();
  while (!visited.has(currentNode)) {
    visited.add(currentNode);
    if (generators[currentNode]) return pausedOutputs[currentNode] ? null : currentNode;
    if (!isJointNode(currentNode) && !isPowerSplitterNode(currentNode)) return null;
    const incoming = edges.find(
      (edge) =>
        edge.targetNode === currentNode &&
        edge.targetPort === (isPowerSplitterNode(currentNode) ? "power-split-in" : "joint-in") &&
        edge.type === ResourceType.POWER,
    );
    if (!incoming) return null;
    currentNode = incoming.sourceNode;
  }
  return null;
};
const isMultiOutputPort = (nodeId: NodeId, portId: string) =>
  (isGeneratorNode(nodeId) && portId === "power-out") ||
  (nodeId.startsWith("lake-") && Boolean(getLakeWaterOutputPort(portId))) ||
  (nodeId.startsWith("inventorySource-") && portId === "inventory-out") ||
  (nodeId === "ironOre" && portId === "ore-out") ||
  (nodeId === "copperOre" && portId === "copper-ore-out") ||
  (nodeId === "mythrilOre" && portId === "mythril-ore-out") ||
  (nodeId === "stone" && portId === "stone-out") ||
  (nodeId.startsWith("miningDrill-") && (
    portId === "ore-out" ||
    portId === "copper-ore-out" ||
    portId === "mythril-ore-out" ||
    portId === "stone-out"
  )) ||
  (nodeId === "forest" && portId === "forest-out");
const isMultiInputPort = (nodeId: NodeId, portId: string) =>
  ((nodeId === "storage" || nodeId.startsWith("storage-")) && portId === "storage-in") ||
  (nodeId.startsWith("researchFoundry-") && portId === "research-core-in");
const isFurnaceNode = (nodeId: NodeId) => nodeId.startsWith("furnace-");
const isAssemblerNode = (nodeId: NodeId) => nodeId.startsWith("assembler-");
const isRefinerNode = (nodeId: NodeId) => nodeId.startsWith("refiner-");
const isSmartProcessorTypingPort = (
  nodeId: NodeId,
  portId: string,
  processor?: Runtime["processors"][NodeId] | null,
) =>
  (isFurnaceNode(nodeId) && portId === "metal-in") ||
  (isRefinerNode(nodeId) &&
    (processor?.refinerRecipe === "gear" || processor?.refinerRecipe === "wire") &&
    portId === "refiner-in");

const getSmartProcessorOutputPortId = (
  nodeId: NodeId,
  processor?: Runtime["processors"][NodeId] | null,
) =>
  isFurnaceNode(nodeId)
    ? "plate-out"
    : isRefinerNode(nodeId) && (
      processor?.refinerRecipe === "gear" || processor?.refinerRecipe === "wire"
    )
      ? "refiner-out"
      : null;

const makeProcessorState = (
  kind: ProcessorKind,
  materialType: ResourceType | null = null,
  assemblerRecipe: AssemblerRecipeId | null = null,
  refinerRecipe: RefinerRecipeId | null = null,
) => {
  const recipe = kind === "assembler" && assemblerRecipe
    ? ASSEMBLER_RECIPES[assemblerRecipe]
    : kind === "refiner" && refinerRecipe
      ? REFINER_RECIPES[refinerRecipe]
      : PROCESSOR_RECIPES[kind];
  return {
    progress: 0,
    stored: 0,
    full: false,
    inputs: Object.fromEntries(recipe.inputs.map((input) => [input.id, 0])),
    materialType,
    ...(kind === "assembler" ? { assemblerRecipe } : {}),
    ...(kind === "refiner" ? { refinerRecipe } : {}),
  };
};

const getProcessorStored = (processor: Runtime["processors"][NodeId] | undefined) =>
  processor?.stored ?? (processor?.full ? 1 : 0);

const isCoreType = (type: ResourceType): type is CoreType =>
  type === ResourceType.BASIC_CORE || type === ResourceType.AUTOMATA_CORE;

const getResearchFoundryCoreItems = (
  foundry: Runtime["researchFoundries"][NodeId] | undefined,
): CoreType[] => {
  if (Array.isArray(foundry?.coreItems)) {
    return foundry.coreItems.filter(isCoreType);
  }
  const legacyCount = Math.min(
    RESEARCH_CORE_CAPACITY_PER_TYPE,
    Math.max(0, Math.floor(Number(foundry?.cores ?? (foundry?.coreLoaded ? 1 : 0)) || 0)),
  );
  return Array.from({ length: legacyCount }, (): CoreType => ResourceType.AUTOMATA_CORE);
};

const getResearchFoundryCores = (
  foundry: Runtime["researchFoundries"][NodeId] | undefined,
) => getResearchFoundryCoreItems(foundry).length;

const getResearchFoundryCoreCount = (
  foundry: Runtime["researchFoundries"][NodeId] | undefined,
  type: CoreType,
) => getResearchFoundryCoreItems(foundry).filter((coreType) => coreType === type).length;

const isInventoryItemType = (type: ResourceType): type is InventoryItemType =>
  INVENTORY_ITEMS.some((item) => item.type === type);

type ManualIngredientSlot = {
  portId: string;
  label: string;
  capacity: number;
  choices: InventoryItemType[];
};

const getManualIngredientChoices = (type: ResourceType): InventoryItemType[] => {
  if (type === ResourceType.METAL) {
    return [ResourceType.IRON, ResourceType.COPPER, ResourceType.MYTHRIL];
  }
  if (type === ResourceType.PLATE) {
    return [ResourceType.IRON_PLATE, ResourceType.COPPER_PLATE, ResourceType.MYTHRIL_PLATE];
  }
  return isInventoryItemType(type) ? [type] : [];
};

const getManualIngredientSlots = (
  node: NodeSpec,
  processor?: Runtime["processors"][NodeId] | null,
): ManualIngredientSlot[] => {
  if (isProcessorKind(node.kind)) {
    return (getProcessorRecipe(node.kind, processor)?.inputs ?? []).map((input) => ({
      portId: input.id,
      label: input.label,
      capacity: PRODUCTION_INGREDIENT_CAPACITY,
      choices: getManualIngredientChoices(input.type),
    }));
  }
  if (node.kind === "generator") {
    return [{
      portId: "generator-charcoal-in",
      label: "Charcoal",
      capacity: PRODUCTION_INGREDIENT_CAPACITY,
      choices: [ResourceType.CHARCOAL],
    }];
  }
  if (node.kind === "researchFoundry") {
    return [{
      portId: "research-core-in",
      label: "All Cores",
      capacity: RESEARCH_CORE_CAPACITY_PER_TYPE * 2,
      choices: [ResourceType.BASIC_CORE, ResourceType.AUTOMATA_CORE],
    }];
  }
  if (node.kind === "miningDrill") {
    return [{
      portId: "motor-in",
      label: "Motor",
      capacity: 1,
      choices: [ResourceType.MOTOR],
    }];
  }
  return [];
};

type BuildIngredient = { type: InventoryItemType; amount: number };

const LOGISTICS_BUILD_KINDS = new Set<PurchasableKind>([
  "splitter",
  "merger",
  "joint",
]);

const LOGISTICS_CATEGORY_KINDS = new Set<PurchasableKind>([
  "splitter",
  "merger",
  "joint",
  "road",
  "powerSplitter",
  "filter",
  "inventorySource",
]);

const STORAGE_CATEGORY_KINDS = new Set<PurchasableKind>([
  "storage",
  "woodenChest",
]);

const getBuildCategory = (kind: PurchasableKind): Exclude<BuildCategory, "all"> =>
  STORAGE_CATEGORY_KINDS.has(kind)
    ? "storage"
    : LOGISTICS_CATEGORY_KINDS.has(kind)
      ? "logistics"
      : "production";

const isLogisticsNodeKind = (kind: NodeKind): kind is PurchasableKind =>
  isPurchasableKind(kind) && getBuildCategory(kind) !== "production";

const canPauseNodeOutput = (node: NodeSpec) =>
  isPurchasableKind(node.kind) &&
  getBuildCategory(node.kind) === "production" &&
  node.outputs.length > 0;

const getCompletedMachineOutputType = (
  node: NodeSpec,
  runtime: Runtime,
  edges: Connection[],
): InventoryItemType | null => {
  const construction = runtime.construction[node.id];
  if (construction && !construction.complete) return null;

  if (isExtractorKind(node.kind)) {
    const extractor = runtime.extractors[node.id];
    if ((extractor?.stored ?? 0) <= 0) return null;
    return extractor?.materialType ?? getExtractorRecipe(node.id, edges)?.product ?? null;
  }

  if (!isProcessorKind(node.kind) || getProcessorStored(runtime.processors[node.id]) <= 0) return null;
  const processor = runtime.processors[node.id];
  const dynamicOutput = getSmartProcessorOutput(
    node.id,
    processor.materialType ?? getSmartProcessorInputType(node.id, edges, processor),
    processor,
  );
  const outputType = dynamicOutput?.type ?? getProcessorRecipe(node.kind, processor)?.output.type;
  return outputType && isInventoryItemType(outputType) ? outputType : null;
};

const BUILD_CATALOG: Array<{
  kind: PurchasableKind;
  title: string;
  description: string;
  recipe: BuildIngredient[];
  buildTime: number;
  icon: NodeSpec["icon"];
}> = [
  {
    kind: "extractor",
    title: "Extractor",
    description: "Automate resource gathering",
    recipe: [
      { type: ResourceType.WOOD, amount: 2 },
      { type: ResourceType.STONE, amount: 2 },
    ],
    buildTime: BUILD_TIMES.extractor,
    icon: Pickaxe,
  },
  {
    kind: "storage",
    title: "Storage",
    description: `Stores up to ${STORAGE_NODE_CAPACITY} of every material type. One Storage node can accept connections from multiple item-producing nodes at the same time.`,
    recipe: [
      { type: ResourceType.WOOD, amount: 4 },
      { type: ResourceType.STONE, amount: 4 },
    ],
    buildTime: BUILD_TIMES.storage,
    icon: PackageOpen,
  },
  {
    kind: "woodenChest",
    title: "Wooden Chest",
    description: `Stores up to ${WOODEN_CHEST_CAPACITY} of one production material in its own container.`,
    recipe: [
      { type: ResourceType.WOOD, amount: 2 },
    ],
    buildTime: BUILD_TIMES.woodenChest,
    icon: Archive,
  },
  {
    kind: "splitter",
    title: "Splitter",
    description: "Alternates each incoming item between two smart outputs.",
    recipe: [
      { type: ResourceType.STONE, amount: 1 },
    ],
    buildTime: BUILD_TIMES.splitter,
    icon: Split,
  },
  {
    kind: "merger",
    title: "Merger",
    description: "Combines two matching item streams into one smart output.",
    recipe: [
      { type: ResourceType.STONE, amount: 1 },
    ],
    buildTime: BUILD_TIMES.merger,
    icon: GitMerge,
  },
  {
    kind: "joint",
    title: "Joint",
    description: "A compact pass-through for shaping and organizing cable routes.",
    recipe: [
      { type: ResourceType.WOOD, amount: 1 },
    ],
    buildTime: BUILD_TIMES.joint,
    icon: Cable,
  },
  {
    kind: "road",
    title: "Road",
    description: "Creates paired edge terminals with a shared Import / Export direction toggle.",
    recipe: [
      { type: ResourceType.STONE, amount: 5 },
      { type: ResourceType.BRICK, amount: 5 },
    ],
    buildTime: BUILD_TIMES.road,
    icon: RoadIcon,
  },
  {
    kind: "powerSplitter",
    title: "Power Splitter",
    description: "Branches one Power cable into three compact directional outputs.",
    recipe: [
      { type: ResourceType.STONE, amount: 1 },
      { type: ResourceType.COPPER_WIRE, amount: 1 },
    ],
    buildTime: BUILD_TIMES.powerSplitter,
    icon: Zap,
  },
  {
    kind: "filter",
    title: "Filter",
    description: "Passes only the selected stored item type through its output.",
    recipe: [
      { type: ResourceType.WOOD, amount: 1 },
      { type: ResourceType.IRON_PLATE, amount: 1 },
    ],
    buildTime: BUILD_TIMES.filter,
    icon: FilterIcon,
  },
  {
    kind: "inventorySource",
    title: "Inventory",
    description: "Retrieves stored materials for every connected Filter every four seconds.",
    recipe: [
      { type: ResourceType.STONE, amount: 3 },
      { type: ResourceType.IRON_PLATE, amount: 2 },
    ],
    buildTime: BUILD_TIMES.inventorySource,
    icon: PackageOpen,
  },
  {
    kind: "kiln",
    title: "Kiln",
    description: "Fires Wood into Charcoal for metal processing.",
    recipe: [
      { type: ResourceType.WOOD, amount: 2 },
      { type: ResourceType.STONE, amount: 3 },
    ],
    buildTime: BUILD_TIMES.kiln,
    icon: FlameKindling,
  },
  {
    kind: "generator",
    title: "Charcoal Generator",
    description: "Burns Charcoal into a shared 100W reserve for advanced machines.",
    recipe: [
      { type: ResourceType.STONE, amount: 3 },
      { type: ResourceType.IRON_PLATE, amount: 2 },
    ],
    buildTime: BUILD_TIMES.generator,
    icon: Zap,
  },
  {
    kind: "furnace",
    title: "Furnace",
    description: "Smelts metal with Charcoal into matching Plates.",
    recipe: [
      { type: ResourceType.STONE, amount: 4 },
      { type: ResourceType.IRON, amount: 2 },
    ],
    buildTime: BUILD_TIMES.furnace,
    icon: Anvil,
  },
  {
    kind: "refiner",
    title: "Refiner",
    description: "Changes one input item into another product.",
    recipe: [
      { type: ResourceType.IRON_PLATE, amount: 1 },
      { type: ResourceType.STONE, amount: 1 },
    ],
    buildTime: BUILD_TIMES.refiner,
    icon: Cog,
  },
  {
    kind: "assembler",
    title: "Assembler",
    description: "Combines two input items into another product.",
    recipe: [
      { type: ResourceType.WOOD, amount: 4 },
      { type: ResourceType.STONE, amount: 5 },
    ],
    buildTime: BUILD_TIMES.assembler,
    icon: Hammer,
  },
  {
    kind: "automataCoreAssembler",
    title: "Automata Core Assembler",
    description: "Combines one Circuit A and one Brick into an Automata Core.",
    recipe: [
      { type: ResourceType.STONE, amount: 6 },
      { type: ResourceType.MOTOR, amount: 1 },
      { type: ResourceType.CIRCUIT_A, amount: 2 },
    ],
    buildTime: BUILD_TIMES.automataCoreAssembler,
    icon: Atom,
  },
  {
    kind: "researchFoundry",
    title: "Research Center",
    description: "Accepts all Cores and studies them for the next generation of machinery.",
    recipe: [
      { type: ResourceType.STONE, amount: 5 },
      { type: ResourceType.WOOD, amount: 5 },
      { type: ResourceType.IRON_PLATE, amount: 5 },
    ],
    buildTime: BUILD_TIMES.researchFoundry,
    icon: FlaskConical,
  },
  {
    kind: "treePlanter",
    title: "Tree Planter",
    description: "Uses power to restore one depleted Forest unit every second.",
    recipe: [
      { type: ResourceType.MOTOR, amount: 1 },
      { type: ResourceType.IRON_PLATE, amount: 4 },
    ],
    buildTime: BUILD_TIMES.treePlanter,
    icon: Sprout,
  },
  {
    kind: "miningDrill",
    title: "Mining Drill",
    description: "Consumes twenty Motors, one per progression tick, then becomes a 1,000-unit deposit.",
    recipe: [
      { type: ResourceType.MOTOR, amount: 2 },
    ],
    buildTime: BUILD_TIMES.miningDrill,
    icon: MiningDrillIcon,
  },
];

// Hidden nodes stay in the full catalog so existing saves can still
// hydrate, run, and refund them without exposing them to new games.
const VISIBLE_BUILD_CATALOG = BUILD_CATALOG.filter(
  (item) => item.kind !== "filter" && item.kind !== "automataCoreAssembler",
);

type ShortcutNodeOption = {
  kind: PurchasableKind;
  title: string;
  icon: NodeSpec["icon"];
  canBuild: boolean;
};

type NodeShortcutBarProps = {
  name: string;
  config: ShortcutBarConfig;
  options: ShortcutNodeOption[];
  placementActive: boolean;
  grouped: boolean;
  snapReady: boolean;
  showGroupTooltip: boolean;
  onBuild: (kind: PurchasableKind) => boolean;
  onBuildDragEnd: (clientX: number, clientY: number, repeatPlacement: boolean) => void;
  onBuildDragCancel: () => void;
  onChange: (updater: (current: ShortcutBarConfig) => ShortcutBarConfig) => void;
  onElementRef: (element: HTMLElement | null) => void;
  onMoveStart: () => void;
  onMove: (deltaX: number, deltaY: number) => void;
  onMoveEnd: (commit: boolean) => void;
  onRotate: () => void;
  onResizeEnd: () => void;
  onSeparate: () => void;
  onDisableGroupTooltip: () => void;
};

const NodeShortcutBar = ({
  name,
  config,
  options,
  placementActive,
  grouped,
  snapReady,
  showGroupTooltip,
  onBuild,
  onBuildDragEnd,
  onBuildDragCancel,
  onChange,
  onElementRef,
  onMoveStart,
  onMove,
  onMoveEnd,
  onRotate,
  onResizeEnd,
  onSeparate,
  onDisableGroupTooltip,
}: NodeShortcutBarProps) => {
  const [openAssignmentSlot, setOpenAssignmentSlot] = useState<number | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<number | null>(null);
  const shortcutDragRef = useRef<{
    pointerId: number;
    slotIndex: number;
    kind: PurchasableKind;
    startX: number;
    startY: number;
    started: boolean;
  } | null>(null);
  const suppressShortcutClickRef = useRef<number | null>(null);
  const interactionRef = useRef<{
    mode: "move" | "resize";
    pointerId: number;
    startX: number;
    startY: number;
    scale: number;
  } | null>(null);

  const beginInteraction = (
    event: React.PointerEvent<HTMLElement>,
    mode: "move" | "resize",
  ) => {
    if (config.locked || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scale: config.scale,
    };
    if (mode === "move") onMoveStart();
  };

  const updateInteraction = (event: React.PointerEvent<HTMLElement>) => {
    const interaction = interactionRef.current;
    if (!interaction || interaction.pointerId !== event.pointerId) return;
    event.preventDefault();
    const deltaX = event.clientX - interaction.startX;
    const deltaY = event.clientY - interaction.startY;
    if (interaction.mode === "move") {
      onMove(deltaX, deltaY);
      return;
    }
    const resizeDelta = (deltaX + deltaY) / 260;
    onChange((current) => ({
      ...current,
      scale: Math.min(
        SHORTCUT_BAR_SCALE_MAX,
        Math.max(SHORTCUT_BAR_SCALE_MIN, interaction.scale + resizeDelta),
      ),
    }));
  };

  const finishInteraction = (
    event: React.PointerEvent<HTMLElement>,
    commit: boolean,
  ) => {
    const interaction = interactionRef.current;
    if (interaction?.pointerId !== event.pointerId) return;
    interactionRef.current = null;
    if (interaction.mode === "move") onMoveEnd(commit);
    else onResizeEnd();
  };

  const beginShortcutDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    slotIndex: number,
    kind: PurchasableKind,
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    shortcutDragRef.current = {
      pointerId: event.pointerId,
      slotIndex,
      kind,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
    };
  };

  const updateShortcutDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = shortcutDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.started) return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 5) return;
    event.preventDefault();
    event.stopPropagation();
    if (!onBuild(drag.kind)) {
      shortcutDragRef.current = null;
      return;
    }
    drag.started = true;
    suppressShortcutClickRef.current = drag.slotIndex;
    setDraggingSlot(drag.slotIndex);
  };

  const finishShortcutDrag = (
    event: React.PointerEvent<HTMLButtonElement>,
    commit: boolean,
  ) => {
    const drag = shortcutDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    shortcutDragRef.current = null;
    setDraggingSlot(null);
    if (!drag.started) return;
    event.preventDefault();
    event.stopPropagation();
    suppressShortcutClickRef.current = drag.slotIndex;
    window.setTimeout(() => {
      if (suppressShortcutClickRef.current === drag.slotIndex) {
        suppressShortcutClickRef.current = null;
      }
    }, 0);
    if (commit) onBuildDragEnd(event.clientX, event.clientY, event.shiftKey);
    else onBuildDragCancel();
  };

  if (!config.visible) return null;

  const shortcutBar = (
    <section
      ref={onElementRef}
      className={`node-shortcut-bar ${config.locked ? "locked" : ""} ${config.rotation === 90 ? "vertical" : "horizontal"} ${grouped ? "grouped" : ""} ${snapReady ? "snap-ready" : ""}`}
      aria-label={name}
      style={{
        left: `${config.position.x}%`,
        top: config.position.y,
        transform: `translateX(-50%) scale(${config.scale})`,
      }}
      onPointerMove={updateInteraction}
      onPointerUp={(event) => finishInteraction(event, true)}
      onPointerCancel={(event) => finishInteraction(event, false)}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("button, input, select, textarea, a, [role='menuitem']")) return;
        beginInteraction(event, "move");
      }}
      onContextMenuCapture={(event) => {
        if (!grouped) return;
        event.preventDefault();
        event.stopPropagation();
        setOpenAssignmentSlot(null);
        onSeparate();
      }}
    >
      <div className="shortcut-bar-toolbar">
        <div className="shortcut-bar-actions">
          <button
            type="button"
            className="shortcut-bar-control rotate"
            aria-label={`Rotate ${name}`}
            title="Rotate 90°"
            disabled={config.locked}
            onClick={onRotate}
          >
            ↻
          </button>
          <button
            type="button"
            className={`shortcut-bar-control lock ${config.locked ? "active" : ""}`}
            aria-label={`${config.locked ? "Unlock" : "Lock"} ${name}`}
            aria-pressed={config.locked}
            title={`${config.locked ? "Unlock" : "Lock"} ${name}`}
            onClick={() => onChange((current) => ({ ...current, locked: !current.locked }))}
          >
            {config.locked ? <Lock aria-hidden="true" /> : <LockOpen aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className="shortcut-slot-row" role="toolbar" aria-label={`${name} node shortcuts`}>
        {config.assignments.map((assignment, index) => {
          const option = assignment
            ? options.find((candidate) => candidate.kind === assignment) ?? null
            : null;
          const Icon = option?.icon ?? Plus;
          const unavailable = Boolean(option && (!option.canBuild || placementActive));
          const buttonStatus = option
            ? placementActive
              ? "Finish the current placement first"
              : option.canBuild
                ? "Ready to build"
                : "Not enough resources"
            : "No node assigned";
          return (
            <ContextMenu
              key={`${name}-slot-${index}`}
              open={openAssignmentSlot === index}
              onOpenChange={(open) => setOpenAssignmentSlot(open ? index : null)}
            >
              <Tooltip delayDuration={350}>
                <TooltipTrigger asChild>
                  <ContextMenuTrigger asChild>
                    <button
                      type="button"
                      className={`shortcut-slot ${assignment ? "assigned" : "empty"} ${unavailable ? "unavailable" : ""} ${draggingSlot === index ? "dragging-build" : ""}`}
                      aria-label={option ? `Build ${option.title}; right-click to change node` : `Unassigned shortcut ${index + 1}; right-click to choose node`}
                      onPointerDown={(event) => {
                        if (option && !unavailable) beginShortcutDrag(event, index, option.kind);
                      }}
                      onPointerMove={updateShortcutDrag}
                      onPointerUp={(event) => finishShortcutDrag(event, true)}
                      onPointerCancel={(event) => finishShortcutDrag(event, false)}
                      onClick={(event) => {
                        if (suppressShortcutClickRef.current === index) {
                          suppressShortcutClickRef.current = null;
                          event.preventDefault();
                          return;
                        }
                        if (!option) {
                          const button = event.currentTarget;
                          const bounds = button.getBoundingClientRect();
                          const clientX = event.clientX || bounds.left + bounds.width / 2;
                          const clientY = event.clientY || bounds.top + bounds.height / 2;
                          window.requestAnimationFrame(() => {
                            button.dispatchEvent(new MouseEvent("contextmenu", {
                              bubbles: true,
                              cancelable: true,
                              clientX,
                              clientY,
                              button: 2,
                            }));
                          });
                          return;
                        }
                        if (unavailable) return;
                        onBuild(option.kind);
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{index + 1}</span>
                    </button>
                  </ContextMenuTrigger>
                </TooltipTrigger>
                <TooltipContent
                  className="shortcut-slot-tooltip"
                  side="top"
                  sideOffset={8}
                  collisionPadding={{ top: 12, right: 12, bottom: 12, left: 12 }}
                  avoidCollisions
                >
                  <div className="shortcut-slot-tooltip-heading">
                    <span className="shortcut-slot-tooltip-icon"><Icon aria-hidden="true" /></span>
                    <div>
                      <strong>{option?.title ?? "Unassigned"}</strong>
                      <span>{buttonStatus}</span>
                    </div>
                  </div>
                  <p>{option ? "Click or drag to build. Right-click to change the desired node." : "Right-click to choose a node."}</p>
                </TooltipContent>
              </Tooltip>
              <ContextMenuContent className="shortcut-assignment-menu">
                {options.map((candidate) => {
                  const CandidateIcon = candidate.icon;
                  return (
                    <ContextMenuItem
                      className={candidate.kind === assignment ? "selected" : ""}
                      key={candidate.kind}
                      onSelect={() => onChange((current) => ({
                        ...current,
                        assignments: current.assignments.map((value, assignmentIndex) =>
                          assignmentIndex === index ? candidate.kind : value,
                        ),
                      }))}
                    >
                      <CandidateIcon aria-hidden="true" />
                      <span>{candidate.title}</span>
                      {candidate.kind === assignment ? <small>Assigned</small> : null}
                    </ContextMenuItem>
                  );
                })}
                {assignment ? (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      onSelect={() => onChange((current) => ({
                        ...current,
                        assignments: current.assignments.map((value, assignmentIndex) =>
                          assignmentIndex === index ? null : value,
                        ),
                      }))}
                    >
                      <Trash2 aria-hidden="true" />
                      Clear shortcut
                    </ContextMenuItem>
                  </>
                ) : null}
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
      <button
        type="button"
        className="shortcut-bar-resize-handle"
        aria-label={`Resize ${name}`}
        title={config.locked ? `${name} is locked` : `Drag to resize ${name}`}
        disabled={config.locked}
        onPointerDown={(event) => beginInteraction(event, "resize")}
      >
        <span aria-hidden="true" />
      </button>
    </section>
  );

  if (!grouped || !showGroupTooltip) return shortcutBar;
  return (
    <Tooltip delayDuration={350}>
      <TooltipTrigger asChild>{shortcutBar}</TooltipTrigger>
      <TooltipContent className="shortcut-bar-group-tooltip" side="bottom" sideOffset={9}>
        <strong>Shortcut bars attached</strong>
        <span>Right click anywhere on any attached bar to separate them.</span>
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onDisableGroupTooltip}
        >
          Don&apos;t show this again
        </button>
      </TooltipContent>
    </Tooltip>
  );
};

type ViewportBoundTooltipProps = React.ComponentProps<"aside"> & {
  measurementKey: string;
};

const ViewportBoundTooltip = ({
  measurementKey,
  style,
  ...props
}: ViewportBoundTooltipProps) => {
  const tooltipRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    let frame: number | null = null;
    let settleTimer: number | null = null;
    const measure = () => {
      frame = null;
      tooltip.style.setProperty("--viewport-tooltip-shift-x", "0px");
      tooltip.style.setProperty("--viewport-tooltip-shift-y", "0px");
      const bounds = tooltip.getBoundingClientRect();
      const margin = 12;
      let screenShiftX = 0;
      let screenShiftY = 0;
      if (bounds.left < margin) screenShiftX = margin - bounds.left;
      else if (bounds.right > window.innerWidth - margin) {
        screenShiftX = window.innerWidth - margin - bounds.right;
      }
      if (bounds.top < margin) screenShiftY = margin - bounds.top;
      else if (bounds.bottom > window.innerHeight - margin) {
        screenShiftY = window.innerHeight - margin - bounds.bottom;
      }
      const scaleX = tooltip.offsetWidth > 0 ? bounds.width / tooltip.offsetWidth : 1;
      const scaleY = tooltip.offsetHeight > 0 ? bounds.height / tooltip.offsetHeight : 1;
      tooltip.style.setProperty(
        "--viewport-tooltip-shift-x",
        `${screenShiftX / Math.max(0.01, scaleX)}px`,
      );
      tooltip.style.setProperty(
        "--viewport-tooltip-shift-y",
        `${screenShiftY / Math.max(0.01, scaleY)}px`,
      );
    };
    const scheduleMeasure = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(tooltip);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    scheduleMeasure();
    settleTimer = window.setTimeout(scheduleMeasure, 180);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [measurementKey]);

  return <aside ref={tooltipRef} style={style} {...props} />;
};

type BuildOperationDetail = {
  label: string;
  amount?: string;
  type?: ResourceType;
};

const getBuildRequiredInputs = (kind: PurchasableKind): BuildOperationDetail[] => {
  if (kind === "refiner") {
    return [{ label: "Configurable input", amount: "Recipe" }];
  }
  if (kind === "assembler") {
    return [
      { label: "Configurable input A", amount: "Recipe" },
      { label: "Configurable input B", amount: "Recipe" },
    ];
  }
  if (isProcessorKind(kind)) {
    return PROCESSOR_RECIPES[kind].inputs.map((input) => ({
      label: input.label,
      amount: String(input.amount),
      type: input.type,
    }));
  }
  if (kind === "extractor") {
    return [{ label: "Connected Resource", amount: "1", type: ResourceType.RESOURCE }];
  }
  if (kind === "generator") {
    return [{ label: "Charcoal", amount: "1", type: ResourceType.CHARCOAL }];
  }
  if (kind === "researchFoundry") {
    return [{ label: "All Cores", amount: "1", type: ResourceType.CORE }];
  }
  if (kind === "road") {
    return [{ label: "Any inventory item", amount: "1", type: ResourceType.ANY }];
  }
  if (kind === "treePlanter") {
    return [{ label: "Power", amount: `${TREE_PLANTER_POWER_COST}W`, type: ResourceType.POWER }];
  }
  if (kind === "miningDrill") {
    return [{ label: "Motor per tick", amount: "1", type: ResourceType.MOTOR }];
  }
  return [];
};

const getBuildProductionOutputs = (
  kind: PurchasableKind,
  previewNode: NodeSpec,
): BuildOperationDetail[] => {
  if (kind === "refiner") {
    return [{ label: "Matching Gear, Wire, or Brick", amount: "1" }];
  }
  if (kind === "assembler") {
    return [{ label: "Motor or Circuit A", amount: "1" }];
  }
  if (isProcessorKind(kind)) {
    const output = PROCESSOR_RECIPES[kind].output;
    return [{ label: output.label, amount: "1", type: output.type }];
  }
  if (kind === "extractor") {
    return [{ label: "Matching material", amount: "1", type: ResourceType.RESOURCE }];
  }
  if (kind === "generator") {
    return [{ label: "Power", amount: `${POWER_PER_CHARCOAL}W`, type: ResourceType.POWER }];
  }
  if (kind === "researchFoundry") {
    return [{ label: "Research", amount: "1" }];
  }
  if (kind === "road") {
    return [{ label: "Paired Road on adjacent map", amount: "1 item" }];
  }
  if (kind === "treePlanter") {
    return [{ label: "Forest capacity", amount: "+1", type: ResourceType.FOREST_GROWTH }];
  }
  if (kind === "miningDrill") {
    return [{ label: "Selected ore deposit", amount: "1,000 units" }];
  }
  return previewNode.outputs.map((output) => ({
    label: output.label,
    type: output.type,
  }));
};

const RESEARCH_PROJECTS: Array<{
  id: ResearchProjectId;
  title: string;
  description: string;
  unlock: string;
  flavorText?: string;
  icon: NodeSpec["icon"];
  repeatable?: boolean;
}> = [
  {
    id: "logistics",
    title: "Logistics",
    description: "Build an extractor to unlock logistics nodes.",
    unlock: "Unlocks the Splitter, Merger, and Joint nodes",
    flavorText: "This way, no that way!",
    icon: GitMerge,
  },
  {
    id: "kiln",
    title: "Kiln",
    description: "Fires Wood into Charcoal for metal processing.",
    unlock: "Unlocks the Kiln node",
    flavorText: "Burn, baby, burn!",
    icon: FlameKindling,
  },
  {
    id: "furnace",
    title: "Furnace",
    description: "Smelts metal ore with Charcoal into matching Plates.",
    unlock: "Unlocks the Furnace node",
    flavorText: "I'm melting, I'm melting!",
    icon: Anvil,
  },
  {
    id: "refiner",
    title: "Refiner",
    description: "Changes one input item into another product.",
    unlock: "Unlocks the Refiner node",
    flavorText: "Nothing a hammer can't fix.",
    icon: Cog,
  },
  {
    id: "assembler",
    title: "Assembler",
    description: "Combines two input items into another product.",
    unlock: "Unlocks the Assembler node",
    flavorText: "If it doesn't fit, make it fit.",
    icon: Hammer,
  },
  {
    id: "researchCenter",
    title: "Research Center",
    description: "Analyzes Basic Cores and Automata Cores to advance research projects.",
    unlock: "Unlocks the Research Center node",
    flavorText: "It's not a failure if we survive.",
    icon: FlaskConical,
  },
  {
    id: "exploration",
    title: "Exploration",
    description: "Chart the territory around the Home factory and establish a navigable sector map.",
    unlock: "Unlocks the Map and awards 1 Map Point",
    flavorText: "The world is flat.",
    icon: Compass,
  },
  {
    id: "mapNode",
    title: "Map Node",
    description: "Charts another location that can be activated beside an unlocked map node.",
    unlock: "Awards 1 Map Point; the cost rises by 5 of each Core per completion through Tier 3",
    icon: MapIcon,
    repeatable: true,
  },
  {
    id: "road",
    title: "Road",
    description: "Establishes paired edge links that carry items between adjacent map nodes.",
    unlock: "Unlocks the Road node",
    icon: RoadIcon,
  },
  {
    id: "areaExpansion1",
    title: "Area Expansion 1",
    description: "Extends the usable factory grounds in every map node.",
    unlock: "Increases every map node's Field Size by 25% in both dimensions",
    flavorText: "YOU MUST CONSTRUCT ADDITIONAL.... nodes.",
    icon: AreaExpansionIcon,
  },
  {
    id: "extractor2",
    title: "Extractor 1",
    description: "Retrofit every Extractor with a refined drive that shortens its cycle to 90% of base time.",
    unlock: "All existing and future Extractors run at 90% cycle time",
    flavorText: "It's because we put that big spoiler on the back.",
    icon: Pickaxe,
  },
  {
    id: "automataCore",
    title: "Automata Core",
    description: "Develops an advanced core by combining Circuit A with Brick.",
    unlock: "Unlocks the Automata Core recipe in the Assembler",
    icon: Atom,
  },
  {
    id: "extractor3",
    title: "Extractor 2",
    description: "Further refines every Extractor drive to shorten its cycle by another 10%.",
    unlock: "All existing and future Extractors run at 80% base cycle time",
    flavorText: "It's the muffler I tell you, just listen to it go!",
    icon: Pickaxe,
  },
  {
    id: "charcoalGenerator",
    title: "Basic Electricity",
    description: "Generates and distributes power for advanced machines.",
    unlock: "Unlocks the Charcoal Generator and Power Splitter nodes",
    flavorText: "Just connect these two wires right?",
    icon: Zap,
  },
  {
    id: "treePlanter",
    title: "Tree Planter",
    description: "Automate reforestation by converting power into renewable Forest capacity.",
    unlock: "Unlocks the Tree Planter node",
    flavorText: "Only you can prevent forest fires.",
    icon: Sprout,
  },
  {
    id: "miningDrill",
    title: "Mining Drill",
    description: "Develop motor-driven deep-bore surveying that creates a fresh ore deposit.",
    unlock: "Unlocks the Mining Drill node",
    flavorText: "I'm a miner, not a major.",
    icon: MiningDrillIcon,
  },
];

const RESEARCH_MILESTONE_REQUIREMENTS: Partial<Record<ResearchProjectId, {
  pending: string;
  complete: string;
}>> = {
  logistics: { pending: "Build an Extractor", complete: "Extractor built" },
  kiln: { pending: "Extract 1 Wood with an Extractor", complete: "Wood extracted" },
  charcoalGenerator: { pending: "Produce at least 1 Motor", complete: "Motor produced" },
  furnace: { pending: "Extract 1 metal with an Extractor", complete: "Metal extracted" },
  refiner: { pending: "Produce at least 1 metal Plate", complete: "Metal Plate produced" },
  assembler: { pending: "Build your first Refiner", complete: "Refiner built" },
  researchCenter: { pending: "Build your first Assembler", complete: "Assembler built" },
};

const getResearchMilestoneRequirement = (projectId: ResearchProjectId) =>
  RESEARCH_MILESTONE_REQUIREMENTS[projectId] ?? null;

const isBasicCoreResearchProject = (projectId: ResearchProjectId) =>
  projectId === "road" || projectId === "areaExpansion1" || projectId === "exploration" || projectId === "automataCore" || projectId === "extractor2";

const isMixedCoreResearchProject = (projectId: ResearchProjectId) =>
  projectId === "mapNode" || projectId === "extractor3" || projectId === "treePlanter" || projectId === "miningDrill";

const getResearchProjectPrerequisite = (projectId: ResearchProjectId) =>
  projectId === "extractor3"
    ? "Extractor 1"
    : projectId === "automataCore" || projectId === "mapNode"
      ? "Exploration"
      : null;

const isResearchProjectPrerequisiteSatisfied = (
  research: Runtime["research"],
  projectId: ResearchProjectId,
) => projectId === "extractor3"
  ? research.extractor2Unlocked
  : projectId === "automataCore" || projectId === "mapNode"
    ? research.explorationUnlocked
    : true;

const getResearchProjectCoreCosts = (
  projectId: ResearchProjectId,
  research?: Runtime["research"],
) => {
  if (projectId === "mapNode") {
    const completions = Math.max(
      0,
      Math.floor(Number(research?.mapNodeResearchCompletions) || 0),
    );
    const costPerType = MAP_NODE_RESEARCH_COST_STEP * Math.min(
      completions + 1,
      MAP_NODE_RESEARCH_GROWTH_COMPLETION_CAP,
    );
    return { basic: costPerType, automata: costPerType };
  }
  if (projectId === "exploration") {
    return { basic: EXPLORATION_RESEARCH_COST, automata: 0 };
  }
  if (isMixedCoreResearchProject(projectId)) {
    return { basic: BASIC_CORE_RESEARCH_COST, automata: RESEARCH_UNLOCK_COST };
  }
  if (isBasicCoreResearchProject(projectId)) {
    return { basic: BASIC_CORE_RESEARCH_COST, automata: 0 };
  }
  return null;
};

const getResearchProjectCost = (
  projectId: ResearchProjectId,
  research?: Runtime["research"],
) => {
  const coreCosts = getResearchProjectCoreCosts(projectId, research);
  return coreCosts
    ? coreCosts.basic + coreCosts.automata
    : getResearchMilestoneRequirement(projectId) ? 1 : RESEARCH_UNLOCK_COST;
};

const getResearchProjectRequiredCoreType = (
  projectId: ResearchProjectId | null,
  projectProgress = 0,
  research?: Runtime["research"],
): CoreType | null => {
  if (!projectId) return null;
  const coreCosts = getResearchProjectCoreCosts(projectId, research);
  if (!coreCosts) return null;
  return projectProgress < coreCosts.basic
    ? ResourceType.BASIC_CORE
    : ResourceType.AUTOMATA_CORE;
};

const getResearchProjectCoreLabel = (
  projectId: ResearchProjectId,
  research?: Runtime["research"],
) => {
  const coreCosts = getResearchProjectCoreCosts(projectId, research);
  return coreCosts?.automata
    ? `Cores (${coreCosts.basic} Basic + ${coreCosts.automata} Automata)`
    : coreCosts?.basic
      ? "Basic Cores"
      : "Cores";
};

const getResearchFoundryProjectCoreCount = (
  foundry: Runtime["researchFoundries"][NodeId] | undefined,
  projectId: ResearchProjectId | null,
  projectProgress = 0,
  research?: Runtime["research"],
) => {
  const requiredType = getResearchProjectRequiredCoreType(projectId, projectProgress, research);
  return requiredType
    ? getResearchFoundryCoreCount(foundry, requiredType)
    : getResearchFoundryCores(foundry);
};

const hasCompletedResearchCenter = (runtime: Runtime, nodes: Array<Pick<NodeSpec, "id" | "kind">>) =>
  nodes.some((node) => {
    if (node.kind !== "researchFoundry") return false;
    const construction = runtime.construction[node.id];
    return !construction || construction.complete;
  });

const canSelectResearchProject = (
  runtime: Runtime,
  nodes: NodeSpec[],
  mapFactories: MapFactoriesBySector = {},
  activeSector?: string,
) => runtime.research.available ||
  hasCompletedResearchCenter(runtime, nodes) ||
  Object.entries(mapFactories).some(([sectorKey, factory]) =>
    sectorKey !== activeSector && hasCompletedResearchCenter(factory.runtime, factory.nodes)
  );

const isResearchProjectUnlocked = (
  research: Runtime["research"],
  projectId: ResearchProjectId,
) => projectId === "logistics"
  ? research.logisticsUnlocked
  : projectId === "kiln"
    ? research.kilnUnlocked
    : projectId === "charcoalGenerator"
      ? research.charcoalGeneratorUnlocked
      : projectId === "furnace"
        ? research.furnaceUnlocked
        : projectId === "refiner"
          ? research.refinerUnlocked
          : projectId === "assembler"
            ? research.assemblerUnlocked
            : projectId === "researchCenter"
              ? research.researchCenterUnlocked
              : projectId === "road"
                ? research.roadUnlocked
              : projectId === "areaExpansion1"
                ? research.areaExpansion1Unlocked
                : projectId === "extractor2"
                  ? research.extractor2Unlocked
                  : projectId === "extractor3"
                    ? research.extractor3Unlocked
                    : projectId === "treePlanter"
                      ? research.treePlanterUnlocked
                    : projectId === "miningDrill"
                      ? research.miningDrillUnlocked
                      : projectId === "mapNode"
                        ? false
                      : projectId === "automataCore"
                        ? research.automataCoreUnlocked
                        : research.explorationUnlocked;

const getResearchProject = (projectId: ResearchProjectId | null) =>
  RESEARCH_PROJECTS.find((project) => project.id === projectId) ?? null;

const announceResearchCompletion = (projectId: ResearchProjectId) => {
  const project = getResearchProject(projectId);
  if (!project) return;
  toast(`${project.title} research complete`, {
    id: `research-complete-${projectId}`,
    description: project.unlock,
    className: "research-completion-toast",
  });
};

const isAllResearchComplete = (research: Runtime["research"]) =>
  RESEARCH_PROJECTS.every((project) => isResearchProjectUnlocked(research, project.id));

type BuildUnlockContext = {
  runtime: Runtime;
  builtKinds: ReadonlySet<PurchasableKind>;
  logisticsUnlocked: boolean;
};

type BuildUnlockRule = {
  requirement: string;
  isSatisfied: (context: BuildUnlockContext) => boolean;
};

const hasProducedItem = (runtime: Runtime, type: InventoryItemType) =>
  (runtime.produced?.[type] ?? 0) > 0;

const hasProducedAny = (runtime: Runtime, types: InventoryItemType[]) =>
  types.some((type) => hasProducedItem(runtime, type));

const hasProducedPlate = (runtime: Runtime) =>
  hasProducedAny(runtime, [
    ResourceType.IRON_PLATE,
    ResourceType.COPPER_PLATE,
    ResourceType.MYTHRIL_PLATE,
  ]);

const isResearchMilestoneSatisfied = (
  projectId: ResearchProjectId,
  runtime: Runtime,
  builtKinds: ReadonlySet<PurchasableKind>,
) => projectId === "kiln"
  ? (runtime.extractorProduced?.[ResourceType.WOOD] ?? 0) > 0
  : projectId === "charcoalGenerator"
    ? hasProducedItem(runtime, ResourceType.MOTOR)
    : projectId === "furnace"
      ? [ResourceType.IRON, ResourceType.COPPER, ResourceType.MYTHRIL]
        .some((type) => (runtime.extractorProduced?.[type] ?? 0) > 0)
      : projectId === "refiner"
        ? hasProducedPlate(runtime)
        : projectId === "assembler"
          ? builtKinds.has("refiner")
          : projectId === "researchCenter"
            ? builtKinds.has("assembler")
            : false;

const BUILD_UNLOCK_RULES: Record<PurchasableKind, BuildUnlockRule> = {
  extractor: {
    requirement: "Available at the start of the game.",
    isSatisfied: () => true,
  },
  storage: {
    requirement: "No unlock trigger assigned yet.",
    isSatisfied: () => false,
  },
  woodenChest: {
    requirement: "Available at the start of the game.",
    isSatisfied: () => true,
  },
  splitter: {
    requirement: "Complete Logistics research by building an Extractor.",
    isSatisfied: ({ logisticsUnlocked }) => logisticsUnlocked,
  },
  merger: {
    requirement: "Complete Logistics research by building an Extractor.",
    isSatisfied: ({ logisticsUnlocked }) => logisticsUnlocked,
  },
  filter: {
    requirement: "No unlock trigger assigned yet.",
    isSatisfied: () => false,
  },
  inventorySource: {
    requirement: "No unlock trigger assigned yet.",
    isSatisfied: () => false,
  },
  joint: {
    requirement: "Complete Logistics research by building an Extractor.",
    isSatisfied: ({ logisticsUnlocked }) => logisticsUnlocked,
  },
  powerSplitter: {
    requirement: "Complete Basic electricity research by producing at least 1 Motor.",
    isSatisfied: ({ runtime }) => runtime.research.charcoalGeneratorUnlocked,
  },
  kiln: {
    requirement: "Complete Kiln research by producing at least 1 Wood.",
    isSatisfied: ({ runtime }) => runtime.research.kilnUnlocked,
  },
  furnace: {
    requirement: "Complete Furnace research by producing at least 1 metal.",
    isSatisfied: ({ runtime }) => runtime.research.furnaceUnlocked,
  },
  generator: {
    requirement: "Complete Basic electricity research by producing at least 1 Motor.",
    isSatisfied: ({ runtime }) => runtime.research.charcoalGeneratorUnlocked,
  },
  refiner: {
    requirement: "Complete Refiner research by producing at least 1 Iron Plate or Copper Plate.",
    isSatisfied: ({ runtime }) => runtime.research.refinerUnlocked,
  },
  assembler: {
    requirement: "Complete Assembler research by building your first Refiner.",
    isSatisfied: ({ runtime }) => runtime.research.assemblerUnlocked,
  },
  automataCoreAssembler: {
    requirement: "Build a Charcoal Generator.",
    isSatisfied: ({ builtKinds }) => builtKinds.has("generator"),
  },
  researchFoundry: {
    requirement: "Complete Research Center research by building your first Assembler.",
    isSatisfied: ({ runtime }) => runtime.research.researchCenterUnlocked,
  },
  road: {
    requirement: `Complete Road research with ${BASIC_CORE_RESEARCH_COST} Basic Cores.`,
    isSatisfied: ({ runtime }) => runtime.research.roadUnlocked,
  },
  treePlanter: {
    requirement: `Complete Tree Planter research with ${BASIC_CORE_RESEARCH_COST} Basic Cores and ${RESEARCH_UNLOCK_COST} Automata Cores.`,
    isSatisfied: ({ runtime }) => runtime.research.treePlanterUnlocked,
  },
  miningDrill: {
    requirement: `Complete Mining Drill research with ${BASIC_CORE_RESEARCH_COST} Basic Cores and ${RESEARCH_UNLOCK_COST} Automata Cores.`,
    isSatisfied: ({ runtime }) => runtime.research.miningDrillUnlocked,
  },
};

const isBuildUnlockSatisfied = (
  kind: PurchasableKind,
  context: BuildUnlockContext,
) => BUILD_UNLOCK_RULES[kind].isSatisfied(context);

const getBuildUnlockRequirement = (kind: PurchasableKind) =>
  BUILD_UNLOCK_RULES[kind].requirement;

const isBuildKindUnlocked = (
  kind: PurchasableKind,
  revealedKinds: ReadonlySet<PurchasableKind>,
  context: BuildUnlockContext,
) => isBuildUnlockSatisfied(kind, context) || (
  kind !== "researchFoundry" && revealedKinds.has(kind)
);

const formatUnlockTime = (elapsedMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const createBuildableNode = (kind: PurchasableKind, id: NodeId, sequence: number): NodeSpec => {
  if (isExtractorKind(kind)) {
    return {
      id,
      kind,
      title: "Extractor",
      eyebrow: `EXTRACTOR ${String(sequence).padStart(2, "0")}`,
      color: RESOURCE_COLORS.RESOURCE,
      icon: Pickaxe,
      inputs: [{ id: "resource-in", label: "Resource", type: ResourceType.RESOURCE, direction: "input" }],
      outputs: [{ id: "product-out", label: "Output", type: ResourceType.RESOURCE, direction: "output" }],
    };
  }
  if (kind === "splitter") {
    return {
      id,
      kind,
      title: "Splitter",
      eyebrow: `ROUTER ${String(sequence).padStart(2, "0")}`,
      color: "#9c8ed4",
      icon: Split,
      inputs: [{ id: "split-in", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "input" }],
      outputs: [
        { id: "split-a-out", label: "A", type: ResourceType.ANY, direction: "output" },
        { id: "split-b-out", label: "B", type: ResourceType.ANY, direction: "output" },
      ],
    };
  }
  if (kind === "filter") {
    return {
      id,
      kind,
      title: "Filter",
      eyebrow: `FILTER ${String(sequence).padStart(2, "0")}`,
      color: "#d39c62",
      icon: FilterIcon,
      inputs: [{ id: "filter-in", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "input" }],
      outputs: [{ id: "filter-out", label: "Choose", type: ResourceType.ANY, direction: "output" }],
    };
  }
  if (kind === "inventorySource") {
    return {
      id,
      kind,
      title: "Inventory",
      eyebrow: `INVENTORY LINK ${String(sequence).padStart(2, "0")}`,
      color: "#ad8bd5",
      icon: PackageOpen,
      inputs: [],
      outputs: [{ id: "inventory-out", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "output" }],
    };
  }
  if (kind === "storage") {
    return {
      id,
      kind,
      title: "Storage",
      eyebrow: `STORAGE ${String(sequence).padStart(2, "0")}`,
      color: "#9c86cf",
      icon: PackageOpen,
      inputs: [{ id: "storage-in", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "input" }],
      outputs: [],
    };
  }
  if (kind === "woodenChest") {
    return {
      id,
      kind,
      title: "Wooden Chest",
      eyebrow: `CHEST ${String(sequence).padStart(2, "0")}`,
      color: RESOURCE_COLORS.WOOD,
      icon: Archive,
      inputs: [{ id: "chest-in", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "input" }],
      outputs: [{ id: "chest-out", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "output" }],
    };
  }
  if (kind === "generator") {
    return {
      id,
      kind,
      title: "Charcoal Generator",
      eyebrow: `CHARCOAL POWER ${String(sequence).padStart(2, "0")}`,
      color: RESOURCE_COLORS.POWER,
      icon: Zap,
      inputs: [{ id: "generator-charcoal-in", label: "Charcoal", type: ResourceType.CHARCOAL, direction: "input" }],
      outputs: [{ id: "power-out", label: "Power", type: ResourceType.POWER, direction: "output" }],
    };
  }
  if (kind === "researchFoundry") {
    return {
      id,
      kind,
      title: "Research Center",
      eyebrow: `RESEARCH ${String(sequence).padStart(2, "0")}`,
      color: "#74a9e8",
      icon: FlaskConical,
      inputs: [{ id: "research-core-in", label: "All Cores", type: ResourceType.CORE, direction: "input" }],
      outputs: [],
    };
  }
  if (kind === "treePlanter") {
    return {
      id,
      kind,
      title: "Tree Planter",
      eyebrow: `REFORESTER ${String(sequence).padStart(2, "0")}`,
      color: RESOURCE_COLORS.FOREST_GROWTH,
      icon: Sprout,
      inputs: [{ id: "power-in", label: `Power · ${TREE_PLANTER_POWER_COST}W`, type: ResourceType.POWER, direction: "input" }],
      outputs: [{ id: "forest-growth-out", label: "+1 Forest / sec", type: ResourceType.FOREST_GROWTH, direction: "output" }],
    };
  }
  if (kind === "miningDrill") {
    return {
      id,
      kind,
      title: "Mining Drill",
      eyebrow: `DEEP BORE ${String(sequence).padStart(2, "0")}`,
      color: "#d6a44f",
      icon: MiningDrillIcon,
      inputs: [{ id: "motor-in", label: "Motor", type: ResourceType.MOTOR, direction: "input" }],
      outputs: [],
    };
  }
  if (kind === "merger") {
    return {
      id,
      kind,
      title: "Merger",
      eyebrow: `COMBINER ${String(sequence).padStart(2, "0")}`,
      color: "#72a9c9",
      icon: GitMerge,
      inputs: [
        { id: "merge-a-in", label: "A", type: ResourceType.ANY, direction: "input" },
        { id: "merge-b-in", label: "B", type: ResourceType.ANY, direction: "input" },
      ],
      outputs: [
        { id: "merge-out", label: PRODUCTION_PORT_LABEL, type: ResourceType.ANY, direction: "output" },
      ],
    };
  }
  if (kind === "joint") {
    return {
      id,
      kind,
      title: "Joint",
      eyebrow: `LINK ${String(sequence).padStart(2, "0")}`,
      color: "#b8a878",
      icon: Cable,
      inputs: [{ id: "joint-in", label: "In", type: ResourceType.ANY, direction: "input" }],
      outputs: [{ id: "joint-out", label: "Out", type: ResourceType.ANY, direction: "output" }],
    };
  }
  if (kind === "road") {
    return {
      id,
      kind,
      title: "Road",
      eyebrow: `MAP LINK ${String(sequence).padStart(2, "0")}`,
      color: "#b48a5a",
      icon: RoadIcon,
      inputs: [{ id: "road-in", label: "Local In", type: ResourceType.ANY, direction: "input" }],
      outputs: [{ id: "road-out", label: "Remote Out", type: ResourceType.ANY, direction: "output" }],
    };
  }
  if (kind === "powerSplitter") {
    return {
      id,
      kind,
      title: "Power Splitter",
      eyebrow: `POWER JUNCTION ${String(sequence).padStart(2, "0")}`,
      color: RESOURCE_COLORS.POWER,
      icon: Zap,
      inputs: [{ id: "power-split-in", label: "Power In", type: ResourceType.POWER, direction: "input" }],
      outputs: [
        { id: "power-split-top", label: "Power Top", type: ResourceType.POWER, direction: "output" },
        { id: "power-split-out", label: "Power Out", type: ResourceType.POWER, direction: "output" },
        { id: "power-split-bottom", label: "Power Bottom", type: ResourceType.POWER, direction: "output" },
      ],
    };
  }
  const recipe = PROCESSOR_RECIPES[kind];
  return {
    id,
    kind,
    title: recipe.title,
    eyebrow: `${recipe.eyebrow} ${String(sequence).padStart(2, "0")}`,
    color: recipe.color,
    icon: recipe.icon,
    inputs: recipe.inputs.map((input) => ({ ...input, direction: "input" as const })),
    outputs: [{ ...recipe.output, direction: "output" }],
  };
};

const getExtractorRecipe = (nodeId: NodeId, edges: Connection[]) => {
  if (!isExtractorNode(nodeId)) return null;
  const resourceEdge = edges.find(
    (connection) => connection.targetNode === nodeId && connection.targetPort === "resource-in",
  );
  return resourceEdge ? EXTRACTOR_RECIPES[resourceEdge.type] ?? null : null;
};

const getSplitterInputType = (nodeId: NodeId, edges: Connection[]) => {
  if (!isSplitterNode(nodeId)) return null;
  return edges.find(
    (connection) => connection.targetNode === nodeId && connection.targetPort === "split-in",
  )?.type ?? null;
};

const getMergerInputType = (nodeId: NodeId, edges: Connection[]) => {
  if (!isMergerNode(nodeId)) return null;
  return edges.find(
    (connection) =>
      connection.targetNode === nodeId &&
      (connection.targetPort === "merge-a-in" || connection.targetPort === "merge-b-in"),
  )?.type ?? null;
};

const getJointInputType = (nodeId: NodeId, edges: Connection[]) => {
  if (!isJointNode(nodeId)) return null;
  return edges.find(
    (connection) => connection.targetNode === nodeId && connection.targetPort === "joint-in",
  )?.type ?? null;
};

const getRoadInputType = (nodeId: NodeId, edges: Connection[]) => {
  if (!isRoadNode(nodeId)) return null;
  return edges.find(
    (connection) => connection.targetNode === nodeId && connection.targetPort === "road-in",
  )?.type ?? null;
};

const getSmartProcessorInputType = (
  nodeId: NodeId,
  edges: Connection[],
  processor?: Runtime["processors"][NodeId] | null,
) => {
  if (isFurnaceNode(nodeId)) {
    return edges.find(
      (connection) => connection.targetNode === nodeId && connection.targetPort === "metal-in",
    )?.type ?? null;
  }
  if (
    isRefinerNode(nodeId) &&
    (processor?.refinerRecipe === "gear" || processor?.refinerRecipe === "wire")
  ) {
    return edges.find(
      (connection) =>
        connection.targetNode === nodeId &&
        connection.targetPort === "refiner-in",
    )?.type ?? null;
  }
  return null;
};

const getSmartProcessorOutput = (
  nodeId: NodeId,
  inputType: ResourceType | null,
  processor?: Runtime["processors"][NodeId] | null,
): { type: InventoryItemType; label: string } | null => {
  if (isFurnaceNode(nodeId)) {
    if (inputType === ResourceType.IRON) return { type: ResourceType.IRON_PLATE, label: "Iron Plate" };
    if (inputType === ResourceType.COPPER) return { type: ResourceType.COPPER_PLATE, label: "Copper Plate" };
    if (inputType === ResourceType.MYTHRIL) return { type: ResourceType.MYTHRIL_PLATE, label: "Mythril Plate" };
  }
  if (isRefinerNode(nodeId) && processor?.refinerRecipe === "gear") {
    if (inputType === ResourceType.IRON_PLATE) return { type: ResourceType.IRON_GEAR, label: "Iron Gear" };
    if (inputType === ResourceType.COPPER_PLATE) return { type: ResourceType.COPPER_GEAR, label: "Copper Gear" };
    if (inputType === ResourceType.MYTHRIL_PLATE) return { type: ResourceType.MYTHRIL_GEAR, label: "Mythril Gear" };
  }
  if (isRefinerNode(nodeId) && processor?.refinerRecipe === "wire") {
    if (inputType === ResourceType.IRON_PLATE) return { type: ResourceType.IRON_WIRE, label: "Iron Wire" };
    if (inputType === ResourceType.COPPER_PLATE) return { type: ResourceType.COPPER_WIRE, label: "Copper Wire" };
    if (inputType === ResourceType.MYTHRIL_PLATE) return { type: ResourceType.MYTHRIL_WIRE, label: "Mythril Wire" };
  }
  return null;
};

const getConcreteSmartProcessorMaterialType = (
  nodeId: NodeId,
  materialType: ResourceType | null | undefined,
  processor?: Runtime["processors"][NodeId] | null,
) => materialType && getSmartProcessorOutput(nodeId, materialType, processor)
  ? materialType
  : null;

const getConnectedSmartProcessorMaterialType = (
  nodeId: NodeId,
  edges: Connection[],
  processor?: Runtime["processors"][NodeId] | null,
) => {
  const typingPortIds = isFurnaceNode(nodeId)
    ? new Set(["metal-in"])
    : isRefinerNode(nodeId) && (
      processor?.refinerRecipe === "gear" || processor?.refinerRecipe === "wire"
    )
      ? new Set(["refiner-in"])
      : null;
  if (!typingPortIds) return null;

  return edges
    .filter(
      (connection) =>
        connection.targetNode === nodeId && typingPortIds.has(connection.targetPort),
    )
    .map((connection) => connection.type)
    .find((materialType) => getSmartProcessorOutput(nodeId, materialType, processor)) ?? null;
};

const getEffectiveSmartProcessorMaterialType = (
  nodeId: NodeId,
  processor: Runtime["processors"][NodeId] | undefined,
  edges: Connection[],
) => {
  const connectedMaterialType = getConnectedSmartProcessorMaterialType(nodeId, edges, processor);
  const processorMaterialType = getConcreteSmartProcessorMaterialType(
    nodeId,
    processor?.materialType,
    processor,
  );
  const processorHasActiveWork = Boolean(
    processor && (
      getProcessorStored(processor) > 0 ||
      processor.progress > 0 ||
      Object.values(processor.inputs).some((amount) => amount > 0)
    ),
  );
  return processorHasActiveWork
    ? processorMaterialType ?? connectedMaterialType
    : connectedMaterialType ?? processorMaterialType;
};

const hasSmartProcessorMaterialLock = (
  nodeId: NodeId,
  processor: Runtime["processors"][NodeId] | undefined,
  recipe: (typeof PROCESSOR_RECIPES)[ProcessorKind],
) => Boolean(
  processor && (
    getProcessorStored(processor) > 0 ||
    processor.progress > 0 ||
    recipe.inputs.some(
      (input) =>
        isSmartProcessorTypingPort(nodeId, input.id, processor) &&
        (processor.inputs[input.id] ?? 0) > 0,
    )
  )
);

type StoredItemBucket = "storage" | "chest" | "production" | "buffer";
type StoredItemLocation = {
  nodeId: NodeId;
  nodeTitle: string;
  detail: string;
  bucket: StoredItemBucket;
  amount: number;
};
type InventoryStorageBreakdown = {
  nodeCount: number;
  nodeCapacity: number;
};

type BuildMaterialAvailability = Record<InventoryItemType, {
  storage: number;
  chests: number;
  production: number;
  buffers: number;
  total: number;
}>;

type CompletedProductionBuffer = {
  node: NodeSpec;
  type: InventoryItemType;
  amount: number;
};

const getCompletedProductionBuffers = (
  runtime: Runtime,
  nodes: NodeSpec[],
  edges: Connection[],
): CompletedProductionBuffer[] =>
  nodes.flatMap((node) => {
    if (!isExtractorKind(node.kind) && !isProcessorKind(node.kind)) return [];
    const type = getCompletedMachineOutputType(node, runtime, edges);
    if (!type) return [];
    const amount = isExtractorKind(node.kind)
      ? runtime.extractors[node.id]?.stored ?? 0
      : getProcessorStored(runtime.processors[node.id]);
    return amount > 0 ? [{ node, type, amount }] : [];
  });

const getProcessorInputItemType = (
  node: NodeSpec,
  portId: string,
  processor: Runtime["processors"][NodeId],
): InventoryItemType | null => {
  if (!isProcessorKind(node.kind)) return null;
  const input = getProcessorRecipe(node.kind, processor)?.inputs.find(
    (candidate) => candidate.id === portId,
  );
  if (!input) return null;
  if (isInventoryItemType(input.type)) return input.type;
  const selectedType = processor.materialType;
  return selectedType && isInventoryItemType(selectedType) ? selectedType : null;
};

const getStoredItemLocations = (
  runtime: Runtime,
  nodes: NodeSpec[],
  edges: Connection[],
  type: InventoryItemType,
): StoredItemLocation[] => {
  const nodeById = new Map(nodes.map((node) => [node.id, node] as const));
  const locations: StoredItemLocation[] = [];
  const baseInventoryAmount = runtime.inventory?.[type] ?? 0;
  if (baseInventoryAmount > 0) {
    locations.push({
      nodeId: BASE_INVENTORY_NODE_ID,
      nodeTitle: "Base Inventory",
      detail: `Personal storage · ${baseInventoryAmount} / ${BASE_INVENTORY_CAPACITY}`,
      bucket: "storage",
      amount: baseInventoryAmount,
    });
  }
  const add = (
    nodeId: NodeId,
    amount: number,
    bucket: StoredItemBucket,
    detail: string,
  ) => {
    if (amount <= 0) return;
    const node = nodeById.get(nodeId);
    if (!node) return;
    locations.push({
      nodeId,
      nodeTitle: `${node.title} · ${node.eyebrow}`,
      detail,
      bucket,
      amount,
    });
  };

  Object.entries(runtime.storages ?? {}).forEach(([nodeId, storage]) => {
    add(nodeId, storage.items?.[type] ?? 0, "storage", "Dedicated storage");
  });
  Object.entries(runtime.woodenChests ?? {}).forEach(([nodeId, chest]) => {
    if (chest.itemType === type) add(nodeId, chest.stored, "chest", "Wooden Chest");
  });
  getCompletedProductionBuffers(runtime, nodes, edges).forEach(({ node, type: outputType, amount }) => {
    if (outputType === type) add(node.id, amount, "production", "Completed output");
  });

  nodes.forEach((node) => {
    if (isProcessorKind(node.kind)) {
      const processorKind = node.kind;
      const processor = runtime.processors[node.id];
      if (!processor) return;
      Object.entries(processor.inputs ?? {}).forEach(([portId, amount]) => {
        if (getProcessorInputItemType(node, portId, processor) === type) {
          const label = getProcessorRecipe(processorKind, processor)?.inputs.find(
            (input) => input.id === portId,
          )?.label;
          add(node.id, amount, "buffer", label ? `${label} input` : "Ingredient input");
        }
      });
      return;
    }
    if (node.kind === "generator" && type === ResourceType.CHARCOAL) {
      add(node.id, runtime.generators[node.id]?.charcoal ?? 0, "buffer", "Fuel input");
      return;
    }
    if (node.kind === "researchFoundry" && isCoreType(type)) {
      add(
        node.id,
        getResearchFoundryCoreCount(runtime.researchFoundries[node.id], type),
        "buffer",
        "Research input",
      );
      return;
    }
    if (node.kind === "joint" && runtime.joints[node.id]?.bufferedType === type) {
      add(node.id, 1, "buffer", "Routing buffer");
      return;
    }
    if (node.kind === "road") {
      const road = runtime.roads[node.id];
      if (road?.outboundType === type) add(node.id, 1, "buffer", "Outbound Road transfer");
      if (road?.inboundType === type) add(node.id, 1, "buffer", "Inbound Road transfer");
      return;
    }
    if (node.kind === "filter" && runtime.filters[node.id]?.bufferedType === type) {
      add(node.id, 1, "buffer", "Filter buffer");
    }
  });

  return locations;
};

const getStoredItemAmount = (
  runtime: Runtime,
  nodes: NodeSpec[],
  edges: Connection[],
  type: InventoryItemType,
  excludedNodeIds: ReadonlySet<NodeId> = new Set(),
) => getStoredItemLocations(runtime, nodes, edges, type)
  .filter((location) => !excludedNodeIds.has(location.nodeId))
  .reduce((total, location) => total + location.amount, 0);

const cloneStoredMaterialRuntime = (runtime: Runtime): Runtime => ({
  ...runtime,
  inventoryCapacity: BASE_INVENTORY_CAPACITY,
  inventory: normalizeItemStore(runtime.inventory, BASE_INVENTORY_CAPACITY),
  produced: { ...makeEmptyItemStore(), ...(runtime.produced ?? {}) },
  extractorProduced: { ...makeEmptyItemStore(), ...(runtime.extractorProduced ?? {}) },
  blackHoles: Object.fromEntries(
    Object.entries(runtime.blackHoles ?? {}).map(([id, hole]) => [id, {
      ...hole,
      shape: [...hole.shape],
    }]),
  ),
  lakes: Object.fromEntries(
    Object.entries(runtime.lakes ?? {}).map(([id, lake]) => [id, {
      ...lake,
      shape: [...lake.shape],
    }]),
  ),
  storages: Object.fromEntries(
    Object.entries(runtime.storages ?? {}).map(([nodeId, storage]) => [
      nodeId,
      { ...storage, items: { ...makeEmptyItemStore(), ...(storage.items ?? {}) } },
    ]),
  ),
  woodenChests: Object.fromEntries(
    Object.entries(runtime.woodenChests ?? {}).map(([nodeId, chest]) => [nodeId, { ...chest }]),
  ),
  extractors: Object.fromEntries(
    Object.entries(runtime.extractors).map(([nodeId, extractor]) => [nodeId, { ...extractor }]),
  ),
  processors: Object.fromEntries(
    Object.entries(runtime.processors).map(([nodeId, processor]) => [
      nodeId,
      { ...processor, inputs: { ...processor.inputs } },
    ]),
  ),
  generators: Object.fromEntries(
    Object.entries(runtime.generators ?? {}).map(([nodeId, generator]) => [nodeId, { ...generator }]),
  ),
  researchFoundries: Object.fromEntries(
    Object.entries(runtime.researchFoundries ?? {}).map(([nodeId, foundry]) => [nodeId, {
      ...foundry,
      coreItems: [...getResearchFoundryCoreItems(foundry)],
    }]),
  ),
  splitters: Object.fromEntries(
    Object.entries(runtime.splitters ?? {}).map(([nodeId, splitter]) => [
      nodeId,
      { nextOutput: splitter.nextOutput === "b" ? "b" as const : "a" as const },
    ]),
  ),
  joints: Object.fromEntries(
    Object.entries(runtime.joints ?? {}).map(([nodeId, joint]) => [nodeId, {
      ...joint,
      orientation: joint.orientation === "vertical" ? "vertical" as const : "horizontal" as const,
    }]),
  ),
  roads: Object.fromEntries(
    Object.entries(runtime.roads ?? {}).map(([nodeId, road]) => [
      nodeId,
      makeRoadRuntimeState(road, nodeId),
    ]),
  ),
  filters: Object.fromEntries(
    Object.entries(runtime.filters ?? {}).map(([nodeId, filter]) => [nodeId, { ...filter }]),
  ),
});

const consumeStoredMaterialInPlace = (
  runtime: Runtime,
  nodes: NodeSpec[],
  edges: Connection[],
  type: InventoryItemType,
  requestedAmount: number,
  excludedNodeIds: ReadonlySet<NodeId> = new Set(),
) => {
  let remaining = Math.max(0, requestedAmount);
  const take = (available: number, apply: (amount: number) => void) => {
    if (remaining <= 0 || available <= 0) return;
    const amount = Math.min(available, remaining);
    apply(amount);
    remaining -= amount;
  };

  runtime.inventoryCapacity = BASE_INVENTORY_CAPACITY;
  runtime.inventory = normalizeItemStore(runtime.inventory, BASE_INVENTORY_CAPACITY);
  take(runtime.inventory[type] ?? 0, (amount) => { runtime.inventory[type] -= amount; });

  Object.entries(runtime.storages ?? {}).forEach(([nodeId, storage]) => {
    if (excludedNodeIds.has(nodeId)) return;
    take(storage.items[type] ?? 0, (amount) => { storage.items[type] -= amount; });
  });
  Object.entries(runtime.woodenChests ?? {}).forEach(([nodeId, chest]) => {
    if (excludedNodeIds.has(nodeId) || chest.itemType !== type) return;
    take(chest.stored, (amount) => { chest.stored -= amount; });
  });

  nodes.forEach((node) => {
    if (remaining <= 0 || excludedNodeIds.has(node.id)) return;
    if (isExtractorKind(node.kind)) {
      const extractor = runtime.extractors[node.id];
      const outputType = extractor?.materialType ?? getExtractorRecipe(node.id, edges)?.product ?? null;
      if (extractor && outputType === type) {
        take(extractor.stored, (amount) => {
          extractor.stored -= amount;
          extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
        });
      }
      return;
    }
    if (isProcessorKind(node.kind)) {
      const processor = runtime.processors[node.id];
      if (!processor) return;
      const outputType = getCompletedMachineOutputType(node, runtime, edges);
      if (outputType === type) {
        take(getProcessorStored(processor), (amount) => {
          processor.stored = getProcessorStored(processor) - amount;
          processor.full = processor.stored >= PROCESSOR_CAPACITY;
        });
      }
      Object.entries(processor.inputs ?? {}).forEach(([portId, amount]) => {
        if (getProcessorInputItemType(node, portId, processor) !== type) return;
        take(amount, (consumed) => { processor.inputs[portId] -= consumed; });
      });
      return;
    }
    if (node.kind === "generator" && type === ResourceType.CHARCOAL) {
      const generator = runtime.generators[node.id];
      if (generator) take(generator.charcoal, (amount) => { generator.charcoal -= amount; });
      return;
    }
    if (node.kind === "researchFoundry" && isCoreType(type)) {
      const foundry = runtime.researchFoundries[node.id];
      if (foundry) {
        take(getResearchFoundryCoreCount(foundry, type), (amount) => {
          let remainingToRemove = amount;
          const nextCoreItems = getResearchFoundryCoreItems(foundry).filter((coreType) => {
            if (coreType !== type || remainingToRemove <= 0) return true;
            remainingToRemove -= 1;
            return false;
          });
          foundry.coreItems = nextCoreItems;
          foundry.cores = nextCoreItems.length;
        });
      }
      return;
    }
    if (node.kind === "joint") {
      const joint = runtime.joints[node.id];
      if (joint?.bufferedType === type) take(1, () => { joint.bufferedType = null; });
      return;
    }
    if (node.kind === "road") {
      const road = runtime.roads[node.id];
      if (road?.outboundType === type) take(1, () => { road.outboundType = null; });
      if (road?.inboundType === type) take(1, () => { road.inboundType = null; });
      return;
    }
    if (node.kind === "filter") {
      const filter = runtime.filters[node.id];
      if (filter?.bufferedType === type) take(1, () => { filter.bufferedType = null; });
    }
  });

  return requestedAmount - remaining;
};

const depositMaterialIntoStorageInPlace = (
  runtime: Runtime,
  nodes: NodeSpec[],
  type: InventoryItemType,
  requestedAmount: number,
  excludedNodeIds: ReadonlySet<NodeId> = new Set(),
) => {
  let remaining = Math.max(0, requestedAmount);
  const deposit = (space: number, apply: (amount: number) => void) => {
    if (remaining <= 0 || space <= 0) return;
    const amount = Math.min(space, remaining);
    apply(amount);
    remaining -= amount;
  };

  runtime.inventoryCapacity = BASE_INVENTORY_CAPACITY;
  runtime.inventory = normalizeItemStore(runtime.inventory, BASE_INVENTORY_CAPACITY);
  deposit(BASE_INVENTORY_CAPACITY - (runtime.inventory[type] ?? 0), (amount) => {
    runtime.inventory[type] = (runtime.inventory[type] ?? 0) + amount;
  });

  nodes.forEach((node) => {
    if (remaining <= 0 || excludedNodeIds.has(node.id) || node.kind !== "storage") return;
    const construction = runtime.construction[node.id];
    if (construction && !construction.complete) return;
    const storage = runtime.storages[node.id];
    if (!storage) return;
    deposit(storage.capacityPerItem - (storage.items[type] ?? 0), (amount) => {
      storage.items[type] = (storage.items[type] ?? 0) + amount;
    });
  });
  nodes.forEach((node) => {
    if (remaining <= 0 || excludedNodeIds.has(node.id) || node.kind !== "woodenChest") return;
    const construction = runtime.construction[node.id];
    if (construction && !construction.complete) return;
    const chest = runtime.woodenChests[node.id];
    if (!chest || (chest.itemType && chest.itemType !== type)) return;
    deposit(WOODEN_CHEST_CAPACITY - chest.stored, (amount) => {
      chest.itemType = type;
      chest.stored += amount;
    });
  });
  return requestedAmount - remaining;
};

const getBuildMaterialAvailability = (
  runtime: Runtime,
  nodes: NodeSpec[],
  edges: Connection[],
): BuildMaterialAvailability => {
  const availability = Object.fromEntries(
    INVENTORY_ITEMS.map(({ type }) => [
      type,
      { storage: 0, chests: 0, production: 0, buffers: 0, total: 0 },
    ]),
  ) as BuildMaterialAvailability;

  INVENTORY_ITEMS.forEach(({ type }) => {
    getStoredItemLocations(runtime, nodes, edges, type).forEach(({ bucket, amount }) => {
      if (bucket === "storage") availability[type].storage += amount;
      else if (bucket === "chest") availability[type].chests += amount;
      else if (bucket === "production") availability[type].production += amount;
      else availability[type].buffers += amount;
      availability[type].total += amount;
    });
  });

  return availability;
};

type GlobalBuildPayment = {
  activeRuntime: Runtime;
  mapFactories: MapFactoriesBySector;
  previousFactoryRuntimes: Record<string, Runtime>;
};

const getMapFactoryNodes = (factory: MapFactoryState) => factory.nodes
  .filter((node) => isNodeKind(node.kind))
  .map((node) => hydrateNode(node as SerializedNode));

const hasNodeKindAcrossMaps = (
  kind: NodeKind,
  activeNodes: NodeSpec[],
  activeSector: string,
  mapFactories: MapFactoriesBySector,
) => activeNodes.some((node) => node.kind === kind) ||
  Object.entries(mapFactories).some(([sectorKey, factory]) =>
    sectorKey !== activeSector && factory.nodes.some((node) => node.kind === kind)
  );

const addBuildMaterialAvailability = (
  target: BuildMaterialAvailability,
  source: BuildMaterialAvailability,
) => {
  INVENTORY_ITEMS.forEach(({ type }) => {
    target[type].storage += source[type].storage;
    target[type].chests += source[type].chests;
    target[type].production += source[type].production;
    target[type].buffers += source[type].buffers;
    target[type].total += source[type].total;
  });
};

const applyResearchProjectCompletion = (
  runtime: Runtime,
  projectId: ResearchProjectId,
) => {
  if (projectId === "logistics") {
    runtime.research.logisticsUnlocked = true;
  } else if (projectId === "kiln") {
    runtime.research.kilnUnlocked = true;
  } else if (projectId === "charcoalGenerator") {
    runtime.research.charcoalGeneratorUnlocked = true;
  } else if (projectId === "furnace") {
    runtime.research.furnaceUnlocked = true;
  } else if (projectId === "refiner") {
    runtime.research.refinerUnlocked = true;
  } else if (projectId === "assembler") {
    runtime.research.assemblerUnlocked = true;
  } else if (projectId === "researchCenter") {
    runtime.research.researchCenterUnlocked = true;
  } else if (projectId === "road") {
    runtime.research.roadUnlocked = true;
  } else if (projectId === "areaExpansion1") {
    runtime.research.areaExpansion1Unlocked = true;
    runtime.research.areaExpansionLevel = Math.max(
      1,
      getAreaExpansionLevel(runtime.research),
    );
  } else if (projectId === "extractor2") {
    runtime.research.extractor2Unlocked = true;
  } else if (projectId === "extractor3") {
    runtime.research.extractor3Unlocked = true;
  } else if (projectId === "treePlanter") {
    runtime.research.treePlanterUnlocked = true;
  } else if (projectId === "miningDrill") {
    runtime.research.miningDrillUnlocked = true;
  } else if (projectId === "mapNode") {
    runtime.mapPoints = Math.max(0, runtime.mapPoints) + 1;
    runtime.research.mapNodeResearchCompletions = Math.max(
      0,
      runtime.research.mapNodeResearchCompletions,
    ) + 1;
    runtime.research.progress.mapNode = 0;
  } else if (projectId === "automataCore") {
    runtime.research.automataCoreUnlocked = true;
  } else {
    if (!runtime.research.explorationUnlocked) {
      runtime.mapPoints = Math.max(0, runtime.mapPoints) + 1;
    }
    runtime.research.explorationUnlocked = true;
  }
  runtime.research.activeProject = null;
};

const getGlobalBuildMaterialAvailability = (
  activeRuntime: Runtime,
  activeNodes: NodeSpec[],
  activeEdges: Connection[],
  activeSector: string,
  mapFactories: MapFactoriesBySector,
  mapNodeProgress: MapNodeProgressBySector,
): BuildMaterialAvailability => {
  const availability = getBuildMaterialAvailability(activeRuntime, activeNodes, activeEdges);
  Object.entries(mapFactories).forEach(([sectorKey, factory]) => {
    if (
      sectorKey === activeSector ||
      !isMapNodeUnlocked(mapNodeProgress, sectorKey)
    ) return;
    addBuildMaterialAvailability(
      availability,
      getBuildMaterialAvailability(
        factory.runtime,
        getMapFactoryNodes(factory),
        factory.connections,
      ),
    );
  });
  return availability;
};

const consumeGlobalBuildIngredients = (
  activeRuntime: Runtime,
  recipe: BuildIngredient[],
  activeNodes: NodeSpec[],
  activeEdges: Connection[],
  activeSector: string,
  mapFactories: MapFactoriesBySector,
  mapNodeProgress: MapNodeProgressBySector,
): GlobalBuildPayment | null => {
  const availability = getGlobalBuildMaterialAvailability(
    activeRuntime,
    activeNodes,
    activeEdges,
    activeSector,
    mapFactories,
    mapNodeProgress,
  );
  if (recipe.some((ingredient) => availability[ingredient.type].total < ingredient.amount)) {
    return null;
  }

  const nextActiveRuntime = cloneStoredMaterialRuntime(activeRuntime);
  const nextMapFactories = { ...mapFactories };
  const previousFactoryRuntimes: Record<string, Runtime> = {};
  const inactiveSectors = Object.keys(mapFactories)
    .filter((sectorKey) =>
      sectorKey !== activeSector && isMapNodeUnlocked(mapNodeProgress, sectorKey)
    )
    .sort();
  recipe.forEach((ingredient) => {
    let remaining = ingredient.amount;
    remaining -= consumeStoredMaterialInPlace(
      nextActiveRuntime,
      activeNodes,
      activeEdges,
      ingredient.type,
      remaining,
    );
    for (const sectorKey of inactiveSectors) {
      if (remaining <= 0) break;
      const factory = nextMapFactories[sectorKey];
      if (!factory) continue;
      const factoryNodes = getMapFactoryNodes(factory);
      if (
        getBuildMaterialAvailability(
          factory.runtime,
          factoryNodes,
          factory.connections,
        )[ingredient.type].total <= 0
      ) continue;
      if (!previousFactoryRuntimes[sectorKey]) {
        previousFactoryRuntimes[sectorKey] = cloneStoredMaterialRuntime(factory.runtime);
        nextMapFactories[sectorKey] = {
          ...factory,
          runtime: cloneStoredMaterialRuntime(factory.runtime),
        };
      }
      const nextFactory = nextMapFactories[sectorKey];
      remaining -= consumeStoredMaterialInPlace(
        nextFactory.runtime,
        factoryNodes,
        nextFactory.connections,
        ingredient.type,
        remaining,
      );
    }
  });

  return {
    activeRuntime: nextActiveRuntime,
    mapFactories: nextMapFactories,
    previousFactoryRuntimes,
  };
};

const getEffectivePort = (nodeId: NodeId, port: Port, edges: Connection[]): Port => {
  if (isExtractorNode(nodeId) && port.id === "product-out") {
    const recipe = getExtractorRecipe(nodeId, edges);
    const retainedOutputType = edges.find(
      (connection) =>
        connection.sourceNode === nodeId && connection.sourcePort === port.id,
    )?.type ?? null;
    const outputType = recipe?.product ?? (
      retainedOutputType && isInventoryItemType(retainedOutputType)
        ? retainedOutputType
        : null
    );
    return outputType
      ? { ...port, label: formatResourceType(outputType), type: outputType }
      : port;
  }
  if (isSplitterNode(nodeId) && (port.id === "split-a-out" || port.id === "split-b-out")) {
    const inputType = getSplitterInputType(nodeId, edges);
    const retainedOutputType = edges.find(
      (connection) =>
        connection.sourceNode === nodeId && connection.sourcePort === port.id,
    )?.type ?? null;
    const effectiveType = inputType ?? retainedOutputType;
    const channel = port.id === "split-a-out" ? "A" : "B";
    return effectiveType
      ? { ...port, label: channel, type: effectiveType }
      : { ...port, label: channel };
  }
  if (
    isMergerNode(nodeId) &&
    (port.id === "merge-a-in" || port.id === "merge-b-in" || port.id === "merge-out")
  ) {
    const inputType = getMergerInputType(nodeId, edges);
    const retainedOutputType = port.id === "merge-out"
      ? edges.find(
          (connection) =>
            connection.sourceNode === nodeId && connection.sourcePort === port.id,
        )?.type ?? null
      : null;
    const effectiveType = inputType ?? retainedOutputType;
    if (!effectiveType) return port;
    const label = port.id === "merge-out"
      ? PRODUCTION_PORT_LABEL
      : port.id === "merge-a-in" ? "A" : "B";
    return { ...port, label, type: effectiveType };
  }
  if (isJointNode(nodeId) && (port.id === "joint-in" || port.id === "joint-out")) {
    const inputType = getJointInputType(nodeId, edges);
    const retainedOutputType = port.id === "joint-out"
      ? edges.find(
          (connection) =>
            connection.sourceNode === nodeId && connection.sourcePort === port.id,
        )?.type ?? null
      : null;
    const effectiveType = inputType ?? retainedOutputType;
    if (!effectiveType) return port;
    return {
      ...port,
      label: port.id === "joint-in" ? "In" : "Out",
      type: effectiveType,
    };
  }
  if (isRoadNode(nodeId) && (port.id === "road-in" || port.id === "road-out")) {
    const inputType = getRoadInputType(nodeId, edges);
    const retainedOutputType = port.id === "road-out"
      ? edges.find(
          (connection) =>
            connection.sourceNode === nodeId && connection.sourcePort === port.id,
        )?.type ?? null
      : null;
    const effectiveType = port.id === "road-in" ? inputType : retainedOutputType;
    if (!effectiveType) return port;
    return {
      ...port,
      label: port.id === "road-in" ? "Local In" : "Remote Out",
      type: effectiveType,
    };
  }
  if (isFurnaceNode(nodeId)) {
    const inputType = getSmartProcessorInputType(nodeId, edges);
    if (port.id === "metal-in" && inputType) {
      return { ...port, label: formatResourceType(inputType), type: inputType };
    }
    if (port.id === "plate-out") {
      const output = getSmartProcessorOutput(nodeId, inputType);
      const retainedOutputType = edges.find(
        (connection) =>
          connection.sourceNode === nodeId && connection.sourcePort === port.id,
      )?.type ?? null;
      return output
        ? { ...port, ...output }
        : retainedOutputType && isInventoryItemType(retainedOutputType)
          ? { ...port, label: formatResourceType(retainedOutputType), type: retainedOutputType }
          : port;
    }
  }
  return port;
};

type DynamicPortRuntime = Pick<Runtime, "woodenChests" | "extractors" | "processors" | "blackHoles" | "lakes" | "roads">;

const isAssemblerPortDisabled = (
  nodeId: NodeId,
  portId: string,
  runtime: DynamicPortRuntime,
) => {
  if (isRoadNode(nodeId)) {
    const mode = runtime.roads?.[nodeId]?.mode ?? "export";
    if (portId === "road-in") return mode !== "export";
    if (portId === "road-out") return mode !== "import";
  }
  const kind = isAssemblerNode(nodeId)
    ? "assembler"
    : isRefinerNode(nodeId)
      ? "refiner"
      : null;
  if (!kind) return false;
  const recipe = getProcessorRecipe(kind, runtime.processors[nodeId]);
  if (!recipe) return true;
  if (portId === recipe.output.id) return false;
  return !recipe.inputs.some((input) => input.id === portId);
};

const getRuntimeAwarePort = (
  nodeId: NodeId,
  port: Port,
  edges: Connection[],
  runtime: DynamicPortRuntime,
) => {
  if (port.id === "chest-in" || port.id === "chest-out") {
    const itemType = runtime.woodenChests?.[nodeId]?.itemType ?? null;
    if (itemType) {
      return port.id === "chest-in"
        ? { ...port, label: formatResourceType(itemType), type: itemType }
        : { ...port, type: itemType };
    }
  }
  if (isExtractorNode(nodeId) && port.id === "product-out") {
    const recipe = getExtractorRecipe(nodeId, edges);
    const extractor = runtime.extractors[nodeId];
    const outputType = extractor?.stored > 0
      ? extractor.materialType ?? recipe?.product ?? null
      : recipe?.product ?? extractor?.materialType ?? null;
    if (outputType) {
      return { ...port, label: formatResourceType(outputType), type: outputType };
    }
  }
  let runtimePort = port;
  const processor = runtime.processors[nodeId];
  const configurableKind = isAssemblerNode(nodeId)
    ? "assembler"
    : isRefinerNode(nodeId)
      ? "refiner"
      : null;
  if (configurableKind) {
    const recipe = getProcessorRecipe(configurableKind, processor);
    if (!recipe) {
      runtimePort = { ...port, label: "Choose recipe", type: ResourceType.ANY };
    } else if (port.direction === "input") {
      const input = recipe.inputs.find((candidate) => candidate.id === port.id);
      runtimePort = input
        ? { ...port, label: input.label, type: input.type }
        : { ...port, label: "Unused", type: ResourceType.ANY };
    } else if (port.id === recipe.output.id) {
      runtimePort = { ...port, label: recipe.output.label, type: recipe.output.type };
    }
  }
  const smartMaterialType = getEffectiveSmartProcessorMaterialType(
    nodeId,
    processor,
    edges,
  );
  if (
    runtimePort.direction === "input" &&
    smartMaterialType &&
    isSmartProcessorTypingPort(nodeId, runtimePort.id, processor)
  ) {
    runtimePort = {
      ...runtimePort,
      label: formatResourceType(smartMaterialType),
      type: smartMaterialType,
    };
  }
  const smartOutputPortId = getSmartProcessorOutputPortId(nodeId, processor);
  if (smartOutputPortId === runtimePort.id) {
    const output = getSmartProcessorOutput(nodeId, smartMaterialType, processor);
    if (output) return { ...runtimePort, ...output };
  }
  return getEffectivePort(nodeId, runtimePort, edges);
};

const removeConnectionsWithDependents = (
  connections: Connection[],
  shouldRemove: (connection: Connection) => boolean,
  nodes: NodeSpec[],
  runtime?: DynamicPortRuntime,
) => {
  const remaining = connections.filter((connection) => !shouldRemove(connection));
  // Removing an input can change a smart node's effective output type, but it
  // does not automatically invalidate every cable leaving that node. Re-run
  // the graph's type resolution and let each surviving route stand or fall on
  // its own compatibility (for example, a Merger may still have another typed
  // input and generic outputs can remain attached to Storage).
  return normalizeDynamicConnections(remaining, nodes, runtime);
};

const getDisconnectedMachineIds = (
  before: Connection[],
  after: Connection[],
) => {
  const remainingIds = new Set(after.map((connection) => connection.id));
  const disconnected = new Set<NodeId>();
  const nodesWithDisconnectedInputs = new Set<NodeId>();

  before.forEach((connection) => {
    if (!remainingIds.has(connection.id)) {
      nodesWithDisconnectedInputs.add(connection.targetNode);
    }
  });

  before.forEach((connection) => {
    if (remainingIds.has(connection.id)) return;

    // Rewiring an output directly to a new input keeps the producer connected,
    // so only treat the producer as disconnected when that output is now unused.
    // If this producer also lost an input during the same graph update, retain
    // its completed output in the machine instead of auto-collecting it.
    const outputStillConnected = after.some(
      (item) =>
        item.sourceNode === connection.sourceNode &&
        item.sourcePort === connection.sourcePort,
    );
    if (
      !outputStillConnected &&
      !nodesWithDisconnectedInputs.has(connection.sourceNode)
    ) {
      disconnected.add(connection.sourceNode);
    }
  });

  return disconnected;
};

const isStorageAcceptableOutputType = (type: ResourceType) =>
  isInventoryItemType(type) ||
  type === ResourceType.RESOURCE ||
  type === ResourceType.PLATE ||
  type === ResourceType.GEAR ||
  type === ResourceType.WIRE ||
  type === ResourceType.ANY;

const isCompatible = (a: Port, b: Port) => {
  if (a.direction === b.direction) return false;
  const output = a.direction === "output" ? a : b;
  const input = a.direction === "input" ? a : b;
  if (output.id === "inventory-out" && input.id !== "filter-in") return false;
  if (input.id === "storage-in") return isStorageAcceptableOutputType(output.type);
  if (input.id === "research-core-in") return isCoreType(output.type);
  if (input.id === "chest-in") {
    if (!isStorageAcceptableOutputType(output.type)) return false;
    return input.type === ResourceType.ANY ||
      output.type === input.type ||
      output.type === ResourceType.RESOURCE ||
      output.type === ResourceType.PLATE ||
      output.type === ResourceType.GEAR ||
      output.type === ResourceType.WIRE ||
      output.type === ResourceType.ANY;
  }
  if (output.type === ResourceType.POWER || input.type === ResourceType.POWER) {
    return (
      (output.type === ResourceType.POWER && input.type === ResourceType.POWER) ||
      (output.type === ResourceType.POWER && input.id === "joint-in")
    );
  }
  return (
    input.type === ResourceType.ANY ||
    output.type === input.type ||
    (input.type === ResourceType.RESOURCE &&
      (output.type === ResourceType.IRON_ORE ||
        output.type === ResourceType.IRON ||
        output.type === ResourceType.COPPER_ORE ||
        output.type === ResourceType.COPPER ||
        output.type === ResourceType.MYTHRIL ||
        output.type === ResourceType.STONE_CHUNKS ||
        output.type === ResourceType.STONE ||
        output.type === ResourceType.FOREST ||
        output.type === ResourceType.WOOD)) ||
    (input.type === ResourceType.METAL &&
      (output.type === ResourceType.IRON ||
        output.type === ResourceType.COPPER ||
        output.type === ResourceType.MYTHRIL)) ||
    (input.type === ResourceType.PLATE &&
      (output.type === ResourceType.IRON_PLATE ||
        output.type === ResourceType.COPPER_PLATE ||
        output.type === ResourceType.MYTHRIL_PLATE)) ||
    (input.type === ResourceType.GEAR &&
      (output.type === ResourceType.IRON_GEAR ||
        output.type === ResourceType.COPPER_GEAR ||
        output.type === ResourceType.MYTHRIL_GEAR))
  );
};

const getDynamicLogisticsOutputPortIds = (nodeId: NodeId, inputPortId: string) => {
  if (isSplitterNode(nodeId) && inputPortId === "split-in") {
    return ["split-a-out", "split-b-out"];
  }
  if (
    isMergerNode(nodeId) &&
    (inputPortId === "merge-a-in" || inputPortId === "merge-b-in")
  ) {
    return ["merge-out"];
  }
  if (isJointNode(nodeId) && inputPortId === "joint-in") {
    return ["joint-out"];
  }
  return [];
};

const getIncompatibleLogisticsOutputConnections = (
  nodeId: NodeId,
  inputPortId: string,
  prospectiveType: ResourceType,
  connections: Connection[],
  nodes: NodeSpec[],
  runtime?: DynamicPortRuntime,
) => {
  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));
  const incompatible = new Map<string, Connection>();
  const visited = new Set<string>();

  const inspectOutputs = (currentNodeId: NodeId, currentInputPortId: string) => {
    const visitKey = `${currentNodeId}:${currentInputPortId}:${prospectiveType}`;
    if (visited.has(visitKey)) return;
    visited.add(visitKey);
    const outputPortIds = new Set(
      getDynamicLogisticsOutputPortIds(currentNodeId, currentInputPortId),
    );
    if (!outputPortIds.size) return;

    connections.forEach((connection) => {
      if (
        connection.sourceNode !== currentNodeId ||
        !outputPortIds.has(connection.sourcePort)
      ) return;
      const sourceSpec = nodeMap[currentNodeId]?.outputs.find(
        (port) => port.id === connection.sourcePort,
      );
      const targetSpec = nodeMap[connection.targetNode]?.inputs.find(
        (port) => port.id === connection.targetPort,
      );
      if (!sourceSpec || !targetSpec) {
        incompatible.set(connection.id, connection);
        return;
      }
      const targetEdges = connections.filter((item) => item.id !== connection.id);
      const target = runtime
        ? getRuntimeAwarePort(connection.targetNode, targetSpec, targetEdges, runtime)
        : getEffectivePort(connection.targetNode, targetSpec, targetEdges);
      if (!isCompatible({ ...sourceSpec, type: prospectiveType }, target)) {
        incompatible.set(connection.id, connection);
        return;
      }

      // A smart logistics chain carries the proposed type through each idle
      // router. Validate the full chain so accepting one inlet can never prune
      // a retained cable farther downstream.
      inspectOutputs(connection.targetNode, connection.targetPort);
    });
  };

  inspectOutputs(nodeId, inputPortId);
  return Array.from(incompatible.values());
};

const MultiConnectionSocketTooltip = ({
  enabled,
  direction,
  onDisable,
  children,
}: {
  enabled: boolean;
  direction: PortDirection;
  onDisable: () => void;
  children: React.ReactElement;
}) => {
  if (!enabled) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        className="multi-connection-socket-tooltip"
        side={direction === "input" ? "left" : "right"}
        sideOffset={8}
      >
        <strong>Multi-connection connector</strong>
        <span>
          This connector can accept multiple connections at the same time.
        </span>
        <button
          type="button"
          className="multi-connection-tooltip-suppress"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onDisable}
        >
          Don&apos;t show this again
        </button>
      </TooltipContent>
    </Tooltip>
  );
};

const StarterActionHint = ({
  encouraging = false,
  targetLabel,
}: {
  encouraging?: boolean;
  targetLabel: string;
}) => (
  <span className="stone-collect-hint" aria-hidden="true">
    <span className="stone-collect-hint-ring" />
    {Array.from({ length: STONE_COLLECT_HINT_ARROW_COUNT }, (_, index) => (
      <span
        className="stone-collect-hint-arrow"
        key={`${targetLabel}-hint-arrow-${index}`}
        style={{
          "--hint-angle": `${index * (360 / STONE_COLLECT_HINT_ARROW_COUNT)}deg`,
          "--hint-delay": `${index * -90}ms`,
        } as React.CSSProperties}
      >
        ➜
      </span>
    ))}
    <span className="stone-collect-hint-message message-one">
      {encouraging ? "One more time!" : "Click here"}
    </span>
    <span className="stone-collect-hint-message message-two">
      {encouraging ? "You’ve got this!" : "Click here"}
    </span>
    <span className="stone-collect-hint-message message-three">
      {encouraging ? `Click ${targetLabel} again!` : "Click here"}
    </span>
  </span>
);

const CursorObstructionTooltip = ({
  tooltip,
  runtime,
  mapNodeValue,
}: {
  tooltip: ObstructionTooltipState;
  runtime: Runtime;
  mapNodeValue: number;
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    left: tooltip.clientX + 14,
    top: tooltip.clientY + 14,
  });

  useLayoutEffect(() => {
    const element = tooltipRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const viewportPadding = 8;
    const cursorGap = 14;
    let left = tooltip.clientX + cursorGap;
    let top = tooltip.clientY + cursorGap;
    if (left + bounds.width > window.innerWidth - viewportPadding) {
      left = tooltip.clientX - bounds.width - cursorGap;
    }
    if (top + bounds.height > window.innerHeight - viewportPadding) {
      top = tooltip.clientY - bounds.height - cursorGap;
    }
    setPosition({
      left: Math.max(viewportPadding, Math.min(left, window.innerWidth - bounds.width - viewportPadding)),
      top: Math.max(viewportPadding, Math.min(top, window.innerHeight - bounds.height - viewportPadding)),
    });
  }, [tooltip.clientX, tooltip.clientY]);

  const hole = tooltip.kind === "blackHole" ? runtime.blackHoles[tooltip.nodeId] : null;
  const lake = tooltip.kind === "lake" ? runtime.lakes[tooltip.nodeId] : null;
  if (!hole && !lake) return null;
  const requiredStone = hole ? getBlackHoleStoneRequirement(hole, mapNodeValue) : 0;

  return (
    <div
      ref={tooltipRef}
      className={`cursor-obstruction-tooltip ${hole ? "black-hole-cursor-tooltip" : "lake-obstacle-tooltip"}`}
      role="tooltip"
      style={{ left: position.left, top: position.top }}
    >
      {hole ? (
        <>
          <p>Looks deep, you should fill it in.</p>
          <small>{hole.stoneFilled}/{requiredStone} Stone</small>
        </>
      ) : (
        <>
          <strong>Lake</strong>
          <span>Output</span>
          <p>Water</p>
          <em>Wet, like water.</em>
        </>
      )}
    </div>
  );
};

const getInsertionPlan = (
  nodeId: NodeId,
  connection: Connection,
  nodeMap: Record<NodeId, NodeSpec>,
  edges: Connection[],
  runtime?: DynamicPortRuntime,
): InsertionPlan | null => {
  if (connection.sourceNode === nodeId || connection.targetNode === nodeId) return null;
  const node = nodeMap[nodeId];
  const sourceSpec = nodeMap[connection.sourceNode]?.outputs.find((port) => port.id === connection.sourcePort);
  const targetSpec = nodeMap[connection.targetNode]?.inputs.find((port) => port.id === connection.targetPort);
  if (!node) return null;
  if (!sourceSpec || !targetSpec) return null;
  const target = runtime
    ? getRuntimeAwarePort(connection.targetNode, targetSpec, edges, runtime)
    : getEffectivePort(connection.targetNode, targetSpec, edges);
  const source = { ...sourceSpec, type: connection.type };
  const compatibleInputs = node.inputs
    .filter((port) => !runtime || !isAssemblerPortDisabled(nodeId, port.id, runtime))
    .map((port) => runtime
      ? getRuntimeAwarePort(nodeId, port, edges, runtime)
      : getEffectivePort(nodeId, port, edges))
    .filter((port) => isCompatible(source, port));
  const availableInput = compatibleInputs.find(
    (port) => !edges.some(
      (edge) => edge.targetNode === nodeId && edge.targetPort === port.id,
    ),
  );
  const input = isSplitterNode(nodeId) ? availableInput : availableInput ?? compatibleInputs[0];
  const recipe = EXTRACTOR_RECIPES[connection.type];
  const mergerType = getMergerInputType(nodeId, edges);
  const processor = runtime?.processors[nodeId];
  const smartProcessorInputType = getSmartProcessorInputType(nodeId, edges, processor) ?? connection.type;
  const smartProcessorOutput = getSmartProcessorOutput(nodeId, smartProcessorInputType, processor);
  const compatibleOutputs = node.outputs
    .map((port) =>
      runtime && (isAssemblerNode(nodeId) || isRefinerNode(nodeId))
        ? getRuntimeAwarePort(nodeId, port, edges, runtime)
      : isExtractorNode(nodeId) && port.id === "product-out" && recipe
        ? { ...port, label: recipe.label, type: recipe.product }
        : isSplitterNode(nodeId) &&
            (port.id === "split-a-out" || port.id === "split-b-out")
          ? { ...port, type: connection.type }
        : isMergerNode(nodeId) && port.id === "merge-out"
          ? { ...port, type: mergerType ?? connection.type }
        : isJointNode(nodeId) && port.id === "joint-out"
          ? { ...port, type: connection.type }
        : smartProcessorOutput &&
            ((isFurnaceNode(nodeId) && port.id === "plate-out") ||
              (isRefinerNode(nodeId) && port.id === "refiner-out"))
          ? { ...port, ...smartProcessorOutput }
        : port,
    )
    .filter((port) => isCompatible(port, target));
  const output = isSplitterNode(nodeId)
    ? compatibleOutputs.find(
        (port) => !edges.some(
          (edge) => edge.sourceNode === nodeId && edge.sourcePort === port.id,
        ),
      )
    : compatibleOutputs[0];
  return input && output ? { connection, input, output } : null;
};

const normalizeDynamicConnections = (
  connections: Connection[],
  nodes: NodeSpec[],
  runtime?: DynamicPortRuntime,
) => {
  const nodeMap: Record<string, Pick<NodeSpec, "inputs" | "outputs">> = Object.fromEntries([
    ...nodes.map((node) => [node.id, node] as const),
    ...Object.keys(runtime?.blackHoles ?? {}).map((holeId) => [holeId, {
      inputs: [BLACK_HOLE_INPUT_PORT],
      outputs: [],
    }] as const),
    ...Object.keys(runtime?.lakes ?? {}).map((lakeId) => [lakeId, {
      inputs: [],
      outputs: LAKE_WATER_OUTPUT_PORTS,
    }] as const),
  ]);
  let current = connections;

  for (let pass = 0; pass < nodes.length + 2; pass += 1) {
    let changed = false;
    const desired = current.map((connection) => {
      const sourceSpec = nodeMap[connection.sourceNode]?.outputs.find(
        (port) => port.id === connection.sourcePort,
      );
      if (!sourceSpec) return connection;
      const source = runtime
        ? getRuntimeAwarePort(connection.sourceNode, sourceSpec, current, runtime)
        : getEffectivePort(connection.sourceNode, sourceSpec, current);
      return source.type === connection.type
        ? connection
        : { ...connection, type: source.type };
    });

    for (const connection of desired) {
      if (
        runtime &&
        (
          isAssemblerPortDisabled(connection.sourceNode, connection.sourcePort, runtime) ||
          isAssemblerPortDisabled(connection.targetNode, connection.targetPort, runtime)
        )
      ) {
        current = desired.filter((item) => item.id !== connection.id);
        changed = true;
        break;
      }
      const sourceSpec = nodeMap[connection.sourceNode]?.outputs.find(
        (port) => port.id === connection.sourcePort,
      );
      const targetSpec = nodeMap[connection.targetNode]?.inputs.find(
        (port) => port.id === connection.targetPort,
      );
      if (!sourceSpec || !targetSpec) {
        current = desired.filter((item) => item.id !== connection.id);
        changed = true;
        break;
      }
      const source = { ...sourceSpec, type: connection.type };
      const targetEdges = desired.filter((item) => item.id !== connection.id);
      const target = runtime
        ? getRuntimeAwarePort(connection.targetNode, targetSpec, targetEdges, runtime)
        : getEffectivePort(connection.targetNode, targetSpec, targetEdges);
      const unresolvedSmartOutput =
        getSmartProcessorOutputPortId(
          connection.sourceNode,
          runtime?.processors[connection.sourceNode],
        ) === connection.sourcePort &&
        !getConcreteSmartProcessorMaterialType(
          connection.sourceNode,
          source.type,
          runtime?.processors[connection.sourceNode],
        );
      const targetFitsUnresolvedOutputFamily = unresolvedSmartOutput && isCompatible(
        {
          id: "prospective-smart-output",
          label: target.label,
          type: target.type,
          direction: "output",
        },
        { ...sourceSpec, direction: "input" },
      );
      if (!isCompatible(source, target) && !targetFitsUnresolvedOutputFamily) {
        current = desired.filter((item) => item.id !== connection.id);
        changed = true;
        break;
      }
    }

    if (changed) continue;
    changed = desired.some(
      (connection, index) => connection.type !== current[index]?.type,
    );
    current = desired;
    if (!changed) break;
  }

  return current;
};

const BACKGROUND_SIMULATION_STEP_MS = 1000;
const MAX_BACKGROUND_CATCH_UP_MS = 60 * 60 * 1000;

const cloneRuntimeForBackgroundSimulation = (runtime: Runtime): Runtime => ({
  ...cloneStoredMaterialRuntime(runtime),
  ironOre: { ...runtime.ironOre },
  copperOre: { ...runtime.copperOre },
  stone: { ...runtime.stone },
  forest: {
    ...runtime.forest,
    regenerationElapsed: runtime.forest.regenerationElapsed ?? 0,
  },
  treePlanters: Object.fromEntries(
    Object.entries(runtime.treePlanters ?? {}).map(([nodeId, planter]) => [nodeId, { ...planter }]),
  ),
  miningDrills: Object.fromEntries(
    Object.entries(runtime.miningDrills ?? {}).map(([nodeId, drill]) => [nodeId, { ...drill }]),
  ),
  minedDeposits: Object.fromEntries(
    Object.entries(runtime.minedDeposits ?? {}).map(([nodeId, deposit]) => [nodeId, { ...deposit }]),
  ),
  research: {
    ...makeResearchState(),
    ...runtime.research,
    progress: {
      ...makeResearchState().progress,
      ...(runtime.research?.progress ?? {}),
    },
  },
  inventorySources: Object.fromEntries(
    Object.entries(runtime.inventorySources ?? {}).map(([nodeId, source]) => [nodeId, {
      ...source,
      channels: Object.fromEntries(
        Object.entries(source.channels ?? {}).map(([edgeId, channel]) => [edgeId, { ...channel }]),
      ),
    }]),
  ),
  roads: Object.fromEntries(
    Object.entries(runtime.roads ?? {}).map(([nodeId, road]) => [
      nodeId,
      makeRoadRuntimeState(road, nodeId),
    ]),
  ),
  storages: Object.fromEntries(
    Object.entries(runtime.storages ?? {}).map(([nodeId, storage]) => [nodeId, {
      ...storage,
      items: normalizeItemStore(storage.items, storage.capacityPerItem),
    }]),
  ),
  pausedOutputs: { ...(runtime.pausedOutputs ?? {}) },
  construction: Object.fromEntries(
    Object.entries(runtime.construction ?? {}).map(([nodeId, build]) => [nodeId, { ...build }]),
  ),
  produced: { ...makeEmptyItemStore(), ...(runtime.produced ?? {}) },
  extractorProduced: { ...makeEmptyItemStore(), ...(runtime.extractorProduced ?? {}) },
});

/**
 * Advances a stored map without mounting its canvas. Research selection is
 * global, so an inactive map inherits unlocks but does not independently spend
 * research cores. Its physical production and routing graph continue normally.
 */
type BackgroundSimulationRequest = {
  sectorKey: string;
  elapsedMs: number;
  sharedResearch: Runtime["research"];
  sharedMapPoints: number;
};

const advanceMapFactoryInBackground = (
  factory: MapFactoryState,
  {
    sectorKey,
    elapsedMs,
    sharedResearch,
    sharedMapPoints,
  }: BackgroundSimulationRequest,
): MapFactoryState => {
  const simulatedElapsed = Math.min(
    MAX_BACKGROUND_CATCH_UP_MS,
    Math.max(0, Number(elapsedMs) || 0),
  );
  if (simulatedElapsed <= 0) return factory;

  let simulationNodes = factory.nodes
    .filter((node) => isNodeKind(node.kind))
    .map((node) => hydrateNode(node as SerializedNode));
  const validNodeIds = new Set([
    ...simulationNodes.map((node) => node.id),
    ...Object.keys(factory.runtime.blackHoles ?? {}),
    ...Object.keys(factory.runtime.lakes ?? {}),
  ]);
  let edges = factory.connections
    .filter((edge) => validNodeIds.has(edge.sourceNode) && validNodeIds.has(edge.targetNode))
    .map((edge) => ({ ...edge }));
  const resourceCapacity = getMapNodeStartingResourceCapacity(sectorKey);
  const next = cloneRuntimeForBackgroundSimulation(factory.runtime);
  next.ironOre = normalizeBaseResourceState(next.ironOre, resourceCapacity);
  next.copperOre = normalizeBaseResourceState(next.copperOre, resourceCapacity);
  next.stone = normalizeBaseResourceState(next.stone, resourceCapacity);
  next.forest = {
    ...normalizeBaseResourceState(next.forest, resourceCapacity),
    regenerationElapsed: Math.max(0, Number(next.forest.regenerationElapsed) || 0),
  };
  next.research = {
    ...sharedResearch,
    progress: { ...sharedResearch.progress },
  };
  next.mapPoints = sharedMapPoints;

  let remainingElapsed = simulatedElapsed;
  while (remainingElapsed > 0) {
    const elapsed = Math.min(BACKGROUND_SIMULATION_STEP_MS, remainingElapsed);
    remainingElapsed -= elapsed;

    const simulationNodeById = new Map(
      simulationNodes.map((node) => [node.id, node] as const),
    );
    const incomingEdgeByPort = new Map<string, Connection>();
    const outgoingEdgesByPort = new Map<string, Connection[]>();
    const edgeById = new Map(edges.map((edge) => [edge.id, edge] as const));
    edges.forEach((edge) => {
      incomingEdgeByPort.set(`${edge.targetNode}:${edge.targetPort}`, edge);
      const key = `${edge.sourceNode}:${edge.sourcePort}`;
      const outgoing = outgoingEdgesByPort.get(key);
      if (outgoing) outgoing.push(edge);
      else outgoingEdgesByPort.set(key, [edge]);
    });

    if (next.forest.remaining >= next.forest.capacity) {
      next.forest.regenerationElapsed = 0;
    } else {
      const accumulated = next.forest.regenerationElapsed + elapsed;
      const regenerated = Math.floor(accumulated / FOREST_BASE_REGENERATION_DURATION);
      if (regenerated > 0) {
        next.forest.remaining = Math.min(
          next.forest.capacity,
          next.forest.remaining + regenerated,
        );
      }
      next.forest.regenerationElapsed = next.forest.remaining >= next.forest.capacity
        ? 0
        : accumulated % FOREST_BASE_REGENERATION_DURATION;
    }

    simulationNodes.forEach((node) => {
      const build = next.construction[node.id];
      if (!build || build.complete || !isPurchasableKind(node.kind)) return;
      build.progress = Math.min(
        100,
        build.progress + (elapsed / BUILD_TIMES[node.kind]) * 100,
      );
      if (build.progress >= 100) build.complete = true;
    });

    simulationNodes
      .filter((node) => node.kind === "generator")
      .forEach((node) => {
        const build = next.construction[node.id];
        const generator = next.generators[node.id] ?? { power: 0, charcoal: 0 };
        next.generators[node.id] = generator;
        if (build && !build.complete) return;
        while (
          generator.charcoal > 0 &&
          generator.power <= GENERATOR_MAX_POWER - POWER_PER_CHARCOAL
        ) {
          generator.charcoal -= 1;
          generator.power += POWER_PER_CHARCOAL;
        }
      });

    const deliverProduct = (
      sourceNode: NodeId,
      sourcePort: string,
      product: ResourceType,
      targetEdgeId?: string,
      visitedConnectionIds: ReadonlySet<string> = new Set(),
    ): boolean => {
      if (next.pausedOutputs[sourceNode]) return false;
      const requestedEdge = targetEdgeId ? edgeById.get(targetEdgeId) : null;
      const edge = targetEdgeId
        ? requestedEdge?.sourceNode === sourceNode && requestedEdge.sourcePort === sourcePort
          ? requestedEdge
          : null
        : outgoingEdgesByPort.get(`${sourceNode}:${sourcePort}`)?.[0];
      if (!edge || visitedConnectionIds.has(edge.id)) return false;
      const visited = new Set(visitedConnectionIds).add(edge.id);
      const targetNode = simulationNodeById.get(edge.targetNode);
      const targetBuild = next.construction[edge.targetNode];
      const targetReady = !targetBuild || targetBuild.complete;
      const targetBlackHole = next.blackHoles[edge.targetNode];
      if (
        targetBlackHole &&
        edge.targetPort === BLACK_HOLE_INPUT_PORT.id &&
        product === ResourceType.STONE
      ) {
        const requiredStone = getBlackHoleStoneRequirement(
          targetBlackHole,
          getMapNodeValue(sectorKey),
        );
        if (targetBlackHole.stoneFilled >= requiredStone) return false;
        targetBlackHole.stoneFilled = Math.min(requiredStone, targetBlackHole.stoneFilled + 1);
        return true;
      }
      if (!targetNode || !targetReady) return false;

      if (
        targetNode.kind === "generator" &&
        edge.targetPort === "generator-charcoal-in" &&
        product === ResourceType.CHARCOAL
      ) {
        const generator = next.generators[edge.targetNode] ?? { power: 0, charcoal: 0 };
        next.generators[edge.targetNode] = generator;
        if (generator.charcoal < PRODUCTION_INGREDIENT_CAPACITY) {
          generator.charcoal += 1;
          return true;
        }
      }

      if (
        targetNode.kind === "researchFoundry" &&
        edge.targetPort === "research-core-in" &&
        isCoreType(product)
      ) {
        const foundry = next.researchFoundries[edge.targetNode] ?? {
          progress: 0,
          cores: 0,
          coreItems: [],
        };
        next.researchFoundries[edge.targetNode] = foundry;
        const coreItems = getResearchFoundryCoreItems(foundry);
        if (getResearchFoundryCoreCount(foundry, product) < RESEARCH_CORE_CAPACITY_PER_TYPE) {
          foundry.coreItems = [...coreItems, product];
          foundry.cores = foundry.coreItems.length;
          foundry.coreLoaded = undefined;
          next.research.available = true;
          return true;
        }
      }

      if (
        targetNode.kind === "miningDrill" &&
        edge.targetPort === "motor-in" &&
        product === ResourceType.MOTOR
      ) {
        const drill = next.miningDrills[edge.targetNode] ?? {
          progress: 0,
          iterations: 0,
          selectedType: null,
        };
        next.miningDrills[edge.targetNode] = drill;
        if (drill.selectedType && drill.iterations < MINING_DRILL_ITERATIONS) {
          drill.progress = 0;
          drill.iterations = Math.min(MINING_DRILL_ITERATIONS, drill.iterations + 1);
          return true;
        }
      }

      if (
        targetNode.kind === "forest" &&
        edge.targetPort === "forest-growth-in" &&
        product === ResourceType.FOREST_GROWTH &&
        next.forest.remaining < next.forest.capacity
      ) {
        next.forest.remaining = Math.min(next.forest.capacity, next.forest.remaining + 1);
        return true;
      }

      if (isProcessorKind(targetNode.kind)) {
        let processor = next.processors[edge.targetNode] ?? makeProcessorState(targetNode.kind);
        next.processors[edge.targetNode] = processor;
        const recipe = getProcessorRecipe(targetNode.kind, processor);
        const requirement = recipe?.inputs.find((input) => input.id === edge.targetPort);
        if (!recipe || !requirement) return false;
        const productPort: Port = {
          id: "background-product",
          label: formatResourceType(product),
          type: product,
          direction: "output",
        };
        const requirementPort: Port = {
          id: requirement.id,
          label: requirement.label,
          type: requirement.type,
          direction: "input",
        };
        const smartDelivery = Boolean(
          getSmartProcessorOutputPortId(edge.targetNode, processor) &&
          isSmartProcessorTypingPort(edge.targetNode, edge.targetPort, processor),
        );
        const materialType = smartDelivery
          ? getConcreteSmartProcessorMaterialType(edge.targetNode, product, processor)
          : null;
        if (smartDelivery && !materialType) return false;
        if (materialType) {
          const currentType = getConcreteSmartProcessorMaterialType(
            edge.targetNode,
            processor.materialType,
            processor,
          );
          const materialLocked = hasSmartProcessorMaterialLock(
            edge.targetNode,
            processor,
            recipe,
          );
          if (!currentType || (!materialLocked && currentType !== materialType)) {
            processor = { ...processor, materialType };
            next.processors[edge.targetNode] = processor;
          }
        }
        if (
          isCompatible(productPort, requirementPort) &&
          (!smartDelivery || processor.materialType === product) &&
          (processor.inputs[requirement.id] ?? 0) < PRODUCTION_INGREDIENT_CAPACITY
        ) {
          processor.inputs[requirement.id] = (processor.inputs[requirement.id] ?? 0) + 1;
          return true;
        }
      }

      if (
        targetNode.kind === "filter" &&
        edge.targetPort === "filter-in" &&
        isInventoryItemType(product)
      ) {
        const filter = next.filters[edge.targetNode] ?? {
          selectedType: null,
          bufferedType: null,
        };
        next.filters[edge.targetNode] = filter;
        if (filter.selectedType === product && filter.bufferedType === null) {
          filter.bufferedType = product;
          return true;
        }
      }

      if (
        targetNode.kind === "road" &&
        edge.targetPort === "road-in" &&
        isInventoryItemType(product)
      ) {
        const road = next.roads[edge.targetNode];
        if (
          road?.mode === "export" &&
          road.outboundType === null &&
          road.pairedRoadId &&
          road.pairedSector
        ) {
          road.outboundType = product;
          return true;
        }
      }

      if (targetNode.kind === "splitter" && edge.targetPort === "split-in") {
        const splitter = next.splitters[edge.targetNode] ?? { nextOutput: "a" as const };
        next.splitters[edge.targetNode] = splitter;
        const preferred = splitter.nextOutput;
        const alternate = preferred === "a" ? "b" : "a";
        const deliverTo = (output: "a" | "b") => deliverProduct(
          edge.targetNode,
          output === "a" ? "split-a-out" : "split-b-out",
          product,
          undefined,
          visited,
        );
        const deliveredTo = deliverTo(preferred)
          ? preferred
          : deliverTo(alternate)
            ? alternate
            : null;
        if (deliveredTo) {
          splitter.nextOutput = deliveredTo === "a" ? "b" : "a";
          return true;
        }
      }

      if (
        targetNode.kind === "merger" &&
        (edge.targetPort === "merge-a-in" || edge.targetPort === "merge-b-in") &&
        getMergerInputType(edge.targetNode, edges) === product &&
        deliverProduct(edge.targetNode, "merge-out", product, undefined, visited)
      ) {
        return true;
      }

      if (targetNode.kind === "joint" && edge.targetPort === "joint-in") {
        const joint = next.joints[edge.targetNode] ?? {
          bufferedType: null,
          orientation: "horizontal" as const,
        };
        next.joints[edge.targetNode] = joint;
        if (joint.bufferedType === null) {
          joint.bufferedType = product;
          return true;
        }
      }

      if (
        targetNode.kind === "woodenChest" &&
        edge.targetPort === "chest-in" &&
        isInventoryItemType(product)
      ) {
        const chest = next.woodenChests[edge.targetNode] ?? { itemType: null, stored: 0 };
        next.woodenChests[edge.targetNode] = chest;
        if (chest.itemType && chest.itemType !== product) return false;
        chest.itemType ??= product;
        if (chest.stored < WOODEN_CHEST_CAPACITY) {
          chest.stored += 1;
          return true;
        }
      }

      if (targetNode.kind === "storage" && isInventoryItemType(product)) {
        const storage = next.storages[edge.targetNode];
        if (storage && (storage.items[product] ?? 0) < storage.capacityPerItem) {
          storage.items[product] = (storage.items[product] ?? 0) + 1;
          return true;
        }
      }
      return false;
    };

    Object.values(next.lakes).forEach((lake) => {
      const waterRoutes = LAKE_WATER_OUTPUT_PORTS.flatMap((port) =>
        outgoingEdgesByPort.get(`${lake.id}:${port.id}`) ?? []
      );
      const accumulated = lake.productionElapsed + elapsed;
      const waterUnits = Math.floor(accumulated / LAKE_PRODUCTION_DURATION);
      lake.productionElapsed = accumulated % LAKE_PRODUCTION_DURATION;
      for (let unit = 0; unit < waterUnits && waterRoutes.length > 0; unit += 1) {
        const startingIndex = lake.nextOutputIndex % waterRoutes.length;
        for (let attempt = 0; attempt < waterRoutes.length; attempt += 1) {
          const routeIndex = (startingIndex + attempt) % waterRoutes.length;
          const route = waterRoutes[routeIndex];
          if (
            deliverProduct(
              lake.id,
              route.sourcePort,
              ResourceType.WATER,
              route.id,
            )
          ) {
            lake.nextOutputIndex = (routeIndex + 1) % waterRoutes.length;
            next.produced[ResourceType.WATER] += 1;
            break;
          }
        }
      }
    });

    simulationNodes
      .filter((node) => node.kind === "joint")
      .forEach((node) => {
        const joint = next.joints[node.id] ?? {
          bufferedType: null,
          orientation: "horizontal" as const,
        };
        next.joints[node.id] = joint;
        if (joint.bufferedType && deliverProduct(node.id, "joint-out", joint.bufferedType)) {
          joint.bufferedType = null;
        }
      });

    simulationNodes
      .filter((node) => node.kind === "road")
      .forEach((node) => {
        const road = next.roads[node.id];
        if (
          road?.mode === "import" &&
          road.inboundType &&
          deliverProduct(node.id, "road-out", road.inboundType)
        ) {
          road.inboundType = null;
        }
      });

    simulationNodes
      .filter((node) => node.kind === "filter")
      .forEach((node) => {
        const filter = next.filters[node.id] ?? { selectedType: null, bufferedType: null };
        next.filters[node.id] = filter;
        if (
          filter.bufferedType &&
          filter.bufferedType === filter.selectedType &&
          deliverProduct(node.id, "filter-out", filter.bufferedType)
        ) {
          filter.bufferedType = null;
        }
      });

    simulationNodes
      .filter((node) => node.kind === "woodenChest")
      .forEach((node) => {
        const chest = next.woodenChests[node.id];
        if (
          chest?.itemType &&
          chest.stored > 0 &&
          deliverProduct(node.id, "chest-out", chest.itemType)
        ) {
          chest.stored -= 1;
        }
      });

    simulationNodes
      .filter((node) => isExtractorKind(node.kind))
      .forEach((node) => {
        const build = next.construction[node.id];
        if (build && !build.complete) return;
        const resourceEdge = incomingEdgeByPort.get(`${node.id}:resource-in`);
        const recipe = resourceEdge ? EXTRACTOR_RECIPES[resourceEdge.type] : null;
        const extractor = next.extractors[node.id] ?? {
          progress: 0,
          stored: 0,
          full: false,
          materialType: null,
        };
        next.extractors[node.id] = extractor;
        const bufferedType = extractor.stored > 0
          ? extractor.materialType ?? recipe?.product ?? null
          : null;
        if (bufferedType && deliverProduct(node.id, "product-out", bufferedType)) {
          extractor.stored = Math.max(0, extractor.stored - 1);
        }
        extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
        if (!recipe || !resourceEdge) {
          extractor.progress = 0;
          return;
        }
        if (
          extractor.stored > 0 &&
          extractor.materialType &&
          extractor.materialType !== recipe.product
        ) {
          extractor.progress = 0;
          return;
        }
        if (extractor.stored === 0) extractor.materialType = recipe.product;
        const sourceAvailable = getResourceRemaining(
          next,
          resourceEdge.sourceNode,
          resourceEdge.type,
          edges,
        ) > 0;
        if (!sourceAvailable) {
          extractor.progress = 0;
          return;
        }
        if (extractor.stored >= EXTRACTOR_CAPACITY) return;
        const duration = recipe.duration * getExtractorResearchCycleMultiplier(next.research);
        extractor.progress = Math.min(100, extractor.progress + (elapsed / duration) * 100);
        if (extractor.progress >= 100) {
          extractor.progress = 0;
          extractor.stored = Math.min(EXTRACTOR_CAPACITY, extractor.stored + 1);
          extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
          extractor.materialType = recipe.product;
          next.produced[recipe.product] = (next.produced[recipe.product] ?? 0) + 1;
          next.extractorProduced[recipe.product] =
            (next.extractorProduced[recipe.product] ?? 0) + 1;
          consumeResource(next, resourceEdge.sourceNode, resourceEdge.type, edges);
        }
      });

    simulationNodes
      .filter((node) => isProcessorKind(node.kind))
      .forEach((node) => {
        if (!isProcessorKind(node.kind)) return;
        const build = next.construction[node.id];
        if (build && !build.complete) return;
        const processor = next.processors[node.id] ?? makeProcessorState(node.kind);
        next.processors[node.id] = processor;
        const recipe = getProcessorRecipe(node.kind, processor);
        if (!recipe) {
          processor.progress = 0;
          return;
        }
        const materialType = getEffectiveSmartProcessorMaterialType(node.id, processor, edges);
        const dynamicOutput = getSmartProcessorOutput(node.id, materialType, processor);
        const output = dynamicOutput ?? (
          isInventoryItemType(recipe.output.type)
            ? { type: recipe.output.type, label: recipe.output.label }
            : null
        );
        if (!output) {
          processor.progress = 0;
          return;
        }
        if (processor.stored > 0 && deliverProduct(node.id, recipe.output.id, output.type)) {
          processor.stored -= 1;
        }
        processor.full = processor.stored >= PROCESSOR_CAPACITY;
        if (processor.full) return;
        const hasInputs = recipe.inputs.every(
          (input) => (processor.inputs[input.id] ?? 0) >= input.amount,
        );
        if (!hasInputs) {
          processor.progress = 0;
          return;
        }
        processor.progress = Math.min(100, processor.progress + (elapsed / recipe.duration) * 100);
        if (processor.progress >= 100) {
          processor.progress = 0;
          processor.stored = Math.min(PROCESSOR_CAPACITY, processor.stored + 1);
          processor.full = processor.stored >= PROCESSOR_CAPACITY;
          next.produced[output.type] = (next.produced[output.type] ?? 0) + 1;
          recipe.inputs.forEach((input) => {
            processor.inputs[input.id] = Math.max(
              0,
              (processor.inputs[input.id] ?? 0) - input.amount,
            );
          });
        }
      });

    simulationNodes
      .filter((node) => node.kind === "researchFoundry")
      .forEach((node) => {
        const construction = next.construction[node.id];
        const foundry = next.researchFoundries[node.id] ?? {
          progress: 0,
          cores: 0,
          coreItems: [],
        };
        next.researchFoundries[node.id] = foundry;
        const coreItems = getResearchFoundryCoreItems(foundry);
        foundry.coreItems = coreItems;
        foundry.cores = coreItems.length;

        if (construction && !construction.complete) {
          foundry.progress = 0;
          foundry.cores = 0;
          foundry.coreItems = [];
          return;
        }

        next.research.available = true;
        const activeProject = next.research.activeProject;
        if (!activeProject || isResearchProjectUnlocked(next.research, activeProject)) {
          foundry.progress = 0;
          return;
        }
        const activeProjectProgress = next.research.progress[activeProject];
        if (getResearchFoundryProjectCoreCount(
          foundry,
          activeProject,
          activeProjectProgress,
          next.research,
        ) <= 0) {
          foundry.progress = 0;
          return;
        }

        foundry.progress = Math.min(
          100,
          foundry.progress + (elapsed / RESEARCH_CYCLE_DURATION) * 100,
        );
        if (foundry.progress < 100) return;

        foundry.progress = 0;
        const requiredCoreType = getResearchProjectRequiredCoreType(
          activeProject,
          activeProjectProgress,
          next.research,
        );
        const consumedCoreIndex = requiredCoreType
          ? coreItems.findIndex((coreType) => coreType === requiredCoreType)
          : 0;
        if (consumedCoreIndex < 0) return;
        const remainingCoreItems = coreItems.filter((_, index) => index !== consumedCoreIndex);
        foundry.coreItems = remainingCoreItems;
        foundry.cores = remainingCoreItems.length;
        const projectCost = getResearchProjectCost(activeProject, next.research);
        next.research.progress[activeProject] = Math.min(
          projectCost,
          next.research.progress[activeProject] + 1,
        );
        if (next.research.progress[activeProject] >= projectCost) {
          applyResearchProjectCompletion(next, activeProject);
          announceResearchCompletion(activeProject);
        }
      });

    simulationNodes
      .filter((node) => node.kind === "treePlanter")
      .forEach((node) => {
        const build = next.construction[node.id];
        if (build && !build.complete) return;
        const planter = next.treePlanters[node.id] ?? { progress: 0 };
        next.treePlanters[node.id] = planter;
        const powerEdge = incomingEdgeByPort.get(`${node.id}:power-in`);
        const outputEdge = outgoingEdgesByPort.get(`${node.id}:forest-growth-out`)?.[0];
        const generatorId = powerEdge
          ? findPowerGeneratorId(powerEdge.sourceNode, edges, next.generators, next.pausedOutputs)
          : null;
        const generator = generatorId ? next.generators[generatorId] : null;
        if (
          !powerEdge ||
          !outputEdge ||
          !generator ||
          generator.power < TREE_PLANTER_POWER_COST ||
          next.forest.remaining >= next.forest.capacity
        ) {
          planter.progress = 0;
          return;
        }
        planter.progress = Math.min(
          100,
          planter.progress + (elapsed / TREE_PLANTER_CYCLE_DURATION) * 100,
        );
        if (
          planter.progress >= 100 &&
          deliverProduct(node.id, "forest-growth-out", ResourceType.FOREST_GROWTH)
        ) {
          planter.progress = 0;
          generator.power -= TREE_PLANTER_POWER_COST;
        }
      });

    const completedDrills = simulationNodes.flatMap((node) => {
      if (node.kind !== "miningDrill") return [];
      const drill = next.miningDrills[node.id];
      return drill?.selectedType && drill.iterations >= MINING_DRILL_ITERATIONS
        ? [{ nodeId: node.id, type: drill.selectedType }]
        : [];
    });
    if (completedDrills.length > 0) {
      const completedIds = new Set(completedDrills.map(({ nodeId }) => nodeId));
      simulationNodes = simulationNodes.map((node) => {
        const completion = completedDrills.find(({ nodeId }) => nodeId === node.id);
        return completion ? createMinedDepositNode(node.id, completion.type) : node;
      });
      edges = edges.filter((edge) => !completedIds.has(edge.targetNode));
      completedDrills.forEach(({ nodeId, type }) => {
        next.minedDeposits[nodeId] = {
          type,
          remaining: MINED_DEPOSIT_CAPACITY,
          capacity: MINED_DEPOSIT_CAPACITY,
        };
        delete next.miningDrills[nodeId];
        delete next.construction[nodeId];
      });
    }
  }

  const collapsed = collapseDepletedResourceNodes(
    simulationNodes,
    factory.positions,
    edges,
    next,
  );
  simulationNodes = collapsed.nodes;
  edges = collapsed.connections;
  const normalizedEdges = normalizeDynamicConnections(edges, simulationNodes, next);
  return {
    ...factory,
    nodes: simulationNodes.map(serializeNode),
    positions: collapsed.positions,
    connections: normalizedEdges,
    runtime: next,
    lastSimulatedAt: factory.lastSimulatedAt + simulatedElapsed,
  };
};

const transferRoadItemsAcrossMaps = (
  activeSector: string,
  activeRuntime: Runtime,
  mapFactories: MapFactoriesBySector,
  mapNodeProgress: MapNodeProgressBySector,
) => {
  let nextActiveRuntime = activeRuntime;
  let activeChanged = false;
  let nextMapFactories = mapFactories;
  const changedFactorySectors = new Set<string>();
  const sourceSectors = [
    activeSector,
    ...Object.keys(mapFactories)
      .filter((sectorKey) =>
        sectorKey !== activeSector && isMapNodeUnlocked(mapNodeProgress, sectorKey)
      )
      .sort(),
  ];
  const getRuntime = (sectorKey: string) => sectorKey === activeSector
    ? nextActiveRuntime
    : nextMapFactories[sectorKey]?.runtime ?? null;
  const getMutableRuntime = (sectorKey: string) => {
    if (sectorKey === activeSector) {
      if (!activeChanged) {
        nextActiveRuntime = cloneStoredMaterialRuntime(nextActiveRuntime);
        activeChanged = true;
      }
      return nextActiveRuntime;
    }
    const factory = nextMapFactories[sectorKey];
    if (!factory) return null;
    if (!changedFactorySectors.has(sectorKey)) {
      if (nextMapFactories === mapFactories) nextMapFactories = { ...mapFactories };
      nextMapFactories[sectorKey] = {
        ...factory,
        runtime: cloneStoredMaterialRuntime(factory.runtime),
      };
      changedFactorySectors.add(sectorKey);
    }
    return nextMapFactories[sectorKey].runtime;
  };

  sourceSectors.forEach((sectorKey) => {
    const runtime = getRuntime(sectorKey);
    if (!runtime) return;
    Object.keys(runtime.roads ?? {}).sort().forEach((roadId) => {
      const currentRuntime = getRuntime(sectorKey);
      const road = currentRuntime?.roads[roadId];
      if (
        road?.mode !== "export" ||
        !road.outboundType ||
        !road.pairedSector ||
        !road.pairedRoadId
      ) return;
      if (!isMapNodeUnlocked(mapNodeProgress, road.pairedSector)) return;
      const targetRuntime = getRuntime(road.pairedSector);
      const targetRoad = targetRuntime?.roads[road.pairedRoadId];
      if (
        !targetRoad ||
        targetRoad.mode !== "import" ||
        targetRoad.inboundType !== null ||
        targetRoad.pairedSector !== sectorKey ||
        targetRoad.pairedRoadId !== roadId
      ) return;
      const mutableSource = getMutableRuntime(sectorKey);
      const mutableTarget = getMutableRuntime(road.pairedSector);
      if (!mutableSource || !mutableTarget) return;
      const transferredType = mutableSource.roads[roadId]?.outboundType ?? null;
      if (!transferredType || mutableTarget.roads[road.pairedRoadId]?.inboundType !== null) return;
      mutableSource.roads[roadId].outboundType = null;
      mutableTarget.roads[road.pairedRoadId].inboundType = transferredType;
    });
  });

  return {
    activeRuntime: nextActiveRuntime,
    mapFactories: nextMapFactories,
    activeChanged,
    factoriesChanged: changedFactorySectors.size > 0,
  };
};

const connectionsAreEqual = (first: Connection[], second: Connection[]) =>
  first.length === second.length && first.every((connection, index) => {
    const candidate = second[index];
    return Boolean(
      candidate &&
      connection.id === candidate.id &&
      connection.type === candidate.type &&
      connection.sourceNode === candidate.sourceNode &&
      connection.sourcePort === candidate.sourcePort &&
      connection.targetNode === candidate.targetNode &&
      connection.targetPort === candidate.targetPort,
    );
  });

const getCurveControlPoints = (start: Position, end: Position, sourcePortId?: string) => {
  const deltaX = end.x - start.x;
  const horizontalDistance = deltaX >= 0
    ? deltaX * 0.45
    : Math.max(82, Math.abs(deltaX) * 0.52);
  const lakeOutputSide = sourcePortId ? getLakeWaterOutputPort(sourcePortId)?.side : null;
  if (lakeOutputSide === "north" || lakeOutputSide === "south") {
    const direction = lakeOutputSide === "north" ? -1 : 1;
    const verticalDistance = Math.max(82, Math.abs(end.y - start.y) * 0.45);
    return {
      first: { x: start.x, y: start.y + direction * verticalDistance },
      second: { x: end.x - horizontalDistance, y: end.y },
    };
  }
  if (lakeOutputSide === "west") {
    return {
      first: { x: start.x - Math.max(82, Math.abs(deltaX) * 0.45), y: start.y },
      second: { x: end.x - horizontalDistance, y: end.y },
    };
  }
  if (sourcePortId === "power-split-top" || sourcePortId === "power-split-bottom") {
    const direction = sourcePortId === "power-split-top" ? -1 : 1;
    const verticalDistance = Math.max(72, Math.abs(end.y - start.y) * 0.38);
    return {
      first: { x: start.x, y: start.y + direction * verticalDistance },
      second: { x: end.x - horizontalDistance, y: end.y },
    };
  }
  return {
    first: { x: start.x + horizontalDistance, y: start.y },
    second: { x: end.x - horizontalDistance, y: end.y },
  };
};

const getCurve = (start: Position, end: Position, sourcePortId?: string) => {
  const controls = getCurveControlPoints(start, end, sourcePortId);
  return `M ${start.x} ${start.y} C ${controls.first.x} ${controls.first.y}, ${controls.second.x} ${controls.second.y}, ${end.x} ${end.y}`;
};

const getCurveMidpoint = (start: Position, end: Position, sourcePortId?: string) => {
  const controls = getCurveControlPoints(start, end, sourcePortId);
  return {
    x: (start.x + 3 * controls.first.x + 3 * controls.second.x + end.x) / 8,
    y: (start.y + 3 * controls.first.y + 3 * controls.second.y + end.y) / 8,
  };
};

const getBezierPoint = (
  start: Position,
  end: Position,
  sourcePortId: string | undefined,
  progress: number,
): Position => {
  const controls = getCurveControlPoints(start, end, sourcePortId);
  const inverse = 1 - progress;
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * progress * controls.first.x +
      3 * inverse * progress ** 2 * controls.second.x +
      progress ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * progress * controls.first.y +
      3 * inverse * progress ** 2 * controls.second.y +
      progress ** 3 * end.y,
  };
};

const curveIntersectsBlackHole = (
  start: Position,
  end: Position,
  sourcePortId: string | undefined,
  holes: Iterable<BlackHoleObstacle>,
  clearance = BLACK_HOLE_CLEARANCE,
) => {
  const blackHoles = Array.from(holes);
  if (!blackHoles.length) return false;
  const controls = getCurveControlPoints(start, end, sourcePortId);
  const approximateLength =
    Math.hypot(controls.first.x - start.x, controls.first.y - start.y) +
    Math.hypot(controls.second.x - controls.first.x, controls.second.y - controls.first.y) +
    Math.hypot(end.x - controls.second.x, end.y - controls.second.y);
  const samples = Math.max(16, Math.ceil(approximateLength / 10));
  for (let index = 0; index <= samples; index += 1) {
    const point = getBezierPoint(start, end, sourcePortId, index / samples);
    if (blackHoles.some((hole) =>
      Math.hypot(point.x - hole.x, point.y - hole.y) <= hole.radius + clearance
    )) return true;
  }
  return false;
};

const rectangleIntersectsBlackHole = (
  rectangle: Position & NodeSize,
  hole: BlackHoleObstacle,
  clearance = BLACK_HOLE_CLEARANCE,
) => {
  const nearestX = Math.max(rectangle.x, Math.min(hole.x, rectangle.x + rectangle.width));
  const nearestY = Math.max(rectangle.y, Math.min(hole.y, rectangle.y + rectangle.height));
  return Math.hypot(hole.x - nearestX, hole.y - nearestY) <= hole.radius + clearance;
};

const getLakeNormalizedPolygonPoints = (lake: LakeObstacle): Position[] =>
  lake.shape.map((scale, index) => {
    const angle = (Math.PI * 2 * index) / lake.shape.length;
    return {
      x: Math.cos(angle) * scale,
      y: Math.sin(angle) * scale,
    };
  });

const getLakePolygonWorldPoints = (lake: LakeObstacle, clearance = 0): Position[] =>
  getLakeNormalizedPolygonPoints(lake).map((point) => ({
    x: lake.x + point.x * (lake.width / 2 + clearance),
    y: lake.y + point.y * (lake.height / 2 + clearance),
  }));

const getLakePolygonSvgPointList = (lake: LakeObstacle): Position[] =>
  getLakeNormalizedPolygonPoints(lake).map((point) => ({
    x: 50 + point.x * 50,
    y: 50 + point.y * 50,
  }));

const getLakePolygonSvgPoints = (lake: LakeObstacle) =>
  getLakePolygonSvgPointList(lake).map((point) => `${point.x},${point.y}`).join(" ");

const getLakeOutputPortPosition = (
  lake: LakeObstacle,
  side: LakeOutputDirection,
): Position => getLakePolygonSvgPointList(lake).reduce((selected, point) => {
  if (side === "north") return point.y < selected.y ? point : selected;
  if (side === "south") return point.y > selected.y ? point : selected;
  if (side === "west") return point.x < selected.x ? point : selected;
  return point.x > selected.x ? point : selected;
});

const pointInPolygon = (point: Position, polygon: Position[]) => {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const a = polygon[current];
    const b = polygon[previous];
    if (
      ((a.y > point.y) !== (b.y > point.y)) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x
    ) inside = !inside;
  }
  return inside;
};

const lineSegmentsIntersect = (a: Position, b: Position, c: Position, d: Position) => {
  const cross = (first: Position, second: Position, third: Position) =>
    (second.x - first.x) * (third.y - first.y) -
    (second.y - first.y) * (third.x - first.x);
  const onSegment = (first: Position, point: Position, second: Position) =>
    point.x >= Math.min(first.x, second.x) &&
    point.x <= Math.max(first.x, second.x) &&
    point.y >= Math.min(first.y, second.y) &&
    point.y <= Math.max(first.y, second.y);
  const abC = cross(a, b, c);
  const abD = cross(a, b, d);
  const cdA = cross(c, d, a);
  const cdB = cross(c, d, b);
  if (abC === 0 && onSegment(a, c, b)) return true;
  if (abD === 0 && onSegment(a, d, b)) return true;
  if (cdA === 0 && onSegment(c, a, d)) return true;
  if (cdB === 0 && onSegment(c, b, d)) return true;
  return ((abC < 0 && abD > 0) || (abC > 0 && abD < 0)) &&
    ((cdA < 0 && cdB > 0) || (cdA > 0 && cdB < 0));
};

const rectangleIntersectsLake = (
  rectangle: Position & NodeSize,
  lake: LakeObstacle,
  clearance = BLACK_HOLE_CLEARANCE,
) => {
  const polygon = getLakePolygonWorldPoints(lake, clearance);
  const corners = [
    { x: rectangle.x, y: rectangle.y },
    { x: rectangle.x + rectangle.width, y: rectangle.y },
    { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height },
    { x: rectangle.x, y: rectangle.y + rectangle.height },
  ];
  if (corners.some((corner) => pointInPolygon(corner, polygon))) return true;
  if (polygon.some((point) =>
    point.x >= rectangle.x &&
    point.x <= rectangle.x + rectangle.width &&
    point.y >= rectangle.y &&
    point.y <= rectangle.y + rectangle.height
  )) return true;
  return polygon.some((point, index) => {
    const next = polygon[(index + 1) % polygon.length];
    return corners.some((corner, cornerIndex) =>
      lineSegmentsIntersect(
        point,
        next,
        corner,
        corners[(cornerIndex + 1) % corners.length],
      )
    );
  });
};

const curveIntersectsLake = (
  start: Position,
  end: Position,
  sourcePortId: string | undefined,
  lakes: Iterable<LakeObstacle>,
  clearance = BLACK_HOLE_CLEARANCE,
) => {
  const lakePolygons = Array.from(lakes).map((lake) =>
    getLakePolygonWorldPoints(lake, clearance)
  );
  if (!lakePolygons.length) return false;
  const controls = getCurveControlPoints(start, end, sourcePortId);
  const approximateLength =
    Math.hypot(controls.first.x - start.x, controls.first.y - start.y) +
    Math.hypot(controls.second.x - controls.first.x, controls.second.y - controls.first.y) +
    Math.hypot(end.x - controls.second.x, end.y - controls.second.y);
  const samples = Math.max(20, Math.ceil(approximateLength / 10));
  for (let index = 0; index <= samples; index += 1) {
    const point = getBezierPoint(start, end, sourcePortId, index / samples);
    if (lakePolygons.some((polygon) => pointInPolygon(point, polygon))) return true;
  }
  return false;
};

const getBlackHolePolygonPoints = (hole: BlackHoleObstacle) =>
  hole.shape.map((scale, index) => {
    const angle = (Math.PI * 2 * index) / hole.shape.length + hole.rotation * Math.PI / 180;
    const distance = 43 * scale;
    return `${50 + Math.cos(angle) * distance},${50 + Math.sin(angle) * distance}`;
  }).join(" ");

const collapseDepletedResourceNodes = (
  nodes: NodeSpec[],
  positions: Positions,
  connections: Connection[],
  runtime: Runtime,
) => {
  const depletedNodes = nodes.filter((node) => {
    if (node.kind === "forest" || !isResourceNodeKind(node.kind)) return false;
    const resourceType = runtime.minedDeposits[node.id]?.type ?? (
      node.kind === "ironOre"
        ? ResourceType.IRON
        : node.kind === "copperOre"
          ? ResourceType.COPPER
          : node.kind === "mythrilOre"
            ? ResourceType.MYTHRIL
            : ResourceType.STONE
    );
    return getDirectResourceRemaining(runtime, node.id, resourceType) <= 0;
  });
  if (!depletedNodes.length) {
    return { nodes, positions, connections, depletedNodes };
  }

  const depletedIds = new Set(depletedNodes.map((node) => node.id));
  depletedNodes.forEach((node) => {
    const position = positions[node.id];
    if (!position) return;
    const size = getEstimatedNodeSize(node);
    const holeId = `black-hole-${node.id}`;
    runtime.blackHoles[holeId] = createBlackHoleObstacle(
      { x: position.x + size.width / 2, y: position.y + size.height / 2 },
      RESOURCE_DEPLETION_BLACK_HOLE_RADIUS,
      holeId,
    );
    delete runtime.minedDeposits[node.id];
  });
  const remainingNodes = nodes.filter((node) => !depletedIds.has(node.id));
  const remainingConnections = connections.filter(
    (connection) =>
      !depletedIds.has(connection.sourceNode) && !depletedIds.has(connection.targetNode),
  );
  const nodeById = new Map(remainingNodes.map((node) => [node.id, node] as const));
  const getEstimatedAnchor = (
    nodeId: NodeId,
    direction: PortDirection,
    portId?: string,
  ): Position | null => {
    const hole = runtime.blackHoles[nodeId];
    if (hole) {
      return { x: hole.x, y: hole.y };
    }
    const lake = runtime.lakes[nodeId];
    if (lake) {
      const lakePort = portId ? getLakeWaterOutputPort(portId) : null;
      if (direction === "output" && lakePort) {
        const position = getLakeOutputPortPosition(lake, lakePort.side);
        return {
          x: lake.x - lake.width / 2 + lake.width * position.x / 100,
          y: lake.y - lake.height / 2 + lake.height * position.y / 100,
        };
      }
      return {
        x: direction === "output" ? lake.x + lake.width / 2 : lake.x - lake.width / 2,
        y: lake.y,
      };
    }
    const node = nodeById.get(nodeId);
    const position = positions[nodeId];
    if (!node || !position) return null;
    const size = getEstimatedNodeSize(node);
    return {
      x: direction === "output" ? position.x + size.width : position.x,
      y: position.y + size.height / 2,
    };
  };
  const safeConnections = remainingConnections.filter((connection) => {
    const start = getEstimatedAnchor(connection.sourceNode, "output", connection.sourcePort);
    const end = getEstimatedAnchor(connection.targetNode, "input", connection.targetPort);
    if (!start || !end) return false;
    const holes = Object.values(runtime.blackHoles).filter(
      (hole) => hole.id !== connection.sourceNode && hole.id !== connection.targetNode,
    );
    const lakes = Object.values(runtime.lakes).filter(
      (lake) => lake.id !== connection.sourceNode && lake.id !== connection.targetNode,
    );
    return !curveIntersectsBlackHole(start, end, connection.sourcePort, holes) &&
      !curveIntersectsLake(start, end, connection.sourcePort, lakes);
  });
  return {
    nodes: remainingNodes,
    positions: Object.fromEntries(
      Object.entries(positions).filter(([nodeId]) => !depletedIds.has(nodeId)),
    ),
    connections: safeConnections,
    depletedNodes,
  };
};

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.8;
const STARTING_ZOOM_MAX = 0.45;
const STARTING_RESOURCE_VIEW_PADDING = 14;
const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
const getPortZoomScale = (value: number) => 1 + Math.max(0, 1 - value);
const getPortHitPadding = (value: number) => {
  const visualScale = getPortZoomScale(value);
  const paddingForThirtyPixelTarget = (30 / (visualScale * value) - 16) / 2;
  return Math.max(7, paddingForThirtyPixelTarget);
};
const hasControlModifier = (event: { ctrlKey: boolean }) => event.ctrlKey;

type KeyboardShortcut = {
  group: "General" | "Control groups" | "Node";
  name: string;
  keys: string[];
  description: string;
};

type KeyboardShortcutFilter = KeyboardShortcut["group"] | "all";

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    group: "General",
    name: "Undo",
    keys: ["Ctrl", "Z"],
    description: "Undo the last supported node, cable, or layout change.",
  },
  {
    group: "General",
    name: "Cancel active action",
    keys: ["Esc"],
    description: "Cancel placement or wiring and clear the current selection.",
  },
  {
    group: "General",
    name: "Delete selection",
    keys: ["Delete / Backspace"],
    description: "Delete selected nodes or the selected connection after any required confirmation.",
  },
  {
    group: "General",
    name: "Pan the field",
    keys: ["Right-click", "Drag"],
    description: "Right-click and drag anywhere on the field to pan.",
  },
  {
    group: "General",
    name: "Toggle Build",
    keys: ["B"],
    description: "Open or close the Node Construction menu.",
  },
  {
    group: "General",
    name: "Toggle Inventory",
    keys: ["I"],
    description: "Open or close the Inventory menu.",
  },
  {
    group: "General",
    name: "Toggle Journal",
    keys: ["J"],
    description: "Open or close the Discovery Journal.",
  },
  {
    group: "General",
    name: "Toggle Options",
    keys: ["O"],
    description: "Open or close the Options menu.",
  },
  {
    group: "General",
    name: "Toggle Research",
    keys: ["Q"],
    description: "Open or close the Research menu.",
  },
  {
    group: "General",
    name: "Add to selection",
    keys: ["Shift", "Click / Drag"],
    description: "Hold Shift to add. Drag down-right to include touched control groups; drag up-left to prioritize only the highlighted nodes, even inside groups.",
  },
  {
    group: "Control groups",
    name: "Create a control group",
    keys: ["Right-click", "Selected nodes"],
    description: "Right-click while multiple nodes are highlighted, then choose a group color.",
  },
  {
    group: "Control groups",
    name: "Select and move a group",
    keys: ["Click / Drag", "Group member"],
    description: "Select or move every node in a control group together.",
  },
  {
    group: "Control groups",
    name: "Control one node",
    keys: ["Double-click", "Group member"],
    description: "Select and move one node without affecting the rest of its control group.",
  },
  {
    group: "Control groups",
    name: "Disband a control group",
    keys: ["Right-click", "Group member"],
    description: "Open the confirmation to disband the selected control group.",
  },
  {
    group: "Node",
    name: "Create another node",
    keys: ["Ctrl", "Click node"],
    description: "Keep placing copies of the same node while their build costs are available.",
  },
  {
    group: "Node",
    name: "Repeat placement",
    keys: ["Shift", "Place node"],
    description: "Place the current node and immediately prepare another copy. Release Shift to stop.",
  },
  {
    group: "Node",
    name: "Rotate a Joint",
    keys: ["R", "Hover Joint"],
    description: "Rotate the hovered Joint between left-right and top-bottom connections.",
  },
  {
    group: "Node",
    name: "Use Shortcut Bar 1",
    keys: ["1–5"],
    description: "Activate the matching slot in Shortcut Bar 1.",
  },
  {
    group: "Node",
    name: "Use Shortcut Bar 2",
    keys: ["Shift", "1–5"],
    description: "Activate the matching slot in Shortcut Bar 2.",
  },
  {
    group: "Node",
    name: "Use Shortcut Bar 3",
    keys: ["Ctrl", "1–5"],
    description: "Activate the matching slot in Shortcut Bar 3.",
  },
];

const KEYBOARD_SHORTCUT_GROUPS = Array.from(
  new Set(KEYBOARD_SHORTCUTS.map((shortcut) => shortcut.group)),
);

export default function Home() {
  const [nodes, setNodes] = useState<NodeSpec[]>(INITIAL_NODES);
  const [positions, setPositions] = useState<Positions>(INITIAL_POSITIONS);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [runtime, setRuntime] = useState<Runtime>(makeRuntime);
  const [isRunning, setIsRunning] = useState(true);
  const [connecting, setConnecting] = useState<PortHandle | null>(null);
  const [hoveredPort, setHoveredPort] = useState<PortHandle | null>(null);
  const [snappedPort, setSnappedPort] = useState<PortHandle | null>(null);
  const [wirePointer, setWirePointer] = useState<Position | null>(null);
  const [rewiringConnectionId, setRewiringConnectionId] = useState<string | null>(null);
  const [anchors, setAnchors] = useState<Record<string, Position>>({});
  const [activeFlows, setActiveFlows] = useState<Record<string, number>>({});
  const [productionFlashTokens, setProductionFlashTokens] = useState<Record<NodeId, number>>({});
  const [rapidClickAnimations, setRapidClickAnimations] = useState<Record<NodeId, RapidClickAnimation>>({});
  const [rapidClickWarningOpen, setRapidClickWarningOpen] = useState(false);
  const [stoneCollectHintVisible, setStoneCollectHintVisible] = useState(false);
  const [stoneCollectHintEncouraging, setStoneCollectHintEncouraging] = useState(false);
  const [forestCollectHintVisible, setForestCollectHintVisible] = useState(false);
  const [forestCollectHintEncouraging, setForestCollectHintEncouraging] = useState(false);
  const [starterBuildHintTarget, setStarterBuildHintTarget] = useState<"menu" | "extractor" | null>(null);
  const [connectionTutorialExtractorId, setConnectionTutorialExtractorId] = useState<NodeId | null>(null);
  const [starterTutorialOutroOpen, setStarterTutorialOutroOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<NodeId[]>([]);
  const [controlGroups, setControlGroups] = useState<ControlGroup[]>([]);
  const [activeControlGroupId, setActiveControlGroupId] = useState<string | null>(null);
  const [individualControlNodeId, setIndividualControlNodeId] = useState<NodeId | null>(null);
  const [pendingControlGroupNodeIds, setPendingControlGroupNodeIds] = useState<NodeId[]>([]);
  const [controlGroupOnboardingOpen, setControlGroupOnboardingOpen] = useState(false);
  const [suppressControlGroupTutorial, setSuppressControlGroupTutorial] = useState(false);
  const [controlGroupColorOpen, setControlGroupColorOpen] = useState(false);
  const [pendingDisbandControlGroupId, setPendingDisbandControlGroupId] = useState<string | null>(null);
  const [disbandControlGroupOpen, setDisbandControlGroupOpen] = useState(false);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [draggingNode, setDraggingNode] = useState<NodeId | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [viewportSize, setViewportSize] = useState({ width: 1160, height: 690 });
  const [insertionTarget, setInsertionTarget] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [buildOpen, setBuildOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [hoveredResearchProject, setHoveredResearchProject] = useState<ResearchProjectId | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedMapSector, setSelectedMapSector] = useState<string | null>(null);
  const [activeMapSector, setActiveMapSector] = useState(MAP_HOME_SECTOR);
  const [, setBackgroundResearchRevision] = useState(0);
  const [mapNodeDialogSector, setMapNodeDialogSector] = useState<string | null>(null);
  const [mapNodeDialogOpen, setMapNodeDialogOpen] = useState(false);
  const [mapNodeDraftName, setMapNodeDraftName] = useState("");
  const [mapNodeProgress, setMapNodeProgress] = useState<MapNodeProgressBySector>(
    makeInitialMapNodeProgress,
  );
  const [journalOpen, setJournalOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [journalCategory, setJournalCategory] = useState<JournalCategory>("all");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [keyboardShortcutFilter, setKeyboardShortcutFilter] = useState<KeyboardShortcutFilter>("all");
  const [recipesOpen, setRecipesOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [achievementFlavorIndex, setAchievementFlavorIndex] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<AchievementId>>(
    () => new Set(),
  );
  const [recipeNodeFilters, setRecipeNodeFilters] = useState<string[]>([]);
  const [saveOpen, setSaveOpen] = useState(false);
  const [wireAnimationsEnabled, setWireAnimationsEnabled] = useState(true);
  const [shortcutBars, setShortcutBars] = useState<ShortcutBarsState>(makeDefaultShortcutBars);
  const [shortcutBarGroups, setShortcutBarGroups] = useState<ShortcutBarGroup[]>([]);
  const [shortcutBarSnapTarget, setShortcutBarSnapTarget] = useState<ShortcutBarSnapCandidate | null>(null);
  const [removeBuildCosts, setRemoveBuildCosts] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [saveSlots, setSaveSlots] = useState<Array<SaveGameSlot | null>>(makeEmptySaveSlots);
  const [saveNames, setSaveNames] = useState<string[]>(makeDefaultSaveNames);
  const [temporarySave, setTemporarySave] = useState<SaveGameSlot | null>(null);
  const [temporarySaveFrequencyMinutes, setTemporarySaveFrequencyMinutes] = useState(
    DEFAULT_TEMPORARY_SAVE_FREQUENCY_MINUTES,
  );
  const [temporarySaveFrequencyDraft, setTemporarySaveFrequencyDraft] = useState(
    DEFAULT_TEMPORARY_SAVE_FREQUENCY_MINUTES,
  );
  const [temporarySaveFrequencyOpen, setTemporarySaveFrequencyOpen] = useState(false);
  const [pendingLoadSlot, setPendingLoadSlot] = useState<number | "temporary" | null>(null);
  const [loadConfirmOpen, setLoadConfirmOpen] = useState(false);
  const [showBuildableOnly, setShowBuildableOnly] = useState(false);
  const [showNeverBuiltOnly, setShowNeverBuiltOnly] = useState(false);
  const [compactBuildView, setCompactBuildView] = useState(false);
  const [buildCategory, setBuildCategory] = useState<BuildCategory>("all");
  const [showAllBuildNodes, setShowAllBuildNodes] = useState(false);
  const [revealedBuildKinds, setRevealedBuildKinds] = useState<Set<PurchasableKind>>(
    () => new Set(["extractor", "woodenChest"]),
  );
  const [builtBuildKinds, setBuiltBuildKinds] = useState<Set<PurchasableKind>>(
    () => new Set(["extractor"]),
  );
  const [placedBuildKinds, setPlacedBuildKinds] = useState<Set<PurchasableKind>>(
    () => new Set(),
  );
  const [newBuildKinds, setNewBuildKinds] = useState<Set<PurchasableKind>>(() => new Set());
  const [unlockTimes, setUnlockTimes] = useState<UnlockTimes>(() => ({
    extractor: 0,
    woodenChest: 0,
  }));
  const [buildAttention, setBuildAttention] = useState(false);
  const [journalAttention, setJournalAttention] = useState(false);
  const [logisticsUnlocked, setLogisticsUnlocked] = useState(false);
  const [configuringFilterId, setConfiguringFilterId] = useState<NodeId | null>(null);
  const [configuringMiningDrillId, setConfiguringMiningDrillId] = useState<NodeId | null>(null);
  const [configuringAssemblerId, setConfiguringAssemblerId] = useState<NodeId | null>(null);
  const [configuringRecipeMachineKind, setConfiguringRecipeMachineKind] = useState<"assembler" | "refiner">("assembler");
  const [hoveredRecipeOptionId, setHoveredRecipeOptionId] = useState<AssemblerRecipeId | RefinerRecipeId | null>(null);
  const [pendingAssemblerRecipeChange, setPendingAssemblerRecipeChange] = useState<{
    nodeId: NodeId;
    kind: "assembler" | "refiner";
    recipeId: AssemblerRecipeId | RefinerRecipeId;
  } | null>(null);
  const [assemblerRecipeChangeDialogOpen, setAssemblerRecipeChangeDialogOpen] = useState(false);
  const [suppressFutureAssemblerRecipeWarnings, setSuppressFutureAssemblerRecipeWarnings] = useState(false);
  const [alwaysApproveAssemblerRecipeChanges, setAlwaysApproveAssemblerRecipeChanges] = useState(false);
  const [miningDrillWarningOpen, setMiningDrillWarningOpen] = useState(false);
  const [suppressFutureMiningDrillWarnings, setSuppressFutureMiningDrillWarnings] = useState(false);
  const [skipMiningDrillCompletionWarning, setSkipMiningDrillCompletionWarning] = useState(false);
  const [skipMultiConnectionTooltip, setSkipMultiConnectionTooltip] = useState(false);
  const [skipShortcutBarGroupTooltip, setSkipShortcutBarGroupTooltip] = useState(false);
  const [placingNodeId, setPlacingNodeId] = useState<NodeId | null>(null);
  const [placementBlocked, setPlacementBlocked] = useState(false);
  const [dragCollisionBlocked, setDragCollisionBlocked] = useState(false);
  const [replicationResourceWarning, setReplicationResourceWarning] = useState<{
    clientX: number;
    clientY: number;
    token: number;
  } | null>(null);
  const [obstructionTooltip, setObstructionTooltip] = useState<ObstructionTooltipState | null>(null);
  const [pendingDeletionNodeIds, setPendingDeletionNodeIds] = useState<NodeId[]>([]);
  const [destroyDialogOpen, setDestroyDialogOpen] = useState(false);
  const [pendingDeletionIsHighlightedGroup, setPendingDeletionIsHighlightedGroup] = useState(false);
  const [suppressFutureNodeDestructionWarnings, setSuppressFutureNodeDestructionWarnings] = useState(false);
  const [pendingDeletionConnectionId, setPendingDeletionConnectionId] = useState<string | null>(null);
  const [connectionDeleteDialogOpen, setConnectionDeleteDialogOpen] = useState(false);
  const [suppressFutureConnectionDeleteWarnings, setSuppressFutureConnectionDeleteWarnings] = useState(false);
  const [alwaysDeleteConnections, setAlwaysDeleteConnections] = useState(false);
  const [alwaysApproveNodeDestruction, setAlwaysApproveNodeDestruction] = useState(false);
  const [inventoryOverflowPrompt, setInventoryOverflowPrompt] = useState<InventoryOverflowPrompt | null>(null);
  const [inventoryOverflowDialogOpen, setInventoryOverflowDialogOpen] = useState(false);
  const [suppressFutureInventoryOverflowWarnings, setSuppressFutureInventoryOverflowWarnings] = useState(false);
  const [managedMultiPort, setManagedMultiPort] = useState<{
    nodeId: NodeId;
    portId: string;
    direction: PortDirection;
  } | null>(null);
  const [multiConnectionManagerOpen, setMultiConnectionManagerOpen] = useState(false);
  const [pendingDeletionDetails, setPendingDeletionDetails] = useState<{
    count: number;
    title: string;
  } | null>(null);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const destroyConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const activeMapSectorRef = useRef(activeMapSector);
  const mapFactoriesRef = useRef<MapFactoriesBySector>({});
  const mapFactoriesGeneratedAtStartRef = useRef(false);
  const appliedAreaExpansionLayoutLevelRef = useRef(getAreaExpansionLevel(runtime.research));
  const mapNodeProgressRef = useRef(mapNodeProgress);
  const shortcutsListRef = useRef<HTMLDivElement>(null);
  const recipesListRef = useRef<HTMLDivElement>(null);
  const shortcutBarElementsRef = useRef<Partial<Record<ShortcutBarId, HTMLElement | null>>>({});
  const shortcutBarsRef = useRef(shortcutBars);
  const shortcutBarGroupsRef = useRef(shortcutBarGroups);
  const shortcutBarDragRef = useRef<{
    barId: ShortcutBarId;
    movingBarIds: ShortcutBarId[];
    bars: ShortcutBarsState;
    rects: Partial<Record<ShortcutBarId, ShortcutBarScreenRect>>;
    snap: ShortcutBarSnapCandidate | null;
  } | null>(null);
  const buildOpenRef = useRef(false);
  const achievementOpenCountRef = useRef(0);
  const unlockedAchievementsRef = useRef<Set<AchievementId>>(new Set());
  const gameElapsedMsRef = useRef(0);
  const lastTemporarySaveElapsedRef = useRef(0);
  const temporarySaveIntervalPendingRef = useRef(true);
  const stoneCollectHintActivatedRef = useRef(false);
  const stoneCollectHintDismissedRef = useRef(false);
  const stoneCollectSecondHintPendingRef = useRef(false);
  const stoneCollectSecondHintActiveRef = useRef(false);
  const stoneManualCollectionCountRef = useRef(0);
  const lastManualResourceCollectionElapsedRef = useRef(0);
  const forestCollectHintActivatedRef = useRef(false);
  const forestCollectHintDismissedRef = useRef(false);
  const forestCollectSecondHintPendingRef = useRef(false);
  const forestCollectSecondHintActiveRef = useRef(false);
  const forestCollectHintEligibleAtRef = useRef(0);
  const starterBuildHintStageRef = useRef<StarterBuildHintStage>("waiting");
  const starterBuildHintEligibleAtRef = useRef(0);
  const lastPlayerActivityElapsedRef = useRef(0);
  const starterConnectionHintStageRef = useRef<StarterConnectionHintStage>("waiting");
  const starterConnectionHintEligibleAtRef = useRef(0);
  const starterTutorialSeenRef = useRef<StarterTutorialSeenState>(makeStarterTutorialSeenState());
  const starterTutorialOutroShownRef = useRef(false);
  const starterTutorialOutroEligibleAtRef = useRef(0);
  const rapidClickTimestampsRef = useRef<Record<NodeId, number[]>>({});
  const rapidClickSequenceRef = useRef({ count: 0, lastAt: 0 });
  const rapidClickAnimationTimeoutsRef = useRef<Record<NodeId, number>>({});
  const rapidFieldClicksRef = useRef<{ timestamps: number[]; center: Position | null }>({
    timestamps: [],
    center: null,
  });
  const portRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const anchorsRef = useRef<Record<string, Position>>({});
  const snappedPortRef = useRef<PortHandle | null>(null);
  const nodeRefs = useRef<Record<NodeId, HTMLElement | null>>({});
  const hoveredNodeIdRef = useRef<NodeId | null>(null);
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const nodesRef = useRef(nodes);
  const selectedNodesRef = useRef(selectedNodes);
  const controlGroupsRef = useRef(controlGroups);
  const individualControlNodeRef = useRef<NodeId | null>(null);
  const controlGroupTutorialSuppressedRef = useRef(false);
  const inventoryOverflowActionRef = useRef<(() => void) | null>(null);
  const inventoryOverflowWarningSuppressedRef = useRef(false);
  const controlGroupSequenceRef = useRef(0);
  const runtimeRef = useRef(runtime);
  const logisticsUnlockedRef = useRef(false);
  const connectionsRef = useRef(connections);
  const positionsRef = useRef(positions);
  const isRunningRef = useRef(isRunning);
  const zoomRef = useRef(zoom);
  const lastSimulationTickRef = useRef(0);
  const lastSimulationUiUpdateRef = useRef(0);
  const lastPublishedRuntimeSignatureRef = useRef<string | null>(null);
  const pendingActiveFlowIdsRef = useRef(new Set<string>());
  const wireAnimationsEnabledRef = useRef(true);
  const pinchFrameRef = useRef<number | null>(null);
  const pinchTargetZoomRef = useRef(zoom);
  const pinchAnchorRef = useRef({ clientX: 0, clientY: 0, activeUntil: 0 });
  const connectionDragRef = useRef<{
    startX: number;
    startY: number;
    clientX: number;
    clientY: number;
    moved: boolean;
    connectionStart: PortHandle;
    replaceConnectionId?: string;
    originNodeId: NodeId;
    originPortId: string;
    originPortDirection: PortDirection;
  } | null>(null);
  const insertionTargetRef = useRef<string | null>(null);
  const spacePressedRef = useRef(false);
  const didInitialFocusRef = useRef(false);
  const placingNodeRef = useRef<NodeId | null>(null);
  const repeatPlacementPreviewRef = useRef<{
    nodeId: NodeId;
    lastPlacedNodeId: NodeId;
  } | null>(null);
  const continuousReplicationRef = useRef(false);
  const placementBlockedRef = useRef(false);
  const lastCanvasPointerRef = useRef<{ x: number; y: number } | null>(null);
  const placementCancelContextMenuUntilRef = useRef(0);
  const buildSequenceRef = useRef<BuildSequence>(makeBuildSequence());
  const panRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
    moved: boolean;
    nodeId?: NodeId;
    contextMenuHandled: boolean;
  } | null>(null);
  const suppressedNodeContextMenuRef = useRef<{
    nodeId: NodeId;
    until: number;
  } | null>(null);
  const selectionBoxRef = useRef<(SelectionBox & {
    baseSelection: NodeId[];
    basePrioritySelection: NodeId[];
    currentSelection: NodeId[];
    moved: boolean;
  }) | null>(null);
  const prioritizedBoxSelectionRef = useRef<NodeId[]>([]);
  const dragRef = useRef<{
    primaryNodeId: NodeId;
    nodeIds: NodeId[];
    startX: number;
    startY: number;
    origins: Partial<Positions>;
    lastValidPositions: Partial<Positions>;
    overlapping: boolean;
    moved: boolean;
  } | null>(null);
  const undoHistoryRef = useRef<UndoEntry[]>([]);
  const pendingPlacementUndoRef = useRef<{
    nodeId: NodeId;
    snapshot: GraphUndoSnapshot;
  } | null>(null);

  useEffect(() => {
    const now = performance.now();
    lastSimulationTickRef.current = now;
    lastSimulationUiUpdateRef.current = now;
  }, []);

  useLayoutEffect(() => {
    if (shortcutsOpen && shortcutsListRef.current) {
      shortcutsListRef.current.scrollTop = 0;
    }
  }, [shortcutsOpen]);

  useLayoutEffect(() => {
    if (recipesOpen && recipesListRef.current) {
      recipesListRef.current.scrollTop = 0;
    }
  }, [recipeNodeFilters, recipesOpen]);

  const replicationResourceWarningToken = replicationResourceWarning?.token;
  useEffect(() => {
    if (replicationResourceWarningToken === undefined) return;
    const timer = window.setTimeout(() => {
      setReplicationResourceWarning(null);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [replicationResourceWarningToken]);

  const updateObstructionTooltip = useCallback((
    kind: ObstructionTooltipState["kind"],
    nodeId: NodeId,
    event: React.PointerEvent,
  ) => {
    if (event.pointerType !== "mouse") return;
    setObstructionTooltip({
      kind,
      nodeId,
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }, []);

  const clearObstructionTooltip = useCallback((
    kind: ObstructionTooltipState["kind"],
    nodeId: NodeId,
  ) => {
    setObstructionTooltip((current) =>
      current?.kind === kind && current.nodeId === nodeId ? null : current
    );
  }, []);

  useEffect(() => {
    try {
      const storedPreference = window.localStorage.getItem(WIRE_ANIMATION_STORAGE_KEY);
      if (storedPreference === null) return;
      const enabled = storedPreference !== "false";
      wireAnimationsEnabledRef.current = enabled;
      setWireAnimationsEnabled(enabled);
    } catch {
      // Visual preferences can safely fall back to their default when storage is unavailable.
    }
  }, []);

  const toggleWireAnimations = useCallback(() => {
    const enabled = !wireAnimationsEnabledRef.current;
    wireAnimationsEnabledRef.current = enabled;
    setWireAnimationsEnabled(enabled);
    if (!enabled) {
      pendingActiveFlowIdsRef.current.clear();
      setActiveFlows({});
    }
    try {
      window.localStorage.setItem(WIRE_ANIMATION_STORAGE_KEY, String(enabled));
    } catch {
      // The toggle still applies for this session when browser storage is unavailable.
    }
  }, []);

  useEffect(() => {
    shortcutBarsRef.current = shortcutBars;
  }, [shortcutBars]);

  useEffect(() => {
    shortcutBarGroupsRef.current = shortcutBarGroups;
  }, [shortcutBarGroups]);

  const commitShortcutBars = useCallback((
    updater: (current: ShortcutBarsState) => ShortcutBarsState,
  ) => {
    setShortcutBars((current) => {
      const updated = updater(current);
      shortcutBarsRef.current = updated;
      return updated;
    });
  }, []);

  const commitShortcutBarGroups = useCallback((
    updater: (current: ShortcutBarGroup[]) => ShortcutBarGroup[],
  ) => {
    setShortcutBarGroups((current) => {
      const updated = updater(current);
      shortcutBarGroupsRef.current = updated;
      return updated;
    });
  }, []);

  const updateShortcutBar = useCallback((
    barId: ShortcutBarId,
    updater: (current: ShortcutBarConfig) => ShortcutBarConfig,
  ) => {
    commitShortcutBars((current) => ({
      ...current,
      [barId]: updater(current[barId]),
    }));
  }, [commitShortcutBars]);

  const reflowShortcutBarGroup = useCallback((group: ShortcutBarGroup) => {
    const visibleBarIds = group.barIds.filter((barId) =>
      shortcutBarsRef.current[barId].visible && shortcutBarElementsRef.current[barId],
    );
    if (visibleBarIds.length < 2) return;

    const rects = Object.fromEntries(visibleBarIds.map((barId) => {
      const bounds = shortcutBarElementsRef.current[barId]!.getBoundingClientRect();
      return [barId, {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      }];
    })) as Record<ShortcutBarId, ShortcutBarScreenRect>;
    const firstRect = rects[visibleBarIds[0]];
    const placements: Partial<Record<ShortcutBarId, { left: number; top: number }>> = {};

    if (group.axis === "horizontal") {
      let nextLeft = firstRect.left;
      visibleBarIds.forEach((barId) => {
        placements[barId] = { left: nextLeft, top: firstRect.top };
        nextLeft += rects[barId].width + SHORTCUT_BAR_GROUP_GAP;
      });
    } else {
      const centerX = firstRect.left + firstRect.width / 2;
      let nextTop = firstRect.top;
      visibleBarIds.forEach((barId) => {
        placements[barId] = {
          left: centerX - rects[barId].width / 2,
          top: nextTop,
        };
        nextTop += rects[barId].height + SHORTCUT_BAR_GROUP_GAP;
      });
    }

    const placedRects = visibleBarIds.map((barId) => ({
      left: placements[barId]!.left,
      top: placements[barId]!.top,
      right: placements[barId]!.left + rects[barId].width,
      bottom: placements[barId]!.top + rects[barId].height,
    }));
    const minLeft = Math.min(...placedRects.map((rect) => rect.left));
    const maxRight = Math.max(...placedRects.map((rect) => rect.right));
    const minTop = Math.min(...placedRects.map((rect) => rect.top));
    const maxBottom = Math.max(...placedRects.map((rect) => rect.bottom));
    let shiftX = minLeft < 8 ? 8 - minLeft : 0;
    let shiftY = minTop < 68 ? 68 - minTop : 0;
    if (maxRight + shiftX > window.innerWidth - 8) {
      shiftX += window.innerWidth - 8 - (maxRight + shiftX);
    }
    if (maxBottom + shiftY > window.innerHeight - 8) {
      shiftY += window.innerHeight - 8 - (maxBottom + shiftY);
    }

    commitShortcutBars((current) => {
      const updated = { ...current };
      visibleBarIds.forEach((barId) => {
        const placement = placements[barId]!;
        const rect = rects[barId];
        updated[barId] = {
          ...current[barId],
          position: {
            x: Math.min(98, Math.max(
              2,
              ((placement.left + shiftX + rect.width / 2) / Math.max(1, window.innerWidth)) * 100,
            )),
            y: Math.max(68, placement.top + shiftY),
          },
        };
      });
      return updated;
    });
  }, [commitShortcutBars]);

  const beginShortcutBarMove = useCallback((barId: ShortcutBarId) => {
    const group = shortcutBarGroupsRef.current.find((candidate) =>
      candidate.barIds.includes(barId),
    );
    const movingBarIds = (group?.barIds ?? [barId]).filter((candidateId) =>
      shortcutBarsRef.current[candidateId].visible,
    );
    const rects: Partial<Record<ShortcutBarId, ShortcutBarScreenRect>> = {};
    SHORTCUT_BAR_IDS.forEach((candidateId) => {
      const element = shortcutBarElementsRef.current[candidateId];
      if (!element || !shortcutBarsRef.current[candidateId].visible) return;
      const bounds = element.getBoundingClientRect();
      rects[candidateId] = {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      };
    });
    shortcutBarDragRef.current = {
      barId,
      movingBarIds,
      bars: shortcutBarsRef.current,
      rects,
      snap: null,
    };
    setShortcutBarSnapTarget(null);
  }, []);

  const moveShortcutBar = useCallback((
    barId: ShortcutBarId,
    deltaX: number,
    deltaY: number,
  ) => {
    const drag = shortcutBarDragRef.current;
    if (!drag || drag.barId !== barId) return;
    const movingRects = drag.movingBarIds
      .map((movingBarId) => drag.rects[movingBarId])
      .filter((rect): rect is ShortcutBarScreenRect => Boolean(rect));
    if (movingRects.length === 0) return;

    const minLeft = Math.min(...movingRects.map((rect) => rect.left));
    const maxRight = Math.max(...movingRects.map((rect) => rect.left + rect.width));
    const minTop = Math.min(...movingRects.map((rect) => rect.top));
    const maxBottom = Math.max(...movingRects.map((rect) => rect.top + rect.height));
    let finalDeltaX = Math.min(
      window.innerWidth - 8 - maxRight,
      Math.max(8 - minLeft, deltaX),
    );
    let finalDeltaY = Math.min(
      window.innerHeight - 8 - maxBottom,
      Math.max(68 - minTop, deltaY),
    );

    let nearestSnap: {
      candidate: ShortcutBarSnapCandidate;
      correctionX: number;
      correctionY: number;
      distance: number;
    } | null = null;
    drag.movingBarIds.forEach((movingBarId) => {
      const movingRect = drag.rects[movingBarId];
      if (!movingRect) return;
      SHORTCUT_BAR_IDS.forEach((targetBarId) => {
        if (drag.movingBarIds.includes(targetBarId)) return;
        const targetRect = drag.rects[targetBarId];
        if (!targetRect || !drag.bars[targetBarId].visible) return;
        const movedLeft = movingRect.left + finalDeltaX;
        const movedTop = movingRect.top + finalDeltaY;
        const placements = [
          {
            axis: "horizontal" as const,
            movingBeforeTarget: true,
            left: targetRect.left - SHORTCUT_BAR_GROUP_GAP - movingRect.width,
            top: targetRect.top,
          },
          {
            axis: "horizontal" as const,
            movingBeforeTarget: false,
            left: targetRect.left + targetRect.width + SHORTCUT_BAR_GROUP_GAP,
            top: targetRect.top,
          },
          {
            axis: "vertical" as const,
            movingBeforeTarget: true,
            left: targetRect.left + (targetRect.width - movingRect.width) / 2,
            top: targetRect.top - SHORTCUT_BAR_GROUP_GAP - movingRect.height,
          },
          {
            axis: "vertical" as const,
            movingBeforeTarget: false,
            left: targetRect.left + (targetRect.width - movingRect.width) / 2,
            top: targetRect.top + targetRect.height + SHORTCUT_BAR_GROUP_GAP,
          },
        ];
        placements.forEach((placement) => {
          const correctionX = placement.left - movedLeft;
          const correctionY = placement.top - movedTop;
          const distance = Math.hypot(correctionX, correctionY);
          if (distance > SHORTCUT_BAR_SNAP_DISTANCE || (nearestSnap && distance >= nearestSnap.distance)) {
            return;
          }
          const correctedDeltaX = finalDeltaX + correctionX;
          const correctedDeltaY = finalDeltaY + correctionY;
          if (
            correctedDeltaX < 8 - minLeft ||
            correctedDeltaX > window.innerWidth - 8 - maxRight ||
            correctedDeltaY < 68 - minTop ||
            correctedDeltaY > window.innerHeight - 8 - maxBottom
          ) {
            return;
          }
          nearestSnap = {
            candidate: {
              movingBarId,
              targetBarId,
              axis: placement.axis,
              movingBeforeTarget: placement.movingBeforeTarget,
            },
            correctionX,
            correctionY,
            distance,
          };
        });
      });
    });

    const resolvedSnap = nearestSnap as {
      candidate: ShortcutBarSnapCandidate;
      correctionX: number;
      correctionY: number;
      distance: number;
    } | null;
    if (resolvedSnap) {
      finalDeltaX += resolvedSnap.correctionX;
      finalDeltaY += resolvedSnap.correctionY;
    }
    const snapCandidate = resolvedSnap?.candidate ?? null;
    drag.snap = snapCandidate;
    setShortcutBarSnapTarget((current) =>
      current?.movingBarId === snapCandidate?.movingBarId &&
      current?.targetBarId === snapCandidate?.targetBarId &&
      current?.axis === snapCandidate?.axis &&
      current?.movingBeforeTarget === snapCandidate?.movingBeforeTarget
        ? current
        : snapCandidate,
    );

    commitShortcutBars((current) => {
      const updated = { ...current };
      drag.movingBarIds.forEach((movingBarId) => {
        const origin = drag.bars[movingBarId];
        updated[movingBarId] = {
          ...current[movingBarId],
          position: {
            x: origin.position.x + (finalDeltaX / Math.max(1, window.innerWidth)) * 100,
            y: origin.position.y + finalDeltaY,
          },
        };
      });
      return updated;
    });
  }, [commitShortcutBars]);

  const finishShortcutBarMove = useCallback((barId: ShortcutBarId, commit: boolean) => {
    const drag = shortcutBarDragRef.current;
    if (!drag || drag.barId !== barId) return;
    shortcutBarDragRef.current = null;
    setShortcutBarSnapTarget(null);
    if (!commit || !drag.snap) return;

    const { movingBarId, targetBarId, axis, movingBeforeTarget } = drag.snap;
    const groups = shortcutBarGroupsRef.current;
    const movingGroup = groups.find((group) => group.barIds.includes(movingBarId));
    const targetGroup = groups.find((group) => group.barIds.includes(targetBarId));
    const sortAlongAxis = (barIds: ShortcutBarId[]) => [...barIds].sort((firstId, secondId) => {
      const firstRect = shortcutBarElementsRef.current[firstId]?.getBoundingClientRect();
      const secondRect = shortcutBarElementsRef.current[secondId]?.getBoundingClientRect();
      if (!firstRect || !secondRect) return 0;
      return axis === "horizontal"
        ? firstRect.left - secondRect.left
        : firstRect.top - secondRect.top;
    });
    const movingIds = sortAlongAxis(movingGroup?.barIds ?? [movingBarId]);
    const targetIds = sortAlongAxis(targetGroup?.barIds ?? [targetBarId]);
    const mergedGroup: ShortcutBarGroup = {
      axis,
      barIds: [...new Set(
        movingBeforeTarget
          ? [...movingIds, ...targetIds]
          : [...targetIds, ...movingIds],
      )],
    };
    const mergedIds = new Set(mergedGroup.barIds);
    commitShortcutBarGroups((current) => [
      ...current.filter((group) => !group.barIds.some((candidateId) => mergedIds.has(candidateId))),
      mergedGroup,
    ]);
    window.requestAnimationFrame(() => reflowShortcutBarGroup(mergedGroup));
  }, [commitShortcutBarGroups, reflowShortcutBarGroup]);

  const rotateShortcutBar = useCallback((barId: ShortcutBarId) => {
    const group = shortcutBarGroupsRef.current.find((candidate) => candidate.barIds.includes(barId));
    if (!group) {
      updateShortcutBar(barId, (current) => ({
        ...current,
        rotation: current.rotation === 0 ? 90 : 0,
      }));
      return;
    }

    const groupedBarIds = new Set(group.barIds);
    commitShortcutBars((current) => {
      const updated = { ...current };
      group.barIds.forEach((groupedBarId) => {
        updated[groupedBarId] = {
          ...current[groupedBarId],
          rotation: current[groupedBarId].rotation === 0 ? 90 : 0,
        };
      });
      return updated;
    });
    const rotatedGroup: ShortcutBarGroup = {
      ...group,
      axis: group.axis === "horizontal" ? "vertical" : "horizontal",
    };
    commitShortcutBarGroups((current) => current.map((candidate) =>
      candidate.barIds.some((candidateBarId) => groupedBarIds.has(candidateBarId))
        ? rotatedGroup
        : candidate
    ));
    window.requestAnimationFrame(() => reflowShortcutBarGroup(rotatedGroup));
  }, [commitShortcutBarGroups, commitShortcutBars, reflowShortcutBarGroup, updateShortcutBar]);

  const finishShortcutBarResize = useCallback((barId: ShortcutBarId) => {
    const group = shortcutBarGroupsRef.current.find((candidate) => candidate.barIds.includes(barId));
    if (group) window.requestAnimationFrame(() => reflowShortcutBarGroup(group));
  }, [reflowShortcutBarGroup]);

  const separateShortcutBarGroup = useCallback((barId: ShortcutBarId) => {
    commitShortcutBarGroups((current) =>
      current.filter((group) => !group.barIds.includes(barId)),
    );
  }, [commitShortcutBarGroups]);

  const toggleShortcutBarVisibility = useCallback((barId: ShortcutBarId) => {
    const willBeVisible = !shortcutBarsRef.current[barId].visible;
    updateShortcutBar(barId, (current) => ({ ...current, visible: willBeVisible }));
    if (!willBeVisible) separateShortcutBarGroup(barId);
  }, [separateShortcutBarGroup, updateShortcutBar]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) throw new Error("Save data is not a slot list.");
        const nextSlots = makeEmptySaveSlots();
        for (let index = 0; index < SAVE_SLOT_COUNT; index += 1) {
          const candidate = parsed[index];
          if (candidate == null) continue;
          if (!isSaveGameSlot(candidate)) throw new Error(`Save slot ${index + 1} is invalid.`);
          nextSlots[index] = candidate;
        }
        setSaveSlots(nextSlots);
        setSaveNames(nextSlots.map((slot, index) => slot?.name ?? `Save ${index + 1}`));
      }
    } catch {
      toast.error("Local saves could not be read", {
        description: "The existing save data is incompatible or damaged. New saves can still overwrite it.",
      });
    }
    try {
      const rawTemporarySave = window.localStorage.getItem(TEMPORARY_SAVE_STORAGE_KEY);
      if (rawTemporarySave) {
        const parsedTemporarySave = JSON.parse(rawTemporarySave) as unknown;
        if (!isSaveGameSlot(parsedTemporarySave)) {
          throw new Error("Temporary save data is invalid.");
        }
        setTemporarySave({
          ...parsedTemporarySave,
          name: formatTemporarySaveName(parsedTemporarySave.savedAt),
        });
      }
    } catch {
      toast.error("Temporary save could not be read", {
        description: "A new temporary save will replace it after the configured play interval.",
      });
    }
    try {
      const rawFrequency = window.localStorage.getItem(TEMPORARY_SAVE_FREQUENCY_STORAGE_KEY);
      const storedFrequency = Math.floor(Number(rawFrequency));
      if (
        rawFrequency &&
        storedFrequency >= MIN_TEMPORARY_SAVE_FREQUENCY_MINUTES &&
        storedFrequency <= MAX_TEMPORARY_SAVE_FREQUENCY_MINUTES
      ) {
        setTemporarySaveFrequencyMinutes(storedFrequency);
        setTemporarySaveFrequencyDraft(storedFrequency);
      }
    } catch {
      // The default interval remains available when the preference cannot be read.
    }
  }, []);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    selectedNodesRef.current = selectedNodes;
  }, [selectedNodes]);

  useEffect(() => {
    controlGroupsRef.current = controlGroups;
  }, [controlGroups]);

  useEffect(() => {
    individualControlNodeRef.current = individualControlNodeId;
  }, [individualControlNodeId]);

  useEffect(() => {
    activeMapSectorRef.current = activeMapSector;
  }, [activeMapSector]);

  useEffect(() => {
    const resourceCapacity = getMapNodeStartingResourceCapacity(activeMapSector);
    setRuntime((current) => {
      const next: Runtime = {
        ...current,
        ironOre: normalizeBaseResourceState(current.ironOre, resourceCapacity),
        copperOre: normalizeBaseResourceState(current.copperOre, resourceCapacity),
        stone: normalizeBaseResourceState(current.stone, resourceCapacity),
        forest: {
          ...normalizeBaseResourceState(current.forest, resourceCapacity),
          regenerationElapsed: Math.max(0, Number(current.forest.regenerationElapsed) || 0),
        },
      };
      runtimeRef.current = next;
      return next;
    });
  }, [activeMapSector]);

  useEffect(() => {
    mapNodeProgressRef.current = mapNodeProgress;
  }, [mapNodeProgress]);

  useEffect(() => {
    if (mapFactoriesGeneratedAtStartRef.current) return;
    mapFactoriesGeneratedAtStartRef.current = true;
    mapFactoriesRef.current = generateMapFactoriesAtGameStart(
      runtimeRef.current,
      MIN_ZOOM,
    );
  }, []);

  useEffect(() => {
    runtimeRef.current = runtime;
  }, [runtime]);

  const areaExpansionLevel = getAreaExpansionLevel(runtime.research);
  useEffect(() => {
    if (areaExpansionLevel <= appliedAreaExpansionLayoutLevelRef.current) {
      appliedAreaExpansionLayoutLevelRef.current = areaExpansionLevel;
      return;
    }
    appliedAreaExpansionLayoutLevelRef.current = areaExpansionLevel;
    mapFactoriesRef.current = Object.fromEntries(
      Object.entries(mapFactoriesRef.current).map(([sectorKey, factory]) => [
        sectorKey,
        isMapNodeUnlocked(mapNodeProgressRef.current, sectorKey)
          ? factory
          : redistributeUnknownMapFactoryForExpansion(
              factory,
              sectorKey,
              runtimeRef.current.research,
            ),
      ]),
    );
  }, [areaExpansionLevel]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    if (!configuringAssemblerId) setHoveredRecipeOptionId(null);
  }, [configuringAssemblerId]);

  const unlockAchievement = useCallback((achievementId: AchievementId) => {
    if (unlockedAchievementsRef.current.has(achievementId)) return;
    const next = new Set(unlockedAchievementsRef.current);
    next.add(achievementId);
    unlockedAchievementsRef.current = next;
    setUnlockedAchievements(next);
    if (!journalOpen) setJournalAttention(true);
    const achievement = ACHIEVEMENT_UNLOCK_DETAILS[achievementId];
    toast(`${achievement.title} achievement unlocked`, {
      id: `achievement-unlocked-${achievementId}`,
      description: achievement.flavorText,
      icon: <Trophy aria-hidden="true" />,
      className: "achievement-unlock-toast",
      duration: 6500,
    });
  }, [journalOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const elapsed = gameElapsedMsRef.current;
      if (stoneCollectSecondHintActiveRef.current) return;
      if (stoneCollectSecondHintPendingRef.current) {
        if (
          elapsed - lastPlayerActivityElapsedRef.current <
          SUBSEQUENT_COLLECT_HINT_DELAY_MS
        ) return;
        stoneCollectSecondHintPendingRef.current = false;
        stoneCollectSecondHintActiveRef.current = true;
        starterTutorialSeenRef.current.stoneSecond = true;
        setStoneCollectHintEncouraging(true);
        setStoneCollectHintVisible(true);
        return;
      }
      if (stoneCollectHintActivatedRef.current) return;
      if (!stoneCollectHintDismissedRef.current) {
        const hasCollectedResource = Array.from(STARTING_INVENTORY_ITEM_TYPES).some(
          (type) => (runtimeRef.current.produced[type] ?? 0) > 0,
        );
        if (hasCollectedResource) {
          stoneCollectHintDismissedRef.current = true;
        } else {
          if (elapsed < STONE_COLLECT_HINT_DELAY_MS) return;
          stoneCollectHintActivatedRef.current = true;
          starterTutorialSeenRef.current.stoneFirst = true;
          setStoneCollectHintEncouraging(false);
          setStoneCollectHintVisible(true);
          return;
        }
      }

      const availability = getBuildMaterialAvailability(
        runtimeRef.current,
        nodesRef.current,
        connectionsRef.current,
      );
      const stoneAvailable = availability[ResourceType.STONE].total;
      const woodAvailable = availability[ResourceType.WOOD].total;
      if (!forestCollectHintDismissedRef.current) {
        if (woodAvailable >= 2) {
          forestCollectHintDismissedRef.current = true;
          forestCollectHintActivatedRef.current = false;
          forestCollectSecondHintPendingRef.current = false;
          forestCollectSecondHintActiveRef.current = false;
          setForestCollectHintVisible(false);
        } else {
          if (
            forestCollectHintActivatedRef.current ||
            forestCollectSecondHintActiveRef.current
          ) return;
          if (forestCollectSecondHintPendingRef.current) {
            if (
              elapsed - lastPlayerActivityElapsedRef.current <
              SUBSEQUENT_COLLECT_HINT_DELAY_MS
            ) return;
            forestCollectSecondHintPendingRef.current = false;
            forestCollectSecondHintActiveRef.current = true;
            starterTutorialSeenRef.current.forestSecond = true;
            setForestCollectHintEncouraging(true);
            setForestCollectHintVisible(true);
            return;
          }
          if (stoneAvailable < 2) {
            forestCollectHintEligibleAtRef.current = 0;
            return;
          }
          if (forestCollectHintEligibleAtRef.current <= 0) {
            forestCollectHintEligibleAtRef.current = elapsed;
            return;
          }
          const inactiveSince = Math.max(
            forestCollectHintEligibleAtRef.current,
            lastPlayerActivityElapsedRef.current,
          );
          if (elapsed - inactiveSince < SUBSEQUENT_COLLECT_HINT_DELAY_MS) return;
          if (woodAvailable >= 1) {
            forestCollectSecondHintActiveRef.current = true;
            starterTutorialSeenRef.current.forestSecond = true;
            setForestCollectHintEncouraging(true);
          } else {
            forestCollectHintActivatedRef.current = true;
            starterTutorialSeenRef.current.forestFirst = true;
            setForestCollectHintEncouraging(false);
          }
          setForestCollectHintVisible(true);
          return;
        }
      }

      const placedExtractor = nodesRef.current.find(
        (node) =>
          node.kind === "extractor" &&
          placingNodeRef.current !== node.id,
      );
      if (placedExtractor && starterBuildHintStageRef.current !== "complete") {
        starterBuildHintStageRef.current = "complete";
        starterBuildHintEligibleAtRef.current = 0;
        setStarterBuildHintTarget(null);
      }
      if (starterBuildHintStageRef.current === "waiting") {
        if (stoneAvailable < 2 || woodAvailable < 2) {
          starterBuildHintEligibleAtRef.current = 0;
          return;
        }
        if (starterBuildHintEligibleAtRef.current <= 0) {
          starterBuildHintEligibleAtRef.current = elapsed;
          return;
        }
        const buildHintInactiveSince = Math.max(
          starterBuildHintEligibleAtRef.current,
          lastPlayerActivityElapsedRef.current,
        );
        if (elapsed - buildHintInactiveSince < SUBSEQUENT_COLLECT_HINT_DELAY_MS) return;
        starterBuildHintStageRef.current = "menu";
        starterTutorialSeenRef.current.extractorBuilding = true;
        setStarterBuildHintTarget("menu");
        return;
      }
      if (starterBuildHintStageRef.current !== "complete") return;

      if (!placedExtractor) {
        starterConnectionHintStageRef.current = "waiting";
        starterConnectionHintEligibleAtRef.current = 0;
        setConnectionTutorialExtractorId(null);
        return;
      }
      const nodeKinds = new Map(nodesRef.current.map((node) => [node.id, node.kind] as const));
      const extractorConnected = connectionsRef.current.some(
        (connection) => {
          const sourceKind = nodeKinds.get(connection.sourceNode);
          return connection.targetNode === placedExtractor.id &&
            connection.targetPort === "resource-in" &&
            Boolean(sourceKind && isResourceNodeKind(sourceKind));
        },
      );
      if (extractorConnected) {
        if (starterConnectionHintStageRef.current !== "complete") {
          starterTutorialOutroEligibleAtRef.current = elapsed;
        }
        starterConnectionHintStageRef.current = "complete";
        starterConnectionHintEligibleAtRef.current = 0;
        setConnectionTutorialExtractorId(null);
        if (
          !starterTutorialOutroShownRef.current &&
          hasSeenEveryStarterTutorial(starterTutorialSeenRef.current)
        ) {
          if (starterTutorialOutroEligibleAtRef.current <= 0) {
            starterTutorialOutroEligibleAtRef.current = elapsed;
            return;
          }
          const outroInactiveSince = Math.max(
            starterTutorialOutroEligibleAtRef.current,
            lastPlayerActivityElapsedRef.current,
          );
          if (elapsed - outroInactiveSince >= SUBSEQUENT_COLLECT_HINT_DELAY_MS) {
            starterTutorialOutroShownRef.current = true;
            unlockAchievement("handHolding");
            setStarterTutorialOutroOpen(true);
          }
        }
        return;
      }
      if (starterConnectionHintStageRef.current === "active") {
        setConnectionTutorialExtractorId((current) =>
          current === placedExtractor.id ? current : placedExtractor.id
        );
        return;
      }
      if (starterConnectionHintStageRef.current === "complete") return;
      if (starterConnectionHintEligibleAtRef.current <= 0) {
        starterConnectionHintEligibleAtRef.current = elapsed;
        return;
      }
      const connectionHintInactiveSince = Math.max(
        starterConnectionHintEligibleAtRef.current,
        lastPlayerActivityElapsedRef.current,
      );
      if (elapsed - connectionHintInactiveSince < SUBSEQUENT_COLLECT_HINT_DELAY_MS) return;
      starterConnectionHintStageRef.current = "active";
      starterTutorialSeenRef.current.connectionMaking = true;
      setConnectionTutorialExtractorId(placedExtractor.id);
    }, 500);
    return () => window.clearInterval(timer);
  }, [unlockAchievement]);

  const recordRapidNodeClick = useCallback((nodeId: NodeId) => {
    const now = performance.now();
    const recentClicks = (rapidClickTimestampsRef.current[nodeId] ?? [])
      .filter((timestamp) => now - timestamp <= RAPID_CLICK_WINDOW_MS);
    recentClicks.push(now);
    if (recentClicks.length < RAPID_CLICK_TARGET) {
      rapidClickTimestampsRef.current[nodeId] = recentClicks;
      return;
    }
    rapidClickTimestampsRef.current[nodeId] = [];

    const variant = Math.floor(Math.random() * 5) as RapidClickAnimationVariant;
    setRapidClickAnimations((current) => ({
      ...current,
      [nodeId]: { token: Date.now(), variant },
    }));
    const previousTimeout = rapidClickAnimationTimeoutsRef.current[nodeId];
    if (previousTimeout) window.clearTimeout(previousTimeout);
    rapidClickAnimationTimeoutsRef.current[nodeId] = window.setTimeout(() => {
      setRapidClickAnimations((current) => {
        if (!current[nodeId]) return current;
        const updated = { ...current };
        delete updated[nodeId];
        return updated;
      });
      delete rapidClickAnimationTimeoutsRef.current[nodeId];
    }, RAPID_CLICK_ANIMATION_DURATION_MS);

    const sequence = rapidClickSequenceRef.current;
    const nextCount = now - sequence.lastAt <= RAPID_CLICK_SEQUENCE_WINDOW_MS
      ? sequence.count + 1
      : 1;
    if (nextCount >= 3) {
      rapidClickSequenceRef.current = { count: 0, lastAt: 0 };
      setRapidClickWarningOpen(true);
    } else {
      rapidClickSequenceRef.current = { count: nextCount, lastAt: now };
    }
  }, []);

  useEffect(() => () => {
    Object.values(rapidClickAnimationTimeoutsRef.current).forEach((timeout) => {
      window.clearTimeout(timeout);
    });
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!isRunningRef.current) return;
      const now = Date.now();
      const activeSector = activeMapSectorRef.current;
      let changed = false;
      let researchChanged = false;
      let inactiveResearchProgressChanged = false;
      let sharedResearch = runtimeRef.current.research;
      let sharedMapPoints = runtimeRef.current.mapPoints;
      const advancedFactories: MapFactoriesBySector = {};
      Object.entries(mapFactoriesRef.current).forEach(([sectorKey, factory]) => {
        if (
          sectorKey === activeSector ||
          !isMapNodeUnlocked(mapNodeProgressRef.current, sectorKey)
        ) {
          advancedFactories[sectorKey] = factory;
          return;
        }
        const elapsed = Math.max(0, now - factory.lastSimulatedAt);
        if (elapsed <= 0) {
          advancedFactories[sectorKey] = factory;
          return;
        }
        changed = true;
        const previousResearchProgress = Object.values(factory.runtime.researchFoundries)
          .reduce((total, foundry) => total + foundry.progress, 0);
        const advanced = advanceMapFactoryInBackground(factory, {
          sectorKey,
          elapsedMs: elapsed,
          sharedResearch,
          sharedMapPoints,
        });
        advancedFactories[sectorKey] = advanced;
        const nextResearchProgress = Object.values(advanced.runtime.researchFoundries)
          .reduce((total, foundry) => total + foundry.progress, 0);
        if (nextResearchProgress !== previousResearchProgress) {
          inactiveResearchProgressChanged = true;
        }
        if (
          JSON.stringify(advanced.runtime.research) !== JSON.stringify(sharedResearch) ||
          advanced.runtime.mapPoints !== sharedMapPoints
        ) {
          sharedResearch = advanced.runtime.research;
          sharedMapPoints = advanced.runtime.mapPoints;
          researchChanged = true;
        }
      });
      const transferred = transferRoadItemsAcrossMaps(
        activeSector,
        runtimeRef.current,
        changed ? advancedFactories : mapFactoriesRef.current,
        mapNodeProgressRef.current,
      );
      let nextMapFactories = transferred.mapFactories;
      let nextActiveRuntime = transferred.activeRuntime;
      if (researchChanged) {
        nextActiveRuntime = {
          ...nextActiveRuntime,
          mapPoints: sharedMapPoints,
          research: {
            ...sharedResearch,
            progress: { ...sharedResearch.progress },
          },
        };
        nextMapFactories = Object.fromEntries(
          Object.entries(nextMapFactories).map(([sectorKey, factory]) => [
            sectorKey,
            {
              ...factory,
              runtime: {
                ...factory.runtime,
                mapPoints: sharedMapPoints,
                research: {
                  ...sharedResearch,
                  progress: { ...sharedResearch.progress },
                },
              },
            },
          ]),
        );
      }
      if (changed || transferred.factoriesChanged) {
        mapFactoriesRef.current = nextMapFactories;
      }
      if (transferred.activeChanged || researchChanged) {
        runtimeRef.current = nextActiveRuntime;
        lastPublishedRuntimeSignatureRef.current = null;
        setRuntime(nextActiveRuntime);
      } else if (inactiveResearchProgressChanged) {
        setBackgroundResearchRevision((revision) => revision + 1);
      }
    }, BACKGROUND_SIMULATION_STEP_MS);
    return () => window.clearInterval(timer);
  }, []);

  const controlGroupByNodeId = useMemo(() => {
    const groups = new Map<NodeId, ControlGroup>();
    controlGroups.forEach((group) => {
      group.nodeIds.forEach((nodeId) => groups.set(nodeId, group));
    });
    return groups;
  }, [controlGroups]);

  const announceMultiNodeSelection = useCallback((nodeIds: Iterable<NodeId>) => {
    const availableNodeIds = new Set(nodesRef.current.map((node) => node.id));
    const selectedCount = Array.from(new Set(nodeIds)).filter(
      (nodeId) => availableNodeIds.has(nodeId),
    ).length;
    if (selectedCount < 2 || controlGroupTutorialSuppressedRef.current) return;

    setSuppressControlGroupTutorial(false);
    setControlGroupOnboardingOpen(true);
  }, []);

  const requestControlGroupCreation = useCallback((nodeIds: Iterable<NodeId>) => {
    const availableNodeIds = new Set(nodesRef.current.map((node) => node.id));
    const nextNodeIds = Array.from(new Set(nodeIds)).filter((nodeId) => availableNodeIds.has(nodeId));
    if (nextNodeIds.length < 2) return;
    selectedNodesRef.current = nextNodeIds;
    setSelectedNodes(nextNodeIds);
    setActiveControlGroupId(null);
    individualControlNodeRef.current = null;
    setIndividualControlNodeId(null);
    setPendingControlGroupNodeIds(nextNodeIds);
    setControlGroupColorOpen(true);
  }, []);

  const createControlGroup = useCallback((color: typeof CONTROL_GROUP_COLORS[number]) => {
    const availableNodeIds = new Set(nodesRef.current.map((node) => node.id));
    const nodeIds = Array.from(new Set(pendingControlGroupNodeIds))
      .filter((nodeId) => availableNodeIds.has(nodeId));
    if (nodeIds.length < 2) {
      setControlGroupColorOpen(false);
      setPendingControlGroupNodeIds([]);
      return;
    }

    const groupedNodeIds = new Set(nodeIds);
    const group: ControlGroup = {
      id: `control-group-${Date.now()}-${++controlGroupSequenceRef.current}`,
      nodeIds,
      color: color.value,
      colorName: color.name,
    };
    const nextGroups = controlGroupsRef.current
      .map((current) => ({
        ...current,
        nodeIds: current.nodeIds.filter((nodeId) => !groupedNodeIds.has(nodeId)),
      }))
      .filter((current) => current.nodeIds.length >= 2)
      .concat(group);
    controlGroupsRef.current = nextGroups;
    setControlGroups(nextGroups);
    selectedNodesRef.current = nodeIds;
    prioritizedBoxSelectionRef.current = [];
    setSelectedNodes(nodeIds);
    setActiveControlGroupId(group.id);
    individualControlNodeRef.current = null;
    setIndividualControlNodeId(null);
    setPendingControlGroupNodeIds([]);
    setControlGroupColorOpen(false);
    toast.success(`${color.name} control group created`, {
      description: `${nodeIds.length} nodes will select and move together.`,
    });
  }, [pendingControlGroupNodeIds]);

  const disbandControlGroup = useCallback((groupId: string) => {
    const group = controlGroupsRef.current.find((candidate) => candidate.id === groupId);
    if (!group) return;
    const nextGroups = controlGroupsRef.current.filter((candidate) => candidate.id !== groupId);
    controlGroupsRef.current = nextGroups;
    setControlGroups(nextGroups);
    setActiveControlGroupId((current) => current === groupId ? null : current);
    if (individualControlNodeRef.current && group.nodeIds.includes(individualControlNodeRef.current)) {
      individualControlNodeRef.current = null;
    }
    setIndividualControlNodeId((current) => current && group.nodeIds.includes(current) ? null : current);
    setPendingDisbandControlGroupId(null);
    setDisbandControlGroupOpen(false);
    inventoryOverflowActionRef.current = null;
    setInventoryOverflowPrompt(null);
    setInventoryOverflowDialogOpen(false);
    toast.success("Control group disbanded", {
      description: `${group.nodeIds.length} nodes remain in place and can be controlled separately.`,
    });
  }, []);

  const requestInventoryOverflowConfirmation = useCallback((
    prompt: InventoryOverflowPrompt,
    onConfirm: () => void,
  ) => {
    inventoryOverflowActionRef.current = onConfirm;
    setInventoryOverflowPrompt(prompt);
    setSuppressFutureInventoryOverflowWarnings(false);
    setConnectionDeleteDialogOpen(false);
    setPendingDeletionConnectionId(null);
    setMultiConnectionManagerOpen(false);
    setManagedMultiPort(null);
    setInventoryOverflowDialogOpen(true);
  }, []);

  const rememberInventoryOverflowSuppression = useCallback(() => {
    inventoryOverflowWarningSuppressedRef.current = true;
  }, []);

  const confirmInventoryOverflow = useCallback(() => {
    const action = inventoryOverflowActionRef.current;
    const discardedCount = inventoryOverflowPrompt?.loss.reduce(
      (total, [, amount]) => total + amount,
      0,
    ) ?? 0;
    if (suppressFutureInventoryOverflowWarnings) {
      rememberInventoryOverflowSuppression();
    }
    inventoryOverflowActionRef.current = null;
    setInventoryOverflowDialogOpen(false);
    setInventoryOverflowPrompt(null);
    setSuppressFutureInventoryOverflowWarnings(false);
    action?.();
    if (action && discardedCount > 0) {
      toast.warning("Action completed with material loss", {
        description: `${discardedCount} overflow ${discardedCount === 1 ? "item was" : "items were"} permanently destroyed.`,
      });
    }
  }, [
    inventoryOverflowPrompt,
    rememberInventoryOverflowSuppression,
    suppressFutureInventoryOverflowWarnings,
  ]);

  useLayoutEffect(() => {
    const viewport = workspaceRef.current;
    if (!viewport) return;
    const updateSize = () => {
      const next = { width: viewport.clientWidth, height: viewport.clientHeight };
      setViewportSize((current) =>
        current.width === next.width && current.height === next.height ? current : next,
      );
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const measureAnchors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const next: Record<string, Position> = {};
    Object.entries(portRefs.current).forEach(([key, element]) => {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      next[key] = {
        x: (rect.left - canvasRect.left + rect.width / 2) / zoomRef.current,
        y: (rect.top - canvasRect.top + rect.height / 2) / zoomRef.current,
      };
    });
    anchorsRef.current = next;
    setAnchors(next);
  }, []);

  useEffect(() => {
    const shouldEnable = runtime.research.treePlanterUnlocked;
    const forest = nodesRef.current.find((node) => node.kind === "forest");
    const isEnabled = Boolean(
      forest?.inputs.some((port) => port.id === FOREST_GROWTH_INPUT.id),
    );
    if (!forest || shouldEnable === isEnabled) return;

    const nextNodes = nodesRef.current.map((node) =>
      node.kind === "forest"
        ? {
            ...node,
            inputs: shouldEnable
              ? [...node.inputs, FOREST_GROWTH_INPUT]
              : node.inputs.filter((port) => port.id !== FOREST_GROWTH_INPUT.id),
          }
        : node,
    );
    nodesRef.current = nextNodes;
    setNodes(nextNodes);

    if (!shouldEnable) {
      const nextConnections = connectionsRef.current.filter(
        (connection) =>
          connection.targetNode !== forest.id ||
          connection.targetPort !== FOREST_GROWTH_INPUT.id,
      );
      connectionsRef.current = nextConnections;
      setConnections(nextConnections);
    }

    window.requestAnimationFrame(measureAnchors);
  }, [measureAnchors, runtime.research.treePlanterUnlocked]);

  const updateGridPosition = useCallback(() => {
    const viewport = workspaceRef.current;
    if (!viewport) return;
    const minor = 24 * zoomRef.current;
    const major = 120 * zoomRef.current;
    viewport.style.setProperty("--minor-grid-x", `${-(viewport.scrollLeft % minor)}px`);
    viewport.style.setProperty("--minor-grid-y", `${-(viewport.scrollTop % minor)}px`);
    viewport.style.setProperty("--major-grid-x", `${-(viewport.scrollLeft % major)}px`);
    viewport.style.setProperty("--major-grid-y", `${-(viewport.scrollTop % major)}px`);
  }, []);

  const handleWorkspaceScroll = useCallback(() => {
    updateGridPosition();
  }, [updateGridPosition]);

  useLayoutEffect(() => {
    measureAnchors();
  }, [measureAnchors, positions, viewportSize]);

  useEffect(() => {
    window.addEventListener("resize", measureAnchors);
    return () => window.removeEventListener("resize", measureAnchors);
  }, [measureAnchors]);

  const focusHome = useCallback(() => {
    const viewport = workspaceRef.current;
    if (!viewport) return;
    window.requestAnimationFrame(() => {
      const resourceWidth = STARTING_RESOURCE_BOUNDS.right - STARTING_RESOURCE_BOUNDS.left;
      const resourceHeight = STARTING_RESOURCE_BOUNDS.bottom - STARTING_RESOURCE_BOUNDS.top;
      const availableWidth = Math.max(
        1,
        viewport.clientWidth - STARTING_RESOURCE_VIEW_PADDING * 2,
      );
      const availableHeight = Math.max(
        1,
        viewport.clientHeight - STARTING_RESOURCE_VIEW_PADDING * 2,
      );
      const startingZoom = clampZoom(Math.min(
        STARTING_ZOOM_MAX,
        availableWidth / resourceWidth,
        availableHeight / resourceHeight,
      ));
      const resourceCenterX = (
        STARTING_RESOURCE_BOUNDS.left + STARTING_RESOURCE_BOUNDS.right
      ) / 2;
      const resourceCenterY = (
        STARTING_RESOURCE_BOUNDS.top + STARTING_RESOURCE_BOUNDS.bottom
      ) / 2;
      zoomRef.current = startingZoom;
      pinchTargetZoomRef.current = startingZoom;
      flushSync(() => setZoom(startingZoom));
      viewport.scrollLeft = Math.max(
        0,
        resourceCenterX * startingZoom - viewport.clientWidth / 2,
      );
      viewport.scrollTop = Math.max(
        0,
        resourceCenterY * startingZoom - viewport.clientHeight / 2,
      );
      updateGridPosition();
      measureAnchors();
    });
  }, [measureAnchors, updateGridPosition]);

  useLayoutEffect(() => {
    if (didInitialFocusRef.current || viewportSize.width <= 0 || viewportSize.height <= 0) return;
    didInitialFocusRef.current = true;
    focusHome();
  }, [focusHome, viewportSize]);

  const pointFromEvent = useCallback((clientX: number, clientY: number): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / zoomRef.current,
      y: (clientY - rect.top) / zoomRef.current,
    };
  }, []);

  const getPortWorldPosition = useCallback((nodeId: NodeId, portId: string) => {
    const key = `${nodeId}:${portId}`;
    const cached = anchorsRef.current[key];
    if (cached) return cached;
    const element = portRefs.current[key];
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return pointFromEvent(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, [pointFromEvent]);

  const updateSnappedPort = useCallback((next: PortHandle | null) => {
    snappedPortRef.current = next;
    setSnappedPort((current) => {
      if (
        current?.nodeId === next?.nodeId &&
        current?.port.id === next?.port.id
      ) return current;
      return next;
    });
  }, []);

  const updatePlacementBlocked = useCallback((blocked: boolean) => {
    placementBlockedRef.current = blocked;
    setPlacementBlocked((current) => current === blocked ? current : blocked);
  }, []);

  const captureGraphUndoSnapshot = useCallback((): GraphUndoSnapshot => ({
    nodes: nodesRef.current.map((node) => ({
      ...node,
      inputs: node.inputs.map((port) => ({ ...port })),
      outputs: node.outputs.map((port) => ({ ...port })),
    })),
    positions: Object.fromEntries(
      Object.entries(positionsRef.current).map(([nodeId, position]) => [
        nodeId,
        { ...position },
      ]),
    ),
    connections: connectionsRef.current.map((connection) => ({ ...connection })),
    runtime: structuredClone(runtimeRef.current),
    controlGroups: controlGroupsRef.current.map((group) => ({
      ...group,
      nodeIds: [...group.nodeIds],
    })),
  }), []);

  const pushUndoEntry = useCallback((entry: UndoEntry) => {
    const history = undoHistoryRef.current;
    undoHistoryRef.current = [
      ...history.slice(Math.max(0, history.length - MAX_UNDO_HISTORY + 1)),
      entry,
    ];
  }, []);

  const restoreGraphUndoSnapshot = useCallback((snapshot: GraphUndoSnapshot) => {
    if (!snapshot.nodes.some((node) => isExtractorKind(node.kind))) {
      toast.error("At least one extractor must remain on the field.");
      return false;
    }

    const restoredNodes = snapshot.nodes.map((node) => ({
      ...node,
      inputs: node.inputs.map((port) => ({ ...port })),
      outputs: node.outputs.map((port) => ({ ...port })),
    }));
    const restoredPositions = Object.fromEntries(
      Object.entries(snapshot.positions).map(([nodeId, position]) => [
        nodeId,
        { ...position },
      ]),
    );
    const restoredConnections = snapshot.connections.map((connection) => ({ ...connection }));
    const restoredRuntime = structuredClone(snapshot.runtime);
    const restoredControlGroups = snapshot.controlGroups.map((group) => ({
      ...group,
      nodeIds: [...group.nodeIds],
    }));
    if (snapshot.mapFactoryStates) {
      mapFactoriesRef.current = {
        ...mapFactoriesRef.current,
        ...structuredClone(snapshot.mapFactoryStates),
      };
    }
    if (snapshot.mapFactoryRuntimes) {
      mapFactoriesRef.current = Object.fromEntries(
        Object.entries(mapFactoriesRef.current).map(([sectorKey, factory]) => {
          const restoredRuntime = snapshot.mapFactoryRuntimes?.[sectorKey];
          return [sectorKey, restoredRuntime
            ? { ...factory, runtime: cloneStoredMaterialRuntime(restoredRuntime) }
            : factory];
        }),
      );
    }

    nodesRef.current = restoredNodes;
    positionsRef.current = restoredPositions;
    connectionsRef.current = restoredConnections;
    runtimeRef.current = restoredRuntime;
    controlGroupsRef.current = restoredControlGroups;
    setNodes(restoredNodes);
    setPositions(restoredPositions);
    setConnections(restoredConnections);
    setRuntime(restoredRuntime);
    setControlGroups(restoredControlGroups);
    setActiveFlows({});
    setSelectedConnection(null);
    selectedNodesRef.current = [];
    prioritizedBoxSelectionRef.current = [];
    setSelectedNodes([]);
    setActiveControlGroupId(null);
    individualControlNodeRef.current = null;
    setIndividualControlNodeId(null);
    setPendingControlGroupNodeIds([]);
    setPendingDeletionNodeIds([]);
    setPendingDeletionDetails(null);
    setPendingDeletionIsHighlightedGroup(false);
    setSuppressFutureNodeDestructionWarnings(false);
    setDestroyDialogOpen(false);
    setPendingDeletionConnectionId(null);
    setConnectionDeleteDialogOpen(false);
    inventoryOverflowActionRef.current = null;
    setInventoryOverflowPrompt(null);
    setInventoryOverflowDialogOpen(false);
    connectionDragRef.current = null;
    updateSnappedPort(null);
    setConnecting(null);
    setHoveredPort(null);
    setWirePointer(null);
    setRewiringConnectionId(null);
    placingNodeRef.current = null;
    repeatPlacementPreviewRef.current = null;
    continuousReplicationRef.current = false;
    pendingPlacementUndoRef.current = null;
    setPlacingNodeId(null);
    updatePlacementBlocked(false);
    insertionTargetRef.current = null;
    setInsertionTarget(null);
    dragRef.current = null;
    setDraggingNode(null);
    setDragCollisionBlocked(false);
    lastSimulationTickRef.current = performance.now();
    lastPublishedRuntimeSignatureRef.current = null;
    window.requestAnimationFrame(measureAnchors);
    return true;
  }, [measureAnchors, updatePlacementBlocked, updateSnappedPort]);

  const undoLastAction = useCallback(() => {
    const pendingPlacement = pendingPlacementUndoRef.current;
    if (placingNodeRef.current && pendingPlacement) {
      return restoreGraphUndoSnapshot(pendingPlacement.snapshot);
    }

    const entry = undoHistoryRef.current.pop();
    if (!entry) return false;
    if (entry.kind === "graph") {
      if (!restoreGraphUndoSnapshot(entry.snapshot)) {
        undoHistoryRef.current.push(entry);
        return false;
      }
      return true;
    }

    const availableNodeIds = new Set(nodesRef.current.map((node) => node.id));
    const restoredNodeIds = Object.keys(entry.positions).filter((nodeId) =>
      availableNodeIds.has(nodeId),
    );
    if (!restoredNodeIds.length) return true;
    const restoredPositions = { ...positionsRef.current };
    restoredNodeIds.forEach((nodeId) => {
      const position = entry.positions[nodeId];
      if (position) restoredPositions[nodeId] = { ...position };
    });
    positionsRef.current = restoredPositions;
    setPositions(restoredPositions);
    selectedNodesRef.current = restoredNodeIds;
    setSelectedNodes(restoredNodeIds);
    setSelectedConnection(null);
    window.requestAnimationFrame(measureAnchors);
    return true;
  }, [measureAnchors, restoreGraphUndoSnapshot]);

  const rotateHoveredJoint = useCallback(() => {
    const nodeId = hoveredNodeIdRef.current;
    const node = nodeId
      ? nodesRef.current.find((candidate) => candidate.id === nodeId)
      : null;
    if (!nodeId || node?.kind !== "joint") return false;

    const undoSnapshot = captureGraphUndoSnapshot();
    const current = runtimeRef.current;
    const joint = current.joints[nodeId] ?? {
      bufferedType: null,
      orientation: "horizontal" as const,
    };
    const next: Runtime = {
      ...current,
      joints: {
        ...current.joints,
        [nodeId]: {
          ...joint,
          orientation: joint.orientation === "vertical" ? "horizontal" : "vertical",
        },
      },
    };
    runtimeRef.current = next;
    lastPublishedRuntimeSignatureRef.current = null;
    setRuntime(next);
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    window.requestAnimationFrame(measureAnchors);
    return true;
  }, [captureGraphUndoSnapshot, measureAnchors, pushUndoEntry]);

  const toggleRoadMode = useCallback((nodeId: NodeId) => {
    const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
    const currentRoad = runtimeRef.current.roads[nodeId];
    if (node?.kind !== "road" || !currentRoad) return false;
    const pairedFactory = currentRoad.pairedSector
      ? mapFactoriesRef.current[currentRoad.pairedSector]
      : null;
    const pairedRoad = currentRoad.pairedRoadId
      ? pairedFactory?.runtime.roads[currentRoad.pairedRoadId]
      : null;
    const localConnected = connectionsRef.current.some(
      (connection) => connection.sourceNode === nodeId || connection.targetNode === nodeId,
    );
    const remoteConnected = Boolean(
      currentRoad.pairedRoadId && pairedFactory?.connections.some(
        (connection) => (
          connection.sourceNode === currentRoad.pairedRoadId ||
          connection.targetNode === currentRoad.pairedRoadId
        ),
      ),
    );
    const hasBufferedItem = Boolean(
      currentRoad.outboundType ||
      currentRoad.inboundType ||
      pairedRoad?.outboundType ||
      pairedRoad?.inboundType,
    );
    if (localConnected || remoteConnected || hasBufferedItem) {
      toast.error("Road direction is in use", {
        description: "Disconnect and empty both road endpoints before changing direction.",
      });
      return false;
    }

    const undoSnapshot = captureGraphUndoSnapshot();
    const nextMode = getOppositeRoadMode(currentRoad.mode);
    const nextRuntime = cloneStoredMaterialRuntime(runtimeRef.current);
    nextRuntime.roads[nodeId] = { ...nextRuntime.roads[nodeId], mode: nextMode };
    if (currentRoad.pairedSector && currentRoad.pairedRoadId && pairedFactory && pairedRoad) {
      undoSnapshot.mapFactoryStates = {
        ...(undoSnapshot.mapFactoryStates ?? {}),
        [currentRoad.pairedSector]: structuredClone(pairedFactory),
      };
      const nextPairedRuntime = cloneStoredMaterialRuntime(pairedFactory.runtime);
      nextPairedRuntime.roads[currentRoad.pairedRoadId] = {
        ...nextPairedRuntime.roads[currentRoad.pairedRoadId],
        mode: getOppositeRoadMode(nextMode),
      };
      mapFactoriesRef.current = {
        ...mapFactoriesRef.current,
        [currentRoad.pairedSector]: {
          ...pairedFactory,
          runtime: nextPairedRuntime,
        },
      };
    }
    runtimeRef.current = nextRuntime;
    lastPublishedRuntimeSignatureRef.current = null;
    setRuntime(nextRuntime);
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    window.requestAnimationFrame(measureAnchors);
    return true;
  }, [captureGraphUndoSnapshot, measureAnchors, pushUndoEntry]);

  const getNodeSize = useCallback((nodeId: NodeId, fallbackNode?: NodeSpec): NodeSize => {
    const node = fallbackNode ?? nodesRef.current.find((candidate) => candidate.id === nodeId);
    const nodeScale = node?.kind === "researchFoundry" ? RESEARCH_CENTER_NODE_SCALE : 1;
    const element = nodeRefs.current[nodeId];
    if (element?.offsetWidth && element.offsetHeight) {
      return {
        width: element.offsetWidth * nodeScale,
        height: element.offsetHeight * nodeScale,
      };
    }
    return node ? getEstimatedNodeSize(node) : { width: 258, height: 201 };
  }, []);

  const overlapsAnotherNode = useCallback((
    node: NodeSpec,
    position: Position,
    ignoredNodeIds: ReadonlySet<NodeId> = new Set([node.id]),
  ) => {
    const size = getNodeSize(node.id, node);
    const candidateRect = { ...position, ...size };
    if (Object.values(runtimeRef.current.blackHoles ?? {}).some((hole) =>
      rectangleIntersectsBlackHole(candidateRect, hole)
    )) return true;
    if (Object.values(runtimeRef.current.lakes ?? {}).some((lake) =>
      rectangleIntersectsLake(candidateRect, lake)
    )) return true;
    return nodesRef.current.some((otherNode) => {
      if (ignoredNodeIds.has(otherNode.id)) return false;
      const otherPosition = positionsRef.current[otherNode.id];
      if (!otherPosition) return false;
      return rectanglesOverlap(
        candidateRect,
        { ...otherPosition, ...getNodeSize(otherNode.id, otherNode) },
      );
    });
  }, [getNodeSize]);

  const movedConnectionsCrossBlackHole = useCallback((
    candidatePositions: Positions,
    movingNodeIds: ReadonlySet<NodeId>,
  ) => connectionsRef.current.some((connection) => {
    if (!movingNodeIds.has(connection.sourceNode) && !movingNodeIds.has(connection.targetNode)) {
      return false;
    }
    const currentStart = getPortWorldPosition(connection.sourceNode, connection.sourcePort);
    const currentEnd = getPortWorldPosition(connection.targetNode, connection.targetPort);
    if (!currentStart || !currentEnd) return false;
    const offsetAnchor = (anchor: Position, nodeId: NodeId) => {
      if (!movingNodeIds.has(nodeId)) return anchor;
      const currentPosition = positionsRef.current[nodeId];
      const nextPosition = candidatePositions[nodeId];
      if (!currentPosition || !nextPosition) return anchor;
      return {
        x: anchor.x + nextPosition.x - currentPosition.x,
        y: anchor.y + nextPosition.y - currentPosition.y,
      };
    };
    const holes = Object.values(runtimeRef.current.blackHoles ?? {}).filter(
      (hole) => hole.id !== connection.sourceNode && hole.id !== connection.targetNode,
    );
    const lakes = Object.values(runtimeRef.current.lakes ?? {}).filter(
      (lake) => lake.id !== connection.sourceNode && lake.id !== connection.targetNode,
    );
    const start = offsetAnchor(currentStart, connection.sourceNode);
    const end = offsetAnchor(currentEnd, connection.targetNode);
    return curveIntersectsBlackHole(start, end, connection.sourcePort, holes) ||
      curveIntersectsLake(start, end, connection.sourcePort, lakes);
  }), [getPortWorldPosition]);

  const getPairedRoadMovePlan = useCallback((
    roadNode: NodeSpec,
    candidatePosition: Position,
  ) => {
    if (roadNode.kind !== "road") return null;
    const sourceSector = activeMapSectorRef.current;
    const sourceRoad = runtimeRef.current.roads[roadNode.id];
    if (!sourceRoad?.pairedSector || !sourceRoad.pairedRoadId) return null;

    const sourceSize = getEstimatedNodeSize(roadNode);
    const sourcePlayArea = getPlayAreaWorldSize(runtimeRef.current.research, sourceSector);
    const placement = getRoadEdgePlacement(
      candidatePosition,
      sourceSize,
      sourcePlayArea,
      sourceSector,
      mapNodeProgressRef.current,
    );
    if (
      !placement ||
      placement.edge !== sourceRoad.edge ||
      placement.adjacentSector !== sourceRoad.pairedSector
    ) return null;
    if (Object.entries(runtimeRef.current.roads ?? {}).some(([nodeId, road]) =>
      nodeId !== roadNode.id && road.edge === placement.edge
    )) return null;

    const pairedFactory = mapFactoriesRef.current[sourceRoad.pairedSector];
    if (!pairedFactory) return null;
    const pairedNode = getMapFactoryNodes(pairedFactory).find(
      (node) => node.id === sourceRoad.pairedRoadId && node.kind === "road",
    );
    const pairedRoad = pairedFactory.runtime.roads[sourceRoad.pairedRoadId];
    const oppositeEdge = OPPOSITE_MAP_EDGE[placement.edge];
    if (!pairedNode || !pairedRoad || pairedRoad.edge !== oppositeEdge) return null;
    if (Object.entries(pairedFactory.runtime.roads ?? {}).some(([nodeId, road]) =>
      nodeId !== sourceRoad.pairedRoadId && road.edge === oppositeEdge
    )) return null;

    const destinationPlayArea = getPlayAreaWorldSize(
      runtimeRef.current.research,
      sourceRoad.pairedSector,
    );
    const pairedSize = getEstimatedNodeSize(pairedNode);
    const sourceCenterX = placement.position.x + sourceSize.width / 2;
    const sourceCenterY = placement.position.y + sourceSize.height / 2;
    const proportionalCenter = placement.edge === "east" || placement.edge === "west"
      ? sourceCenterY / sourcePlayArea.height * destinationPlayArea.height
      : sourceCenterX / sourcePlayArea.width * destinationPlayArea.width;
    const baseParallelPosition = placement.edge === "east" || placement.edge === "west"
      ? proportionalCenter - pairedSize.height / 2
      : proportionalCenter - pairedSize.width / 2;
    const pairedPosition = oppositeEdge === "west" || oppositeEdge === "east"
      ? {
          x: oppositeEdge === "west" ? 0 : destinationPlayArea.width - pairedSize.width,
          y: Math.max(
            12,
            Math.min(destinationPlayArea.height - pairedSize.height - 12, baseParallelPosition),
          ),
        }
      : {
          x: Math.max(
            12,
            Math.min(destinationPlayArea.width - pairedSize.width - 12, baseParallelPosition),
          ),
          y: oppositeEdge === "north" ? 0 : destinationPlayArea.height - pairedSize.height,
        };
    const pairedRect = { ...pairedPosition, ...pairedSize };
    if (Object.values(pairedFactory.runtime.blackHoles ?? {}).some((hole) =>
      rectangleIntersectsBlackHole(pairedRect, hole)
    )) return null;
    if (Object.values(pairedFactory.runtime.lakes ?? {}).some((lake) =>
      rectangleIntersectsLake(pairedRect, lake)
    )) return null;
    if (getMapFactoryNodes(pairedFactory).some((node) => {
      if (node.id === sourceRoad.pairedRoadId) return false;
      const position = pairedFactory.positions[node.id];
      return Boolean(position && rectanglesOverlap(
        pairedRect,
        { ...position, ...getEstimatedNodeSize(node) },
      ));
    })) return null;

    return {
      sourcePosition: placement.position,
      pairedSector: sourceRoad.pairedSector,
      pairedRoadId: sourceRoad.pairedRoadId,
      pairedPosition,
    };
  }, []);

  const recordRapidFieldClick = useCallback((
    point: Position,
    target: EventTarget | null,
  ) => {
    const targetElement = target instanceof Element ? target : null;
    if (
      !targetElement?.closest(".node-canvas") ||
      targetElement.closest(".node-card, .cable-group, .black-hole-obstacle, .lake-obstacle")
    ) {
      rapidFieldClicksRef.current = { timestamps: [], center: null };
      return;
    }

    const now = performance.now();
    const previous = rapidFieldClicksRef.current;
    const clustered = previous.center &&
      Math.hypot(point.x - previous.center.x, point.y - previous.center.y) <=
        BLACK_HOLE_CLICK_CLUSTER_RADIUS;
    const timestamps = clustered
      ? previous.timestamps.filter((timestamp) => now - timestamp <= RAPID_CLICK_WINDOW_MS)
      : [];
    timestamps.push(now);
    if (timestamps.length < RAPID_CLICK_TARGET) {
      rapidFieldClicksRef.current = {
        timestamps,
        center: clustered && previous.center
          ? {
              x: (previous.center.x * (timestamps.length - 1) + point.x) / timestamps.length,
              y: (previous.center.y * (timestamps.length - 1) + point.y) / timestamps.length,
            }
          : point,
      };
      return;
    }
    rapidFieldClicksRef.current = { timestamps: [], center: null };

    const center = previous.center ?? point;
    const canvas = canvasRef.current;
    if (
      !canvas ||
      center.x < BLACK_HOLE_RADIUS + BLACK_HOLE_CLEARANCE ||
      center.y < BLACK_HOLE_RADIUS + BLACK_HOLE_CLEARANCE ||
      center.x > canvas.clientWidth - BLACK_HOLE_RADIUS - BLACK_HOLE_CLEARANCE ||
      center.y > canvas.clientHeight - BLACK_HOLE_RADIUS - BLACK_HOLE_CLEARANCE
    ) return;

    const candidate = createBlackHoleObstacle(center);
    const existingHoles = Object.values(runtimeRef.current.blackHoles ?? {});
    const touchesHole = existingHoles.some((hole) =>
      Math.hypot(candidate.x - hole.x, candidate.y - hole.y) <=
        candidate.radius + hole.radius + BLACK_HOLE_CLEARANCE
    );
    const touchesLake = Object.values(runtimeRef.current.lakes ?? {}).some((lake) =>
      rectangleIntersectsLake({
        x: candidate.x - candidate.radius,
        y: candidate.y - candidate.radius,
        width: candidate.radius * 2,
        height: candidate.radius * 2,
      }, lake)
    );
    const touchesNode = nodesRef.current.some((node) => {
      const position = positionsRef.current[node.id];
      return Boolean(
        position &&
        rectangleIntersectsBlackHole(
          { ...position, ...getNodeSize(node.id, node) },
          candidate,
        )
      );
    });
    const touchesCable = connectionsRef.current.some((connection) => {
      const start = getPortWorldPosition(connection.sourceNode, connection.sourcePort);
      const end = getPortWorldPosition(connection.targetNode, connection.targetPort);
      return Boolean(
        start &&
        end &&
        curveIntersectsBlackHole(start, end, connection.sourcePort, [candidate]),
      );
    });
    if (touchesHole || touchesLake || touchesNode || touchesCable) return;

    const nextRuntime = cloneStoredMaterialRuntime(runtimeRef.current);
    nextRuntime.blackHoles[candidate.id] = candidate;
    runtimeRef.current = nextRuntime;
    lastPublishedRuntimeSignatureRef.current = null;
    setRuntime(nextRuntime);
    unlockAchievement("oops");
    window.requestAnimationFrame(measureAnchors);
  }, [getNodeSize, getPortWorldPosition, measureAnchors, unlockAchievement]);

  const removeFilledBlackHole = useCallback((holeId: NodeId) => {
    const hole = runtimeRef.current.blackHoles[holeId];
    if (!hole || hole.stoneFilled < getBlackHoleStoneRequirement(
      hole,
      getMapNodeValue(activeMapSectorRef.current),
    )) return;
    const undoSnapshot = captureGraphUndoSnapshot();
    const nextRuntime = cloneStoredMaterialRuntime(runtimeRef.current);
    delete nextRuntime.blackHoles[holeId];
    const nextConnections = connectionsRef.current.filter(
      (connection) => connection.sourceNode !== holeId && connection.targetNode !== holeId,
    );
    runtimeRef.current = nextRuntime;
    connectionsRef.current = nextConnections;
    lastPublishedRuntimeSignatureRef.current = null;
    delete portRefs.current[`${holeId}:${BLACK_HOLE_INPUT_PORT.id}`];
    delete anchorsRef.current[`${holeId}:${BLACK_HOLE_INPUT_PORT.id}`];
    setRuntime(nextRuntime);
    setConnections(nextConnections);
    setSelectedConnection((current) =>
      current && !nextConnections.some((connection) => connection.id === current) ? null : current
    );
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    window.requestAnimationFrame(measureAnchors);
    toast.success("Black Hole filled in");
  }, [captureGraphUndoSnapshot, measureAnchors, pushUndoEntry]);

  const manuallyExtractResource = useCallback((nodeId: NodeId) => {
    const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
    if (!node || !isResourceNodeKind(node.kind)) return false;
    const outputType = node.outputs[0]?.type;
    const productType = getManualResourceProductType(node);
    if (!outputType || !productType) return false;

    const current = runtimeRef.current;
    if (getResourceRemaining(current, nodeId, outputType, connectionsRef.current) <= 0) {
      toast.error(`${node.title} is depleted`);
      return false;
    }
    const baseInventory = normalizeItemStore(current.inventory, BASE_INVENTORY_CAPACITY);
    if ((baseInventory[productType] ?? 0) >= BASE_INVENTORY_CAPACITY) {
      toast.error("Base inventory full", {
        description: `Use some ${formatResourceType(productType)} before extracting more.`,
      });
      return false;
    }

    const undoSnapshot = captureGraphUndoSnapshot();
    const next = cloneStoredMaterialRuntime(current);
    consumeResource(next, nodeId, outputType, connectionsRef.current);
    next.inventory[productType] = (next.inventory[productType] ?? 0) + 1;
    next.produced[productType] = (next.produced[productType] ?? 0) + 1;
    runtimeRef.current = next;
    lastPublishedRuntimeSignatureRef.current = null;
    setRuntime(next);
    setProductionFlashTokens((tokens) => ({
      ...tokens,
      [nodeId]: (tokens[nodeId] ?? 0) + 1,
    }));
    lastManualResourceCollectionElapsedRef.current = gameElapsedMsRef.current;
    lastPlayerActivityElapsedRef.current = gameElapsedMsRef.current;
    if (nodeId === "stone") {
      stoneManualCollectionCountRef.current = Math.min(
        2,
        stoneManualCollectionCountRef.current + 1,
      );
      stoneCollectHintActivatedRef.current = false;
      if (stoneManualCollectionCountRef.current === 1) {
        stoneCollectHintDismissedRef.current = false;
        stoneCollectSecondHintPendingRef.current = true;
        stoneCollectSecondHintActiveRef.current = false;
      } else {
        stoneCollectHintDismissedRef.current = true;
        stoneCollectSecondHintPendingRef.current = false;
        stoneCollectSecondHintActiveRef.current = false;
      }
      setStoneCollectHintEncouraging(false);
      setStoneCollectHintVisible(false);
    } else if (nodeId === "forest") {
      const availability = getBuildMaterialAvailability(
        next,
        nodesRef.current,
        connectionsRef.current,
      );
      const woodAvailable = availability[ResourceType.WOOD].total;
      const stoneAvailable = availability[ResourceType.STONE].total;
      forestCollectHintActivatedRef.current = false;
      if (woodAvailable >= 2) {
        forestCollectHintDismissedRef.current = true;
        forestCollectSecondHintPendingRef.current = false;
        forestCollectSecondHintActiveRef.current = false;
      } else if (
        stoneAvailable >= 2 ||
        forestCollectHintEligibleAtRef.current > 0 ||
        forestCollectSecondHintActiveRef.current
      ) {
        forestCollectHintDismissedRef.current = false;
        forestCollectSecondHintPendingRef.current = true;
        forestCollectSecondHintActiveRef.current = false;
      }
      setForestCollectHintEncouraging(false);
      setForestCollectHintVisible(false);
    }
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    return true;
  }, [captureGraphUndoSnapshot, pushUndoEntry]);

  const buildNode = useCallback((
    kind: PurchasableKind,
    recipe: BuildIngredient[],
    repeatOriginNodeId?: NodeId,
  ) => {
    if (
      kind === "researchFoundry" &&
      hasNodeKindAcrossMaps(
        "researchFoundry",
        nodesRef.current,
        activeMapSectorRef.current,
        mapFactoriesRef.current,
      )
    ) {
      toast.error("Research Center limit reached", {
        description: "Only one Research Center can exist across all map nodes.",
      });
      return false;
    }
    const unlockContext: BuildUnlockContext = {
      runtime: runtimeRef.current,
      builtKinds: builtBuildKinds,
      logisticsUnlocked: logisticsUnlockedRef.current,
    };
    if (!isBuildKindUnlocked(kind, revealedBuildKinds, unlockContext)) return false;
    const paymentDeferred = Boolean(repeatOriginNodeId) && !removeBuildCosts;
    const availability = paymentDeferred
      ? getGlobalBuildMaterialAvailability(
          runtimeRef.current,
          nodesRef.current,
          connectionsRef.current,
          activeMapSectorRef.current,
          mapFactoriesRef.current,
          mapNodeProgressRef.current,
        )
      : null;
    const payment = removeBuildCosts || paymentDeferred
      ? null
      : consumeGlobalBuildIngredients(
          runtimeRef.current,
          recipe,
          nodesRef.current,
          connectionsRef.current,
          activeMapSectorRef.current,
          mapFactoriesRef.current,
          mapNodeProgressRef.current,
        );
    const buildRuntime = removeBuildCosts
      ? runtimeRef.current
      : paymentDeferred
        ? recipe.every((ingredient) =>
            (availability?.[ingredient.type].total ?? 0) >= ingredient.amount,
          )
          ? runtimeRef.current
          : null
        : payment?.activeRuntime ?? null;
    if (!buildRuntime) return false;
    const placementUndoSnapshot = captureGraphUndoSnapshot();
    if (payment) {
      placementUndoSnapshot.mapFactoryRuntimes = payment.previousFactoryRuntimes;
      mapFactoriesRef.current = payment.mapFactories;
    }
    setBuiltBuildKinds((current) => new Set(current).add(kind));
    setRevealedBuildKinds((current) => new Set(current).add(kind));
    setNewBuildKinds((current) => {
      if (!current.has(kind)) return current;
      const next = new Set(current);
      next.delete(kind);
      return next;
    });
    const currentSequence = buildSequenceRef.current[kind];
    const sequence = (Number.isFinite(currentSequence) ? currentSequence : 0) + 1;
    buildSequenceRef.current[kind] = sequence;
    const id = `${kind}-${Date.now()}-${sequence}`;
    const node = createBuildableNode(kind, id, sequence);
    const viewport = workspaceRef.current;
    const bounds = viewport?.getBoundingClientRect();
    const pointer = lastCanvasPointerRef.current ?? {
      x: bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2,
      y: bounds ? bounds.top + bounds.height / 2 : window.innerHeight / 2,
    };
    const worldPoint = pointFromEvent(pointer.x, pointer.y);
    const { width: placementWidth, height: placementHeight } = getEstimatedNodeSize(node);
    const placementOffsetY = kind === "joint" || kind === "road" || kind === "powerSplitter" || kind === "woodenChest"
      ? placementHeight / 2
      : 42;
    const playAreaWorldSize = getPlayAreaWorldSize(
      runtimeRef.current.research,
      activeMapSectorRef.current,
    );
    const position = {
      x: Math.max(12, Math.min(playAreaWorldSize.width - placementWidth - 12, worldPoint.x - placementWidth / 2)),
      y: Math.max(52, Math.min(playAreaWorldSize.height - placementHeight - 12, worldPoint.y - placementOffsetY)),
    };
    const initialRoadPlacement = kind === "road"
      ? getRoadEdgePlacement(
          position,
          { width: placementWidth, height: placementHeight },
          playAreaWorldSize,
          activeMapSectorRef.current,
          mapNodeProgressRef.current,
        )
      : null;
    updatePlacementBlocked(
      overlapsAnotherNode(node, position) || (kind === "road" && !initialRoadPlacement),
    );

    const nextNodes = [...nodesRef.current, node];
    nodesRef.current = nextNodes;
    setNodes(nextNodes);
    const nextPositions = { ...positionsRef.current, [id]: position };
    positionsRef.current = nextPositions;
    setPositions(nextPositions);
    setRuntime(() => {
      const current = buildRuntime;
      const machineRuntime = isExtractorKind(kind)
        ? {
            ...current,
            extractors: {
              ...current.extractors,
              [id]: { progress: 0, stored: 0, full: false, materialType: null },
            },
          }
        : kind === "generator"
          ? {
              ...current,
              generators: { ...current.generators, [id]: { power: 0, charcoal: 0 } },
            }
        : kind === "researchFoundry"
          ? {
              ...current,
              researchFoundries: {
                ...current.researchFoundries,
                [id]: { progress: 0, cores: 0, coreItems: [] },
              },
            }
        : kind === "treePlanter"
          ? {
              ...current,
              treePlanters: {
                ...current.treePlanters,
                [id]: { progress: 0 },
              },
            }
        : kind === "miningDrill"
          ? {
              ...current,
              miningDrills: {
                ...current.miningDrills,
                [id]: {
                  progress: 0,
                  iterations: 0,
                  selectedType: null,
                },
              },
            }
        : kind === "splitter"
            ? {
                ...current,
                splitters: {
                  ...current.splitters,
                  [id]: { nextOutput: "a" as const },
                },
              }
            : kind === "merger"
              ? current
            : kind === "joint"
              ? {
                  ...current,
                  joints: {
                    ...current.joints,
                    [id]: { bufferedType: null, orientation: "horizontal" as const },
                  },
                }
            : kind === "road"
              ? {
                  ...current,
                  roads: {
                    ...current.roads,
                    [id]: {
                      outboundType: null,
                      inboundType: null,
                      pairedSector: null,
                      pairedRoadId: null,
                      edge: null,
                      mode: "export" as const,
                    },
                  },
                }
            : kind === "powerSplitter"
              ? current
            : kind === "inventorySource"
              ? {
                  ...current,
                  inventorySources: {
                    ...current.inventorySources,
                    [id]: { progress: 0, full: false, itemType: null, channels: {} },
                  },
                }
            : kind === "filter"
              ? {
                  ...current,
                  filters: {
                    ...current.filters,
                    [id]: { selectedType: null, bufferedType: null },
                  },
                }
            : kind === "storage"
              ? {
                  ...current,
                  storages: {
                    ...current.storages,
                    [id]: {
                      items: makeEmptyItemStore(),
                      capacityPerItem: STORAGE_NODE_CAPACITY,
                    },
                  },
                }
            : kind === "woodenChest"
              ? {
                  ...current,
                  woodenChests: {
                    ...current.woodenChests,
                    [id]: { itemType: null, stored: 0 },
                  },
                }
            : {
                ...current,
                processors: {
                  ...current.processors,
                  [id]: makeProcessorState(kind),
                },
              };
      const next = {
        ...machineRuntime,
        construction: {
          ...machineRuntime.construction,
          [id]: { progress: 0, complete: false },
        },
      };
      runtimeRef.current = next;
      return next;
    });
    placingNodeRef.current = id;
    pendingPlacementUndoRef.current = {
      nodeId: id,
      snapshot: placementUndoSnapshot,
    };
    repeatPlacementPreviewRef.current = repeatOriginNodeId
      ? { nodeId: id, lastPlacedNodeId: repeatOriginNodeId }
      : null;
    setPlacingNodeId(id);
    setSelectedNodes([id]);
    setSelectedConnection(null);
    setBuildOpen(false);
    setJournalOpen(false);
    buildOpenRef.current = false;
    window.requestAnimationFrame(() => {
      const currentPosition = positionsRef.current[id] ?? position;
      const currentRoadPlacement = kind === "road"
        ? getRoadEdgePlacement(
            currentPosition,
            { width: placementWidth, height: placementHeight },
            playAreaWorldSize,
            activeMapSectorRef.current,
            mapNodeProgressRef.current,
          )
        : null;
      updatePlacementBlocked(
        overlapsAnotherNode(node, currentPosition) || (kind === "road" && !currentRoadPlacement),
      );
      measureAnchors();
    });
    return true;
  }, [
    builtBuildKinds,
    captureGraphUndoSnapshot,
    measureAnchors,
    overlapsAnotherNode,
    pointFromEvent,
    removeBuildCosts,
    revealedBuildKinds,
    updatePlacementBlocked,
  ]);

  const updateBuildMenuOpen = useCallback((open: boolean) => {
    buildOpenRef.current = open;
    setBuildOpen(open);
    if (open) setBuildAttention(false);
    if (open && starterBuildHintStageRef.current === "menu") {
      starterBuildHintStageRef.current = "extractor";
      setStarterBuildHintTarget("extractor");
    } else if (!open && starterBuildHintStageRef.current === "extractor") {
      starterBuildHintStageRef.current = "menu";
      setStarterBuildHintTarget("menu");
    }
  }, []);

  const openTopbarMenu = useCallback((menu: "build" | "inventory" | "journal" | "options" | "research") => {
    const requestedMenuIsOpen = menu === "build"
      ? buildOpen
      : menu === "inventory"
        ? inventoryOpen
        : menu === "journal"
          ? journalOpen
          : menu === "options"
            ? optionsOpen
            : researchOpen;
    const nextMenu = requestedMenuIsOpen ? null : menu;

    updateBuildMenuOpen(nextMenu === "build");
    setInventoryOpen(nextMenu === "inventory");
    setJournalOpen(nextMenu === "journal");
    setOptionsOpen(nextMenu === "options");
    setResearchOpen(nextMenu === "research");
    setMapOpen(false);
    setDevOpen(false);
    setShortcutsOpen(false);
    setRecipesOpen(false);
    setAchievementsOpen(false);
    setSaveOpen(false);
    if (nextMenu === "journal") setJournalAttention(false);
    if (nextMenu !== "research") setHoveredResearchProject(null);
  }, [buildOpen, inventoryOpen, journalOpen, optionsOpen, researchOpen, updateBuildMenuOpen]);

  const activateShortcutSlot = useCallback((barId: ShortcutBarId, slotIndex: number) => {
    const assignment = shortcutBarsRef.current[barId]?.assignments[slotIndex];
    if (!assignment || placingNodeRef.current) return false;
    const item = VISIBLE_BUILD_CATALOG.find((candidate) => candidate.kind === assignment);
    if (!item) return false;
    buildNode(item.kind, item.recipe);
    return true;
  }, [buildNode]);

  const cancelRepeatPlacementPreview = useCallback(() => {
    const preview = repeatPlacementPreviewRef.current;
    const nodeId = placingNodeRef.current;
    if (!preview || preview.nodeId !== nodeId) return false;

    const nextNodes = nodesRef.current.filter((node) => node.id !== nodeId);
    nodesRef.current = nextNodes;
    setNodes(nextNodes);

    const nextPositions = { ...positionsRef.current };
    delete nextPositions[nodeId];
    positionsRef.current = nextPositions;
    setPositions(nextPositions);

    setRuntime((current) => {
      const next: Runtime = {
        ...current,
        extractors: { ...current.extractors },
        processors: { ...current.processors },
        generators: { ...current.generators },
        researchFoundries: { ...current.researchFoundries },
        treePlanters: { ...current.treePlanters },
        miningDrills: { ...current.miningDrills },
        minedDeposits: { ...current.minedDeposits },
        splitters: { ...current.splitters },
        joints: { ...current.joints },
        roads: { ...(current.roads ?? {}) },
        inventorySources: { ...current.inventorySources },
        filters: { ...current.filters },
        woodenChests: { ...current.woodenChests },
        storages: { ...current.storages },
        pausedOutputs: { ...(current.pausedOutputs ?? {}) },
        construction: { ...current.construction },
      };
      delete next.extractors[nodeId];
      delete next.processors[nodeId];
      delete next.generators[nodeId];
      delete next.researchFoundries[nodeId];
      delete next.treePlanters[nodeId];
      delete next.miningDrills[nodeId];
      delete next.minedDeposits[nodeId];
      delete next.splitters[nodeId];
      delete next.joints[nodeId];
      delete next.roads[nodeId];
      delete next.inventorySources[nodeId];
      delete next.filters[nodeId];
      delete next.woodenChests[nodeId];
      delete next.storages[nodeId];
      delete next.pausedOutputs[nodeId];
      delete next.construction[nodeId];
      runtimeRef.current = next;
      return next;
    });

    repeatPlacementPreviewRef.current = null;
    continuousReplicationRef.current = false;
    if (pendingPlacementUndoRef.current?.nodeId === nodeId) {
      pendingPlacementUndoRef.current = null;
    }
    placingNodeRef.current = null;
    setPlacingNodeId(null);
    insertionTargetRef.current = null;
    setInsertionTarget(null);
    updatePlacementBlocked(false);
    const nextSelection = nodesRef.current.some((node) => node.id === preview.lastPlacedNodeId)
      ? [preview.lastPlacedNodeId]
      : [];
    selectedNodesRef.current = nextSelection;
    setSelectedNodes(nextSelection);
    setSelectedConnection(null);
    window.requestAnimationFrame(measureAnchors);
    return true;
  }, [measureAnchors, updatePlacementBlocked]);

  const cancelNodeInHand = useCallback(() => {
    const nodeId = placingNodeRef.current;
    if (!nodeId) return false;
    if (cancelRepeatPlacementPreview()) return true;

    const pendingPlacement = pendingPlacementUndoRef.current;
    if (!pendingPlacement || pendingPlacement.nodeId !== nodeId) return false;
    continuousReplicationRef.current = false;
    return restoreGraphUndoSnapshot(pendingPlacement.snapshot);
  }, [cancelRepeatPlacementPreview, restoreGraphUndoSnapshot]);

  const acknowledgeBuildKind = useCallback((kind: PurchasableKind) => {
    setNewBuildKinds((current) => {
      if (!current.has(kind)) return current;
      const next = new Set(current);
      next.delete(kind);
      return next;
    });
  }, []);

  const manuallyFillIngredient = useCallback((
    nodeId: NodeId,
    portId: string,
    itemType: InventoryItemType,
  ) => {
    const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
    if (!node) return;
    const current = runtimeRef.current;
    const construction = current.construction[nodeId];
    if (construction && !construction.complete) return;
    const excludedNodeIds = new Set([nodeId]);
    const isResearchCoreFeed = node.kind === "researchFoundry" && isCoreType(itemType);
    const available = isResearchCoreFeed
      ? normalizeItemStore(current.inventory, BASE_INVENTORY_CAPACITY)[itemType] ?? 0
      : getStoredItemAmount(
          current,
          nodesRef.current,
          connectionsRef.current,
          itemType,
          excludedNodeIds,
        );
    if (available <= 0) return;

    if (isProcessorKind(node.kind)) {
      const processor = current.processors[nodeId] ?? makeProcessorState(node.kind);
      const recipe = getProcessorRecipe(node.kind, processor);
      const requirement = recipe?.inputs.find(
        (input) => input.id === portId,
      );
      if (!requirement || !getManualIngredientChoices(requirement.type).includes(itemType)) return;

      const stored = processor.inputs[portId] ?? 0;
      const remainingCapacity = Math.max(0, PRODUCTION_INGREDIENT_CAPACITY - stored);
      if (remainingCapacity <= 0) return;

      if (isSmartProcessorTypingPort(nodeId, portId, processor)) {
        const connectedType = getConnectedSmartProcessorMaterialType(
          nodeId,
          connectionsRef.current,
          processor,
        );
        const bufferedSmartIngredient = (recipe?.inputs ?? []).some(
          (input) =>
            isSmartProcessorTypingPort(nodeId, input.id, processor) &&
            (processor.inputs[input.id] ?? 0) > 0,
        );
        const materialLocked =
          bufferedSmartIngredient ||
          processor.progress > 0 ||
          getProcessorStored(processor) > 0;
        const lockedType = connectedType ?? (materialLocked ? processor.materialType : null);
        if (lockedType && lockedType !== itemType) return;
      }

      const transferred = Math.min(remainingCapacity, available);
      if (transferred <= 0) return;
      const next = cloneStoredMaterialRuntime(current);
      consumeStoredMaterialInPlace(
        next,
        nodesRef.current,
        connectionsRef.current,
        itemType,
        transferred,
        excludedNodeIds,
      );
      next.processors = {
          ...next.processors,
          [nodeId]: {
            ...processor,
            inputs: {
              ...processor.inputs,
              [portId]: stored + transferred,
            },
            materialType: isSmartProcessorTypingPort(nodeId, portId, processor)
              ? itemType
              : processor.materialType,
          },
      };
      const normalizedConnections = normalizeDynamicConnections(
        connectionsRef.current,
        nodesRef.current,
        next,
      );
      if (!connectionsAreEqual(connectionsRef.current, normalizedConnections)) {
        connectionsRef.current = normalizedConnections;
        setConnections(normalizedConnections);
      }
      runtimeRef.current = next;
      setRuntime(next);
      return;
    }

    if (node.kind === "generator" && itemType === ResourceType.CHARCOAL) {
      const generator = current.generators[nodeId] ?? { power: 0, charcoal: 0 };
      const remainingCapacity = Math.max(
        0,
        PRODUCTION_INGREDIENT_CAPACITY - (generator.charcoal ?? 0),
      );
      const transferred = Math.min(remainingCapacity, available);
      if (transferred <= 0) return;
      const next = cloneStoredMaterialRuntime(current);
      consumeStoredMaterialInPlace(
        next,
        nodesRef.current,
        connectionsRef.current,
        itemType,
        transferred,
        excludedNodeIds,
      );
      next.generators = {
          ...next.generators,
          [nodeId]: {
            ...generator,
            charcoal: (generator.charcoal ?? 0) + transferred,
          },
      };
      runtimeRef.current = next;
      setRuntime(next);
      return;
    }

    if (
      node.kind === "miningDrill" &&
      portId === "motor-in" &&
      itemType === ResourceType.MOTOR
    ) {
      const drill = current.miningDrills[nodeId];
      if (
        !drill?.selectedType ||
        drill.iterations >= MINING_DRILL_ITERATIONS
      ) return;
      const next = cloneStoredMaterialRuntime(current);
      consumeStoredMaterialInPlace(
        next,
        nodesRef.current,
        connectionsRef.current,
        ResourceType.MOTOR,
        1,
        excludedNodeIds,
      );
      next.miningDrills = {
        ...next.miningDrills,
        [nodeId]: {
          ...drill,
          progress: 0,
          iterations: Math.min(MINING_DRILL_ITERATIONS, drill.iterations + 1),
        },
      };
      runtimeRef.current = next;
      setRuntime(next);
      return;
    }

    if (node.kind === "researchFoundry" && isCoreType(itemType)) {
      const foundry = current.researchFoundries[nodeId] ?? {
        progress: 0,
        cores: 0,
        coreItems: [],
      };
      const coreItems = getResearchFoundryCoreItems(foundry);
      const stored = getResearchFoundryCores(foundry);
      const transferred = Math.min(1, available);
      if (transferred <= 0) return;
      const next = cloneStoredMaterialRuntime(current);
      next.inventory[itemType] = Math.max(0, (next.inventory[itemType] ?? 0) - transferred);
      next.researchFoundries = {
          ...next.researchFoundries,
          [nodeId]: {
            ...foundry,
            cores: stored + transferred,
            coreItems: [
              ...coreItems,
              ...Array.from({ length: transferred }, () => itemType),
            ],
            coreLoaded: undefined,
          },
      };
      next.research = { ...current.research, available: true };
      runtimeRef.current = next;
      setRuntime(next);
    }
  }, []);

  const configureFilter = useCallback((nodeId: NodeId, itemType: InventoryItemType) => {
    const updatedNodes = nodesRef.current.map((node) =>
      node.id === nodeId && node.kind === "filter"
        ? {
            ...node,
            color: RESOURCE_COLORS[itemType],
            outputs: node.outputs.map((port) =>
              port.id === "filter-out"
                ? { ...port, label: formatResourceType(itemType), type: itemType }
                : port,
            ),
          }
        : node,
    );
    nodesRef.current = updatedNodes;
    setNodes(updatedNodes);
    const normalizedConnections = normalizeDynamicConnections(
      connectionsRef.current,
      updatedNodes,
      runtimeRef.current,
    );
    connectionsRef.current = normalizedConnections;
    setConnections(normalizedConnections);
    setRuntime((current) => {
      const previousFilter = current.filters[nodeId] ?? {
        selectedType: null,
        bufferedType: null,
      };
      const next = {
        ...current,
        filters: {
          ...current.filters,
          [nodeId]: {
            selectedType: itemType,
            bufferedType:
              previousFilter.selectedType === itemType
                ? previousFilter.bufferedType
                : null,
          },
        },
      };
      runtimeRef.current = next;
      return next;
    });
    setConfiguringFilterId(null);
    window.requestAnimationFrame(measureAnchors);
  }, [measureAnchors]);

  const configureMiningDrill = useCallback((nodeId: NodeId, targetType: MiningDrillTarget) => {
    const target = getMiningTarget(targetType);
    if (!target) return;
    if (getMapNodeValue(activeMapSectorRef.current) < target.minimumMapNodeValue) {
      toast.error(`${target.title} requires a tier ${target.minimumMapNodeValue} map node`);
      return;
    }
    const updatedNodes = nodesRef.current.map((node) =>
      node.id === nodeId && node.kind === "miningDrill"
        ? { ...node, color: RESOURCE_COLORS[targetType] }
        : node,
    );
    nodesRef.current = updatedNodes;
    setNodes(updatedNodes);
    setRuntime((current) => {
      const drill = current.miningDrills[nodeId] ?? {
        progress: 0,
        iterations: 0,
        selectedType: null,
      };
      const unchanged = drill.selectedType === targetType;
      const next = {
        ...current,
        miningDrills: {
          ...current.miningDrills,
          [nodeId]: unchanged
            ? drill
            : {
                progress: 0,
                iterations: 0,
                selectedType: targetType,
              },
        },
      };
      runtimeRef.current = next;
      return next;
    });
    setConfiguringMiningDrillId(null);
    window.requestAnimationFrame(measureAnchors);
  }, [measureAnchors]);

  const applyAssemblerRecipe = useCallback((
    nodeId: NodeId,
    recipeId: AssemblerRecipeId | RefinerRecipeId,
  ) => {
    const node = nodesRef.current.find(
      (candidate) =>
        candidate.id === nodeId &&
        (candidate.kind === "assembler" || candidate.kind === "refiner"),
    );
    if (!node) return;
    const current = runtimeRef.current;
    const previous = current.processors[nodeId] ?? makeProcessorState(node.kind);
    const previousRecipe = node.kind === "assembler"
      ? previous.assemblerRecipe
      : previous.refinerRecipe;
    if (previousRecipe === recipeId) {
      setConfiguringAssemblerId(null);
      return;
    }

    const nextProcessor = node.kind === "assembler" && isAssemblerRecipeId(recipeId)
      ? makeProcessorState("assembler", null, recipeId)
      : node.kind === "refiner" && isRefinerRecipeId(recipeId)
        ? makeProcessorState("refiner", null, null, recipeId)
        : null;
    if (!nextProcessor) return;

    const next: Runtime = {
      ...current,
      processors: {
        ...current.processors,
        [nodeId]: nextProcessor,
      },
    };
    const normalizedConnections = normalizeDynamicConnections(
      connectionsRef.current,
      nodesRef.current,
      next,
    );
    runtimeRef.current = next;
    setRuntime(next);
    connectionsRef.current = normalizedConnections;
    setConnections(normalizedConnections);
    setConfiguringAssemblerId(null);
    window.requestAnimationFrame(measureAnchors);
  }, [measureAnchors]);

  const requestAssemblerRecipeChange = useCallback((
    nodeId: NodeId,
    recipeId: AssemblerRecipeId | RefinerRecipeId,
  ) => {
    const node = nodesRef.current.find(
      (candidate) =>
        candidate.id === nodeId &&
        (candidate.kind === "assembler" || candidate.kind === "refiner"),
    );
    if (!node) return;
    const processor = runtimeRef.current.processors[nodeId] ?? makeProcessorState(node.kind);
    const currentRecipe = node.kind === "assembler"
      ? processor.assemblerRecipe
      : processor.refinerRecipe;
    if (currentRecipe === recipeId) {
      setConfiguringAssemblerId(null);
      return;
    }
    if (!currentRecipe || alwaysApproveAssemblerRecipeChanges) {
      applyAssemblerRecipe(nodeId, recipeId);
      return;
    }
    setConfiguringAssemblerId(null);
    setPendingAssemblerRecipeChange({ nodeId, kind: node.kind, recipeId });
    setSuppressFutureAssemblerRecipeWarnings(false);
    setAssemblerRecipeChangeDialogOpen(true);
  }, [alwaysApproveAssemblerRecipeChanges, applyAssemblerRecipe]);

  const zoomAtPoint = useCallback((requestedZoom: number, clientX?: number, clientY?: number) => {
    const viewport = workspaceRef.current;
    if (!viewport) return;
    const currentZoom = zoomRef.current;
    const nextZoom = clampZoom(requestedZoom);
    if (Math.abs(nextZoom - currentZoom) < 0.001) return;

    const bounds = viewport.getBoundingClientRect();
    const pointerX = (clientX ?? bounds.left + bounds.width / 2) - bounds.left;
    const pointerY = (clientY ?? bounds.top + bounds.height / 2) - bounds.top;
    const worldX = (viewport.scrollLeft + pointerX) / currentZoom;
    const worldY = (viewport.scrollTop + pointerY) / currentZoom;

    zoomRef.current = nextZoom;
    pinchTargetZoomRef.current = nextZoom;
    flushSync(() => setZoom(nextZoom));
    viewport.scrollLeft = worldX * nextZoom - pointerX;
    viewport.scrollTop = worldY * nextZoom - pointerY;
    updateGridPosition();
  }, [updateGridPosition]);

  useEffect(() => {
    const viewport = workspaceRef.current;
    if (!viewport) return;
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 0.01) return;

      const now = performance.now();
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1);
      const sensitivity = event.ctrlKey ? 0.0045 : 0.0018;
      const rawFactor = Math.exp(-delta * sensitivity);
      const factor = Math.min(
        event.ctrlKey ? 1.16 : 1.18,
        Math.max(event.ctrlKey ? 0.86 : 0.84, rawFactor),
      );

      if (event.ctrlKey) {
        if (now > pinchAnchorRef.current.activeUntil) {
          pinchAnchorRef.current = {
            clientX: event.clientX,
            clientY: event.clientY,
            activeUntil: now + 180,
          };
        } else {
          pinchAnchorRef.current.activeUntil = now + 180;
        }
        const baseZoom = pinchFrameRef.current === null
          ? zoomRef.current
          : pinchTargetZoomRef.current;
        pinchTargetZoomRef.current = clampZoom(baseZoom * factor);

        if (pinchFrameRef.current === null) {
          pinchFrameRef.current = window.requestAnimationFrame(() => {
            pinchFrameRef.current = null;
            zoomAtPoint(
              pinchTargetZoomRef.current,
              pinchAnchorRef.current.clientX,
              pinchAnchorRef.current.clientY,
            );
          });
        }
        return;
      }

      zoomAtPoint(zoomRef.current * factor, event.clientX, event.clientY);
    };
    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      if (pinchFrameRef.current !== null) {
        window.cancelAnimationFrame(pinchFrameRef.current);
        pinchFrameRef.current = null;
      }
    };
  }, [zoomAtPoint]);

  const unlockLogisticsBuildings = useCallback(() => {
    if (logisticsUnlockedRef.current) return;
    const current = runtimeRef.current;
    const newlyCompleted = !current.research.logisticsUnlocked;
    const nextRuntime: Runtime = {
      ...current,
      research: {
        ...current.research,
        logisticsUnlocked: true,
        progress: {
          ...current.research.progress,
          logistics: getResearchProjectCost("logistics"),
        },
      },
    };
    runtimeRef.current = nextRuntime;
    setRuntime(nextRuntime);
    logisticsUnlockedRef.current = true;
    setLogisticsUnlocked(true);
    setRevealedBuildKinds((current) => {
      const next = new Set(current);
      LOGISTICS_BUILD_KINDS.forEach((kind) => next.add(kind));
      return next;
    });
    setNewBuildKinds((current) => {
      const next = new Set(current);
      LOGISTICS_BUILD_KINDS.forEach((kind) => next.add(kind));
      return next;
    });
    if (newlyCompleted) announceResearchCompletion("logistics");
    if (!buildOpenRef.current) setBuildAttention(true);
  }, []);

  const getDisconnectedCompletedOutputs = useCallback((
    before: Connection[],
    after: Connection[],
    additionalNodeIds: Iterable<NodeId> = [],
  ) => {
    const current = runtimeRef.current;
    const disconnectedNodeIds = getDisconnectedMachineIds(before, after);
    Array.from(additionalNodeIds).forEach((nodeId) => {
      disconnectedNodeIds.add(nodeId);
    });
    return Array.from(disconnectedNodeIds).flatMap((nodeId) => {
      const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
      if (!node) return [];
      const type = getCompletedMachineOutputType(node, current, before);
      if (!type) return [];
      const amount = isExtractorKind(node.kind)
        ? current.extractors[node.id]?.stored ?? 0
        : getProcessorStored(current.processors[node.id]);
      return amount > 0 ? [{ node, type, amount }] : [];
    });
  }, []);

  const storeDisconnectedCompletedOutputs = useCallback((
    before: Connection[],
    after: Connection[],
    options: {
      additionalItems?: ReadonlyMap<InventoryItemType, number>;
      additionalNodeIds?: Iterable<NodeId>;
      ignoredCompletedNodeIds?: Iterable<NodeId>;
      blockedAction?: string;
      allowOverflowLoss?: boolean;
      overflowTitle?: string;
      overflowDescription?: string;
      onConfirmOverflow?: () => void;
    } = {},
  ) => {
    const current = runtimeRef.current;
    const ignoredCompletedNodeIds = new Set(options.ignoredCompletedNodeIds ?? []);
    const completed = getDisconnectedCompletedOutputs(
      before,
      after,
      options.additionalNodeIds,
    ).filter(({ node }) => !ignoredCompletedNodeIds.has(node.id));

    if (!completed.length && !options.additionalItems?.size) return true;
    const excludedNodeIds = new Set(options.additionalNodeIds ?? []);
    const projected = cloneStoredMaterialRuntime(current);
    const loss = new Map<InventoryItemType, number>();
    const projectDeposit = (type: InventoryItemType, amount: number) => {
      const accepted = depositMaterialIntoStorageInPlace(
        projected,
        nodesRef.current,
        type,
        amount,
        excludedNodeIds,
      );
      const overflow = amount - accepted;
      if (overflow > 0) loss.set(type, (loss.get(type) ?? 0) + overflow);
    };
    completed.forEach(({ type, amount }) => projectDeposit(type, amount));
    options.additionalItems?.forEach((amount, type) => projectDeposit(type, amount));
    const allowOverflowLoss =
      options.allowOverflowLoss || inventoryOverflowWarningSuppressedRef.current;
    if (loss.size > 0 && !allowOverflowLoss) {
      if (options.onConfirmOverflow) {
        requestInventoryOverflowConfirmation({
          title: options.overflowTitle ?? "Storage capacity exceeded",
          description: options.overflowDescription ??
            "Available storage nodes cannot hold all recovered materials. Anything beyond capacity will be permanently destroyed if you proceed.",
          loss: Array.from(loss),
        }, options.onConfirmOverflow);
      } else {
        const blockedType = loss.keys().next().value as InventoryItemType | undefined;
        toast.error("Storage full", {
          description: blockedType
            ? `Make room for ${formatResourceType(blockedType)} in a Storage node or Wooden Chest before ${options.blockedAction ?? "continuing"}.`
            : "Make room in a Storage node or Wooden Chest before continuing.",
        });
      }
      return false;
    }
    if (!completed.length) return true;

    const next = cloneStoredMaterialRuntime(current);
    completed.forEach(({ node, type, amount }) => {
      depositMaterialIntoStorageInPlace(
        next,
        nodesRef.current,
        type,
        amount,
        excludedNodeIds,
      );
      if (isExtractorKind(node.kind)) {
        const extractor = next.extractors[node.id];
        if (extractor) {
          next.extractors[node.id] = {
            ...extractor,
            progress: 0,
            stored: 0,
            full: false,
            materialType: extractor.materialType ?? type,
          };
        }
      } else if (isProcessorKind(node.kind)) {
        const processor = next.processors[node.id];
        if (processor) {
          next.processors[node.id] = {
            ...processor,
            stored: 0,
            full: false,
          };
        }
      }
    });
    runtimeRef.current = next;
    setRuntime(next);
    return true;
  }, [getDisconnectedCompletedOutputs, requestInventoryOverflowConfirmation]);

  const deleteConnection = useCallback((connectionId: string) => {
    const before = connectionsRef.current;
    if (!before.some((connection) => connection.id === connectionId)) return false;
    const undoSnapshot = captureGraphUndoSnapshot();
    const next = before.filter((connection) => connection.id !== connectionId);

    connectionsRef.current = next;
    setConnections(next);
    const remainingConnectionIds = new Set(next.map((connection) => connection.id));
    setActiveFlows((current) => Object.fromEntries(
      Object.entries(current).filter(([id]) => remainingConnectionIds.has(id)),
    ));
    setSelectedConnection(null);
    setPendingDeletionConnectionId(null);
    setConnectionDeleteDialogOpen(false);
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    return true;
  }, [captureGraphUndoSnapshot, pushUndoEntry]);

  const rememberAlwaysDeleteConnections = useCallback(() => {
    setAlwaysDeleteConnections(true);
  }, []);

  const requestConnectionDeletion = useCallback((connectionId: string) => {
    if (!connectionsRef.current.some((connection) => connection.id === connectionId)) return;
    if (alwaysDeleteConnections) {
      deleteConnection(connectionId);
      return;
    }
    setSelectedConnection(connectionId);
    setSelectedNodes([]);
    setPendingDeletionConnectionId(connectionId);
    setSuppressFutureConnectionDeleteWarnings(false);
    setConnectionDeleteDialogOpen(true);
  }, [alwaysDeleteConnections, deleteConnection]);

  const openMultiConnectionManager = useCallback((
    nodeId: NodeId,
    portId: string,
    direction: PortDirection,
  ) => {
    const isMultiPort = direction === "output"
      ? isMultiOutputPort(nodeId, portId)
      : isMultiInputPort(nodeId, portId);
    if (!isMultiPort) return;
    setSelectedConnection(null);
    setSelectedNodes([nodeId]);
    setManagedMultiPort({ nodeId, portId, direction });
    setMultiConnectionManagerOpen(true);
  }, []);

  const enableTemporaryNode = useCallback((kind: PurchasableKind) => {
    if (revealedBuildKinds.has(kind)) return;
    setRevealedBuildKinds((current) => new Set(current).add(kind));
    setNewBuildKinds((current) => new Set(current).add(kind));
    setShowAllBuildNodes(false);
    setShowBuildableOnly(false);
    setBuildCategory(getBuildCategory(kind));
  }, [revealedBuildKinds]);

  const unlockAllNodesForDevelopment = useCallback(() => {
    const allKinds = VISIBLE_BUILD_CATALOG.map((item) => item.kind);
    const newlyUnlocked = allKinds.filter((kind) => !revealedBuildKinds.has(kind));

    setRevealedBuildKinds((current) => {
      const next = new Set(current);
      allKinds.forEach((kind) => next.add(kind));
      return next;
    });
    setNewBuildKinds((current) => {
      const next = new Set(current);
      newlyUnlocked.forEach((kind) => next.add(kind));
      return next;
    });
    logisticsUnlockedRef.current = true;
    setLogisticsUnlocked(true);
    setRuntime((current) => {
      const next = {
        ...current,
        research: {
          ...current.research,
          progress: {
            ...current.research.progress,
            logistics: getResearchProjectCost("logistics"),
            kiln: getResearchProjectCost("kiln"),
            charcoalGenerator: getResearchProjectCost("charcoalGenerator"),
            furnace: getResearchProjectCost("furnace"),
            refiner: getResearchProjectCost("refiner"),
            assembler: getResearchProjectCost("assembler"),
            researchCenter: getResearchProjectCost("researchCenter"),
            road: getResearchProjectCost("road"),
            areaExpansion1: getResearchProjectCost("areaExpansion1"),
          },
          logisticsUnlocked: true,
          kilnUnlocked: true,
          charcoalGeneratorUnlocked: true,
          furnaceUnlocked: true,
          refinerUnlocked: true,
          assemblerUnlocked: true,
          researchCenterUnlocked: true,
          roadUnlocked: true,
          areaExpansion1Unlocked: true,
          automataCoreUnlocked: true,
          treePlanterUnlocked: true,
          miningDrillUnlocked: true,
        },
      };
      runtimeRef.current = next;
      return next;
    });
    setShowAllBuildNodes(false);
    setShowBuildableOnly(false);
    setShowNeverBuiltOnly(false);
    setBuildCategory("all");
    if (newlyUnlocked.length > 0) {
      setBuildAttention(true);
      setJournalAttention(true);
    }
    toast.success("All nodes unlocked", {
      description: newlyUnlocked.length > 0
        ? `${newlyUnlocked.length} new nodes are now available in Build.`
        : "Every node is already available.",
    });
  }, [revealedBuildKinds]);

  const unlockAllResearchForDevelopment = useCallback(() => {
    const current = runtimeRef.current;
    const newlyCompletedProjects = RESEARCH_PROJECTS.filter(
      (project) => !project.repeatable && !isResearchProjectUnlocked(current.research, project.id),
    );
    const next: Runtime = {
      ...current,
      mapPoints: Math.max(0, current.mapPoints) + (current.research.explorationUnlocked ? 0 : 1),
      research: {
        ...current.research,
        available: true,
        activeProject: null,
        progress: Object.fromEntries(
          RESEARCH_PROJECTS.map((project) => [
            project.id,
            project.repeatable ? 0 : getResearchProjectCost(project.id, current.research),
          ]),
        ) as Record<ResearchProjectId, number>,
        logisticsUnlocked: true,
        kilnUnlocked: true,
        charcoalGeneratorUnlocked: true,
        furnaceUnlocked: true,
        refinerUnlocked: true,
        assemblerUnlocked: true,
        researchCenterUnlocked: true,
        roadUnlocked: true,
        areaExpansion1Unlocked: true,
        extractor2Unlocked: true,
        extractor3Unlocked: true,
        treePlanterUnlocked: true,
        miningDrillUnlocked: true,
        explorationUnlocked: true,
        automataCoreUnlocked: true,
      },
      researchFoundries: Object.fromEntries(
        Object.entries(current.researchFoundries).map(([nodeId, foundry]) => [
          nodeId,
          { ...foundry, progress: 0 },
        ]),
      ),
    };
    runtimeRef.current = next;
    setRuntime(next);
    unlockLogisticsBuildings();
    newlyCompletedProjects.forEach((project) => {
      announceResearchCompletion(project.id);
    });
  }, [unlockLogisticsBuildings]);

  const unlockAllMapNodesForDevelopment = useCallback(() => {
    const sectorKeys = Array.from({ length: MAP_GRID_SIZE * MAP_GRID_SIZE }, (_, index) => {
      const x = index % MAP_GRID_SIZE;
      const y = Math.floor(index / MAP_GRID_SIZE);
      return `${x},${y}`;
    }).filter(isMapNodeInRange);
    const newlyUnlockedCount = sectorKeys.filter(
      (sectorKey) => !isMapNodeUnlocked(mapNodeProgress, sectorKey),
    ).length;
    const nextProgress = { ...mapNodeProgress };
    sectorKeys.forEach((sectorKey) => {
      nextProgress[sectorKey] = {
        ...nextProgress[sectorKey],
        explored: true,
        customName: nextProgress[sectorKey]?.customName ?? (
          sectorKey === MAP_HOME_SECTOR ? "Home Factory" : null
        ),
      };
    });
    mapNodeProgressRef.current = nextProgress;
    setMapNodeProgress(nextProgress);
    setSelectedMapSector(null);
    toast.success(
      newlyUnlockedCount > 0 ? "All map nodes unlocked" : "All map nodes already unlocked",
      {
        description: newlyUnlockedCount > 0
          ? `${newlyUnlockedCount} map ${newlyUnlockedCount === 1 ? "node is" : "nodes are"} now available.`
          : "Every map node is already available for travel.",
      },
    );
  }, [mapNodeProgress]);

  const getDeletionRefund = useCallback((nodeIds: Iterable<NodeId>) => {
    const refund = new Map<InventoryItemType, number>();
    const current = runtimeRef.current;
    Array.from(nodeIds).forEach((nodeId) => {
      const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
      if (!node || !isDestroyableNode(node) || !current.construction[nodeId]) return;
      if (repeatPlacementPreviewRef.current?.nodeId === nodeId) return;
      const catalogItem = BUILD_CATALOG.find((item) => item.kind === node.kind);
      catalogItem?.recipe.forEach((ingredient) => {
        refund.set(
          ingredient.type,
          (refund.get(ingredient.type) ?? 0) + ingredient.amount,
        );
      });
    });
    return refund;
  }, []);

  const getDeletionMaterialSummary = useCallback((nodeIds: Iterable<NodeId>) => {
    const deletableNodeIds = new Set(nodeIds);
    const refund = getDeletionRefund(deletableNodeIds);
    const stored = new Map<InventoryItemType, number>();
    INVENTORY_ITEMS.forEach(({ type }) => {
      getStoredItemLocations(
        runtimeRef.current,
        nodesRef.current,
        connectionsRef.current,
        type,
      ).forEach((location) => {
        if (!deletableNodeIds.has(location.nodeId) || location.bucket === "production") return;
        stored.set(type, (stored.get(type) ?? 0) + location.amount);
      });
    });
    return { refund, stored };
  }, [getDeletionRefund]);

  const destroyNodes = useCallback((nodeIds: Iterable<NodeId>) => {
    const deletableNodeIds = new Set(
      Array.from(new Set(nodeIds)).filter((nodeId) => {
        const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
        return Boolean(node && isDestroyableNode(node));
      }),
    );
    if (!deletableNodeIds.size) return false;
    const undoSnapshot = captureGraphUndoSnapshot();
    const pairedRoads = Array.from(deletableNodeIds).flatMap((nodeId) => {
      const road = runtimeRef.current.roads?.[nodeId];
      return road?.pairedSector && road.pairedRoadId
        ? [{ sectorKey: road.pairedSector, roadId: road.pairedRoadId }]
        : [];
    });
    pairedRoads.forEach(({ sectorKey }) => {
      const factory = mapFactoriesRef.current[sectorKey];
      if (!factory || undoSnapshot.mapFactoryStates?.[sectorKey]) return;
      undoSnapshot.mapFactoryStates = {
        ...(undoSnapshot.mapFactoryStates ?? {}),
        [sectorKey]: structuredClone(factory),
      };
    });
    const materials = getDeletionMaterialSummary(deletableNodeIds);
    const refund = materials.refund;
    const beforeConnections = connectionsRef.current;
    const nextConnections = removeConnectionsWithDependents(
      beforeConnections,
      (connection) =>
        deletableNodeIds.has(connection.sourceNode) ||
        deletableNodeIds.has(connection.targetNode),
      nodesRef.current,
      runtimeRef.current,
    );
    const recoveredMaterials = new Map(refund);
    materials.stored.forEach((amount, type) => {
      recoveredMaterials.set(type, (recoveredMaterials.get(type) ?? 0) + amount);
    });
    if (!storeDisconnectedCompletedOutputs(beforeConnections, nextConnections, {
      additionalItems: recoveredMaterials,
      additionalNodeIds: deletableNodeIds,
      blockedAction: deletableNodeIds.size === 1 ? "destroying this node" : "destroying these nodes",
      allowOverflowLoss: true,
    })) return false;

    if (pairedRoads.length > 0) {
      const nextFactories = { ...mapFactoriesRef.current };
      pairedRoads.forEach(({ sectorKey, roadId }) => {
        const factory = nextFactories[sectorKey];
        if (!factory) return;
        const nextFactoryRuntime = cloneStoredMaterialRuntime(factory.runtime);
        delete nextFactoryRuntime.roads[roadId];
        delete nextFactoryRuntime.construction[roadId];
        const nextFactoryPositions = { ...factory.positions };
        delete nextFactoryPositions[roadId];
        nextFactories[sectorKey] = {
          ...factory,
          nodes: factory.nodes.filter((node) => node.id !== roadId),
          positions: nextFactoryPositions,
          connections: factory.connections.filter(
            (connection) =>
              connection.sourceNode !== roadId && connection.targetNode !== roadId,
          ),
          controlGroups: factory.controlGroups
            .map((group) => ({
              ...group,
              nodeIds: group.nodeIds.filter((nodeId) => nodeId !== roadId),
            }))
            .filter((group) => group.nodeIds.length >= 2),
          runtime: nextFactoryRuntime,
        };
      });
      mapFactoriesRef.current = nextFactories;
    }

    const nextNodes = nodesRef.current.filter((node) => !deletableNodeIds.has(node.id));
    nodesRef.current = nextNodes;
    setNodes(nextNodes);

    const remainingControlGroups = controlGroupsRef.current
      .map((group) => ({
        ...group,
        nodeIds: group.nodeIds.filter((nodeId) => !deletableNodeIds.has(nodeId)),
      }))
      .filter((group) => group.nodeIds.length >= 2);
    const remainingControlGroupIds = new Set(remainingControlGroups.map((group) => group.id));
    controlGroupsRef.current = remainingControlGroups;
    setControlGroups(remainingControlGroups);
    setActiveControlGroupId((current) => current && remainingControlGroupIds.has(current) ? current : null);
    if (individualControlNodeRef.current && deletableNodeIds.has(individualControlNodeRef.current)) {
      individualControlNodeRef.current = null;
    }
    setIndividualControlNodeId((current) => current && deletableNodeIds.has(current) ? null : current);

    const nextPositions = { ...positionsRef.current };
    deletableNodeIds.forEach((nodeId) => delete nextPositions[nodeId]);
    positionsRef.current = nextPositions;
    setPositions(nextPositions);

    connectionsRef.current = nextConnections;
    setConnections(nextConnections);
    const remainingConnectionIds = new Set(nextConnections.map((connection) => connection.id));
    setActiveFlows((current) => Object.fromEntries(
      Object.entries(current).filter(([connectionId]) => remainingConnectionIds.has(connectionId)),
    ));

    const current = runtimeRef.current;
    const next = cloneStoredMaterialRuntime(current);
    next.treePlanters = { ...current.treePlanters };
    next.miningDrills = { ...current.miningDrills };
    next.minedDeposits = { ...current.minedDeposits };
    next.roads = { ...(current.roads ?? {}) };
    next.inventorySources = { ...current.inventorySources };
    next.pausedOutputs = { ...(current.pausedOutputs ?? {}) };
    next.construction = { ...current.construction };
    recoveredMaterials.forEach((amount, type) => {
      depositMaterialIntoStorageInPlace(next, nextNodes, type, amount);
    });
    deletableNodeIds.forEach((nodeId) => {
      delete next.extractors[nodeId];
      delete next.processors[nodeId];
      delete next.generators[nodeId];
      delete next.researchFoundries[nodeId];
      delete next.treePlanters[nodeId];
      delete next.miningDrills[nodeId];
      delete next.minedDeposits[nodeId];
      delete next.splitters[nodeId];
      delete next.joints[nodeId];
      delete next.roads[nodeId];
      delete next.inventorySources[nodeId];
      delete next.filters[nodeId];
      delete next.woodenChests[nodeId];
      delete next.storages[nodeId];
      delete next.pausedOutputs[nodeId];
      delete next.construction[nodeId];
    });
    runtimeRef.current = next;
    setRuntime(next);

    if (placingNodeRef.current && deletableNodeIds.has(placingNodeRef.current)) {
      if (pendingPlacementUndoRef.current?.nodeId === placingNodeRef.current) {
        pendingPlacementUndoRef.current = null;
      }
      placingNodeRef.current = null;
      repeatPlacementPreviewRef.current = null;
      continuousReplicationRef.current = false;
      setPlacingNodeId(null);
      updatePlacementBlocked(false);
    }
    if (configuringFilterId && deletableNodeIds.has(configuringFilterId)) {
      setConfiguringFilterId(null);
    }
    if (configuringMiningDrillId && deletableNodeIds.has(configuringMiningDrillId)) {
      setConfiguringMiningDrillId(null);
    }
    if (configuringAssemblerId && deletableNodeIds.has(configuringAssemblerId)) {
      setConfiguringAssemblerId(null);
    }
    dragRef.current = null;
    setDraggingNode(null);
    setDragCollisionBlocked(false);
    insertionTargetRef.current = null;
    setInsertionTarget(null);
    setSelectedConnection(null);
    selectedNodesRef.current = [];
    prioritizedBoxSelectionRef.current = [];
    setSelectedNodes([]);
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    return true;
  }, [
    captureGraphUndoSnapshot,
    configuringFilterId,
    configuringMiningDrillId,
    configuringAssemblerId,
    getDeletionMaterialSummary,
    pushUndoEntry,
    storeDisconnectedCompletedOutputs,
    updatePlacementBlocked,
  ]);

  const requestNodeDeletion = useCallback((
    nodeIds: Iterable<NodeId>,
    options: {
      highlightedControlGroup?: boolean;
    } = {},
  ) => {
    const destroyableNodes = Array.from(new Set(nodeIds)).flatMap((nodeId) => {
      const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
      return node && isDestroyableNode(node) ? [node] : [];
    });
    if (!destroyableNodes.length) return;
    const destroyableIds = destroyableNodes.map((node) => node.id);
    setPendingDeletionNodeIds(destroyableIds);
    setPendingDeletionDetails({
      count: destroyableNodes.length,
      title: destroyableNodes.length === 1
        ? destroyableNodes[0].title
        : `${destroyableNodes.length} nodes`,
    });

    if (alwaysApproveNodeDestruction) {
      destroyNodes(destroyableIds);
      return;
    }
    setPendingDeletionIsHighlightedGroup(Boolean(options.highlightedControlGroup));
    setDestroyDialogOpen(true);
  }, [
    alwaysApproveNodeDestruction,
    destroyNodes,
  ]);

  const connectPorts = useCallback(function connectPortsInternal(
    first: PortHandle,
    second: PortHandle,
    replaceConnectionId?: string,
    allowMaterialLoss = false,
  ) {
    if (first.nodeId === second.nodeId || first.port.direction === second.port.direction) {
      toast.error("Choose an input and an output", {
        description: "A cable must run between two different nodes.",
      });
      return false;
    }

    const output = first.port.direction === "output" ? first : second;
    const input = first.port.direction === "input" ? first : second;
    if (
      isAssemblerPortDisabled(output.nodeId, output.port.id, runtimeRef.current) ||
      isAssemblerPortDisabled(input.nodeId, input.port.id, runtimeRef.current)
    ) {
      toast.error("Choose an Assembler recipe first", {
        description: "Only ports used by the selected recipe can be connected.",
      });
      return false;
    }
    const connectionsWithoutReplacement = connectionsRef.current.filter((item) =>
      item.id !== replaceConnectionId &&
      (
        isMultiInputPort(input.nodeId, input.port.id) ||
        item.targetNode !== input.nodeId ||
        item.targetPort !== input.port.id
      ),
    );
    const effectiveInput = getRuntimeAwarePort(
      input.nodeId,
      input.port,
      connectionsWithoutReplacement,
      runtimeRef.current,
    );

    if (!isCompatible(output.port, effectiveInput)) {
      toast.error("Socket type mismatch", {
        description: `${output.port.type} cannot feed a ${effectiveInput.type} socket.`,
      });
      return false;
    }

    const cableStart = getPortWorldPosition(output.nodeId, output.port.id);
    const cableEnd = getPortWorldPosition(input.nodeId, input.port.id);
    const blockingHoles = Object.values(runtimeRef.current.blackHoles ?? {}).filter(
      (hole) => hole.id !== output.nodeId && hole.id !== input.nodeId,
    );
    const blockingLakes = Object.values(runtimeRef.current.lakes ?? {}).filter(
      (lake) => lake.id !== output.nodeId && lake.id !== input.nodeId,
    );
    if (
      cableStart &&
      cableEnd &&
      (
        curveIntersectsBlackHole(cableStart, cableEnd, output.port.id, blockingHoles) ||
        curveIntersectsLake(cableStart, cableEnd, output.port.id, blockingLakes)
      )
    ) {
      toast.error("Cable path blocked", {
        description: "Connections cannot pass through an obstruction.",
      });
      return false;
    }

    const incompatibleOutputConnections = getIncompatibleLogisticsOutputConnections(
      input.nodeId,
      input.port.id,
      output.port.type,
      connectionsWithoutReplacement,
      nodesRef.current,
      runtimeRef.current,
    );
    if (incompatibleOutputConnections.length) {
      toast.error("Input would invalidate an output", {
        description: incompatibleOutputConnections.length === 1
          ? "Disconnect or reroute the incompatible output before changing this logistics input."
          : `Disconnect or reroute the ${incompatibleOutputConnections.length} incompatible outputs before changing this logistics input.`,
      });
      return false;
    }

    const connection: Connection = {
      id: `${output.nodeId}-${output.port.id}-${input.nodeId}-${input.port.id}-${Date.now()}`,
      sourceNode: output.nodeId,
      sourcePort: output.port.id,
      targetNode: input.nodeId,
      targetPort: input.port.id,
      type: output.port.type,
    };

    const currentConnections = connectionsRef.current;
    const isExtractorResourceInput =
      isExtractorNode(input.nodeId) && input.port.id === "resource-in";
    const incomingExtractorProduct = isExtractorResourceInput
      ? EXTRACTOR_RECIPES[output.port.type]?.product ?? null
      : null;
    const previousExtractorResourceConnection = isExtractorResourceInput
      ? currentConnections.find((item) =>
          item.targetNode === input.nodeId && item.targetPort === "resource-in",
        ) ?? null
      : null;
    const previousExtractorProduct = previousExtractorResourceConnection
      ? EXTRACTOR_RECIPES[previousExtractorResourceConnection.type]?.product ?? null
      : runtimeRef.current.extractors[input.nodeId]?.materialType ?? null;
    const extractorResourceChanged = isExtractorResourceInput && Boolean(
      previousExtractorResourceConnection
        ? previousExtractorResourceConnection.sourceNode !== output.nodeId ||
          previousExtractorResourceConnection.sourcePort !== output.port.id ||
          previousExtractorResourceConnection.type !== output.port.type
        : previousExtractorProduct && previousExtractorProduct !== incomingExtractorProduct,
    );
    const nextConnections = (() => {
      const current = currentConnections;
      const available = replaceConnectionId
        // Treat a cable move as one atomic graph edit. Revalidating after the
        // old endpoint is removed but before the replacement is added can
        // momentarily erase downstream routes that the replacement keeps valid.
        ? current.filter((item) => item.id !== replaceConnectionId)
        : current;
      const isConflictingConnection = (item: Connection) =>
        (!isMultiOutputPort(connection.sourceNode, connection.sourcePort) &&
          item.sourceNode === connection.sourceNode && item.sourcePort === connection.sourcePort) ||
        (!isMultiInputPort(connection.targetNode, connection.targetPort) &&
          item.targetNode === connection.targetNode && item.targetPort === connection.targetPort);
      let next = [
        ...available.filter((item) => !isConflictingConnection(item)),
        connection,
      ];

      if (isExtractorNode(input.nodeId) && input.port.id === "resource-in") {
        const recipe = EXTRACTOR_RECIPES[output.port.type];
        next = next.flatMap((item) => {
          if (item.sourceNode !== input.nodeId || item.sourcePort !== "product-out") return [item];
          if (!recipe) return [];
          const target = nodesRef.current
            .find((node) => node.id === item.targetNode)
            ?.inputs.find((port) => port.id === item.targetPort);
          const productPort: Port = {
            id: "product-out",
            label: recipe.label,
            type: recipe.product,
            direction: "output",
          };
          return target && isCompatible(productPort, target)
            ? [{ ...item, type: recipe.product }]
            : [];
        });
      }

      if (isSplitterNode(input.nodeId) && input.port.id === "split-in") {
        next = next.flatMap((item) => {
          if (
            item.sourceNode !== input.nodeId ||
            (item.sourcePort !== "split-a-out" && item.sourcePort !== "split-b-out")
          ) return [item];
          const target = nodesRef.current
            .find((node) => node.id === item.targetNode)
            ?.inputs.find((port) => port.id === item.targetPort);
          const smartPort: Port = {
            id: item.sourcePort,
            label: item.sourcePort === "split-a-out" ? "A" : "B",
            type: output.port.type,
            direction: "output",
          };
          return target && isCompatible(smartPort, target)
            ? [{ ...item, type: output.port.type }]
            : [];
        });
      }

      if (
        isMergerNode(input.nodeId) &&
        (input.port.id === "merge-a-in" || input.port.id === "merge-b-in")
      ) {
        next = next.flatMap((item) => {
          if (item.sourceNode !== input.nodeId || item.sourcePort !== "merge-out") return [item];
          const targetSpec = nodesRef.current
            .find((node) => node.id === item.targetNode)
            ?.inputs.find((port) => port.id === item.targetPort);
          const target = targetSpec
            ? getRuntimeAwarePort(
                item.targetNode,
                targetSpec,
                next.filter((edge) => edge.id !== item.id),
                runtimeRef.current,
              )
            : null;
          const smartPort: Port = {
            id: "merge-out",
            label: PRODUCTION_PORT_LABEL,
            type: output.port.type,
            direction: "output",
          };
          return target && isCompatible(smartPort, target)
            ? [{ ...item, type: output.port.type }]
            : [];
        });
      }

      if (isJointNode(input.nodeId) && input.port.id === "joint-in") {
        next = next.flatMap((item) => {
          if (item.sourceNode !== input.nodeId || item.sourcePort !== "joint-out") return [item];
          const targetSpec = nodesRef.current
            .find((node) => node.id === item.targetNode)
            ?.inputs.find((port) => port.id === item.targetPort);
          const target = targetSpec
            ? getRuntimeAwarePort(
                item.targetNode,
                targetSpec,
                next.filter((edge) => edge.id !== item.id),
                runtimeRef.current,
              )
            : null;
          const smartPort: Port = {
            id: "joint-out",
            label: "Out",
            type: output.port.type,
            direction: "output",
          };
          return target && isCompatible(smartPort, target)
            ? [{ ...item, type: output.port.type }]
            : [];
        });
      }

      const inputProcessor = runtimeRef.current.processors[input.nodeId];
      if (isSmartProcessorTypingPort(input.nodeId, input.port.id, inputProcessor)) {
        const smartOutput = getSmartProcessorOutput(
          input.nodeId,
          output.port.type,
          inputProcessor,
        );
        const outputPortId = getSmartProcessorOutputPortId(input.nodeId, inputProcessor);
        next = next.flatMap((item) => {
          if (item.sourceNode !== input.nodeId || item.sourcePort !== outputPortId) return [item];
          if (!smartOutput) return [];
          const targetSpec = nodesRef.current
            .find((node) => node.id === item.targetNode)
            ?.inputs.find((port) => port.id === item.targetPort);
          const target = targetSpec
            ? getRuntimeAwarePort(
                item.targetNode,
                targetSpec,
                next.filter((edge) => edge.id !== item.id),
                runtimeRef.current,
              )
            : null;
          const smartPort: Port = {
            id: outputPortId ?? item.sourcePort,
            label: smartOutput.label,
            type: smartOutput.type,
            direction: "output",
          };
          return target && isCompatible(smartPort, target)
            ? [{ ...item, type: smartOutput.type }]
            : [];
        });
      }

      next = normalizeDynamicConnections(next, nodesRef.current, runtimeRef.current);
      return next;
    })();
    const undoSnapshot = captureGraphUndoSnapshot();
    if (!storeDisconnectedCompletedOutputs(currentConnections, nextConnections, {
      ignoredCompletedNodeIds: extractorResourceChanged ? [input.nodeId] : undefined,
      blockedAction: "rewiring these nodes",
      allowOverflowLoss: allowMaterialLoss,
      overflowTitle: "Continue with limited storage space?",
      overflowDescription: "Creating this input connection will move stored production items into available storage nodes, but there is not enough space for all of them. The listed overflow will be permanently destroyed if you continue.",
      onConfirmOverflow: () => connectPortsInternal(
        first,
        second,
        replaceConnectionId,
        true,
      ),
    })) return false;
    connectionsRef.current = nextConnections;
    setConnections(nextConnections);
    lastPlayerActivityElapsedRef.current = gameElapsedMsRef.current;
    if (isExtractorResourceInput) {
      setRuntime((current) => {
        const previous = current.extractors[input.nodeId] ?? {
          progress: 0,
          stored: 0,
          full: false,
          materialType: null,
        };
        const next = {
          ...current,
          extractors: {
            ...current.extractors,
            [input.nodeId]: {
              ...previous,
              progress: 0,
              stored: extractorResourceChanged ? 0 : previous.stored,
              full: extractorResourceChanged
                ? false
                : previous.stored >= EXTRACTOR_CAPACITY,
              materialType: incomingExtractorProduct,
            },
          },
        };
        runtimeRef.current = next;
        return next;
      });
    } else if (isSplitterNode(input.nodeId) && input.port.id === "split-in") {
      setRuntime((current) => {
        const next = {
          ...current,
          splitters: {
            ...current.splitters,
            [input.nodeId]: { nextOutput: "a" as const },
          },
        };
        runtimeRef.current = next;
        return next;
      });
    } else if (isJointNode(input.nodeId) && input.port.id === "joint-in") {
      setRuntime((current) => {
        const next = {
          ...current,
          joints: {
            ...current.joints,
            [input.nodeId]: {
              bufferedType: null,
              orientation: current.joints[input.nodeId]?.orientation ?? "horizontal" as const,
            },
          },
        };
        runtimeRef.current = next;
        return next;
      });
    } else if (isRoadNode(input.nodeId) && input.port.id === "road-in") {
      setRuntime((current) => {
        const previous = current.roads[input.nodeId];
        const next = {
          ...current,
          roads: {
            ...current.roads,
            [input.nodeId]: {
              ...(previous ?? {
                outboundType: null,
                inboundType: null,
                pairedSector: null,
                pairedRoadId: null,
                edge: null,
                mode: "export" as const,
              }),
              outboundType: null,
            },
          },
        };
        runtimeRef.current = next;
        return next;
      });
    } else if (isSmartProcessorTypingPort(
      input.nodeId,
      input.port.id,
      runtimeRef.current.processors[input.nodeId],
    )) {
      const node = nodesRef.current.find((item) => item.id === input.nodeId);
      if (node && isProcessorKind(node.kind)) {
        const processorKind = node.kind;
        setRuntime((current) => {
          const previous = current.processors[input.nodeId] ?? makeProcessorState(processorKind);
          const incomingMaterialType = getConcreteSmartProcessorMaterialType(
            input.nodeId,
            output.port.type,
            previous,
          );
          const recipe = getProcessorRecipe(processorKind, previous);
          const materialLocked = hasSmartProcessorMaterialLock(
            input.nodeId,
            previous,
            recipe ?? PROCESSOR_RECIPES[processorKind],
          );
          const next = {
            ...current,
            processors: {
              ...current.processors,
              [input.nodeId]: incomingMaterialType && !materialLocked
                ? { ...previous, materialType: incomingMaterialType }
                : previous,
            },
          };
          runtimeRef.current = next;
          return next;
        });
      }
    }
    setSelectedConnection(connection.id);
    setSelectedNodes([]);
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    return true;
  }, [
    captureGraphUndoSnapshot,
    getPortWorldPosition,
    pushUndoEntry,
    storeDisconnectedCompletedOutputs,
  ]);

  const findPortHandle = useCallback((element: Element | null): PortHandle | null => {
    const portElement = element?.closest<HTMLElement>("[data-port-node]");
    if (!portElement) return null;
    const nodeId = portElement.dataset.portNode as NodeId;
    const portId = portElement.dataset.portId;
    const node = nodesRef.current.find((item) => item.id === nodeId);
    const portSpec = node
      ? [...node.inputs, ...node.outputs].find((item) => item.id === portId)
      : runtimeRef.current.blackHoles[nodeId] && portId === BLACK_HOLE_INPUT_PORT.id
        ? BLACK_HOLE_INPUT_PORT
        : runtimeRef.current.lakes[nodeId] && portId
          ? getLakeWaterOutputPort(portId)
        : null;
    const port = portSpec
      ? getRuntimeAwarePort(nodeId, portSpec, connectionsRef.current, runtimeRef.current)
      : null;
    if (port && isAssemblerPortDisabled(nodeId, port.id, runtimeRef.current)) return null;
    return port ? { nodeId, port } : null;
  }, []);

  const findNearbyCompatiblePort = useCallback((
    clientX: number,
    clientY: number,
    source: PortHandle,
    replaceConnectionId?: string,
  ): { handle: PortHandle; point: Position } | null => {
    const elements = new Set<HTMLElement>();
    const snapPadding = PORT_SNAP_PADDING * getPortZoomScale(zoomRef.current);
    const halfSnapPadding = snapPadding / 2;
    const sampleOffsets = [
      -snapPadding,
      -halfSnapPadding,
      0,
      halfSnapPadding,
      snapPadding,
    ];
    sampleOffsets.forEach((offsetX) => {
      sampleOffsets.forEach((offsetY) => {
        document.elementsFromPoint(clientX + offsetX, clientY + offsetY)
          .forEach((element) => {
            const portElement = element.closest<HTMLElement>("[data-port-node]");
            if (portElement) elements.add(portElement);
          });
      });
    });

    let best: { handle: PortHandle; point: Position; distance: number } | null = null;
    elements.forEach((element) => {
      const candidate = findPortHandle(element);
      if (
        !candidate ||
        candidate.nodeId === source.nodeId ||
        candidate.port.direction === source.port.direction
      ) return;

      const output = source.port.direction === "output" ? source : candidate;
      const input = source.port.direction === "input" ? source : candidate;
      const connectionsWithoutReplacement = connectionsRef.current.filter((connection) =>
        connection.id !== replaceConnectionId &&
        (
          isMultiInputPort(input.nodeId, input.port.id) ||
          connection.targetNode !== input.nodeId ||
          connection.targetPort !== input.port.id
        ),
      );
      const inputNode = nodesRef.current.find((node) => node.id === input.nodeId);
      const inputSpec = inputNode?.inputs.find((port) => port.id === input.port.id);
      const effectiveInput = inputSpec
        ? getRuntimeAwarePort(
            input.nodeId,
            inputSpec,
            connectionsWithoutReplacement,
            runtimeRef.current,
          )
        : input.port;
      if (!isCompatible(output.port, effectiveInput)) return;
      if (getIncompatibleLogisticsOutputConnections(
        input.nodeId,
        input.port.id,
        output.port.type,
        connectionsWithoutReplacement,
        nodesRef.current,
        runtimeRef.current,
      ).length) return;

      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
      const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
      if (dx > snapPadding || dy > snapPadding) return;
      const distance = Math.hypot(dx, dy);
      if (best && best.distance <= distance) return;

      const originalPort = portRefs.current[`${candidate.nodeId}:${candidate.port.id}`];
      const anchorRect = originalPort?.getBoundingClientRect() ?? rect;
      best = {
        handle: candidate,
        point: pointFromEvent(
          anchorRect.left + anchorRect.width / 2,
          anchorRect.top + anchorRect.height / 2,
        ),
        distance,
      };
    });

    const bestMatch = best as { handle: PortHandle; point: Position; distance: number } | null;
    return bestMatch ? { handle: bestMatch.handle, point: bestMatch.point } : null;
  }, [findPortHandle, pointFromEvent]);

  const findInsertionTarget = useCallback((nodeId: NodeId, position: Position) => {
    const element = nodeRefs.current[nodeId];
    const width = element?.offsetWidth ?? 258;
    const height = element?.offsetHeight ?? 200;
    const left = position.x - 10;
    const right = position.x + width + 10;
    const top = position.y - 10;
    const bottom = position.y + height + 10;
    const center = { x: position.x + width / 2, y: position.y + height / 2 };
    let best: { id: string; distance: number } | null = null;
    const nodeMap = Object.fromEntries(nodesRef.current.map((node) => [node.id, node]));

    connectionsRef.current.forEach((connection) => {
      if (!getInsertionPlan(nodeId, connection, nodeMap, connectionsRef.current, runtimeRef.current)) return;
      const path = pathRefs.current[connection.id];
      if (!path) return;
      const length = path.getTotalLength();
      const samples = Math.max(12, Math.ceil(length / 10));
      for (let index = 0; index <= samples; index += 1) {
        const point = path.getPointAtLength((length * index) / samples);
        if (point.x < left || point.x > right || point.y < top || point.y > bottom) continue;
        const distance = Math.hypot(point.x - center.x, point.y - center.y);
        if (!best || distance < best.distance) best = { id: connection.id, distance };
      }
    });

    const bestMatch = best as { id: string; distance: number } | null;
    return bestMatch ? bestMatch.id : null;
  }, []);

  const insertNodeIntoConnection = useCallback((nodeId: NodeId, connectionId: string) => {
    const original = connectionsRef.current.find((connection) => connection.id === connectionId);
    if (!original) return false;
    const nodeMap = Object.fromEntries(nodesRef.current.map((node) => [node.id, node]));
    const plan = getInsertionPlan(nodeId, original, nodeMap, connectionsRef.current, runtimeRef.current);
    if (!plan) return false;
    const stamp = Date.now();
    const incoming: Connection = {
      id: `${original.sourceNode}-${nodeId}-${plan.input.id}-${stamp}`,
      sourceNode: original.sourceNode,
      sourcePort: original.sourcePort,
      targetNode: nodeId,
      targetPort: plan.input.id,
      type: original.type,
    };
    const outgoing: Connection = {
      id: `${nodeId}-${plan.output.id}-${original.targetNode}-${stamp}`,
      sourceNode: nodeId,
      sourcePort: plan.output.id,
      targetNode: original.targetNode,
      targetPort: original.targetPort,
      type: plan.output.type,
    };
    const next = normalizeDynamicConnections(
      [
        ...connectionsRef.current.filter(
          (connection) =>
            connection.id !== original.id &&
            !(connection.targetNode === nodeId && connection.targetPort === plan.input.id) &&
            !(connection.sourceNode === nodeId && connection.sourcePort === plan.output.id),
        ),
        incoming,
        outgoing,
      ],
      nodesRef.current,
      runtimeRef.current,
    );
    connectionsRef.current = next;
    setConnections(next);
    if (isSplitterNode(nodeId)) {
      setRuntime((current) => {
        const updated = {
          ...current,
          splitters: {
            ...current.splitters,
            [nodeId]: { nextOutput: "a" as const },
          },
        };
        runtimeRef.current = updated;
        return updated;
      });
    } else if (isJointNode(nodeId)) {
      setRuntime((current) => {
        const updated = {
          ...current,
          joints: {
            ...current.joints,
            [nodeId]: {
              bufferedType: null,
              orientation: current.joints[nodeId]?.orientation ?? "horizontal" as const,
            },
          },
        };
        runtimeRef.current = updated;
        return updated;
      });
    } else {
      const node = nodesRef.current.find((item) => item.id === nodeId);
      const currentProcessor = runtimeRef.current.processors[nodeId];
      if (
        node &&
        isProcessorKind(node.kind) &&
        getSmartProcessorOutputPortId(nodeId, currentProcessor)
      ) {
        const processorKind = node.kind;
        setRuntime((current) => {
          const previous = current.processors[nodeId] ?? makeProcessorState(processorKind);
          const updated = {
            ...current,
            processors: {
              ...current.processors,
              [nodeId]: makeProcessorState(
                processorKind,
                original.type,
                previous.assemblerRecipe ?? null,
                previous.refinerRecipe ?? null,
              ),
            },
          };
          runtimeRef.current = updated;
          return updated;
        });
      }
    }
    setSelectedConnection(null);
    setSelectedNodes([nodeId]);
    return true;
  }, []);

  const pairRoadAcrossMapEdge = useCallback((
    roadNode: NodeSpec,
    sourcePosition: Position,
    placementUndo: { nodeId: NodeId; snapshot: GraphUndoSnapshot } | null,
  ) => {
    if (roadNode.kind !== "road") return true;
    const sourceSector = activeMapSectorRef.current;
    const sourceSize = getEstimatedNodeSize(roadNode);
    const sourcePlayArea = getPlayAreaWorldSize(runtimeRef.current.research, sourceSector);
    const placement = getRoadEdgePlacement(
      sourcePosition,
      sourceSize,
      sourcePlayArea,
      sourceSector,
      mapNodeProgressRef.current,
    );
    if (!placement) return false;
    if (Object.entries(runtimeRef.current.roads ?? {}).some(([nodeId, road]) => (
      nodeId !== roadNode.id && road.edge === placement.edge
    ))) return false;
    const destinationFactory = mapFactoriesRef.current[placement.adjacentSector];
    if (!destinationFactory) return false;

    const destinationPlayArea = getPlayAreaWorldSize(
      runtimeRef.current.research,
      placement.adjacentSector,
    );
    const pairId = `road-pair-${roadNode.id}`;
    const nextSequence = (destinationFactory.buildSequence.road ?? 0) + 1;
    const pairNode = createBuildableNode("road", pairId, nextSequence);
    const pairSize = getEstimatedNodeSize(pairNode);
    const oppositeEdge = OPPOSITE_MAP_EDGE[placement.edge];
    if (Object.values(destinationFactory.runtime.roads ?? {}).some((road) => road.edge === oppositeEdge)) {
      return false;
    }
    const sourceCenterX = placement.position.x + sourceSize.width / 2;
    const sourceCenterY = placement.position.y + sourceSize.height / 2;
    const proportionalCenter = placement.edge === "east" || placement.edge === "west"
      ? sourceCenterY / sourcePlayArea.height * destinationPlayArea.height
      : sourceCenterX / sourcePlayArea.width * destinationPlayArea.width;
    const baseParallelPosition = placement.edge === "east" || placement.edge === "west"
      ? proportionalCenter - pairSize.height / 2
      : proportionalCenter - pairSize.width / 2;
    const destinationNodes = getMapFactoryNodes(destinationFactory);
    const isDestinationBlocked = (candidate: Position) => {
      const candidateRect = { ...candidate, ...pairSize };
      if (Object.values(destinationFactory.runtime.blackHoles ?? {}).some((hole) =>
        rectangleIntersectsBlackHole(candidateRect, hole)
      )) return true;
      if (Object.values(destinationFactory.runtime.lakes ?? {}).some((lake) =>
        rectangleIntersectsLake(candidateRect, lake)
      )) return true;
      return destinationNodes.some((destinationNode) => {
        const nodePosition = destinationFactory.positions[destinationNode.id];
        return Boolean(
          nodePosition && rectanglesOverlap(
            candidateRect,
            { ...nodePosition, ...getEstimatedNodeSize(destinationNode) },
          )
        );
      });
    };
    const pairPosition = oppositeEdge === "west" || oppositeEdge === "east"
      ? {
          x: oppositeEdge === "west" ? 0 : destinationPlayArea.width - pairSize.width,
          y: Math.max(
            12,
            Math.min(destinationPlayArea.height - pairSize.height - 12, baseParallelPosition),
          ),
        }
      : {
          x: Math.max(
            12,
            Math.min(destinationPlayArea.width - pairSize.width - 12, baseParallelPosition),
          ),
          y: oppositeEdge === "north" ? 0 : destinationPlayArea.height - pairSize.height,
        };
    if (isDestinationBlocked(pairPosition)) return false;

    if (placementUndo) {
      placementUndo.snapshot.mapFactoryStates = {
        ...(placementUndo.snapshot.mapFactoryStates ?? {}),
        [placement.adjacentSector]: structuredClone(destinationFactory),
      };
    }
    const destinationRuntime = cloneStoredMaterialRuntime(destinationFactory.runtime);
    const sourceRoad = makeRoadRuntimeState(runtimeRef.current.roads[roadNode.id], roadNode.id);
    destinationRuntime.roads[pairId] = {
      outboundType: null,
      inboundType: null,
      pairedSector: sourceSector,
      pairedRoadId: roadNode.id,
      edge: oppositeEdge,
      mode: getOppositeRoadMode(sourceRoad.mode),
    };
    destinationRuntime.construction[pairId] = { progress: 100, complete: true };
    mapFactoriesRef.current = {
      ...mapFactoriesRef.current,
      [placement.adjacentSector]: {
        ...destinationFactory,
        nodes: [...destinationFactory.nodes, serializeNode(pairNode)],
        positions: { ...destinationFactory.positions, [pairId]: pairPosition },
        runtime: destinationRuntime,
        buildSequence: {
          ...destinationFactory.buildSequence,
          road: nextSequence,
        },
      },
    };
    const activeRuntime = cloneStoredMaterialRuntime(runtimeRef.current);
    activeRuntime.roads[roadNode.id] = {
      ...sourceRoad,
      pairedSector: placement.adjacentSector,
      pairedRoadId: pairId,
      edge: placement.edge,
    };
    runtimeRef.current = activeRuntime;
    setRuntime(activeRuntime);
    return true;
  }, []);

  const commitPairedRoadMove = useCallback((
    roadNode: NodeSpec,
    sourcePosition: Position,
    origin: Position,
  ) => {
    const plan = getPairedRoadMovePlan(roadNode, sourcePosition);
    if (!plan) return false;
    const pairedFactory = mapFactoriesRef.current[plan.pairedSector];
    if (!pairedFactory) return false;

    const undoSnapshot = captureGraphUndoSnapshot();
    undoSnapshot.positions[roadNode.id] = { ...origin };
    undoSnapshot.mapFactoryStates = {
      ...(undoSnapshot.mapFactoryStates ?? {}),
      [plan.pairedSector]: structuredClone(pairedFactory),
    };
    mapFactoriesRef.current = {
      ...mapFactoriesRef.current,
      [plan.pairedSector]: {
        ...pairedFactory,
        positions: {
          ...pairedFactory.positions,
          [plan.pairedRoadId]: { ...plan.pairedPosition },
        },
      },
    };
    pushUndoEntry({ kind: "graph", snapshot: undoSnapshot });
    window.requestAnimationFrame(measureAnchors);
    return true;
  }, [captureGraphUndoSnapshot, getPairedRoadMovePlan, measureAnchors, pushUndoEntry]);

  const finishNodePlacement = useCallback((repeatPlacement: boolean) => {
    const nodeId = placingNodeRef.current;
    if (!nodeId) return false;
    const node = nodesRef.current.find((item) => item.id === nodeId);
    let position = positionsRef.current[nodeId];
    if (!node || !position) return false;

    if (node.kind === "road") {
      const roadPlacement = getRoadEdgePlacement(
        position,
        getEstimatedNodeSize(node),
        getPlayAreaWorldSize(runtimeRef.current.research, activeMapSectorRef.current),
        activeMapSectorRef.current,
        mapNodeProgressRef.current,
      );
      if (!roadPlacement) {
        updatePlacementBlocked(true);
        toast.error("Road needs an adjacent map", {
          description: "Place it on an edge shared with an unlocked adjacent map node.",
        });
        return false;
      }
      position = roadPlacement.position;
      const snappedPositions = { ...positionsRef.current, [nodeId]: position };
      positionsRef.current = snappedPositions;
      setPositions(snappedPositions);
    }

    const blocked = overlapsAnotherNode(node, position);
    updatePlacementBlocked(blocked);
    if (blocked) return false;

    const repeatPreview = repeatPlacementPreviewRef.current?.nodeId === nodeId
      ? repeatPlacementPreviewRef.current
      : null;
    const continueReplication = continuousReplicationRef.current;
    const placementUndo = pendingPlacementUndoRef.current?.nodeId === nodeId
      ? pendingPlacementUndoRef.current
      : null;
    let repeatPaymentRollback: {
      runtime: Runtime;
      mapFactories: MapFactoriesBySector;
    } | null = null;
    if (repeatPreview) {
      const catalogItem = BUILD_CATALOG.find((item) => item.kind === node.kind);
      const payment = !removeBuildCosts && catalogItem
        ? consumeGlobalBuildIngredients(
            runtimeRef.current,
            catalogItem.recipe,
            nodesRef.current,
            connectionsRef.current,
            activeMapSectorRef.current,
            mapFactoriesRef.current,
            mapNodeProgressRef.current,
          )
        : null;
      const paidRuntime = removeBuildCosts
        ? runtimeRef.current
        : payment?.activeRuntime ?? null;
      if (!paidRuntime) {
        cancelRepeatPlacementPreview();
        toast.error("Repeat placement ended", {
          description: "There are not enough materials to place another node.",
        });
        return false;
      }
      if (payment) {
        repeatPaymentRollback = {
          runtime: runtimeRef.current,
          mapFactories: mapFactoriesRef.current,
        };
        if (placementUndo) {
          placementUndo.snapshot.mapFactoryRuntimes = payment.previousFactoryRuntimes;
        }
        mapFactoriesRef.current = payment.mapFactories;
      }
      runtimeRef.current = paidRuntime;
      setRuntime(paidRuntime);
      repeatPlacementPreviewRef.current = null;
    }

    if (!pairRoadAcrossMapEdge(node, position, placementUndo)) {
      if (repeatPaymentRollback) {
        runtimeRef.current = repeatPaymentRollback.runtime;
        mapFactoriesRef.current = repeatPaymentRollback.mapFactories;
        setRuntime(repeatPaymentRollback.runtime);
        repeatPlacementPreviewRef.current = repeatPreview;
      }
      updatePlacementBlocked(true);
      toast.error("Road endpoint blocked", {
        description: "The exact matching position is blocked, or that side of the adjacent map already has a Road.",
      });
      return false;
    }

    if (node.kind === "splitter" && insertionTargetRef.current) {
      insertNodeIntoConnection(nodeId, insertionTargetRef.current);
    }

    placingNodeRef.current = null;
    repeatPlacementPreviewRef.current = null;
    setPlacingNodeId(null);
    setSelectedNodes([nodeId]);
    setSelectedConnection(null);
    insertionTargetRef.current = null;
    setInsertionTarget(null);
    updatePlacementBlocked(false);
    lastPlayerActivityElapsedRef.current = gameElapsedMsRef.current;
    if (isPurchasableKind(node.kind)) {
      const placedKind = node.kind;
      setPlacedBuildKinds((current) => new Set(current).add(placedKind));
    }
    if (node.kind === "miningDrill" && !skipMiningDrillCompletionWarning) {
      setSuppressFutureMiningDrillWarnings(false);
      setMiningDrillWarningOpen(true);
    }
    if (isExtractorKind(node.kind)) unlockLogisticsBuildings();
    if (placementUndo) {
      pushUndoEntry({ kind: "graph", snapshot: placementUndo.snapshot });
      pendingPlacementUndoRef.current = null;
    }
    if (repeatPlacement || continueReplication) {
      const catalogItem = BUILD_CATALOG.find((item) => item.kind === node.kind);
      const nextPlacementStarted = catalogItem
        ? buildNode(catalogItem.kind, catalogItem.recipe, nodeId)
        : false;
      if (!nextPlacementStarted && continueReplication) {
        continuousReplicationRef.current = false;
        const pointer = lastCanvasPointerRef.current ?? {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        };
        setReplicationResourceWarning({
          clientX: pointer.x,
          clientY: pointer.y,
          token: Date.now(),
        });
      }
    }
    return true;
  }, [
    buildNode,
    cancelRepeatPlacementPreview,
    insertNodeIntoConnection,
    overlapsAnotherNode,
    pairRoadAcrossMapEdge,
    pushUndoEntry,
    removeBuildCosts,
    skipMiningDrillCompletionWarning,
    unlockLogisticsBuildings,
    updatePlacementBlocked,
  ]);

  const movePlacingNodeToPointer = useCallback((clientX: number, clientY: number) => {
    const nodeId = placingNodeRef.current;
    if (!nodeId) return false;
    const placingNode = nodesRef.current.find((node) => node.id === nodeId);
    if (!placingNode) return false;
    const { width: placementWidth, height: placementHeight } = getNodeSize(nodeId, placingNode);
    const placementOffsetY = placingNode.kind === "joint" || placingNode.kind === "road" || placingNode.kind === "powerSplitter"
      ? placementHeight / 2
      : 42;
    const point = pointFromEvent(clientX, clientY);
    const playAreaWorldSize = getPlayAreaWorldSize(
      runtimeRef.current.research,
      activeMapSectorRef.current,
    );
    let position = {
      x: Math.max(12, Math.min(playAreaWorldSize.width - placementWidth - 12, point.x - placementWidth / 2)),
      y: Math.max(52, Math.min(playAreaWorldSize.height - placementHeight - 12, point.y - placementOffsetY)),
    };
    const roadPlacement = placingNode.kind === "road"
      ? getRoadEdgePlacement(
          position,
          { width: placementWidth, height: placementHeight },
          playAreaWorldSize,
          activeMapSectorRef.current,
          mapNodeProgressRef.current,
        )
      : null;
    if (roadPlacement) position = roadPlacement.position;
    const nextPositions = {
      ...positionsRef.current,
      [nodeId]: position,
    };
    positionsRef.current = nextPositions;
    setPositions(nextPositions);
    const blocked = overlapsAnotherNode(placingNode, position) ||
      (placingNode.kind === "road" && !roadPlacement);
    updatePlacementBlocked(blocked);
    const splitterInsertionTarget = placingNode.kind === "splitter" && !blocked
      ? findInsertionTarget(nodeId, position)
      : null;
    insertionTargetRef.current = splitterInsertionTarget;
    setInsertionTarget(splitterInsertionTarget);
    return true;
  }, [findInsertionTarget, getNodeSize, overlapsAnotherNode, pointFromEvent, updatePlacementBlocked]);

  const finishShortcutBuildDrag = useCallback((
    clientX: number,
    clientY: number,
    repeatPlacement: boolean,
  ) => {
    const bounds = workspaceRef.current?.getBoundingClientRect();
    const releasedOnField = Boolean(
      bounds &&
      clientX >= bounds.left &&
      clientX <= bounds.right &&
      clientY >= bounds.top &&
      clientY <= bounds.bottom,
    );
    if (!releasedOnField) {
      cancelNodeInHand();
      return;
    }
    lastCanvasPointerRef.current = { x: clientX, y: clientY };
    movePlacingNodeToPointer(clientX, clientY);
    finishNodePlacement(repeatPlacement);
  }, [cancelNodeInHand, finishNodePlacement, movePlacingNodeToPointer]);

  useEffect(() => {
    const getSelectionBoxHits = (start: Position, end: Position) => {
      const left = Math.min(start.x, end.x);
      const right = Math.max(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const bottom = Math.max(start.y, end.y);
      return nodesRef.current.filter((node) => {
        if (isResourceNodeKind(node.kind)) return false;
        const position = positionsRef.current[node.id];
        const element = nodeRefs.current[node.id];
        const width = element?.offsetWidth ?? 258;
        const height = element?.offsetHeight ?? 208;
        return (
          position.x < right &&
          position.x + width > left &&
          position.y < bottom &&
          position.y + height > top
        );
      }).map((node) => node.id);
    };

    const getSelectionBoxResult = (
      start: Position,
      end: Position,
      baseSelection: NodeId[],
    ) => {
      const hits = getSelectionBoxHits(start, end);
      const hitNodeIds = new Set(hits);
      const prioritizesHighlightedNodes = end.x < start.x && end.y < start.y;
      const selectsControlGroups = end.x >= start.x && end.y >= start.y;
      const representedGroups = selectsControlGroups
        ? controlGroupsRef.current.filter((group) =>
            group.nodeIds.some((nodeId) => hitNodeIds.has(nodeId)),
          )
        : [];
      const representedGroupNodeIds = representedGroups.flatMap((group) => group.nodeIds);
      const availableNodeIds = new Set(nodesRef.current.map((node) => node.id));
      const selectedNodeIds = Array.from(new Set<NodeId>([
        ...baseSelection,
        ...hits,
        ...representedGroupNodeIds,
      ])).filter((nodeId) => availableNodeIds.has(nodeId));
      return { selectedNodeIds, representedGroups, prioritizesHighlightedNodes };
    };

    let connectionAutoScrollFrame: number | null = null;
    let previousConnectionAutoScrollTime: number | null = null;

    const getConnectionEdgeVelocity = (
      coordinate: number,
      start: number,
      end: number,
    ) => {
      if (coordinate < start + CONNECTION_AUTO_SCROLL_EDGE) {
        const intensity = Math.min(
          1,
          Math.max(0, (start + CONNECTION_AUTO_SCROLL_EDGE - coordinate) / CONNECTION_AUTO_SCROLL_EDGE),
        );
        return -CONNECTION_AUTO_SCROLL_MAX_SPEED * intensity;
      }
      if (coordinate > end - CONNECTION_AUTO_SCROLL_EDGE) {
        const intensity = Math.min(
          1,
          Math.max(0, (coordinate - (end - CONNECTION_AUTO_SCROLL_EDGE)) / CONNECTION_AUTO_SCROLL_EDGE),
        );
        return CONNECTION_AUTO_SCROLL_MAX_SPEED * intensity;
      }
      return 0;
    };

    const stopConnectionAutoScroll = () => {
      if (connectionAutoScrollFrame !== null) {
        window.cancelAnimationFrame(connectionAutoScrollFrame);
        connectionAutoScrollFrame = null;
      }
      previousConnectionAutoScrollTime = null;
    };

    const runConnectionAutoScroll = (timestamp: number) => {
      connectionAutoScrollFrame = null;
      const drag = connectionDragRef.current;
      const viewport = workspaceRef.current;
      if (!drag || !viewport) {
        previousConnectionAutoScrollTime = null;
        return;
      }

      const bounds = viewport.getBoundingClientRect();
      const velocityX = getConnectionEdgeVelocity(drag.clientX, bounds.left, bounds.right);
      const velocityY = getConnectionEdgeVelocity(drag.clientY, bounds.top, bounds.bottom);
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const maxScrollTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
      const canScrollX = velocityX < 0
        ? viewport.scrollLeft > 0
        : velocityX > 0 && viewport.scrollLeft < maxScrollLeft;
      const canScrollY = velocityY < 0
        ? viewport.scrollTop > 0
        : velocityY > 0 && viewport.scrollTop < maxScrollTop;

      if (!canScrollX && !canScrollY) {
        previousConnectionAutoScrollTime = null;
        return;
      }

      const elapsedSeconds = previousConnectionAutoScrollTime === null
        ? 1 / 60
        : Math.min(0.05, Math.max(0, (timestamp - previousConnectionAutoScrollTime) / 1000));
      previousConnectionAutoScrollTime = timestamp;
      const previousLeft = viewport.scrollLeft;
      const previousTop = viewport.scrollTop;

      if (canScrollX) {
        viewport.scrollLeft = Math.max(
          0,
          Math.min(maxScrollLeft, previousLeft + velocityX * elapsedSeconds),
        );
      }
      if (canScrollY) {
        viewport.scrollTop = Math.max(
          0,
          Math.min(maxScrollTop, previousTop + velocityY * elapsedSeconds),
        );
      }

      const didScroll =
        Math.abs(viewport.scrollLeft - previousLeft) > 0.01 ||
        Math.abs(viewport.scrollTop - previousTop) > 0.01;
      if (didScroll) {
        updateGridPosition();
        setWirePointer(pointFromEvent(drag.clientX, drag.clientY));
      }

      if (didScroll) {
        connectionAutoScrollFrame = window.requestAnimationFrame(runConnectionAutoScroll);
      } else {
        previousConnectionAutoScrollTime = null;
      }
    };

    const startConnectionAutoScroll = () => {
      if (connectionAutoScrollFrame !== null || !connectionDragRef.current) return;
      connectionAutoScrollFrame = window.requestAnimationFrame(runConnectionAutoScroll);
    };

    const onPointerMove = (event: PointerEvent) => {
      setReplicationResourceWarning((current) => current
        ? { ...current, clientX: event.clientX, clientY: event.clientY }
        : current,
      );
      const viewport = workspaceRef.current;
      const bounds = viewport?.getBoundingClientRect();
      if (
        bounds &&
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      ) {
        lastCanvasPointerRef.current = { x: event.clientX, y: event.clientY };
      }
      if (placingNodeRef.current && bounds) {
        movePlacingNodeToPointer(event.clientX, event.clientY);
        return;
      }
      if (panRef.current) {
        if (!viewport) return;
        if (
          Math.hypot(
            event.clientX - panRef.current.startX,
            event.clientY - panRef.current.startY,
          ) > 4
        ) {
          panRef.current.moved = true;
        }
        viewport.scrollLeft = panRef.current.scrollLeft - (event.clientX - panRef.current.startX);
        viewport.scrollTop = panRef.current.scrollTop - (event.clientY - panRef.current.startY);
        return;
      }
      if (selectionBoxRef.current) {
        const box = selectionBoxRef.current;
        const end = pointFromEvent(event.clientX, event.clientY);
        box.end = end;
        if (Math.hypot(end.x - box.start.x, end.y - box.start.y) > 3) box.moved = true;
        setSelectionBox({ start: box.start, end });

        if (box.moved) {
          const {
            selectedNodeIds,
            representedGroups,
            prioritizesHighlightedNodes,
          } = getSelectionBoxResult(
            box.start,
            end,
            box.baseSelection,
          );
          box.currentSelection = selectedNodeIds;
          prioritizedBoxSelectionRef.current = prioritizesHighlightedNodes
            ? selectedNodeIds
            : [];
          selectedNodesRef.current = selectedNodeIds;
          setSelectedNodes(selectedNodeIds);
          setActiveControlGroupId(
            representedGroups.length === 1 ? representedGroups[0].id : null,
          );
          individualControlNodeRef.current = null;
          setIndividualControlNodeId(null);
        }
        return;
      }
      if (dragRef.current) {
        const drag = dragRef.current;
        const requestedTotalDx = (event.clientX - drag.startX) / zoomRef.current;
        const requestedTotalDy = (event.clientY - drag.startY) / zoomRef.current;
        if (Math.abs(requestedTotalDx) + Math.abs(requestedTotalDy) > 4) drag.moved = true;

        const canvas = canvasRef.current;
        const playAreaWorldSize = getPlayAreaWorldSize(
          runtimeRef.current.research,
          activeMapSectorRef.current,
        );
        const canvasWidth = canvas?.clientWidth ?? playAreaWorldSize.width;
        const canvasHeight = canvas?.clientHeight ?? playAreaWorldSize.height;
        const minimumDx = Math.max(...drag.nodeIds.map((nodeId) => {
          const origin = drag.origins[nodeId];
          return origin ? 12 - origin.x : 0;
        }));
        const maximumDx = Math.min(...drag.nodeIds.map((nodeId) => {
          const origin = drag.origins[nodeId];
          return origin ? canvasWidth - getNodeSize(nodeId).width - 12 - origin.x : 0;
        }));
        const minimumDy = Math.max(...drag.nodeIds.map((nodeId) => {
          const origin = drag.origins[nodeId];
          return origin ? 52 - origin.y : 0;
        }));
        const maximumDy = Math.min(...drag.nodeIds.map((nodeId) => {
          const origin = drag.origins[nodeId];
          return origin ? canvasHeight - getNodeSize(nodeId).height - 12 - origin.y : 0;
        }));
        const appliedDx = Math.max(minimumDx, Math.min(maximumDx, requestedTotalDx));
        const appliedDy = Math.max(minimumDy, Math.min(maximumDy, requestedTotalDy));
        const nextPositions = { ...positionsRef.current };
        drag.nodeIds.forEach((nodeId) => {
          const origin = drag.origins[nodeId];
          if (!origin) return;
          nextPositions[nodeId] = {
            x: origin.x + appliedDx,
            y: origin.y + appliedDy,
          };
        });

        const movingNodeIds = new Set(drag.nodeIds);
        const primaryNode = nodesRef.current.find((node) => node.id === drag.primaryNodeId);
        const roadMovePlan = primaryNode?.kind === "road" && drag.nodeIds.length === 1
          ? getPairedRoadMovePlan(primaryNode, nextPositions[drag.primaryNodeId])
          : undefined;
        if (roadMovePlan) {
          nextPositions[drag.primaryNodeId] = { ...roadMovePlan.sourcePosition };
        }
        const blockedByNode = drag.nodeIds.some((nodeId) => {
          const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
          const position = nextPositions[nodeId];
          return Boolean(node && position && overlapsAnotherNode(node, position, movingNodeIds));
        });
        const blockedByBlackHoleCable = !blockedByNode && movedConnectionsCrossBlackHole(
          nextPositions,
          movingNodeIds,
        );
        const blockedByRoadPair = primaryNode?.kind === "road" && !roadMovePlan;
        const movementBlocked = blockedByNode || blockedByBlackHoleCable || blockedByRoadPair;
        drag.overlapping = movementBlocked;
        if (!movementBlocked) {
          drag.lastValidPositions = Object.fromEntries(
            drag.nodeIds.flatMap((nodeId) => {
              const position = nextPositions[nodeId];
              return position ? [[nodeId, { ...position }] as const] : [];
            }),
          );
        }

        positionsRef.current = nextPositions;
        setPositions(nextPositions);
        const primaryPosition = nextPositions[drag.primaryNodeId];
        setDragCollisionBlocked(movementBlocked);
        const allowsDirectSplitterInsertion = primaryNode?.kind === "splitter";
        const target =
          drag.nodeIds.length === 1 &&
          drag.moved &&
          !movementBlocked &&
          (allowsDirectSplitterInsertion || hasControlModifier(event))
            ? findInsertionTarget(drag.primaryNodeId, primaryPosition)
            : null;
        insertionTargetRef.current = target;
        setInsertionTarget(target);
      }
      if (connecting || connectionDragRef.current) {
        const drag = connectionDragRef.current;
        if (drag) {
          drag.clientX = event.clientX;
          drag.clientY = event.clientY;
          if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4) {
            drag.moved = true;
          }
          startConnectionAutoScroll();
        }
        const activeConnection = connecting ?? drag?.connectionStart ?? null;
        const snapped = activeConnection
          ? findNearbyCompatiblePort(
              event.clientX,
              event.clientY,
              activeConnection,
              drag?.replaceConnectionId,
            )
          : null;
        updateSnappedPort(snapped?.handle ?? null);
        if (snapped) {
          setHoveredPort((current) =>
            current?.nodeId === snapped.handle.nodeId &&
            current.port.id === snapped.handle.port.id
              ? current
              : snapped.handle,
          );
        }
        setWirePointer(snapped?.point ?? pointFromEvent(event.clientX, event.clientY));
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (panRef.current) {
        if (
          panRef.current.nodeId &&
          panRef.current.moved &&
          !panRef.current.contextMenuHandled
        ) {
          suppressedNodeContextMenuRef.current = {
            nodeId: panRef.current.nodeId,
            until: performance.now() + 350,
          };
        }
        panRef.current = null;
        setIsPanning(false);
      }
      if (selectionBoxRef.current) {
        const box = selectionBoxRef.current;
        if (event.type === "pointerup") {
          const end = pointFromEvent(event.clientX, event.clientY);
          box.end = end;
          if (Math.hypot(end.x - box.start.x, end.y - box.start.y) > 3) box.moved = true;

          if (box.moved) {
            const {
              selectedNodeIds,
              representedGroups,
              prioritizesHighlightedNodes,
            } = getSelectionBoxResult(
              box.start,
              end,
              box.baseSelection,
            );
            box.currentSelection = selectedNodeIds;
            prioritizedBoxSelectionRef.current = prioritizesHighlightedNodes
              ? selectedNodeIds
              : [];
            selectedNodesRef.current = selectedNodeIds;
            setSelectedNodes(selectedNodeIds);
            setActiveControlGroupId(
              representedGroups.length === 1 ? representedGroups[0].id : null,
            );
            individualControlNodeRef.current = null;
            setIndividualControlNodeId(null);
            announceMultiNodeSelection(selectedNodeIds);
          } else if (event.button === 0 && !event.ctrlKey && !event.shiftKey) {
            recordRapidFieldClick(end, event.target);
          }
        } else {
          selectedNodesRef.current = box.baseSelection;
          prioritizedBoxSelectionRef.current = box.basePrioritySelection;
          setSelectedNodes(box.baseSelection);
        }
        selectionBoxRef.current = null;
        setSelectionBox(null);
      }
      if (dragRef.current) {
        const drag = dragRef.current;
        const draggedNode = nodesRef.current.find((node) => node.id === drag.primaryNodeId);
        const isRoadMove = draggedNode?.kind === "road" && drag.nodeIds.length === 1;
        let insertedIntoConnection = false;
        if (drag.overlapping) {
          const restoredPositions = { ...positionsRef.current };
          Object.entries(drag.lastValidPositions).forEach(([nodeId, position]) => {
            if (position) restoredPositions[nodeId] = position;
          });
          positionsRef.current = restoredPositions;
          setPositions(restoredPositions);
        } else if (
          drag.nodeIds.length === 1 &&
          drag.moved &&
          insertionTargetRef.current &&
          (
            nodesRef.current.find((node) => node.id === drag.primaryNodeId)?.kind === "splitter" ||
            hasControlModifier(event)
          )
        ) {
          const insertionUndoSnapshot = captureGraphUndoSnapshot();
          Object.entries(drag.origins).forEach(([nodeId, position]) => {
            if (position) insertionUndoSnapshot.positions[nodeId] = { ...position };
          });
          insertedIntoConnection = insertNodeIntoConnection(
            drag.primaryNodeId,
            insertionTargetRef.current,
          );
          if (insertedIntoConnection) {
            pushUndoEntry({ kind: "graph", snapshot: insertionUndoSnapshot });
          }
        }
        let positionChanged = drag.nodeIds.some((nodeId) => {
          const origin = drag.origins[nodeId];
          const current = positionsRef.current[nodeId];
          return Boolean(
            origin &&
            current &&
            (Math.abs(origin.x - current.x) > 0.01 || Math.abs(origin.y - current.y) > 0.01)
          );
        });
        let pairedRoadMoveCommitted = false;
        if (isRoadMove && draggedNode && drag.moved && positionChanged) {
          const origin = drag.origins[draggedNode.id];
          const current = positionsRef.current[draggedNode.id];
          if (event.type === "pointerup" && origin && current) {
            pairedRoadMoveCommitted = commitPairedRoadMove(draggedNode, current, origin);
          }
          if (!pairedRoadMoveCommitted) {
            const restoredPositions = { ...positionsRef.current };
            Object.entries(drag.origins).forEach(([nodeId, position]) => {
              if (position) restoredPositions[nodeId] = { ...position };
            });
            positionsRef.current = restoredPositions;
            setPositions(restoredPositions);
            positionChanged = false;
            window.requestAnimationFrame(measureAnchors);
          }
        }
        if (!isRoadMove && !insertedIntoConnection && drag.moved && positionChanged) {
          pushUndoEntry({
            kind: "movement",
            positions: Object.fromEntries(
              Object.entries(drag.origins).flatMap(([nodeId, position]) =>
                position ? [[nodeId, { ...position }] as const] : [],
              ),
            ),
          });
        }
        dragRef.current = null;
        insertionTargetRef.current = null;
        setInsertionTarget(null);
        setDraggingNode(null);
        setDragCollisionBlocked(false);
      }
      const connectionDrag = connectionDragRef.current;
      const activeConnection = connecting ?? connectionDrag?.connectionStart;
      if (activeConnection) {
        stopConnectionAutoScroll();
        const isPointerUp = event.type === "pointerup";
        const replaceConnectionId = connectionDrag?.replaceConnectionId;
        const moved = connectionDrag?.moved ?? false;
        const clickedMultiPort = Boolean(
          connectionDrag && (
            connectionDrag.originPortDirection === "output"
              ? isMultiOutputPort(connectionDrag.originNodeId, connectionDrag.originPortId)
              : isMultiInputPort(connectionDrag.originNodeId, connectionDrag.originPortId)
          ),
        );
        const target = isPointerUp
          ? snappedPortRef.current ?? findPortHandle(document.elementFromPoint(event.clientX, event.clientY))
          : null;
        if (isPointerUp && !moved && clickedMultiPort && connectionDrag) {
          openMultiConnectionManager(
            connectionDrag.originNodeId,
            connectionDrag.originPortId,
            connectionDrag.originPortDirection,
          );
        } else if (
          target &&
          (!replaceConnectionId || moved) &&
          !(target.nodeId === activeConnection.nodeId && target.port.id === activeConnection.port.id)
        ) {
          connectPorts(activeConnection, target, replaceConnectionId);
        }
        connectionDragRef.current = null;
        updateSnappedPort(null);
        setConnecting(null);
        setWirePointer(null);
        setRewiringConnectionId(null);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      stopConnectionAutoScroll();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [
    captureGraphUndoSnapshot,
    commitPairedRoadMove,
    connectPorts,
    connecting,
    announceMultiNodeSelection,
    findNearbyCompatiblePort,
    findInsertionTarget,
    findPortHandle,
    getNodeSize,
    getPairedRoadMovePlan,
    insertNodeIntoConnection,
    measureAnchors,
    movePlacingNodeToPointer,
    movedConnectionsCrossBlackHole,
    openMultiConnectionManager,
    overlapsAnotherNode,
    pointFromEvent,
    pushUndoEntry,
    recordRapidFieldClick,
    updateSnappedPort,
    updatePlacementBlocked,
    updateGridPosition,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(
        MAX_SIMULATION_ELAPSED,
        Math.max(0, now - lastSimulationTickRef.current),
      );
      lastSimulationTickRef.current = now;
      if (!isRunningRef.current) return;
      gameElapsedMsRef.current += elapsed;

      const previous = runtimeRef.current;
      const next: Runtime = {
        ironOre: { ...previous.ironOre },
        copperOre: { ...(previous.copperOre ?? makeRuntime().copperOre) },
        stone: { ...(previous.stone ?? makeRuntime().stone) },
        forest: {
          ...previous.forest,
          regenerationElapsed: previous.forest.regenerationElapsed ?? 0,
        },
        extractors: Object.fromEntries(
          Object.entries(previous.extractors).map(([id, state]) => [id, { ...state }]),
        ),
        processors: Object.fromEntries(
          Object.entries(previous.processors).map(([id, state]) => [
            id,
            {
              ...state,
              stored: getProcessorStored(state),
              full: getProcessorStored(state) >= PROCESSOR_CAPACITY,
              inputs: Object.fromEntries(
                Object.entries(state.inputs ?? {}).map(([portId, amount]) => [
                  portId,
                  Math.min(
                    PRODUCTION_INGREDIENT_CAPACITY,
                    Math.max(0, Math.floor(Number(amount) || 0)),
                  ),
                ]),
              ),
            },
          ]),
        ),
        generators: Object.fromEntries(
          Object.entries(previous.generators ?? {}).map(([id, state]) => [id, {
            ...state,
            power: Math.min(GENERATOR_MAX_POWER, Math.max(0, state.power ?? 0)),
            charcoal: Math.min(
              PRODUCTION_INGREDIENT_CAPACITY,
              Math.max(0, Math.floor(Number(state.charcoal) || 0)),
            ),
          }]),
        ),
        researchFoundries: Object.fromEntries(
          Object.entries(previous.researchFoundries ?? {}).map(([id, state]) => [id, {
            ...state,
            cores: getResearchFoundryCores(state),
            coreItems: getResearchFoundryCoreItems(state),
            coreLoaded: undefined,
          }]),
        ),
        treePlanters: Object.fromEntries(
          Object.entries(previous.treePlanters ?? {}).map(([id, state]) => [id, { ...state }]),
        ),
        miningDrills: Object.fromEntries(
          Object.entries(previous.miningDrills ?? {}).map(([id, state]) => [id, { ...state }]),
        ),
        minedDeposits: Object.fromEntries(
          Object.entries(previous.minedDeposits ?? {}).map(([id, state]) => [id, { ...state }]),
        ),
        blackHoles: normalizeBlackHoles(previous.blackHoles),
        lakes: normalizeLakes(previous.lakes),
        mapPoints: Math.max(0, Math.floor(previous.mapPoints ?? 0)),
        research: {
          ...makeResearchState(),
          ...previous.research,
          mapNodeResearchCompletions: Math.max(
            0,
            Math.floor(Number(previous.research?.mapNodeResearchCompletions) || 0),
          ),
          progress: {
            ...makeResearchState().progress,
            ...(previous.research?.progress ?? {}),
          },
        },
        splitters: Object.fromEntries(
          Object.entries(previous.splitters ?? {}).map(([id, state]) => [
            id,
            { nextOutput: state.nextOutput === "b" ? "b" as const : "a" as const },
          ]),
        ),
        joints: Object.fromEntries(
          Object.entries(previous.joints ?? {}).map(([id, state]) => [id, { ...state }]),
        ),
        roads: Object.fromEntries(
          Object.entries(previous.roads ?? {}).map(([id, state]) => [
            id,
            makeRoadRuntimeState(state, id),
          ]),
        ),
        inventorySources: Object.fromEntries(
          Object.entries(previous.inventorySources ?? {}).map(([id, state]) => [
            id,
            {
              ...state,
              channels: Object.fromEntries(
                Object.entries(state.channels ?? {}).map(([edgeId, channel]) => [
                  edgeId,
                  { ...channel },
                ]),
              ),
            },
          ]),
        ),
        filters: Object.fromEntries(
          Object.entries(previous.filters ?? {}).map(([id, state]) => [id, { ...state }]),
        ),
        woodenChests: Object.fromEntries(
          Object.entries(previous.woodenChests ?? {}).map(([id, state]) => [id, { ...state }]),
        ),
        storages: Object.fromEntries(
          Object.entries(previous.storages ?? {}).map(([id, state]) => [id, {
            ...state,
            items: normalizeItemStore(state.items, state.capacityPerItem),
          }]),
        ),
        inventoryCapacity: BASE_INVENTORY_CAPACITY,
        inventory: normalizeItemStore(previous.inventory, BASE_INVENTORY_CAPACITY),
        pausedOutputs: { ...(previous.pausedOutputs ?? {}) },
        construction: Object.fromEntries(
          Object.entries(previous.construction).map(([id, state]) => [id, { ...state }]),
        ),
        produced: { ...makeEmptyItemStore(), ...(previous.produced ?? {}) },
        extractorProduced: {
          ...makeEmptyItemStore(),
          ...(previous.extractorProduced ?? {}),
        },
      };
      const fired: string[] = [];
      const completedProductionNodeIds = new Set<NodeId>();
      const edges = connectionsRef.current;
      const simulationNodes = nodesRef.current;
      const simulationNodeById = new Map(
        simulationNodes.map((node) => [node.id, node] as const),
      );
      const simulationNodesByKind = new Map<NodeKind, NodeSpec[]>();
      simulationNodes.forEach((node) => {
        const matchingNodes = simulationNodesByKind.get(node.kind);
        if (matchingNodes) matchingNodes.push(node);
        else simulationNodesByKind.set(node.kind, [node]);
      });
      const processorNodes = simulationNodes.filter((node) => isProcessorKind(node.kind));
      const extractorNodes = simulationNodes.filter((node) => isExtractorKind(node.kind));
      const edgeById = new Map(edges.map((edge) => [edge.id, edge] as const));
      const incomingEdgeByPort = new Map<string, Connection>();
      const outgoingEdgesByPort = new Map<string, Connection[]>();
      edges.forEach((edge) => {
        incomingEdgeByPort.set(`${edge.targetNode}:${edge.targetPort}`, edge);
        const outputKey = `${edge.sourceNode}:${edge.sourcePort}`;
        const outputEdges = outgoingEdgesByPort.get(outputKey);
        if (outputEdges) outputEdges.push(edge);
        else outgoingEdgesByPort.set(outputKey, [edge]);
      });
      const powerGeneratorBySource = new Map<NodeId, NodeId | null>();
      const resolvePowerGenerator = (sourceNode: NodeId) => {
        if (powerGeneratorBySource.has(sourceNode)) {
          return powerGeneratorBySource.get(sourceNode) ?? null;
        }
        const generatorId = findPowerGeneratorId(
          sourceNode,
          edges,
          next.generators,
          next.pausedOutputs,
        );
        powerGeneratorBySource.set(sourceNode, generatorId);
        return generatorId;
      };
      const markPowerTransfer = (consumerEdge: Connection) => {
        fired.push(consumerEdge.id);
        let upstreamNode = consumerEdge.sourceNode;
        const visited = new Set<NodeId>();
        while (
          !visited.has(upstreamNode) &&
          (isJointNode(upstreamNode) || isPowerSplitterNode(upstreamNode))
        ) {
          visited.add(upstreamNode);
          const upstreamEdge = incomingEdgeByPort.get(
            `${upstreamNode}:${isPowerSplitterNode(upstreamNode) ? "power-split-in" : "joint-in"}`,
          );
          if (!upstreamEdge || upstreamEdge.type !== ResourceType.POWER) break;
          fired.push(upstreamEdge.id);
          upstreamNode = upstreamEdge.sourceNode;
        }
      };
      let dynamicConnectionsDirty = false;

      if (next.forest.remaining >= next.forest.capacity) {
        next.forest.regenerationElapsed = 0;
      } else {
        const accumulatedRegeneration = next.forest.regenerationElapsed + elapsed;
        const regeneratedLogs = Math.floor(
          accumulatedRegeneration / FOREST_BASE_REGENERATION_DURATION,
        );
        if (regeneratedLogs > 0) {
          next.forest.remaining = Math.min(
            next.forest.capacity,
            next.forest.remaining + regeneratedLogs,
          );
        }
        next.forest.regenerationElapsed = next.forest.remaining >= next.forest.capacity
          ? 0
          : accumulatedRegeneration % FOREST_BASE_REGENERATION_DURATION;
      }

      simulationNodes.forEach((node) => {
        const build = next.construction[node.id];
        if (!build || build.complete || !isPurchasableKind(node.kind)) return;
        if (repeatPlacementPreviewRef.current?.nodeId === node.id) return;
        const duration = BUILD_TIMES[node.kind];
        build.progress = Math.min(100, build.progress + (elapsed / duration) * 100);
        if (build.progress >= 100) build.complete = true;
      });

      (simulationNodesByKind.get("generator") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const generator = next.generators[node.id] ?? { power: 0, charcoal: 0 };
          next.generators[node.id] = generator;
          if (construction && !construction.complete) return;
          while (
            generator.charcoal > 0 &&
            generator.power <= GENERATOR_MAX_POWER - POWER_PER_CHARCOAL
          ) {
            generator.charcoal -= 1;
            generator.power += POWER_PER_CHARCOAL;
          }
        });

      const deliverProduct = (
        sourceNode: NodeId,
        sourcePort: string,
        product: ResourceType,
        targetEdgeId?: string,
        visitedConnectionIds: ReadonlySet<string> = new Set(),
      ): boolean => {
        if (next.pausedOutputs[sourceNode]) return false;
        const targetEdge = targetEdgeId ? edgeById.get(targetEdgeId) : null;
        const edge = targetEdgeId
          ? targetEdge?.sourceNode === sourceNode && targetEdge.sourcePort === sourcePort
            ? targetEdge
            : null
          : outgoingEdgesByPort.get(`${sourceNode}:${sourcePort}`)?.[0];
        if (!edge || visitedConnectionIds.has(edge.id)) return false;
        const nextVisitedConnectionIds = new Set(visitedConnectionIds);
        nextVisitedConnectionIds.add(edge.id);

        const targetNode = simulationNodeById.get(edge.targetNode);
        const targetConstruction = next.construction[edge.targetNode];
        const targetReady = !targetConstruction || targetConstruction.complete;
        const targetBlackHole = next.blackHoles[edge.targetNode];

        if (
          targetBlackHole &&
          edge.targetPort === BLACK_HOLE_INPUT_PORT.id &&
          product === ResourceType.STONE
        ) {
          const requiredStone = getBlackHoleStoneRequirement(
            targetBlackHole,
            getMapNodeValue(activeMapSectorRef.current),
          );
          if (targetBlackHole.stoneFilled < requiredStone) {
            targetBlackHole.stoneFilled = Math.min(
              requiredStone,
              targetBlackHole.stoneFilled + 1,
            );
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "generator" &&
          targetReady &&
          edge.targetPort === "generator-charcoal-in" &&
          product === ResourceType.CHARCOAL
        ) {
          const generator = next.generators[edge.targetNode] ?? { power: 0, charcoal: 0 };
          next.generators[edge.targetNode] = generator;
          if (generator.charcoal < PRODUCTION_INGREDIENT_CAPACITY) {
            generator.charcoal += 1;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "researchFoundry" &&
          targetReady &&
          edge.targetPort === "research-core-in" &&
          isCoreType(product)
        ) {
          const foundry = next.researchFoundries[edge.targetNode] ?? {
            progress: 0,
            cores: 0,
            coreItems: [],
          };
          next.researchFoundries[edge.targetNode] = foundry;
          const coreItems = getResearchFoundryCoreItems(foundry);
          if (getResearchFoundryCoreCount(foundry, product) < RESEARCH_CORE_CAPACITY_PER_TYPE) {
            const nextCoreItems = [...coreItems, product as CoreType];
            foundry.coreItems = nextCoreItems;
            foundry.cores = nextCoreItems.length;
            foundry.coreLoaded = undefined;
            next.research.available = true;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "miningDrill" &&
          targetReady &&
          edge.targetPort === "motor-in" &&
          product === ResourceType.MOTOR
        ) {
          const drill = next.miningDrills[edge.targetNode] ?? {
            progress: 0,
            iterations: 0,
            selectedType: null,
          };
          next.miningDrills[edge.targetNode] = drill;
          if (
            drill.selectedType &&
            drill.iterations < MINING_DRILL_ITERATIONS
          ) {
            drill.progress = 0;
            drill.iterations = Math.min(
              MINING_DRILL_ITERATIONS,
              drill.iterations + 1,
            );
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "forest" &&
          targetReady &&
          edge.targetPort === "forest-growth-in" &&
          product === ResourceType.FOREST_GROWTH &&
          next.forest.remaining < next.forest.capacity
        ) {
          next.forest.remaining = Math.min(
            next.forest.capacity,
            next.forest.remaining + 1,
          );
          fired.push(edge.id);
          return true;
        }

        if (targetNode && isProcessorKind(targetNode.kind) && targetReady) {
          let targetProcessor = next.processors[edge.targetNode] ??
            makeProcessorState(targetNode.kind);
          next.processors[edge.targetNode] = targetProcessor;
          const targetRecipe = getProcessorRecipe(targetNode.kind, targetProcessor);
          const requirement = targetRecipe?.inputs.find(
            (input) => input.id === edge.targetPort,
          );
          const productPort: Port = {
            id: "delivered-product",
            label: formatResourceType(product),
            type: product,
            direction: "output",
          };
          const requirementPort: Port | null = requirement
            ? {
                id: requirement.id,
                label: requirement.label,
                type: requirement.type,
                direction: "input",
              }
            : null;
          const smartTypingDelivery = Boolean(
            requirement &&
            getSmartProcessorOutputPortId(edge.targetNode, targetProcessor) &&
            isSmartProcessorTypingPort(edge.targetNode, edge.targetPort, targetProcessor),
          );
          const deliveredMaterialType = smartTypingDelivery
            ? getConcreteSmartProcessorMaterialType(edge.targetNode, product, targetProcessor)
            : null;
          if (deliveredMaterialType) {
            const currentMaterialType = getConcreteSmartProcessorMaterialType(
              edge.targetNode,
              targetProcessor.materialType,
              targetProcessor,
            );
            const materialLocked = hasSmartProcessorMaterialLock(
              edge.targetNode,
              targetProcessor,
              targetRecipe ?? PROCESSOR_RECIPES[targetNode.kind],
            );
            if (
              !currentMaterialType ||
              (!materialLocked && currentMaterialType !== deliveredMaterialType)
            ) {
              // The item travelling over the cable is authoritative. This also
              // upgrades older/generic PLATE or METAL cables without discarding
              // manually buffered secondary ingredients such as Charcoal.
              targetProcessor = {
                ...targetProcessor,
                materialType: deliveredMaterialType,
              };
              next.processors[edge.targetNode] = targetProcessor;
              dynamicConnectionsDirty = true;
            }
          }
          if (
            targetProcessor &&
            requirement &&
            requirementPort &&
            (
              !smartTypingDelivery ||
              getConcreteSmartProcessorMaterialType(
                edge.targetNode,
                targetProcessor.materialType,
                targetProcessor,
              ) === product
            ) &&
            isCompatible(productPort, requirementPort) &&
            (targetProcessor.inputs[requirement.id] ?? 0) < PRODUCTION_INGREDIENT_CAPACITY
          ) {
            targetProcessor.inputs[requirement.id] =
              (targetProcessor.inputs[requirement.id] ?? 0) + 1;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "filter" &&
          targetReady &&
          edge.targetPort === "filter-in" &&
          isInventoryItemType(product)
        ) {
          const targetFilter = next.filters[edge.targetNode] ?? {
            selectedType: null,
            bufferedType: null,
          };
          next.filters[edge.targetNode] = targetFilter;
          if (
            targetFilter.selectedType === product &&
            targetFilter.bufferedType === null
          ) {
            targetFilter.bufferedType = product;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "road" &&
          targetReady &&
          edge.targetPort === "road-in" &&
          isInventoryItemType(product)
        ) {
          const road = next.roads[edge.targetNode];
          if (
            road?.mode === "export" &&
            road.outboundType === null &&
            road.pairedRoadId &&
            road.pairedSector
          ) {
            road.outboundType = product;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "splitter" &&
          targetReady &&
          edge.targetPort === "split-in"
        ) {
          const targetSplitter = next.splitters[edge.targetNode] ?? {
            nextOutput: "a" as const,
          };
          next.splitters[edge.targetNode] = targetSplitter;
          const preferredOutput = targetSplitter.nextOutput;
          const alternateOutput = preferredOutput === "a" ? "b" : "a";
          const deliverTo = (output: "a" | "b") => deliverProduct(
            edge.targetNode,
            output === "a" ? "split-a-out" : "split-b-out",
            product,
            undefined,
            nextVisitedConnectionIds,
          );
          const deliveredTo = deliverTo(preferredOutput)
            ? preferredOutput
            : deliverTo(alternateOutput)
              ? alternateOutput
              : null;
          if (deliveredTo) {
            targetSplitter.nextOutput = deliveredTo === "a" ? "b" : "a";
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "merger" &&
          targetReady &&
          (edge.targetPort === "merge-a-in" || edge.targetPort === "merge-b-in")
        ) {
          const mergerType = getMergerInputType(edge.targetNode, edges);
          if (
            mergerType === product &&
            deliverProduct(
              edge.targetNode,
              "merge-out",
              product,
              undefined,
              nextVisitedConnectionIds,
            )
          ) {
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "joint" &&
          targetReady &&
          edge.targetPort === "joint-in"
        ) {
          const targetJoint = next.joints[edge.targetNode];
          if (targetJoint && targetJoint.bufferedType === null) {
            targetJoint.bufferedType = product;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "woodenChest" &&
          targetReady &&
          edge.targetPort === "chest-in" &&
          isInventoryItemType(product)
        ) {
          const chest = next.woodenChests[edge.targetNode] ?? { itemType: null, stored: 0 };
          next.woodenChests[edge.targetNode] = chest;
          if (chest.itemType && chest.itemType !== product) return false;
          if (!chest.itemType) {
            chest.itemType = product;
            dynamicConnectionsDirty = true;
          }
          if (chest.stored < WOODEN_CHEST_CAPACITY) {
            chest.stored += 1;
            fired.push(edge.id);
            return true;
          }
        }

        if (
          targetNode?.kind === "storage" &&
          targetReady &&
          isInventoryItemType(product)
        ) {
          const storage = next.storages[edge.targetNode];
          if (storage && (storage.items[product] ?? 0) < storage.capacityPerItem) {
            storage.items[product] = (storage.items[product] ?? 0) + 1;
            fired.push(edge.id);
            return true;
          }
        }

        return false;
      };

      Object.values(next.lakes).forEach((lake) => {
        const waterRoutes = LAKE_WATER_OUTPUT_PORTS.flatMap((port) =>
          outgoingEdgesByPort.get(`${lake.id}:${port.id}`) ?? []
        );
        const accumulated = lake.productionElapsed + elapsed;
        const waterUnits = Math.floor(accumulated / LAKE_PRODUCTION_DURATION);
        lake.productionElapsed = accumulated % LAKE_PRODUCTION_DURATION;
        for (let unit = 0; unit < waterUnits && waterRoutes.length > 0; unit += 1) {
          const startingIndex = lake.nextOutputIndex % waterRoutes.length;
          for (let attempt = 0; attempt < waterRoutes.length; attempt += 1) {
            const routeIndex = (startingIndex + attempt) % waterRoutes.length;
            const route = waterRoutes[routeIndex];
            if (
              deliverProduct(
                lake.id,
                route.sourcePort,
                ResourceType.WATER,
                route.id,
              )
            ) {
              lake.nextOutputIndex = (routeIndex + 1) % waterRoutes.length;
              next.produced[ResourceType.WATER] += 1;
              break;
            }
          }
        }
      });

      processorNodes
        .forEach((node) => {
          if (!isProcessorKind(node.kind)) return;
          const construction = next.construction[node.id];
          if (construction && !construction.complete) return;
          const state = next.processors[node.id];
          if (!state || state.full) return;
          (getProcessorRecipe(node.kind, state)?.inputs ?? [])
            .filter((input) => input.type === ResourceType.IRON_ORE)
            .forEach((input) => {
              const edge = incomingEdgeByPort.get(`${node.id}:${input.id}`);
              if (
                edge?.sourceNode === "ironOre" &&
                next.ironOre.remaining > 0 &&
                (state.inputs[input.id] ?? 0) < input.amount
              ) {
                state.inputs[input.id] = (state.inputs[input.id] ?? 0) + 1;
                next.ironOre.remaining -= 1;
                fired.push(edge.id);
              }
            });
        });

      const extractorIds = extractorNodes.map((node) => node.id);
      extractorIds.forEach((extractorId) => {
        const construction = next.construction[extractorId];
        if (construction && !construction.complete) {
          next.extractors[extractorId] = {
            progress: 0,
            stored: 0,
            full: false,
            materialType: null,
          };
          return;
        }
        const resourceEdge = incomingEdgeByPort.get(`${extractorId}:resource-in`);
        const recipe = resourceEdge ? EXTRACTOR_RECIPES[resourceEdge.type] : null;
        const extractor = next.extractors[extractorId] ?? {
          progress: 0,
          stored: 0,
          full: false,
          materialType: null,
        };
        next.extractors[extractorId] = extractor;
        const sourceAvailable = Boolean(
          resourceEdge &&
          getResourceRemaining(next, resourceEdge.sourceNode, resourceEdge.type, edges) > 0,
        );

        const bufferedProduct = extractor.stored > 0
          ? extractor.materialType ?? recipe?.product ?? null
          : null;
        if (bufferedProduct && deliverProduct(extractorId, "product-out", bufferedProduct)) {
          extractor.stored -= 1;
          extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
          if (extractor.stored === 0 && recipe?.product) {
            extractor.materialType = recipe.product;
          }
        }

        if (!recipe || !resourceEdge) {
          extractor.progress = 0;
          extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
          return;
        }

        if (
          extractor.stored > 0 &&
          extractor.materialType &&
          extractor.materialType !== recipe.product
        ) {
          extractor.progress = 0;
          extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
          return;
        }
        if (extractor.stored === 0) extractor.materialType = recipe.product;

        if (sourceAvailable && extractor.stored < EXTRACTOR_CAPACITY) {
          const cycleDuration = recipe.duration * getExtractorResearchCycleMultiplier(next.research);
          extractor.progress = Math.min(
            100,
            extractor.progress + (elapsed / cycleDuration) * 100,
          );
          if (extractor.progress >= 100) {
            extractor.progress = 0;
            extractor.stored = Math.min(EXTRACTOR_CAPACITY, extractor.stored + 1);
            extractor.full = extractor.stored >= EXTRACTOR_CAPACITY;
            extractor.materialType = recipe.product;
            next.produced[recipe.product] += 1;
            next.extractorProduced[recipe.product] += 1;
            consumeResource(next, resourceEdge.sourceNode, resourceEdge.type, edges);
            fired.push(resourceEdge.id);
            completedProductionNodeIds.add(extractorId);
          }
        } else if (!sourceAvailable) {
          extractor.progress = 0;
        }
      });

      processorNodes
        .forEach((node) => {
          if (!isProcessorKind(node.kind)) return;
          const construction = next.construction[node.id];
          if (construction && !construction.complete) {
            const existing = next.processors[node.id];
            next.processors[node.id] = makeProcessorState(
              node.kind,
              null,
              existing?.assemblerRecipe ?? null,
              existing?.refinerRecipe ?? null,
            );
            return;
          }

          let processor = next.processors[node.id] ?? makeProcessorState(node.kind);
          const recipe = getProcessorRecipe(node.kind, processor);
          if (!recipe) {
            processor.progress = 0;
            next.processors[node.id] = processor;
            return;
          }
          const connectedMaterialType = getConnectedSmartProcessorMaterialType(
            node.id,
            edges,
            processor,
          );
          const hasBufferedIngredients = Object.values(processor.inputs).some(
            (amount) => amount > 0,
          );
          if (
            getSmartProcessorOutputPortId(node.id, processor) &&
            connectedMaterialType &&
            processor.materialType !== connectedMaterialType &&
            getProcessorStored(processor) === 0 &&
            !hasBufferedIngredients &&
            processor.progress === 0
          ) {
            processor = makeProcessorState(
              node.kind,
              connectedMaterialType,
              processor.assemblerRecipe ?? null,
              processor.refinerRecipe ?? null,
            );
            dynamicConnectionsDirty = true;
          }
          next.processors[node.id] = processor;

          const effectiveMaterialType = getEffectiveSmartProcessorMaterialType(
            node.id,
            processor,
            edges,
          );
          const dynamicOutput = getSmartProcessorOutput(
            node.id,
            effectiveMaterialType,
            processor,
          );
          const output = dynamicOutput ?? (
            isInventoryItemType(recipe.output.type)
              ? { type: recipe.output.type, label: recipe.output.label }
              : null
          );

          if (!output) {
            processor.progress = 0;
            processor.full = getProcessorStored(processor) >= PROCESSOR_CAPACITY;
            return;
          }

          if (processor.stored > 0 && deliverProduct(node.id, recipe.output.id, output.type)) {
            processor.stored -= 1;
            processor.full = processor.stored >= PROCESSOR_CAPACITY;
          }

          if (processor.stored >= PROCESSOR_CAPACITY) {
            processor.progress = 0;
            processor.full = true;
            return;
          }

          const hasInputs = recipe.inputs.every(
            (input) => (processor.inputs[input.id] ?? 0) >= input.amount,
          );
          if (!hasInputs) {
            processor.progress = 0;
            return;
          }

          processor.progress = Math.min(
            100,
            processor.progress + (elapsed / recipe.duration) * 100,
          );
          if (processor.progress >= 100) {
            processor.progress = 0;
            processor.stored = Math.min(PROCESSOR_CAPACITY, processor.stored + 1);
            processor.full = processor.stored >= PROCESSOR_CAPACITY;
            if (isInventoryItemType(output.type)) {
              next.produced[output.type] += 1;
            }
            completedProductionNodeIds.add(node.id);
            recipe.inputs.forEach((input) => {
              processor.inputs[input.id] = Math.max(
                0,
                (processor.inputs[input.id] ?? 0) - input.amount,
              );
            });
          }
        });

      (simulationNodesByKind.get("researchFoundry") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const foundry = next.researchFoundries[node.id] ?? {
            progress: 0,
            cores: 0,
            coreItems: [],
          };
          next.researchFoundries[node.id] = foundry;
          const coreItems = getResearchFoundryCoreItems(foundry);
          foundry.coreItems = coreItems;
          foundry.cores = coreItems.length;

          if (construction && !construction.complete) {
            foundry.progress = 0;
            foundry.cores = 0;
            foundry.coreItems = [];
            return;
          }
          const activeProject = next.research.activeProject;
          if (!activeProject || isResearchProjectUnlocked(next.research, activeProject)) {
            foundry.progress = 0;
            return;
          }
          const activeProjectProgress = next.research.progress[activeProject];
          if (getResearchFoundryProjectCoreCount(
            foundry,
            activeProject,
            activeProjectProgress,
            next.research,
          ) <= 0) {
            foundry.progress = 0;
            return;
          }

          foundry.progress = Math.min(
            100,
            foundry.progress + (elapsed / RESEARCH_CYCLE_DURATION) * 100,
          );
          if (foundry.progress >= 100) {
            foundry.progress = 0;
            const requiredCoreType = getResearchProjectRequiredCoreType(
              activeProject,
              activeProjectProgress,
              next.research,
            );
            const consumedCoreIndex = requiredCoreType
              ? coreItems.findIndex((coreType) => coreType === requiredCoreType)
              : 0;
            const remainingCoreItems = coreItems.filter((_, index) => index !== consumedCoreIndex);
            foundry.coreItems = remainingCoreItems;
            foundry.cores = remainingCoreItems.length;
            const projectCost = getResearchProjectCost(activeProject, next.research);
            next.research.progress[activeProject] = Math.min(
              projectCost,
              next.research.progress[activeProject] + 1,
            );
            if (next.research.progress[activeProject] >= projectCost) {
              applyResearchProjectCompletion(next, activeProject);
              announceResearchCompletion(activeProject);
            }
          }
        });

      (simulationNodesByKind.get("treePlanter") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const planter = next.treePlanters[node.id] ?? { progress: 0 };
          next.treePlanters[node.id] = planter;

          if (construction && !construction.complete) {
            planter.progress = 0;
            return;
          }

          const powerEdge = incomingEdgeByPort.get(`${node.id}:power-in`);
          const outputEdge = outgoingEdgesByPort.get(`${node.id}:forest-growth-out`)?.[0];
          const generatorId = powerEdge
            ? resolvePowerGenerator(powerEdge.sourceNode)
            : null;
          const generator = generatorId ? next.generators[generatorId] : null;

          if (
            !powerEdge ||
            !outputEdge ||
            !generator ||
            generator.power < TREE_PLANTER_POWER_COST ||
            next.forest.remaining >= next.forest.capacity
          ) {
            planter.progress = 0;
            return;
          }

          planter.progress = Math.min(
            100,
            planter.progress + (elapsed / TREE_PLANTER_CYCLE_DURATION) * 100,
          );
          if (
            planter.progress >= 100 &&
            deliverProduct(node.id, "forest-growth-out", ResourceType.FOREST_GROWTH)
          ) {
            planter.progress = 0;
            generator.power -= TREE_PLANTER_POWER_COST;
            markPowerTransfer(powerEdge);
            completedProductionNodeIds.add(node.id);
          }
        });

      const completedMiningDrills: Array<{ nodeId: NodeId; type: MiningDrillTarget }> = [];
      (simulationNodesByKind.get("miningDrill") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const drill = next.miningDrills[node.id] ?? {
            progress: 0,
            iterations: 0,
            selectedType: null,
          };
          next.miningDrills[node.id] = drill;

          if (construction && !construction.complete) {
            drill.progress = 0;
            drill.iterations = 0;
            return;
          }
          drill.progress = 0;
          if (!drill.selectedType) {
            drill.iterations = 0;
            return;
          }
          if (drill.iterations >= MINING_DRILL_ITERATIONS) {
            completedMiningDrills.push({ nodeId: node.id, type: drill.selectedType });
          }
        });

      if (completedMiningDrills.length > 0) {
        const completedIds = new Set(completedMiningDrills.map(({ nodeId }) => nodeId));
        const nextNodes = nodesRef.current.map((node) => {
          const completion = completedMiningDrills.find(({ nodeId }) => nodeId === node.id);
          return completion ? createMinedDepositNode(node.id, completion.type) : node;
        });
        const removedConnectionIds = new Set(
          edges
            .filter((edge) => completedIds.has(edge.targetNode))
            .map((edge) => edge.id),
        );
        const nextConnections = edges.filter((edge) => !removedConnectionIds.has(edge.id));

        completedMiningDrills.forEach(({ nodeId, type }) => {
          next.minedDeposits[nodeId] = {
            type,
            remaining: MINED_DEPOSIT_CAPACITY,
            capacity: MINED_DEPOSIT_CAPACITY,
          };
          delete next.miningDrills[nodeId];
          delete next.construction[nodeId];
          toast.success(`${getMiningTarget(type)?.title ?? "Ore"} deposit discovered`, {
            description: `${MINED_DEPOSIT_CAPACITY.toLocaleString()} units are ready for extraction.`,
          });
        });

        nodesRef.current = nextNodes;
        setNodes(nextNodes);
        connectionsRef.current = nextConnections;
        setConnections(nextConnections);
        setSelectedConnection((current) => current && removedConnectionIds.has(current) ? null : current);
        setConfiguringMiningDrillId((current) => current && completedIds.has(current) ? null : current);
        window.requestAnimationFrame(measureAnchors);
      }

      (simulationNodesByKind.get("inventorySource") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const source = next.inventorySources[node.id] ?? {
            progress: 0,
            full: false,
            itemType: null,
            channels: {},
          };
          next.inventorySources[node.id] = source;

          if (construction && !construction.complete) {
            source.progress = 0;
            source.full = false;
            source.itemType = null;
            source.channels = {};
            return;
          }

          const filterEdges = (outgoingEdgesByPort.get(`${node.id}:inventory-out`) ?? []).filter(
            (edge) =>
              edge.targetPort === "filter-in" &&
              simulationNodeById.get(edge.targetNode)?.kind === "filter",
          );
          const channels: Runtime["inventorySources"][NodeId]["channels"] = {};

          filterEdges.forEach((filterEdge) => {
            const selectedType = next.filters[filterEdge.targetNode]?.selectedType ?? null;
            const channel = source.channels?.[filterEdge.id] ?? {
              progress: 0,
              full: false,
              itemType: null,
            };
            channels[filterEdge.id] = channel;

            if (channel.itemType !== selectedType) {
              channel.progress = 0;
              channel.full = false;
              channel.itemType = selectedType;
            }
            const available = selectedType
              ? getStoredItemAmount(
                  next,
                  simulationNodes,
                  edges,
                  selectedType,
                  new Set([node.id]),
                )
              : 0;
            if (!selectedType || available <= 0) {
              channel.progress = 0;
              channel.full = false;
              return;
            }

            if (!channel.full) {
              channel.progress = Math.min(
                100,
                channel.progress + (elapsed / INVENTORY_SOURCE_CYCLE_DURATION) * 100,
              );
              if (channel.progress >= 100) channel.full = true;
            }

            if (
              channel.full &&
              available > 0 &&
              deliverProduct(node.id, "inventory-out", selectedType, filterEdge.id)
            ) {
              consumeStoredMaterialInPlace(
                next,
                simulationNodes,
                edges,
                selectedType,
                1,
                new Set([node.id, filterEdge.targetNode]),
              );
              channel.progress = 0;
              channel.full = false;
            }
          });

          source.channels = channels;
          const activeChannels = Object.values(channels);
          source.progress = activeChannels.length
            ? Math.max(...activeChannels.map((channel) => channel.progress))
            : 0;
          source.full = activeChannels.some((channel) => channel.full);
          source.itemType = activeChannels.find((channel) => channel.itemType)?.itemType ?? null;
        });

      (simulationNodesByKind.get("joint") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const joint = next.joints[node.id] ?? {
            bufferedType: null,
            orientation: "horizontal" as const,
          };
          next.joints[node.id] = joint;

          if (construction && !construction.complete) {
            joint.bufferedType = null;
            return;
          }
          if (!getJointInputType(node.id, edges)) {
            joint.bufferedType = null;
            return;
          }
          if (
            joint.bufferedType &&
            deliverProduct(node.id, "joint-out", joint.bufferedType)
          ) {
            joint.bufferedType = null;
          }
        });

      (simulationNodesByKind.get("filter") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const filter = next.filters[node.id] ?? {
            selectedType: null,
            bufferedType: null,
          };
          next.filters[node.id] = filter;

          if (construction && !construction.complete) {
            filter.bufferedType = null;
            return;
          }
          if (!filter.selectedType) {
            filter.bufferedType = null;
            return;
          }
          if (
            filter.bufferedType === filter.selectedType &&
            deliverProduct(node.id, "filter-out", filter.bufferedType)
          ) {
            filter.bufferedType = null;
          }
        });

      (simulationNodesByKind.get("woodenChest") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          if (construction && !construction.complete) return;
          const chest = next.woodenChests[node.id];
          if (!chest?.itemType || chest.stored <= 0) return;
          if (deliverProduct(node.id, "chest-out", chest.itemType)) {
            chest.stored = Math.max(0, chest.stored - 1);
          }
        });

      (simulationNodesByKind.get("road") ?? [])
        .forEach((node) => {
          const construction = next.construction[node.id];
          const road = next.roads[node.id];
          if (!road || (construction && !construction.complete)) return;
          if (
            road.mode === "import" &&
            road.inboundType &&
            deliverProduct(node.id, "road-out", road.inboundType)
          ) {
            road.inboundType = null;
          }
        });

      const collapsedResources = collapseDepletedResourceNodes(
        nodesRef.current,
        positionsRef.current,
        edges,
        next,
      );
      if (collapsedResources.depletedNodes.length > 0) {
        nodesRef.current = collapsedResources.nodes;
        positionsRef.current = collapsedResources.positions;
        connectionsRef.current = collapsedResources.connections;
        setNodes(collapsedResources.nodes);
        setPositions(collapsedResources.positions);
        setConnections(collapsedResources.connections);
        const remainingNodeIds = new Set(collapsedResources.nodes.map((node) => node.id));
        const remainingSelectedNodes = selectedNodesRef.current.filter((nodeId) =>
          remainingNodeIds.has(nodeId)
        );
        selectedNodesRef.current = remainingSelectedNodes;
        setSelectedNodes(remainingSelectedNodes);
        setSelectedConnection((current) =>
          current && !collapsedResources.connections.some((connection) => connection.id === current)
            ? null
            : current
        );
        collapsedResources.depletedNodes.forEach((node) => {
          toast.warning(`${node.title} collapsed`, {
            description: "The depleted resource node became a Black Hole.",
          });
        });
        window.requestAnimationFrame(measureAnchors);
      }
      const currentSimulationEdges = collapsedResources.depletedNodes.length > 0
        ? collapsedResources.connections
        : edges;

      runtimeRef.current = next;
      if (completedProductionNodeIds.size > 0) {
        setProductionFlashTokens((current) => {
          const updated = { ...current };
          completedProductionNodeIds.forEach((nodeId) => {
            updated[nodeId] = (updated[nodeId] ?? 0) + 1;
          });
          return updated;
        });
      }
      if (wireAnimationsEnabledRef.current) {
        fired.forEach((edgeId) => pendingActiveFlowIdsRef.current.add(edgeId));
      } else {
        pendingActiveFlowIdsRef.current.clear();
      }
      if (dynamicConnectionsDirty) {
        const normalizedEdges = normalizeDynamicConnections(
          currentSimulationEdges,
          nodesRef.current,
          next,
        );
        if (!connectionsAreEqual(currentSimulationEdges, normalizedEdges)) {
          connectionsRef.current = normalizedEdges;
          setConnections(normalizedEdges);
        }
      }

      const shouldUpdateUi =
        now - lastSimulationUiUpdateRef.current >= SIMULATION_UI_INTERVAL;
      if (shouldUpdateUi) {
        lastSimulationUiUpdateRef.current = now;
        const runtimeSignature = JSON.stringify(next);
        if (runtimeSignature !== lastPublishedRuntimeSignatureRef.current) {
          lastPublishedRuntimeSignatureRef.current = runtimeSignature;
          setRuntime(next);
        }
      }
      if (
        shouldUpdateUi &&
        wireAnimationsEnabledRef.current &&
        pendingActiveFlowIdsRef.current.size > 0
      ) {
        const timestamp = Date.now();
        const pendingFlowIds = [...pendingActiveFlowIdsRef.current];
        pendingActiveFlowIdsRef.current.clear();
        setActiveFlows((current) => {
          const updated = { ...current };
          pendingFlowIds.forEach((id) => {
            updated[id] = timestamp;
          });
          return updated;
        });
      }
    }, SIMULATION_TICK_INTERVAL);

    return () => window.clearInterval(timer);
  }, [measureAnchors, unlockLogisticsBuildings]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cutoff = Date.now() - 1000;
      setActiveFlows((current) => {
        const retained = Object.entries(current).filter(([, timestamp]) => timestamp > cutoff);
        return retained.length === Object.keys(current).length
          ? current
          : Object.fromEntries(retained);
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      const isModalInteraction = target instanceof HTMLElement && Boolean(
        target.closest('[data-slot="dialog-content"], [data-slot="alert-dialog-content"], [role="menu"]'),
      );
      const isTopbarMenuInteraction = target instanceof HTMLElement && Boolean(
        target.closest(".topbar-modal"),
      );
      const digitShortcut = /^Digit([1-5])$/.exec(event.code);
      if (
        !isEditing &&
        !isModalInteraction &&
        !event.repeat &&
        !event.metaKey &&
        !event.altKey &&
        !(event.ctrlKey && event.shiftKey) &&
        digitShortcut
      ) {
        const barId: ShortcutBarId = event.ctrlKey
          ? "shortcutBar3"
          : event.shiftKey
            ? "shortcutBar2"
            : "shortcutBar1";
        event.preventDefault();
        activateShortcutSlot(barId, Number(digitShortcut[1]) - 1);
        return;
      }
      if (
        !isEditing &&
        (!isModalInteraction || isTopbarMenuInteraction) &&
        !event.repeat &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey
      ) {
        const menu = ({
          b: "build",
          i: "inventory",
          j: "journal",
          o: "options",
          q: "research",
        } as const)[event.key.toLowerCase() as "b" | "i" | "j" | "o" | "q"];
        if (menu) {
          event.preventDefault();
          openTopbarMenu(menu);
          return;
        }
      }
      if (
        !isEditing &&
        !event.shiftKey &&
        event.ctrlKey &&
        event.key.toLowerCase() === "z"
      ) {
        if (undoLastAction()) event.preventDefault();
        return;
      }
      if (
        !isEditing &&
        !event.repeat &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "r"
      ) {
        if (rotateHoveredJoint()) event.preventDefault();
        return;
      }
      if (event.code === "Space" && !isEditing) {
        spacePressedRef.current = true;
        event.preventDefault();
      }
      if ((event.key === "Delete" || event.key === "Backspace") && !isEditing) {
        if (cancelRepeatPlacementPreview()) {
          event.preventDefault();
          return;
        }
        const deletableNodeIds = new Set(
          selectedNodes.filter((nodeId) => {
            const node = nodesRef.current.find((candidate) => candidate.id === nodeId);
            return Boolean(node && isDestroyableNode(node));
          }),
        );
        const hasHighlightedNodeGroup = deletableNodeIds.size > 1;

        if (deletableNodeIds.size > 0) {
          event.preventDefault();
          requestNodeDeletion(deletableNodeIds, {
            highlightedControlGroup: hasHighlightedNodeGroup,
          });
        } else if (selectedConnection) {
          event.preventDefault();
          requestConnectionDeletion(selectedConnection);
        } else if (selectedNodes.length > 0) {
          event.preventDefault();
        }
      }
      if (event.key === "Escape") {
        cancelRepeatPlacementPreview();
        continuousReplicationRef.current = false;
        updateSnappedPort(null);
        setConnecting(null);
        setWirePointer(null);
        setRewiringConnectionId(null);
        connectionDragRef.current = null;
        selectionBoxRef.current = null;
        setSelectionBox(null);
        setSelectedConnection(null);
        selectedNodesRef.current = [];
        prioritizedBoxSelectionRef.current = [];
        setSelectedNodes([]);
        setActiveControlGroupId(null);
        individualControlNodeRef.current = null;
        setIndividualControlNodeId(null);
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") spacePressedRef.current = false;
      if (event.key === "Shift") cancelRepeatPlacementPreview();
      if (
        event.key === "Control" &&
        !event.ctrlKey &&
        continuousReplicationRef.current
      ) {
        continuousReplicationRef.current = false;
        cancelNodeInHand();
      }
    };
    const onBlur = () => {
      spacePressedRef.current = false;
      cancelRepeatPlacementPreview();
      continuousReplicationRef.current = false;
      updateSnappedPort(null);
      panRef.current = null;
      suppressedNodeContextMenuRef.current = null;
      selectionBoxRef.current = null;
      const interruptedDrag = dragRef.current;
      const interruptedNode = interruptedDrag
        ? nodesRef.current.find((node) => node.id === interruptedDrag.primaryNodeId)
        : null;
      if (interruptedDrag && (interruptedDrag.overlapping || interruptedNode?.kind === "road")) {
        const restoredPositions = { ...positionsRef.current };
        const positionsToRestore = interruptedNode?.kind === "road"
          ? interruptedDrag.origins
          : interruptedDrag.lastValidPositions;
        Object.entries(positionsToRestore).forEach(([nodeId, position]) => {
          if (position) restoredPositions[nodeId] = position;
        });
        positionsRef.current = restoredPositions;
        setPositions(restoredPositions);
      }
      dragRef.current = null;
      setSelectionBox(null);
      setIsPanning(false);
      setDraggingNode(null);
      setDragCollisionBlocked(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [
    activateShortcutSlot,
    cancelNodeInHand,
    cancelRepeatPlacementPreview,
    openTopbarMenu,
    requestNodeDeletion,
    requestConnectionDeletion,
    rotateHoveredJoint,
    selectedConnection,
    selectedNodes,
    undoLastAction,
    updateSnappedPort,
  ]);

  const beginNodeDrag = (event: React.PointerEvent, nodeId: NodeId) => {
    if (event.button !== 0 || spacePressedRef.current) return;
    if (placingNodeRef.current) {
      event.preventDefault();
      event.stopPropagation();
      finishNodePlacement(event.shiftKey);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const clickedNode = nodesRef.current.find((node) => node.id === nodeId);
    if (clickedNode && isResourceNodeKind(clickedNode.kind)) {
      selectedNodesRef.current = [nodeId];
      prioritizedBoxSelectionRef.current = [];
      setSelectedNodes([nodeId]);
      setSelectedConnection(null);
      setActiveControlGroupId(null);
      individualControlNodeRef.current = null;
      setIndividualControlNodeId(null);
      return;
    }
    if (hasControlModifier(event)) {
      const catalogItem = clickedNode && isPurchasableKind(clickedNode.kind)
        ? VISIBLE_BUILD_CATALOG.find((item) => item.kind === clickedNode.kind) ?? null
        : null;
      continuousReplicationRef.current = false;
      if (catalogItem) {
        const replicationStarted = buildNode(catalogItem.kind, catalogItem.recipe);
        continuousReplicationRef.current = replicationStarted;
        if (!replicationStarted) {
          setReplicationResourceWarning({
            clientX: event.clientX,
            clientY: event.clientY,
            token: Date.now(),
          });
        }
      }
      return;
    }
    const controlGroup = controlGroupsRef.current.find((group) => group.nodeIds.includes(nodeId));
    const isIndividualControl = individualControlNodeRef.current === nodeId || event.detail >= 2;
    const currentSelection = selectedNodesRef.current;
    const prioritySelection = prioritizedBoxSelectionRef.current;
    const prioritizesHighlightedSelection =
      currentSelection.includes(nodeId) &&
      prioritySelection.length === currentSelection.length &&
      currentSelection.every((selectedNodeId) => prioritySelection.includes(selectedNodeId));
    let nodeIds: NodeId[];
    if (controlGroup && !isIndividualControl && !prioritizesHighlightedSelection) {
      const availableNodeIds = new Set(nodesRef.current.map((node) => node.id));
      nodeIds = controlGroup.nodeIds.filter((groupNodeId) => availableNodeIds.has(groupNodeId));
      setActiveControlGroupId(controlGroup.id);
      individualControlNodeRef.current = null;
      setIndividualControlNodeId(null);
    } else if (isIndividualControl) {
      nodeIds = [nodeId];
      setActiveControlGroupId(null);
      individualControlNodeRef.current = nodeId;
      setIndividualControlNodeId(nodeId);
    } else {
      nodeIds = currentSelection.includes(nodeId)
        ? currentSelection
        : event.shiftKey
          ? [...currentSelection, nodeId]
          : [nodeId];
      setActiveControlGroupId(null);
      individualControlNodeRef.current = null;
      setIndividualControlNodeId(null);
    }
    if (clickedNode?.kind === "road") nodeIds = [nodeId];
    nodeIds = nodeIds.filter((selectedNodeId) => {
      const selectedNode = nodesRef.current.find((node) => node.id === selectedNodeId);
      return Boolean(selectedNode && !isResourceNodeKind(selectedNode.kind));
    });
    const origins = Object.fromEntries(
      nodeIds.map((selectedNodeId) => [selectedNodeId, { ...positionsRef.current[selectedNodeId] }]),
    ) as Partial<Positions>;
    selectedNodesRef.current = nodeIds;
    if (!prioritizesHighlightedSelection) prioritizedBoxSelectionRef.current = [];
    setSelectedNodes(nodeIds);
    setSelectedConnection(null);
    dragRef.current = {
      primaryNodeId: nodeId,
      nodeIds,
      startX: event.clientX,
      startY: event.clientY,
      origins,
      lastValidPositions: origins,
      overlapping: false,
      moved: false,
    };
    setDraggingNode(nodeId);
    setDragCollisionBlocked(false);
  };

  const handleCanvasPointerDownCapture = (event: React.PointerEvent) => {
    if (event.button !== 2 || !placingNodeRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    if (cancelNodeInHand()) {
      placementCancelContextMenuUntilRef.current = performance.now() + 500;
    }
  };

  const handleCanvasContextMenuCapture = (event: React.MouseEvent) => {
    if (performance.now() > placementCancelContextMenuUntilRef.current) return;
    placementCancelContextMenuUntilRef.current = 0;
    event.preventDefault();
    event.stopPropagation();
  };

  const beginCanvasPan = (event: React.PointerEvent, nodeId?: NodeId) => {
    if (event.button === 0 && placingNodeRef.current) {
      event.preventDefault();
      finishNodePlacement(event.shiftKey);
      return;
    }
    if (event.button === 1 || event.button === 2 || (event.button === 0 && spacePressedRef.current)) {
      const viewport = workspaceRef.current;
      if (!viewport) return;
      event.preventDefault();
      panRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        moved: false,
        nodeId,
        contextMenuHandled: false,
      };
      setIsPanning(true);
      return;
    }
    if (event.button === 0) {
      event.preventDefault();
      const start = pointFromEvent(event.clientX, event.clientY);
      const baseSelection = event.shiftKey ? selectedNodes : [];
      const basePrioritySelection = event.shiftKey
        ? prioritizedBoxSelectionRef.current
        : [];
      selectionBoxRef.current = {
        start,
        end: start,
        baseSelection,
        basePrioritySelection,
        currentSelection: baseSelection,
        moved: false,
      };
      setSelectionBox({ start, end: start });
      setSelectedConnection(null);
      setActiveControlGroupId(null);
      individualControlNodeRef.current = null;
      setIndividualControlNodeId(null);
      if (!event.shiftKey) {
        selectedNodesRef.current = [];
        prioritizedBoxSelectionRef.current = [];
        setSelectedNodes([]);
      }
    }
  };

  const beginConnection = (event: React.PointerEvent, nodeId: NodeId, port: Port) => {
    if (event.button !== 0 || spacePressedRef.current) return;
    if (placingNodeRef.current) {
      event.preventDefault();
      event.stopPropagation();
      finishNodePlacement(event.shiftKey);
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    let connectionStart = { nodeId, port } satisfies PortHandle;
    let replaceConnectionId: string | undefined;

    if (port.direction === "input") {
      const attached = connectionsRef.current.filter(
        (connection) => connection.targetNode === nodeId && connection.targetPort === port.id,
      );
      const existing =
        attached.find((connection) => connection.id === selectedConnection) ??
        (attached.length === 1 ? attached[0] : null);
      if (existing) {
        const sourceNode = nodesRef.current.find((node) => node.id === existing.sourceNode);
        const sourceSpec = sourceNode?.outputs.find((output) => output.id === existing.sourcePort);
        if (sourceSpec) {
          connectionStart = {
            nodeId: existing.sourceNode,
            port: getEffectivePort(existing.sourceNode, sourceSpec, connectionsRef.current),
          };
          replaceConnectionId = existing.id;
        }
      }
    }

    setConnecting(connectionStart);
    setRewiringConnectionId(replaceConnectionId ?? null);
    connectionDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
      moved: false,
      connectionStart,
      replaceConnectionId,
      originNodeId: nodeId,
      originPortId: port.id,
      originPortDirection: port.direction,
    };
    setWirePointer(pointFromEvent(event.clientX, event.clientY));
    setSelectedConnection(null);
    prioritizedBoxSelectionRef.current = [];
    setSelectedNodes([nodeId]);
  };

  const setProductionRunning = useCallback((running: boolean) => {
    isRunningRef.current = running;
    setIsRunning(running);
  }, []);

  const toggleNodeOutputPause = useCallback((nodeId: NodeId) => {
    const current = runtimeRef.current;
    const next: Runtime = {
      ...current,
      pausedOutputs: {
        ...(current.pausedOutputs ?? {}),
        [nodeId]: !current.pausedOutputs?.[nodeId],
      },
    };
    runtimeRef.current = next;
    setRuntime(next);
  }, []);

  const chooseResearchProject = useCallback((projectId: ResearchProjectId) => {
    const current = runtimeRef.current;
    if (
      getResearchMilestoneRequirement(projectId) ||
      !canSelectResearchProject(
        current,
        nodesRef.current,
        mapFactoriesRef.current,
        activeMapSectorRef.current,
      ) ||
      !isResearchProjectPrerequisiteSatisfied(current.research, projectId) ||
      isResearchProjectUnlocked(current.research, projectId)
    ) return;
    const next: Runtime = {
      ...current,
      research: {
        ...current.research,
        activeProject: projectId,
        progress: { ...current.research.progress },
      },
      researchFoundries: Object.fromEntries(
        Object.entries(current.researchFoundries).map(([nodeId, foundry]) => [
          nodeId,
          { ...foundry, progress: 0 },
        ]),
      ),
    };
    runtimeRef.current = next;
    setRuntime(next);
    mapFactoriesRef.current = Object.fromEntries(
      Object.entries(mapFactoriesRef.current).map(([sectorKey, factory]) => [
        sectorKey,
        sectorKey === activeMapSectorRef.current
          ? factory
          : {
              ...factory,
              runtime: {
                ...factory.runtime,
                research: {
                  ...next.research,
                  progress: { ...next.research.progress },
                },
                researchFoundries: Object.fromEntries(
                  Object.entries(factory.runtime.researchFoundries).map(([nodeId, foundry]) => [
                    nodeId,
                    { ...foundry, progress: 0 },
                  ]),
                ),
              },
            },
      ]),
    );
  }, []);

  const unlockSelectedMapNode = useCallback(() => {
    if (!selectedMapSector || !canUnlockMapNode(mapNodeProgress, selectedMapSector)) return;
    const current = runtimeRef.current;
    if (current.mapPoints <= 0) return;
    const playAreaSize = getPlayAreaWorldSize(current.research, selectedMapSector);
    const mapNodeValue = getMapNodeValue(selectedMapSector);
    const next: Runtime = {
      ...current,
      mapPoints: current.mapPoints - 1,
    };
    runtimeRef.current = next;
    setRuntime(next);
    setMapNodeProgress((progress) => ({
      ...progress,
      [selectedMapSector]: {
        ...progress[selectedMapSector],
        explored: true,
        customName: progress[selectedMapSector]?.customName ?? null,
      },
    }));
    setSelectedMapSector(null);
    toast.success("Map node unlocked", {
      description: `Node Value ${mapNodeValue} · Field Size ${playAreaSize.width.toLocaleString()} × ${playAreaSize.height.toLocaleString()}`,
    });
  }, [mapNodeProgress, selectedMapSector]);

  const captureActiveMapFactory = useCallback((): MapFactoryState => {
    const viewport = workspaceRef.current;
    const currentRuntime = runtimeRef.current;
    return {
      nodes: nodesRef.current.map(serializeNode),
      positions: Object.fromEntries(
        Object.entries(positionsRef.current).map(([nodeId, position]) => [nodeId, { ...position }]),
      ),
      connections: connectionsRef.current.map((connection) => ({ ...connection })),
      runtime: cloneStoredMaterialRuntime(currentRuntime),
      controlGroups: controlGroupsRef.current.map((group) => ({
        ...group,
        nodeIds: [...group.nodeIds],
      })),
      buildSequence: { ...buildSequenceRef.current },
      zoom: zoomRef.current,
      viewport: {
        scrollLeft: viewport?.scrollLeft ?? 0,
        scrollTop: viewport?.scrollTop ?? 0,
      },
      lastSimulatedAt: Date.now(),
      producedBaseline: { ...currentRuntime.produced },
      extractorProducedBaseline: { ...currentRuntime.extractorProduced },
    };
  }, []);

  const openMapNodeDialog = useCallback((sectorKey: string) => {
    if (!isMapNodeUnlocked(mapNodeProgress, sectorKey)) return;
    const existingName = mapNodeProgress[sectorKey]?.customName?.trim();
    setMapNodeDialogSector(sectorKey);
    setMapNodeDraftName(existingName || (sectorKey === MAP_HOME_SECTOR ? "Home Factory" : ""));
    setMapNodeDialogOpen(true);
  }, [mapNodeProgress]);

  const saveMapNodeName = useCallback(() => {
    if (!mapNodeDialogSector) return;
    const customName = mapNodeDraftName.trim().slice(0, 80);
    setMapNodeProgress((progress) => ({
      ...progress,
      [mapNodeDialogSector]: {
        ...progress[mapNodeDialogSector],
        explored: true,
        customName: customName || null,
      },
    }));
    toast.success("Map node renamed", {
      description: customName || "The node will use its default name.",
    });
  }, [mapNodeDialogSector, mapNodeDraftName]);

  const travelToMapNode = useCallback((sectorKey: string) => {
    if (
      sectorKey === activeMapSectorRef.current ||
      !isMapNodeUnlocked(mapNodeProgress, sectorKey)
    ) {
      setMapNodeDialogOpen(false);
      return;
    }

    const currentRuntime = runtimeRef.current;
    const currentSector = activeMapSectorRef.current;
    const currentFactory = captureActiveMapFactory();
    const storedFactories = {
      ...mapFactoriesRef.current,
      [currentSector]: currentFactory,
    };
    const destinationSnapshot = storedFactories[sectorKey];
    if (!destinationSnapshot) {
      toast.error("Map terrain unavailable", {
        description: "This map node was not generated when the game began.",
      });
      return;
    }
    const destination = advanceMapFactoryInBackground(destinationSnapshot, {
      sectorKey,
      elapsedMs: Date.now() - destinationSnapshot.lastSimulatedAt,
      sharedResearch: currentRuntime.research,
      sharedMapPoints: currentRuntime.mapPoints,
    });
    const destinationRuntime = cloneStoredMaterialRuntime(destination.runtime);
    destinationRuntime.research = {
      ...destination.runtime.research,
      progress: { ...destination.runtime.research.progress },
    };
    destinationRuntime.mapPoints = destination.runtime.mapPoints;
    destinationRuntime.produced = Object.fromEntries(
      INVENTORY_ITEMS.map(({ type }) => [
        type,
        (currentRuntime.produced[type] ?? 0) + Math.max(
          0,
          (destination.runtime.produced[type] ?? 0) - (destination.producedBaseline[type] ?? 0),
        ),
      ]),
    ) as Record<InventoryItemType, number>;
    destinationRuntime.extractorProduced = Object.fromEntries(
      INVENTORY_ITEMS.map(({ type }) => [
        type,
        (currentRuntime.extractorProduced[type] ?? 0) + Math.max(
          0,
          (destination.runtime.extractorProduced?.[type] ?? 0) -
            (destination.extractorProducedBaseline?.[type] ?? 0),
        ),
      ]),
    ) as Record<InventoryItemType, number>;
    const destinationNodes = destination.nodes
      .filter((node) => isNodeKind(node.kind))
      .map((node) => hydrateNode(node as SerializedNode));
    const validNodeIds = new Set([
      ...destinationNodes.map((node) => node.id),
      ...Object.keys(destinationRuntime.blackHoles ?? {}),
    ]);
    const destinationPositions = Object.fromEntries(
      Object.entries(destination.positions).filter(([nodeId]) => validNodeIds.has(nodeId)),
    );
    const destinationConnections = destination.connections.filter(
      (connection) => validNodeIds.has(connection.sourceNode) && validNodeIds.has(connection.targetNode),
    );
    const destinationControlGroups = destination.controlGroups
      .map((group) => ({
        ...group,
        nodeIds: group.nodeIds.filter((nodeId) => validNodeIds.has(nodeId)),
      }))
      .filter((group) => group.nodeIds.length > 0);

    mapFactoriesRef.current = {
      ...storedFactories,
      [sectorKey]: {
        ...destination,
        runtime: destinationRuntime,
        lastSimulatedAt: Date.now(),
        producedBaseline: { ...destinationRuntime.produced },
        extractorProducedBaseline: { ...destinationRuntime.extractorProduced },
      },
    };
    activeMapSectorRef.current = sectorKey;
    setActiveMapSector(sectorKey);
    nodesRef.current = destinationNodes;
    setNodes(destinationNodes);
    positionsRef.current = destinationPositions;
    setPositions(destinationPositions);
    connectionsRef.current = destinationConnections;
    setConnections(destinationConnections);
    runtimeRef.current = destinationRuntime;
    setRuntime(destinationRuntime);
    controlGroupsRef.current = destinationControlGroups;
    setControlGroups(destinationControlGroups);
    buildSequenceRef.current = {
      ...makeBuildSequence(),
      ...destination.buildSequence,
    };
    selectedNodesRef.current = [];
    setSelectedNodes([]);
    setSelectedConnection(null);
    setConnecting(null);
    setHoveredPort(null);
    setSnappedPort(null);
    setWirePointer(null);
    setActiveFlows({});
    anchorsRef.current = {};
    setAnchors({});
    setActiveControlGroupId(null);
    setIndividualControlNodeId(null);
    setSelectedMapSector(null);
    setMapNodeDialogOpen(false);
    setMapOpen(false);
    zoomRef.current = destination.zoom;
    pinchTargetZoomRef.current = destination.zoom;
    setZoom(destination.zoom);
    lastSimulationTickRef.current = performance.now();
    lastPublishedRuntimeSignatureRef.current = null;
    window.requestAnimationFrame(() => {
      const viewport = workspaceRef.current;
      if (!viewport) return;
      viewport.scrollLeft = destination.viewport.scrollLeft;
      viewport.scrollTop = destination.viewport.scrollTop;
      window.requestAnimationFrame(measureAnchors);
    });
    const destinationName = mapNodeProgress[sectorKey]?.customName?.trim() || "Unnamed Node";
    toast.success(`Traveled to ${destinationName}`);
  }, [captureActiveMapFactory, mapNodeProgress, measureAnchors]);

  const resetFactory = useCallback(() => {
    undoHistoryRef.current = [];
    pendingPlacementUndoRef.current = null;
    nodesRef.current = INITIAL_NODES;
    hoveredNodeIdRef.current = null;
    setNodes(INITIAL_NODES);
    positionsRef.current = INITIAL_POSITIONS;
    setPositions(INITIAL_POSITIONS);
    setConnections(INITIAL_CONNECTIONS);
    connectionsRef.current = INITIAL_CONNECTIONS;
    const fresh = makeRuntime();
    runtimeRef.current = fresh;
    setRuntime(fresh);
    lastSimulationTickRef.current = performance.now();
    connectionDragRef.current = null;
    updateSnappedPort(null);
    setConnecting(null);
    setWirePointer(null);
    setRewiringConnectionId(null);
    setSelectedConnection(null);
    selectedNodesRef.current = [];
    prioritizedBoxSelectionRef.current = [];
    setSelectedNodes([]);
    controlGroupsRef.current = [];
    setControlGroups([]);
    setActiveControlGroupId(null);
    individualControlNodeRef.current = null;
    setIndividualControlNodeId(null);
    setPendingControlGroupNodeIds([]);
    controlGroupTutorialSuppressedRef.current = false;
    setSuppressControlGroupTutorial(false);
    setControlGroupOnboardingOpen(false);
    setControlGroupColorOpen(false);
    setPendingDisbandControlGroupId(null);
    setDisbandControlGroupOpen(false);
    controlGroupSequenceRef.current = 0;
    panRef.current = null;
    suppressedNodeContextMenuRef.current = null;
    setIsPanning(false);
    placingNodeRef.current = null;
    repeatPlacementPreviewRef.current = null;
    continuousReplicationRef.current = false;
    setPlacingNodeId(null);
    updatePlacementBlocked(false);
    dragRef.current = null;
    setDraggingNode(null);
    setDragCollisionBlocked(false);
    inventoryOverflowActionRef.current = null;
    inventoryOverflowWarningSuppressedRef.current = false;
    setInventoryOverflowPrompt(null);
    setInventoryOverflowDialogOpen(false);
    setSuppressFutureInventoryOverflowWarnings(false);
    setAlwaysDeleteConnections(false);
    setSuppressFutureConnectionDeleteWarnings(false);
    setAlwaysApproveNodeDestruction(false);
    setAlwaysApproveAssemblerRecipeChanges(false);
    setPendingAssemblerRecipeChange(null);
    setAssemblerRecipeChangeDialogOpen(false);
    setSuppressFutureAssemblerRecipeWarnings(false);
    setMiningDrillWarningOpen(false);
    setSuppressFutureMiningDrillWarnings(false);
    setSkipMiningDrillCompletionWarning(false);
    setSkipMultiConnectionTooltip(false);
    setSkipShortcutBarGroupTooltip(false);
    setSuppressFutureNodeDestructionWarnings(false);
    setPendingDeletionNodeIds([]);
    setPendingDeletionIsHighlightedGroup(false);
    setPendingDeletionDetails(null);
    setDestroyDialogOpen(false);
    setPendingDeletionConnectionId(null);
    setConnectionDeleteDialogOpen(false);
    setBuildOpen(false);
    setInventoryOpen(false);
    setResearchOpen(false);
    setHoveredResearchProject(null);
    setMapOpen(false);
    setOptionsOpen(false);
    setShortcutsOpen(false);
    setRecipesOpen(false);
    setAchievementsOpen(false);
    unlockedAchievementsRef.current = new Set();
    setUnlockedAchievements(new Set());
    setSaveOpen(false);
    const defaultShortcutBars = makeDefaultShortcutBars();
    shortcutBarsRef.current = defaultShortcutBars;
    shortcutBarGroupsRef.current = [];
    shortcutBarDragRef.current = null;
    setShortcutBars(defaultShortcutBars);
    setShortcutBarGroups([]);
    setShortcutBarSnapTarget(null);
    setRemoveBuildCosts(false);
    setDevOpen(false);
    setSelectedMapSector(null);
    activeMapSectorRef.current = MAP_HOME_SECTOR;
    mapFactoriesGeneratedAtStartRef.current = true;
    appliedAreaExpansionLayoutLevelRef.current = 0;
    mapFactoriesRef.current = generateMapFactoriesAtGameStart(fresh, MIN_ZOOM);
    setActiveMapSector(MAP_HOME_SECTOR);
    setMapNodeDialogSector(null);
    setMapNodeDialogOpen(false);
    setMapNodeDraftName("");
    const initialMapProgress = makeInitialMapNodeProgress();
    mapNodeProgressRef.current = initialMapProgress;
    setMapNodeProgress(initialMapProgress);
    rapidClickTimestampsRef.current = {};
    rapidClickSequenceRef.current = { count: 0, lastAt: 0 };
    rapidFieldClicksRef.current = { timestamps: [], center: null };
    Object.values(rapidClickAnimationTimeoutsRef.current).forEach((timeout) => {
      window.clearTimeout(timeout);
    });
    rapidClickAnimationTimeoutsRef.current = {};
    setRapidClickAnimations({});
    setRapidClickWarningOpen(false);
    buildOpenRef.current = false;
    setShowBuildableOnly(false);
    setShowNeverBuiltOnly(false);
    setCompactBuildView(false);
    setBuildCategory("all");
    setJournalCategory("all");
    setShowAllBuildNodes(false);
    setConfiguringFilterId(null);
    setConfiguringMiningDrillId(null);
    setConfiguringAssemblerId(null);
    setRevealedBuildKinds(new Set(["extractor", "woodenChest"]));
    setBuiltBuildKinds(new Set(["extractor"]));
    setPlacedBuildKinds(new Set());
    setNewBuildKinds(new Set());
    gameElapsedMsRef.current = 0;
    lastTemporarySaveElapsedRef.current = 0;
    temporarySaveIntervalPendingRef.current = true;
    stoneCollectHintActivatedRef.current = false;
    stoneCollectHintDismissedRef.current = false;
    stoneCollectSecondHintPendingRef.current = false;
    stoneCollectSecondHintActiveRef.current = false;
    stoneManualCollectionCountRef.current = 0;
    lastManualResourceCollectionElapsedRef.current = 0;
    forestCollectHintActivatedRef.current = false;
    forestCollectHintDismissedRef.current = false;
    forestCollectSecondHintPendingRef.current = false;
    forestCollectSecondHintActiveRef.current = false;
    forestCollectHintEligibleAtRef.current = 0;
    starterBuildHintStageRef.current = "waiting";
    starterBuildHintEligibleAtRef.current = 0;
    lastPlayerActivityElapsedRef.current = 0;
    starterConnectionHintStageRef.current = "waiting";
    starterConnectionHintEligibleAtRef.current = 0;
    starterTutorialSeenRef.current = makeStarterTutorialSeenState();
    starterTutorialOutroShownRef.current = false;
    starterTutorialOutroEligibleAtRef.current = 0;
    setStoneCollectHintVisible(false);
    setStoneCollectHintEncouraging(false);
    setForestCollectHintVisible(false);
    setForestCollectHintEncouraging(false);
    setStarterBuildHintTarget(null);
    setConnectionTutorialExtractorId(null);
    setStarterTutorialOutroOpen(false);
    setUnlockTimes({ extractor: 0, woodenChest: 0 });
    setBuildAttention(false);
    setJournalAttention(false);
    logisticsUnlockedRef.current = false;
    setLogisticsUnlocked(false);
    buildSequenceRef.current = makeBuildSequence();
    insertionTargetRef.current = null;
    setInsertionTarget(null);
    setProductionRunning(true);
    focusHome();
    toast.success("Foundry reset");
  }, [focusHome, setProductionRunning, updatePlacementBlocked, updateSnappedPort]);

  const createCurrentSave = useCallback((name: string): SaveGameSlot => {
    const viewport = workspaceRef.current;
    const gameElapsedMs = Math.max(0, gameElapsedMsRef.current);
    const savedUnlockTimes = { ...unlockTimes };
    revealedBuildKinds.forEach((kind) => {
      if (savedUnlockTimes[kind] === undefined) savedUnlockTimes[kind] = gameElapsedMs;
    });
    const savedMapFactories = {
      ...mapFactoriesRef.current,
      [activeMapSectorRef.current]: captureActiveMapFactory(),
    };
    return JSON.parse(JSON.stringify({
      name,
      savedAt: new Date().toISOString(),
      data: {
        version: 1,
        nodes: nodesRef.current.map(serializeNode),
        positions: positionsRef.current,
        connections: connectionsRef.current,
        runtime: runtimeRef.current,
        controlGroups: controlGroupsRef.current,
        revealedBuildKinds: [...revealedBuildKinds],
        builtBuildKinds: [...builtBuildKinds],
        placedBuildKinds: [...placedBuildKinds],
        newBuildKinds: [...newBuildKinds],
        unlockTimes: savedUnlockTimes,
        logisticsUnlocked: logisticsUnlockedRef.current,
        selectedMapSector,
        mapNodeProgress,
        activeMapSector: activeMapSectorRef.current,
        mapFactories: savedMapFactories,
        gameElapsedMs,
        zoom: zoomRef.current,
        viewport: {
          scrollLeft: viewport?.scrollLeft ?? HOME_OFFSET.x * zoomRef.current,
          scrollTop: viewport?.scrollTop ?? HOME_OFFSET.y * zoomRef.current,
        },
        buildSequence: buildSequenceRef.current,
        controlGroupSequence: controlGroupSequenceRef.current,
        isRunning: isRunningRef.current,
        buildAttention,
        journalAttention,
        shortcutBars,
        shortcutBarGroups,
        achievements: [...unlockedAchievementsRef.current],
        removeBuildCosts,
        starterStoneCollectHint: {
          activated: stoneCollectHintActivatedRef.current,
          dismissed: stoneCollectHintDismissedRef.current,
          secondPending: stoneCollectSecondHintPendingRef.current,
          secondActive: stoneCollectSecondHintActiveRef.current,
          stoneCollections: stoneManualCollectionCountRef.current,
          lastCollectionElapsedMs: lastManualResourceCollectionElapsedRef.current,
        },
        starterForestCollectHint: {
          activated: forestCollectHintActivatedRef.current,
          dismissed: forestCollectHintDismissedRef.current,
          secondPending: forestCollectSecondHintPendingRef.current,
          secondActive: forestCollectSecondHintActiveRef.current,
          eligibleAtElapsedMs: forestCollectHintEligibleAtRef.current,
        },
        starterBuildHint: {
          stage: starterBuildHintStageRef.current,
          eligibleAtElapsedMs: starterBuildHintEligibleAtRef.current,
          lastActivityElapsedMs: lastPlayerActivityElapsedRef.current,
        },
        starterConnectionHint: {
          stage: starterConnectionHintStageRef.current,
          eligibleAtElapsedMs: starterConnectionHintEligibleAtRef.current,
          extractorId: connectionTutorialExtractorId,
        },
        starterTutorialOutro: {
          shown: starterTutorialOutroShownRef.current,
          eligibleAtElapsedMs: starterTutorialOutroEligibleAtRef.current,
          seen: { ...starterTutorialSeenRef.current },
        },
        promptPreferences: {
          skipConnectionDeleteConfirmation: alwaysDeleteConnections,
          automaticallyDestroyInventoryOverflow:
            inventoryOverflowWarningSuppressedRef.current,
          skipNodeDestructionConfirmation: alwaysApproveNodeDestruction,
          skipHighlightedGroupDeleteConfirmation: alwaysApproveNodeDestruction,
          skipControlGroupTutorial: controlGroupTutorialSuppressedRef.current,
          skipAssemblerRecipeChangeConfirmation: alwaysApproveAssemblerRecipeChanges,
          skipMiningDrillCompletionWarning,
          skipMultiConnectionTooltip,
          skipShortcutBarGroupTooltip,
        },
      },
    })) as SaveGameSlot;
  }, [
    alwaysApproveAssemblerRecipeChanges,
    alwaysApproveNodeDestruction,
    alwaysDeleteConnections,
    builtBuildKinds,
    buildAttention,
    captureActiveMapFactory,
    connectionTutorialExtractorId,
    journalAttention,
    mapNodeProgress,
    newBuildKinds,
    placedBuildKinds,
    removeBuildCosts,
    revealedBuildKinds,
    selectedMapSector,
    shortcutBarGroups,
    shortcutBars,
    skipMiningDrillCompletionWarning,
    skipMultiConnectionTooltip,
    skipShortcutBarGroupTooltip,
    unlockTimes,
  ]);

  const saveGameToSlot = useCallback((slotIndex: number) => {
    try {
      const name = saveNames[slotIndex]?.trim() || `Save ${slotIndex + 1}`;
      const slot = createCurrentSave(name);
      const nextSlots = [...saveSlots];
      nextSlots[slotIndex] = slot;
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(nextSlots));
      setSaveSlots(nextSlots);
      setSaveNames((current) => current.map((value, index) => index === slotIndex ? name : value));
      toast.success(`Saved to Slot ${slotIndex + 1}`, {
        description: `${name} · ${formatSaveDate(slot.savedAt)}`,
      });
    } catch (error) {
      toast.error("Save failed", {
        description: error instanceof Error
          ? error.message
          : "The browser could not write this save to local storage.",
      });
    }
  }, [createCurrentSave, saveNames, saveSlots]);

  const copyTemporarySaveToSlot = useCallback((slotIndex: number) => {
    if (!temporarySave || !isSaveGameSlot(temporarySave)) return;
    try {
      const name = saveNames[slotIndex]?.trim() || `Save ${slotIndex + 1}`;
      const slot = JSON.parse(JSON.stringify({
        ...temporarySave,
        name,
      })) as SaveGameSlot;
      const nextSlots = [...saveSlots];
      nextSlots[slotIndex] = slot;
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(nextSlots));
      setSaveSlots(nextSlots);
      setSaveNames((current) => current.map(
        (value, index) => index === slotIndex ? name : value,
      ));
      toast.success(`Temporary save copied to Slot ${slotIndex + 1}`, {
        description: `${name} · ${formatSaveDate(slot.savedAt)}`,
      });
    } catch (error) {
      toast.error("Copy failed", {
        description: error instanceof Error
          ? error.message
          : "The browser could not write this save to local storage.",
      });
    }
  }, [saveNames, saveSlots, temporarySave]);

  const applyTemporarySaveFrequency = useCallback(() => {
    const frequency = Math.min(
      MAX_TEMPORARY_SAVE_FREQUENCY_MINUTES,
      Math.max(
        MIN_TEMPORARY_SAVE_FREQUENCY_MINUTES,
        Math.round(temporarySaveFrequencyDraft),
      ),
    );
    try {
      window.localStorage.setItem(
        TEMPORARY_SAVE_FREQUENCY_STORAGE_KEY,
        String(frequency),
      );
      setTemporarySaveFrequencyMinutes(frequency);
      setTemporarySaveFrequencyDraft(frequency);
      temporarySaveIntervalPendingRef.current = true;
      setTemporarySaveFrequencyOpen(false);
      toast.success("Temporary save frequency updated", {
        description: describeTemporarySaveFrequency(frequency),
      });
    } catch {
      toast.error("Frequency could not be saved", {
        description: "The browser could not store this temporary save preference.",
      });
    }
  }, [temporarySaveFrequencyDraft]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!isRunningRef.current) return;
      const elapsed = Math.max(0, gameElapsedMsRef.current);
      if (temporarySaveIntervalPendingRef.current) {
        lastTemporarySaveElapsedRef.current = elapsed;
        temporarySaveIntervalPendingRef.current = false;
        return;
      }
      const interval = temporarySaveFrequencyMinutes * 60 * 1000;
      if (elapsed - lastTemporarySaveElapsedRef.current < interval) return;
      try {
        const slot = createCurrentSave(formatTemporarySaveName());
        window.localStorage.setItem(TEMPORARY_SAVE_STORAGE_KEY, JSON.stringify(slot));
        setTemporarySave(slot);
      } catch (error) {
        toast.error("Temporary save failed", {
          description: error instanceof Error
            ? error.message
            : "The browser could not write the temporary save to local storage.",
        });
      } finally {
        lastTemporarySaveElapsedRef.current = elapsed;
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [createCurrentSave, temporarySaveFrequencyMinutes]);

  const loadGameFromSlot = useCallback((slotIndex: number | "temporary") => {
    const slot = slotIndex === "temporary" ? temporarySave : saveSlots[slotIndex];
    if (!slot || !isSaveGameSlot(slot)) {
      toast.error("This save slot cannot be loaded");
      return;
    }

    try {
      const payload = slot.data;
      const nextUnlockedAchievements = new Set(
        (payload.achievements ?? []).filter(isAchievementId),
      );
      if (payload.starterTutorialOutro?.shown === true) {
        nextUnlockedAchievements.add("handHolding");
      }
      const migrateLegacyMapCoordinates = hasLegacyMapCoordinates(payload.mapFactories);
      const nextMapNodeProgress = normalizeMapNodeProgress(
        payload.mapNodeProgress,
        migrateLegacyMapCoordinates,
      );
      const normalizedActiveMapSector = payload.activeMapSector
        ? normalizeStoredMapSectorKey(payload.activeMapSector, migrateLegacyMapCoordinates)
        : null;
      const loadedActiveMapSector = (
        normalizedActiveMapSector &&
        isMapNodeUnlocked(nextMapNodeProgress, normalizedActiveMapSector)
      ) ? normalizedActiveMapSector : MAP_HOME_SECTOR;
      const loadedActiveResourceCapacity = getMapNodeStartingResourceCapacity(loadedActiveMapSector);
      const loadedMapFactories = Object.fromEntries(
        Object.entries(payload.mapFactories ?? {}).map(([sectorKey, factory]) => {
          const normalizedSectorKey = normalizeStoredMapSectorKey(
            sectorKey,
            migrateLegacyMapCoordinates,
          );
          if (!(
            normalizedSectorKey &&
            factory &&
            Array.isArray(factory.nodes) &&
            Array.isArray(factory.connections) &&
            factory.runtime
          )) return null;
          const startingResourceCapacity = getMapNodeStartingResourceCapacity(normalizedSectorKey);
          return [normalizedSectorKey, {
            ...factory,
            runtime: {
              ...factory.runtime,
              ironOre: normalizeBaseResourceState(factory.runtime.ironOre, startingResourceCapacity),
              copperOre: normalizeBaseResourceState(factory.runtime.copperOre, startingResourceCapacity),
              stone: normalizeBaseResourceState(factory.runtime.stone, startingResourceCapacity),
              forest: {
                ...normalizeBaseResourceState(factory.runtime.forest, startingResourceCapacity),
                regenerationElapsed: Math.max(
                  0,
                  Number(factory.runtime.forest?.regenerationElapsed) || 0,
                ),
              },
              blackHoles: normalizeBlackHoles(factory.runtime.blackHoles),
              lakes: normalizeLakes(factory.runtime.lakes),
              inventoryCapacity: BASE_INVENTORY_CAPACITY,
              inventory: normalizeItemStore(
                factory.runtime.inventory,
                BASE_INVENTORY_CAPACITY,
              ),
              produced: normalizeItemStore(factory.runtime.produced),
              extractorProduced: normalizeItemStore(factory.runtime.extractorProduced),
              roads: Object.fromEntries(
                Object.entries(factory.runtime.roads ?? {}).map(([id, road]) => [
                  id,
                  makeRoadRuntimeState(road, id),
                ]),
              ),
            },
            lastSimulatedAt: Number(factory.lastSimulatedAt) || Date.now(),
            producedBaseline: normalizeItemStore(factory.producedBaseline),
            extractorProducedBaseline: normalizeItemStore(factory.extractorProducedBaseline),
          }] as const;
        }).filter((entry): entry is readonly [string, MapFactoryState] => entry !== null),
      ) as MapFactoriesBySector;
      const normalizedSelectedMapSector = payload.selectedMapSector
        ? normalizeStoredMapSectorKey(payload.selectedMapSector, migrateLegacyMapCoordinates)
        : null;
      const nextNodes = payload.nodes
        .filter((node): node is SerializedNode => isNodeKind(node.kind))
        .map(hydrateNode);
      const nextBlackHoles = normalizeBlackHoles(payload.runtime.blackHoles);
      const nextLakes = normalizeLakes(payload.runtime.lakes);
      const validNodeIds = new Set([
        ...nextNodes.map((node) => node.id),
        ...Object.keys(nextBlackHoles),
        ...Object.keys(nextLakes),
      ]);
      const nodeKindsById = new Map(nextNodes.map((node) => [node.id, node.kind]));
      const nextConnections = payload.connections.filter(
        (connection) =>
          validNodeIds.has(connection.sourceNode) &&
          validNodeIds.has(connection.targetNode) &&
          !(
            connection.targetPort === "power-in" &&
            (
              isProcessorKind(nodeKindsById.get(connection.targetNode) ?? "forest") ||
              nodeKindsById.get(connection.targetNode) === "miningDrill"
            )
          ),
      );
      const nextControlGroups = (payload.controlGroups ?? [])
        .map((group) => ({
          ...group,
          nodeIds: group.nodeIds.filter((nodeId) => validNodeIds.has(nodeId)),
        }))
        .filter((group) => group.nodeIds.length > 0);
      const loadedBaseInventory = normalizeItemStore(
        payload.runtime.inventory,
        BASE_INVENTORY_CAPACITY,
      );
      const nextPositions = Object.fromEntries(
        Object.entries(payload.positions).filter(([nodeId]) => validNodeIds.has(nodeId)),
      );
      const nextWoodenChests = Object.fromEntries(
        Object.entries(payload.runtime.woodenChests ?? {}).map(([id, chest]) => [
          id,
          {
            ...chest,
            stored: Math.min(
              WOODEN_CHEST_CAPACITY,
              Math.max(0, Math.floor(Number(chest.stored) || 0)),
            ),
          },
        ]),
      ) as Runtime["woodenChests"];
      const nextStorages = Object.fromEntries(
        Object.entries(payload.runtime.storages ?? {}).map(([id, storage]) => {
          const capacityPerItem = Math.max(
            STORAGE_NODE_CAPACITY,
            Math.floor(Number(storage.capacityPerItem) || STORAGE_NODE_CAPACITY),
          );
          return [id, {
            capacityPerItem,
            items: normalizeItemStore(storage.items, capacityPerItem),
          }];
        }),
      ) as Runtime["storages"];
      nextNodes
        .filter((node) => node.kind === "storage")
        .forEach((node) => {
          if (nextStorages[node.id]) return;
          nextStorages[node.id] = {
            capacityPerItem: STORAGE_NODE_CAPACITY,
            items: makeEmptyItemStore(),
          };
        });

      const nextRuntime: Runtime = {
        ...makeRuntime(),
        ...payload.runtime,
        ironOre: normalizeBaseResourceState(payload.runtime.ironOre, loadedActiveResourceCapacity),
        copperOre: normalizeBaseResourceState(payload.runtime.copperOre, loadedActiveResourceCapacity),
        stone: normalizeBaseResourceState(payload.runtime.stone, loadedActiveResourceCapacity),
        blackHoles: nextBlackHoles,
        lakes: nextLakes,
        mapPoints: Math.max(
          0,
          Math.floor(Number(
            payload.runtime.mapPoints ?? (payload.runtime.research?.explorationUnlocked ? 1 : 0),
          ) || 0),
        ),
        forest: {
          ...normalizeBaseResourceState(payload.runtime.forest, loadedActiveResourceCapacity),
          regenerationElapsed: Math.max(
            0,
            Number(payload.runtime.forest?.regenerationElapsed) || 0,
          ),
        },
        produced: {
          ...makeEmptyItemStore(),
          ...(payload.runtime.produced ?? {}),
        },
        extractorProduced: {
          ...makeEmptyItemStore(),
          ...(payload.runtime.extractorProduced ?? {}),
        },
        research: {
          ...makeResearchState(),
          ...(payload.runtime.research ?? {}),
          areaExpansionLevel: getAreaExpansionLevel(payload.runtime.research ?? {}),
          mapNodeResearchCompletions: Math.max(
            0,
            Math.floor(Number(payload.runtime.research?.mapNodeResearchCompletions) || 0),
          ),
          progress: {
            ...makeResearchState().progress,
            ...(payload.runtime.research?.progress ?? {}),
          },
        },
        joints: Object.fromEntries(
          Object.entries(payload.runtime.joints ?? {})
            .filter(([id]) => validNodeIds.has(id))
            .map(([id, joint]) => [id, {
              bufferedType: joint.bufferedType ?? null,
              orientation: joint.orientation === "vertical" ? "vertical" as const : "horizontal" as const,
            }]),
        ),
        processors: Object.fromEntries(
          Object.entries(payload.runtime.processors ?? {})
            .filter(([id]) => validNodeIds.has(id))
            .map(([id, processor]) => [id, {
              ...processor,
              assemblerRecipe: isAssemblerRecipeId(processor.assemblerRecipe)
                ? processor.assemblerRecipe
                : null,
              refinerRecipe: isRefinerRecipeId(processor.refinerRecipe)
                ? processor.refinerRecipe
                : null,
              inputs: Object.fromEntries(
                Object.entries(processor.inputs ?? {}).map(([portId, amount]) => [
                  portId,
                  Math.min(
                    PRODUCTION_INGREDIENT_CAPACITY,
                    Math.max(0, Math.floor(Number(amount) || 0)),
                  ),
                ]),
              ),
            }]),
        ),
        miningDrills: Object.fromEntries(
          Object.entries(payload.runtime.miningDrills ?? {})
            .filter(([id]) => validNodeIds.has(id))
            .map(([id, drill]) => [id, {
              progress: 0,
              iterations: Math.min(
                MINING_DRILL_ITERATIONS,
                Math.max(0, Math.floor(Number(drill.iterations) || 0)),
              ),
              selectedType: getMiningTarget(drill.selectedType)?.type ?? null,
            }]),
        ),
        generators: Object.fromEntries(
          Object.entries(payload.runtime.generators ?? {}).map(([id, generator]) => [id, {
            ...generator,
            charcoal: Math.min(
              PRODUCTION_INGREDIENT_CAPACITY,
              Math.max(0, Math.floor(Number(generator.charcoal) || 0)),
            ),
          }]),
        ),
        researchFoundries: Object.fromEntries(
          Object.entries(payload.runtime.researchFoundries ?? {}).map(([id, foundry]) => [id, {
            ...foundry,
            cores: getResearchFoundryCores(foundry),
            coreItems: getResearchFoundryCoreItems(foundry),
            coreLoaded: undefined,
          }]),
        ),
        splitters: Object.fromEntries(
          Object.entries(payload.runtime.splitters ?? {}).map(([id, splitter]) => [
            id,
            { nextOutput: splitter.nextOutput === "b" ? "b" as const : "a" as const },
          ]),
        ),
        roads: Object.fromEntries(
          Object.entries(payload.runtime.roads ?? {})
            .filter(([id]) => validNodeIds.has(id))
            .map(([id, road]) => [id, makeRoadRuntimeState(road, id)]),
        ),
        woodenChests: nextWoodenChests,
        storages: nextStorages,
        inventoryCapacity: BASE_INVENTORY_CAPACITY,
        inventory: loadedBaseInventory,
        construction: Object.fromEntries(
          Object.entries(payload.runtime.construction ?? {})
            .filter(([id]) => validNodeIds.has(id)),
        ),
        pausedOutputs: Object.fromEntries(
          Object.entries(payload.runtime.pausedOutputs ?? {})
            .filter(([id]) => validNodeIds.has(id)),
        ),
      };
      delete (nextRuntime as Runtime & { mergers?: unknown }).mergers;
      const validBuildKinds = new Set(BUILD_CATALOG.map((item) => item.kind));
      const filterBuildKinds = (kinds: PurchasableKind[]) =>
        kinds.filter((kind) => validBuildKinds.has(kind));
      const nextRevealed = new Set(filterBuildKinds(payload.revealedBuildKinds ?? []));
      const loadedLogisticsUnlocked = Boolean(
        payload.logisticsUnlocked || nextRuntime.research.logisticsUnlocked,
      );
      if (loadedLogisticsUnlocked) {
        nextRuntime.research.logisticsUnlocked = true;
        nextRuntime.research.progress.logistics = getResearchProjectCost("logistics");
        LOGISTICS_BUILD_KINDS.forEach((kind) => nextRevealed.add(kind));
      }
      const nextBuilt = new Set(filterBuildKinds(payload.builtBuildKinds ?? []));
      const initialNodeIds = new Set(INITIAL_NODES.map((node) => node.id));
      const inferredPlacedKinds = nextNodes.flatMap((node) =>
        isPurchasableKind(node.kind) && !initialNodeIds.has(node.id)
          ? [node.kind]
          : [],
      );
      const nextPlaced = new Set(filterBuildKinds(
        payload.placedBuildKinds ?? inferredPlacedKinds,
      ));
      const nextNew = new Set(filterBuildKinds(payload.newBuildKinds ?? []));
      const savedUnlockTimes = payload.unlockTimes ?? {};
      const latestSavedUnlockTime = Math.max(
        0,
        ...Object.values(savedUnlockTimes).filter(
          (value): value is number => typeof value === "number" && Number.isFinite(value),
        ),
      );
      const loadedGameElapsedMs = Math.max(
        0,
        Number.isFinite(payload.gameElapsedMs) ? payload.gameElapsedMs : latestSavedUnlockTime,
        latestSavedUnlockTime,
      );
      const savedStoneCollectHint = payload.starterStoneCollectHint;
      const hasCollectedStartingResource = Array.from(STARTING_INVENTORY_ITEM_TYPES).some(
        (type) => (nextRuntime.produced[type] ?? 0) > 0,
      );
      const loadedStoneManualCollections = Math.min(
        2,
        Math.max(
          0,
          Math.floor(
            Number(
              savedStoneCollectHint?.stoneCollections ??
              nextRuntime.produced[ResourceType.STONE] ??
              0,
            ) || 0,
          ),
        ),
      );
      const loadedStoneCollectSecondActive =
        loadedStoneManualCollections === 1 && savedStoneCollectHint?.secondActive === true;
      const loadedStoneCollectSecondPending =
        loadedStoneManualCollections === 1 &&
        !loadedStoneCollectSecondActive &&
        (
          savedStoneCollectHint?.secondPending === true ||
          savedStoneCollectHint?.stoneCollections === undefined
        );
      const loadedStoneCollectHintDismissed =
        loadedStoneManualCollections >= 2 ||
        (
          loadedStoneManualCollections === 0 &&
          (
            savedStoneCollectHint?.dismissed === true ||
            (savedStoneCollectHint?.activated !== true && hasCollectedStartingResource)
          )
        );
      const loadedStoneCollectHintActivated =
        loadedStoneManualCollections === 0 &&
        !loadedStoneCollectHintDismissed &&
        savedStoneCollectHint?.activated === true;
      const loadedLastManualResourceCollectionElapsed = Math.max(
        0,
        Math.min(
          loadedGameElapsedMs,
          Number(savedStoneCollectHint?.lastCollectionElapsedMs) || loadedGameElapsedMs,
        ),
      );
      const loadedMaterialAvailability = getBuildMaterialAvailability(
        nextRuntime,
        nextNodes,
        nextConnections,
      );
      const loadedStoneAvailable = loadedMaterialAvailability[ResourceType.STONE].total;
      const loadedWoodAvailable = loadedMaterialAvailability[ResourceType.WOOD].total;
      const savedForestCollectHint = payload.starterForestCollectHint;
      const loadedForestCollectHintDismissed =
        savedForestCollectHint?.dismissed === true || loadedWoodAvailable >= 2;
      const loadedForestCollectSecondActive =
        !loadedForestCollectHintDismissed &&
        loadedWoodAvailable === 1 &&
        savedForestCollectHint?.secondActive === true;
      const loadedForestCollectSecondPending =
        !loadedForestCollectHintDismissed &&
        !loadedForestCollectSecondActive &&
        loadedWoodAvailable === 1 &&
        savedForestCollectHint?.secondPending === true;
      const loadedForestCollectHintActivated =
        !loadedForestCollectHintDismissed &&
        !loadedForestCollectSecondActive &&
        savedForestCollectHint?.activated === true;
      const loadedForestCollectHintEligibleAt =
        loadedForestCollectHintDismissed || loadedStoneAvailable < 2
          ? 0
          : Math.max(
              0,
              Math.min(
                loadedGameElapsedMs,
                Number(savedForestCollectHint?.eligibleAtElapsedMs) || loadedGameElapsedMs,
              ),
            );
      const savedStarterBuildHintStage = payload.starterBuildHint?.stage;
      const loadedStarterBuildHintStage: StarterBuildHintStage = nextPlaced.has("extractor")
        ? "complete"
        : savedStarterBuildHintStage === "complete"
          ? "complete"
          : savedStarterBuildHintStage === "menu" || savedStarterBuildHintStage === "extractor"
            ? "menu"
            : "waiting";
      const loadedStarterBuildHintEligibleAt = loadedStarterBuildHintStage === "waiting"
        ? Math.max(
            0,
            Math.min(
              loadedGameElapsedMs,
              Number(payload.starterBuildHint?.eligibleAtElapsedMs) || loadedGameElapsedMs,
            ),
          )
        : 0;
      const loadedLastPlayerActivityElapsed = Math.max(
        0,
        Math.min(
          loadedGameElapsedMs,
          Number(payload.starterBuildHint?.lastActivityElapsedMs) || loadedGameElapsedMs,
        ),
      );
      const loadedTutorialExtractor = nextNodes.find((node) => node.kind === "extractor");
      const loadedTutorialExtractorConnected = Boolean(
        loadedTutorialExtractor && nextConnections.some(
          (connection) => {
            const sourceNode = nextNodes.find((node) => node.id === connection.sourceNode);
            return connection.targetNode === loadedTutorialExtractor.id &&
              connection.targetPort === "resource-in" &&
              Boolean(sourceNode && isResourceNodeKind(sourceNode.kind));
          },
        ),
      );
      const loadedStarterConnectionHintStage: StarterConnectionHintStage =
        loadedTutorialExtractorConnected || payload.starterConnectionHint?.stage === "complete"
          ? "complete"
          : loadedTutorialExtractor && payload.starterConnectionHint?.stage === "active"
            ? "active"
            : "waiting";
      const loadedStarterConnectionHintEligibleAt =
        loadedStarterConnectionHintStage === "waiting" && loadedTutorialExtractor
          ? Math.max(
              0,
              Math.min(
                loadedGameElapsedMs,
                Number(payload.starterConnectionHint?.eligibleAtElapsedMs) || loadedGameElapsedMs,
              ),
            )
          : 0;
      const savedStarterTutorialSeen = payload.starterTutorialOutro?.seen;
      const loadedStarterTutorialSeen: StarterTutorialSeenState = savedStarterTutorialSeen
        ? {
            stoneFirst: savedStarterTutorialSeen.stoneFirst === true,
            stoneSecond: savedStarterTutorialSeen.stoneSecond === true,
            forestFirst: savedStarterTutorialSeen.forestFirst === true,
            forestSecond: savedStarterTutorialSeen.forestSecond === true,
            extractorBuilding: savedStarterTutorialSeen.extractorBuilding === true,
            connectionMaking: savedStarterTutorialSeen.connectionMaking === true,
          }
        : {
            stoneFirst:
              loadedStoneManualCollections >= 1 || savedStoneCollectHint?.activated === true,
            stoneSecond: loadedStoneManualCollections >= 2,
            forestFirst:
              loadedWoodAvailable >= 1 || savedForestCollectHint?.activated === true,
            forestSecond: loadedWoodAvailable >= 2,
            extractorBuilding: loadedStarterBuildHintStage !== "waiting",
            connectionMaking: loadedStarterConnectionHintStage !== "waiting",
          };
      const loadedStarterTutorialOutroShown =
        payload.starterTutorialOutro?.shown === true;
      const loadedStarterTutorialOutroEligibleAt =
        !loadedStarterTutorialOutroShown &&
        loadedStarterConnectionHintStage === "complete" &&
        hasSeenEveryStarterTutorial(loadedStarterTutorialSeen)
          ? Math.max(
              0,
              Math.min(
                loadedGameElapsedMs,
                Number(payload.starterTutorialOutro?.eligibleAtElapsedMs) || loadedGameElapsedMs,
              ),
            )
          : 0;
      const nextUnlockTimes: UnlockTimes = {};
      filterBuildKinds(Object.keys(savedUnlockTimes) as PurchasableKind[]).forEach((kind) => {
        const unlockedAt = savedUnlockTimes[kind];
        if (typeof unlockedAt !== "number" || !Number.isFinite(unlockedAt)) return;
        nextUnlockTimes[kind] = Math.max(0, unlockedAt);
        if (unlockedAt <= loadedGameElapsedMs) nextRevealed.add(kind);
      });
      nextRevealed.forEach((kind) => {
        if (nextUnlockTimes[kind] === undefined) nextUnlockTimes[kind] = loadedGameElapsedMs;
      });
      const nextZoom = clampZoom(payload.zoom ?? 1);
      const nextPromptPreferences = normalizePromptPreferences(payload.promptPreferences);
      const nextShortcutBars = normalizeShortcutBars(payload.shortcutBars);
      const nextShortcutBarGroups = normalizeShortcutBarGroups(
        payload.shortcutBarGroups,
        nextShortcutBars,
      );

      nodesRef.current = nextNodes;
      hoveredNodeIdRef.current = null;
      undoHistoryRef.current = [];
      pendingPlacementUndoRef.current = null;
      setNodes(nextNodes);
      positionsRef.current = nextPositions;
      setPositions(nextPositions);
      connectionsRef.current = nextConnections;
      setConnections(nextConnections);
      appliedAreaExpansionLayoutLevelRef.current = getAreaExpansionLevel(nextRuntime.research);
      runtimeRef.current = nextRuntime;
      setRuntime(nextRuntime);
      controlGroupsRef.current = nextControlGroups;
      setControlGroups(nextControlGroups);
      setRevealedBuildKinds(nextRevealed);
      setBuiltBuildKinds(nextBuilt);
      setPlacedBuildKinds(nextPlaced);
      setNewBuildKinds(nextNew);
      setUnlockTimes(nextUnlockTimes);
      setBuildAttention(payload.buildAttention ?? false);
      setJournalAttention(payload.journalAttention ?? false);
      shortcutBarsRef.current = nextShortcutBars;
      shortcutBarGroupsRef.current = nextShortcutBarGroups;
      shortcutBarDragRef.current = null;
      setShortcutBars(nextShortcutBars);
      setShortcutBarGroups(nextShortcutBarGroups);
      setShortcutBarSnapTarget(null);
      unlockedAchievementsRef.current = nextUnlockedAchievements;
      setUnlockedAchievements(nextUnlockedAchievements);
      setRemoveBuildCosts(payload.removeBuildCosts === true);
      setAlwaysDeleteConnections(
        nextPromptPreferences.skipConnectionDeleteConfirmation,
      );
      setSuppressFutureConnectionDeleteWarnings(false);
      inventoryOverflowWarningSuppressedRef.current =
        nextPromptPreferences.automaticallyDestroyInventoryOverflow;
      setAlwaysApproveNodeDestruction(
        nextPromptPreferences.skipNodeDestructionConfirmation,
      );
      setAlwaysApproveAssemblerRecipeChanges(
        nextPromptPreferences.skipAssemblerRecipeChangeConfirmation,
      );
      setSkipMiningDrillCompletionWarning(
        nextPromptPreferences.skipMiningDrillCompletionWarning,
      );
      setSkipMultiConnectionTooltip(
        nextPromptPreferences.skipMultiConnectionTooltip,
      );
      setSkipShortcutBarGroupTooltip(
        nextPromptPreferences.skipShortcutBarGroupTooltip,
      );
      controlGroupTutorialSuppressedRef.current =
        nextPromptPreferences.skipControlGroupTutorial;
      setPendingAssemblerRecipeChange(null);
      setAssemblerRecipeChangeDialogOpen(false);
      setSuppressFutureAssemblerRecipeWarnings(false);
      setMiningDrillWarningOpen(false);
      setSuppressFutureMiningDrillWarnings(false);
      setSuppressControlGroupTutorial(false);
      setSuppressFutureNodeDestructionWarnings(false);
      setSuppressFutureInventoryOverflowWarnings(false);
      logisticsUnlockedRef.current = loadedLogisticsUnlocked;
      setLogisticsUnlocked(loadedLogisticsUnlocked);
      setSelectedMapSector(
        normalizedSelectedMapSector &&
          canUnlockMapNode(nextMapNodeProgress, normalizedSelectedMapSector)
          ? normalizedSelectedMapSector
          : null,
      );
      activeMapSectorRef.current = loadedActiveMapSector;
      mapFactoriesGeneratedAtStartRef.current = true;
      mapFactoriesRef.current = {
        ...mapFactoriesRef.current,
        ...loadedMapFactories,
      };
      setActiveMapSector(loadedActiveMapSector);
      setMapNodeDialogSector(null);
      setMapNodeDialogOpen(false);
      setMapNodeDraftName("");
      mapNodeProgressRef.current = nextMapNodeProgress;
      setMapNodeProgress(nextMapNodeProgress);
      buildSequenceRef.current = {
        ...makeBuildSequence(),
        ...(payload.buildSequence ?? {}),
      };
      controlGroupSequenceRef.current = payload.controlGroupSequence ?? 0;
      gameElapsedMsRef.current = loadedGameElapsedMs;
      lastTemporarySaveElapsedRef.current = loadedGameElapsedMs;
      temporarySaveIntervalPendingRef.current = true;
      stoneCollectHintActivatedRef.current = loadedStoneCollectHintActivated;
      stoneCollectHintDismissedRef.current = loadedStoneCollectHintDismissed;
      stoneCollectSecondHintPendingRef.current = loadedStoneCollectSecondPending;
      stoneCollectSecondHintActiveRef.current = loadedStoneCollectSecondActive;
      stoneManualCollectionCountRef.current = loadedStoneManualCollections;
      lastManualResourceCollectionElapsedRef.current = loadedLastManualResourceCollectionElapsed;
      setStoneCollectHintEncouraging(loadedStoneCollectSecondActive);
      setStoneCollectHintVisible(
        loadedStoneCollectHintActivated || loadedStoneCollectSecondActive,
      );
      forestCollectHintActivatedRef.current = loadedForestCollectHintActivated;
      forestCollectHintDismissedRef.current = loadedForestCollectHintDismissed;
      forestCollectSecondHintPendingRef.current = loadedForestCollectSecondPending;
      forestCollectSecondHintActiveRef.current = loadedForestCollectSecondActive;
      forestCollectHintEligibleAtRef.current = loadedForestCollectHintEligibleAt;
      setForestCollectHintEncouraging(loadedForestCollectSecondActive);
      setForestCollectHintVisible(
        loadedForestCollectHintActivated || loadedForestCollectSecondActive,
      );
      starterBuildHintStageRef.current = loadedStarterBuildHintStage;
      starterBuildHintEligibleAtRef.current = loadedStarterBuildHintEligibleAt;
      lastPlayerActivityElapsedRef.current = loadedLastPlayerActivityElapsed;
      setStarterBuildHintTarget(
        loadedStarterBuildHintStage === "menu" ? "menu" : null,
      );
      starterConnectionHintStageRef.current = loadedStarterConnectionHintStage;
      starterConnectionHintEligibleAtRef.current = loadedStarterConnectionHintEligibleAt;
      setConnectionTutorialExtractorId(
        loadedStarterConnectionHintStage === "active" && loadedTutorialExtractor
          ? loadedTutorialExtractor.id
          : null,
      );
      starterTutorialSeenRef.current = loadedStarterTutorialSeen;
      starterTutorialOutroShownRef.current = loadedStarterTutorialOutroShown;
      starterTutorialOutroEligibleAtRef.current = loadedStarterTutorialOutroEligibleAt;
      setStarterTutorialOutroOpen(false);
      zoomRef.current = nextZoom;
      pinchTargetZoomRef.current = nextZoom;
      setZoom(nextZoom);
      setProductionRunning(payload.isRunning ?? true);
      lastSimulationTickRef.current = performance.now();

      connectionDragRef.current = null;
      updateSnappedPort(null);
      setConnecting(null);
      setHoveredPort(null);
      setWirePointer(null);
      setRewiringConnectionId(null);
      setSelectedConnection(null);
      selectedNodesRef.current = [];
      prioritizedBoxSelectionRef.current = [];
      setSelectedNodes([]);
      setActiveFlows({});
      setActiveControlGroupId(null);
      individualControlNodeRef.current = null;
      setIndividualControlNodeId(null);
      setPendingControlGroupNodeIds([]);
      setControlGroupOnboardingOpen(false);
      setControlGroupColorOpen(false);
      setPendingDisbandControlGroupId(null);
      setDisbandControlGroupOpen(false);
      selectionBoxRef.current = null;
      setSelectionBox(null);
      dragRef.current = null;
      setDraggingNode(null);
      setDragCollisionBlocked(false);
      inventoryOverflowActionRef.current = null;
      setInventoryOverflowPrompt(null);
      setInventoryOverflowDialogOpen(false);
      setPendingDeletionNodeIds([]);
      setPendingDeletionIsHighlightedGroup(false);
      setPendingDeletionDetails(null);
      setDestroyDialogOpen(false);
      setPendingDeletionConnectionId(null);
      setConnectionDeleteDialogOpen(false);
      placingNodeRef.current = null;
      repeatPlacementPreviewRef.current = null;
      continuousReplicationRef.current = false;
      setPlacingNodeId(null);
      updatePlacementBlocked(false);
      insertionTargetRef.current = null;
      setInsertionTarget(null);
      panRef.current = null;
      suppressedNodeContextMenuRef.current = null;
      setIsPanning(false);
      setConfiguringFilterId(null);
      setConfiguringMiningDrillId(null);
      setConfiguringAssemblerId(null);
      setBuildOpen(false);
      buildOpenRef.current = false;
      setInventoryOpen(false);
      setResearchOpen(false);
      setHoveredResearchProject(null);
      setMapOpen(false);
      setJournalOpen(false);
      setOptionsOpen(false);
      setShortcutsOpen(false);
      setRecipesOpen(false);
      setAchievementsOpen(false);
      setSaveOpen(false);
      setDevOpen(false);
      setLoadConfirmOpen(false);
      setPendingLoadSlot(null);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const viewport = workspaceRef.current;
          if (viewport) {
            viewport.scrollLeft = Math.max(0, payload.viewport?.scrollLeft ?? HOME_OFFSET.x * nextZoom);
            viewport.scrollTop = Math.max(0, payload.viewport?.scrollTop ?? HOME_OFFSET.y * nextZoom);
          }
          updateGridPosition();
          measureAnchors();
        });
      });
      toast.success(`Loaded ${slot.name}`, {
        description: `${slotIndex === "temporary" ? "Temporary save" : `Slot ${slotIndex + 1}`} · saved ${formatSaveDate(slot.savedAt)}`,
      });
    } catch {
      toast.error("Load failed", {
        description: "This save is incomplete or incompatible with the current game version.",
      });
    }
  }, [measureAnchors, saveSlots, setProductionRunning, temporarySave, updateGridPosition, updatePlacementBlocked, updateSnappedPort]);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContextApi }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: ModelTool) =>
      Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => undefined);

    void Promise.all([
      register({
        name: "read_foundry_status",
        title: "Read foundry status",
        description: "Read the visible production state, cable count, and node-held materials without changing the foundry.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: () => ({
          running: isRunningRef.current,
          cables: connectionsRef.current.length,
          logisticsUnlocked: logisticsUnlockedRef.current,
          ironOre: { ...runtimeRef.current.ironOre },
          copperOre: { ...(runtimeRef.current.copperOre ?? makeRuntime().copperOre) },
          stone: { ...(runtimeRef.current.stone ?? makeRuntime().stone) },
          forest: { ...(runtimeRef.current.forest ?? makeRuntime().forest) },
          minedDeposits: { ...(runtimeRef.current.minedDeposits ?? {}) },
          ironExtractor: {
            ...runtimeRef.current.extractors.ironExtractor,
            product: getExtractorRecipe("ironExtractor", connectionsRef.current)?.product ?? null,
          },
          machines: nodesRef.current
            .filter((node) => isPurchasableKind(node.kind))
            .map((node) => ({
              id: node.id,
              title: node.title,
              state: node.kind === "extractor"
                ? runtimeRef.current.extractors[node.id]
                : node.kind === "generator"
                  ? runtimeRef.current.generators[node.id]
                : node.kind === "powerSplitter"
                  ? {
                      powered: Boolean(findPowerGeneratorId(
                        node.id,
                        connectionsRef.current,
                        runtimeRef.current.generators,
                        runtimeRef.current.pausedOutputs,
                      )),
                    }
                : node.kind === "researchFoundry"
                  ? runtimeRef.current.researchFoundries[node.id]
                : node.kind === "treePlanter"
                  ? runtimeRef.current.treePlanters[node.id]
                : node.kind === "miningDrill"
                  ? runtimeRef.current.miningDrills[node.id]
                : node.kind === "splitter"
                    ? runtimeRef.current.splitters[node.id]
                : node.kind === "merger"
                      ? { routing: "direct" }
                    : node.kind === "joint"
                      ? runtimeRef.current.joints[node.id]
                    : node.kind === "inventorySource"
                      ? runtimeRef.current.inventorySources[node.id]
                    : node.kind === "filter"
                      ? runtimeRef.current.filters[node.id]
                    : node.kind === "woodenChest"
                      ? runtimeRef.current.woodenChests[node.id]
                    : node.kind === "storage"
                      ? runtimeRef.current.storages[node.id]
                      : runtimeRef.current.processors[node.id],
              construction: runtimeRef.current.construction[node.id] ?? { progress: 100, complete: true },
            })),
          research: { ...runtimeRef.current.research },
          storedItems: Object.fromEntries(
            INVENTORY_ITEMS.map(({ type }) => [
              type,
              getStoredItemAmount(
                runtimeRef.current,
                nodesRef.current,
                connectionsRef.current,
                type,
              ),
            ]),
          ),
          storageBreakdown: Object.fromEntries(
            INVENTORY_ITEMS.map(({ type }) => [
              type,
              getStoredItemLocations(
                runtimeRef.current,
                nodesRef.current,
                connectionsRef.current,
                type,
              ),
            ]),
          ),
          produced: { ...runtimeRef.current.produced },
        }),
      }),
      register({
        name: "set_production_state",
        title: "Set production state",
        description: "Pause or resume the production simulation.",
        inputSchema: {
          type: "object",
          properties: { running: { type: "boolean" } },
          required: ["running"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input) => {
          const running = (input as { running?: unknown })?.running;
          if (typeof running !== "boolean") throw new Error("running must be a boolean");
          setProductionRunning(running);
          return { running };
        },
      }),
      register({
        name: "connect_foundry_ports",
        title: "Connect foundry ports",
        description: "Connect one output socket to one compatible input socket in the visible node graph.",
        inputSchema: {
          type: "object",
          properties: {
            sourceNode: { type: "string", description: "ID of any node with an output socket" },
            sourcePort: { type: "string", enum: ["ore-out", "copper-ore-out", "mythril-ore-out", "stone-out", "forest-out", "lake-water-out-north", "lake-water-out", "lake-water-out-south", "lake-water-out-west", "product-out", "charcoal-out", "plate-out", "gear-out", "wire-out", "automata-core-out", "assembler-out", "refiner-out", "power-out", "power-split-top", "power-split-out", "power-split-bottom", "forest-growth-out", "split-a-out", "split-b-out", "merge-out", "joint-out", "road-out", "inventory-out", "filter-out", "chest-out"] },
            targetNode: { type: "string", description: "ID of any node with an input socket" },
            targetPort: { type: "string", enum: ["resource-in", "wood-in", "metal-in", "charcoal-in", "generator-charcoal-in", "research-core-in", "motor-in", "power-in", "power-split-in", "forest-growth-in", "plate-a-in", "plate-b-in", "wire-plate-in", "core-circuit-in", "core-plate-in", "assembler-a-in", "assembler-b-in", "refiner-in", "split-in", "merge-a-in", "merge-b-in", "joint-in", "road-in", "filter-in", "storage-in", "chest-in"] },
          },
          required: ["sourceNode", "sourcePort", "targetNode", "targetPort"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: (input) => {
          const value = input as Partial<Record<"sourceNode" | "sourcePort" | "targetNode" | "targetPort", string>>;
          const sourceNode = value.sourceNode as NodeId;
          const targetNode = value.targetNode as NodeId;
          const sourceNodeSpec = nodesRef.current.find((node) => node.id === sourceNode);
          const targetNodeSpec = nodesRef.current.find((node) => node.id === targetNode);
          const sourceSpec = sourceNodeSpec?.outputs.find((port) => port.id === value.sourcePort) ?? (
            runtimeRef.current.lakes[sourceNode] && value.sourcePort
              ? getLakeWaterOutputPort(value.sourcePort)
              : null
          );
          const source = sourceSpec
            ? getRuntimeAwarePort(sourceNode, sourceSpec, connectionsRef.current, runtimeRef.current)
            : null;
          const targetSpec = targetNodeSpec?.inputs.find((port) => port.id === value.targetPort);
          const target = targetSpec
            ? getRuntimeAwarePort(targetNode, targetSpec, connectionsRef.current, runtimeRef.current)
            : null;
          if (!source || !target) throw new Error("Unknown source or target socket");
          if (!isCompatible(source, target)) throw new Error(`${source.type} cannot connect to ${target.type}`);
          connectPorts({ nodeId: sourceNode, port: source }, { nodeId: targetNode, port: target });
          return { connected: true, from: `${sourceNode}:${source.id}`, to: `${targetNode}:${target.id}` };
        },
      }),
      register({
        name: "reset_foundry",
        title: "Reset foundry",
        description: "Restore the default cables, node positions, production timers, and node storage.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: () => {
          resetFactory();
          return { reset: true, cables: INITIAL_CONNECTIONS.length };
        },
      }),
    ]);

    return () => lifecycle.abort();
  }, [connectPorts, resetFactory, setProductionRunning]);

  const renderedConnections = useMemo(
    () =>
      connections
        .filter((connection) => connection.id !== rewiringConnectionId)
        .map((connection) => ({
          ...connection,
          start: anchors[`${connection.sourceNode}:${connection.sourcePort}`],
          end: anchors[`${connection.targetNode}:${connection.targetPort}`],
        }))
        .filter((connection) => connection.start && connection.end),
    [anchors, connections, rewiringConnectionId],
  );
  const insertionPreview = useMemo(() => {
    const insertingNodeId = placingNodeId ?? draggingNode;
    if (!insertionTarget || !insertingNodeId) return null;
    const original = renderedConnections.find(
      (connection) => connection.id === insertionTarget,
    );
    if (!original) return null;
    const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));
    const plan = getInsertionPlan(
      insertingNodeId,
      original,
      nodeMap,
      connections,
      runtime,
    );
    if (!plan) return null;
    const inputAnchor = anchors[`${insertingNodeId}:${plan.input.id}`];
    const outputAnchor = anchors[`${insertingNodeId}:${plan.output.id}`];
    if (!inputAnchor || !outputAnchor) return null;
    return {
      incomingPath: getCurve(original.start, inputAnchor, original.sourcePort),
      outgoingPath: getCurve(outputAnchor, original.end, plan.output.id),
      type: original.type,
    };
  }, [
    anchors,
    connections,
    draggingNode,
    insertionTarget,
    nodes,
    placingNodeId,
    renderedConnections,
    runtime,
  ]);
  const selectedRenderedConnection = selectedConnection
    ? renderedConnections.find((connection) => connection.id === selectedConnection) ?? null
    : null;
  const selectedConnectionMidpoint = selectedRenderedConnection
    ? getCurveMidpoint(
        selectedRenderedConnection.start,
        selectedRenderedConnection.end,
        selectedRenderedConnection.sourcePort,
      )
    : null;

  const previewStart = connecting ? anchors[`${connecting.nodeId}:${connecting.port.id}`] : null;
  const previewPath =
    previewStart && wirePointer
      ? getCurve(
          connecting?.port.direction === "output" ? previewStart : wirePointer,
          connecting?.port.direction === "output" ? wirePointer : previewStart,
          connecting?.port.direction === "output" ? connecting.port.id : undefined,
        )
      : null;
  const connectionTutorialPath = useMemo(() => {
    if (!connectionTutorialExtractorId) return null;
    const start = anchors["stone:stone-out"];
    const end = anchors[`${connectionTutorialExtractorId}:resource-in`];
    if (!start || !end) return null;
    return {
      start,
      end,
      path: getCurve(start, end, "stone-out"),
    };
  }, [anchors, connectionTutorialExtractorId]);

  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.id, node] as const)),
    [nodes],
  );
  const connectionIndex = useMemo(() => {
    const incomingByPort = new Map<string, Connection>();
    const outgoingByPort = new Map<string, Connection[]>();
    connections.forEach((connection) => {
      incomingByPort.set(
        `${connection.targetNode}:${connection.targetPort}`,
        connection,
      );
      const sourceKey = `${connection.sourceNode}:${connection.sourcePort}`;
      const outgoing = outgoingByPort.get(sourceKey);
      if (outgoing) outgoing.push(connection);
      else outgoingByPort.set(sourceKey, [connection]);
    });
    return { incomingByPort, outgoingByPort };
  }, [connections]);
  const smartProcessorInputTypes = useMemo(() => new Map(
    nodes
      .filter((node) => isProcessorKind(node.kind))
      .map((node) => [
        node.id,
        getEffectiveSmartProcessorMaterialType(
          node.id,
          runtime.processors[node.id],
          connections,
        ),
      ] as const),
  ), [connections, nodes, runtime.processors]);

  const playAreaWorldSize = getPlayAreaWorldSize(runtime.research, activeMapSector);
  const worldSize = {
    width: Math.max(playAreaWorldSize.width, viewportSize.width / zoom),
    height: Math.max(playAreaWorldSize.height, viewportSize.height / zoom),
  };

  const extractorRecipes = useMemo(() => Object.fromEntries(
    nodes
      .filter((node) => isExtractorKind(node.kind))
      .map((node) => {
        const resourceEdge = connectionIndex.incomingByPort.get(`${node.id}:resource-in`);
        return [node.id, resourceEdge ? EXTRACTOR_RECIPES[resourceEdge.type] ?? null : null];
      }),
  ) as Record<ExtractorNodeId, ReturnType<typeof getExtractorRecipe>>, [
    connectionIndex,
    nodes,
  ]);
  const extractorIsWaiting = (nodeId: ExtractorNodeId) => {
    const recipe = extractorRecipes[nodeId];
    if (!recipe) return true;
    const resourceEdge = connectionIndex.incomingByPort.get(`${nodeId}:resource-in`);
    return !resourceEdge || getResourceRemaining(
      runtime,
      resourceEdge.sourceNode,
      resourceEdge.type,
      connections,
    ) <= 0;
  };
  const getPowerConnection = (nodeId: NodeId) =>
    connectionIndex.incomingByPort.get(`${nodeId}:power-in`);
  const getAvailablePower = (nodeId: NodeId) => {
    const powerConnection = getPowerConnection(nodeId);
    const generatorId = powerConnection
      ? findPowerGeneratorId(
          powerConnection.sourceNode,
          connections,
          runtime.generators,
          runtime.pausedOutputs,
        )
      : null;
    return generatorId ? runtime.generators[generatorId]?.power ?? 0 : 0;
  };
  const processorNeedsInputs = (nodeId: NodeId, kind: ProcessorKind) => {
    const processor = runtime.processors[nodeId];
    const recipe = getProcessorRecipe(kind, processor);
    if (!processor || !recipe) return true;
    const effectiveMaterialType = smartProcessorInputTypes.get(nodeId) ??
      processor?.materialType ??
      null;
    const awaitingSmartType = Boolean(
      getSmartProcessorOutputPortId(nodeId, processor) &&
      !getSmartProcessorOutput(nodeId, effectiveMaterialType, processor),
    );
    return awaitingSmartType || recipe.inputs.some(
        (input) => (processor.inputs[input.id] ?? 0) < input.amount,
      );
  };
  const processorIsWaiting = (nodeId: NodeId, kind: ProcessorKind) =>
    processorNeedsInputs(nodeId, kind);
  const activeMapResourceCapacity = getMapNodeStartingResourceCapacity(activeMapSector);
  const getNodeProgress = (node: NodeSpec) => {
    const minedDeposit = runtime.minedDeposits[node.id];
    if (minedDeposit) return (minedDeposit.remaining / minedDeposit.capacity) * 100;
    if (node.kind === "ironOre") {
      const capacity = runtime.ironOre.capacity ?? activeMapResourceCapacity;
      return capacity > 0 ? (runtime.ironOre.remaining / capacity) * 100 : 0;
    }
    if (node.kind === "copperOre") {
      const capacity = runtime.copperOre.capacity ?? activeMapResourceCapacity;
      return capacity > 0 ? (runtime.copperOre.remaining / capacity) * 100 : 0;
    }
    if (node.kind === "stone") {
      const capacity = runtime.stone.capacity ?? activeMapResourceCapacity;
      return capacity > 0 ? (runtime.stone.remaining / capacity) * 100 : 0;
    }
    if (node.kind === "forest") {
      const capacity = runtime.forest.capacity ?? activeMapResourceCapacity;
      return capacity > 0 ? (runtime.forest.remaining / capacity) * 100 : 0;
    }
    if (node.kind === "storage") return 100;
    if (node.kind === "woodenChest") return 100;
    if (isExtractorKind(node.kind)) {
      const extractor = runtime.extractors[node.id];
      return extractor?.progress ?? 0;
    }
    if (node.kind === "researchFoundry") {
      return isAllResearchComplete(runtime.research)
        ? 100
        : runtime.researchFoundries[node.id]?.progress ?? 0;
    }
    if (node.kind === "treePlanter") return runtime.treePlanters[node.id]?.progress ?? 0;
    if (node.kind === "miningDrill") {
      const drill = runtime.miningDrills[node.id];
      return drill
        ? (drill.iterations / MINING_DRILL_ITERATIONS) * 100
        : 0;
    }
    if (node.kind === "generator") return ((runtime.generators[node.id]?.power ?? 0) / GENERATOR_MAX_POWER) * 100;
    if (node.kind === "inventorySource") return runtime.inventorySources[node.id]?.progress ?? 0;
    if (isProcessorKind(node.kind)) {
      const processor = runtime.processors[node.id];
      return processor?.progress ?? 0;
    }
    return 0;
  };
  const getNodeFull = (node: NodeSpec) => {
    if (isExtractorKind(node.kind)) {
      return (runtime.extractors[node.id]?.stored ?? 0) >= EXTRACTOR_CAPACITY;
    }
    if (node.kind === "generator") return (runtime.generators[node.id]?.power ?? 0) >= GENERATOR_MAX_POWER;
    if (node.kind === "inventorySource") return runtime.inventorySources[node.id]?.full ?? false;
    if (isProcessorKind(node.kind)) {
      return getProcessorStored(runtime.processors[node.id]) >= PROCESSOR_CAPACITY;
    }
    return false;
  };
  const getPortConnectionClass = (nodeId: NodeId, port: Port) => {
    if (isAssemblerPortDisabled(nodeId, port.id, runtime)) return "disabled";
    if (snappedPort?.nodeId === nodeId && snappedPort.port.id === port.id) {
      return "compatible snap-target";
    }
    const source = connecting ?? hoveredPort;
    if (!source) return "";
    if (source.nodeId === nodeId && source.port.id === port.id) {
      return connecting ? "" : "hover-source";
    }
    if (source.nodeId === nodeId || source.port.direction === port.direction) return "";
    if (!connecting) {
      const sourceNode = nodes.find((node) => node.id === source.nodeId);
      const candidateNode = nodes.find((node) => node.id === nodeId);
      const sourceIsProduction = Boolean(
        sourceNode &&
        isPurchasableKind(sourceNode.kind) &&
        !isLogisticsNodeKind(sourceNode.kind),
      );
      if (sourceIsProduction && candidateNode && isLogisticsNodeKind(candidateNode.kind)) return "";
    }

    const compatible = isCompatible(source.port, port);
    if (connecting) return compatible ? "compatible" : "incompatible";

    const available = port.direction === "output"
      ? isMultiOutputPort(nodeId, port.id) || !connections.some(
          (connection) => connection.sourceNode === nodeId && connection.sourcePort === port.id,
        )
      : isMultiInputPort(nodeId, port.id) || !connections.some(
          (connection) => connection.targetNode === nodeId && connection.targetPort === port.id,
        );
    return compatible && available ? "hover-compatible" : "";
  };
  const clearHoveredPort = (nodeId: NodeId, portId: string) => {
    setHoveredPort((current) =>
      current?.nodeId === nodeId && current.port.id === portId ? null : current,
    );
  };
  const selectionBoxStyle = selectionBox
    ? {
        left: Math.min(selectionBox.start.x, selectionBox.end.x),
        top: Math.min(selectionBox.start.y, selectionBox.end.y),
        width: Math.abs(selectionBox.end.x - selectionBox.start.x),
        height: Math.abs(selectionBox.end.y - selectionBox.start.y),
      }
    : null;
  const selectedNodeRects = selectedNodes.flatMap((nodeId) => {
    const node = nodes.find((candidate) => candidate.id === nodeId);
    const position = positions[nodeId];
    if (!node || !position) return [];
    const size = getNodeSize(nodeId, node);
    return [{ node, position, size }];
  });
  const selectedNodeBounds = selectedNodeRects.length > 0
    ? {
        left: Math.min(...selectedNodeRects.map(({ position }) => position.x)),
        top: Math.min(...selectedNodeRects.map(({ position }) => position.y)),
        right: Math.max(...selectedNodeRects.map(({ position, size }) => position.x + size.width)),
        bottom: Math.max(...selectedNodeRects.map(({ position, size }) => position.y + size.height)),
      }
    : null;
  const selectedDestroyableNodeIds = selectedNodeRects
    .filter(({ node }) => isDestroyableNode(node))
    .map(({ node }) => node.id);
  const buildMaterialAvailability = useMemo(
    () => getGlobalBuildMaterialAvailability(
      runtime,
      nodes,
      connections,
      activeMapSector,
      mapFactoriesRef.current,
      mapNodeProgress,
    ),
    [activeMapSector, connections, mapNodeProgress, nodes, runtime],
  );
  const milestoneResearchTriggerKey = [
    runtime.extractorProduced[ResourceType.WOOD] ?? 0,
    runtime.produced[ResourceType.MOTOR] ?? 0,
    runtime.extractorProduced[ResourceType.IRON] ?? 0,
    runtime.extractorProduced[ResourceType.COPPER] ?? 0,
    runtime.produced[ResourceType.IRON_PLATE] ?? 0,
    runtime.produced[ResourceType.COPPER_PLATE] ?? 0,
    Number(builtBuildKinds.has("refiner")),
    Number(builtBuildKinds.has("assembler")),
    Number(runtime.research.kilnUnlocked),
    Number(runtime.research.charcoalGeneratorUnlocked),
    Number(runtime.research.furnaceUnlocked),
    Number(runtime.research.refinerUnlocked),
    Number(runtime.research.assemblerUnlocked),
    Number(runtime.research.researchCenterUnlocked),
  ].join(":");
  useEffect(() => {
    const current = runtimeRef.current;
    const completedProjects = RESEARCH_PROJECTS.filter((project) =>
      getResearchMilestoneRequirement(project.id) &&
      !isResearchProjectUnlocked(current.research, project.id) &&
      isResearchMilestoneSatisfied(project.id, current, builtBuildKinds)
    );
    if (completedProjects.length === 0) return;

    const research: Runtime["research"] = {
      ...current.research,
      progress: { ...current.research.progress },
    };
    completedProjects.forEach((project) => {
      research.progress[project.id] = getResearchProjectCost(project.id);
      if (project.id === "kiln") {
        research.kilnUnlocked = true;
      } else if (project.id === "charcoalGenerator") {
        research.charcoalGeneratorUnlocked = true;
      } else if (project.id === "furnace") {
        research.furnaceUnlocked = true;
      } else if (project.id === "refiner") {
        research.refinerUnlocked = true;
      } else if (project.id === "assembler") {
        research.assemblerUnlocked = true;
      } else if (project.id === "researchCenter") {
        research.researchCenterUnlocked = true;
      }
    });

    const next: Runtime = {
      ...current,
      research,
    };
    runtimeRef.current = next;
    setRuntime(next);
    completedProjects.forEach((project) => announceResearchCompletion(project.id));
  }, [builtBuildKinds, milestoneResearchTriggerKey]);

  useEffect(() => {
    const newlyRecorded = Array.from(revealedBuildKinds).filter(
      (kind) => unlockTimes[kind] === undefined,
    );
    if (newlyRecorded.length === 0) return;
    const elapsed = Math.max(0, gameElapsedMsRef.current);
    const recordFrame = window.requestAnimationFrame(() => {
      if (!journalOpen) setJournalAttention(true);
      setUnlockTimes((current) => {
        const next = { ...current };
        newlyRecorded.forEach((kind) => {
          if (next[kind] === undefined) next[kind] = elapsed;
        });
        return next;
      });
    });
    return () => window.cancelAnimationFrame(recordFrame);
  }, [journalOpen, revealedBuildKinds, unlockTimes]);

  useEffect(() => {
    const unlockContext: BuildUnlockContext = {
      runtime,
      builtKinds: builtBuildKinds,
      logisticsUnlocked,
    };
    const discoveredKinds = VISIBLE_BUILD_CATALOG
      .filter((item) => !revealedBuildKinds.has(item.kind))
      .filter((item) => isBuildUnlockSatisfied(item.kind, unlockContext))
      .map((item) => item.kind);

    if (discoveredKinds.length === 0) return;
    const revealFrame = window.requestAnimationFrame(() => {
      setRevealedBuildKinds((current) => {
        const next = new Set(current);
        discoveredKinds.forEach((kind) => next.add(kind));
        return next;
      });
      setNewBuildKinds((current) => {
        const next = new Set(current);
        discoveredKinds.forEach((kind) => next.add(kind));
        return next;
      });
      if (!buildOpen) setBuildAttention(true);
    });
    return () => window.cancelAnimationFrame(revealFrame);
  }, [
    buildOpen,
    builtBuildKinds,
    logisticsUnlocked,
    revealedBuildKinds,
    runtime,
  ]);
  const researchCenterLimitReached = hasNodeKindAcrossMaps(
    "researchFoundry",
    nodes,
    activeMapSector,
    mapFactoriesRef.current,
  );
  const buildCatalog = useMemo(() => {
    const unlockContext: BuildUnlockContext = {
      runtime,
      builtKinds: builtBuildKinds,
      logisticsUnlocked,
    };
    const visibleItems = VISIBLE_BUILD_CATALOG
      .map((item) => {
        const unlocked = isBuildKindUnlocked(item.kind, revealedBuildKinds, unlockContext);
        const hasMaterials = removeBuildCosts || item.recipe.every(
          (ingredient) =>
            buildMaterialAvailability[ingredient.type].total >= ingredient.amount,
        );
        const limitReached = item.kind === "researchFoundry" && researchCenterLimitReached;
        return {
          item,
          unlocked,
          hasMaterials,
          limitReached,
          canBuild: unlocked && hasMaterials && !limitReached,
        };
      })
      .filter(({ unlocked }) => showAllBuildNodes || unlocked)
      .sort((a, b) =>
        Number(b.canBuild) - Number(a.canBuild) ||
        Number(b.unlocked) - Number(a.unlocked),
      );

    const neverBuiltCount = visibleItems.filter(({ item, unlocked }) =>
      unlocked &&
      !placedBuildKinds.has(item.kind) &&
      (showAllBuildNodes || buildCategory === "all" || getBuildCategory(item.kind) === buildCategory)
    ).length;
    const placementFilteredItems = showNeverBuiltOnly
      ? visibleItems.filter(({ item, unlocked }) =>
          unlocked && !placedBuildKinds.has(item.kind),
        )
      : visibleItems;
    const categoryCounts = {
      production: placementFilteredItems.filter(({ item }) => getBuildCategory(item.kind) === "production").length,
      logistics: placementFilteredItems.filter(({ item }) => getBuildCategory(item.kind) === "logistics").length,
      storage: placementFilteredItems.filter(({ item }) => getBuildCategory(item.kind) === "storage").length,
    };
    const categoryItems = showAllBuildNodes || buildCategory === "all"
      ? placementFilteredItems
      : placementFilteredItems.filter(({ item }) => getBuildCategory(item.kind) === buildCategory);
    const buildableCount = categoryItems.filter(({ canBuild }) => canBuild).length;
    return {
      buildableCount,
      categoryCounts,
      neverBuiltCount,
      totalCount: categoryItems.length,
      items: showBuildableOnly && !showAllBuildNodes
        ? categoryItems.filter(({ canBuild }) => canBuild)
        : categoryItems,
    };
  }, [
    buildCategory,
    buildMaterialAvailability,
    builtBuildKinds,
    logisticsUnlocked,
    placedBuildKinds,
    researchCenterLimitReached,
    removeBuildCosts,
    revealedBuildKinds,
    runtime,
    showAllBuildNodes,
    showBuildableOnly,
    showNeverBuiltOnly,
  ]);
  const shortcutNodeOptions = useMemo<ShortcutNodeOption[]>(() => {
    const unlockContext: BuildUnlockContext = {
      runtime,
      builtKinds: builtBuildKinds,
      logisticsUnlocked,
    };
    return VISIBLE_BUILD_CATALOG
      .filter((item) => isBuildKindUnlocked(item.kind, revealedBuildKinds, unlockContext))
      .map((item) => ({
        kind: item.kind,
        title: item.title,
        icon: item.icon,
        canBuild: item.kind !== "researchFoundry" || !researchCenterLimitReached
          ? removeBuildCosts || item.recipe.every((ingredient) =>
              buildMaterialAvailability[ingredient.type].total >= ingredient.amount,
            )
          : false,
      }));
  }, [
    buildMaterialAvailability,
    builtBuildKinds,
    logisticsUnlocked,
    researchCenterLimitReached,
    removeBuildCosts,
    revealedBuildKinds,
    runtime,
  ]);
  const buildFromShortcut = useCallback((kind: PurchasableKind) => {
    const item = VISIBLE_BUILD_CATALOG.find((candidate) => candidate.kind === kind);
    return item ? buildNode(item.kind, item.recipe) : false;
  }, [buildNode]);
  const hoveredPortConnectionOptions = useMemo(() => {
    if (!hoveredPort) return [];
    const currentNode = nodes.find((node) => node.id === hoveredPort.nodeId);
    if (!currentNode) return [];

    const currentPortSpec = (hoveredPort.port.direction === "input"
      ? currentNode.inputs
      : currentNode.outputs
    ).find((port) => port.id === hoveredPort.port.id);
    if (!currentPortSpec) return [];
    const currentPort = getRuntimeAwarePort(currentNode.id, currentPortSpec, connections, runtime);
    if (isAssemblerPortDisabled(currentNode.id, currentPort.id, runtime)) return [];
    const currentPortIsMulti = currentPort.direction === "input"
      ? isMultiInputPort(currentNode.id, currentPort.id)
      : isMultiOutputPort(currentNode.id, currentPort.id);
    const currentNodeIsProduction = isPurchasableKind(currentNode.kind) &&
      !isLogisticsNodeKind(currentNode.kind);
    if (!currentPortIsMulti && !currentNodeIsProduction) return [];
    const options = new Map<string, NodeConnectionOption>();
    const portIsAvailable = (nodeId: NodeId, port: Port) =>
      port.direction === "input"
        ? isMultiInputPort(nodeId, port.id) || !connections.some(
            (connection) => connection.targetNode === nodeId && connection.targetPort === port.id,
          )
        : isMultiOutputPort(nodeId, port.id) || !connections.some(
            (connection) => connection.sourceNode === nodeId && connection.sourcePort === port.id,
          );

    const addRoute = (
      candidate: NodeSpec,
      mode: NodeConnectionOption["mode"],
      route: string,
      connected: boolean,
    ) => {
      const key = `${candidate.id}:${mode}`;
      const existing = options.get(key);
      if (existing) {
        if (!existing.routes.includes(route)) existing.routes.push(route);
        existing.connected ||= connected;
        return;
      }
      options.set(key, {
        nodeId: candidate.id,
        title: candidate.title,
        eyebrow: candidate.eyebrow,
        color: candidate.color,
        mode,
        routes: [route],
        connected,
      });
    };

    nodes.forEach((candidate) => {
      if (
        candidate.id === currentNode.id ||
        (!currentPortIsMulti && isLogisticsNodeKind(candidate.kind))
      ) return;
      if (currentPort.direction === "output") {
        candidate.inputs
          .filter((port) => !isAssemblerPortDisabled(candidate.id, port.id, runtime))
          .map((port) => getRuntimeAwarePort(candidate.id, port, connections, runtime))
          .forEach((input) => {
            if (!isCompatible(currentPort, input)) return;
            const connected = connections.some(
              (connection) =>
                connection.sourceNode === currentNode.id &&
                connection.sourcePort === currentPort.id &&
                connection.targetNode === candidate.id &&
                connection.targetPort === input.id,
            );
            if (!connected && !portIsAvailable(candidate.id, input)) return;
            addRoute(candidate, "send", `${currentPort.label} → ${input.label}`, connected);
          });
        return;
      }

      candidate.outputs
        .filter((port) => !isAssemblerPortDisabled(candidate.id, port.id, runtime))
        .map((port) => getRuntimeAwarePort(candidate.id, port, connections, runtime))
        .forEach((output) => {
          if (!isCompatible(output, currentPort)) return;
          const connected = connections.some(
            (connection) =>
              connection.sourceNode === candidate.id &&
              connection.sourcePort === output.id &&
              connection.targetNode === currentNode.id &&
              connection.targetPort === currentPort.id,
          );
          if (!connected && !portIsAvailable(candidate.id, output)) return;
          addRoute(candidate, "receive", `${output.label} → ${currentPort.label}`, connected);
        });
    });

    return Array.from(options.values()).sort((a, b) =>
      Number(b.connected) - Number(a.connected) ||
      a.title.localeCompare(b.title) ||
      a.mode.localeCompare(b.mode),
    );
  }, [connections, hoveredPort, nodes, runtime]);
  const inventoryTotal = INVENTORY_ITEMS.reduce(
    (total, item) => total + buildMaterialAvailability[item.type].total,
    0,
  );
  const storageBreakdownByType = useMemo(() => {
    const breakdown = Object.fromEntries(
      INVENTORY_ITEMS.map(({ type }) => [type, { nodeCount: 0, nodeCapacity: 0 }]),
    ) as Record<InventoryItemType, InventoryStorageBreakdown>;
    const addMapStorage = (mapRuntime: Runtime, mapNodes: NodeSpec[]) => {
      mapNodes.forEach((node) => {
        const construction = mapRuntime.construction[node.id];
        if (construction && !construction.complete) return;
        if (node.kind === "storage") {
          const capacity = mapRuntime.storages[node.id]?.capacityPerItem ?? STORAGE_NODE_CAPACITY;
          INVENTORY_ITEMS.forEach(({ type }) => {
            breakdown[type].nodeCount += 1;
            breakdown[type].nodeCapacity += capacity;
          });
          return;
        }
        if (node.kind !== "woodenChest") return;
        const chest = mapRuntime.woodenChests[node.id];
        if (!chest) return;
        INVENTORY_ITEMS.forEach(({ type }) => {
          if (chest.itemType && chest.itemType !== type) return;
          breakdown[type].nodeCount += 1;
          breakdown[type].nodeCapacity += WOODEN_CHEST_CAPACITY;
        });
      });
    };

    addMapStorage(runtime, nodes);
    Object.entries(mapFactoriesRef.current).forEach(([sectorKey, factory]) => {
      if (
        sectorKey === activeMapSector ||
        !isMapNodeUnlocked(mapNodeProgress, sectorKey)
      ) return;
      addMapStorage(factory.runtime, getMapFactoryNodes(factory));
    });
    return breakdown;
  }, [activeMapSector, mapNodeProgress, nodes, runtime]);
  const visibleInventoryItems = useMemo(() => {
    const visibleTypes = new Set<InventoryItemType>(STARTING_INVENTORY_ITEM_TYPES);

    nodes.forEach((node) => {
      const construction = runtime.construction[node.id];
      if (construction && !construction.complete) return;
      PRODUCIBLE_INVENTORY_TYPES_BY_KIND[node.kind]?.forEach((type) => visibleTypes.add(type));
    });

    INVENTORY_ITEMS.forEach((item) => {
      if (runtime.produced[item.type] > 0 || buildMaterialAvailability[item.type].total > 0) {
        visibleTypes.add(item.type);
      }
    });

    return INVENTORY_ITEMS.filter((item) => visibleTypes.has(item.type));
  }, [buildMaterialAvailability, nodes, runtime.construction, runtime.produced]);
  const researchSelectionAvailable = canSelectResearchProject(
    runtime,
    nodes,
    mapFactoriesRef.current,
    activeMapSector,
  );
  const activeResearchProject = getResearchProject(runtime.research.activeProject);
  const activeResearchProjectCost = activeResearchProject
    ? getResearchProjectCost(activeResearchProject.id, runtime.research)
    : 0;
  const activeResearchCompleted = activeResearchProject
    ? runtime.research.progress[activeResearchProject.id]
    : 0;
  const activeResearchInFlight = activeResearchProject
    ? [
        ...Object.values(runtime.researchFoundries),
        ...Object.entries(mapFactoriesRef.current).flatMap(([sectorKey, factory]) =>
          sectorKey === activeMapSector
            ? []
            : Object.values(factory.runtime.researchFoundries)
        ),
      ].reduce(
        (total, foundry) => total + Math.max(0, Math.min(100, foundry.progress)) / 100,
        0,
      )
    : 0;
  const activeResearchDisplayProgress = Math.min(
    activeResearchProjectCost,
    activeResearchCompleted + activeResearchInFlight,
  );
  const activeResearchProgressPercent = activeResearchProjectCost > 0
    ? (activeResearchDisplayProgress / activeResearchProjectCost) * 100
    : 0;
  const permanentResearchCount = RESEARCH_PROJECTS.filter((project) => !project.repeatable).length;
  const completedResearchCount = RESEARCH_PROJECTS.filter((project) =>
    !project.repeatable && isResearchProjectUnlocked(runtime.research, project.id)
  ).length;
  const orderedResearchProjects = [
    ...RESEARCH_PROJECTS.filter((project) =>
      !isResearchProjectUnlocked(runtime.research, project.id)
    ),
    ...RESEARCH_PROJECTS.filter((project) =>
      isResearchProjectUnlocked(runtime.research, project.id)
    ),
  ];
  const selectedMapNodeProgress = selectedMapSector
    ? mapNodeProgress[selectedMapSector]
    : null;
  const selectedMapNodeUnlockable = selectedMapSector
    ? canUnlockMapNode(mapNodeProgress, selectedMapSector)
    : false;
  const selectedMapNodeValue = selectedMapSector
    ? getMapNodeValue(selectedMapSector)
    : 0;
  const selectedMapNodePlayAreaSize = selectedMapSector
    ? getPlayAreaWorldSize(runtime.research, selectedMapSector)
    : null;
  const selectedMapNodeLabel = selectedMapSector
    ? selectedMapNodeProgress?.customName?.trim() || (
        selectedMapNodeProgress?.explored
          ? "Unlocked Node"
          : selectedMapNodeUnlockable
            ? "Available Node"
            : "Uncharted"
      )
    : "Not selected";
  const getMapNodeDisplayName = (sectorKey: string) =>
    mapNodeProgress[sectorKey]?.customName?.trim() || (
      sectorKey === MAP_HOME_SECTOR ? "Home Factory" : "Unnamed Node"
    );
  const getMapNodeRuntime = (sectorKey: string) => {
    if (sectorKey === activeMapSector) return runtime;
    return mapFactoriesRef.current[sectorKey]?.runtime ?? null;
  };
  const getMapNodeResourceSummary = (sectorKey: string) => {
    const nodeRuntime = getMapNodeRuntime(sectorKey);
    const startingResourceCapacity = getMapNodeStartingResourceCapacity(sectorKey);
    const baseResources = [
      { label: "Iron", amount: nodeRuntime?.ironOre.remaining ?? startingResourceCapacity },
      { label: "Copper", amount: nodeRuntime?.copperOre.remaining ?? startingResourceCapacity },
      { label: "Stone", amount: nodeRuntime?.stone.remaining ?? startingResourceCapacity },
      { label: "Forest", amount: nodeRuntime?.forest.remaining ?? startingResourceCapacity },
    ];
    const minedResources = Object.values(nodeRuntime?.minedDeposits ?? {}).map((deposit) => ({
      label: getMiningTarget(deposit.type)?.title ?? formatResourceType(deposit.type),
      amount: deposit.remaining as number | string,
    }));
    const lakeResources = Object.keys(nodeRuntime?.lakes ?? {}).length > 0
      ? [{ label: "Water", amount: "∞" as number | string }]
      : [];
    return [
      ...baseResources.filter((resource) => resource.amount > 0),
      ...minedResources.filter((resource) => Number(resource.amount) > 0),
      ...lakeResources,
    ];
  };
  const renderMapNodeTooltip = (sectorKey: string) => {
    const resources = getMapNodeResourceSummary(sectorKey);
    const size = getPlayAreaWorldSize(runtime.research, sectorKey);
    const factoryNodeCount = sectorKey === activeMapSector
      ? nodes.length
      : mapFactoriesRef.current[sectorKey]?.nodes.length ?? 4;
    return (
      <div className="map-node-tooltip-copy">
        <strong>{getMapNodeDisplayName(sectorKey)}</strong>
        <small>
          Node Value {getMapNodeValue(sectorKey)} · {size.width.toLocaleString()} × {size.height.toLocaleString()} · {factoryNodeCount} factory nodes
        </small>
        <div className="map-node-tooltip-resources">
          <span>Resources</span>
          {resources.map((resource) => (
            <small key={`${sectorKey}-${resource.label}`}>
              {resource.label}<b>{typeof resource.amount === "number" ? resource.amount.toLocaleString() : resource.amount}</b>
            </small>
          ))}
        </div>
        <div className="map-node-tooltip-transport">
          <span>Inter-node transport</span>
          <small>No active item transports</small>
        </div>
      </div>
    );
  };
  const currentMapNodeName = getMapNodeDisplayName(activeMapSector);
  const mapNodeDialogResources = mapNodeDialogSector
    ? getMapNodeResourceSummary(mapNodeDialogSector)
    : [];
  const pendingLoadSave = pendingLoadSlot === null
    ? null
    : pendingLoadSlot === "temporary"
      ? temporarySave
      : saveSlots[pendingLoadSlot];
  const configuringFilter = configuringFilterId
    ? runtime.filters[configuringFilterId] ?? null
    : null;
  const configuringMiningDrill = configuringMiningDrillId
    ? runtime.miningDrills[configuringMiningDrillId] ?? null
    : null;
  const configuringAssembler = configuringAssemblerId
    ? runtime.processors[configuringAssemblerId] ?? null
    : null;
  const configuringRecipeNode = configuringAssemblerId
    ? nodes.find((node) => node.id === configuringAssemblerId) ?? null
    : null;
  const configuringRecipeKind = configuringRecipeNode?.kind === "refiner"
    ? "refiner"
    : configuringRecipeNode?.kind === "assembler"
      ? "assembler"
      : configuringRecipeMachineKind;
  const configuringRecipeTitle = configuringRecipeKind === "refiner" ? "Refiner" : "Assembler";
  const configuringRecipeOptions = configuringRecipeKind === "refiner"
    ? REFINER_RECIPE_OPTIONS.map((option) => ({
        ...option,
        recipe: REFINER_RECIPES[option.id],
        selected: configuringAssembler?.refinerRecipe === option.id,
      }))
    : ASSEMBLER_RECIPE_OPTIONS
        .filter((option) => option.id !== "automataCore" || runtime.research.automataCoreUnlocked)
        .map((option) => ({
          ...option,
          recipe: ASSEMBLER_RECIPES[option.id],
          selected: configuringAssembler?.assemblerRecipe === option.id,
        }));
  const pendingRecipeMachineTitle = pendingAssemblerRecipeChange?.kind === "refiner"
    ? "Refiner"
    : "Assembler";
  const allBuildNodesUnlocked = VISIBLE_BUILD_CATALOG.every((item) =>
    revealedBuildKinds.has(item.kind),
  );
  const allResearchUnlocked = isAllResearchComplete(runtime.research);
  const journalEntries = VISIBLE_BUILD_CATALOG
    .flatMap((item, catalogIndex) => {
      const unlockedAt = unlockTimes[item.kind];
      return unlockedAt === undefined ? [] : [{ item, unlockedAt, catalogIndex }];
    })
    .sort((a, b) => b.unlockedAt - a.unlockedAt || b.catalogIndex - a.catalogIndex);
  const journalCategoryCounts = journalEntries.reduce(
    (counts, entry) => {
      counts[getBuildCategory(entry.item.kind)] += 1;
      return counts;
    },
    { production: 0, logistics: 0, storage: 0 },
  );
  const journalAchievementEntries = Array.from(unlockedAchievements)
    .reverse()
    .map((id) => ({ id, ...ACHIEVEMENT_UNLOCK_DETAILS[id] }));
  const visibleJournalAchievements = journalCategory === "all" || journalCategory === "achievements"
    ? journalAchievementEntries
    : [];
  const visibleJournalEntries = journalCategory === "achievements"
    ? []
    : journalCategory === "all"
      ? journalEntries
      : journalEntries.filter((entry) => getBuildCategory(entry.item.kind) === journalCategory);
  const journalHasVisibleEntries = visibleJournalAchievements.length > 0 || visibleJournalEntries.length > 0;
  const pendingDeletionConnection = pendingDeletionConnectionId
    ? connections.find((connection) => connection.id === pendingDeletionConnectionId) ?? null
    : null;
  const pendingDisbandControlGroup = pendingDisbandControlGroupId
    ? controlGroups.find((group) => group.id === pendingDisbandControlGroupId) ?? null
    : null;
  const pendingConnectionSourceNode = pendingDeletionConnection
    ? nodes.find((node) => node.id === pendingDeletionConnection.sourceNode) ?? null
    : null;
  const pendingConnectionTargetNode = pendingDeletionConnection
    ? nodes.find((node) => node.id === pendingDeletionConnection.targetNode) ?? null
    : null;
  const pendingConnectionSourcePort = pendingDeletionConnection && pendingConnectionSourceNode
    ? pendingConnectionSourceNode.outputs.find((port) => port.id === pendingDeletionConnection.sourcePort) ?? null
    : null;
  const pendingConnectionTargetPort = pendingDeletionConnection && pendingConnectionTargetNode
    ? pendingConnectionTargetNode.inputs.find((port) => port.id === pendingDeletionConnection.targetPort) ?? null
    : null;
  const managedMultiPortNode = managedMultiPort
    ? nodes.find((node) => node.id === managedMultiPort.nodeId) ?? null
    : null;
  const managedMultiPortSpec = managedMultiPort && managedMultiPortNode
    ? (managedMultiPort.direction === "output"
        ? managedMultiPortNode.outputs
        : managedMultiPortNode.inputs
      ).find((port) => port.id === managedMultiPort.portId) ?? null
    : managedMultiPort &&
        runtime.lakes[managedMultiPort.nodeId] &&
        getLakeWaterOutputPort(managedMultiPort.portId)
      ? getLakeWaterOutputPort(managedMultiPort.portId)
      : null;
  const managedMultiPortTitle = managedMultiPortNode?.title ?? (
    managedMultiPort && runtime.lakes[managedMultiPort.nodeId] ? "Lake" : "Node"
  );
  const managedMultiConnections = managedMultiPort
    ? connections.filter((connection) => managedMultiPort.direction === "output"
      ? connection.sourceNode === managedMultiPort.nodeId && connection.sourcePort === managedMultiPort.portId
      : connection.targetNode === managedMultiPort.nodeId && connection.targetPort === managedMultiPort.portId)
    : [];
  return (
    <TooltipProvider delayDuration={250}>
    <main className="foundry-shell">
      <header className="topbar">
        <div className="brand-lockup" aria-label="Factorinode">
          <div className="brand-mark"><Hammer aria-hidden="true" /></div>
          <div>
            <strong>FACTORINODE</strong>
          </div>
        </div>

        <div aria-hidden="true" />

        <div className="topbar-actions">
          {runtime.research.explorationUnlocked ? (
            <Dialog open={mapOpen} onOpenChange={setMapOpen}>
              <DialogTrigger asChild>
                <Button
                  className="map-trigger"
                  size="sm"
                  variant="outline"
                  aria-label={`Map${selectedMapSector ? `, ${selectedMapNodeLabel} target selected` : ""}`}
                >
                  <MapIcon aria-hidden="true" />
                  <span className="map-trigger-label">Map</span>
                  <span className="map-trigger-count" aria-label={`${runtime.mapPoints} Map Points`}>
                    {runtime.mapPoints}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="map-dialog topbar-modal">
                <DialogHeader className="map-dialog-header topbar-modal-header">
                  <div className="topbar-modal-title-mark"><MapIcon aria-hidden="true" /></div>
                  <div>
                    <DialogTitle>Node Map</DialogTitle>
                    <DialogDescription>
                      The swarm hungers.
                    </DialogDescription>
                  </div>
                </DialogHeader>
                <div className="map-summary">
                  <span>Current Node <strong>{currentMapNodeName}</strong></span>
                  <span>Map Points <strong>{runtime.mapPoints}</strong></span>
                  <span>Target Node <strong>{selectedMapNodeLabel}</strong></span>
                  <span>
                    Field Size
                    <strong>
                      {selectedMapNodePlayAreaSize
                        ? `${selectedMapNodePlayAreaSize.width.toLocaleString()} × ${selectedMapNodePlayAreaSize.height.toLocaleString()}`
                        : "—"}
                    </strong>
                  </span>
                </div>
                <div className="map-viewport">
                  <div
                    className="map-grid"
                    role="region"
                    aria-label="Exploration sectors"
                    style={{
                      gridTemplateColumns: `repeat(${MAP_GRID_SIZE}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${MAP_GRID_SIZE}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: MAP_GRID_SIZE * MAP_GRID_SIZE }).map((_, index) => {
                      const x = index % MAP_GRID_SIZE;
                      const y = Math.floor(index / MAP_GRID_SIZE);
                      const sectorKey = `${x},${y}`;
                      const isHome = x === MAP_HOME_INDEX && y === MAP_HOME_INDEX;
                      if (isHome) {
                        return (
                          <Tooltip key={sectorKey}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`map-sector home ${activeMapSector === sectorKey ? "current" : ""}`}
                                aria-label={`${getMapNodeDisplayName(sectorKey)}, unlocked${activeMapSector === sectorKey ? ", current node" : ""}`}
                                onClick={() => openMapNodeDialog(sectorKey)}
                              >
                                <strong>H</strong>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="map-node-tooltip" side="top" sideOffset={8}>
                              {renderMapNodeTooltip(sectorKey)}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      const unlocked = isMapNodeUnlocked(mapNodeProgress, sectorKey);
                      if (unlocked) {
                        const mapNodeValue = getMapNodeValue(sectorKey);
                        const playAreaSize = getPlayAreaWorldSize(runtime.research, sectorKey);
                        return (
                          <Tooltip key={sectorKey}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={`map-sector explored ${activeMapSector === sectorKey ? "current" : ""}`}
                                aria-label={`${getMapNodeDisplayName(sectorKey)}, unlocked map node, value ${mapNodeValue}, Field Size ${playAreaSize.width} by ${playAreaSize.height}${activeMapSector === sectorKey ? ", current node" : ""}`}
                                onClick={() => openMapNodeDialog(sectorKey)}
                              >
                                <span>◆</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="map-node-tooltip" side="top" sideOffset={8}>
                              {renderMapNodeTooltip(sectorKey)}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      const available = canUnlockMapNode(mapNodeProgress, sectorKey);
                      if (available) {
                        const isSelected = selectedMapSector === sectorKey;
                        const mapNodeValue = getMapNodeValue(sectorKey);
                        return (
                          <button
                            type="button"
                            className={`map-sector adjacent ${isSelected ? "selected" : ""}`}
                            aria-label={`Map node value ${mapNodeValue}, ${isSelected ? "selected" : "available to unlock"}`}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedMapSector(sectorKey)}
                            key={sectorKey}
                          >
                            <span>{isSelected ? "●" : "?"}</span>
                          </button>
                        );
                      }
                      return <div className="map-sector uncharted" aria-hidden="true" key={sectorKey} />;
                    })}
                  </div>
                </div>
                <div className="map-legend" aria-label="Map legend">
                  <span><i className="home-swatch" />Home</span>
                  <span><i className="explored-swatch" />Unlocked</span>
                  <span><i className="available-swatch" />Available</span>
                  <span><i className="uncharted-swatch" />Uncharted</span>
                  <small>Entire region in view</small>
                </div>
                <div className="map-actions">
                  <span>
                    {selectedMapSector
                      ? `Node Value ${selectedMapNodeValue}`
                      : "Select an available node connected to any unlocked node"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    className={`map-unlock-button ${
                      selectedMapNodeUnlockable && runtime.mapPoints > 0 ? "ready" : ""
                    }`}
                    disabled={!selectedMapNodeUnlockable || runtime.mapPoints < 1}
                    onClick={unlockSelectedMapNode}
                  >
                    {!selectedMapNodeUnlockable
                      ? "Select Available Node"
                      : runtime.mapPoints < 1
                        ? "Need 1 Map Point"
                        : "Activate Node · 1 Point"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
          <Dialog
            open={mapNodeDialogOpen}
            onOpenChange={(open) => {
              setMapNodeDialogOpen(open);
              if (!open) setMapNodeDialogSector(null);
            }}
          >
            <DialogContent className="map-node-dialog">
              <DialogHeader>
                <DialogTitle>
                  {mapNodeDialogSector ? getMapNodeDisplayName(mapNodeDialogSector) : "Map Node"}
                </DialogTitle>
                <DialogDescription>
                  Rename this map node or travel to its persistent factory field.
                </DialogDescription>
              </DialogHeader>
              <label className="map-node-name-field">
                <span>Node name</span>
                <input
                  value={mapNodeDraftName}
                  maxLength={80}
                  placeholder={mapNodeDialogSector === MAP_HOME_SECTOR ? "Home Factory" : "Unnamed Node"}
                  onChange={(event) => setMapNodeDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveMapNodeName();
                  }}
                />
              </label>
              <div className="map-node-dialog-resources">
                <span>Resources</span>
                <div>
                  {mapNodeDialogResources.map((resource) => (
                    <small key={`dialog-${resource.label}`}>
                      {resource.label}<strong>{resource.amount.toLocaleString()}</strong>
                    </small>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={saveMapNodeName}>
                  Save Name
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!mapNodeDialogSector || mapNodeDialogSector === activeMapSector}
                  onClick={() => {
                    if (!mapNodeDialogSector) return;
                    travelToMapNode(mapNodeDialogSector);
                  }}
                >
                  {mapNodeDialogSector === activeMapSector ? "Current Node" : "Travel to Node"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={researchOpen}
            onOpenChange={(open) => {
              setResearchOpen(open);
              if (!open) setHoveredResearchProject(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className={`research-trigger ${researchSelectionAvailable && !activeResearchProject && completedResearchCount < permanentResearchCount ? "attention" : ""}`}
                size="sm"
                variant="outline"
                aria-label={`Research, ${completedResearchCount} of ${permanentResearchCount} permanent projects complete, ${runtime.research.mapNodeResearchCompletions} Map Node research completions${activeResearchProject ? `, researching ${activeResearchProject.title}` : researchSelectionAvailable ? "" : ", awaiting Research Center"}`}
              >
                <FlaskConical aria-hidden="true" />
                <span className="research-trigger-label">Research</span>
                <span className="research-trigger-count">{completedResearchCount}/{permanentResearchCount}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="research-dialog topbar-modal">
                <DialogHeader className="topbar-modal-header">
                  <div className="topbar-modal-title-mark"><FlaskConical aria-hidden="true" /></div>
                  <div>
                    <DialogTitle>Research</DialogTitle>
                    <DialogDescription>
                      Unlock new stuff! Dopamine!
                    </DialogDescription>
                  </div>
                </DialogHeader>
                <div className={`research-summary ${activeResearchProject ? "with-progress" : ""}`}>
                  <span>Active project</span>
                  <strong>{activeResearchProject?.title ?? (isAllResearchComplete(runtime.research) ? "All research complete" : "Choose a project")}</strong>
                  {activeResearchProject ? (
                    <div className="research-summary-progress">
                      <Progress
                        value={activeResearchProgressPercent}
                        aria-label={`${activeResearchProject.title}, ${activeResearchDisplayProgress.toFixed(1)} of ${activeResearchProjectCost} ${getResearchProjectCoreLabel(activeResearchProject.id, runtime.research)} analyzed`}
                      />
                      <small>
                        {activeResearchCompleted} / {activeResearchProjectCost}
                      </small>
                    </div>
                  ) : null}
                </div>
                <div className="research-list">
                  {orderedResearchProjects.map((project) => {
                    const Icon = project.icon;
                    const projectProgress = runtime.research.progress[project.id];
                    const projectCost = getResearchProjectCost(project.id, runtime.research);
                    const projectCoreLabel = getResearchProjectCoreLabel(project.id, runtime.research);
                    const milestoneRequirement = getResearchMilestoneRequirement(project.id);
                    const prerequisite = getResearchProjectPrerequisite(project.id);
                    const prerequisiteSatisfied = isResearchProjectPrerequisiteSatisfied(
                      runtime.research,
                      project.id,
                    );
                    const unlocked = isResearchProjectUnlocked(runtime.research, project.id);
                    const active = runtime.research.activeProject === project.id;
                    const repeatableCompletions = project.repeatable
                      ? runtime.research.mapNodeResearchCompletions
                      : 0;
                    const selectable = !milestoneRequirement &&
                      prerequisiteSatisfied &&
                      researchSelectionAvailable &&
                      !unlocked &&
                      !active;
                    const locked = !milestoneRequirement &&
                      (!researchSelectionAvailable || !prerequisiteSatisfied);
                    const status = unlocked
                      ? null
                      : !prerequisiteSatisfied && prerequisite
                        ? `Requires ${prerequisite}`
                        : milestoneRequirement || !researchSelectionAvailable
                          ? null
                          : active
                            ? "Active"
                            : projectProgress > 0
                              ? "Continue research"
                              : project.repeatable
                                ? `Repeatable · ${repeatableCompletions} completed`
                                : "Available research";
                    return (
                      <Tooltip open={hoveredResearchProject === project.id} key={project.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={`research-card ${active ? "active" : ""} ${unlocked ? "complete" : ""} ${locked ? "locked" : ""} ${project.repeatable ? "repeatable" : ""}`}
                            aria-disabled={!selectable}
                            aria-pressed={active}
                            aria-label={`${project.title}. ${status ? `${status}. ` : ""}${project.description} ${project.unlock}. ${milestoneRequirement ? projectProgress >= projectCost ? `${milestoneRequirement.complete}.` : `Cost: ${milestoneRequirement.pending}.` : `${projectProgress} of ${projectCost} ${projectCoreLabel} analyzed.`}`}
                            onPointerEnter={(event) => {
                              if (event.pointerType === "mouse") setHoveredResearchProject(project.id);
                            }}
                            onPointerLeave={() => setHoveredResearchProject((current) => (
                              current === project.id ? null : current
                            ))}
                            onClick={() => {
                              if (selectable) chooseResearchProject(project.id);
                            }}
                          >
                            <span className="research-card-icon"><Icon aria-hidden="true" /></span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          className={`research-card-tooltip ${unlocked ? "complete" : ""}`}
                          side="top"
                          sideOffset={10}
                        >
                          <strong className="research-tooltip-title">{project.title}</strong>
                          {status ? <span>{status}</span> : null}
                          <p>{project.description}</p>
                          <small>{project.unlock}</small>
                          {project.flavorText ? (
                            <em className="research-tooltip-flavor">{project.flavorText}</em>
                          ) : null}
                          <div className="research-tooltip-progress">
                             <Progress
                               value={(projectProgress / projectCost) * 100}
                              aria-label={milestoneRequirement
                                ? `${project.title}, ${projectProgress >= projectCost ? milestoneRequirement.complete : milestoneRequirement.pending}`
                                : `${project.title}, ${projectProgress} of ${projectCost} ${projectCoreLabel} analyzed`}
                             />
                            <strong>{milestoneRequirement
                              ? projectProgress >= projectCost ? milestoneRequirement.complete : `Cost: ${milestoneRequirement.pending}`
                              : `${projectProgress} / ${projectCost} ${projectCoreLabel}`}</strong>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
                <p className="research-note">
                  Each connected Research Center analyzes one compatible Core in {(RESEARCH_CYCLE_DURATION / 1000).toFixed(0)} seconds. Switching projects restarts the current analysis but keeps loaded Cores.
                </p>
            </DialogContent>
          </Dialog>
          <Dialog open={inventoryOpen} onOpenChange={setInventoryOpen}>
            <DialogTrigger asChild>
              <Button
                className="inventory-trigger"
                size="sm"
                variant="outline"
                aria-label={`Inventory, ${inventoryTotal} items available`}
              >
                <PackageOpen aria-hidden="true" />
                <span className="inventory-trigger-label">Inventory</span>
                <span className="inventory-trigger-count">{inventoryTotal}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="inventory-dialog topbar-modal">
              <DialogHeader className="topbar-modal-header">
                <div className="topbar-modal-title-mark"><PackageOpen aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Inventory</DialogTitle>
                  <DialogDescription>We wants it, we needs it... my precioussss.</DialogDescription>
                </div>
              </DialogHeader>
              <div className="inventory-list" aria-live="polite">
                {visibleInventoryItems.map((item) => {
                  const availability = buildMaterialAvailability[item.type];
                  const count = availability.total;
                  const breakdown = storageBreakdownByType[item.type];
                  return (
                    <Tooltip key={item.type} open={breakdown.nodeCount > 0 ? undefined : false}>
                      <TooltipTrigger asChild>
                        <div
                          className="inventory-row"
                          style={{ "--item-color": RESOURCE_COLORS[item.type] } as React.CSSProperties}
                          tabIndex={breakdown.nodeCount > 0 ? 0 : undefined}
                          aria-label={`${item.label}, ${count} stored; ${BASE_INVENTORY_CAPACITY} base capacity${breakdown.nodeCount > 0 ? ` plus ${breakdown.nodeCapacity} from ${breakdown.nodeCount} storage ${breakdown.nodeCount === 1 ? "node" : "nodes"}` : ""}`}
                        >
                          <span className="inventory-swatch" />
                          <div className="inventory-copy">
                            <strong>{item.label}</strong>
                          </div>
                          <div className="inventory-count">
                            <strong>{count}</strong>
                            <span>stored</span>
                          </div>
                          <span className="inventory-location-count">
                            {breakdown.nodeCount === 0
                              ? "No node storage"
                              : `${breakdown.nodeCount} storage ${breakdown.nodeCount === 1 ? "node" : "nodes"}`}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        className="inventory-breakdown-tooltip"
                        side="top"
                        sideOffset={10}
                        aria-label={`${item.label} storage capacity`}
                      >
                        <p>
                          <strong>{BASE_INVENTORY_CAPACITY}</strong> base, <strong>+{breakdown.nodeCapacity}</strong> from {breakdown.nodeCount} storage {breakdown.nodeCount === 1 ? "node" : "nodes"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={buildOpen}
            onOpenChange={updateBuildMenuOpen}
          >
            <DialogTrigger asChild>
              <Button
                className={`build-trigger starter-hint-host ${buildAttention ? "attention" : ""}`}
                size="sm"
                variant="outline"
                aria-label={buildAttention ? "Build, new machine available" : "Build"}
                title={buildAttention ? "New machine available" : undefined}
              >
                <Hammer aria-hidden="true" />
                Build
                {starterBuildHintTarget === "menu" ? (
                  <StarterActionHint targetLabel="Build" />
                ) : null}
              </Button>
            </DialogTrigger>
            <DialogContent className={`build-dialog topbar-modal ${showAllBuildNodes ? "show-all-nodes" : ""}`}>
              <DialogHeader className="topbar-modal-header">
                <div className="topbar-modal-title-mark"><Hammer aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Node Construction</DialogTitle>
                  <DialogDescription>
                    Something need building?
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="build-category-filters" role="group" aria-label="Filter buildings by category">
                <Button
                  className={`build-category-filter production ${buildCategory === "production" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={showAllBuildNodes}
                  aria-pressed={buildCategory === "production"}
                  onClick={() => setBuildCategory((current) => current === "production" ? "all" : "production")}
                >
                  <Factory aria-hidden="true" />
                  <span>Production</span>
                  <span className="build-category-count">{buildCatalog.categoryCounts.production}</span>
                </Button>
                <Button
                  className={`build-category-filter logistics ${buildCategory === "logistics" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={showAllBuildNodes}
                  aria-pressed={buildCategory === "logistics"}
                  onClick={() => setBuildCategory((current) => current === "logistics" ? "all" : "logistics")}
                >
                  <GitMerge aria-hidden="true" />
                  <span>Logistics</span>
                  <span className="build-category-count">{buildCatalog.categoryCounts.logistics}</span>
                </Button>
                <Button
                  className={`build-category-filter storage ${buildCategory === "storage" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={showAllBuildNodes}
                  aria-pressed={buildCategory === "storage"}
                  onClick={() => setBuildCategory((current) => current === "storage" ? "all" : "storage")}
                >
                  <Archive aria-hidden="true" />
                  <span>Storage</span>
                  <span className="build-category-count">{buildCatalog.categoryCounts.storage}</span>
                </Button>
              </div>
              <div className="build-toolbar">
                <div className="build-toolbar-filters" role="group" aria-label="Additional build filters">
                  <Button
                    className={`buildable-filter ${showBuildableOnly ? "active" : ""}`}
                    size="sm"
                    variant="outline"
                    type="button"
                    disabled={showAllBuildNodes}
                    aria-pressed={showBuildableOnly}
                    onClick={() => setShowBuildableOnly((current) => !current)}
                  >
                    <Hammer aria-hidden="true" />
                    Buildable only
                    <span className="build-filter-count">{buildCatalog.buildableCount}</span>
                  </Button>
                  <Button
                    className={`buildable-filter never-built-filter ${showNeverBuiltOnly ? "active" : ""}`}
                    size="sm"
                    variant="outline"
                    type="button"
                    aria-pressed={showNeverBuiltOnly}
                    onClick={() => setShowNeverBuiltOnly((current) => !current)}
                  >
                    <Plus aria-hidden="true" />
                    Never Built
                    <span className="build-filter-count">{buildCatalog.neverBuiltCount}</span>
                  </Button>
                </div>
                <Button
                  className={`buildable-filter compact-view-filter ${compactBuildView ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={compactBuildView}
                  onClick={() => setCompactBuildView((current) => !current)}
                >
                  <Eye aria-hidden="true" />
                  Compact View
                </Button>
              </div>
              <div className={`build-list ${compactBuildView ? "compact" : ""}`}>
                {buildCatalog.items.map(({ item, canBuild, unlocked, limitReached }) => {
                  const Icon = item.icon;
                  const isNewBuild = newBuildKinds.has(item.kind);
                  const hasBeenBuilt = builtBuildKinds.has(item.kind);
                  const itemCategory = getBuildCategory(item.kind);
                  const CategoryIcon = itemCategory === "production"
                    ? Factory
                    : itemCategory === "logistics"
                      ? GitMerge
                      : Archive;
                  const categoryLabel = itemCategory === "production"
                    ? "Production"
                    : itemCategory === "logistics"
                      ? "Logistics"
                      : "Storage";
                  const previewNode = createBuildableNode(item.kind, `build-preview-${item.kind}`, 1);
                  const missingIngredients = removeBuildCosts
                    ? []
                    : item.recipe
                        .map((ingredient) => ({
                          ...ingredient,
                          missing: Math.max(
                            0,
                            ingredient.amount - buildMaterialAvailability[ingredient.type].total,
                          ),
                        }))
                        .filter((ingredient) => ingredient.missing > 0);
                  const requiredInputs = getBuildRequiredInputs(item.kind);
                  const productionOutputs = getBuildProductionOutputs(item.kind, previewNode);
                  if (compactBuildView) {
                    return (
                      <Tooltip key={item.kind}>
                        <TooltipTrigger asChild>
                          <div
                            className={`build-compact-entry ${canBuild ? "" : "unavailable"} ${unlocked ? "" : "locked"} ${isNewBuild ? "newly-buildable" : ""}`}
                            onPointerEnter={() => acknowledgeBuildKind(item.kind)}
                            onFocusCapture={() => acknowledgeBuildKind(item.kind)}
                          >
                            <span className="build-compact-icon"><Icon aria-hidden="true" /></span>
                            <strong className="build-compact-name">{item.title}</strong>
                            <span
                              className={`compact-never-built ${hasBeenBuilt ? "empty" : ""}`}
                              aria-hidden={hasBeenBuilt}
                            >
                              {hasBeenBuilt ? "\u00A0" : "Never built"}
                            </span>
                            <Button
                              className="build-card-action build-compact-action starter-hint-host"
                              size="sm"
                              disabled={!canBuild}
                              onClick={() => {
                                if (
                                  item.kind === "extractor" &&
                                  starterBuildHintStageRef.current === "extractor"
                                ) {
                                  starterBuildHintStageRef.current = "complete";
                                  setStarterBuildHintTarget(null);
                                }
                                buildNode(item.kind, item.recipe);
                              }}
                            >
                              {canBuild ? <Hammer aria-hidden="true" /> : null}
                              {canBuild ? "Build" : limitReached ? "Limit reached" : unlocked ? "Missing items" : "Locked"}
                              {item.kind === "extractor" && starterBuildHintTarget === "extractor" ? (
                                <StarterActionHint targetLabel="Extractor" />
                              ) : null}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          className="build-compact-tooltip"
                          side="right"
                          sideOffset={12}
                          collisionPadding={{ top: 24, right: 24, bottom: 24, left: 24 }}
                          avoidCollisions
                          sticky="always"
                        >
                          <div className="build-compact-tooltip-heading">
                            <span className="build-compact-tooltip-icon"><Icon aria-hidden="true" /></span>
                            <div>
                              <strong>{item.title}</strong>
                              <span>{(item.buildTime / 1000).toFixed(0)}s construction</span>
                            </div>
                          </div>
                          <p className="build-compact-tooltip-description">{item.description}</p>
                          <div className="build-compact-tooltip-grid">
                            <section className="build-compact-tooltip-section build-cost-spec">
                              <span className="build-spec-label">Build cost</span>
                              <div className="build-recipe">
                                {removeBuildCosts ? (
                                  <span className="build-cost ready free-build-cost">
                                    <Minus aria-hidden="true" />
                                    <b>Free</b>
                                    No materials deducted
                                  </span>
                                ) : item.recipe.map((ingredient) => {
                                  const availability = buildMaterialAvailability[ingredient.type];
                                  const ready = availability.total >= ingredient.amount;
                                  return (
                                    <span
                                      className={`build-cost ${ready ? "ready" : "missing"}`}
                                      key={ingredient.type}
                                    >
                                      <i style={{ background: RESOURCE_COLORS[ingredient.type] }} />
                                      <b>{ready ? ingredient.amount : `${availability.total}/${ingredient.amount}`}</b>
                                      {formatResourceType(ingredient.type)}
                                    </span>
                                  );
                                })}
                              </div>
                            </section>
                            <section className="build-compact-tooltip-section build-ports-spec">
                              <span className="build-spec-label">Connection ports</span>
                              <div className="build-port-list">
                                {previewNode.inputs.map((port) => (
                                  <span className="build-port input" key={port.id}>
                                    <em>IN</em>
                                    <i style={{ background: RESOURCE_COLORS[port.type] }} />
                                    <PortLabel label={port.label} />
                                  </span>
                                ))}
                                {previewNode.outputs.map((port) => (
                                  <span className="build-port output" key={port.id}>
                                    <em>OUT</em>
                                    <i style={{ background: RESOURCE_COLORS[port.type] }} />
                                    <PortLabel label={port.label} />
                                  </span>
                                ))}
                                {previewNode.inputs.length === 0 && previewNode.outputs.length === 0 ? (
                                  <span className="build-detail-empty">No connection ports</span>
                                ) : null}
                              </div>
                            </section>
                            <section className="build-compact-tooltip-section build-inputs-spec">
                              <span className="build-spec-label">Required inputs</span>
                              <div className="build-flow-list">
                                {requiredInputs.length > 0 ? requiredInputs.map((input) => (
                                  <span className="build-flow-item input" key={`${input.label}-${input.amount}`}>
                                    {input.type ? <i style={{ background: RESOURCE_COLORS[input.type] }} /> : null}
                                    {input.amount ? <b>{input.amount}</b> : null}
                                    {input.label}
                                  </span>
                                )) : <span className="build-detail-empty">None</span>}
                              </div>
                            </section>
                            <section className="build-compact-tooltip-section build-output-spec">
                              <span className="build-spec-label">Production output</span>
                              <div className="build-flow-list">
                                {productionOutputs.length > 0 ? productionOutputs.map((output) => (
                                  <span className="build-flow-item output" key={`${output.label}-${output.amount ?? "port"}`}>
                                    {output.type ? <i style={{ background: RESOURCE_COLORS[output.type] }} /> : null}
                                    {output.amount ? <b>{output.amount}</b> : null}
                                    <PortLabel label={output.label} />
                                  </span>
                                )) : <span className="build-detail-empty">None</span>}
                              </div>
                            </section>
                            {showAllBuildNodes ? (
                              <section className="build-compact-tooltip-section build-unlock-spec build-compact-unlock-spec">
                                <span className="build-spec-label">Unlock trigger</span>
                                <span className={`build-unlock-state ${unlocked ? "unlocked" : "locked"}`}>
                                  {unlocked ? "Unlocked" : "Locked"}
                                </span>
                                <p>{getBuildUnlockRequirement(item.kind)}</p>
                              </section>
                            ) : null}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return (
                    <div
                      className={`build-card ${canBuild ? "" : "unavailable"} ${unlocked ? "" : "locked"} ${isNewBuild ? "newly-buildable" : ""}`}
                      key={item.kind}
                      onPointerEnter={() => acknowledgeBuildKind(item.kind)}
                      onFocusCapture={() => acknowledgeBuildKind(item.kind)}
                    >
                      <span className="build-card-icon"><Icon aria-hidden="true" /></span>
                      <div className="build-card-copy">
                        <div className="build-card-heading">
                          <div className="build-card-title">
                            <strong>{item.title}</strong>
                            {isNewBuild ? <span className="new-build-badge">New</span> : null}
                          </div>
                          <span>{(item.buildTime / 1000).toFixed(0)}s build</span>
                        </div>
                        <span className="build-description">{item.description}</span>
                        <div className={`build-card-specs ${showAllBuildNodes ? "show-unlock-trigger" : ""}`}>
                          <section className="build-spec build-cost-spec" aria-label={`Build cost for ${item.title}`}>
                            <span className="build-spec-label">Build cost</span>
                            <div className="build-recipe">
                              {removeBuildCosts ? (
                                <span className="build-cost ready free-build-cost">
                                  <Minus aria-hidden="true" />
                                  <b>Free</b>
                                  Developer override
                                </span>
                              ) : item.recipe.map((ingredient) => {
                                const availability = buildMaterialAvailability[ingredient.type];
                                const available = availability.total;
                                const ready = available >= ingredient.amount;
                                const sourceSummary = `${availability.storage} in Storage nodes · ${availability.chests} in Wooden Chests · ${availability.production} completed outputs · ${availability.buffers} buffered in nodes`;
                                return (
                                  <span
                                    className={`build-cost ${ready ? "ready" : "missing"}`}
                                    key={ingredient.type}
                                    title={ready
                                      ? `${available} ${formatResourceType(ingredient.type)} available · ${sourceSummary}`
                                      : `${available} of ${ingredient.amount} ${formatResourceType(ingredient.type)} available · ${sourceSummary}`}
                                  >
                                    <i style={{ background: RESOURCE_COLORS[ingredient.type] }} />
                                    <b>{ready ? ingredient.amount : `${available}/${ingredient.amount}`}</b> {formatResourceType(ingredient.type)}
                                  </span>
                                );
                              })}
                            </div>
                            {missingIngredients.length > 0 ? (
                              <div className="build-shortage" role="status">
                                <strong>Missing</strong>
                                <span>
                                  {missingIngredients
                                    .map((ingredient) => `${ingredient.missing} ${formatResourceType(ingredient.type)}`)
                                    .join(" · ")}
                                </span>
                              </div>
                            ) : null}
                          </section>
                          <section className="build-spec build-ports-spec" aria-label={`Input and output ports for ${item.title}`}>
                            <span className="build-spec-label">Node ports</span>
                            <div className="build-port-list">
                              {previewNode.inputs.map((port) => (
                                <span className="build-port input" key={port.id}>
                                  <em>IN</em>
                                  <i style={{ background: RESOURCE_COLORS[port.type] }} />
                                  <PortLabel label={port.label} />
                                </span>
                              ))}
                              {previewNode.outputs.map((port) => (
                                <span className="build-port output" key={port.id}>
                                  <em>OUT</em>
                                  <i style={{ background: RESOURCE_COLORS[port.type] }} />
                                  <PortLabel label={port.label} />
                                </span>
                              ))}
                              {previewNode.outputs.length === 0 ? (
                                <span className="build-port none"><em>OUT</em> None</span>
                              ) : null}
                            </div>
                          </section>
                          {showAllBuildNodes ? (
                            <section className="build-spec build-category-spec" aria-label={`Category for ${item.title}`}>
                              <span className="build-spec-label">Category</span>
                              <span className={`build-category-value ${itemCategory}`}>
                                <CategoryIcon aria-hidden="true" />
                                {categoryLabel}
                              </span>
                            </section>
                          ) : null}
                          {showAllBuildNodes ? (
                            <section className="build-spec build-unlock-spec" aria-label={`Unlock trigger for ${item.title}`}>
                              <span className="build-spec-label">Unlock trigger</span>
                              <span className={`build-unlock-state ${unlocked ? "unlocked" : "locked"}`}>
                                {unlocked ? "Unlocked" : "Locked"}
                              </span>
                              <p>{getBuildUnlockRequirement(item.kind)}</p>
                            </section>
                          ) : null}
                        </div>
                      </div>
                      <div className="build-card-action-column">
                        <Button
                          className="build-card-action starter-hint-host"
                          size="sm"
                          disabled={!canBuild}
                          onClick={() => {
                            if (
                              item.kind === "extractor" &&
                              starterBuildHintStageRef.current === "extractor"
                            ) {
                              starterBuildHintStageRef.current = "complete";
                              setStarterBuildHintTarget(null);
                            }
                            buildNode(item.kind, item.recipe);
                          }}
                        >
                          {canBuild ? <Hammer aria-hidden="true" /> : null}
                          {canBuild ? "Build" : limitReached ? "Limit reached" : unlocked ? "Missing items" : "Locked"}
                          {item.kind === "extractor" && starterBuildHintTarget === "extractor" ? (
                            <StarterActionHint targetLabel="Extractor" />
                          ) : null}
                        </Button>
                        {!hasBeenBuilt ? (
                          <span className="never-built-indicator">Never built</span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                {buildCatalog.items.length === 0 ? (
                  <div className="build-empty-state">
                    <Hammer aria-hidden="true" />
                    <strong>
                      {showBuildableOnly
                        ? "Nothing in this category is buildable yet"
                        : showNeverBuiltOnly
                          ? "Every unlocked node type in this category has been placed"
                        : `No ${buildCategory === "all" ? "available" : buildCategory} machines yet`}
                    </strong>
                    <span>
                      {showBuildableOnly
                        ? "Produce or route more construction materials into node storage, then check again."
                        : showNeverBuiltOnly
                          ? "Disable Never Built to see building types you have already placed."
                        : "New machines will appear here as you progress."}
                    </span>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={journalOpen}
            onOpenChange={(open) => {
              setJournalOpen(open);
              if (open) setJournalAttention(false);
            }}
          >
            <DialogTrigger asChild>
              <Button
                className={`journal-trigger ${journalAttention ? "attention" : ""}`}
                size="sm"
                variant="outline"
                aria-label={journalAttention
                  ? `Journal, new discovery, ${journalEntries.length} nodes and ${journalAchievementEntries.length} achievements unlocked`
                  : `Journal, ${journalEntries.length} nodes and ${journalAchievementEntries.length} achievements unlocked`}
                title={journalAttention ? "New discovery recorded" : undefined}
              >
                <span className="journal-trigger-icon"><BookOpenText aria-hidden="true" /></span>
                <span className="journal-trigger-label">Journal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="journal-dialog topbar-modal">
              <DialogHeader className="journal-header topbar-modal-header">
                <div className="journal-title-mark"><BookOpenText aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Discovery Journal</DialogTitle>
                  <DialogDescription>
                    In case you forgot, or you&apos;re speedrunning.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="journal-summary" aria-live="polite">
                <span>Discovered nodes</span>
                <strong>{journalEntries.length} / {VISIBLE_BUILD_CATALOG.length}</strong>
              </div>
              <div className="journal-category-filters" role="group" aria-label="Filter journal by category">
                <Button
                  className={`journal-category-filter production ${journalCategory === "production" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={journalCategory === "production"}
                  onClick={() => setJournalCategory((current) => current === "production" ? "all" : "production")}
                >
                  <Factory aria-hidden="true" />
                  <span>Production</span>
                  <span className="journal-category-count">{journalCategoryCounts.production}</span>
                </Button>
                <Button
                  className={`journal-category-filter logistics ${journalCategory === "logistics" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={journalCategory === "logistics"}
                  onClick={() => setJournalCategory((current) => current === "logistics" ? "all" : "logistics")}
                >
                  <GitMerge aria-hidden="true" />
                  <span>Logistics</span>
                  <span className="journal-category-count">{journalCategoryCounts.logistics}</span>
                </Button>
                <Button
                  className={`journal-category-filter storage ${journalCategory === "storage" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={journalCategory === "storage"}
                  onClick={() => setJournalCategory((current) => current === "storage" ? "all" : "storage")}
                >
                  <Archive aria-hidden="true" />
                  <span>Storage</span>
                  <span className="journal-category-count">{journalCategoryCounts.storage}</span>
                </Button>
                <Button
                  className={`journal-category-filter achievements ${journalCategory === "achievements" ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={journalCategory === "achievements"}
                  onClick={() => setJournalCategory((current) => current === "achievements" ? "all" : "achievements")}
                >
                  <Trophy aria-hidden="true" />
                  <span>Achievements</span>
                  <span className="journal-category-count">{journalAchievementEntries.length}</span>
                </Button>
              </div>
              <div className="journal-list" aria-label="Unlocked node and achievement timeline">
                {visibleJournalAchievements.map(({ id, title, description, flavorText, icon: AchievementIcon }) => (
                  <article className="journal-entry journal-achievement-entry" key={`achievement-${id}`}>
                    <div className="journal-timeline journal-achievement-timeline" aria-hidden="true">
                      <span><Trophy /></span>
                    </div>
                    <span className="journal-entry-icon achievement">
                      <AchievementIcon aria-hidden="true" />
                    </span>
                    <div className="journal-entry-copy">
                      <span>Achievement</span>
                      <strong>{title}</strong>
                      <small>{description}</small>
                      <em>{flavorText}</em>
                    </div>
                    <div className="journal-entry-time journal-achievement-status">
                      <span>Unlocked</span>
                      <strong>Shiny!</strong>
                    </div>
                  </article>
                ))}
                {visibleJournalEntries.map(({ item, unlockedAt }) => {
                  const Icon = item.icon;
                  const category = getBuildCategory(item.kind);
                  const discoveryIndex = journalEntries.findIndex(
                    (entry) => entry.item.kind === item.kind,
                  );
                  return (
                    <article className="journal-entry" key={item.kind}>
                      <div className="journal-timeline" aria-hidden="true">
                        <span>{journalEntries.length - discoveryIndex}</span>
                      </div>
                      <span className={`journal-entry-icon ${category}`}>
                        <Icon aria-hidden="true" />
                      </span>
                      <div className="journal-entry-copy">
                        <span>{category}</span>
                        <strong>{item.title}</strong>
                        <small>{getBuildUnlockRequirement(item.kind)}</small>
                      </div>
                      <time
                        className="journal-entry-time"
                        dateTime={`PT${Math.floor(unlockedAt / 1000)}S`}
                        title={`${Math.floor(unlockedAt / 1000)} seconds after game start`}
                      >
                        <span>Unlocked</span>
                        <strong>+{formatUnlockTime(unlockedAt)}</strong>
                      </time>
                    </article>
                  );
                })}
                {!journalHasVisibleEntries ? (
                  <div className="journal-empty-state">
                    {journalCategory === "achievements"
                      ? <Trophy aria-hidden="true" />
                      : <BookOpenText aria-hidden="true" />}
                    <strong>No {journalCategory} discoveries yet</strong>
                    <span>{journalCategory === "achievements"
                      ? "Unlocked achievements will be recorded here."
                      : "New nodes will be recorded here as they unlock."}</span>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
            <DialogTrigger asChild>
              <Button
                className="options-trigger"
                size="sm"
                variant="outline"
                aria-label="Options"
              >
                <Menu aria-hidden="true" />
                <span className="options-trigger-label">Options</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="options-dialog topbar-modal">
              <DialogHeader className="options-dialog-header topbar-modal-header">
                <div className="options-title-mark"><Menu aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Options</DialogTitle>
                  <DialogDescription>
                    No funny business going on here, move along.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="options-menu" role="group" aria-label="Game options">
                <button
                  type="button"
                  className="options-menu-item save-option"
                  onClick={() => {
                    setSaveOpen(true);
                  }}
                >
                  <span className="options-menu-icon"><HardDrive aria-hidden="true" /></span>
                  <span className="options-menu-copy">
                    <strong>Save / Load</strong>
                    <small>Open the existing local save slots.</small>
                  </span>
                  <span className="options-menu-action">Open</span>
                </button>
                <button
                  type="button"
                  className="options-menu-item shortcuts-option"
                  onClick={() => {
                    setShortcutsOpen(true);
                  }}
                >
                  <span className="options-menu-icon"><Keyboard aria-hidden="true" /></span>
                  <span className="options-menu-copy">
                    <strong>Commands</strong>
                    <small>View every keyboard command and what it does.</small>
                  </span>
                  <span className="options-menu-action">Open</span>
                </button>
                <button
                  type="button"
                  className="options-menu-item recipes-option"
                  onClick={() => {
                    setRecipesOpen(true);
                  }}
                >
                  <span className="options-menu-icon"><FlaskConical aria-hidden="true" /></span>
                  <span className="options-menu-copy">
                    <strong>Recipes</strong>
                    <small>View every current recipe and the node that constructs it.</small>
                  </span>
                  <span className="options-menu-action">Open</span>
                </button>
                <button
                  type="button"
                  className={`options-menu-item wire-animation-option ${wireAnimationsEnabled ? "enabled" : "disabled"}`}
                  aria-pressed={wireAnimationsEnabled}
                  aria-label={`Wire animations, ${wireAnimationsEnabled ? "enabled" : "disabled"}`}
                  onClick={toggleWireAnimations}
                >
                  <span className="options-menu-icon"><Cable aria-hidden="true" /></span>
                  <span className="options-menu-copy">
                    <strong>Wire Animations</strong>
                    <small>Show transfer glows without changing item or power flow.</small>
                  </span>
                  <span className="options-toggle-state">
                    <i aria-hidden="true" />
                    {wireAnimationsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
                <div className="shortcut-bar-options-row" role="group" aria-label="Shortcut bar visibility">
                  {(["shortcutBar1", "shortcutBar2", "shortcutBar3"] as const).map((barId, index) => {
                    const bar = shortcutBars[barId];
                    const label = `Shortcut Bar ${index + 1}`;
                    return (
                      <button
                        type="button"
                        className={`options-menu-item shortcut-bar-option ${bar.visible ? "enabled" : "disabled"}`}
                        aria-pressed={bar.visible}
                        aria-label={`${label}, ${bar.visible ? "visible" : "hidden"}. Toggle visibility.`}
                        key={barId}
                        onClick={() => toggleShortcutBarVisibility(barId)}
                      >
                        <span className="options-menu-icon"><Menu aria-hidden="true" /></span>
                        <span className="options-menu-copy">
                          <strong>{label}</strong>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="options-menu-item achievements-option"
                  onClick={() => {
                    setAchievementFlavorIndex(
                      achievementOpenCountRef.current % EMPTY_ACHIEVEMENT_FLAVOR_TEXTS.length,
                    );
                    achievementOpenCountRef.current += 1;
                    setAchievementsOpen(true);
                  }}
                >
                  <span className="options-menu-icon"><Trophy aria-hidden="true" /></span>
                  <span className="options-menu-copy">
                    <strong>Achievements</strong>
                    <small>Oooh, shiny.</small>
                  </span>
                  <span className="options-menu-action">Open</span>
                </button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={achievementsOpen} onOpenChange={setAchievementsOpen}>
            <DialogContent className="achievements-dialog topbar-modal">
              <DialogHeader className="achievements-dialog-header topbar-modal-header">
                <div className="achievements-title-mark"><Trophy aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Achievements</DialogTitle>
                  <DialogDescription>
                    {unlockedAchievements.size === 0
                      ? EMPTY_ACHIEVEMENT_FLAVOR_TEXTS[achievementFlavorIndex]
                      : "Oooh, shiny."}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div
                className={`achievements-list ${unlockedAchievements.size === 0 ? "empty" : ""}`}
                aria-label={unlockedAchievements.size === 0 ? "No achievements available yet" : "Unlocked achievements"}
              >
                {unlockedAchievements.has("oops") ? (
                  <article className="achievement-entry unlocked">
                    <span className="achievement-entry-icon"><Trophy aria-hidden="true" /></span>
                    <span className="achievement-entry-copy">
                      <small>Achievement unlocked</small>
                      <strong>Oops.</strong>
                      <span>Create a Black Hole by rapidly clicking an empty part of the field.</span>
                      <em>Did I do thaaaaat?</em>
                    </span>
                  </article>
                ) : null}
                {unlockedAchievements.has("handHolding") ? (
                  <article className="achievement-entry unlocked">
                    <span className="achievement-entry-icon"><BookOpenText aria-hidden="true" /></span>
                    <span className="achievement-entry-copy">
                      <small>Achievement unlocked</small>
                      <strong>Hand Holding</strong>
                      <span>See the final tutorial after completing every previous tutorial.</span>
                      <em>You are either very deliberate, or very slow.  Or both?</em>
                    </span>
                  </article>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
            <DialogContent className="shortcuts-dialog">
              <DialogHeader className="shortcuts-dialog-header">
                <div className="shortcuts-title-mark"><Keyboard aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Commands</DialogTitle>
                  <DialogDescription>
                    Push the right buttons, preferably in the right order.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="shortcut-category-filters" role="group" aria-label="Filter commands by category">
                {KEYBOARD_SHORTCUT_GROUPS.map((group) => {
                  const className = group === "General"
                    ? "general"
                    : group === "Control groups"
                      ? "control-groups"
                      : "node";
                  const Icon = group === "General"
                    ? Compass
                    : group === "Control groups"
                      ? Split
                      : Factory;
                  const isActive = keyboardShortcutFilter === group;

                  return (
                    <Button
                      className={`shortcut-category-filter ${className} ${isActive ? "active" : ""}`}
                      size="sm"
                      variant="outline"
                      type="button"
                      aria-pressed={isActive}
                      key={group}
                      onClick={() => {
                        setKeyboardShortcutFilter((current) => current === group ? "all" : group);
                        window.requestAnimationFrame(() => {
                          if (shortcutsListRef.current) shortcutsListRef.current.scrollTop = 0;
                        });
                      }}
                    >
                      <Icon aria-hidden="true" />
                      <span>{group}</span>
                      <span className="shortcut-category-count">
                        {KEYBOARD_SHORTCUTS.filter((shortcut) => shortcut.group === group).length}
                      </span>
                    </Button>
                  );
                })}
              </div>
              <div className="shortcut-command-groups" ref={shortcutsListRef}>
                {KEYBOARD_SHORTCUT_GROUPS.filter(
                  (group) => keyboardShortcutFilter === "all" || group === keyboardShortcutFilter,
                ).map((group) => (
                  <section className="shortcut-command-group" key={group}>
                    <h3>{group}</h3>
                    <div className="shortcut-command-list">
                      {KEYBOARD_SHORTCUTS.filter((shortcut) => shortcut.group === group).map((shortcut) => (
                        <article className="shortcut-command" key={shortcut.name}>
                          <div className="shortcut-command-copy">
                            <strong>{shortcut.name}</strong>
                            <span>{shortcut.description}</span>
                          </div>
                          <div
                            className="shortcut-key-combo"
                            aria-label={`Command: ${shortcut.keys.join(" plus ")}`}
                          >
                            {shortcut.keys.map((key, keyIndex) => (
                              <span className="shortcut-key-part" aria-hidden="true" key={key}>
                                {keyIndex > 0 ? <i>+</i> : null}
                                <kbd>{key}</kbd>
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={recipesOpen} onOpenChange={setRecipesOpen}>
            <DialogContent className="recipes-dialog">
              <DialogHeader className="recipes-dialog-header">
                <div className="recipes-title-mark"><FlaskConical aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Recipes</DialogTitle>
                  <DialogDescription>
                    A little of this, a little of that.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="recipe-node-filters" role="group" aria-label="Filter recipes by production node">
                <button
                  type="button"
                  className={`recipe-node-filter ${recipeNodeFilters.length === 0 ? "selected" : ""}`}
                  aria-pressed={recipeNodeFilters.length === 0}
                  onClick={() => setRecipeNodeFilters([])}
                >
                  All
                </button>
                {RECIPE_GUIDE_GROUPS.map((group) => {
                  const GroupIcon = group.recipes[0].icon;
                  const selected = recipeNodeFilters.includes(group.node);
                  return (
                    <button
                      type="button"
                      className={`recipe-node-filter ${selected ? "selected" : ""}`}
                      aria-pressed={selected}
                      key={group.node}
                      onClick={() => setRecipeNodeFilters((current) => (
                        current.includes(group.node)
                          ? current.filter((node) => node !== group.node)
                          : [...current, group.node]
                      ))}
                    >
                      <GroupIcon aria-hidden="true" />
                      {group.node}
                    </button>
                  );
                })}
              </div>
              <div className="recipe-guide-groups" aria-label="Production recipes" ref={recipesListRef}>
                {RECIPE_GUIDE_GROUPS.filter((group) => (
                  recipeNodeFilters.length === 0 || recipeNodeFilters.includes(group.node)
                )).map((group) => (
                  <section className="recipe-guide-group" key={group.node}>
                    <div className="recipe-guide-group-heading">
                      <strong>{group.node}</strong>
                      <span>{group.recipes.length} {group.recipes.length === 1 ? "recipe" : "recipes"}</span>
                    </div>
                    <div className="recipe-guide-list">
                      {group.recipes.map((recipe) => {
                        const RecipeIcon = recipe.icon;
                        return (
                          <article
                            className="recipe-guide-card"
                            key={recipe.id}
                            style={{ "--recipe-color": recipe.color } as React.CSSProperties}
                          >
                            <span className="recipe-guide-icon"><RecipeIcon aria-hidden="true" /></span>
                            <div className="recipe-guide-copy">
                              <div className="recipe-guide-title">
                                <strong>{recipe.title}</strong>
                                <span>{recipe.node}</span>
                              </div>
                              <div className="recipe-guide-formula" aria-label={recipe.summary}>
                                <span className="recipe-guide-materials inputs">
                                  {recipe.inputs.map((input, inputIndex) => (
                                    <span className="recipe-guide-material" key={`${recipe.id}-${input.type}-${inputIndex}`}>
                                      <i style={{ background: RESOURCE_COLORS[input.type] }} />
                                      <b>{input.amount}</b>
                                      {input.label}
                                    </span>
                                  ))}
                                </span>
                                <span className="recipe-guide-arrow" aria-hidden="true">→</span>
                                <span className="recipe-guide-material output">
                                  <i style={{ background: RESOURCE_COLORS[recipe.output.type] }} />
                                  <b>{recipe.output.amount}</b>
                                  {recipe.output.label}
                                </span>
                              </div>
                            </div>
                            {recipe.duration ? (
                              <span className="recipe-guide-duration">{formatCycleDuration(recipe.duration)}</span>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
            <DialogContent className="save-dialog">
              <DialogHeader className="save-dialog-header">
                <div className="save-title-mark"><HardDrive aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Save / Load</DialogTitle>
                  <DialogDescription>
                    Time travel, minus the paradoxes.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="save-local-note">
                <HardDrive aria-hidden="true" />
                <span>Saves stay on this device and browser. They are not uploaded.</span>
              </div>
              <div className="save-slot-list" aria-label="Save game slots">
                <article
                  className={`save-slot-card temporary-save-card ${temporarySave ? "occupied" : "empty"}`}
                >
                  <button
                    type="button"
                    className="save-slot-index temporary temporary-save-frequency-trigger"
                    aria-label={`Change temporary save frequency, currently ${describeTemporarySaveFrequency(temporarySaveFrequencyMinutes).toLowerCase()}`}
                    onClick={() => {
                      setTemporarySaveFrequencyDraft(temporarySaveFrequencyMinutes);
                      setTemporarySaveFrequencyOpen(true);
                    }}
                  >
                    <span>Auto</span>
                    <strong>{formatTemporarySaveFrequency(temporarySaveFrequencyMinutes)}</strong>
                  </button>
                  <div className="save-slot-copy">
                    <label>Temporary save</label>
                    <div className="temporary-save-name">
                      {temporarySave?.name ?? "Awaiting first temporary save"}
                    </div>
                    {temporarySave ? (
                      <p>
                        <span className="save-slot-status">Available</span>
                        <time dateTime={temporarySave.savedAt}>
                          {formatSaveDate(temporarySave.savedAt)}
                        </time>
                      </p>
                    ) : (
                      <p>
                        <span className="save-slot-status empty">Pending</span>
                        {describeTemporarySaveFrequency(temporarySaveFrequencyMinutes)} of active play
                      </p>
                    )}
                  </div>
                  <div className="save-slot-actions">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!temporarySave}
                      onClick={() => {
                        setPendingLoadSlot("temporary");
                        setLoadConfirmOpen(true);
                      }}
                    >
                      <FolderOpen aria-hidden="true" />
                      Load
                    </Button>
                  </div>
                  <div className="temporary-save-copy-actions">
                    <span>Copy to permanent slot</span>
                    {saveSlots.map((slot, slotIndex) => (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={!temporarySave}
                        onClick={() => copyTemporarySaveToSlot(slotIndex)}
                        key={`temporary-copy-${slotIndex}`}
                      >
                        <Save aria-hidden="true" />
                        {slot ? `Overwrite Slot ${slotIndex + 1}` : `Slot ${slotIndex + 1}`}
                      </Button>
                    ))}
                  </div>
                </article>
                {saveSlots.map((slot, slotIndex) => (
                  <article
                    className={`save-slot-card ${slot ? "occupied" : "empty"}`}
                    key={`save-slot-${slotIndex}`}
                  >
                    <div className="save-slot-index" aria-hidden="true">
                      <span>Slot</span>
                      <strong>{slotIndex + 1}</strong>
                    </div>
                    <div className="save-slot-copy">
                      <label htmlFor={`save-name-${slotIndex}`}>Save name</label>
                      <input
                        id={`save-name-${slotIndex}`}
                        className="save-name-input"
                        value={saveNames[slotIndex] ?? ""}
                        maxLength={40}
                        spellCheck="false"
                        placeholder={`Save ${slotIndex + 1}`}
                        onChange={(event) => {
                          const value = event.target.value;
                          setSaveNames((current) => current.map(
                            (name, index) => index === slotIndex ? value : name,
                          ));
                        }}
                        onKeyDown={(event) => event.stopPropagation()}
                      />
                      {slot ? (
                        <p>
                          <span className="save-slot-status">Saved</span>
                          <time dateTime={slot.savedAt}>{formatSaveDate(slot.savedAt)}</time>
                        </p>
                      ) : (
                        <p><span className="save-slot-status empty">Empty</span>No saved game in this slot</p>
                      )}
                    </div>
                    <div className="save-slot-actions">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveGameToSlot(slotIndex)}
                      >
                        <Save aria-hidden="true" />
                        {slot ? "Overwrite" : "Save"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!slot}
                        onClick={() => {
                          setPendingLoadSlot(slotIndex);
                          setLoadConfirmOpen(true);
                        }}
                      >
                        <FolderOpen aria-hidden="true" />
                        Load
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={temporarySaveFrequencyOpen}
            onOpenChange={(open) => {
              setTemporarySaveFrequencyOpen(open);
              if (open) setTemporarySaveFrequencyDraft(temporarySaveFrequencyMinutes);
            }}
          >
            <DialogContent className="temporary-save-frequency-dialog">
              <DialogHeader>
                <div className="temporary-save-frequency-title">
                  <span><Save aria-hidden="true" /></span>
                  <div>
                    <DialogTitle>Temporary Save Frequency</DialogTitle>
                    <DialogDescription>Set it and forget it.</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="temporary-save-frequency-control">
                <strong>{describeTemporarySaveFrequency(temporarySaveFrequencyDraft)}</strong>
                <input
                  type="range"
                  min={MIN_TEMPORARY_SAVE_FREQUENCY_MINUTES}
                  max={MAX_TEMPORARY_SAVE_FREQUENCY_MINUTES}
                  step={1}
                  value={temporarySaveFrequencyDraft}
                  aria-label="Temporary save frequency in minutes"
                  aria-valuetext={describeTemporarySaveFrequency(temporarySaveFrequencyDraft)}
                  onChange={(event) => {
                    setTemporarySaveFrequencyDraft(Number(event.target.value));
                  }}
                />
                <div>
                  <span>Every minute</span>
                  <span>Once an hour</span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTemporarySaveFrequencyOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={applyTemporarySaveFrequency}>
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={rapidClickWarningOpen} onOpenChange={setRapidClickWarningOpen}>
            <DialogContent className="rapid-click-warning-dialog" aria-describedby={undefined}>
              <DialogTitle>Hey, stop that.</DialogTitle>
            </DialogContent>
          </Dialog>
          <Dialog open={starterTutorialOutroOpen} onOpenChange={setStarterTutorialOutroOpen}>
            <DialogContent className="starter-tutorial-outro-dialog">
              <div className="starter-tutorial-outro-celebration" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <span
                    key={index}
                    style={{
                      "--outro-angle": `${index * (360 / 14)}deg`,
                      "--outro-delay": `${index * -170}ms`,
                    } as React.CSSProperties}
                  >
                    {index % 4 === 0 ? "♥" : index % 3 === 0 ? "★" : "✦"}
                  </span>
                ))}
              </div>
              <DialogHeader className="starter-tutorial-outro-header">
                <div className="starter-tutorial-outro-mark" aria-hidden="true">
                  <span>☀</span>
                </div>
                <DialogTitle>You&apos;ve got this.</DialogTitle>
                <DialogDescription>
                  {"Well that's about it, friend.  Collect stuff, build nodes, connect nodes, make new stuff.  It's about time for my smoothie break so I will leave the rest up to you.  Good luck!"}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="starter-tutorial-outro-footer">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStarterTutorialOutroOpen(false)}
                >
                  Cheers!
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={devOpen} onOpenChange={setDevOpen}>
            <DialogTrigger asChild>
              <Button
                className="dev-trigger"
                size="sm"
                variant="outline"
                aria-label="Developer tools"
              >
                <Atom aria-hidden="true" />
                <span className="dev-trigger-label">Dev</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="dev-dialog topbar-modal">
              <DialogHeader className="dev-dialog-header topbar-modal-header">
                <div className="dev-title-mark"><Atom aria-hidden="true" /></div>
                <div>
                  <DialogTitle>Developer tools</DialogTitle>
                  <DialogDescription>
                    Temporary controls for testing progression and construction.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="dev-note">
                <Atom aria-hidden="true" />
                <span>Changes apply to the current game and are included in new saves.</span>
              </div>
              <div className="dev-controls">
                <Button
                  className={`build-inspector-toggle ${showAllBuildNodes ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={showAllBuildNodes}
                  onClick={() => {
                    setShowAllBuildNodes((current) => {
                      const next = !current;
                      if (next) {
                        setBuildCategory("all");
                        setShowBuildableOnly(false);
                      }
                      return next;
                    });
                  }}
                >
                  <Eye aria-hidden="true" />
                  <span>
                    <strong>Show all nodes</strong>
                    <small>Show locked nodes and unlock triggers</small>
                  </span>
                  <em>{showAllBuildNodes ? "Active" : "Temporary"}</em>
                </Button>
                <Button
                  className="build-unlock-all"
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={allBuildNodesUnlocked}
                  onClick={unlockAllNodesForDevelopment}
                >
                  <LockOpen aria-hidden="true" />
                  <span>
                    <strong>{allBuildNodesUnlocked ? "All nodes unlocked" : "Unlock all nodes"}</strong>
                    <small>Reveal every node for this game</small>
                  </span>
                  <em>{allBuildNodesUnlocked ? "Unlocked" : "Developer"}</em>
                </Button>
                <Button
                  className="build-unlock-all research-unlock-all"
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={allResearchUnlocked}
                  onClick={unlockAllResearchForDevelopment}
                >
                  <FlaskConical aria-hidden="true" />
                  <span>
                    <strong>{allResearchUnlocked ? "All research unlocked" : "Unlock all research"}</strong>
                    <small>Complete every research technology instantly</small>
                  </span>
                  <em>{allResearchUnlocked ? "Unlocked" : "Developer"}</em>
                </Button>
                <Button
                  className={`build-cost-toggle ${removeBuildCosts ? "active" : ""}`}
                  size="sm"
                  variant="outline"
                  type="button"
                  aria-pressed={removeBuildCosts}
                  onClick={() => setRemoveBuildCosts((current) => !current)}
                >
                  <Minus aria-hidden="true" />
                  <span>
                    <strong>Remove Build Costs</strong>
                    <small>Build unlocked nodes without consuming stored materials</small>
                  </span>
                  <em>{removeBuildCosts ? "Enabled" : "Disabled"}</em>
                </Button>
                <Button
                  className="build-cost-toggle"
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={unlockAllMapNodesForDevelopment}
                >
                  <MapIcon aria-hidden="true" />
                  <span>
                    <strong>Unlock All Map Nodes</strong>
                    <small>Immediately unlock every map node without spending Map Points</small>
                  </span>
                  <em>Run</em>
                </Button>
                <Button
                  className="build-inventory-enable"
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={revealedBuildKinds.has("inventorySource")}
                  onClick={() => enableTemporaryNode("inventorySource")}
                >
                  <Plus aria-hidden="true" />
                  <span>
                    <strong>{revealedBuildKinds.has("inventorySource") ? "Inventory enabled" : "Enable Inventory node"}</strong>
                    <small>Reveal for this game</small>
                  </span>
                  <em>{revealedBuildKinds.has("inventorySource") ? "Enabled" : "Temporary"}</em>
                </Button>
                <Button
                  className="build-storage-enable"
                  size="sm"
                  variant="outline"
                  type="button"
                  disabled={revealedBuildKinds.has("storage")}
                  onClick={() => enableTemporaryNode("storage")}
                >
                  <HardDrive aria-hidden="true" />
                  <span>
                    <strong>{revealedBuildKinds.has("storage") ? "Storage enabled" : "Enable Storage node"}</strong>
                    <small>Reveal for this game</small>
                  </span>
                  <em>{revealedBuildKinds.has("storage") ? "Enabled" : "Temporary"}</em>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="shortcut-bar-layer" aria-label="Node shortcut bars">
        {SHORTCUT_BAR_IDS.map((barId, index) => {
          const group = shortcutBarGroups.find((candidate) => candidate.barIds.includes(barId));
          const snapReady = Boolean(
            shortcutBarSnapTarget && (
              shortcutBarSnapTarget.movingBarId === barId ||
              shortcutBarSnapTarget.targetBarId === barId
            ),
          );
          return (
            <NodeShortcutBar
              key={barId}
              name={`Shortcut Bar ${index + 1}`}
              config={shortcutBars[barId]}
              options={shortcutNodeOptions}
              placementActive={Boolean(placingNodeId)}
              grouped={Boolean(group)}
              snapReady={snapReady}
              showGroupTooltip={!skipShortcutBarGroupTooltip}
              onBuild={buildFromShortcut}
              onBuildDragEnd={finishShortcutBuildDrag}
              onBuildDragCancel={cancelNodeInHand}
              onChange={(updater) => updateShortcutBar(barId, updater)}
              onElementRef={(element) => { shortcutBarElementsRef.current[barId] = element; }}
              onMoveStart={() => beginShortcutBarMove(barId)}
              onMove={(deltaX, deltaY) => moveShortcutBar(barId, deltaX, deltaY)}
              onMoveEnd={(commit) => finishShortcutBarMove(barId, commit)}
              onRotate={() => rotateShortcutBar(barId)}
              onResizeEnd={() => finishShortcutBarResize(barId)}
              onSeparate={() => separateShortcutBarGroup(barId)}
              onDisableGroupTooltip={() => setSkipShortcutBarGroupTooltip(true)}
            />
          );
        })}
      </div>

      <AlertDialog
        open={loadConfirmOpen}
        onOpenChange={(open) => {
          setLoadConfirmOpen(open);
          if (!open) setPendingLoadSlot(null);
        }}
      >
        <AlertDialogContent className="load-save-dialog">
          <AlertDialogHeader>
            <AlertDialogMedia className="load-save-dialog-icon">
              <FolderOpen aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Load {pendingLoadSave?.name ?? "this save"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your current unsaved progress will be replaced
              {pendingLoadSave ? ` by the game saved ${formatSaveDate(pendingLoadSave.savedAt)}` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={pendingLoadSlot === null || !pendingLoadSave}
              onClick={() => {
                if (pendingLoadSlot !== null) loadGameFromSlot(pendingLoadSlot);
              }}
            >
              <FolderOpen aria-hidden="true" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={controlGroupOnboardingOpen} onOpenChange={setControlGroupOnboardingOpen}>
        <DialogContent className="control-group-color-dialog control-group-onboarding-dialog">
          <DialogHeader>
            <div className="control-group-dialog-icon" aria-hidden="true">
              <Palette />
            </div>
            <DialogTitle>Create a Control Group</DialogTitle>
            <DialogDescription className="control-group-flavor-text">
              You don&apos;t have to carry the whole team, well maybe you do.
            </DialogDescription>
          </DialogHeader>
          <label className="inventory-overflow-suppression">
            <Checkbox
              checked={suppressControlGroupTutorial}
              onCheckedChange={(checked) => {
                const shouldSuppress = checked === true;
                setSuppressControlGroupTutorial(shouldSuppress);
                controlGroupTutorialSuppressedRef.current = shouldSuppress;
              }}
            />
            <span><strong>Don&apos;t show this again</strong></span>
          </label>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setControlGroupOnboardingOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={controlGroupColorOpen}
        onOpenChange={(open) => {
          setControlGroupColorOpen(open);
          if (!open) setPendingControlGroupNodeIds([]);
        }}
      >
        <DialogContent className="control-group-color-dialog">
          <DialogHeader>
            <div className="control-group-dialog-icon" aria-hidden="true">
              <Palette />
            </div>
            <DialogTitle>Choose a control group color</DialogTitle>
            <DialogDescription>
              {pendingControlGroupNodeIds.length} nodes will select and move together. Choose one of ten colorblind-friendly identifiers.
            </DialogDescription>
          </DialogHeader>
          <div className="control-group-palette" role="group" aria-label="Control group colors">
            {CONTROL_GROUP_COLORS.map((color) => (
              <button
                type="button"
                className="control-group-color-option"
                key={color.name}
                style={{ "--control-group-choice": color.value } as React.CSSProperties}
                aria-label={`Create ${color.name} control group`}
                onClick={() => createControlGroup(color)}
              >
                <span aria-hidden="true" />
                <strong>{color.name}</strong>
              </button>
            ))}
          </div>
          <div className="control-group-shortcuts" aria-label="Control group controls">
            <span><kbd>Click</kbd> select and move group</span>
            <span><kbd>Double-click</kbd> control one node</span>
            <span><kbd>Right-click</kbd> disband</span>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setControlGroupColorOpen(false);
                setPendingControlGroupNodeIds([]);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={disbandControlGroupOpen}
        onOpenChange={(open) => {
          setDisbandControlGroupOpen(open);
          if (!open) setPendingDisbandControlGroupId(null);
        }}
      >
        <AlertDialogContent
          className="destroy-dialog control-group-disband-dialog"
          style={{
            "--control-group-color": pendingDisbandControlGroup?.color ?? "#bab0ac",
          } as React.CSSProperties}
        >
          <AlertDialogHeader>
            <AlertDialogMedia className="destroy-dialog-icon control-group-disband-icon">
              <Unplug aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Disband this control group?</AlertDialogTitle>
            <AlertDialogDescription>
              The {pendingDisbandControlGroup?.colorName ?? "selected"} group contains {pendingDisbandControlGroup?.nodeIds.length ?? 0} nodes. Its nodes, cables, and positions will not be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="control-group-disband-summary">
            <span aria-hidden="true" />
            <strong>{pendingDisbandControlGroup?.colorName ?? "Control"} group</strong>
            <small>{pendingDisbandControlGroup?.nodeIds.length ?? 0} nodes</small>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                if (!pendingDisbandControlGroupId) {
                  event.preventDefault();
                  return;
                }
                disbandControlGroup(pendingDisbandControlGroupId);
              }}
            >
              <Unplug aria-hidden="true" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={inventoryOverflowDialogOpen}
        onOpenChange={(open) => {
          setInventoryOverflowDialogOpen(open);
          if (!open) {
            inventoryOverflowActionRef.current = null;
            setInventoryOverflowPrompt(null);
            setSuppressFutureInventoryOverflowWarnings(false);
          }
        }}
      >
        <AlertDialogContent className="destroy-dialog material-loss inventory-overflow-dialog">
          <AlertDialogHeader>
            <AlertDialogMedia className="destroy-dialog-icon">
              <TriangleAlert aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {inventoryOverflowPrompt?.title ?? "Storage capacity exceeded"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {inventoryOverflowPrompt?.description ??
                "Available storage nodes cannot hold all materials from this action. Overflow will be permanently destroyed if you proceed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="destroy-loss" role="alert" aria-label="Materials that will be destroyed">
            <span className="destroy-loss-heading">
              <TriangleAlert aria-hidden="true" />
              Materials permanently lost
            </span>
            <div className="destroy-refund-list">
              {inventoryOverflowPrompt?.loss.map(([type, amount]) => (
                <span className="destroy-refund-item lost" key={type}>
                  <i style={{ background: RESOURCE_COLORS[type] }} />
                  <strong>{amount}</strong> {formatResourceType(type)}
                </span>
              ))}
            </div>
            <p>This cannot be undone.</p>
          </div>
          <label className="inventory-overflow-suppression">
            <Checkbox
              checked={suppressFutureInventoryOverflowWarnings}
              onCheckedChange={(checked) =>
                setSuppressFutureInventoryOverflowWarnings(checked === true)
              }
            />
            <span>
              <strong>
                {inventoryOverflowPrompt?.suppressionLabel ??
                  "Don’t show this warning again and automatically destroy excess materials"}
              </strong>
              <small>
                {inventoryOverflowPrompt?.suppressionDescription ??
                  "Future overflow actions will transfer everything that fits and permanently destroy only the excess."}
              </small>
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmInventoryOverflow}>
              <TriangleAlert aria-hidden="true" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={destroyDialogOpen}
        onOpenChange={(open) => {
          setDestroyDialogOpen(open);
          if (!open) {
            setPendingDeletionIsHighlightedGroup(false);
            setSuppressFutureNodeDestructionWarnings(false);
          }
        }}
      >
        <AlertDialogContent
          className="destroy-dialog"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            destroyConfirmButtonRef.current?.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogMedia className="destroy-dialog-icon">
              <Trash2 aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {pendingDeletionIsHighlightedGroup
                ? `Delete all ${pendingDeletionDetails?.count ?? 0} highlighted nodes?`
                : pendingDeletionDetails?.count === 1
                ? `Destroy ${pendingDeletionDetails.title}?`
                : `Destroy ${pendingDeletionDetails?.title ?? "selected nodes"}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="node-destruction-flavor">
              Oh NODE, not me! Choose the other one over there!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="inventory-overflow-suppression node-destruction-suppression">
            <Checkbox
              checked={suppressFutureNodeDestructionWarnings}
              onCheckedChange={(checked) =>
                setSuppressFutureNodeDestructionWarnings(checked === true)
              }
            />
            <span>
              <strong>Never show again</strong>
              <small>Future node destructions will be approved automatically.</small>
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              ref={destroyConfirmButtonRef}
              onClick={(event) => {
                const deleted = destroyNodes(pendingDeletionNodeIds);
                if (!deleted) {
                  event.preventDefault();
                  return;
                }
                if (suppressFutureNodeDestructionWarnings) {
                  setAlwaysApproveNodeDestruction(true);
                }
              }}
            >
              <Trash2 aria-hidden="true" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={connectionDeleteDialogOpen}
        onOpenChange={(open) => {
          setConnectionDeleteDialogOpen(open);
          if (!open) {
            setPendingDeletionConnectionId(null);
            setSelectedConnection(null);
            setSuppressFutureConnectionDeleteWarnings(false);
          }
        }}
      >
        <AlertDialogContent
          className="destroy-dialog material-loss connection-delete-dialog"
          style={{
            "--connection-color": pendingDeletionConnection
              ? RESOURCE_COLORS[pendingDeletionConnection.type]
              : "#d9b968",
          } as React.CSSProperties}
        >
          <AlertDialogHeader>
            <AlertDialogMedia className="destroy-dialog-icon connection-delete-dialog-icon">
              <Cable aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this connection?</AlertDialogTitle>
            <AlertDialogDescription className="connection-delete-flavor">
              Connections have feelings too.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="connection-delete-route" aria-label="Selected connection">
            <span className="connection-delete-endpoint source">
              <small>FROM</small>
              <strong>{pendingConnectionSourceNode?.title ?? "Source node"}</strong>
              <span>{pendingConnectionSourcePort?.label ?? "Output"}</span>
            </span>
            <span className="connection-delete-link" aria-hidden="true">
              <i />
              <Cable />
              <i />
            </span>
            <span className="connection-delete-endpoint target">
              <small>TO</small>
              <strong>{pendingConnectionTargetNode?.title ?? "Target node"}</strong>
              <span>{pendingConnectionTargetPort?.label ?? "Input"}</span>
            </span>
          </div>
          <label className="inventory-overflow-suppression connection-delete-suppression">
            <Checkbox
              checked={suppressFutureConnectionDeleteWarnings}
              onCheckedChange={(checked) =>
                setSuppressFutureConnectionDeleteWarnings(checked === true)
              }
            />
            <span>
              <strong>Never show again</strong>
              <small>Future connection deletions will happen immediately without this confirmation.</small>
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                if (!pendingDeletionConnectionId || !deleteConnection(pendingDeletionConnectionId)) {
                  event.preventDefault();
                  return;
                }
                if (suppressFutureConnectionDeleteWarnings) {
                  rememberAlwaysDeleteConnections();
                }
              }}
            >
              <Trash2 aria-hidden="true" />
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={multiConnectionManagerOpen}
        onOpenChange={(open) => {
          setMultiConnectionManagerOpen(open);
          if (!open) setManagedMultiPort(null);
        }}
      >
        <DialogContent className="connection-manager-dialog">
          <DialogHeader>
            <DialogTitle>Manage connections</DialogTitle>
            <DialogDescription>
              This star socket supports multiple cables. Disconnect only the route you want to remove.
            </DialogDescription>
          </DialogHeader>
          <div
            className="connection-manager-summary"
            style={{
              "--manager-port-color": managedMultiPortSpec
                ? RESOURCE_COLORS[managedMultiPortSpec.type]
                : "#d9b968",
            } as React.CSSProperties}
          >
            <span className="connection-manager-star" aria-hidden="true" />
            <span className="connection-manager-summary-copy">
              <small>MULTI-CONNECTION SOCKET</small>
              <strong>{managedMultiPortTitle} · {managedMultiPortSpec?.label ?? "Socket"}</strong>
            </span>
            <span className="connection-manager-count">
              {managedMultiConnections.length} connected
            </span>
          </div>
          <div className="connection-manager-list" aria-live="polite">
            {managedMultiConnections.map((connection) => {
              const outbound = managedMultiPort?.direction === "output";
              const otherNodeId = outbound ? connection.targetNode : connection.sourceNode;
              const otherPortId = outbound ? connection.targetPort : connection.sourcePort;
              const otherNode = nodes.find((node) => node.id === otherNodeId);
              const otherPort = otherNode
                ? (outbound ? otherNode.inputs : otherNode.outputs).find((port) => port.id === otherPortId)
                : null;
              return (
                <article className="connection-manager-row" key={connection.id}>
                  <span
                    className="connection-manager-type"
                    style={{ "--connection-type-color": RESOURCE_COLORS[connection.type] } as React.CSSProperties}
                    aria-hidden="true"
                  />
                  <span className="connection-manager-route">
                    <small>{outbound ? "TO" : "FROM"}</small>
                    <strong>{otherNode?.title ?? "Connected node"}</strong>
                    <span>{otherPort?.label ?? (outbound ? "Input" : "Output")} · {formatResourceType(connection.type)}</span>
                  </span>
                  <Button
                    className="connection-manager-disconnect"
                    size="sm"
                    variant="outline"
                    aria-label={`Disconnect ${otherNode?.title ?? "connected node"}`}
                    onClick={() => deleteConnection(connection.id)}
                  >
                    <Unplug aria-hidden="true" />
                    Disconnect
                  </Button>
                </article>
              );
            })}
            {managedMultiConnections.length === 0 ? (
              <div className="connection-manager-empty">
                <Cable aria-hidden="true" />
                <strong>No active connections</strong>
                <span>Drag from this star socket to create a new cable.</span>
              </div>
            ) : null}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(configuringFilterId)}
        onOpenChange={(open) => {
          if (!open) setConfiguringFilterId(null);
        }}
      >
        <DialogContent className="filter-dialog">
          <DialogHeader>
            <DialogTitle>Choose filter item</DialogTitle>
            <DialogDescription>
              Only this item can pass through. When connected after an Inventory node, it also chooses what that node retrieves from physical storage.
            </DialogDescription>
          </DialogHeader>
          <div className="filter-choice-grid" role="listbox" aria-label="Filter item type">
            {INVENTORY_ITEMS.map((item) => {
              const selected = configuringFilter?.selectedType === item.type;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`filter-choice ${selected ? "selected" : ""}`}
                  key={item.type}
                  style={{ "--item-color": RESOURCE_COLORS[item.type] } as React.CSSProperties}
                  onClick={() => {
                    if (configuringFilterId) configureFilter(configuringFilterId, item.type);
                  }}
                >
                  <span className="filter-choice-swatch" />
                  <span className="filter-choice-copy">
                    <strong>{item.label}</strong>
                    <small>{buildMaterialAvailability[item.type].total} stored in nodes</small>
                  </span>
                  {selected ? <span className="filter-choice-current">ACTIVE</span> : null}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={miningDrillWarningOpen}
        onOpenChange={(open) => {
          setMiningDrillWarningOpen(open);
          if (!open) setSuppressFutureMiningDrillWarnings(false);
        }}
      >
        <AlertDialogContent className="destroy-dialog mining-drill-warning-dialog">
          <AlertDialogHeader>
            <AlertDialogMedia className="destroy-dialog-icon mining-drill-warning-icon">
              <TriangleAlert aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>Mining Drill placement warning</AlertDialogTitle>
            <AlertDialogDescription>
              Once this Mining Drill accepts its twentieth Motor and becomes a completed resource deposit, it cannot be moved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="inventory-overflow-suppression mining-drill-warning-suppression">
            <Checkbox
              checked={suppressFutureMiningDrillWarnings}
              onCheckedChange={(checked) =>
                setSuppressFutureMiningDrillWarnings(checked === true)
              }
            />
            <span>
              <strong>Don&apos;t show this again</strong>
              <small>Future Mining Drill placements will skip this reminder.</small>
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (suppressFutureMiningDrillWarnings) {
                  setSkipMiningDrillCompletionWarning(true);
                }
              }}
            >
              <TriangleAlert aria-hidden="true" />
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(configuringMiningDrillId)}
        onOpenChange={(open) => {
          if (!open) setConfiguringMiningDrillId(null);
        }}
      >
        <DialogContent className="filter-dialog mining-drill-dialog">
          <DialogHeader>
            <DialogTitle>Choose ore deposit</DialogTitle>
            <DialogDescription>
              Each Motor delivered advances the Mining Drill by one tick. After twenty Motors it becomes a 1,000-unit deposit of the selected resource.
            </DialogDescription>
          </DialogHeader>
          <div className="filter-choice-grid mining-drill-choice-grid" role="listbox" aria-label="Mining Drill ore resource">
            {MINING_DRILL_TARGETS.map((target) => {
              const selected = configuringMiningDrill?.selectedType === target.type;
              const available = getMapNodeValue(activeMapSector) >= target.minimumMapNodeValue;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`filter-choice ${selected ? "selected" : ""}`}
                  disabled={!available}
                  key={target.type}
                  style={{ "--item-color": RESOURCE_COLORS[target.type] } as React.CSSProperties}
                  onClick={() => {
                    if (configuringMiningDrillId) {
                      configureMiningDrill(configuringMiningDrillId, target.type);
                    }
                  }}
                >
                  <span className="filter-choice-swatch" />
                  <span className="filter-choice-copy">
                    <strong>{target.title}</strong>
                    <small>{available
                      ? `${MINED_DEPOSIT_CAPACITY.toLocaleString()} unit deposit`
                      : `Requires tier ${target.minimumMapNodeValue} map node or higher`}</small>
                  </span>
                  {selected ? <span className="filter-choice-current">ACTIVE</span> : null}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={assemblerRecipeChangeDialogOpen}
        onOpenChange={(open) => {
          setAssemblerRecipeChangeDialogOpen(open);
          if (!open) {
            setPendingAssemblerRecipeChange(null);
            setSuppressFutureAssemblerRecipeWarnings(false);
          }
        }}
      >
        <AlertDialogContent className="destroy-dialog assembler-recipe-change-dialog">
          <AlertDialogHeader>
            <AlertDialogMedia className="destroy-dialog-icon assembler-recipe-change-icon">
              {pendingAssemblerRecipeChange?.kind === "refiner"
                ? <Cog aria-hidden="true" />
                : <Hammer aria-hidden="true" />}
            </AlertDialogMedia>
            <AlertDialogTitle>Change {pendingRecipeMachineTitle} recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing recipes will destroy all materials stored in this {pendingRecipeMachineTitle}, including inputs and outputs. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="inventory-overflow-suppression assembler-recipe-suppression">
            <Checkbox
              checked={suppressFutureAssemblerRecipeWarnings}
              onCheckedChange={(checked) =>
                setSuppressFutureAssemblerRecipeWarnings(checked === true)
              }
            />
            <span>
              <strong>Never show again</strong>
              <small>Future recipe changes will immediately clear this machine and apply the selected recipe.</small>
            </span>
          </label>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                if (pendingAssemblerRecipeChange) {
                  setConfiguringRecipeMachineKind(pendingAssemblerRecipeChange.kind);
                  setConfiguringAssemblerId(pendingAssemblerRecipeChange.nodeId);
                }
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                if (!pendingAssemblerRecipeChange) {
                  event.preventDefault();
                  return;
                }
                if (suppressFutureAssemblerRecipeWarnings) {
                  setAlwaysApproveAssemblerRecipeChanges(true);
                }
                applyAssemblerRecipe(
                  pendingAssemblerRecipeChange.nodeId,
                  pendingAssemblerRecipeChange.recipeId,
                );
                setPendingAssemblerRecipeChange(null);
              }}
            >
              {pendingAssemblerRecipeChange?.kind === "refiner"
                ? <Cog aria-hidden="true" />
                : <Hammer aria-hidden="true" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(configuringAssemblerId)}
        onOpenChange={(open) => {
          if (!open) {
            setConfiguringAssemblerId(null);
            setHoveredRecipeOptionId(null);
          }
        }}
      >
        <DialogContent className="filter-dialog assembler-recipe-dialog">
          <DialogHeader>
            <DialogTitle>Choose {configuringRecipeTitle} recipe</DialogTitle>
            <DialogDescription>
              Configure this {configuringRecipeTitle} with an existing production recipe.
            </DialogDescription>
          </DialogHeader>
          <div className="filter-choice-grid assembler-recipe-grid" role="listbox" aria-label={`${configuringRecipeTitle} recipe`}>
            {configuringRecipeOptions.map((option) => {
              const recipe = option.recipe;
              const RecipeIcon = recipe.icon;
              const selected = option.selected;
              const ingredientTotals = getRecipeIngredientTotals(recipe);
              return (
                <Tooltip
                  key={option.id}
                  open={hoveredRecipeOptionId === option.id}
                >
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`filter-choice assembler-recipe-choice ${selected ? "selected" : ""}`}
                      style={{ "--item-color": recipe.color } as React.CSSProperties}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setHoveredRecipeOptionId(option.id);
                      }}
                      onPointerLeave={() => setHoveredRecipeOptionId((current) => (
                        current === option.id ? null : current
                      ))}
                      onClick={() => {
                        if (configuringAssemblerId) {
                          requestAssemblerRecipeChange(configuringAssemblerId, option.id);
                        }
                      }}
                    >
                      <span className="assembler-recipe-icon"><RecipeIcon aria-hidden="true" /></span>
                      <span className="filter-choice-copy">
                        <strong>{option.label}</strong>
                        <small>
                          {recipe.summary} · {formatCycleDuration(recipe.duration)}
                        </small>
                      </span>
                      {selected ? <span className="filter-choice-current">ACTIVE</span> : null}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="recipe-choice-tooltip"
                    side="right"
                    sideOffset={10}
                    style={{ "--item-color": recipe.color } as React.CSSProperties}
                  >
                    <div className="recipe-choice-tooltip-heading">
                      <RecipeIcon aria-hidden="true" />
                      <strong>{recipe.title}</strong>
                      <span>Per cycle</span>
                    </div>
                    <section>
                      <span>Required inputs</span>
                      <ul>
                        {ingredientTotals.map((ingredient) => (
                          <li key={ingredient.type}>
                            <i style={{ background: RESOURCE_COLORS[ingredient.type] }} />
                            <span>{ingredient.label}</span>
                            <b>{ingredient.amount}&times;</b>
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section>
                      <span>Output</span>
                      <ul>
                        <li>
                          <i style={{ background: RESOURCE_COLORS[recipe.output.type] }} />
                          <span>{recipe.output.label}</span>
                          <b>1&times;</b>
                        </li>
                      </ul>
                    </section>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={`workspace-viewport ${isPanning ? "panning" : ""} ${placingNodeId ? "placing-node" : ""} ${placingNodeId && placementBlocked ? "placement-blocked" : ""}`}
        ref={workspaceRef}
        onScroll={handleWorkspaceScroll}
        style={{
          "--grid-size": `${24 * zoom}px`,
          "--major-grid-size": `${120 * zoom}px`,
          "--port-zoom-scale": getPortZoomScale(zoom),
          "--port-hit-padding": `${getPortHitPadding(zoom)}px`,
        } as React.CSSProperties}
      >
        <div
          className="node-canvas-sizer"
          style={{ width: worldSize.width * zoom, height: worldSize.height * zoom }}
        >
        <div
          className="node-canvas"
          ref={canvasRef}
          style={{ width: worldSize.width, height: worldSize.height, transform: `scale(${zoom})` }}
          onPointerDownCapture={handleCanvasPointerDownCapture}
          onPointerDown={beginCanvasPan}
          onContextMenuCapture={handleCanvasContextMenuCapture}
          onContextMenu={(event) => event.preventDefault()}
        >
          <svg className="cable-layer" aria-hidden="true">
            {renderedConnections.map((connection) => {
              const path = getCurve(connection.start, connection.end, connection.sourcePort);
              const isSelected = selectedConnection === connection.id;
              const activeFlowTimestamp = activeFlows[connection.id];
              const isActive = wireAnimationsEnabled && Boolean(activeFlowTimestamp);
              const storageItemType =
                connection.targetPort === "storage-in" &&
                isInventoryItemType(connection.type)
                  ? connection.type
                  : null;
              const storageState = runtime.storages[connection.targetNode];
              const isStorageFull = Boolean(
                connection.targetPort === "storage-in" &&
                storageItemType &&
                storageState &&
                (storageState.items[storageItemType] ?? 0) >= storageState.capacityPerItem,
              );
              const isResourceDepleted =
                connection.targetPort === "resource-in" &&
                getResourceRemaining(
                  runtime,
                  connection.sourceNode,
                  connection.type,
                  connections,
                ) <= 0;
              const cableAlert = isStorageFull
                ? { label: "[STORAGE FULL]", width: 122 }
                : isResourceDepleted
                  ? { label: "[DEPLETED]", width: 88 }
                  : null;
              const cableMidpoint = getCurveMidpoint(
                connection.start,
                connection.end,
                connection.sourcePort,
              );
              return (
                <g
                  key={connection.id}
                  className={`cable-group ${isSelected ? "selected" : ""} ${isActive ? "flowing" : ""} ${insertionTarget === connection.id ? "insert-target" : ""}`}
                  onPointerDown={(event) => {
                    if (placingNodeRef.current) return;
                    if (event.button === 1 || event.button === 2 || spacePressedRef.current) return;
                    event.stopPropagation();
                    setSelectedConnection(connection.id);
                    setSelectedNodes([]);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <path className="cable-underlay" d={path} />
                  <path
                    ref={(element) => { pathRefs.current[connection.id] = element; }}
                    className="cable-main"
                    d={path}
                    style={{ stroke: RESOURCE_COLORS[connection.type] }}
                  />
                  {isActive ? (
                    <path
                      key={`${connection.id}-transfer-${activeFlowTimestamp}`}
                      className={`cable-transfer-glow ${connection.type === ResourceType.POWER ? "power" : "material"}`}
                      d={path}
                      pathLength={100}
                    />
                  ) : null}
                  <path className="cable-hitbox" d={path} />
                  {cableAlert ? (
                    <g
                      className="cable-alert-label"
                      transform={`translate(${cableMidpoint.x} ${cableMidpoint.y + (isSelected ? 21 / zoom : 0)}) scale(${1 / zoom})`}
                    >
                      <rect x={-cableAlert.width / 2} y="-11" width={cableAlert.width} height="22" rx="5" />
                      <text textAnchor="middle" dominantBaseline="central">{cableAlert.label}</text>
                    </g>
                  ) : null}
                </g>
              );
            })}
            {insertionPreview ? (
              <g className="cable-insertion-preview">
                <path className="cable-insertion-preview-underlay" d={insertionPreview.incomingPath} />
                <path className="cable-insertion-preview-underlay" d={insertionPreview.outgoingPath} />
                <path
                  className="cable-insertion-preview-main"
                  d={insertionPreview.incomingPath}
                  style={{ stroke: RESOURCE_COLORS[insertionPreview.type] }}
                />
                <path
                  className="cable-insertion-preview-main"
                  d={insertionPreview.outgoingPath}
                  style={{ stroke: RESOURCE_COLORS[insertionPreview.type] }}
                />
              </g>
            ) : null}
            {previewPath && connecting ? <path className="cable-preview" d={previewPath} style={{ stroke: RESOURCE_COLORS[connecting.port.type] }} /> : null}
            {connectionTutorialPath ? (
              <g className="connection-drag-tutorial">
                <path className="connection-drag-tutorial-underlay" d={connectionTutorialPath.path} />
                <path className="connection-drag-tutorial-track" d={connectionTutorialPath.path} />
                <circle
                  className="connection-drag-tutorial-click-ring"
                  cx={connectionTutorialPath.start.x}
                  cy={connectionTutorialPath.start.y}
                  r="18"
                />
                <circle
                  className="connection-drag-tutorial-target-ring"
                  cx={connectionTutorialPath.end.x}
                  cy={connectionTutorialPath.end.y}
                  r="16"
                />
                <g className="connection-drag-tutorial-cursor">
                  <animateMotion
                    dur="2.8s"
                    repeatCount="indefinite"
                    path={connectionTutorialPath.path}
                    keyPoints="0;0;1;1"
                    keyTimes="0;0.18;0.82;1"
                    calcMode="linear"
                    rotate="auto"
                  />
                  <circle className="connection-drag-tutorial-cursor-halo" r="15" />
                  <path
                    className="connection-drag-tutorial-pointer"
                    d="M-8-12 10 2 2 5 7 13 2 16-3 7-9 12Z"
                  />
                </g>
              </g>
            ) : null}
          </svg>

          {Object.values(runtime.blackHoles ?? {}).map((hole) => {
            const requiredStone = getBlackHoleStoneRequirement(
              hole,
              getMapNodeValue(activeMapSector),
            );
            const isFilled = hole.stoneFilled >= requiredStone;
            const hasStoneConnection = connections.some(
              (connection) =>
                connection.targetNode === hole.id &&
                connection.targetPort === BLACK_HOLE_INPUT_PORT.id,
            );
            return (
              <div
                className={`black-hole-obstacle ${isFilled ? "filled" : ""}`}
                key={hole.id}
                style={{
                  left: hole.x - hole.radius,
                  top: hole.y - hole.radius,
                  width: hole.radius * 2,
                  height: hole.radius * 2,
                }}
                aria-label={`Black Hole, ${hole.stoneFilled} of ${requiredStone} stone`}
                onPointerEnter={(event) => updateObstructionTooltip("blackHole", hole.id, event)}
                onPointerMove={(event) => updateObstructionTooltip("blackHole", hole.id, event)}
                onPointerLeave={() => clearObstructionTooltip("blackHole", hole.id)}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                      <g className="black-hole-cracks">
                        {hole.shape.map((scale, index) => {
                          if (index % 2 !== 0) return null;
                          const angle =
                            (Math.PI * 2 * index) / hole.shape.length +
                            hole.rotation * Math.PI / 180;
                          const endX = 50 + Math.cos(angle) * (47 + scale * 3);
                          const endY = 50 + Math.sin(angle) * (47 + scale * 3);
                          return (
                            <path
                              key={index}
                              d={`M 50 50 L ${endX} ${endY}`}
                              style={{ "--crack-index": index / 2 } as React.CSSProperties}
                            />
                          );
                        })}
                      </g>
                      <polygon
                        className="black-hole-core"
                        points={getBlackHolePolygonPoints(hole)}
                      />
                    </svg>
                    <span className="black-hole-input">
                      <button
                        ref={(element) => {
                          portRefs.current[`${hole.id}:${BLACK_HOLE_INPUT_PORT.id}`] = element;
                        }}
                        type="button"
                        className={`port-socket ${getPortConnectionClass(hole.id, BLACK_HOLE_INPUT_PORT)} ${hasStoneConnection ? "filled" : ""}`}
                        style={{
                          "--port-color": RESOURCE_COLORS[ResourceType.STONE],
                        } as React.CSSProperties}
                        data-port-node={hole.id}
                        data-port-id={BLACK_HOLE_INPUT_PORT.id}
                        aria-label="Black Hole Stone input"
                        onPointerEnter={() => setHoveredPort({
                          nodeId: hole.id,
                          port: BLACK_HOLE_INPUT_PORT,
                        })}
                        onPointerLeave={() => clearHoveredPort(
                          hole.id,
                          BLACK_HOLE_INPUT_PORT.id,
                        )}
                        onFocus={() => setHoveredPort({
                          nodeId: hole.id,
                          port: BLACK_HOLE_INPUT_PORT,
                        })}
                        onBlur={() => clearHoveredPort(hole.id, BLACK_HOLE_INPUT_PORT.id)}
                        onPointerDown={(event) => beginConnection(
                          event,
                          hole.id,
                          BLACK_HOLE_INPUT_PORT,
                        )}
                      />
                    </span>
                    <span className="black-hole-fill-progress" aria-hidden="true">
                      {hole.stoneFilled}/{requiredStone}
                    </span>
                    {isFilled ? (
                      <button
                        type="button"
                        className="black-hole-delete-button"
                        aria-label="Remove filled Black Hole"
                        title="Remove filled Black Hole"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeFilledBlackHole(hole.id);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    ) : null}
              </div>
            );
          })}

          {Object.values(runtime.lakes ?? {}).map((lake) => {
            return (
              <div
                className="lake-obstacle"
                key={lake.id}
                style={{
                  left: lake.x - lake.width / 2,
                  top: lake.y - lake.height / 2,
                  width: lake.width,
                  height: lake.height,
                }}
                aria-label="Lake, infinite Water source, produces 1 Water per second"
                onPointerEnter={(event) => updateObstructionTooltip("lake", lake.id, event)}
                onPointerMove={(event) => updateObstructionTooltip("lake", lake.id, event)}
                onPointerLeave={() => clearObstructionTooltip("lake", lake.id)}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                      <polygon className="lake-shore" points={getLakePolygonSvgPoints(lake)} />
                      <polygon className="lake-water" points={getLakePolygonSvgPoints(lake)} />
                      <path className="lake-ripple lake-ripple-one" d="M25 48 C38 40 61 41 76 49" />
                      <path className="lake-ripple lake-ripple-two" d="M31 62 C44 56 58 57 69 62" />
                    </svg>
                    {LAKE_WATER_OUTPUT_PORTS.map((port) => {
                      const position = getLakeOutputPortPosition(lake, port.side);
                      const hasWaterConnection = connections.some(
                        (connection) =>
                          connection.sourceNode === lake.id &&
                          connection.sourcePort === port.id,
                      );
                      return (
                        <span
                          className="lake-output"
                          key={port.id}
                          style={{ left: `${position.x}%`, top: `${position.y}%` }}
                        >
                          <MultiConnectionSocketTooltip
                            enabled={!skipMultiConnectionTooltip}
                            direction="output"
                            onDisable={() => setSkipMultiConnectionTooltip(true)}
                          >
                            <button
                              ref={(element) => {
                                portRefs.current[`${lake.id}:${port.id}`] = element;
                              }}
                              type="button"
                              className={`port-socket multi-connection ${getPortConnectionClass(lake.id, port)} ${hasWaterConnection ? "filled" : ""}`}
                              style={{
                                "--port-color": LAKE_CONNECTOR_COLOR,
                              } as React.CSSProperties}
                              data-port-node={lake.id}
                              data-port-id={port.id}
                              aria-label={`Lake ${port.side} Water output, WATER type, supports multiple connections`}
                              onPointerEnter={() => setHoveredPort({
                                nodeId: lake.id,
                                port,
                              })}
                              onPointerLeave={() => clearHoveredPort(lake.id, port.id)}
                              onFocus={() => setHoveredPort({
                                nodeId: lake.id,
                                port,
                              })}
                              onBlur={() => clearHoveredPort(lake.id, port.id)}
                              onPointerDown={(event) => beginConnection(
                                event,
                                lake.id,
                                port,
                              )}
                            >
                              <span className="multi-port-star" aria-hidden="true" />
                            </button>
                          </MultiConnectionSocketTooltip>
                        </span>
                      );
                    })}
              </div>
            );
          })}

          {selectedRenderedConnection && selectedConnectionMidpoint ? (
            <span
              className="cable-delete-anchor"
              style={{
                left: selectedConnectionMidpoint.x,
                top: selectedConnectionMidpoint.y,
                "--cable-delete-scale": 1 / zoom,
              } as React.CSSProperties}
            >
              <button
                type="button"
                className="cable-inline-delete"
                aria-label="Delete selected connection"
                title="Delete connection"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  requestConnectionDeletion(selectedRenderedConnection.id);
                }}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </span>
          ) : null}

          {selectionBoxStyle ? <div className="selection-marquee" style={selectionBoxStyle} aria-hidden="true" /> : null}

          {selectedNodeBounds && selectedNodeRects.length >= 2 ? (
            <div
              className="selected-nodes-actions"
              style={{
                left: selectedNodeBounds.left - 8,
                top: selectedNodeBounds.top - 8,
                width: selectedNodeBounds.right - selectedNodeBounds.left + 16,
                height: selectedNodeBounds.bottom - selectedNodeBounds.top + 16,
                "--selection-control-scale": 1 / zoom,
              } as React.CSSProperties}
            >
              <button
                type="button"
                className="node-destroy-button selection-delete-button"
                disabled={selectedDestroyableNodeIds.length === 0}
                aria-label={selectedDestroyableNodeIds.length === 1
                  ? "Delete selected node"
                  : `Delete ${selectedDestroyableNodeIds.length} selected nodes`}
                title={selectedDestroyableNodeIds.length > 0
                  ? "Delete selected nodes"
                  : "This selection cannot be deleted"}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  const isHighlightedGroup = selectedDestroyableNodeIds.length > 1;
                  requestNodeDeletion(selectedDestroyableNodeIds, {
                    highlightedControlGroup: isHighlightedGroup,
                  });
                }}
              >
                <Trash2 aria-hidden="true" />
              </button>
            </div>
          ) : null}

          {nodes.map((node) => {
            const isIronOreDeposit = node.kind === "ironOre";
            const isCopperOreDeposit = node.kind === "copperOre";
            const isMythrilOreDeposit = node.kind === "mythrilOre";
            const isStoneDeposit = node.kind === "stone";
            const isForest = node.kind === "forest";
            const starterCollectHintVisible =
              (isStoneDeposit && stoneCollectHintVisible) ||
              (isForest && forestCollectHintVisible);
            const starterCollectHintEncouraging = isStoneDeposit
              ? stoneCollectHintEncouraging
              : forestCollectHintEncouraging;
            const starterCollectHintTarget = isForest ? "Forest" : "Stone";
            const isFiniteResource =
              isIronOreDeposit || isCopperOreDeposit || isMythrilOreDeposit || isStoneDeposit || isForest;
            const manualResourceProduct = isFiniteResource
              ? getManualResourceProductType(node)
              : null;
            const baseInventoryAmount = manualResourceProduct
              ? runtime.inventory?.[manualResourceProduct] ?? 0
              : 0;
            const minedDeposit = runtime.minedDeposits[node.id];
            const resourceRemaining = minedDeposit?.remaining ?? (
              isForest
                ? runtime.forest.remaining
                : isStoneDeposit
                  ? runtime.stone.remaining
                  : isCopperOreDeposit
                    ? runtime.copperOre.remaining
                    : runtime.ironOre.remaining
            );
            const resourceCapacity = minedDeposit?.capacity ?? (
              isForest
                ? runtime.forest.capacity ?? activeMapResourceCapacity
                : isStoneDeposit
                  ? runtime.stone.capacity ?? activeMapResourceCapacity
                  : isCopperOreDeposit
                    ? runtime.copperOre.capacity ?? activeMapResourceCapacity
                    : runtime.ironOre.capacity ?? activeMapResourceCapacity
            );
            const isExtractor = isExtractorKind(node.kind);
            const isGenerator = node.kind === "generator";
            const isResearchFoundry = node.kind === "researchFoundry";
            const isTreePlanter = node.kind === "treePlanter";
            const isMiningDrill = node.kind === "miningDrill";
            const isSplitter = node.kind === "splitter";
            const isMerger = node.kind === "merger";
            const isJoint = node.kind === "joint";
            const isRoad = node.kind === "road";
            const roadState = isRoad ? runtime.roads[node.id] : null;
            const roadMode = roadState?.mode ?? "export";
            const roadEdge = roadState?.edge ?? "west";
            const isPowerSplitter = node.kind === "powerSplitter";
            const isInventorySource = node.kind === "inventorySource";
            const isFilter = node.kind === "filter";
            const isStorage = node.kind === "storage";
            const isWoodenChest = node.kind === "woodenChest";
            const isAssembler = node.kind === "assembler";
            const isRefiner = node.kind === "refiner";
            const isConfigurableProcessor = isAssembler || isRefiner;
            const woodenChestState = isWoodenChest ? runtime.woodenChests[node.id] : null;
            const woodenChestItemType = woodenChestState?.itemType ?? null;
            const woodenChestStored = woodenChestState?.stored ?? 0;
            const isLogisticsNode = isLogisticsNodeKind(node.kind);
            const canDestroy = isDestroyableNode(node);
            const canPauseOutput = canPauseNodeOutput(node);
            const outputPaused = Boolean(runtime.pausedOutputs?.[node.id]);
            const processorKind = isProcessorKind(node.kind) ? node.kind : null;
            const processorState = processorKind ? runtime.processors[node.id] : null;
            const processorRecipe = processorKind
              ? getProcessorRecipe(processorKind, processorState)
              : null;
            const processorStored = processorKind ? getProcessorStored(processorState ?? undefined) : 0;
            const smartProcessorInputType = processorKind
              ? smartProcessorInputTypes.get(node.id) ?? null
              : null;
            const smartProcessorOutput = processorKind
              ? getSmartProcessorOutput(node.id, smartProcessorInputType, processorState)
              : null;
            const construction = runtime.construction[node.id];
            const isBuilding = Boolean(construction && !construction.complete);
            const buildDuration = isPurchasableKind(node.kind) ? BUILD_TIMES[node.kind] : 0;
            const extractorId = isExtractor ? node.id as ExtractorNodeId : null;
            const extractorRecipe = extractorId ? extractorRecipes[extractorId] : null;
            const extractorResourceEdge = extractorId
              ? connectionIndex.incomingByPort.get(`${extractorId}:resource-in`)
              : null;
            const extractorResourceSourceId = extractorResourceEdge
              ? resolveResourceSourceNode(
                  runtime,
                  extractorResourceEdge.sourceNode,
                  extractorResourceEdge.type,
                  connections,
                )
              : null;
            const extractorResourceNode = extractorResourceSourceId
              ? nodeById.get(extractorResourceSourceId) ?? null
              : null;
            const extractorResourceColor = extractorResourceNode?.color ?? null;
            const Icon = extractorResourceNode?.icon ?? processorRecipe?.icon ?? node.icon;
            const extractorState = extractorId ? runtime.extractors[extractorId] : null;
            const extractorStored = extractorState?.stored ?? 0;
            const generatorPower = isGenerator ? runtime.generators[node.id]?.power ?? 0 : 0;
            const generatorCharcoal = isGenerator ? runtime.generators[node.id]?.charcoal ?? 0 : 0;
            const generatorCharcoalConnection = isGenerator
              ? connectionIndex.incomingByPort.get(`${node.id}:generator-charcoal-in`)
              : null;
            const researchFoundryState = isResearchFoundry
              ? runtime.researchFoundries[node.id]
              : null;
            const researchFoundryCores = getResearchFoundryCores(researchFoundryState ?? undefined);
            const researchFoundryBasicCores = getResearchFoundryCoreCount(
              researchFoundryState ?? undefined,
              ResourceType.BASIC_CORE,
            );
            const researchFoundryAutomataCores = getResearchFoundryCoreCount(
              researchFoundryState ?? undefined,
              ResourceType.AUTOMATA_CORE,
            );
            const researchFoundryBaseInventory = isResearchFoundry
              ? normalizeItemStore(runtime.inventory, BASE_INVENTORY_CAPACITY)
              : null;
            const researchFoundryBasicCoresAvailable = isResearchFoundry
              ? researchFoundryBaseInventory?.[ResourceType.BASIC_CORE] ?? 0
              : 0;
            const researchFoundryAutomataCoresAvailable = isResearchFoundry
              ? researchFoundryBaseInventory?.[ResourceType.AUTOMATA_CORE] ?? 0
              : 0;
            const activeResearchProjectProgress = runtime.research.activeProject
              ? runtime.research.progress[runtime.research.activeProject]
              : 0;
            const researchFoundryProjectCores = getResearchFoundryProjectCoreCount(
              researchFoundryState ?? undefined,
              runtime.research.activeProject,
              activeResearchProjectProgress,
              runtime.research,
            );
            const requiredResearchCoreType = getResearchProjectRequiredCoreType(
              runtime.research.activeProject,
              activeResearchProjectProgress,
              runtime.research,
            );
            const researchIsProducing = Boolean(
              isResearchFoundry &&
              !isBuilding &&
              isRunning &&
              researchFoundryProjectCores > 0 &&
              activeResearchProject &&
              !isResearchProjectUnlocked(runtime.research, activeResearchProject.id),
            );
            const researchCoreConnection = isResearchFoundry
              ? connectionIndex.incomingByPort.get(`${node.id}:research-core-in`)
              : null;
            const treePlanterPowerConnection = isTreePlanter ? getPowerConnection(node.id) : null;
            const treePlanterAvailablePower = isTreePlanter ? getAvailablePower(node.id) : 0;
            const treePlanterForestConnection = isTreePlanter
              ? connectionIndex.outgoingByPort.get(`${node.id}:forest-growth-out`)?.[0]
              : null;
            const miningDrillState = isMiningDrill ? runtime.miningDrills[node.id] : null;
            const miningDrillMotorConnection = isMiningDrill
              ? connectionIndex.incomingByPort.get(`${node.id}:motor-in`)
              : null;
            const miningDrillTarget = getMiningTarget(miningDrillState?.selectedType ?? null);
            const splitterType = isSplitter ? getSplitterInputType(node.id, connections) : null;
            const mergerType = isMerger ? getMergerInputType(node.id, connections) : null;
            const jointState = isJoint ? runtime.joints[node.id] : null;
            const jointType = isJoint ? getJointInputType(node.id, connections) : null;
            const powerSplitterGeneratorId = isPowerSplitter
              ? findPowerGeneratorId(
                  node.id,
                  connections,
                  runtime.generators,
                  runtime.pausedOutputs,
                )
              : null;
            const powerSplitterPowered = Boolean(
              powerSplitterGeneratorId &&
              (runtime.generators[powerSplitterGeneratorId]?.power ?? 0) > 0,
            );
            const inventorySourceFilterEdges = isInventorySource
              ? (connectionIndex.outgoingByPort.get(`${node.id}:inventory-out`) ?? []).filter(
                  (connection) =>
                    connection.targetPort === "filter-in" &&
                    nodeById.get(connection.targetNode)?.kind === "filter",
                )
              : [];
            const inventorySourceTypes = Array.from(new Set(
              inventorySourceFilterEdges.flatMap((connection) => {
                const selectedType = runtime.filters[connection.targetNode]?.selectedType;
                return selectedType ? [selectedType] : [];
              }),
            ));
            const inventorySourceHasStock = inventorySourceTypes.some(
              (type) => getStoredItemAmount(
                runtime,
                nodes,
                connections,
                type,
                new Set([node.id]),
              ) > 0,
            );
            const filterState = isFilter ? runtime.filters[node.id] : null;
            const nodeProgress = isBuilding
              ? construction?.progress ?? 0
              : isResearchFoundry && !researchIsProducing
                ? 0
                : getNodeProgress(node);
            const nodeFull = !isBuilding && getNodeFull(node);
            const displayedNodeProgress =
              nodeFull && isPurchasableKind(node.kind) && !isLogisticsNode
                ? 100
                : nodeProgress;
            const extractorSourceDepleted =
              Boolean(extractorResourceEdge) && getResourceRemaining(
                runtime,
                extractorResourceEdge!.sourceNode,
                extractorResourceEdge!.type,
                connections,
              ) <= 0;
            const extractorEffectiveCycleDuration = extractorId
              ? EXTRACTOR_BASE_CYCLE_DURATION *
                getExtractorResearchCycleMultiplier(runtime.research)
              : null;
            const effectiveProductionCycleDuration = extractorEffectiveCycleDuration ?? (
              processorKind
                ? processorRecipe?.duration ?? PROCESSOR_RECIPES[processorKind].duration
                : isResearchFoundry
                  ? RESEARCH_CYCLE_DURATION
                  : isTreePlanter
                    ? TREE_PLANTER_CYCLE_DURATION
                    : isGenerator
                      ? 0
                      : null
            );
            const isIdle =
              isBuilding ||
              (extractorId ? extractorIsWaiting(extractorId) : false) ||
              (isResearchFoundry
                ? researchFoundryProjectCores <= 0 || !activeResearchProject || isAllResearchComplete(runtime.research)
                : false) ||
              (isTreePlanter
                ? !treePlanterPowerConnection ||
                  !treePlanterForestConnection ||
                  treePlanterAvailablePower < TREE_PLANTER_POWER_COST ||
                  runtime.forest.remaining >= (runtime.forest.capacity ?? activeMapResourceCapacity)
                : false) ||
              (isMiningDrill
                ? !miningDrillTarget ||
                  !miningDrillMotorConnection
                : false) ||
              (isInventorySource
                ? inventorySourceTypes.length === 0 || !inventorySourceHasStock
                : false) ||
              (isFilter ? !filterState?.selectedType : false) ||
              (processorKind ? processorIsWaiting(node.id, processorKind) : false);
            const extractorProductionActive = Boolean(
              extractorId &&
              extractorRecipe &&
              extractorResourceEdge &&
              !extractorSourceDepleted &&
              extractorStored < EXTRACTOR_CAPACITY &&
              !(
                extractorStored > 0 &&
                extractorState?.materialType &&
                extractorState.materialType !== extractorRecipe.product
              ),
            );
            const processorProductionActive = Boolean(
              processorKind &&
              processorRecipe &&
              processorState &&
              processorStored < PROCESSOR_CAPACITY &&
              !processorNeedsInputs(node.id, processorKind) &&
              (
                !getSmartProcessorOutputPortId(node.id, processorState) ||
                smartProcessorOutput
              ),
            );
            const smoothProgressDuration = isBuilding
              ? buildDuration
              : extractorRecipe
                ? extractorEffectiveCycleDuration
                : processorRecipe
                  ? processorRecipe.duration
                  : isResearchFoundry
                    ? RESEARCH_CYCLE_DURATION
                  : isTreePlanter
                    ? TREE_PLANTER_CYCLE_DURATION
                    : null;
            const smoothProgressActive = Boolean(
              isRunning &&
              (
                isBuilding ||
                extractorProductionActive ||
                processorProductionActive ||
                researchIsProducing ||
                (isTreePlanter && !isIdle)
              ),
            );
            const progressStatus = isBuilding
              ? "Building"
              : nodeFull
                ? isExtractor
                  ? `Output full · ${extractorStored} / ${EXTRACTOR_CAPACITY}`
                  : processorKind
                    ? `Output full · ${processorStored} / ${PROCESSOR_CAPACITY}`
                    : "Output full"
                : isExtractor && extractorStored > 0
                  ? !extractorRecipe
                    ? `Stored ${extractorStored} / ${EXTRACTOR_CAPACITY} · input disconnected`
                    : extractorSourceDepleted
                      ? `Stored ${extractorStored} / ${EXTRACTOR_CAPACITY} · resource depleted`
                      : `Stored ${extractorStored} / ${EXTRACTOR_CAPACITY} · extracting ${extractorRecipe.label.toLowerCase()}`
                : isExtractor && !extractorRecipe
                ? "Connect a Resource"
                : isExtractor && extractorSourceDepleted
                  ? "Resource depleted"
                  : isExtractor && extractorRecipe
                    ? `Extracting ${extractorRecipe.label.toLowerCase()}`
                    : processorKind && processorStored > 0
                      ? `Stored ${processorStored} / ${PROCESSOR_CAPACITY} · ${
                          processorNeedsInputs(node.id, processorKind)
                            ? "waiting for inputs"
                            : processorRecipe?.activeLabel.toLowerCase() ?? "producing"
                        }`
                    : isTreePlanter
                      ? runtime.forest.remaining >= (runtime.forest.capacity ?? activeMapResourceCapacity)
                        ? "Forest deposit full"
                        : !treePlanterForestConnection
                          ? "Connect to Forest"
                          : !treePlanterPowerConnection
                            ? "Connect Power"
                            : treePlanterAvailablePower < TREE_PLANTER_POWER_COST
                              ? `Waiting for ${TREE_PLANTER_POWER_COST}W`
                              : "Planting trees"
                    : isMiningDrill
                      ? !miningDrillTarget
                        ? "Choose an ore resource"
                        : !miningDrillMotorConnection
                          ? "Connect Motors"
                          : `Waiting for Motor · ${miningDrillState?.iterations ?? 0}/${MINING_DRILL_ITERATIONS}`
                    : isResearchFoundry
                      ? isAllResearchComplete(runtime.research)
                        ? "All research complete"
                        : !activeResearchProject
                          ? researchFoundryCores > 0
                            ? "Choose a research project"
                            : researchCoreConnection
                              ? "Waiting for a Core"
                              : "Connect Cores"
                          : researchFoundryProjectCores > 0
                            ? `Researching ${activeResearchProject.title}`
                            : `Waiting for ${requiredResearchCoreType
                              ? formatResourceType(requiredResearchCoreType)
                              : "a Core"}`
                    : isInventorySource
                      ? inventorySourceFilterEdges.length === 0
                        ? "Connect Filters"
                        : inventorySourceTypes.length === 0
                          ? "Configure connected Filters"
                          : !inventorySourceHasStock
                            ? inventorySourceTypes.length === 1
                              ? `No ${formatResourceType(inventorySourceTypes[0])} stored`
                              : "No selected items stored"
                            : inventorySourceTypes.length === 1
                              ? `Withdrawing ${formatResourceType(inventorySourceTypes[0])}`
                              : `Supplying ${inventorySourceFilterEdges.length} Filters`
                    : isConfigurableProcessor && !processorRecipe
                      ? "Choose a recipe"
                    : processorKind && processorNeedsInputs(node.id, processorKind)
                          ? smartProcessorOutput ||
                            processorKind === "kiln" ||
                            !getSmartProcessorOutputPortId(node.id, processorState)
                            ? "Waiting for inputs"
                            : processorKind === "furnace"
                              ? "Connect metal"
                              : "Connect a Plate"
                          : processorRecipe
                            ? processorRecipe.activeLabel
                        : "Producing";
            const nodeMetaLabel = effectiveProductionCycleDuration !== null
              ? formatCycleDuration(effectiveProductionCycleDuration)
              : isMiningDrill
                ? "1 Motor per tick"
              : isInventorySource
                ? "1 item per Filter · 4.0s withdrawal"
                : "";
            const effectiveInputs = node.inputs
              .filter((port) => !(processorKind && port.id === "power-in"))
              .map((port) => getRuntimeAwarePort(node.id, port, connections, runtime));
            const effectiveOutputs = node.outputs.map((port) =>
              getRuntimeAwarePort(node.id, port, connections, runtime)
            );
            const roadPort = isRoad
              ? roadMode === "export"
                ? effectiveInputs.find((port) => port.id === "road-in") ?? null
                : effectiveOutputs.find((port) => port.id === "road-out") ?? null
              : null;
            const roadPortConnected = Boolean(roadPort && connections.some((connection) => (
              roadMode === "export"
                ? connection.targetNode === node.id && connection.targetPort === roadPort.id
                : connection.sourceNode === node.id && connection.sourcePort === roadPort.id
            )));
            const roadPortFilled = Boolean(
              roadPortConnected || roadState?.outboundType || roadState?.inboundType,
            );
            const hoveredNodePort = hoveredPort?.nodeId === node.id ? hoveredPort.port : null;
            const isProductionNode = isPurchasableKind(node.kind) && !isLogisticsNode;
            const productionStoredItems = !isBuilding && isExtractor
              ? extractorStored
              : !isBuilding && processorKind
                ? processorStored
                : null;
            const productionStoredCapacity = !isBuilding && isExtractor
              ? EXTRACTOR_CAPACITY
              : !isBuilding && processorKind
                ? PROCESSOR_CAPACITY
                : null;
            const nodeManualIngredientSlots = getManualIngredientSlots(node, processorState);
            const assemblerIngredientRows = isConfigurableProcessor && processorRecipe
              ? getRecipeIngredientTotals(processorRecipe)
              : [];
            const hasBufferedSmartIngredient = Boolean(
              processorKind &&
              processorState &&
              processorRecipe?.inputs.some(
                (input) =>
                  isSmartProcessorTypingPort(node.id, input.id, processorState) &&
                  (processorState.inputs[input.id] ?? 0) > 0,
              ),
            );
            const processorMaterialLocked = Boolean(
              processorState && (
                hasBufferedSmartIngredient ||
                processorState.progress > 0 ||
                processorStored > 0
              ),
            );
            const manualLockedIngredientType = smartProcessorInputType ?? (
              processorMaterialLocked ? processorState?.materialType ?? null : null
            );
            const hoveredPortIsMulti = Boolean(
              hoveredNodePort && (
                hoveredNodePort.direction === "input"
                  ? isMultiInputPort(node.id, hoveredNodePort.id)
                  : isMultiOutputPort(node.id, hoveredNodePort.id)
              ),
            );
            const showSocketGuide = Boolean(
              isProductionNode && hoveredNodePort && !hoveredPortIsMulti && !connecting,
            );
            const connectionOptions = showSocketGuide ? hoveredPortConnectionOptions : [];
            const visibleConnectionOptions = connectionOptions.slice(0, 8);
            const hoveredPortIndex = hoveredNodePort
              ? (hoveredNodePort.direction === "input" ? effectiveInputs : effectiveOutputs)
                  .findIndex((port) => port.id === hoveredNodePort.id)
              : -1;
            const socketGuideId = hoveredNodePort
              ? `connections-${node.id}-${hoveredNodePort.id}`
              : undefined;
            const rows = Math.max(effectiveInputs.length, effectiveOutputs.length, 1);
            const nodeControlGroup = controlGroupByNodeId.get(node.id);
            const prioritySelection = prioritizedBoxSelectionRef.current;
            const isPrioritySelection =
              selectedNodes.includes(node.id) &&
              prioritySelection.length === selectedNodes.length &&
              selectedNodes.every((selectedNodeId) => prioritySelection.includes(selectedNodeId));
            const entireControlGroupSelected = Boolean(
              nodeControlGroup &&
              nodeControlGroup.nodeIds.every((groupNodeId) => selectedNodes.includes(groupNodeId)),
            );
            const isActiveControlGroup = Boolean(
              nodeControlGroup &&
              selectedNodes.includes(node.id) &&
              (
                nodeControlGroup.id === activeControlGroupId ||
                entireControlGroupSelected
              ),
            );
            return (
              <section
                key={node.id}
                ref={(element) => { nodeRefs.current[node.id] = element; }}
                className={`node-card ${isFiniteResource ? "resource-node" : ""} ${isResearchFoundry ? "research-center-node" : ""} ${isJoint || isPowerSplitter ? "joint-node" : ""} ${isJoint && jointState?.orientation === "vertical" ? "joint-vertical" : ""} ${isPowerSplitter ? "power-splitter-node" : ""} ${isSplitter || isMerger || isFilter || isRoad ? "compact-routing-node routing-node" : ""} ${isSplitter ? "splitter-node" : ""} ${isMerger ? "merger-node" : ""} ${isFilter ? "filter-node" : ""} ${isRoad ? "road-node" : ""} ${isStorage ? "storage-node" : ""} ${isWoodenChest ? "wooden-chest-node" : ""} ${isConfigurableProcessor ? "assembler-node" : ""} ${nodeControlGroup ? "control-group-member" : ""} ${isActiveControlGroup ? "control-group-active" : ""} ${nodeControlGroup && individualControlNodeId === node.id && selectedNodes.includes(node.id) ? "individual-control" : ""} ${selectedNodes.includes(node.id) ? "selected" : ""} ${draggingNode && selectedNodes.includes(node.id) ? "dragging" : ""} ${(draggingNode === node.id || placingNodeId === node.id) && insertionTarget ? "insert-ready" : ""} ${placingNodeId === node.id ? "placing" : ""} ${placingNodeId === node.id && placementBlocked ? "placement-blocked" : ""} ${draggingNode === node.id && dragCollisionBlocked ? "collision-blocked" : ""} ${isBuilding ? "building" : ""} ${outputPaused ? "output-paused" : ""}`}
                style={{
                  transform: `translate3d(${positions[node.id]?.x ?? 0}px, ${positions[node.id]?.y ?? 0}px, 0) scale(${isResearchFoundry ? RESEARCH_CENTER_NODE_SCALE : 1})`,
                  transformOrigin: isResearchFoundry ? "top left" : undefined,
                  "--control-group-color": nodeControlGroup?.color ?? "transparent",
                  "--node-color": extractorResourceColor
                    ? extractorResourceColor
                    : splitterType
                      ? RESOURCE_COLORS[splitterType]
                    : mergerType
                      ? RESOURCE_COLORS[mergerType]
                    : jointType
                      ? RESOURCE_COLORS[jointType]
                    : woodenChestItemType
                      ? RESOURCE_COLORS[woodenChestItemType]
                    : smartProcessorOutput
                      ? RESOURCE_COLORS[smartProcessorOutput.type]
                    : isConfigurableProcessor && processorRecipe
                      ? processorRecipe.color
                      : node.color,
                } as React.CSSProperties}
                aria-label={isExtractor ? `${node.eyebrow} ${node.title} node` : `${node.title} node`}
                onPointerEnter={() => { hoveredNodeIdRef.current = node.id; }}
                onPointerLeave={() => {
                  if (hoveredNodeIdRef.current === node.id) hoveredNodeIdRef.current = null;
                }}
                onPointerDown={(event) => {
                  if (event.button === 2 && nodeControlGroup && !isPrioritySelection) {
                    if (!selectedNodesRef.current.includes(node.id)) {
                      event.stopPropagation();
                      beginCanvasPan(event, node.id);
                      return;
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                  }
                  beginNodeDrag(event, node.id);
                }}
                onClick={(event) => {
                  if (event.button !== 0 || event.ctrlKey || event.shiftKey) return;
                  if ((event.target as HTMLElement).closest("button, input, select, textarea, a")) return;
                  recordRapidNodeClick(node.id);
                }}
                onDoubleClick={(event) => {
                  if ((event.target as HTMLElement).closest("button, input, select, textarea, a")) return;
                  event.preventDefault();
                  event.stopPropagation();
                  selectedNodesRef.current = [node.id];
                  setSelectedNodes([node.id]);
                  setSelectedConnection(null);
                  setActiveControlGroupId(null);
                  individualControlNodeRef.current = node.id;
                  setIndividualControlNodeId(node.id);
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  const activeNodePan =
                    panRef.current?.nodeId === node.id && panRef.current.moved;
                  const suppressedNodePan =
                    suppressedNodeContextMenuRef.current?.nodeId === node.id &&
                    performance.now() <= suppressedNodeContextMenuRef.current.until;
                  if (activeNodePan || suppressedNodePan) {
                    if (panRef.current?.nodeId === node.id) {
                      panRef.current.contextMenuHandled = true;
                    }
                    suppressedNodeContextMenuRef.current = null;
                    event.stopPropagation();
                    return;
                  }
                  suppressedNodeContextMenuRef.current = null;
                  if (nodeControlGroup && !isPrioritySelection) {
                    event.stopPropagation();
                    setPendingDisbandControlGroupId(nodeControlGroup.id);
                    setDisbandControlGroupOpen(true);
                    return;
                  }
                  const highlightedNodeIds = selectedNodesRef.current;
                  if (
                    highlightedNodeIds.length >= 2 &&
                    highlightedNodeIds.includes(node.id)
                  ) {
                    event.stopPropagation();
                    requestControlGroupCreation(highlightedNodeIds);
                  }
                }}
              >
                {productionFlashTokens[node.id] ? (
                  <span
                    key={productionFlashTokens[node.id]}
                    className="production-completion-flash"
                    aria-hidden="true"
                  />
                ) : null}
                {rapidClickAnimations[node.id] ? (
                  <span
                    key={rapidClickAnimations[node.id].token}
                    className={`rapid-click-animation variant-${rapidClickAnimations[node.id].variant + 1}`}
                    aria-hidden="true"
                  >
                    {Array.from({ length: 16 }, (_, index) => (
                      <i
                        key={index}
                        style={{ "--particle-index": index } as React.CSSProperties}
                      />
                    ))}
                  </span>
                ) : null}
                {nodeControlGroup ? (
                  <span
                    className="control-group-marker"
                    title={`${nodeControlGroup.colorName} control group`}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="node-header">
                  {isConfigurableProcessor ? (
                    <button
                      type="button"
                      className={`node-icon assembler-config-button ${!processorRecipe && !isBuilding ? "needs-recipe" : ""}`}
                      disabled={isBuilding}
                      aria-label={isBuilding ? `${node.title} recipe available after construction` : `Choose ${node.title} recipe`}
                      title={isBuilding ? "Finish construction to choose a recipe" : "Choose recipe"}
                      onPointerDown={(event) => {
                        if (event.button === 0) event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfiguringRecipeMachineKind(isRefiner ? "refiner" : "assembler");
                        setConfiguringAssemblerId(node.id);
                      }}
                    >
                      <Icon aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="node-icon"><Icon aria-hidden="true" /></div>
                  )}
                  <div className="node-title"><strong>{node.title}</strong></div>
                  {canPauseOutput ? (
                    <div className="node-header-actions">
                      <button
                        type="button"
                        className={`node-pause-button ${outputPaused ? "active" : ""}`}
                        aria-label={`${outputPaused ? "Resume" : "Pause"} ${node.title} output`}
                        aria-pressed={outputPaused}
                        title={`${outputPaused ? "Resume" : "Pause"} output`}
                        onPointerDown={(event) => {
                          if (event.button === 0) event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleNodeOutputPause(node.id);
                        }}
                      >
                        {outputPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
                      </button>
                      {canDestroy ? (
                        <button
                          type="button"
                          className="node-destroy-button"
                          aria-label={`Destroy ${node.title}`}
                          title={`Destroy ${node.title}`}
                          onPointerDown={(event) => {
                            if (event.button === 0) event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.stopPropagation();
                            requestNodeDeletion([node.id]);
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  ) : canDestroy ? (
                    <button
                      type="button"
                      className="node-destroy-button"
                      aria-label={`Destroy ${node.title}`}
                      title={`Destroy ${node.title}`}
                      onPointerDown={(event) => {
                        if (event.button === 0) event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        requestNodeDeletion([node.id]);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                {isRoad && roadPort ? (
                  <div className={`road-terminal road-edge-${roadEdge} road-mode-${roadMode}`}>
                    <button
                      type="button"
                      className={`road-mode-toggle ${roadMode}`}
                      disabled={isBuilding}
                      aria-label={`Road direction: ${roadMode}. Change to ${getOppositeRoadMode(roadMode)}.`}
                      title={`Road is set to ${roadMode}. Click to switch both endpoints.`}
                      onPointerDown={(event) => {
                        if (event.button === 0) event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleRoadMode(node.id);
                      }}
                    >
                      {roadMode === "export" ? "EXPORT" : "IMPORT"}
                    </button>
                    <span className={`road-terminal-port ${roadMode === "export" ? "input-port" : "output-port"}`}>
                      <button
                        ref={(element) => { portRefs.current[`${node.id}:${roadPort.id}`] = element; }}
                        type="button"
                        disabled={isBuilding}
                        className={`port-socket ${isBuilding ? "disabled" : ""} ${getPortConnectionClass(node.id, roadPort)} ${roadPortFilled ? "filled" : ""}`}
                        style={{ "--port-color": RESOURCE_COLORS[roadPort.type] } as React.CSSProperties}
                        data-port-node={node.id}
                        data-port-id={roadPort.id}
                        aria-label={`${node.title} ${roadPort.label} ${roadPort.direction}, ${roadPort.type} type`}
                        onPointerEnter={() => setHoveredPort({ nodeId: node.id, port: roadPort })}
                        onPointerLeave={() => clearHoveredPort(node.id, roadPort.id)}
                        onFocus={() => setHoveredPort({ nodeId: node.id, port: roadPort })}
                        onBlur={() => clearHoveredPort(node.id, roadPort.id)}
                        onPointerDown={(event) => beginConnection(event, node.id, roadPort)}
                      />
                    </span>
                  </div>
                ) : isPowerSplitter ? (
                  <div className="power-splitter-ports">
                    {effectiveInputs.map((port) => {
                      const connected = connections.some(
                        (connection) =>
                          connection.targetNode === node.id && connection.targetPort === port.id,
                      );
                      return (
                        <span className="power-splitter-port side-left input-port" key={port.id}>
                          <button
                            ref={(element) => { portRefs.current[`${node.id}:${port.id}`] = element; }}
                            type="button"
                            className={`port-socket ${getPortConnectionClass(node.id, port)} ${connected ? "filled" : ""}`}
                            style={{ "--port-color": RESOURCE_COLORS[port.type] } as React.CSSProperties}
                            data-port-node={node.id}
                            data-port-id={port.id}
                            aria-label={`${node.title} ${port.label} input, Power type`}
                            onPointerEnter={() => setHoveredPort({ nodeId: node.id, port })}
                            onPointerLeave={() => clearHoveredPort(node.id, port.id)}
                            onFocus={() => setHoveredPort({ nodeId: node.id, port })}
                            onBlur={() => clearHoveredPort(node.id, port.id)}
                            onPointerDown={(event) => beginConnection(event, node.id, port)}
                          />
                          <span className="power-splitter-flow-label input-flow" aria-hidden="true">→</span>
                        </span>
                      );
                    })}
                    {effectiveOutputs.map((port, index) => {
                      const side = index === 0 ? "side-top" : index === 1 ? "side-right" : "side-bottom";
                      return (
                        <span className={`power-splitter-port ${side} output-port`} key={port.id}>
                          <button
                            ref={(element) => { portRefs.current[`${node.id}:${port.id}`] = element; }}
                            type="button"
                            className={`port-socket ${getPortConnectionClass(node.id, port)} ${powerSplitterPowered ? "filled" : ""}`}
                            style={{ "--port-color": RESOURCE_COLORS[port.type] } as React.CSSProperties}
                            data-port-node={node.id}
                            data-port-id={port.id}
                            aria-label={`${node.title} ${port.label} output, Power type`}
                            onPointerEnter={() => setHoveredPort({ nodeId: node.id, port })}
                            onPointerLeave={() => clearHoveredPort(node.id, port.id)}
                            onFocus={() => setHoveredPort({ nodeId: node.id, port })}
                            onBlur={() => clearHoveredPort(node.id, port.id)}
                            onPointerDown={(event) => beginConnection(event, node.id, port)}
                          />
                          <span className="power-splitter-flow-label output-flow" aria-hidden="true">
                            {index === 0 ? "↑" : index === 1 ? "→" : "↓"}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                <div className="port-list">
                   {Array.from({ length: rows }).map((_, index) => {
                    const input = effectiveInputs[index];
                    const output = effectiveOutputs[index];
                    const inputDisabled = Boolean(
                      input && isAssemblerPortDisabled(node.id, input.id, runtime),
                    );
                    const outputDisabled = Boolean(
                      output && isAssemblerPortDisabled(node.id, output.id, runtime),
                    );
                    const processorInput = input && processorRecipe
                      ? processorRecipe.inputs.find((requirement) => requirement.id === input.id)
                      : null;
                    const processorInputCount = processorInput
                      ? processorState?.inputs[processorInput.id] ?? 0
                      : 0;
                    const manualIngredientSlot = !isBuilding && input && !isResearchFoundry
                      ? nodeManualIngredientSlots.find((slot) => slot.portId === input.id) ?? null
                      : null;
                    const manualIngredientStored = processorInput
                      ? processorInputCount
                      : isGenerator && input?.id === "generator-charcoal-in"
                        ? generatorCharcoal
                        : isResearchFoundry && input?.id === "research-core-in"
                          ? researchFoundryCores
                          : 0;
                    const manualIngredientChoices = manualIngredientSlot
                      ? manualIngredientSlot.choices.filter((choice) => (
                          !isSmartProcessorTypingPort(
                            node.id,
                            manualIngredientSlot.portId,
                            processorState,
                          ) ||
                          !manualLockedIngredientType ||
                          manualLockedIngredientType === choice
                        ))
                      : [];
                    const isTreePlanterPowerInput = Boolean(isTreePlanter && input?.id === "power-in");
                    const isMiningDrillMotorInput = Boolean(isMiningDrill && input?.id === "motor-in");
                    const inputFilled = Boolean(
                      (isExtractor && input?.type === ResourceType.RESOURCE && extractorRecipe && !extractorSourceDepleted) ||
                      (isGenerator && input?.id === "generator-charcoal-in" && (
                        generatorCharcoal > 0 || (
                          generatorCharcoalConnection &&
                          generatorCharcoal < PRODUCTION_INGREDIENT_CAPACITY
                        )
                      )) ||
                      (isResearchFoundry && input?.id === "research-core-in" && researchFoundryCores > 0) ||
                      (isTreePlanterPowerInput && treePlanterPowerConnection && treePlanterAvailablePower >= TREE_PLANTER_POWER_COST) ||
                      (isMiningDrillMotorInput && miningDrillMotorConnection) ||
                      (isForest && input?.id === "forest-growth-in" && connections.some(
                        (connection) => connection.targetNode === node.id && connection.targetPort === input.id,
                      )) ||
                      (isSplitter && input?.id === "split-in" && splitterType) ||
                      (isMerger && input && connections.some(
                        (connection) =>
                          connection.targetNode === node.id && connection.targetPort === input.id,
                      )) ||
                      (isJoint && input?.id === "joint-in" && jointType) ||
                      (isFilter && input?.id === "filter-in" && filterState?.bufferedType) ||
                      (isWoodenChest && input?.id === "chest-in" && (
                        woodenChestItemType || connections.some(
                          (connection) => connection.targetNode === node.id && connection.targetPort === input.id,
                        )
                      )) ||
                      (processorInput && processorInputCount >= processorInput.amount) ||
                      (isStorage && input && connections.some(
                        (connection) => connection.targetNode === node.id && connection.targetPort === input.id,
                      )),
                    );
                    const inputStatus = isResearchFoundry
                      ? null
                      : inputFilled
                        ? "READY"
                      : isTreePlanterPowerInput && treePlanterPowerConnection
                          ? `${treePlanterAvailablePower}W`
                        : isMiningDrillMotorInput && miningDrillMotorConnection
                          ? "READY"
                        : null;
                    const outputFilled =
                      nodeFull ||
                      Boolean(isExtractor && extractorStored > 0) ||
                      Boolean(processorKind && processorStored > 0) ||
                      Boolean(isTreePlanter && treePlanterForestConnection) ||
                      (isFiniteResource && resourceRemaining > 0) ||
                      Boolean(isSplitter && splitterType) ||
                      Boolean(isMerger && mergerType) ||
                      Boolean(isJoint && (jointState?.bufferedType || jointType)) ||
                      Boolean(isFilter && filterState?.selectedType) ||
                      Boolean(isWoodenChest && woodenChestItemType && woodenChestStored > 0) ||
                      Boolean(isGenerator && generatorPower > 0) ||
                      Boolean(smartProcessorOutput);
                    return (
                      <div className="port-row" key={`${node.id}-row-${index}`}>
                        <div className="port-slot input-slot">
                          {input ? (
                            <>
                              <MultiConnectionSocketTooltip
                                enabled={isMultiInputPort(node.id, input.id) && !skipMultiConnectionTooltip}
                                direction="input"
                                onDisable={() => setSkipMultiConnectionTooltip(true)}
                              >
                              <button
                                ref={(element) => { portRefs.current[`${node.id}:${input.id}`] = element; }}
                                type="button"
                                disabled={inputDisabled}
                                className={`port-socket ${inputDisabled ? "disabled" : ""} ${isMultiInputPort(node.id, input.id) ? "multi-connection" : ""} ${getPortConnectionClass(node.id, input)} ${inputFilled ? "filled" : ""} ${connectionTutorialExtractorId === node.id && input.id === "resource-in" ? "connection-tutorial-port" : ""}`}
                                style={{ "--port-color": RESOURCE_COLORS[input.type] } as React.CSSProperties}
                                data-port-node={node.id}
                                data-port-id={input.id}
                                aria-label={`${node.title} ${input.label} input, ${input.type} type${isMultiInputPort(node.id, input.id) ? ", supports multiple connections" : ""}`}
                                aria-describedby={showSocketGuide && hoveredNodePort?.id === input.id ? socketGuideId : undefined}
                                onPointerEnter={() => setHoveredPort({ nodeId: node.id, port: input })}
                                onPointerLeave={() => clearHoveredPort(node.id, input.id)}
                                onFocus={() => setHoveredPort({ nodeId: node.id, port: input })}
                                onBlur={() => clearHoveredPort(node.id, input.id)}
                                onPointerDown={(event) => beginConnection(event, node.id, input)}
                              >
                                {isMultiInputPort(node.id, input.id) ? <span className="multi-port-star" aria-hidden="true" /> : null}
                              </button>
                              </MultiConnectionSocketTooltip>
                              {!isResearchFoundry ? <PortLabel label={input.label} /> : null}
                              {manualIngredientSlot ? (
                                <span className="ingredient-quantity-control">
                                  <span className="input-check">
                                    {manualIngredientStored}/{manualIngredientSlot.capacity}
                                  </span>
                                  <span className="ingredient-add-actions">
                                    {manualIngredientChoices.map((choice) => {
                                      const available = getStoredItemAmount(
                                        runtime,
                                        nodes,
                                        connections,
                                        choice,
                                        new Set([node.id]),
                                      );
                                      const remainingCapacity = Math.max(
                                        0,
                                        isResearchFoundry && isCoreType(choice)
                                          ? RESEARCH_CORE_CAPACITY_PER_TYPE - getResearchFoundryCoreCount(
                                              researchFoundryState ?? undefined,
                                              choice,
                                            )
                                          : manualIngredientSlot.capacity - manualIngredientStored,
                                      );
                                      const disabled =
                                        available <= 0 ||
                                        remainingCapacity <= 0 ||
                                        (isMiningDrill && !miningDrillTarget) ||
                                        (isResearchFoundry && isAllResearchComplete(runtime.research));
                                      return (
                                        <button
                                          type="button"
                                          className="ingredient-add-button"
                                          key={choice}
                                          disabled={disabled}
                                          title={`Add ${formatResourceType(choice)} · ${available} stored in other nodes`}
                                          aria-label={`Add ${formatResourceType(choice)} to ${node.title}, ${available} stored in other nodes`}
                                          style={{ "--ingredient-color": RESOURCE_COLORS[choice] } as React.CSSProperties}
                                          onPointerDown={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                          }}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            manuallyFillIngredient(node.id, manualIngredientSlot.portId, choice);
                                          }}
                                        >
                                          +
                                        </button>
                                      );
                                    })}
                                  </span>
                                </span>
                              ) : inputStatus ? (
                                <span className="input-check">{inputStatus}</span>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                        <div className="port-slot output-slot">
                          {output ? (
                            <>
                              {isFilter && output.id === "filter-out" ? (
                                <button
                                  type="button"
                                  className="filter-output-select"
                                  title={filterState?.selectedType ? `Change ${formatResourceType(filterState.selectedType)} filter` : "Choose filtered item"}
                                  aria-label={`Configure Filter${filterState?.selectedType ? `, currently ${formatResourceType(filterState.selectedType)}` : ""}`}
                                  disabled={isBuilding}
                                  onPointerDown={(event) => {
                                    if (event.button === 0) event.stopPropagation();
                                  }}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setConfiguringFilterId(node.id);
                                  }}
                                >
                                  {output.label}
                                </button>
                              ) : (
                                <PortLabel label={output.label} />
                              )}
                              <MultiConnectionSocketTooltip
                                enabled={isMultiOutputPort(node.id, output.id) && !skipMultiConnectionTooltip}
                                direction="output"
                                onDisable={() => setSkipMultiConnectionTooltip(true)}
                              >
                              <button
                                ref={(element) => { portRefs.current[`${node.id}:${output.id}`] = element; }}
                                type="button"
                                disabled={outputDisabled}
                                className={`port-socket ${outputDisabled ? "disabled" : ""} ${isMultiOutputPort(node.id, output.id) ? "multi-connection" : ""} ${getPortConnectionClass(node.id, output)} ${outputFilled ? "filled" : ""} ${connectionTutorialExtractorId && node.id === "stone" && output.id === "stone-out" ? "connection-tutorial-port" : ""}`}
                                style={{
                                  "--port-color": isForest && output.id === "forest-out"
                                    ? RESOURCE_COLORS[ResourceType.FOREST]
                                    : RESOURCE_COLORS[output.type],
                                } as React.CSSProperties}
                                data-port-node={node.id}
                                data-port-id={output.id}
                                aria-label={`${node.title} ${output.label} output, ${output.type} type${isMultiOutputPort(node.id, output.id) ? ", supports multiple connections" : ""}`}
                                aria-describedby={showSocketGuide && hoveredNodePort?.id === output.id ? socketGuideId : undefined}
                                onPointerEnter={() => setHoveredPort({ nodeId: node.id, port: output })}
                                onPointerLeave={() => clearHoveredPort(node.id, output.id)}
                                onFocus={() => setHoveredPort({ nodeId: node.id, port: output })}
                                onBlur={() => clearHoveredPort(node.id, output.id)}
                                onPointerDown={(event) => beginConnection(event, node.id, output)}
                              >
                                {isMultiOutputPort(node.id, output.id) ? <span className="multi-port-star" aria-hidden="true" /> : null}
                              </button>
                              </MultiConnectionSocketTooltip>
                            </>
                          ) : null}
                        </div>
                      </div>
                     );
                   })}
                  {isResearchFoundry && !isBuilding ? (
                    <div
                      className="research-core-storage-summary"
                      aria-label={`${researchFoundryBasicCores} Basic Cores and ${researchFoundryAutomataCores} Automata Cores stored`}
                    >
                      <button
                        type="button"
                        disabled={researchFoundryBasicCoresAvailable <= 0}
                        title={`Feed 1 Basic Core · ${researchFoundryBasicCoresAvailable} in base inventory`}
                        aria-label={`Feed one Basic Core from base inventory to Research Center, ${researchFoundryBasicCores} currently loaded and ${researchFoundryBasicCoresAvailable} in base inventory`}
                        style={{ "--core-color": RESOURCE_COLORS[ResourceType.BASIC_CORE] } as React.CSSProperties}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          manuallyFillIngredient(node.id, "research-core-in", ResourceType.BASIC_CORE);
                        }}
                      >
                        <b>Basic</b>
                        <strong>{researchFoundryBasicCores}/{RESEARCH_CORE_CAPACITY_PER_TYPE}</strong>
                      </button>
                      <button
                        type="button"
                        disabled={researchFoundryAutomataCoresAvailable <= 0}
                        title={`Feed 1 Automata Core · ${researchFoundryAutomataCoresAvailable} in base inventory`}
                        aria-label={`Feed one Automata Core from base inventory to Research Center, ${researchFoundryAutomataCores} currently loaded and ${researchFoundryAutomataCoresAvailable} in base inventory`}
                        style={{ "--core-color": RESOURCE_COLORS[ResourceType.AUTOMATA_CORE] } as React.CSSProperties}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          manuallyFillIngredient(node.id, "research-core-in", ResourceType.AUTOMATA_CORE);
                        }}
                      >
                        <b>Automata</b>
                        <strong>{researchFoundryAutomataCores}/{RESEARCH_CORE_CAPACITY_PER_TYPE}</strong>
                      </button>
                    </div>
                  ) : null}
                </div>
                )}

                <div className="node-body">
                  {isJoint || isPowerSplitter ? (
                    isBuilding ? (
                      <>
                        <div className="progress-label joint-progress-label">
                          <span>Building</span>
                          <strong>{Math.round(nodeProgress)}%</strong>
                        </div>
                        <SmoothProgress
                          className="machine-progress"
                          value={nodeProgress}
                          active={smoothProgressActive}
                          cycleDuration={smoothProgressDuration ?? buildDuration}
                          aria-label={`${node.title} construction progress`}
                        />
                      </>
                    ) : null
                  ) : isStorage && !isBuilding ? null : isWoodenChest && !isBuilding ? (
                    <div className="wooden-chest-status">
                      <strong>{woodenChestItemType ? formatResourceType(woodenChestItemType) : "Awaiting item"}</strong>
                      <span>
                        {woodenChestItemType
                          ? `${woodenChestStored} / ${WOODEN_CHEST_CAPACITY} stored`
                          : `${WOODEN_CHEST_CAPACITY} item capacity`}
                      </span>
                    </div>
                  ) : isMiningDrill && !isBuilding ? (
                    <button
                      type="button"
                      className="mining-drill-config-button"
                      aria-label={`Choose Mining Drill ore resource${miningDrillTarget ? `, currently ${miningDrillTarget.title}` : ""}`}
                      onPointerDown={(event) => {
                        if (event.button === 0) event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setConfiguringMiningDrillId(node.id);
                      }}
                    >
                      <span className="mining-drill-config-heading">
                        <span className="filter-config-icon"><Pickaxe aria-hidden="true" /></span>
                        <span className="filter-config-copy">
                          <small>ORE TARGET · CLICK TO CHANGE</small>
                          <strong>{miningDrillTarget?.title ?? "Choose ore resource"}</strong>
                        </span>
                        <span className="mining-drill-iterations">
                          {miningDrillState?.iterations ?? 0}/{MINING_DRILL_ITERATIONS}
                        </span>
                      </span>
                      <SmoothProgress
                        className="machine-progress mining-drill-progress"
                        value={nodeProgress}
                        active={false}
                        cycleDuration={1}
                        aria-label={`Mining Drill, ${miningDrillState?.iterations ?? 0} of ${MINING_DRILL_ITERATIONS} Motors accepted`}
                      />
                      <span className="mining-drill-status">{progressStatus} · {nodeMetaLabel}</span>
                    </button>
                  ) : isFiniteResource ? (
                    <>
                      <div className="progress-label">
                        <span>{resourceRemaining > 0 ? `${node.title} remaining` : "Deposit exhausted"}</span>
                        <strong>{resourceRemaining} / {resourceCapacity}</strong>
                      </div>
                      <div className="resource-manual-extract-row">
                        {starterCollectHintVisible ? (
                          <StarterActionHint
                            encouraging={starterCollectHintEncouraging}
                            targetLabel={starterCollectHintTarget}
                          />
                        ) : null}
                        <Tooltip delayDuration={250}>
                          <TooltipTrigger asChild>
                            <span className="resource-manual-extract-trigger">
                              <button
                                type="button"
                                className="resource-manual-extract"
                                disabled={
                                  resourceRemaining <= 0 ||
                                  !manualResourceProduct ||
                                  baseInventoryAmount >= BASE_INVENTORY_CAPACITY
                                }
                                aria-label={manualResourceProduct
                                  ? `Extract one ${formatResourceType(manualResourceProduct)} to base inventory, ${baseInventoryAmount} of ${BASE_INVENTORY_CAPACITY} stored`
                                  : "Resource cannot be extracted"}
                                onPointerDown={(event) => {
                                  if (event.button !== 0) return;
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  manuallyExtractResource(node.id);
                                }}
                              >
                                <Pickaxe aria-hidden="true" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            className="resource-manual-extract-tooltip"
                            side="top"
                            sideOffset={10}
                            collisionPadding={{ top: 12, right: 12, bottom: 12, left: 12 }}
                            avoidCollisions
                            style={{
                              "--item-color": manualResourceProduct
                                ? RESOURCE_COLORS[manualResourceProduct]
                                : RESOURCE_COLORS.RESOURCE,
                            } as React.CSSProperties}
                          >
                            <span className="resource-manual-extract-tooltip-icon">
                              <Pickaxe aria-hidden="true" />
                            </span>
                            <div>
                              <strong>
                                {resourceRemaining <= 0
                                  ? "Resource depleted"
                                  : baseInventoryAmount >= BASE_INVENTORY_CAPACITY
                                    ? "Base inventory full"
                                    : manualResourceProduct
                                      ? `Extract 1 ${formatResourceType(manualResourceProduct)}`
                                      : "Cannot extract"}
                              </strong>
                              <span>{baseInventoryAmount} / {BASE_INVENTORY_CAPACITY} stored</span>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Progress className="machine-progress" value={nodeProgress} aria-label={`${node.title} remaining`} />
                      <div className="node-meta">
                        <span>{isForest ? "Regenerates 1 Wood / 30s" : "Finite source"}</span>
                      </div>
                    </>
                  ) : isGenerator && !isBuilding ? (
                    <>
                      <div className="production-progress-value">
                        <strong>{generatorPower}W / {GENERATOR_MAX_POWER}W</strong>
                      </div>
                      <Progress className="machine-progress" value={displayedNodeProgress} aria-label={`${generatorPower} watts stored`} />
                      <div className="production-progress-percent">{Math.round(displayedNodeProgress)}%</div>
                      <div className="node-meta">
                        <span>{formatCycleDuration(effectiveProductionCycleDuration ?? 0)}</span>
                        <span className="node-meta-actions">
                          <span className={generatorPower > 0 ? "ready-pill full" : "ready-pill"}>
                            {generatorPower >= GENERATOR_MAX_POWER ? "FULL" : generatorPower > 0 ? "CHARGED" : "EMPTY"}
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (isSplitter || isMerger || isFilter) && !isBuilding ? null
                  : (
                    <>
                      {productionStoredItems !== null && productionStoredCapacity !== null ? (
                        <div className="production-progress-value">
                          <strong>{productionStoredItems} / {productionStoredCapacity}</strong>
                        </div>
                      ) : isResearchFoundry && !isBuilding ? (
                        <div className="research-production-state">
                          {researchIsProducing ? (
                            <span className="research-state-indicator active" role="status">
                              ACTIVE
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="research-state-indicator inactive"
                              aria-label="Open Research, currently inactive"
                              onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setResearchOpen(true);
                              }}
                              onClick={(event) => {
                                event.stopPropagation();
                                setResearchOpen(true);
                              }}
                            >
                              INACTIVE
                            </button>
                          )}
                        </div>
                      ) : isProductionNode ? (
                        <div className="production-progress-value">
                          <strong>{Math.round(displayedNodeProgress)} / 100</strong>
                        </div>
                      ) : (
                        <div className="progress-label">
                          <span>{progressStatus}</span>
                          <strong>{Math.round(nodeProgress)}%</strong>
                        </div>
                      )}
                      {smoothProgressDuration && !(
                        isResearchFoundry && !isBuilding && !researchIsProducing
                      ) ? (
                        <SmoothProgress
                          className="machine-progress"
                          value={displayedNodeProgress}
                          active={smoothProgressActive}
                          cycleDuration={smoothProgressDuration}
                          aria-label={isBuilding
                            ? `${node.title} construction progress`
                            : productionStoredItems !== null && productionStoredCapacity !== null
                              ? `${node.title} production progress, ${productionStoredItems} of ${productionStoredCapacity} items stored`
                              : `${node.title} progress`}
                        />
                      ) : (
                        <Progress
                          className="machine-progress"
                          value={displayedNodeProgress}
                          aria-label={`${node.title} progress`}
                        />
                      )}
                      {isProductionNode ? (
                        <div className="production-progress-percent">{Math.round(displayedNodeProgress)}%</div>
                      ) : null}
                      <div className={`node-meta ${isConfigurableProcessor ? "assembler-node-meta" : ""}`}>
                        <span>{isBuilding ? `${(buildDuration / 1000).toFixed(0)}s build` : nodeMetaLabel}</span>
                        {isConfigurableProcessor ? (
                          <span className="assembler-selected-recipe">
                            {processorRecipe?.title ?? "No recipe selected"}
                          </span>
                        ) : null}
                        <span className="node-meta-actions">
                          <span className={nodeFull || (isResearchFoundry && isAllResearchComplete(runtime.research)) ? "ready-pill full" : `ready-pill ${isBuilding ? "building" : ""}`}>
                            {isBuilding
                              ? "BUILDING"
                              : isResearchFoundry && isAllResearchComplete(runtime.research)
                                ? "COMPLETE"
                                : nodeFull
                                  ? "FULL"
                                  : isIdle ? "IDLE" : "ACTIVE"}
                          </span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {isConfigurableProcessor ? (
                  <ViewportBoundTooltip
                    className="assembler-recipe-tooltip"
                    measurementKey={`${node.id}:${positions[node.id]?.x ?? 0}:${positions[node.id]?.y ?? 0}:${zoom}:${processorRecipe?.title ?? "none"}`}
                    role="tooltip"
                    aria-label={processorRecipe
                      ? `${processorRecipe.title} recipe: ${processorRecipe.summary}`
                      : "No recipe selected."}
                  >
                    {processorRecipe ? (
                      <>
                        <div className="assembler-recipe-tooltip-heading">
                          <span>Selected recipe</span>
                          <strong>{processorRecipe.title}</strong>
                        </div>
                        <div className="assembler-recipe-tooltip-section">
                          <span>Required ingredients</span>
                          <ul>
                            {assemblerIngredientRows.map((ingredient) => (
                              <li key={ingredient.type}>
                                <i style={{ background: RESOURCE_COLORS[ingredient.type] }} />
                                <strong>{ingredient.amount}&times;</strong>
                                <span>{ingredient.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="assembler-recipe-tooltip-output">
                          <span>Output</span>
                          <div>
                            <i style={{ background: RESOURCE_COLORS[processorRecipe.output.type] }} />
                            <strong>1&times;</strong>
                            <span>{processorRecipe.output.label}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="assembler-recipe-tooltip-empty">No recipe selected.</div>
                    )}
                  </ViewportBoundTooltip>
                ) : null}
                {showSocketGuide && hoveredNodePort ? (
                  <ViewportBoundTooltip
                    id={socketGuideId}
                    className={`node-connect-tooltip visible ${hoveredNodePort.direction}-guide`}
                    measurementKey={`${node.id}:${positions[node.id]?.x ?? 0}:${positions[node.id]?.y ?? 0}:${zoom}:${hoveredNodePort.direction}:${hoveredPortIndex}`}
                    role="tooltip"
                    aria-label={`${hoveredNodePort.direction === "input" ? "Acceptable sources" : "Acceptable destinations"} for ${node.title} ${hoveredNodePort.label}`}
                    style={{
                      "--tooltip-top": `${67 + Math.max(0, hoveredPortIndex) * 30}px`,
                    } as React.CSSProperties}
                  >
                    <div className="node-connect-tooltip-heading">
                      <span>
                        {hoveredNodePort.direction === "input" ? "Acceptable sources" : "Acceptable destinations"}
                      </span>
                      <strong>{connectionOptions.length}</strong>
                    </div>
                    {visibleConnectionOptions.length > 0 ? (
                      <ul>
                        {visibleConnectionOptions.map((option) => (
                          <li key={`${node.id}-${option.nodeId}-${option.mode}`}>
                            <i style={{ background: option.color, color: option.color }} />
                            <div className="node-connect-tooltip-copy">
                              <div>
                                <em className={option.mode}>
                                  {option.mode === "send" ? "Send to" : "Receive from"}
                                </em>
                                <strong>{option.title}</strong>
                                {option.connected ? <b>Connected</b> : null}
                              </div>
                              <small>{option.eyebrow} · {option.routes.join(" · ")}</small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="node-connect-tooltip-empty">
                        No compatible open {hoveredNodePort.direction === "input" ? "outputs" : "inputs"}
                      </div>
                    )}
                    {connectionOptions.length > visibleConnectionOptions.length ? (
                      <div className="node-connect-tooltip-more">
                        +{connectionOptions.length - visibleConnectionOptions.length} more available
                      </div>
                    ) : null}
                  </ViewportBoundTooltip>
                ) : null}
              </section>
            );
          })}

        </div>
        </div>

        <div className="zoom-controls" aria-label="Canvas zoom controls">
          <Button
            className="zoom-button"
            size="icon-xs"
            variant="ghost"
            aria-label="Zoom out"
            title="Zoom out"
            onClick={() => zoomAtPoint(zoomRef.current - 0.1)}
          >
            <Minus />
          </Button>
          <Button
            className="zoom-level"
            size="sm"
            variant="ghost"
            aria-label={`Reset zoom, currently ${Math.round(zoom * 100)} percent`}
            title="Reset zoom"
            onClick={() => zoomAtPoint(1)}
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            className="zoom-button"
            size="icon-xs"
            variant="ghost"
            aria-label="Zoom in"
            title="Zoom in"
            onClick={() => zoomAtPoint(zoomRef.current + 0.1)}
          >
            <Plus />
          </Button>
        </div>
      </div>

      {replicationResourceWarning ? (
        <span
          className="replication-resource-tooltip"
          key={replicationResourceWarning.token}
          role="tooltip"
          aria-live="polite"
          style={{
            "--replication-tooltip-x": `${replicationResourceWarning.clientX}px`,
            "--replication-tooltip-y": `${replicationResourceWarning.clientY}px`,
          } as React.CSSProperties}
        >
          <TriangleAlert aria-hidden="true" />
          Not enough resources
        </span>
      ) : null}

      {obstructionTooltip ? (
        <CursorObstructionTooltip
          tooltip={obstructionTooltip}
          runtime={runtime}
          mapNodeValue={getMapNodeValue(activeMapSector)}
        />
      ) : null}

      <Toaster
        position="bottom-center"
        expand
        gap={12}
        visibleToasts={10}
      />
    </main>
    </TooltipProvider>
  );
}
