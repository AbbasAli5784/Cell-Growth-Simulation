import React, { useEffect, useState } from "react";
import Cell from "./Cell";
import { MutationType, CellData } from "../types/types";

const size = 200;

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
  const [grid, setGrid] = useState<CellData[][]>(createEmptyGrid());
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => row.slice());

        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            const cell = newGrid[i][j];

            if (!cell.hasBacteria && canSpawn(newGrid, i, j)) {
              if (Math.random() < 0.0001) {
                // low prob per tick
                const mutation: MutationType =
                  Math.random() < 0.05
                    ? (["fast", "immortal", "double_life"][
                        Math.floor(Math.random() * 3)
                      ] as MutationType)
                    : null;

                const lifespan =
                  mutation === "double_life"
                    ? 12000
                    : mutation === "immortal"
                    ? Infinity
                    : 6000;

                newGrid[i][j] = {
                  hasBacteria: true,
                  mutationType: mutation,
                  birthTime: Date.now(),
                  lifespan,
                };
              }
            }

            // Handle death
            if (
              cell.hasBacteria &&
              cell.mutationType !== "immortal" &&
              Date.now() - cell.birthTime >= cell.lifespan
            ) {
              newGrid[i][j] = {
                hasBacteria: false,
                mutationType: null,
                birthTime: 0,
                lifespan: 6000,
              };
            }
          }
        }

        return newGrid;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Start"}
      </button>
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

    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      return !grid[newX][newY].hasBacteria;
    }

    return true;
  });
};

export default Grid;
