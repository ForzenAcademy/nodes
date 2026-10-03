# FACTORINODE Changelog

## September 26, 2026

### Production controls

- Added an output pause toggle beside the trash control on every production building with an output. Paused machines keep their cables and continue filling their internal output buffer, but do not send completed items downstream until resumed.
- Extended the same output gate to Charcoal Generator power and Tree Planter reforestation signals, including routes through Joints and Power Splitters.
- Converted Extractor 2 research from a separate building blueprint into a global upgrade. Once researched, every existing and future Extractor runs at exactly 90% of its base cycle time (4.5s for ore and stone; 3.6s for wood).
- Removed the Inventory node's temporary first-resource unlock. It now remains locked and hidden from the normal Build menu until a future unlock trigger is assigned.
- Removed the Storage node's temporary first-resource unlock. It now remains locked and hidden from the normal Build menu until a future unlock trigger is assigned.

### Resources

- Increased the starting Iron Ore, Copper Ore, and Stone deposits from 200 to 1,000 units each.
- Release: `da58945` — Increase starting deposit capacities
- Renamed the Forest resource output socket to `Log` while preserving its Forest resource typing.
- Release: `35598be` — Rename Forest output to Log

### Power

- Renamed the Generator node to **Charcoal Generator** across the node canvas, Build catalog, discovery data, and every dependent unlock requirement while preserving its existing charcoal and power behavior.
- Release: `d2f42d6` — Rename Generator to Charcoal Generator

### Research and reforestation

- Gated the Forest's Reforestation input behind completed Tree Planter research; fresh games show only the Log output, and the new input socket appears immediately when the research completes.
- Release: `42e24e7` — Gate Forest input behind research
- Added **Exploration**, a five–Automata Core research project that unlocks the Map.
- Added a Map button immediately to the left of Research after Exploration is complete.
- Added a scrollable 13 × 13 sector map centered on a glowing Home tile (`H`), with the four bordering sectors available for destination selection and the wider uncharted grid ready for future expansion.
- Release: `cedbe02` — Add Exploration research and sector map
- Added a five-core Mining Drill research project that unlocks the Mining Drill blueprint.
- Added the Mining Drill at a construction cost of 2 Motors, with a 10W Power input and no output socket while drilling.
- Added an in-node ore selector for Iron Ore, Copper Ore, or Stone. Each powered three-second cycle advances the drill once; after 20 cycles it transforms in place into an independent 1,000-unit deposit of the chosen resource.
- Made completed drill deposits support multiple Extractors, independent depletion totals, depleted-cable status, and routing through existing smart logistics nodes.
- Release: `b9e91fc` — Add Mining Drill research and deposits
- Reduced the Tree Planter's operating power cost from 10W to 5W per reforestation cycle.
- Release: `fb4311a` — Reduce Tree Planter power cost
- Changed the Research Foundry construction cost to 10 Stone, 1 Circuit A, and 1 Motor.
- Release: `8a1f91e` — Update Research Foundry cost
- Replaced the passive top-bar research meter with a Research button to the left of Inventory. It appears when the first Automata Core enters a Research Foundry and opens a scrollable project-selection modal.
- Converted research into selectable projects. A loaded Foundry waits safely until a project is chosen, analyzes one Automata Core every 20 seconds, and preserves completed progress when switching projects.
- Kept **Extractor 2** as a five-core research option and added a second five-core project that unlocks the **Tree Planter**.
- Added the Tree Planter blueprint at a build cost of 1 Motor and 4 Iron Plates.
- Added a 10W Power input and a reforestation output to the Tree Planter. Each one-second powered cycle restores one depleted unit to a connected Forest.
- Added a dedicated reforestation input to Forest nodes and capped regeneration at the Forest's 1,000-unit capacity.

### Journal

- Reversed the Discovery Journal timeline so the most recently unlocked blueprint appears at the top while retaining its original discovery number.
- Added a pulsing Journal notification with a glowing discovery marker whenever a new blueprint is unlocked; opening the Journal acknowledges it.
- Added Production and Logistics filters to the Discovery Journal, including live category counts, toggle-to-show-all behavior, and category-specific empty states.
- Release: `fdf432d` — Sort discovery journal newest first
- Release: `70f8fdc` — Highlight new journal discoveries
- Release: `1cedc33` — Add discovery journal filters

### Node destruction

- Added an explicit inventory-overflow warning when destroying buildings. It lists the exact materials that cannot fit, requires a **Destroy & lose materials** confirmation, salvages anything that still fits, and permanently discards only the overflow.
- Reused the warning for trash-button and Delete/Backspace destruction, including completed output that would otherwise be stranded by removed cables.
- Release: `d2d0f00` — Allow destructive refunds when Inventory is full

