/** @override */
export const measureDistances = function (segments, options = {}) {
    if (!options.gridSpaces) return BaseGrid.prototype.measureDistances.call(this, segments, options);
  
    // Track the total number of diagonals
    let nDiagonal = 0;
    const rule = this.parent.diagonalRule;
    const d = canvas.dimensions;
  
    // Iterate over measured segments
    return segments.map(s => {
      let r = s.ray;
      nDiagonal = 0;
  
      // Determine the total distance traveled
      let nx = Math.abs(Math.ceil(r.dx / d.size));
      let ny = Math.abs(Math.ceil(r.dy / d.size));
  
      // Determine the number of straight and diagonal moves
      let nd = Math.min(nx, ny);
      let ns = Math.abs(ny - nx);
      nDiagonal += nd;
  
      if (rule == "PATHFINDER") {
        let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
        let spaces = (nd10 * 2) + (nd - nd10) + ns;
        return spaces * canvas.dimensions.distance;
      } else if (rule == "EQUIDISTANT") {
        return (ns + nd) * canvas.scene.data.gridDistance;
      }
  
      // Standard Manhattan Movement
      return (ns + nd + nDiagonal) * canvas.scene.data.gridDistance;
    });
  };
  