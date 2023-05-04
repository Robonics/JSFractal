# JS Fractal Visualizer

This is a simple browser fractal exploration tool with limited performance and precision due to that fact.

### Quick Links:
- [How To Open:](#how-to-open)
- [How To Use:](#how-to-use)
- [Navigating:](#navigating)
- [The Fractals:](#the-fractals)
- [Quick Tips:](#quick-tips)
- [Known Issues](#known-issues)
- [Future Additions](#future-additions)
- [Images](#images)
# <u>How To Open:</u>
Your modern browser should be capable of properly displaying the webpage and running the code
* Download it onto any computer with a browser installed, you can do this by clicking the green `Code` button at the top right of the file viewer
* Unpack the zip
* Open `index.html`, your computer should be smart enough to do this with a browser, but if not, you can Right Click > Open With > *Browser* (on windows)

**If you'd like to experiment with the work in progress GPU accelerated version**, simply open `webgl_dev.html` instead. This may not perform well or at all on older machines.
# <u>How To Use:</u>
* The fractal should automatically render a full view when you open the page from left to right. The controls are in the top right of the screen, but if your display is small they may get pushed under the fractal view
* The **Control Pane** has several settings that control how the fractal is rendered. There is
	- **Resolution** controls the resolution of the final render (specifically the height). It defaults to 1400 x 800
	- **Iterations/Frame** controls the number of points that the visualizer tries to render each frame. Set it too low and the render will barely crawl along. Set it too high and your fps will drop and it won't render any faster. 800-1000 is pretty decent for my laptop.
	- **Hue Shift** allows you to control the color of the render, if you are familiar with HSL color format, the hue shift setting ranges from 0 to 360 degrees. By default points with the least number of iterations are colored red (0 degrees) but this allows you to change that.
	- **Max Iterations** controls how many times one point will be iterated before the program gives up. Setting it higher will give you a more exact shape of the fractal, but it will also reduce the overall contrast/variety of colors and will make the render take longer
	- **Fractal** allows you to change the fractal you're looking at
	- **Render Mode** changes how the fractal is rendered
		- Iteration mode is standard behavior. The set is colored black, and all points that diverge to infinity are colored based on how many iterations they took to do so
		- Orbit Trap (Point) renders the point based on how close it approached the user set x, y coordinate. Points outside the set are colored by iteration in grayscale
		- Orbit Trap (Axis) renders the point based on how close it approached the user set x, y axis. This is also called [pickover stalks](https://en.wikipedia.org/wiki/Pickover_stalk) rendering
		- Orbit Trap (All Points) Renders the point exactly like Orbit Trap (Point), but it also renders points outside the set in the manner
	- **X, Y** are for Orbit Trap rendering, but also affect the orbit draw feature.
	- **Some fractals have controllable constants**. The Mandelbrot can be rendered as a multibrot set by changing it's parameter `d` to another value. Chirikov has `K`, and some others also have variables that can be adjusted.
* **To apply any of your changes**, simply click the big `Render` button. It will show the progress of the render and will turn green when it is finished.
* Holding Middle mouse button or the `O` key over any point will **draw the orbit path for that point**. It will draw a number of lines between each point in the iteration. It will also draw the origin, and x, y axes. You can adjust the Orbit View x and y values to also draw those axes onto the fractal. A red dot and line will be drawn to show the closest point to this point. The number of lines is equal to your max iterations setting
* Holding J will prompt you to **Render a Julia set**. When you release J, the corresponding set to the point will be drawn. To go back to viewing the fractal normally, just press J again.

# <u>Navigating</u>:
There are several methods to navigate a fractal, you can click & drag on the fractal view box to move around. Scrolling your mouse-wheel over it will zoom you in and out. If you move around however you might notice that there are black edges to the fractal, or it gets pixilated very fast. Once you've panned the view over to an area of the fractal you want to get a better look at, press the `Render` button again to render that section in more detail. Due to floating point limitations however, once you hit a zoom scale of ~ 1e-15 you'll notice everything looks very blocky. It's impossible to get any meaningful detail beyond this point.

# <u>The Fractals:</u>
There are 7 currently implemented fractals:
* The Burning Ship
	* Represented by the function: $Z_{n+1}=(|Re(Z_n)|+i|Im(Z_n)|)^2+c, Z_0=0$
* Broken Burning Ship
	* A version of the burning ship where the $Re(c)$ and $Im(c)$ values are swapped before iteration - This will probably be removed
* The Mandelbrot Set
	* Famous fractal. "This fractal was first defined and drawn in 1978 by Robert W. Brooks and Peter Matelski as part of a study of Kleinian groups." ([Wikipedia](https://en.wikipedia.org/wiki/Mandelbrot_set#History)) represented by the function $Z_{n+1}=Z_n^2+c, Z_0=0$. $c$ is a point, and the set is defined such that it contains any point $c$ where $Z_{\infty}$ at $c$ does not diverge to infinity.
* Chirinov Map / Standard Map
	* Mathematically represented by the function pair $p_{n+1}=p_n+K\sin(\theta_n)$ and $\theta_{n+1}=\theta_n+p_{n+1}$
* Hénon Map
	* Represented by the functions $x_{n+1}=1-ax_n^2+y_n$ and $y_{n+1}=bx_n$
* Tricorn / Mandelbar
	* Similar to the mandelbrot set, represented by $z \mapsto{ \bar{x}^2+c}$
* Mandelbox
	* Similar to the mandelbrot, however, it can be defined in any dimension with ease. It is represented by an iterative set of steps that are dependent on x and y's value as they iterate. It can also be manipulated by a constant (Defaults to 2 for now). See [Wikipedia](https://en.wikipedia.org/wiki/Mandelbox) for a breakdown of how it is calculated
* Bogdanov Map
	* Represented by the functions $x_{n+1}=x_n+y_{n+1}$ and $y_n+1=y_n+\epsilon y_n+kx_n(x_n-1)+\mu x_ny_n$. There are 3 parameters controlling the shape of the final fractal in this, being $\epsilon, k, \mu$
### Quick Tips:
* When zooming in on a complicated fractal, it can help to increase the max iterations. While an area of the fractal may look solid, increasing this value will often expose more patterns to explore:
<div style="display: flex; flex-wrap: wrap;">
	<img style="width: 350px; height: 200px;" src="https://i.imgur.com/HVcrglI.png">
	<img style="width: 350px; height: 200px;" src="https://i.imgur.com/rZEdmDc.png">
	<img style="width: 350px; height: 200px;" src="https://i.imgur.com/6kssUsE.png">
</div>

_The same region rendered with 100, 200, and 300 max iterations respectively_

* Be Sure to adjust Iterations/Frame, it make make navigating much smoother on faster devices
	- Turning down the resolution can also help
* Using the hue shift slider can make some areas significantly easier on the eyes, greens and yellows can be particularly annoying to make sense of
* Black pixels take longer to render, so if you're looking to move around quickly, pan the view so that it is mostly colored pixels

## Known Issues
* Higher `Max Iteration` values cause certain details to get blended together due to how a points hue is calculated
	- Possible implementation of color curves to allow for user customization of the rendering
* Zooming in extremely far can cause loss of details (This is more of a JS floating point thing and there isn't much I can do about it)

## Future Additions
* A smoother rendering feature, that automatically renders sections as you pan in increasing detail (Will take lots of work)

# The WebGL Version
The WebGL powered version is still very experimental, and has it's own set of flaws and new features. Below is a truncated list.
- Runs live on the GPU, frames can be rendered at 60 regularly
- Smooth scroll for mouse wheels, can be buggy
- New rendering controls
- End goal of creating a potential way for users to upload fractal formulas to a website and have them be converted into GLSL code (would require building some kind of backend infrastructure)
- *Currently* less precision (only 32 bits vs 64)
- Can become immensely laggy and difficult to navigate (May have a solution improve experience at lower FPS).
- Currently only supports iterative rendering
- Currently only supports 3 fractals

As mentioned in [How to Open](#how-to-open), the WebGL version may not work on older devices or browsers. It currently can run on either WebGL or WebGL2, but if you browser doesn't support that, or your device simply doesn't have the GPU grunt, it may be unusable. While optimizations are in mind, this may or may not change for you.

## Images
*some UI may be outdated*
![](https://i.imgur.com/KuOI26i.png)
![](https://i.imgur.com/5uqhO1Q.png)
![](https://i.imgur.com/IW37OeI.png)
![](https://i.imgur.com/rZEdmDc.png)
![](https://i.imgur.com/mW4WV8J.png)
![](https://i.imgur.com/2Eay9gI.png)
![](https://i.imgur.com/wOUcsuS.png)
![](https://i.imgur.com/ycRtFTS.png)
![](https://i.imgur.com/ozwXG6E.png)
![](https://i.imgur.com/RgqcuYS.png)
