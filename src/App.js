import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Human from "./images/siam-pose.jpg";
import Shirt from "./images/tee1.png";
import { drawKeypoints } from "./utilities";

function App() {
  const [humanPose, setHumanPose] = useState(null);
  const canvasRef = useRef(null);
  const HumanPoseRef = useRef(null);
  const ClothRef = useRef(null);

  const HandleHumanPoseFile = (e) => {
    setHumanPose(e.target.files[0]);
  };
  const HandleClothFile = (e) => {};

  useEffect(() => {
    const loadModel = async () => {
      const net = await posenet.load();

      if (humanPose) {
        // Load the image and run the pose detection algorithm on it
        const img = new Image();
        img.src = URL.createObjectURL(humanPose);
        img.onload = async () => {
          const pose = await net.estimateSinglePose(img);
          console.log(pose);
          // // Draw the pose and shirt on the canvas
          const ctx = canvasRef.current.getContext("2d");
          // ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.reset();
          ctx.drawImage(
            img,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );

          // drawKeypoints(pose["keypoints"], 0.6, ctx, 0.52);
          const shirtImg = new Image();
          shirtImg.src = Shirt;
          shirtImg.onload = () => {
            const shirtX = pose.keypoints[6].position.x * 0.41;
            const shirtY = pose.keypoints[6].position.y * 0.43;
            const shirtWidth =
              pose.keypoints[5].position.x * 0.3 +
              pose.keypoints[6].position.x * 0.3;

            ctx.translate(-48, 0);
            ctx.drawImage(shirtImg, shirtX, shirtY, shirtWidth, 350);
          };
        };
      }
    };
    loadModel();
  }, [humanPose]);
  return (
    <div className="App">
      {humanPose && <canvas ref={canvasRef} width="640" height="840" />}
      <input
        type="file"
        ref={HumanPoseRef}
        onChange={HandleHumanPoseFile}
        hidden
      />
      <button
        onClick={() => {
          HumanPoseRef.current.click();
        }}
      >
        Upload you picture
      </button>
    </div>
  );
}

export default App;
