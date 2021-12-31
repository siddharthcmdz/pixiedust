// import glslangModule from "@webgpu/glslang/dist/web-devel-onefile/glslang"

import $ from "jquery"
import { pipeline } from "stream"
import {
  getShebang,
  updateBreak,
} from "../node_modules/typescript/lib/typescript"
import { CubeData } from "./cubedata"
import {
  CheckWebGPU,
  CheckWGPUbrowserSupport,
  InitGPU,
  CreateGPUBuffer,
  CreateGPUBufferUint,
  CreateViewProjection,
  CreateTransform,
  CreateAnimation,
} from "./helper"
import {
  Shaders,
  ShaderPerVertexColor,
  GLSLshaderPerVertexColor,
  LinePointPrimives,
  TriStrips,
  QuadBufferPerAttrib,
  Cube3D,
} from "./shaders"

import { vec3, mat4 } from "gl-matrix"
const createCamera = require("3d-view-controls")

enum WebGPUShader {
  ColoredTriangle = 0,
  ColorPerVertexTriangle = 1,
  GLSLcolorPerVertexTriangle = 2,
  PointLineStripPrimitive = 3,
  TriangleStripPrimitive = 4,
  QuadBufferPerAttrib = 5,
  Cube3D = 6,
}

const getShader = (shaderEnum: WebGPUShader) => {
  let shader = null
  switch (shaderEnum) {
    case WebGPUShader.ColoredTriangle:
      console.log("Shader chosen: Colored")
      const color = "(1.0,1.0,1.0,1.0)"
      shader = Shaders(color)
      break

    case WebGPUShader.ColorPerVertexTriangle:
      console.log("Shader chosen: ColorePerVertexTriangle")
      shader = ShaderPerVertexColor()
      break

    case WebGPUShader.GLSLcolorPerVertexTriangle:
      console.log("Shader chosen: GLSLcolorPerVertexTriangle")
      shader = GLSLshaderPerVertexColor()
      break

    case WebGPUShader.TriangleStripPrimitive:
      console.log("Shader chosen: TriangleStripPrimitive")
      shader = TriStrips()
      break

    case WebGPUShader.QuadBufferPerAttrib:
      console.log("Shader chosen: QuadBufferPerAttrib")
      shader = QuadBufferPerAttrib()
      break

    case WebGPUShader.Cube3D:
      console.log("Shader chosen: Cube3D")
      shader = Cube3D()
      break

    default:
      console.log("Shader chosen: Default is PerVertexColor")
      shader = ShaderPerVertexColor()
      break
  }

  return shader
}

const CreatePointLinePrimitive = async (point?: boolean) => {
  const wgpuAvailable = CheckWGPUbrowserSupport()
  if (!wgpuAvailable) {
    console.log("WebGPU is not supported in this browser!")
    return
  }

  const canvas = document.getElementById("c") as HTMLCanvasElement
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter
  const device = (await adapter?.requestDevice()) as GPUDevice
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext

  const format = "bgra8unorm"
  context.configure({
    device: device,
    format: format,
  })

  const shader = LinePointPrimives()
  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
    },

    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: point === true ? "point-list" : "line-list",
    },
  })

  const commandEncoder = device.createCommandEncoder()
  const textureView = context.getCurrentTexture().createView()
  const renderpass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: [0.5, 0.5, 0.8, 1.0],
        storeOp: "store",
      },
    ],
  })
  renderpass.setPipeline(pipeline)
  renderpass.draw(6, 1, 0, 0)
  renderpass.endPass()

  device.queue.submit([commandEncoder.finish()])
}

const CreateTriangle = async () => {
  const checkgpu = CheckWebGPU()
  if (checkgpu.includes("Your current browser does not support WebGPU!")) {
    console.log(checkgpu)
    throw "Your current browser does not support webgpu"
  }

  // const glslangModule = require("glslang");
  // const glslang =
  //   glslangModule !== null ? ((await glslangModule()) as any) : null;

  const canvas = document.getElementById("c") as HTMLCanvasElement
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter
  const device = (await adapter?.requestDevice()) as GPUDevice
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext

  const format = "bgra8unorm"
  context.configure({
    device: device,
    format: format,
  })

  const shaderEnum = WebGPUShader.ColorPerVertexTriangle
  const shader = getShader(shaderEnum)

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        // code:
        //   shaderEnum === WebGPUShaders.GLSLcolorPerVertexTriangle
        //     ? glslang.compileGLSL(shader.vertex)
        //     : shader.vertex,
        code: shader.vertex,
      }),
      entryPoint: "main",
    },
    fragment: {
      module: device.createShaderModule({
        // code:
        // shaderEnum === WebGPUShaders.GLSLcolorPerVertexTriangle
        //   ? glslang.compileGLSL(shader.fragment)
        //   : shader.fragment,
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  })

  const commandEncoder = device.createCommandEncoder()
  const textureView = context.getCurrentTexture().createView()
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 },
        storeOp: "store",
      },
    ],
  })
  renderPass.setPipeline(pipeline)
  renderPass.draw(3, 1, 0, 0)
  renderPass.endPass()

  device.queue.submit([commandEncoder.finish()])
}

