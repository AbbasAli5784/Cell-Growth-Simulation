import React, { useEffect, useState } from "react";
import Cell from "./Cell";
import { MutationType, CellData } from "../types/types";

// Define the size of the grid (200x200 cells)
const size = 200;

/**
 * Creates an empty grid with default cell properties.
 * Each cell starts without bacteria, no mutation, and a default lifespan.
 */
const createEmptyGrid = (): CellData[][] => {
  //Outer Array
  return Array.from({ length: size }, () =>
    //Inner Array
    Array.from({ length: size }, () => ({
      hasBacteria: false,
      mutationType: null,
      birthTime: 0,
      lifespan: 6000,
    }))
  );
};

const Grid: React.FC = () => {
  // State to hold the grid data
  const [grid, setGrid] = useState<CellData[][]>(createEmptyGrid());
  // State to control whether the simulation is running or paused
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    // Effect to handle the simulation logic (start/pause)
    if (isRunning) {
      // Set up an interval to update the grid every second
      const interval = setInterval(() => {
        console.time("Grid Update"); // Measure grid update performance

        setGrid((prevGrid) => {
          // Deep copy the previous grid to avoid mutating state directly
          const newGrid = JSON.parse(JSON.stringify(prevGrid));

          // Iterate through each cell in the grid
          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              const cell = newGrid[i][j];

              // Check if bacteria can spawn in the current cell
              if (!cell.hasBacteria && canSpawn(newGrid, i, j)) {
                if (Math.random() < 0.0001) {
                  // Randomly assign a mutation type (5% chance for mutation)
                  const mutation: MutationType =
                    Math.random() < 0.05
                      ? (["fast", "immortal", "double_life"][
                          Math.floor(Math.random() * 3)
                        ] as MutationType)
                      : null;

                  // Adjust lifespan based on mutation type
                  const lifespan =
                    mutation === "double_life"
                      ? 12000
                      : mutation === "immortal"
                      ? Infinity
                      : 6000;

                  // Update the cell with bacteria properties
                  newGrid[i][j] = {
                    hasBacteria: true,
                    mutationType: mutation,
                    birthTime: Date.now(),
                    lifespan,
                  };
                }
              }

              // Handle bacteria death based on lifespan and mutation type
              if (
                cell.hasBacteria &&
                cell.mutationType !== "immortal" &&
                Date.now() - cell.birthTime >= cell.lifespan
              ) {
                // Reset the cell to its default state
                newGrid[i][j] = {
                  hasBacteria: false,
                  mutationType: null,
                  birthTime: 0,
                  lifespan: 6000,
                };
              }
            }
          }

          return newGrid; // Return the updated grid
        });
        console.timeEnd("Grid Update"); // End performance measurement
      }, 1000);

      // Cleanup the interval when the component unmounts or isRunning changes
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  return (
    <div style={{ textAlign: "center" }}>
      {/* Render the grid using CSS grid layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 3px)`,
        }}
      >
        {grid.flat().map((cell, idx) => (
          <Cell
            key={idx}
            hasBacteria={cell.hasBacteria}
            mutationType={cell.mutationType}
          />
        ))}
      </div>
      {/* Button to toggle simulation state */}
      <button className="pause-button" onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Start"}
      </button>
      {/*Reset grid*/}
      <button
        className="reset-button"
        onClick={() => setGrid(createEmptyGrid())}
      >
        Reset
      </button>
    </div>
  );
};

// Helper to check spawn eligibility
const canSpawn = (grid: CellData[][], x: number, y: number): boolean => {
  const directions = [
    [0, 1],
    [1, 0],
    [-1, 0],
    [0, -1],
  ];

  return directions.every(([dx, dy]) => {
    const newX = x + dx;
    const newY = y + dy;

    // Ensure the adjacent cell is within bounds and does not have bacteria
    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      return !grid[newX][newY].hasBacteria;
    }

    return true; // Out-of-bounds cells are treated as empty
  });
};

export default Grid;
