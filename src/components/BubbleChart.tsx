// src/components/BubbleChart.tsx
import * as d3 from "d3";
import { useAtomValue } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import {
  availableBalanceAtom,
  totalAmountAtom,
  Utxo,
  utxoAtom,
} from "../state/atoms";

const BubbleChart: React.FC = () => {
  const defaultUtxos = useAtomValue(utxoAtom);
  const [utxos, setUtxos] = useState<Utxo[]>(defaultUtxos);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const totalAmount = useAtomValue(totalAmountAtom);
  const availableBalance = useAtomValue(availableBalanceAtom);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    const handleBubbleClick = (txid: string, vout: number) => {
      setUtxos((prevUtxos) =>
        prevUtxos.map((utxo: any) =>
          utxo.txid === txid && utxo.vout === vout
            ? { ...utxo, selected: !utxo.selected }
            : utxo
        )
      );
    };
    const bubble = d3
      .pack<{ name: string; amount: number; txid: string; vout: number }>()
      .size([width, height])
      .padding(3);

    // Adjust the type of root
    const root = d3
      .hierarchy<{ name: string; amount: number; txid: string; vout: number }>({
        children: utxos,
      } as any)
      .sum((d) => d.amount);

    const nodes = bubble(root).leaves();

    svg.selectAll("g").remove(); // Clear any existing elements

    const node = svg
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("click", function (event, d) {
        console.log("hodnota d", d);
        // setSelectedValue(d.data.amount);
        handleBubbleClick(d.data.txid, d.data.vout);
      });

    node
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", "steelblue")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    node
      .append("text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) =>
        d.data.amount < 500 ? " " : `${d.data.amount.toLocaleString("cs-CZ")} `
      );
  }, [utxos, setUtxos]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>{totalAmount.toLocaleString("cs-CZ")}</h1>{" "}
      <p> Available {availableBalance.toLocaleString("cs-CZ")} sats</p>
      <svg ref={svgRef} width="800" height="600"></svg>
      {/* {selectedValue !== null && (
        <p>Selected value: {selectedValue.toLocaleString("cs-CZ")}</p>
      )}{" "} */}
      {/* Available UTXOS: {JSON.stringify(utxos)} */}
    </div>
  );
};

export default BubbleChart;
