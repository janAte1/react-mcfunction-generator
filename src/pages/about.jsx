import React, { Component } from "react";
class AboutPage extends Component {
  state = {};
  render() {
    return (
      <div style={{ maxWidth: 1000, margin: "auto" }}>
        <h1>
          I made a thing that makes images and 3d objects into minecraft
          commands
        </h1>
        <h2>3d objects</h2>
        <h3>wireframe</h3>
        <p>
          Thanks to newly added to minecraft display entities it's possible to
          display arbitrary lines, and I thought It'd be cool if you could
          display a 3d object's wireframe with them, so I made this.
        </p>
        <p>
          I think the UI for this one is quite self explainatory, except for
          maybe the tag. When you generate something from many display entities,
          each of them is assigned two tags:
        </p>
        <ul>
          <li>the one you input</li>
          <li>a unique number</li>
        </ul>
        <p>
          For the entity to be transformed correctly it must have a unique
          combination of the two, so if you want to add multiple wireframes in a
          single world, they must have different tags. The tag you input can
          then later be used to select all entities from a single wireframe with
          <code>@e[tag=YOUR_TAG]</code> For example if you want to teleport the
          wireframe to where you're standing, run{" "}
          <code>/tp @e[tag=YOUR_TAG] @s</code>
        </p>
        <h3>voxelization</h3>
        <p>
          Voxelization means converting a 3d mesh made out of triangles into a
          grid of <em>voxels</em> - 3d equivalent of a pixel. In this case it
          means taking a 3d mesh, doing some weird math and spitting out a
          minecraft build.
        </p>
        <p>In short, the voxelization algorithm used here works like this:</p>
        <ul>
          <li>
            shoot a lot of rays at the object (in the positive z direction)
          </li>
          <li>
            compute, where they intersect the object by{" "}
            <a href="https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm">
              computing where they intersect all its triangles
            </a>
          </li>
          <li>
            if the ray intersected the object even number of times, its origin
            is outside the object, otherwise the origin is inside the object (or
            the mesh isn't fully closed, or some vertex aligned with the ray in
            a very unfortunate way)
          </li>
          <li>
            based on the amount and position of the intersections, it can be
            deduced, which voxels are contained in the mesh and should be
            filled.
          </li>
          <li>
            if not specified otherwise, all the voxels not exposed to the
            surface can be cleared.
          </li>
          <li>
            each filled voxel is then converted into a command, setting the
            corresponding block to the one you specified.
          </li>
        </ul>
        <p>
          Here's a 2d visualisation of the algorithm, it also shows the role of
          all the things, that you input in the UI:
        </p>
        <img
          src="/react-mcfunction-generator/images/voxelization.png"
          style={{ width: "100%" }}
        />
        <p>
          If you still don't get how it works, I guess just play with the input
          values, until something cool comes out or your browser crashes.
        </p>
        <h4>coloring</h4>
        <p>
          If the 3d object you provided includes{" "}
          <a href="https://en.wikipedia.org/wiki/UV_mapping">uv coordinates</a>{" "}
          a texture can be aplied to it. The way it works is
        </p>
        <ul>
          <li>
            for each filled voxel calculate the closest point on the mesh.
          </li>
          <li>
            sample the color of that point from the provided texture and assign
            it to the voxel.
          </li>
          <li>find the block corresponding to that color</li>
        </ul>
        <p>
          Note: some 3d models are made of multiple materials and use many
          different textures. You can only apply one texture here because that
          info isn't included in the .obj file, and I'm too lazy to implement
          .mtl file input
        </p>
        <h2>images</h2>
        <p>
          If you take each block's texture file and compute it's average color,
          you can assign a color to every block in mineraft. Some blocks use
          multiple textures, and can be rotated in many ways, so I discarded
          them to avoid dealing with that. I also discarded:
        </p>
        <ul>
          <li>blocks that are transparent</li>
          <li>blocks that fall when placed in the air</li>
          <li>blocks that glow</li>
          <li>coral blocks (they dry without water)</li>
        </ul>
        <p>
          Full list of everything that's left, and their corresponding colors
          can be viewed{" "}
          <a href="/react-mcfunction-generator/bclists/blockcolors.txt">here</a>
          It'd be possible to pick between many such lists to e.g. only use
          blocks easily availble on survival if I implemented it, but I didn't
        </p>
        <p>
          Finding the block closest to a given color comes down to finding the
          square distance between two colors, which can be calculated from their
          r, g, b values: d<sup>2</sup> = (r<sub>1</sub>-r<sub>2</sub>)
          <sup>2</sup>+(g<sub>1</sub>-g<sub>2</sub>)<sup>2</sup>+(b<sub>1</sub>
          -b
          <sub>2</sub>)<sup>2</sup>
        </p>
        <h2>what do I do with the generated commands?</h2>
        <p>
          minecraft datapacks support putting up to 65536 commands to a
          .mcfunction file. If you don't know much about creating datapacks,
          <a href="https://minecraft.wiki/w/Data_pack">
            here's more details
          </a>{" "}
          or you can download this{" "}
          <a href="/react-mcfunction-generator/sample_datapack.zip">
            sample data pack
          </a>{" "}
          and put the generated commands to a file in
          /data/sample_datapack/functions/ and add the datapack to your world.
        </p>
        <h4>That's all, here are some screenshots, that bring me joy</h4>
        <img
          src="/react-mcfunction-generator/images/screenshots/globe.png"
          style={{ width: "100%" }}
        />
        <img
          src="/react-mcfunction-generator/images/screenshots/monke.png"
          style={{ width: "100%" }}
        />
        <img
          src="/react-mcfunction-generator/images/screenshots/brick.png"
          style={{ width: "100%" }}
        />
      </div>
    );
  }
}

export default AboutPage;
