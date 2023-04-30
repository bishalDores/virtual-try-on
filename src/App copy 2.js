import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import Shirt from "./images/black-shirt.png";
import useWindowSize from "./helpers/useWindowSize";
import { drawSkeleton, drawKeypoints } from "./utilities";
import { movingAverageFilter } from "./helpers/movingAverageFilter";

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const clothImageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const clothImage = clothImageRef.current;
    let poseNetModel = null;

    const setupPoseNet = async () => {
      poseNetModel = await posenet.load({
        architecture: "MobileNetV1",
        outputStride: 16,
        inputResolution: { width: 640, height: 480 },
        multiplier: 0.75,
      });
    };

    const detectPose = async () => {
      const pose = await poseNetModel.estimateSinglePose(video);
      console.log(pose);
      const leftShoulder = pose.keypoints[5].position;
      const rightShoulder = pose.keypoints[6].position;
      const x = (leftShoulder.x + rightShoulder.x) / 2 - clothImage.width / 2;
      const y = (leftShoulder.y + rightShoulder.y) / 2 - clothImage.height / 2;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      context.drawImage(clothImage, x, y);
      requestAnimationFrame(detectPose);
    };

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        setupPoseNet().then(() => detectPose());
      })
      .catch((error) => {
        console.error("Error accessing camera:", error);
      });

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} />
      <img ref={clothImageRef} src={Shirt} style={{ display: "none" }} />
    </div>
  );
}

export default App;
