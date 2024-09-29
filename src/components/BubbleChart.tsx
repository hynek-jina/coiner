// src/components/BubbleChart.tsx
import * as d3 from "d3";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useRef } from "react";
import {
  // availableBalanceAtom,
  totalAmountAtom,
  utxoAtom,
} from "../state/atoms";
import {
  BubbleChartContainer,
  BubbleChartSubtitle,
  BubbleChartSvg,
  BubbleChartTitle,
} from "../theme";

const BubbleChart: React.FC = () => {
  const [utxos, setUtxos] = useAtom(utxoAtom);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const totalAmount = useAtomValue(totalAmountAtom);
  // const availableBalance = useAtomValue(availableBalanceAtom);

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
      .pack<{
        selected: any;
        name: string;
        amount: number;
        txid: string;
        vout: number;
      }>()
      .size([width, height])
      .padding(3);

    const root = d3
      .hierarchy<{
        selected: any;
        name: string;
        amount: number;
        txid: string;
        vout: number;
      }>({
        children: utxos,
      } as any)
      .sum((d) => d.amount);

    const nodes = bubble(root).leaves();

    svg.selectAll("g").remove(); // Clear any existing elements

    const defs = svg.append("defs");

    // Define gradients
    defs
      .selectAll("radialGradient")
      .data(nodes)
      .enter()
      .append("radialGradient")
      .attr("id", (d, i) => `gradient-${i}`)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#4682b4" },
        { offset: "100%", color: "#40C1CD" },
      ])
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    const node = svg
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("click", function (event, d) {
        handleBubbleClick(d.data.txid, d.data.vout);
      });

    node
      .append("circle")
      .attr("class", "bubble")
      .attr("r", (d) => d.r)
      .attr("fill", (d, i) =>
        d.data.selected ? "#4682B4" : `url(#gradient-${i})`
      );

    node
      .append("text")
      .attr("class", "bubble-text")
      .attr("dy", ".3em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) =>
        d.data.amount < 500 ? " " : `${d.data.amount.toLocaleString()} `
      );
  }, [utxos, setUtxos]);

  return (
    <BubbleChartContainer>
      <BubbleChartSubtitle>Balance:</BubbleChartSubtitle>
      <BubbleChartTitle>{totalAmount.toLocaleString()}</BubbleChartTitle>
      {/* <BubbleChartSubtitle>
        Available {availableBalance.toLocaleString()} sats
      </BubbleChartSubtitle> */}
      <BubbleChartSvg ref={svgRef} width="800" height="600"></BubbleChartSvg>
    </BubbleChartContainer>
  );
};

export default BubbleChart;
