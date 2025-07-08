# Bacteria Grid Simulation

This is a React-based web app written in TypeScript that renders a 200x200 grid simulating the growth of bacteria. Bacteria follow strict rules for spawning (no bacteria may be present in adjacent cells) and can mutate based on a user-defined mutation probability. Users can also adjust the cell division interval and lifespan.

The project also features a live-updating chart that tracks the bacterial colony's growth over time as the simulation runs.

---

## Features

- 200x200 grid representing a Petri dish
- Real-time growth tracking via HTML canvas chart
- Pause/Start toggle for simulation
- Reset button (resets both grid and chart)
- Adjustable lifespan
- Adjustable mutation probability
- Adjustable cell division interval

---

## Project Structure & Key Components

The structure of this project is modular and organized under `src/components`. Here's an overview of the key files:

###`App.tsx`
 -Entry point for the simulation UI.
 -Renders the Grid and surrounding layout.

### `Grid.tsx`
- Core logic for the simulation
- Generates and updates the 200x200 grid
- Uses `useState`, `useEffect`, `useRef`, and `useCallback` to manage grid state efficiently

### `Cell.tsx`
- Pure presentational component representing a single cell
- Applies conditional class names based on mutation type
- Memoized with `React.memo()` to prevent unnecessary re-renders

### `Chart.tsx`
- Receives population data from `Grid.tsx`
- Renders a real-time line chart using the `<canvas>` API

### `Cell.css`
- Contains styling for grid cells, mutations, and UI layout

---

## Assumptions

From the beginning, I assumed this project would be very CPU-intensive due to the need to:
- Render and update a 200x200 grid (40,000 cells)
- Continuously simulate growth every 1 second (or faster)
- Update state based on mutation rules and lifespan logic

I knew I'd need to aggressively minimize unnecessary re-renders to keep the app usable, especially since cells persist across intervals.

---

## Performance Analysis

In early versions of the app, performance degraded quickly — even cells that hadn’t changed were re-rendering on every interval. This became a serious bottleneck, especially with mutations like `"immortal"` and `"double_life"` that caused cells to stick around for long periods.

### Optimizations Applied:

- **React.memo**: Wrapped `<Cell />` to avoid re-rendering cells whose props hadn’t changed
- **useCallback**: Memoized the `onClick` handler to keep the function reference stable
- **clickHandlerCache**: Stored individual handlers per `(i,j)` coordinate using a `Map<string, () => void>`
-  **Ref-based state access**: Used `useRef` to track current lifespan and interval values inside the simulation loop without triggering re-renders

These combined efforts significantly reduced the number of component updates and improved overall grid responsiveness.

---

## Technologies Used

- React
- TypeScript
- Node.js
- Netlify (deployment)
- GitHub

---

## Future Improvements

- Add a mutation dropdown when manually placing bacteria
- Add zoom functionality when hovering over the Petri dish
- Allow grid resizing to manage performance on lower-end systems
- Use a charting library like Recharts for a more flexible growth chart

---

## Author

**Abbas Ali**  

---

## Live Demo

🔗:[https://jitto-assesment.netlify.app/]
