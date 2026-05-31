export function fillCanvas(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorStr: string
) {
  const canvas = ctx.canvas;
  const w = canvas.width;
  const h = canvas.height;
  startX = Math.floor(startX);
  startY = Math.floor(startY);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Convert hex color to rgba
  const hex = fillColorStr.replace('#', '');
  const rFill = parseInt(hex.substring(0, 2), 16);
  const gFill = parseInt(hex.substring(2, 4), 16);
  const bFill = parseInt(hex.substring(4, 6), 16);
  const fillA = 255;

  const targetIndex = (startY * w + startX) * 4;
  const rTarget = data[targetIndex];
  const gTarget = data[targetIndex + 1];
  const bTarget = data[targetIndex + 2];
  const aTarget = data[targetIndex + 3];

  if (rFill === rTarget && gFill === gTarget && bFill === bTarget && fillA === aTarget) {
    return;
  }

  const matchTarget = (i: number) => {
    return (
      data[i] === rTarget &&
      data[i + 1] === gTarget &&
      data[i + 2] === bTarget &&
      data[i + 3] === aTarget
    );
  };

  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    let currentX = x;

    while (currentX >= 0 && matchTarget((y * w + currentX) * 4)) {
      currentX--;
    }
    currentX++;

    let spanAbove = false;
    let spanBelow = false;

    while (currentX < w && matchTarget((y * w + currentX) * 4)) {
      const idx = (y * w + currentX) * 4;
      data[idx] = rFill;
      data[idx + 1] = gFill;
      data[idx + 2] = bFill;
      data[idx + 3] = fillA;

      if (y > 0) {
        if (matchTarget(((y - 1) * w + currentX) * 4)) {
          if (!spanAbove) {
            stack.push([currentX, y - 1]);
            spanAbove = true;
          }
        } else if (spanAbove) {
          spanAbove = false;
        }
      }

      if (y < h - 1) {
        if (matchTarget(((y + 1) * w + currentX) * 4)) {
          if (!spanBelow) {
            stack.push([currentX, y + 1]);
            spanBelow = true;
          }
        } else if (spanBelow) {
          spanBelow = false;
        }
      }
      currentX++;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