const CreateTriStrip = async () => {
  const gpuAvailable = CheckWGPUbrowserSupport()
  if (!gpuAvailable) {
    console.log("WebGPU not available")
    return
  }

  const canvas = document.getElementById("c") as HTMLCanvasElement
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter
  const device = (await adapter?.requestDevice()) as GPUDevice
  const context = canvas.getContext("webgpu") as GPUCanvasContext

  const format = "bgra8unorm"
  context.configure({
    format: format,
    device: device,
  })

  const primitiveType = "triangle-strip"
  const indexformat = "uint32"
  const shader = TriStrips()
  const renderpipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
    },

    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: primitiveType as GPUPrimitiveTopology,
      stripIndexFormat: indexformat as GPUIndexFormat,
    },
  })

  const commandEncoder = device.createCommandEncoder()
  const textureView = context.getCurrentTexture().createView()
  const renderpass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: [0.5, 0.5, 0.5, 1],
        storeOp: "store",
      },
    ],
  })
  renderpass.setPipeline(renderpipeline)
  renderpass.draw(9, 1, 0, 0)
  renderpass.endPass()

  device.queue.submit([commandEncoder.finish()])
}

const CreateQuadBufferPerAttrib = async () => {
  const gpu = await InitGPU()
  const device = gpu.device
  //prettier-ignore
  const vertexData = new Float32Array([
    -0.5, -0.5, // vertex a
    0.5, -0.5, // vertex b
    -0.5, 0.5, // vertex d
    -0.5, 0.5, // vertex d
    0.5, -0.5, // vertex b
    0.5, 0.5, // vertex c
  ])

  //prettier-ignore
  const colorData = new Float32Array([
    1, 0, 0, // vertex a: red
    0, 1, 0, // vertex b: green
    1, 1, 0, // vertex d: yell  ow
    1, 1, 0, // vertex d: yellow
    0, 1, 0, // vertex b: green
    0, 0, 1, // vertex c: blue
  ])

  const vertexBuffer = CreateGPUBuffer(device, vertexData)
  const colorBuffer = CreateGPUBuffer(device, colorData)

  const shaderEnum = WebGPUShader.QuadBufferPerAttrib
  const shader = getShader(shaderEnum)

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 8,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x2",
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
      ],
    },

    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: gpu.format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  })

  const commandEncoder = device.createCommandEncoder()
  const textureView = gpu.context.getCurrentTexture().createView()
  const renderpass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        storeOp: "store",
      },
    ],
  })

  renderpass.setPipeline(pipeline)
  renderpass.setVertexBuffer(0, vertexBuffer)
  renderpass.setVertexBuffer(1, colorBuffer)
  renderpass.draw(6)
  renderpass.endPass()

  device.queue.submit([commandEncoder.finish()])
}

const CreateQuadInSingleBuffer = async () => {
  const gpu = await InitGPU()
  const device = gpu.device

  //prettier-ignore
  const vertexData = new Float32Array([
    -0.5,-0.5, 1, 0, 0, // vertex a: red
    0.5, -0.5, 0, 1, 0, // vertex b: green
    -0.5, 0.5, 1, 1, 0, // vertex d: yellow
    -0.5, 0.5, 1, 1, 0, // vertex d: yellow
    0.5, -0.5, 0, 1,0, // vertex b: green
    0.5, 0.5, 0, 0, 1, // vertex c: blue
  ])

  const vertexBuffer = CreateGPUBuffer(device, vertexData)

  const shaderEnum = WebGPUShader.QuadBufferPerAttrib
  const shader = getShader(shaderEnum)

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 4 * (2 + 3),
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x2",
              offset: 0,
            },
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 8,
            },
          ],
        },
      ],
    },

    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: gpu.format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  })

  const commandEncoder = device.createCommandEncoder()
  const textureView = gpu.context.getCurrentTexture().createView()
  const renderpass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        storeOp: "store",
      },
    ],
  })

  renderpass.setPipeline(pipeline)
  renderpass.setVertexBuffer(0, vertexBuffer)
  renderpass.draw(6)
  renderpass.endPass()

  device.queue.submit([commandEncoder.finish()])
}

