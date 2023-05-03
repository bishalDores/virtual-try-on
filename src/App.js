import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Human from "./images/siam-pose.jpg";
import Shirt from "./images/purple-shirt.png";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadModel = async () => {
      const net = await posenet.load();

      // Load the image and run the pose detection algorithm on it
      const img = new Image();
      img.src = Human;
      img.onload = async () => {
        const pose = await net.estimateSinglePose(img);
        console.log(pose);
        // // Draw the pose and shirt on the canvas
        const ctx = canvasRef.current.getContext("2d");
        // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        const shirtImg = new Image();
        shirtImg.src = Shirt;
        shirtImg.onload = () => {
          const shirtX = pose.keypoints[6].position.x * 0.13;
          const shirtY = pose.keypoints[6].position.y * 0.14;
          const shirtWidth =
            pose.keypoints[5].position.x * 0.13 +
            pose.keypoints[6].position.x * 0.13;

          ctx.translate(-48, 0);
          ctx.drawImage(shirtImg, shirtX, shirtY, shirtWidth, 300);
        };
      };
    };
    loadModel();
  }, []);
  return (
    <div className="App">
      <canvas ref={canvasRef} width="640" height="840" />
    </div>
  );
}

export default App;
