### "dice"

[Video](https://drive.google.com/file/d/1-is1sKZUTDhSqqebqi8rMob_nk4ysNNR/view?usp=sharing)

Run via a local server or any other way you'd like!

I use a global install of npm's `live-server`.

### instructions

Click or press any key to 'roll the dice.'

![CTA](/assets/0.png)

![a rolled die](/assets/1.png)

![another rolled die](/assets/2.png)

### explanation

The app is a simple JS and webGL app with no external dependencies beyond a google font.

The webGL code and some behavior is all in context.js and very very basic.

The fragment and vertex shaders are in their own separate files.

The fragment shader handles most of the lifting for the visuals and is a very straightforward metaballs visual.

I wanted to avoid doing a physical simulation with heavy dependencies and instead write something clean and simple, and it was an opportunity to practice some glsl, which I haven't written in a while.