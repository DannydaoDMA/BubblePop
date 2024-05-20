export function spCode() {
    return `
    let audio = input();
    let pointerDown = input();
      
    setMaxReflections(1);
    let t = 3.5; 
    let n = vectorContourNoise(getSpace()*.05 + vec3(0, 0, 17.5), .1, 2);
    n = pow(sin(n*2)*.5 +.5, vec3(4));

    let rings = nsin(time*.3)*100;
    color(n)
    reflectiveColor(n+.01);
    metal(.3);
    occlusion(-4);

    let ourShape = shape((size) => {
    sphere(size);
    difference();
    
    rotateX(audio+getRayDirection().x*4)
    sphere(size, size*.4);
    })

    rotateZ(time)
    let r = getRayDirection()

    let size = 5 * abs(sin(time*.1));
    let size2 = 10 * abs(sin(time*.1));

    let n1 = noise(floor(r*size + noise(r*size2)+1));

    n1 = abs(n1);
    rotateX(PI/2);

    rotateX(getRayDirection().z*size*2);
    boxFrame(vec3(.7), .3*n1);
    torus(.7,.4*n1);
    mixGeo(pointerDown);
    torus(.7,.4*n1);
    mixGeo(abs(sin(audio)));
    sphere(.7*n1+.5)
    reset();

    let v = sin(rings*audio)*10+.5;
    v = vec3(v);
    union();

    let col = getSpace();

    // outer box
    shape(() => {
    rotateX(getRayDirection().z*6+time+audio/2)
    box(vec3(4))
    shell(.1);
    expand(1);
    })()
    blend(.2)
    
    // floor
    displace(0, -1.5, 0)


    box(12, .2+size*.02+n1*.1, 12);
    `;
}