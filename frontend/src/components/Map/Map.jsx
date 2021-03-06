import React,{useRef,useEffect} from 'react';
import { geoMercator, format, geoPath, scaleQuantize, extent,select } from 'd3';
import _ from 'lodash';
import useResizeObserver from "../../useResizeObserver";
import "./Map.css";
import { legendColor } from 'd3-svg-legend'




export const Map = ({geometry, data}) =>{

const svgRef = useRef();
const wrapperRef = useRef();
const dimensions = useResizeObserver(wrapperRef);

// colorScale


// const colorScale = scaleSequential(interpolateRdYlGn).domain()

//merge geometry and data

function addProperties(geojson,data){

  let newArr = _.map(data, function(item) {
    return {
      areacode: item.area.area_code,
      areaname: item.area.area_name,
      dataValue: parseFloat(item.data_value),
    }
  });
 
  let mergedGeoJson = _(newArr)
    .keyBy('areacode')
    .merge(_.keyBy(geojson, 'properties.ID_'))
    .values()
    .value();
    
    return mergedGeoJson;
}


let tooltip = select("body").append("div") 
.attr("class", "tooltip")       
.style("opacity", 0);

useEffect(() => {
  const svg = select(svgRef.current);
  const { width, height } = dimensions || wrapperRef.current.getBoundingClientRect();
  console.log("w&h",width, height);
  const projection = geoMercator().fitSize([width, height], geometry);
  // const colorLegendG = svg.append('g').attr('transform', `translate(40,310)`);

  const pathGenerator = geoPath(projection);
  let mergedGeometry = addProperties(geometry.features,data);
  console.log(mergedGeometry);
   let c1Value  = d => d.data_value;
  let c2Value  = d => d.dataValue;
  
  let color_range = _.map(data, d =>{
    return +d.data_value
  });
  let [min,max] = extent(color_range);
  // let comp = (max - min)/3;
  // let low = min + comp;
  // let high = max - comp;
  // console.log("minmax", min, max);
  // console.log("lowhigh", low, high);

  // let colorScale = scaleSequential().domain([max,min])
  //     .interpolator(interpolateRdYlGn);
    let colorScale = scaleQuantize().domain([min, max])
      .range(["rgb(0, 128, 0)","rgb(255,255,0)", "rgb(255, 0, 0)"]);
  // let colorScale = scaleOrdinal();
  // colorScale.domain(c2Value)
  //     .range("red","yellow", "green");
  
  
  // let colorScale = (v) =>{
  //   if (typeof v != "undefined") {
  //       let selectedColor;
  //         if (v < low) {selectedColor =  "#24562B";}//matte green
  //         else if (v >= low && v <= high) {selectedColor =  "#FFE338";}//matte yellow
  //         else if (v > high) {selectedColor =  "#B2022F";} //matte red
  //       return selectedColor;
  //   }
  //   else {
  //     return "#A9A9B0";
  //   }
  // };

 

  // colorLegendG.call(colorLegend, {
  //   colorScale,
  //   circleRadius: 8,
  //   spacing: 20,
  //   textOffset: 12,
  //   backgroundRectWidth: 235
  // });

  //OnMouseOver

  const onMouseOver = (event,d) =>{	
    if(typeof d.dataValue != 'undefined'){
      tooltip.transition().duration(200).style("opacity", .9);		
      tooltip.html("<b>"+d.areaname+"</b><br><b>Value:</b>"+d.dataValue)
      .style("left", event.clientX + "px")
      .style("top",  event.clientY - 30 + "px");	
    }
  };

 

  svg
    .selectAll(".polygon")
    .data(mergedGeometry)
    .join("path").attr("class", "polygon")
    .attr("d" ,feature => pathGenerator(feature))
    .style("fill", d =>colorScale(c2Value(d)))
    .on("mouseover", (i,d) => onMouseOver(i,d))
    .on("mouseout", function(d) {   
      tooltip.transition()    
      .duration(500)    
      .style("opacity", 0); 
    });

    svg.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,20)");

  let legend = legendColor()
    .labelFormat(format(".2f"))
    .title("Legend")
    .titleWidth(100)
    .scale(colorScale);

  svg.select(".legendQuant")
    .call(legend);
    
}, [geometry, dimensions, data])



return ( 
<div ref={wrapperRef}  style={{ marginBottom: "2rem" }}>
  <svg className = "svg-map" ref={svgRef}></svg>
</div>
)};
