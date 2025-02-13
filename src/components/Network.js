import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { nodes, links } from "../data";

const Network = () => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const radialGradient = defs
      .append("radialGradient")
      .attr("id", "bg-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "70%");

    radialGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#0b0f2a");

    radialGradient
      .append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#121d42")
      .attr("stop-opacity", 0.8);

    radialGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#000");

    svg
      .append("rect")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("fill", "url(#bg-gradient)");

    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "6")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const createGradient = (id, color1, color2) => {
      const gradient = defs.append("radialGradient").attr("id", id);
      gradient.append("stop").attr("offset", "0%").attr("stop-color", color1);
      gradient.append("stop").attr("offset", "80%").attr("stop-color", color2);
    };

    createGradient("gradient-center", "#00A6FF", "#003366");
    createGradient("gradient-games", "#FF8800", "#662200");
    createGradient("gradient-two-cars", "#FF8800", "#662200");
    createGradient("gradient-type-it-to-lose-it", "#FF8800", "#662200");
    createGradient("gradient-portfolio", "#FF8800", "#662200");
    createGradient("gradient-puzzle", "#FF8800", "#662200");

    const tooltipGradient = defs
      .append("radialGradient")
      .attr("id", "gradient-purple")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "80%");

    tooltipGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#A855F7");

    tooltipGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#440055");

    const createLinkGradient = (id, color1, color2) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", id)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", color1);

      gradient.append("stop").attr("offset", "100%").attr("stop-color", color2);
    };

    createLinkGradient("gradient-blue", "#00E6E6", "#0055FF");
    createLinkGradient("gradient-orange", "#FF8800", "#FF3300");

    const container = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(400)
      )
      .force("charge", d3.forceManyBody().strength(-5000))
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
      );

    nodes.forEach((d) => {
      if (d.id === "center") {
        d.fx = dimensions.width / 2;
        d.fy = dimensions.height / 2;
      }
    });

    const link = container
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        return d.source.id === "center" || d.target.id === "center"
          ? "url(#gradient-blue)"
          : "url(#gradient-orange)";
      })
      .attr("stroke-width", 3)
      .attr("opacity", 0.8)
      .attr("filter", "url(#glow)");

    const nodeGroup = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node");

    const getNodeSize = (d) => {
      if (d.id === "center") return d.label.length * 5 + 30;
      return d.label.length * 4 + 15;
    };

    nodeGroup
      .append("circle")
      .attr("r", (d) => getNodeSize(d))
      .attr("fill", (d) => `url(#gradient-${d.id})`)
      .attr("filter", "url(#glow)")
      .attr("cursor", "pointer");

    const pulsate = (selection) => {
      selection
        .transition()
        .duration(1500)
        .ease(d3.easeSin)
        .attr("r", (d) => getNodeSize(d))
        .transition()
        .duration(2000)
        .ease(d3.easeSin)
        .attr("r", (d) =>
          d.id === "center" ? d.label.length * 5 : d.label.length * 4
        )
        .on("end", function () {
          pulsate(d3.select(this));
        });
    };

    nodeGroup.select("circle").call(pulsate);

    nodeGroup
      .append("text")
      .attr("class", "title-text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("fill", "#FFF")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("cursor", "pointer")
      .text((d) => d.label);

    nodeGroup
      .on("mouseover", function (event, d) {
        const currentGroup = d3.select(this);
        const svg = d3.select(svgRef.current);

        svg.selectAll(".tooltip").remove();

        const tooltipX = d.x + 100;
        const tooltipY = d.y - 20;

        const tooltip = svg
          .append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${tooltipX}, ${tooltipY})`);

        tooltip
          .append("rect")
          .attr("width", 0)
          .attr("height", 0)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("fill", "url(#gradient-purple)")
          .attr("filter", "url(#glow)")
          .style("opacity", 0)
          .transition()
          .duration(50)
          .attr("width", d.info.length * 6)
          .attr("height", 70)
          .style("opacity", 1);

        tooltip
          .append("text")
          .attr("class", "tooltip-title")
          .attr("x", 10)
          .attr("y", 25)
          .attr("fill", "#FFF")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(d.label);

        tooltip
          .append("text")
          .attr("class", "tooltip-info")
          .attr("x", 10)
          .attr("y", 45)
          .attr("fill", "#EEE")
          .attr("font-size", "12px")
          .text(d.info);
      })
      .on("mouseout", function () {
        d3.select(svgRef.current)
          .selectAll(".tooltip")
          .transition()
          .duration(50)
          .style("opacity", 0)
          .remove();
      })
      .on("click", function (event, d) {
        if (d.url) {
          window.open(d.url, "_blank");
        }
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeGroup.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [dimensions]);

  return <svg ref={svgRef} style={{ width: "100vw", height: "100vh" }}></svg>;
};

export default Network;
