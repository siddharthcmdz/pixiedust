import { vec3, mat4 } from "gl-matrix"
import { request } from "http"

export const CheckWebGPU = () => {
  let result = "Great, your current browser supports WebGPU!"
  if (!navigator.gpu) {
    result = `Your current browser does not support WebGPU! Make sure you are on a system 
                     with WebGPU enabled. Currently, SPIR-WebGPU is only supported in  
                     <a href="https://www.google.com/chrome/canary/">Chrome canary</a>
                     with the flag "enable-unsafe-webgpu" enabled. See the 
                     <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status"> 
                     Implementation Status</a> page for more details.                   
                    `
  }
  return result
}

export const CheckWGPUbrowserSupport = () => {
  return navigator.gpu !== null
}

export const CreateGPUBuffer = (
  device: GPUDevice,
  data: Float32Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.VERTEX |
    GPUBufferUsage.COPY_DST
) => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  })
  new Float32Array(buffer.getMappedRange()).set(data)
  buffer.unmap()

  return buffer
}

export const CreateGPUBufferUint = (
  device: GPUDevice,
  data: Uint32Array,
  usageFlag: GPUBufferUsageFlags = GPUBufferUsage.INDEX |
    GPUBufferUsage.COPY_DST
) => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: usageFlag,
    mappedAtCreation: true,
  })
  new Uint32Array(buffer.getMappedRange()).set(data)
  buffer.unmap()

  return buffer
}

export const InitGPU = async () => {
  const isGPUavailable = CheckWGPUbrowserSupport()
  if (!isGPUavailable) throw "WebGPU not supported"

  const canvas = document.getElementById("c") as HTMLCanvasElement
  console.log(`canvas size: ${canvas.width}, ${canvas.height}`)
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter
  const device = (await adapter?.requestDevice()) as GPUDevice
  const context = canvas.getContext("webgpu") as GPUCanvasContext

  const devicePixelRatio = 1 //window.devicePixelRatio || 1
  console.log(`devicePixelRatio: ${devicePixelRatio}`)
  const size = [
    canvas.clientWidth * devicePixelRatio,
    canvas.clientHeight * devicePixelRatio,
  ]

  //const format = context.getPreferredFormat(adapter)
  const format = "bgra8unorm"

  context.configure({
    device: device,
    format: format,
    size: size,
  })

  return { device, canvas, format, context }
}

export const CreateTransform = (
  modelMat: mat4,
  translation: vec3 = [0, 0, 0],
  rotation: vec3 = [0, 0, 0],
  scaling: vec3 = [1, 1, 1]
) => {
  const rotateXMat = mat4.create()
  const rotateYMat = mat4.create()
  const rotateZMat = mat4.create()
  const translationMat = mat4.create()
  const scaleMat = mat4.create()

  //perform individual transformations.
  mat4.fromTranslation(translationMat, translation)
  mat4.fromXRotation(rotateXMat, rotation[0])
  mat4.fromYRotation(rotateYMat, rotation[1])
  mat4.fromZRotation(rotateZMat, rotation[2])
  mat4.fromScaling(scaleMat, scaling)

  //combine all transformation matrices together to form final transformation matrix : modelMat
  mat4.multiply(modelMat, rotateXMat, scaleMat)
  mat4.multiply(modelMat, rotateYMat, modelMat)
  mat4.multiply(modelMat, rotateZMat, modelMat)
  mat4.multiply(modelMat, translationMat, modelMat)
}

export const CreateViewProjection = (
  aspectRatio = 1.0,
  cameraPosition: vec3 = [2, 2, 4],
  lookDirection: vec3 = [0, 0, 0],
  upDirection: vec3 = [0, 1, 0]
) => {
  const viewMatrix = mat4.create()
  const projectionMatrix = mat4.create()
  const viewProjectionMatrix = mat4.create()

  mat4.perspective(projectionMatrix, (2 * Math.PI) / 5, aspectRatio, 0.1, 100.0)
  mat4.lookAt(viewMatrix, cameraPosition, lookDirection, upDirection)

  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix)

  const cameraOption = {
    eye: cameraPosition,
    center: lookDirection,
    zoomMax: 100,
    zoomSpeed: 2,
  }

  return {
    viewMatrix,
    projectionMatrix,
    viewProjectionMatrix,
    cameraOption,
  }
}

//prettier-ignore
export const CreateAnimation = (draw: any, rotation: vec3 = vec3.fromValues(0, 0, 0), isAnimation = true) => {
  function step() {
    if (isAnimation) {
      rotation[0] += 0.01
      rotation[1] += 0.01
      rotation[2] += 0.01
    } else {
      rotation = [0, 0, 0]
    }
    draw()
    requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}
