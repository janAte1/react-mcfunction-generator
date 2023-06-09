import React, { Component } from "react";
import CommandsView from "../components/commands_view";
import ObjInput from "../components/obj_input";
import VectorInput from "../components/vector_input";
import * as wasm from "wasm-mcfg";
import OptionPicker from "../components/option_picker";
import ImgInput from "../components/img_input";
class ObjectPage extends Component {
  state = {
    obj_file: null,
    obj_info: null,
    blockname: null,
    type: null,

    entities_not_blocks: false,
    tag: null,
    brightnessint: -1,
    brightness: undefined,

    width: 0.05,
    origin: [0.0, 0.0, 0.0],

    block_size: 1.0 / 32,
    grid_size: [64, 64, 64],
    grid_corner: [0.0, 0.0, 0.0],
    hollow: true,

    image_url: null,
    image_bytes: null,
    image_info: null,

    commands: null,
  };
  handleSetObj = (obj_bytes, obj_info) => {
    this.setState({ obj_file: obj_bytes, obj_info: obj_info });
  };
  handleSetBlockname = (e) => {
    this.setState({ blockname: e.target.value });
  };
  handleSetOrigin = (vec) => {
    this.setState({ origin: parseFloat(vec) });
  };
  handleSetType = (type) => {
    this.setState({ type: type });
  };
  handleImageChange = async (img_bytes, img_info, img_url) => {
    this.setState({
      image_info: img_info,
      image_bytes: img_bytes,
      image_url: img_url,
    });
  };
  generateWireframe = () => {
    this.setState({
      commands: wasm.add_mesh(
        this.state.obj_file,
        this.state.tag,
        this.state.origin,
        this.state.width,
        this.state.blockname,
        this.state.brightness
      ),
    });
  };
  generateVoxels = async () => {
    wasm.panic_init();
    console.log(this.state);
    let bg = wasm.BlockGrid.new(
      this.state.grid_size,
      this.state.grid_corner,
      this.state.block_size
    );
    bg.add_mesh(this.state.obj_file);
    if (this.state.hollow) {
      bg.make_hollow();
    }
    let commands = "";
    let has_uv = false;
    if (this.state.obj_info instanceof Map) {
      has_uv = this.state.obj_info.get("has_uvs");
    }
    let colorize =
      this.state.image_info instanceof Map &&
      this.state.image_info.get("valid") &&
      has_uv;
    let bc = null;
    if (colorize) {
      bg.colorize(this.state.obj_file, this.state.image_bytes);
      let res = await fetch(
        "/react-mcfunction-generator/bclists/blockcolors.txt"
      );
      let bcstring = await res.text();
      bc = wasm.BlocksColors.from_string(bcstring);
      if (this.state.entities_not_blocks) {
        commands = bg.gen_colored_commands(
          bc,
          this.state.tag,
          this.state.brightness
        );
      } else {
        commands = bg.gen_colored_commands_solid(bc);
      }
    } else {
      if (this.state.entities_not_blocks) {
        commands = bg.gen_commands(
          this.state.blockname,
          this.state.tag,
          this.state.brightness
        );
      } else {
        commands = bg.gen_commands_solid(this.state.blockname);
      }
    }

    this.setState({
      commands: commands,
    });
  };
  render() {
    let has_uv = false;
    if (this.state.obj_info instanceof Map) {
      has_uv = this.state.obj_info.get("has_uvs");
    }
    let valid = this.state.obj_file && this.state.obj_info.get("valid");
    let imgvalid = this.state.image_bytes && this.state.image_info.get("valid");
    let texturePrompt = <></>;
    let entityOptionsInput = (
      <>
        <label>
          common tag:
          <input
            type="text"
            className={this.state.type == "wireframe" ? "layer2" : "layer3"}
            defaultValue={this.state.tag}
            onChange={(e) => {
              this.setState({ tag: e.target.value || undefined });
            }}
          />
        </label>
        <br />
        <label>
          brightness (-1 for default)
          <input
            type="number"
            className={this.state.type == "wireframe" ? "layer2" : "layer3"}
            min={-1}
            max={15}
            defaultValue={this.state.brightnessint}
            onChange={async (e) => {
              let brightnessint = parseInt(e.target.value);
              let brightness = brightnessint == -1 ? undefined : brightnessint;
              this.setState({
                brightnessint: brightnessint,
                brightness: brightness,
              });
            }}
          />
        </label>
      </>
    );
    if (valid) {
      texturePrompt = has_uv ? (
        <>
          Your .obj file has a uv map, if you want to color it, input a texture
          <div className="warning">
            If the object uses more than one texture, i'm sorry, i was too lazy
            to implement it, pick only one of the textures
          </div>
          <div className="warning">
            also, the coloring algorithm is quite slow, so make sure your object
            isn't too complex
          </div>
          <ImgInput
            onChange={this.handleImageChange}
            src={this.state.image_url}
            imgInfo={this.state.image_info}
            class1="layer2"
            class2="layer3"
            height={200}
            width={200}
          />
        </>
      ) : (
        <div className="warning">
          no uv map found on the object, can't apply texture
        </div>
      );
    }

    let maybeButton = <></>;
    let continuation = <></>;
    if (this.state.type == "wireframe") {
      if (valid && this.state.width && this.state.blockname) {
        maybeButton = (
          <button onClick={this.generateWireframe}>Generate</button>
        );
      }
      continuation = (
        <div className="layer1 match-parent">
          <label>
            wireframe width:
            <input
              key={1}
              type="number"
              value={this.state.width}
              step={0.01}
              min={0.0}
              onChange={(e) => {
                this.setState({ width: parseFloat(e.target.value) });
              }}
              className="layer2"
            />
          </label>
          <br />
          <label>
            entity position:
            <VectorInput
              key={1}
              onChange={(val) => {
                this.setState({ origin: val });
              }}
              value={this.state.origin}
              step={0.1}
              class1="layer2"
              class2="layer3"
            />
          </label>
          <br />
          {entityOptionsInput}
          {maybeButton}
          <br />
        </div>
      );
    } else if (this.state.type == "voxelize") {
      if (
        valid &&
        this.state.grid_corner &&
        this.state.grid_size &&
        this.state.block_size &&
        (this.state.blockname || (imgvalid && has_uv))
      ) {
        maybeButton = <button onClick={this.generateVoxels}>Generate</button>;
      }
      continuation = (
        <div className="layer1 match-parent">
          {/* <div className="warning">
            the voxelization algorithm used is very bad and it'll only work if
            your object's mesh is closed (ie. any given straight line will
            intersect it an even number of times) and no vertices align with
            grid's lines (that can usually be assured by shifting grid's corner
            by ±0.000001 in all directions).
          </div> */}
          <label>
            voxel size:
            <input
              key={2}
              type="number"
              name="inwidth"
              className="layer2"
              value={this.state.block_size}
              step={1.0 / 32}
              min={0.0}
              onChange={(e) => {
                this.setState({ block_size: parseFloat(e.target.value) });
              }}
            />
          </label>
          <br />
          <label>
            grid size (in blocks):
            <VectorInput
              key={2}
              onChange={(val) => this.setState({ grid_size: val })}
              value={this.state.grid_size}
              step={1}
              min={0}
              class1="layer2"
              class2="layer3"
            />
          </label>
          <br />
          <label>
            grid -x -y -z side corner:
            <VectorInput
              key={2}
              onChange={(val) => this.setState({ grid_corner: val })}
              value={this.state.grid_corner}
              step={0.1}
              class1="layer2"
              class2="layer3"
            />
          </label>
          <br />
          <label>
            Make it hollow (for optimization purposes)
            <input
              type="checkbox"
              checked={this.state.hollow}
              onChange={(e) => this.setState({ hollow: e.target.checked })}
            />
          </label>
          <br />
          <label>
            Make it out of display entities (instead just building it with
            blocks)
            <input
              type="checkbox"
              checked={this.state.entities_not_blocks}
              onChange={(e) =>
                this.setState({ entities_not_blocks: e.target.checked })
              }
            />
          </label>
          <br />

          {this.state.entities_not_blocks ? (
            <div className="layer2">{entityOptionsInput}</div>
          ) : (
            <></>
          )}
          {texturePrompt}
          <br />
          {maybeButton}
          <br />
        </div>
      );
    }

    return (
      <div>
        <label>
          Block:
          <input
            type="text"
            name="intext"
            id="blockinput"
            onChange={this.handleSetBlockname}
            className="layer1"
          />
        </label>
        <br />
        <span>
          .obj file:
          <ObjInput
            handleSetObj={this.handleSetObj}
            objInfo={this.state.obj_info}
          />
        </span>
        <br />
        <label>
          <OptionPicker
            onChange={this.handleSetType}
            options={["wireframe", "voxelize"]}
            value={this.state.type}
          />
        </label>
        <br />
        {continuation}
        <CommandsView content={this.state.commands} />
      </div>
    );
  }
}

export default ObjectPage;