### Inventory safety

- Extended the destructive overflow confirmation to Collect, cable deletion, drag-to-disconnect, and rewiring actions. The dialog lists exact losses, cancels safely by default, and lets the player proceed while keeping everything that fits and permanently destroying only the overflow.
- Release: `132c4bf` — Confirm destructive inventory overflow

### Canvas interaction

- Scoped production-completion cable feedback to outgoing transfers only; completing Extractors and Tree Planters no longer reanimate their Resource or Power input cables.
- Release: `dbedb0c` — Scope production pulses to outputs
- Added persistent color-coded control groups. Box-selecting two or more nodes, or Ctrl/Cmd-clicking a selection, now opens a ten-color colorblind-friendly palette before grouping them.
- Single-clicking any grouped node selects and moves the full group, double-clicking isolates one member for individual control, and right-clicking a member opens a confirmation to disband the group without moving or deleting its nodes.
- Release: `f78741f` — Add color-coded node control groups
- Release: `013fb1c` — Refine control group multi-select timing
- Removed hard collision barriers during node dragging so individual and box-selected groups can move freely through other nodes.
- Kept overlap prevention at drop time: overlapping nodes show **Move clear to drop**, and an invalid release returns the selection to its most recent valid non-overlapping position.
- Release: `ac0e328` — Allow nodes to drag through each other

### Routing nodes

- Centered every Power Splitter connector precisely over its corresponding node border, including the border's half-pixel centerline, so each edge cleanly bisects its socket circle on all four sides.
- Release: `be613e4` — Center power splitter sockets
- Added a compact trash control at the true Bézier midpoint of a selected cable. It stays a consistent screen size while zooming and opens the existing safe connection-deletion confirmation flow.
- Release: `76f571a` — Add selected cable trash control
- Replaced the text gear glyph on Production routing sockets with the same Factory icon used by the Build menu's Production filter, including Splitter, Merger, Filter, Inventory, Storage, and their Build-menu port previews.
- Release: `e656b96` — Match production port icons
- Made Splitter, Merger, and Joint outputs retain their last valid cable type when their input is disconnected, keeping all output-side connections physically attached while the logistics node is idle.
- Made logistics input changes transactional: a proposed input is rejected when its type would invalidate any retained output route, with guidance to reroute or disconnect the conflicting output first.
- Release: `616ff07` — Retain disconnected logistics outputs
- Changed cable removal and rewiring to revalidate each surviving downstream route independently. Breaking an upstream connection now preserves every output-side cable whose resolved type is still compatible, including smart nodes with another usable input and generic routes into Storage.
- Release: `60382aa` — Preserve valid downstream connections
- Fixed Filter placement so its centered item-type selector no longer intercepts the click that commits a newly built Filter to the canvas.
- Release: `fa6d72d` — Fix Filter node placement
- Made star-socket clicks use the synchronous cable gesture state so even very quick clicks reliably open the connection manager in production builds.
- Release: `387d4a1` — Make star socket clicks reliable
- Made a plain click on any star socket open a multi-connection manager listing every attached route with an individual Disconnect action; dragging the same star continues to create or rewire cables.
- Release: `4607438` — Add multi-connection socket manager
- Added a hover and keyboard-focus tooltip to every star socket explaining that it accepts multiple cable connections at once.
- Release: `facf215` — Explain multi-connection star sockets
- Added a connection-deletion prompt when a cable is clicked, with a clear source-to-target summary and explicit Keep Connection or Delete Connection actions; Delete/Backspace on a selected cable now opens the same confirmation.
- Release: `5fea65e` — Add cable deletion confirmation
- Replaced every multi-connection socket with a star shape, including shared resource and Inventory outputs, Charcoal Generator Power output, and Storage input; single-connection sockets remain circular.
- Release: `27c60b1` — Mark multi-connection sockets with stars
- Clarified in the Build menu that one Storage node can accept connections from multiple item-producing nodes at the same time.
- Release: `9b67183` — Clarify Storage multi-input support
- Made close left-to-right cables use non-crossing Bézier handles so connections no longer curl backward when nodes are near each other.
- Release: `414e33c` — Prevent close cable reverse curves
- Removed the Inventory/count readout from completed Storage nodes and collapsed their empty body, leaving only the Storage header and input socket.
- Release: `0ef8d03` — Remove Storage inventory readout
- Resized the Filter to the same 67.5 × 67.5 compact footprint as Splitter and Merger.
- Replaced the Filter input label with the production symbol (`⚙`) and moved item-type configuration onto the output label itself; selecting an item updates both the button text and smart output type.
- Release: `a0983a3` — Compact Filter routing node
- Added a compact 54 × 54 Power Splitter logistics node with the Generator lightning icon, one Power-only inlet on the left, and independent Power-only branches on the top, right, and bottom.
- Made Power Splitters relay their upstream Generator reserve through chained power networks, unlock after the first Generator is built, and cost 1 Stone plus 1 Copper Wire.
- Release: `698abad` — Add compact Power Splitter node
- Release: `eb92e5a` — Orient Power Splitter cable branches
- Reshaped Splitter and Merger into matching 67.5 × 67.5 pixel squares, exactly 25% larger than the 54 × 54 Joint, with icon-only headers and edge-mounted sockets.
- Relabeled the Splitter input with the production symbol (`⚙`) and shortened its output names to `A` and `B`, including the compact on-node socket labels.
- Shortened the Merger input names to `A` and `B` and replaced its output name with the production symbol (`⚙`), including the compact on-node socket labels.
- Replaced the Inventory node's output name with the production symbol (`⚙`).
- Replaced the Storage node's input name with the production symbol (`⚙`).
- Release: `9405022` — Make routing nodes compact squares
- Release: `c7c7078` — Refine Splitter port labels
- Release: `4370170` — Refine Merger port labels
- Release: `1d38386` — Refine Inventory output label
- Release: `660f605` — Refine Storage input label

