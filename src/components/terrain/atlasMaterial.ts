import { DoubleSide, MeshStandardMaterial, type Texture } from 'three';

export function atlasMaterial(grass:Texture,rock:Texture){
  const material=new MeshStandardMaterial({map:grass,vertexColors:true,roughness:1,side:DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.uniforms.atlasRock={value:rock};
    shader.vertexShader='attribute float surfaceMix; attribute float surfaceRock; attribute float surfaceCanopy; varying float vSurfaceMix; varying float vSurfaceRock; varying float vSurfaceCanopy; varying vec3 vAtlasPosition; varying vec3 vAtlasNormal;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSurfaceMix=surfaceMix;vSurfaceRock=surfaceRock;vSurfaceCanopy=surfaceCanopy;vAtlasPosition=position;vAtlasNormal=normal;');
    shader.fragmentShader=`uniform sampler2D atlasRock; varying float vSurfaceMix; varying float vSurfaceRock; varying float vSurfaceCanopy; varying vec3 vAtlasPosition; varying vec3 vAtlasNormal;
      float atlasHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float atlasNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(atlasHash(i),atlasHash(i+vec2(1,0)),f.x),mix(atlasHash(i+vec2(0,1)),atlasHash(i+vec2(1,1)),f.x),f.y);}
    \n`+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
      vec3 ground=texture2D(map,vMapUv*.21).rgb;
      ground=mix(ground,texture2D(map,vMapUv*.95).rgb,1.0-smoothstep(180.0,750.0,length(vViewPosition)));
      vec3 weights=pow(abs(normalize(vAtlasNormal)),vec3(4.0));weights/=max(dot(weights,vec3(1.0)),.001);
      vec3 mineral=texture2D(atlasRock,vAtlasPosition.zy/1600.0).rgb*weights.x
                  +texture2D(atlasRock,vAtlasPosition.xz/1600.0).rgb*weights.y
                  +texture2D(atlasRock,vAtlasPosition.xy/1600.0).rgb*weights.z;
      float stoneLuma=dot(mineral,vec3(.2126,.7152,.0722));
      mineral=mix(mineral,vec3(stoneLuma)*vec3(1.12,1.14,1.13),.72);
      vec3 pigment=vColor.rgb;
      vec3 meadow=mix(pigment,ground*1.1,vSurfaceMix*.9);
      // Broken contour strokes remain attached to the ground through every zoom level.
      float strata=vAtlasPosition.y*.38+atlasNoise(vAtlasPosition.xz/240.0)*2.4;
      float aa=max(fwidth(strata),.025);
      float line=1.0-smoothstep(.035,.035+aa,abs(fract(strata)-.5));
      float broken=smoothstep(.26,.58,atlasNoise(vAtlasPosition.xz/65.0));
      float visible=1.0-smoothstep(.65,1.3,aa);
      float ink=line*broken*visible*(1.0-vSurfaceRock);
      meadow*=1.0-ink*.24;
      float brush=atlasNoise(vAtlasPosition.xz/22.0);
      meadow*=.94+brush*.12;
      meadow*=1.0-vSurfaceCanopy*.48;
      diffuseColor.rgb=mix(meadow,mineral,vSurfaceRock);
    `);
    // Pigment is already applied above; multiplying it again tints gray rock brown.
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','');
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      vec3 sun=normalize(vec3(-.6,.65,-.8));
      vec3 rockNormal=normalize(floor(normalize(vAtlasNormal)*7.0+.5)/7.0);
      float aspect=dot(rockNormal,sun);
      float faceLight=.28+.88*smoothstep(.05,.85,aspect);
      vec3 faceTint=mix(vec3(.72,.81,.85),vec3(1.14,1.08,.93),smoothstep(.1,.8,aspect));
      float cleftInk=clamp(length(fwidth(normalize(vAtlasNormal)))*2.4,0.0,.45);
      outgoingLight=mix(outgoingLight,diffuseColor.rgb*faceLight*faceTint*(1.0-cleftInk*.45),vSurfaceRock);
      #include <opaque_fragment>
    `);
  };
  return material;
}
