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
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef(0);
  const MAX_LIFESPAN = 100000;
  const spanOfLifeRef = useRef(spanOfLife);
  const mutationProbRef = useRef(mutationProb);
  const divisionIntervalRef = useRef(divisionInterval);
  const hasSeeded = useRef(false);

  const adjustBirthTimes = (delta: number) => {
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => {
          if (!cell.hasBacteria) return cell;
          return {
            ...cell,
            birthTime: cell.birthTime + delta,
          };
        })
      )
    );
  };

  useEffect(() => {
    if (!isRunning) return;

    const hasAnyBacteria = grid.some((row) =>
      row.some((cell) => cell.hasBacteria)
    );

    if (!hasAnyBacteria) {
      const i = Math.floor(Math.random() * size);
      const j = Math.floor(Math.random() * size);

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
        newGrid[i][j] = {
          hasBacteria: true,
          mutationType: null,
          birthTime: Date.now(),
          lifespan: spanOfLifeRef.current,
        };
        return newGrid;
      });
      hasSeeded.current = true;
    }
  }, [isRunning, grid]);

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

  const baseDivisionProbability = 0.05;
  // Effect to handle the simulation logic (start/pause)
  useEffect(() => {
    if (isRunning) {
      // Set up an interval to update the grid every second
      const interval = setInterval(() => {
        setGrid((prevGrid) => {
          // shallow copy the previous grid
          const newGrid = prevGrid.map((row) =>
            row.map((cell) => ({ ...cell }))
          );

          // Iterate through each cell in the grid
          for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
              const cell = newGrid[i][j];

              // If this cell has bacteria, attempt to divide into adjacent empty cells
              if (cell.hasBacteria) {
                const directions = [
                  [0, 1],
                  [1, 0],
                  [-1, 0],
                  [0, -1],
                ];

                directions.forEach(([dx, dy]) => {
                  const newX = i + dx;
                  const newY = j + dy;

                  if (
                    newX >= 0 &&
                    newX < size &&
                    newY >= 0 &&
                    newY < size &&
                    !newGrid[newX][newY].hasBacteria
                  ) {
                    if (Math.random() < baseDivisionProbability) {
                      // Decide whether to mutate AFTER deciding to divide
                      const mutation: MutationType =
                        Math.random() < mutationProbRef.current
                          ? (["fast", "immortal", "double_life"][
                              Math.floor(Math.random() * 3)
                            ] as MutationType)
                          : null;

                      // Set lifespan based on mutation
                      let lifespan = spanOfLifeRef.current;
                      if (mutation === "fast") lifespan /= 2;
                      else if (mutation === "double_life") lifespan *= 2;
                      else if (mutation === "immortal") lifespan = Infinity;

                      // Spawn the new bacteria
                      newGrid[newX][newY] = {
                        hasBacteria: true,
                        mutationType: mutation,
                        birthTime: Date.now(),
                        lifespan,
                      };
                    }
                  }
                });
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
            onClick={() => {
              if (isRunning) {
                pauseStartRef.current = Date.now();
              } else {
                const now = Date.now();
                if (pauseStartRef.current !== null) {
                  const pausedDuration = now - pauseStartRef.current;
                  totalPausedTimeRef.current += pausedDuration;
                  adjustBirthTimes(pausedDuration);
                }
                pauseStartRef.current = null;
              }
              setIsRunning(!isRunning);
            }}
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
            <label htmlFor="lifespan-input">Set Lifespan(ms):</label>
            <div className="input-row">
              <input
                id="lifespan-input"
                type="number"
                min="1"
                max={MAX_LIFESPAN}
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
                type="number"
                min="1"
                max="99"
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
                type="number"
                min="1"
                max={MAX_LIFESPAN}
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

export default Grid;
