import React, { useEffect, useState, useRef } from "react";
import Cell from "./Cell";
import { MutationType, CellData } from "../types/types";

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

                  console.log("MUTATION PROBABLITY:", mutationProbRef.current);
                  // Adjust lifespan based on mutation type
                  //   const lifespan =
                  //     mutation === "double_life"
                  //       ? spanOfLifeRef.current * 2
                  //       : mutation === "immortal"
                  //       ? Infinity
                  //       : spanOfLifeRef.current;

                  //   console.log("Life span:", lifespan);

                  // Update the cell with bacteria properties

                  newGrid[i][j] = {
                    hasBacteria: true,
                    mutationType: mutation,
                    birthTime: Date.now(),
                    lifespan: cell.lifespan,
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

          return newGrid; // Return the updated grid
        });
        // console.timeEnd("Grid Update"); // End performance measurement
      }, divisionInterval);

      // Cleanup the interval when the component unmounts or isRunning changes
      return () => clearInterval(interval);
    }
  }, [isRunning, divisionInterval]);

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
        onClick={() => setGrid(createEmptyGrid(spanOfLife))}
      >
        Reset
      </button>

      <div className="lifespan-input-container">
        <label htmlFor="lifespan-input">Set LifeSpan:</label>
        <input
          id="lifespan-input"
          value={inputValue}
          onChange={(e) => {
            const inputValue = e.target.value;
            setInputValue(inputValue); // Update temporary input state
          }}
        />

        <button
          onClick={() => {
            const parsedValue = parseInt(inputValue, 10);
            if (parsedValue > 0 && parsedValue <= MAX_LIFESPAN) {
              setspanOfLife(parsedValue);
            } else {
              alert(
                `Lifespan must be between 1 and ${MAX_LIFESPAN} milliseconds`
              );
            }
          }}
        >
          Submit
        </button>
      </div>
      {/* Logic for setting mutation probablity*/}
      <div className="lifespan-input-container">
        <label htmlFor="lifespan-input">Set Mutation %:</label>
        <input
          id="lifespan-input"
          value={mutationInput}
          onChange={(e) => {
            setMutationInput(e.target.value); // Update temporary input state
          }}
        />

        <button
          onClick={() => {
            const parsedValue = parseInt(mutationInput, 10);
            const finalProb = parsedValue / 100;
            console.log("FINAL PROB:", finalProb);

            if (finalProb > 0 && finalProb < 1) {
              setMutationProb(finalProb);
            } else {
              alert("Probablity cannot be greater than 100 or less than 1");
            }
          }}
        >
          Submit
        </button>
      </div>

      <div className="lifespan-input-container">
        <label htmlFor="interval-input">Set Division Interval (ms):</label>
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
              alert("Please enter a value between 1 and 10000 milliseconds.");
            }
          }}
        >
          Submit
        </button>
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
