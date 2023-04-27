// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow DONE
// 8. Draw functions DONE

import React, { useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import Shirt from "./images/yellow.png";
import useWindowSize from "./helpers/useWindowSize";
import { drawSkeleton, drawKeypoints } from "./utilities";
import { movingAverageFilter } from "./helpers/movingAverageFilter";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const size = useWindowSize();
  let leftShoulderPos;
  let rightShoulderPos;
  let leftHipsPos;
  let rightHipPos;

  //  Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    alert(net);
    //
    setInterval(() => {
      detect(net);
    }, 2000);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      console.log(
        webcamRef.current.video.videoWidth,
        webcamRef.current.video.videoHeight
      );
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false,
      });

      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
    const filteredKeypoints = movingAverageFilter(pose.keypoints, 5);
    // console.log("filteredKeypoints", filteredKeypoints);
    pose.keypoints.map((p) => {
      if (p.part === "leftShoulder") {
        leftShoulderPos = p.position;
      } else if (p.part === "rightShoulder") {
        rightShoulderPos = p.position;
      } else if (p.part === "rightHip") {
        rightHipPos = p.position;
      } else if (p.part === "leftHip") {
        leftHipsPos = p.position;
      }
    });

    const shirtWidth = (rightShoulderPos.x - leftShoulderPos.x) * 1.1;
    const shirtHeight = Math.abs(rightHipPos.y - leftShoulderPos.y) * 1.1;

    const shirtX = leftShoulderPos.x;
    const shirtY = leftShoulderPos.y;

    const shirtImg = new Image();
    shirtImg.src = Shirt;

    ctx.translate(0, -30);
    ctx.drawImage(shirtImg, shirtX, shirtY, shirtWidth, shirtHeight);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawKeypoints(pose["keypoints"], 0.6, ctx);
    // drawSkeleton(pose["keypoints"], 0.7, ctx);
  };

  runPosenet();

  return (
    <div className="App">
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: size.width,
          height: size.height,
        }}
        audio={false}
        videoConstraints={{ facingMode: { exact: "environment" } }}
        // onUserMedia={(val) => console.log(val)}
        onUserMediaError={(val) => alert(val)}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: size.width,
          height: size.height,
        }}
      />
    </div>
  );
}

export default App;