const CreateQuadInSingleBufferWithIndexBuffer = async () => {
  const gpu = await InitGPU()
  const device = gpu.device

  //prettier-ignore
  const vertexData = new Float32Array([
    -0.5, -0.5, 1, 0, 0, // vertex a: red
    0.5, -0.5, 0, 1, 0, // vertex b: green
    -0.5, 0.5, 1, 1, 0, // vertex d: yellow
    -0.5, 0.5, 1, 1, 0, // vertex d: yellow
    0.5, -0.5, 0, 1, 0, // vertex b: green
    0.5, 0.5, 0, 0, 1, // vertex c: blue
  ])
  const vertexBuffer = CreateGPUBuffer(device, vertexData)

  const indexData = new Uint32Array([0, 1, 3, 3, 1, 2])
  const indexBuffer = CreateGPUBufferUint(device, indexData)

  const shaderEnum = WebGPUShader.QuadBufferPerAttrib
  const shader = getShader(shaderEnum)

  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 4 * (2 + 3),
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x2",
              offset: 0,
            },
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 8,
            },
          ],
        },
      ],
    },

    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: gpu.format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  })

  const commandEncoder = device.createCommandEncoder()
  const textureView = gpu.context.getCurrentTexture().createView()
  const renderpass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        storeOp: "store",
      },
    ],
  })

  renderpass.setPipeline(pipeline)
  renderpass.setVertexBuffer(0, vertexBuffer)
  renderpass.setIndexBuffer(indexBuffer, "uint32")
  renderpass.draw(6)
  renderpass.endPass()

  device.queue.submit([commandEncoder.finish()])
}

const CreateCube = async () => {
  const gpu = await InitGPU()
  const device = gpu.device

  //create vertex buffers
  const cubedata = CubeData()
  const numVertices = cubedata.positions.length / 3
  const vertexBuffer = CreateGPUBuffer(device, cubedata.positions)
  const colorBuffer = CreateGPUBuffer(device, cubedata.colors)

  const shaderEnum = WebGPUShader.Cube3D
  const shader = getShader(shaderEnum)
  const pipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
      buffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
      ],
    },

    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: gpu.format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },

    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  })

  //create uniform data
  let vpMatrix = mat4.create()
  let vMatrix = mat4.create()
  const vp = CreateViewProjection(gpu.canvas.width / gpu.canvas.height)
  vpMatrix = vp.viewProjectionMatrix

  let rotation = vec3.fromValues(0, 0, 0)
  let camera = createCamera(gpu.canvas, vp.cameraOption)

  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
          offset: 0,
          size: 64,
        },
      },
    ],
  })

  let textureView = gpu.context.getCurrentTexture().createView()
  console.log(`depthTexture size: ${gpu.canvas.width}, ${gpu.canvas.height}`)
  const depthTexture = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  })

  console.log(`depthTexture label: ${depthTexture.label}`)

  const renderPassDescription = {
    colorAttachments: [
      {
        view: textureView,
        loadValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 }, //background color
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthLoadValue: 1.0,
      depthStoreOp: "store",
      stencilLoadValue: 0,
      stencilStoreOp: "store",
    },
  }

  const doAnimate = true
  const modelMatrix = mat4.create()
  const mvpMatrix = mat4.create()
  function draw() {
    if (!doAnimate) {
      if (camera.tick()) {
        const pMatrix = vp.viewProjectionMatrix
        vMatrix = camera.matrix
        mat4.multiply(vpMatrix, pMatrix, vMatrix)
      }
    }

    CreateTransform(modelMatrix, [0, 0, 0], rotation)
    mat4.multiply(mvpMatrix, vpMatrix, modelMatrix)
    device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer)
    textureView = gpu.context.getCurrentTexture().createView()
    renderPassDescription.colorAttachments[0].view = textureView
    const commandEncoder = device.createCommandEncoder()
    const renderPass = commandEncoder.beginRenderPass(
      renderPassDescription as GPURenderPassDescriptor
    )
    renderPass.setPipeline(pipeline)
    renderPass.setVertexBuffer(0, vertexBuffer)
    renderPass.setVertexBuffer(1, colorBuffer)
    renderPass.setBindGroup(0, uniformBindGroup)
    renderPass.draw(numVertices)
    renderPass.endPass()

    device.queue.submit([commandEncoder.finish()])
  }

  CreateAnimation(draw, rotation, doAnimate)
}

$(document).ready(function () {
  console.log("ready!")
  // CreateTriangle()
  // CreatePointLinePrimitive(false)
  // CreateTriStrip()
  // CreateQuadBufferPerAttrib()
  // CreateQuadInSingleBuffer()
  CreateCube()
})

// $('#id-btn').on('click', ()=>{
//     const color = $('#id-color').val() as string
//     CreateTriangle(color)
// })
