import React from "react";
import "./Cell.css";
import { MutationType, CellData, CellProps } from "../types/types";

const Cell: React.FC<CellProps> = ({ hasBacteria, mutationType }) => {
  let className = "cell";

  if (hasBacteria) {
    className += " bacteria";

    if (mutationType) {
      className += ` ${mutationType}`;
    }
  }

  return <div className={className} />;
};

export default Cell;
