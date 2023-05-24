import React, { useRef, useEffect, useState } from "react";
import { fromBlob, blobToURL } from "image-resize-compress";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Human from "./images/forkan.jpeg";
import Shirt from "./images/tee2.png";
import { drawKeypoints } from "./utilities";
import LoadingOverlay from "react-loading-overlay";
import BounceLoader from "react-spinners/BounceLoader";

function App() {
  const [humanPose, setHumanPose] = useState(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState(44);
  const [customWidth, setCustomWidth] = useState(1.9);
  const canvasRef = useRef(null);
  const HumanPoseRef = useRef(null);
  const ClothRef = useRef(null);

  const HandleHumanPoseFile = (e) => {
    // setHumanPose(e.target.files[0]);
    const fileSize = e.target.files[0].size / 2048;

    var res = fromBlob(e.target.files[0], 75, 640, 840, "jpeg").then(function (
      res
    ) {
      // console.log(res);
      setHumanPose(res);
      setLoading(true);
    });
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

          // drawKeypoints(pose["keypoints"], 0.6, ctx, 0.99);
          const shirtImg = new Image();
          shirtImg.src = Shirt;
          shirtImg.onload = () => {
            const shirtX = pose.keypoints[6].position.x * 0.8;
            const shirtY = pose.keypoints[6].position.y * 0.8;
            // const shirtWidth =
            //   pose.keypoints[5].position.x * 0.5 +
            //   pose.keypoints[6].position.x * 0.5;

            const shirtWidth =
              Math.abs(
                pose.keypoints[6].position.x - pose.keypoints[5].position.x
              ) * 1.1;
            const shirtHeight =
              Math.abs(
                pose.keypoints[12].position.y - pose.keypoints[5].position.y
              ) * 1.1;

            ctx.translate(-range, 0);
            ctx.drawImage(
              shirtImg,
              shirtX,
              shirtY,
              shirtWidth * customWidth,
              shirtHeight * 1.3
            );
            setLoading(false);
          };
        };
      }
    };
    loadModel();
  }, [humanPose, range, customWidth]);

  console.log(customWidth);
  return (
    <div className="App">
      <LoadingOverlay
        active={loading}
        spinner
        text="Loading your content..."
        styles={{ width: "100%", height: "100%" }}
      >
        {humanPose && <canvas ref={canvasRef} width="640" height="840" />}
        <input
          type="file"
          ref={HumanPoseRef}
          onChange={HandleHumanPoseFile}
          hidden
        />
        <div>
          <button
            className="btn btn-primary mt-2 ml-2"
            onClick={() => {
              HumanPoseRef.current.click();
            }}
          >
            Upload your picture
          </button>
        </div>
      </LoadingOverlay>
      <div
        style={{
          maxWidth: "250px",
          minWidth: "250px",
          marginLeft: "10px",
          marginTop: "20px",
        }}
      >
        <fieldset class="form-group">
          <label for="customRange3" class="form-label">
            Adjust shirt position
          </label>
          <input
            type="range"
            className="form-range"
            min="0"
            max="100"
            step="1"
            id="customRange3"
            onChange={(e) => setRange(e.target.value)}
            value={range}
          />
          <label for="customRange3" class="form-label">
            Adjust shirt width
          </label>
          <input
            type="range"
            className="form-range"
            min="1"
            max="3"
            step=".2"
            id="customRange4"
            onChange={(e) => setCustomWidth(e.target.value)}
            value={customWidth}
          />
        </fieldset>
      </div>
    </div>
  );
}

export default App;
