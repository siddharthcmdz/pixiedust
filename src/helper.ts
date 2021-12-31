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

export const InitGPU = async () => {
  const isGPUavailable = CheckWGPUbrowserSupport()
  if (!isGPUavailable) throw "WebGPU not supported"

  const canvas = document.getElementById("c") as HTMLCanvasElement
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter
  const device = (await adapter?.requestDevice()) as GPUDevice
  const context = canvas.getContext("webgpu") as GPUCanvasContext

  const devicePixelRatio = window.devicePixelRatio || 1
  const size = [
    canvas.clientWidth * devicePixelRatio,
    canvas.clientHeight * devicePixelRatio,
  ]
  const format = context.getPreferredFormat(adapter)

  context.configure({
    device: device,
    format: format,
    size: size,
  })

  return { device, canvas, format, context }
}
