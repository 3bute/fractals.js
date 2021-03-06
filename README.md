![Screenshot](scn0.png?raw=true)
# js mandelbrot / julia set viewer

https://fract.glitch.me

Enjoy patterns of nature! The viewer provides minimalistic design, intuitive functionality and easy to use interface. 

**Check out [client-server GMP arbitrary precision implementation](https://github.com/3bute/CFractals)! Currently only POSIX-compatible**

You will also need next things to be set up:
- C compiler with libgmp, libmicrohttpd and libpthread

**Features:**
- Zoom and move the image
- Go to previous step
- Finest color control
- Save the image from canvas
- Update the image after window rescaling
- Full control over significant parameters such resolution, iterations, magnification, color, number of threads etc.
- Multithreaded environment
- Switch from normal to arbitrary precision. Due to the calculation overhead the arbitrary precision is much slower.  For faster interactions, use normal instead.

