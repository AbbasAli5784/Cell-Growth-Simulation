import React, { useEffect, useState, useRef, useCallback } from "react";
import Cell from "./Cell";
import { MutationType, CellData } from "../types/types";
import Chart from "./Chart";

// Define the size of the grid (200x200 cells)
const size = 200;

/**
 * Creates an empty grid with default cell properties.
 * Each cell starts without bacteria, no mutation, and a default lifespan.
 */
const createEmptyGrid = (lifespan: number): CellData[][] => {
  //Outer Array
  return Array.from({ length: size }, () =>
    //Inner Array
    Array.from({ length: size }, () => ({
      hasBacteria: false,
      mutationType: null,
      birthTime: 0,
      lifespan,
    }))
  );
};

const Grid: React.FC = () => {
  // State to hold the grid data

  // State to control whether the simulation is running or paused
  const [isRunning, setIsRunning] = useState(true);
  const [spanOfLife, setspanOfLife] = useState<number>(6000);
  const [grid, setGrid] = useState<CellData[][]>(createEmptyGrid(spanOfLife));
  const [inputValue, setInputValue] = useState<string>("6000");
  const [mutationInput, setMutationInput] = useState<string>("5");
  const [mutationProb, setMutationProb] = useState<number>(0.05);
  const [intervalInput, setIntervalInput] = useState("1000");
  const [divisionInterval, setDivisionInterval] = useState<number>(1000);
  const [growthData, setGrowthData] = useState<number[]>([]);
  const MAX_LIFESPAN = 100000;
  const spanOfLifeRef = useRef(spanOfLife);
  const mutationProbRef = useRef(mutationProb);
  const divisionIntervalRef = useRef(divisionInterval);

  //Update division interval
  useEffect(() => {
    divisionIntervalRef.current = divisionInterval;
  }, [divisionInterval]);

  //Update mutation probablity
  useEffect(() => {
    mutationProbRef.current = mutationProb;
  }, [mutationProb]);

  // Update the lifespan of cells in the existing grid
  useEffect(() => {
    spanOfLifeRef.current = spanOfLife;
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          lifespan:
            cell.mutationType === "double_life" ? spanOfLife * 2 : spanOfLife,
        }))
      )
    );
  }, [spanOfLife]);

  //   const resetButton = (arg) => {
  //     setGrid(createEmptyGrid(spanOfLife)
  //     setGrowthData([])

  //   }

  useEffect(() => {
    // Effect to handle the simulation logic (start/pause)
    if (isRunning) {
      // Set up an interval to update the grid every second
      const interval = setInterval(() => {
        // console.time("Grid Update"); // Measure grid update performance

        setGrid((prevGrid) => {
          // shallow copy the previous grid
          const newGrid = prevGrid.map((row) =>
            row.map((cell) => ({ ...cell }))
          );

          // Iterate through each cell in the grid
          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              const cell = newGrid[i][j];

              // Check if bacteria can spawn in the current cell
              if (!cell.hasBacteria && canSpawn(newGrid, i, j)) {
                if (Math.random() < 0.0001) {
                  // Randomly assign a mutation type (5% chance for mutation)
                  const mutation: MutationType =
                    Math.random() < mutationProbRef.current
                      ? (["fast", "immortal", "double_life"][
                          Math.floor(Math.random() * 3)
                        ] as MutationType)
                      : null;

                  // Update the cell with bacteria properties

                  const baseLifespan = spanOfLifeRef.current;

                  let lifespan = baseLifespan;
                  if (mutation === "fast") lifespan = baseLifespan / 2;
                  else if (mutation === "double_life")
                    lifespan = baseLifespan * 2;
                  else if (mutation === "immortal") lifespan = Infinity;

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
                  lifespan: spanOfLifeRef.current,
                };
              }
            }
          }

          const totalBacteria = newGrid
            .flat()
            .filter((cell) => cell.hasBacteria).length;
          setGrowthData((prev) => [...prev, totalBacteria]);

          return newGrid; // Return the updated grid
        });

        // limits to last 400 points
        // console.timeEnd("Grid Update"); // End performance measurement
      }, divisionInterval);

      // Cleanup the interval when the component unmounts or isRunning changes
      return () => clearInterval(interval);
    }
  }, [isRunning, divisionInterval]);

  const handleCellClick = useCallback((i: number, j: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
      const clicked = newGrid[i][j];
      newGrid[i][j] = {
        ...clicked,
        hasBacteria: !clicked.hasBacteria,
        mutationType: null,
        birthTime: !clicked.hasBacteria ? Date.now() : 0,
        lifespan: spanOfLifeRef.current,
      };
      return newGrid;
    });
  }, []);

  // Cache to keep click handlers stable
  const clickHandlerCache = useRef<Map<string, () => void>>(new Map());

  const getCellClickHandler = (i: number, j: number): (() => void) => {
    const key = `${i},${j}`;
    if (!clickHandlerCache.current.has(key)) {
      clickHandlerCache.current.set(key, () => handleCellClick(i, j));
    }
    return clickHandlerCache.current.get(key)!;
  };

  return (
    <div className="app-layout">
      {/* Grid + Pause/Reset */}
      <div className="left-panel">
        <div className="grid">
          {grid.flat().map((cell, idx: number) => {
            const i = Math.floor(idx / size);
            const j = idx % size;
            return (
              <Cell
                key={idx}
                hasBacteria={cell.hasBacteria}
                mutationType={cell.mutationType}
                onClick={getCellClickHandler(i, j)}
              />
            );
          })}
        </div>

        <div className="under-grid-buttons">
          <button
            className="pause-button"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            className="reset-button"
            onClick={() => {
              setGrid(createEmptyGrid(spanOfLife));
              setGrowthData([]);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/*  Chart + Controls BELOW */}
      <div className="chart-panel">
        <h3>Bacteria Growth Over Time</h3>
        <Chart data={growthData} />

        <div className="controls-panel">
          <div className="control-group">
            <label htmlFor="lifespan-input">Set Lifespan:</label>
            <div className="input-row">
              <input
                id="lifespan-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button
                onClick={() => {
                  const parsedValue = parseInt(inputValue, 10);
                  if (parsedValue > 0 && parsedValue <= MAX_LIFESPAN) {
                    setspanOfLife(parsedValue);
                  } else {
                    alert(`Lifespan must be between 1 and ${MAX_LIFESPAN} ms`);
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="mutation-input">Set Mutation %:</label>
            <div className="input-row">
              <input
                id="mutation-input"
                value={mutationInput}
                onChange={(e) => setMutationInput(e.target.value)}
              />
              <button
                onClick={() => {
                  const parsedValue = parseInt(mutationInput, 10);
                  const finalProb = parsedValue / 100;
                  if (finalProb > 0 && finalProb < 1) {
                    setMutationProb(finalProb);
                  } else {
                    alert("Probability must be between 1 and 100");
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="interval-input">Set Division Interval (ms):</label>
            <div className="input-row">
              <input
                id="interval-input"
                value={intervalInput}
                onChange={(e) => setIntervalInput(e.target.value)}
              />
              <button
                onClick={() => {
                  const parsed = parseInt(intervalInput, 10);
                  if (parsed > 0 && parsed < 10000) {
                    setDivisionInterval(parsed);
                  } else {
                    alert("Enter between 1 and 10000 ms");
                  }
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
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

    // Ensure the adjacent cell is within bounds and does not have bacteria
    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      return !grid[newX][newY].hasBacteria;
    }

    return true; // Out-of-bounds cells are treated as empty
  });
};

export default Grid;
