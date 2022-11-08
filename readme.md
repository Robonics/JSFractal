# JS Fractal Visualizer

This is a simple browser fractal exploration tool with limited performance and precision due to that fact.

**In the likely event that you do not know how to use this**
# <u>How To Run:</u>
* Download it onto any computer with a browser installed, you can do this by clicking the green `Code` button at the top left of the file viewer
* Unpack the zip
* Open `index.html`, your computer should be smart enough to do this with a browser, but if not, you can Right Click > Open With > *Browser* (on windows)
# <u>How To Use:</u>
* The fractal should automatically render a full view when you open the page from left to right. In addition there should be a smaller black box (the nav pane) and a larger box with sliders (control pane)
* The **nav pane** won't show a preview until the first render is complete and you click and drag it for the first time, the nav pane allows you to select a specific area of the fractal to render by clicking and dragging to pan, and scrolling to zoom in and out. The full view of the fractal will not update until told to.
* The **Control Pane** has several settings that control how the fractal is rendered. There is
	- Resolution controls the resolution of the final render (specifically the height). It defaults to 1400 x 800
	- Iterations/Frame controls the number of points that the visualizer tries to render each frame. Set it too low and the render will barely crawl along. Set it too high and your fps will drop and it won't render any faster. 800-1000 is pretty decent for my laptop.
	- Hue Shift allows you to control the color of the render, if you are familiar with HSL color format, the hue shift setting ranges from 0 to 360 degrees. By default points with the least number of iterations are colored red (0 degrees) but this allows you to change that.
	- Max Iterations controls how many times one point will be iterated before the program gives up. Setting it higher will give you a more exact shape of the fractal, but it will also reduce the overall contrast/variety of colors and will make the render take longer
* **To apply any of your changes**, simply click the big `Rerender` button.

## Known Issues
* Controlling the view while zoomed far in is difficult
* Higher `Max Iteration` values cause certain details to get blended together due to how a points hue is calculated
* Zooming in extremely far can cause loss of details (This is more of a JS floating point thing and there isn't much I can do about it)