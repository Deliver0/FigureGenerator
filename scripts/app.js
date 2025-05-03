import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom';
const App = () => {
  const [image, setImage] = useState(null);
  const [roi, setRoi] = useState({
    x: 100,
    y: 100,
    width: 100,
    height: 100
  });
  const [zoom, setZoom] = useState(2);
  const [comparisons, setComparisons] = useState([]);
  const sketchRef = useRef(null);

  // Handle image upload
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = url;
    }
  };

  // Handle comparison image upload
  const handleComparisonUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => setComparisons([...comparisons, img]);
      img.src = url;
    }
  };

  // Download canvas as PNG
  const downloadImage = () => {
    const canvas = sketchRef.current.canvas;
    const link = document.createElement('a');
    link.download = 'scientific_figure.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // p5.js sketch
  const sketch = p => {
    let dragging = false;
    let resizing = false;
    let dragOffset = {
      x: 0,
      y: 0
    };
    p.setup = () => {
      p.createCanvas(800, 600);
      sketchRef.current = p;
    };
    p.draw = () => {
      p.background(255);
      if (image) {
        // Draw original image
        p.image(image, 0, 0, 400, 400 * (image.height / image.width));

        // Draw ROI frame
        p.stroke(255, 0, 0);
        p.strokeWeight(2);
        p.noFill();
        p.rect(roi.x, roi.y, roi.width, roi.height);

        // Draw magnified inset
        const insetX = 450;
        const insetY = 50;
        p.push();
        p.translate(insetX, insetY);
        p.scale(zoom);
        p.image(image, -roi.x, -roi.y, image.width, image.height);
        p.pop();

        // Draw comparison images
        comparisons.forEach((compImg, i) => {
          p.push();
          p.translate(insetX, insetY + (i + 1) * 120);
          p.scale(zoom);
          p.image(compImg, -roi.x, -roi.y, compImg.width, compImg.height);
          p.pop();
        });

        // Draw connecting lines
        p.stroke(0);
        // p.stroke BREAK
        p.line(roi.x + roi.width, roi.y, insetX, insetY);
        p.line(roi.x + roi.width, roi.y + roi.height, insetX, insetY + 100);
      }
    };
    p.mousePressed = () => {
      if (image && p.mouseX > 0 && p.mouseX < 400 && p.mouseY > 0 && p.mouseY < 400) {
        // Check if clicking resize handle (bottom-right corner)
        if (p.mouseX > roi.x + roi.width - 10 && p.mouseX < roi.x + roi.width + 10 && p.mouseY > roi.y + roi.height - 10 && p.mouseY < roi.y + roi.height + 10) {
          resizing = true;
        }
        // Check if clicking inside ROI for dragging
        else if (p.mouseX > roi.x && p.mouseX < roi.x + roi.width && p.mouseY > roi.y && p.mouseY < roi.y + roi.height) {
          dragging = true;
          dragOffset.x = p.mouseX - roi.x;
          dragOffset.y = p.mouseY - roi.y;
        }
      }
    };
    p.mouseDragged = () => {
      if (dragging) {
        setRoi({
          ...roi,
          x: Math.max(0, Math.min(400 - roi.width, p.mouseX - dragOffset.x)),
          y: Math.max(0, Math.min(400 - roi.height, p.mouseY - dragOffset.y))
        });
      } else if (resizing) {
        setRoi({
          ...roi,
          width: Math.max(50, Math.min(400 - roi.x, p.mouseX - roi.x)),
          height: Math.max(50, Math.min(400 - roi.y, p.mouseY - roi.y))
        });
      }
    };
    p.mouseReleased = () => {
      dragging = false;
      resizing = false;
    };
  };

  // Initialize p5.js
  useEffect(() => {
    try {
      const p5Instance = new p5(sketch, document.getElementById('canvas-container'));
      return () => p5Instance.remove();
    } catch (err) {
      console.error('p5.js initialization failed:', err);
    }
  }, [image, roi, zoom, comparisons]);
  return /*#__PURE__*/React.createElement("div", {
    className: "p-4 max-w-4xl mx-auto"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold mb-4"
  }, "Interactive Scientific Figure Generator"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "canvas-container",
    className: "mb-4"
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: handleImageUpload,
    className: "mb-2"
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: "image/*",
    onChange: handleComparisonUpload,
    className: "mb-2"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: downloadImage,
    className: "bg-blue-500 text-white px-4 py-2 rounded"
  }, "Download Figure")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block"
  }, "Zoom Level: ", zoom.toFixed(1), "x"), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "1",
    max: "5",
    step: "0.1",
    value: zoom,
    onChange: e => setZoom(parseFloat(e.target.value)),
    className: "w-full"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block"
  }, "ROI X: ", roi.x.toFixed(0)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "350",
    value: roi.x,
    onChange: e => setRoi({
      ...roi,
      x: parseFloat(e.target.value)
    }),
    className: "w-full"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block"
  }, "ROI Y: ", roi.y.toFixed(0)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "350",
    value: roi.y,
    onChange: e => setRoi({
      ...roi,
      y: parseFloat(e.target.value)
    }),
    className: "w-full"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block"
  }, "ROI Width: ", roi.width.toFixed(0)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "50",
    max: "200",
    value: roi.width,
    onChange: e => setRoi({
      ...roi,
      width: parseFloat(e.target.value)
    }),
    className: "w-full"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block"
  }, "ROI Height: ", roi.height.toFixed(0)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "50",
    max: "200",
    value: roi.height,
    onChange: e => setRoi({
      ...roi,
      height: parseFloat(e.target.value)
    }),
    className: "w-full"
  })))));
};

// Render the app with error handling
try {
  const root = createRoot(document.getElementById('root'));
  root.render(/*#__PURE__*/React.createElement(App, null));
} catch (err) {
  console.error('Failed to render React app:', err);
}
