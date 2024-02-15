so this is going to be a combination of guilty gear's airdash and celeste's dash

i want you to be able to have as much freedom as you want in airdashing, so this is going to take yoru directional input and camera angle to determine your direction

oh yeah you can also [fastfall](Fastfall.md) out of your dash

here is a visual representation of how we will determine the airdash direction

![dash direction example](/img/movement/airdash/dash-direction-example.png)

hopefully this makes sense...

instead of taking raw inputs (like detecting if w,a,s,d are pressed) we'll just be using `Humanoid.MoveDirection` to determine the first parameter (which is the key pressed in the example)