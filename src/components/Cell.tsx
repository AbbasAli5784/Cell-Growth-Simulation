import React from "react";
import "./Cell.css";
import { CellProps } from "../types/types";

//Create a cell component  of type Cell prop
const Cell: React.FC<CellProps> = ({ hasBacteria, mutationType, onClick }) => {
  let className = "cell";

  //Logic to determine if a mutated bacteria will spawn or a normal bacteria
  if (hasBacteria) {
    className += " bacteria";

    if (mutationType) {
      className += ` ${mutationType}`;
    }
  }

  // returns a div element that represents the type of bacteria via css
  return <div className={className} onClick={onClick} />;
};

//Only re-render cells that have changed
export default React.memo(Cell);