### Release

- `e2e5241` — Add selectable research and Tree Planter

## September 25, 2026

### Resources and extraction

- Increased every item-producing building's completed-output buffer to five items, with bulk collection, safe disconnect recovery, automatic downstream delivery, and visible stored/full counts.
- Added **Collect** buttons to every manufacturing node that produces inventory items, matching the Extractor flow and preserving full-inventory protection.
- Made Forest a finite resource with 200 units, matching the other deposits.
- Removed the automatically generated starter Storage node; players now unlock and construct their first Storage after collecting an Extractor-produced resource.
- Increased each Extractor's output buffer to five items.
- Added a **Collect** button to Extractors. It moves one completed buffered item into Inventory and is disabled when the Extractor is empty.
- Added inventory-capacity protection to manual collection so a full Inventory cannot consume or lose an Extractor item.
- Preserved completed machine outputs when their route is disconnected. Orphaned items are moved into Inventory, and the disconnect is blocked if Inventory cannot safely hold them.
- Kept an unconnected Extractor output generic, allowing its existing cable to remain attached to an `Anything` input such as Storage when the source resource is removed.

### Node destruction

- Added a trash button to every constructable node.
- Added a confirmation dialog before destroying nodes.
- Made Backspace and Delete use the same confirmation flow.
- Destroying a constructed node refunds its complete build recipe to Inventory.
- Made the starter Extractor count as constructed so destroying it refunds 2 Wood and 2 Stone, matching player-built Extractors.
- Added capacity checks so destruction cannot discard refunds when Inventory is full.

### Cable UX

- Matched the Merger to the Splitter's compact 50%-scale footprint, including socket spacing, build progress, collision bounds, and placement sizing.
- Reduced the Splitter footprint by 50% in both dimensions, with compact controls, accurate cable anchors, and matching collision bounds.
- Restricted Storage cables to inventory-item outputs and approved smart outputs; Power, raw deposits, and other non-storable types are rejected, including when a connected Joint resolves to an invalid type.
- Removed the bottom status bubbles from completed Splitter and Merger nodes, making both routing nodes more compact while retaining their construction progress state.
- Hovering an input or output socket now highlights every compatible, currently available socket it can connect to.
- Incompatible or already-occupied single-connection sockets remain visually excluded.
- Replaced the native socket tooltip with a node-hover connection guide listing compatible available nodes, send/receive direction, matching ports, and existing connections.

### Build-menu progression

- Added a journal beside Build that records every unlocked node blueprint and its elapsed unlock time from the start of the current game, presented as a scrollable chronological timeline.
- Gave every constructable node an explicit unlock trigger and made the Build menu reveal it as soon as that milestone is satisfied.
- Replaced generic full-recipe discovery with a production-chain progression: first extraction unlocks core logistics, Wood unlocks routing and the Kiln, built and produced components unlock the metal, power, automation, and research tiers in sequence.
- Refined progression triggers so collected Wood unlocks the Kiln, collected Iron or Copper unlocks the Furnace, produced Charcoal unlocks the Generator, produced Plates unlock both plate processors, and building a Generator reveals the four advanced factory and research nodes.
- Changed a fresh game to show only the Extractor in the Build menu.
- New machine types are revealed as their recipes first become affordable.
- Added a flashing Build button when a never-built machine becomes newly available; opening the menu acknowledges the alert.
- Added a flashing **New** state to newly available machine cards; hovering or focusing the card acknowledges it.
- Kept Extractor 2 hidden until its research unlock is complete.
- Locked Storage, Splitter, Merger, Filter, and Inventory until the player collects their first Extractor-produced item.
- Made that logistics milestone trigger through manual collection, Storage delivery, or safe disconnect recovery—but not merely from buffering an item inside the Extractor.
- Highlighted every Logistics card revealed by the first collection with the pulsing **New** state, even when its recipe is not yet affordable.
- Added a hard build guard so milestone-locked logistics nodes cannot be constructed indirectly.

