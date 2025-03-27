/**
 * Get possible target stones for the given source stone that is being moved
 * @param {Number}    sourceX X coordinate of stone being moved
 * @param {Number}    sourceY Y coordinate of stone being moved
 * @param {Object[]}  board Board state
 * @param {String}    myName Name of client's player
 * @returns {Object} An Object containing possible targets due to highway/growth rules. See top of function definition for clarification
 */
export function getTargetStones(sourceX, sourceY, board, myName) {
  // NOTE: `possibleHighwayTargets` is part of the return value!
  // It maps coordinate strings "x,y" to bool of whether it is a valid target
  // this map's keys double as the `visited` nodes list in the graph search for the highway rule
  const possibleHighwayTargets = {};
  const searchMe = [];

  // NOTE: `possibleGrowthTargets` is part of the return value!
  // It is an array of {x: x, y: y} coordinates for adjacent empty spaces (where you can grow into and score pts)
  const possibleGrowthTargets = [];

  // first check for adjacent open spaces
  for (const [dx, dy] of [[-1,0] ,[1,0], [0,-1], [0,1]]) {
    let [targetX, targetY] = [sourceX+dx, sourceY+dy];
    if (targetX in board && targetY in board[targetX]) {
      let target = board[targetX][targetY];
      if (target === null) {
        possibleGrowthTargets.push({x: targetX, y: targetY});
      } else if (target.player === myName) {
        searchMe.push([targetX, targetY]);
        possibleHighwayTargets[targetX + "," + targetY] = true;
      }
    }
  }

  // do graph search
  while (searchMe.length > 0) {
    let [curX, curY] = searchMe.shift()

    for (const [dx, dy] of [[-1,0] ,[1,0], [0,-1], [0,1]]) {
      const [targetX, targetY] = [curX+dx, curY+dy];
      const targetVisited = (targetX + "," + targetY) in possibleHighwayTargets;
      if (!targetVisited && spaceIsValidAndBelongsToPlayer(targetX, targetY, myName, board)) {
        searchMe.push([targetX, targetY]);
        possibleHighwayTargets[targetX + "," + targetY] = true;
      }
    }
  
  }

  return {possibleHighwayTargets, possibleGrowthTargets};
}