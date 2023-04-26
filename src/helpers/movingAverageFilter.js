export function movingAverageFilter(keypoints, windowSize) {
  // Initialize an array to store the filtered keypoints
  const filteredKeypoints = [];

  // Loop through each keypoint in the input array
  for (let i = 0; i < keypoints.length; i++) {
    // Initialize an array to store the previous keypoint positions
    const previousPositions = [];

    // Loop through the previous windowSize keypoint positions
    for (let j = Math.max(0, i - windowSize + 1); j < i; j++) {
      // Add the previous keypoint position to the array
      previousPositions.push(keypoints[j].position);
    }

    // Add the current keypoint position to the array
    previousPositions.push(keypoints[i].position);

    // Calculate the average position of the previous keypoint positions
    const averagePosition = {
      x:
        previousPositions.reduce((sum, p) => sum + p.x, 0) /
        previousPositions.length,
      y:
        previousPositions.reduce((sum, p) => sum + p.y, 0) /
        previousPositions.length,
    };

    // Add the filtered keypoint to the output array
    filteredKeypoints.push({
      position: averagePosition,
      score: keypoints[i].score,
      part: keypoints[i].part,
    });
  }

  return filteredKeypoints;
}