### Build-menu filtering and clarity

- Added a temporary **Show all nodes** inspector that reveals every machine, keeps progression locks enforced, and adds live unlock-trigger requirements to each card.
- Added a **Buildable only** filter that keeps unavailable machines beneath buildable machines when disabled.
- Added clear missing-material summaries to unaffordable machine cards.
- Matched the Build button width to the missing-material action state and widened the shared action column so **Missing items** remains comfortably legible.
- Restricted construction costs to items actually held in Inventory; completed outputs still sitting in machines no longer count as building materials.
- Added **Production** and **Logistics** category filters at the top of the Build menu.
- Classified Storage, Splitter, Merger, Joint, Filter, and Inventory as Logistics; extraction, processing, power, and research machines are Production.
- Made category filters combine with **Buildable only**. Clicking the active category a second time returns to the complete catalog.
- Added category counts and progression-aware empty states.
- Added a dedicated **Category** column to every node row while the temporary **Show all nodes** inspector is active.
- Changed manual collection to transfer every completed item held by a machine in one click, while preserving any overflow when Inventory reaches its per-item cap.
- Removed connection-hover tooltips from every Logistics node while retaining them for resource and production nodes.
- Removed Logistics nodes from the send/receive suggestions listed inside Production and resource node hover tooltips.
- Reworked connection guidance to appear only when hovering or focusing a Production socket: input sockets list acceptable source outputs, output sockets list acceptable destination inputs, and matching remote sockets light up in the graph.
- Expanded the invisible pointer/touch hit area around every input and output socket without changing its visible size or cable anchor; compact Splitter sockets use a tighter non-overlapping expansion.
- Converted every collection/inventory-based unlock milestone to production history: unlocks now fire when the required item is completed, even if it is immediately routed onward or never manually collected.
- Increased the starting Forest deposit from 200 to 1,000 Wood and updated its capacity readout and progress scaling accordingly.

### Releases

- Built, committed, pushed, and live-verified every update above on the GitHub Pages release.
- Deployment commits, oldest to newest:
  - `40c341f` — Make Forest resources finite
  - `b5676d7` — Preserve completed items on disconnect
  - `5ac2ef1` — Add manual Extractor collection
  - `7131f84` — Add five-item Extractor buffers
  - `40ceb36` — Add confirmed node destruction refunds
  - `7ed277e` — Improve extractor routing and build menu
  - `cf125f6` — Highlight compatible node sockets
  - `8dbc2bd` — Add progressive building discovery
  - `6085580` — Gate logistics nodes behind first collection
  - `d8c4bc3` — Add build menu category filters
  - `6cfb866` — Refund starter Extractor build cost
  - `813a635` — Unlock Storage after first collection
  - `a69800c` — Remove starter Storage node
  - `b6e1070` — Widen build menu action column
  - `57c0f03` — Add node connection hover guides
  - `1008271` — Highlight first collection unlocks
  - `c106344` — Add temporary build unlock inspector
  - `f2bf77c` — Add milestone unlocks for every node
  - `21e0d96` — Refine production unlock milestones
  - `fb15cc1` — Add collection controls to item producers
  - `278b21c` — Remove Splitter and Merger status bubbles
  - `bb1c188` — Restrict Storage input compatibility
  - `2990d1d` — Shrink Splitter node footprint
  - `4f8fb8e` — Show node categories in build inspector
  - `62676c7` — Collect complete machine output buffers
  - `99e2b53` — Remove Logistics node hover tooltips
  - `b3b4c02` — Filter Logistics from connection tooltips
  - `2ceec2c` — Add socket-specific connection guides
  - `7011a53` — Enlarge socket touch targets
  - `33db062` — Use production milestones for unlocks
  - `12ca798` — Increase starting Forest capacity
  - `727c86e` — Add five-item production buffers
  - `1f77afc` — Add node unlock journal
  - `3275873` — Match Merger to compact Splitter
